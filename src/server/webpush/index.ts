import cron from "node-cron";
import webpush from "web-push";
import { env } from "~/env";
import { currencyToSymbol } from "~/lib/utils";
import { getAllSubscriptionsOfUser } from "~/server/api/routers/subscription";
import { db } from "~/server/db";
import type { Device } from "~/server/db/schema";

const SCHEDULE = "0 9 * * *";

webpush.setVapidDetails(
	`mailto:${env.ADMIN_EMAIL}`,
	env.VAPID_PUBLIC_KEY,
	env.VAPID_PRIVATE_KEY,
);

export interface CustomPushSubscription extends PushSubscription {
	keys: {
		p256dh: string;
		auth: string;
	};
}

export const sendNotification = async (
	devices: Array<Device>,
	notificationContent: {
		title: string;
		body: string;
		icon: string;
		url: string;
	},
) => {
	for (const device of devices) {
		const pushSubscription = device.pushSubscription;
		if (!pushSubscription) {
			console.error(`No push subscription for device ${device.id}`);
			continue;
		}

		try {
			const res = await webpush.sendNotification(
				pushSubscription,
				JSON.stringify(notificationContent),
			);
			if (res.statusCode === 201) {
				console.log(`Notification sent to device ${device.id}`);
			} else {
				console.error(
					`Error sending notification to device ${device.id}: ${res.statusCode} - ${res.body}`,
				);
			}
		} catch (error) {
			console.error(
				`Error sending notification to device ${device.id}:`,
				error,
			);
		}
	}
};

const sendNotificationsForDueSubscriptions = async () => {
	const users = (
		await db.query.users.findMany({
			with: {
				devices: true,
			},
		})
	).filter((user) => user.devices.length > 0);

	for (const user of users) {
		const subscriptions = await getAllSubscriptionsOfUser(
			db,
			user.id,
			user.baseCurrency,
		);
		const today = new Date();
		const dueSubscriptions = subscriptions.filter((sub) => {
			if (!sub.nextPaymentDate) return false;
			const nextPaymentDate = new Date(sub.nextPaymentDate);
			return (
				nextPaymentDate.getFullYear() === today.getFullYear() &&
				nextPaymentDate.getMonth() === today.getMonth() &&
				nextPaymentDate.getDate() === today.getDate()
			);
		});

		if (dueSubscriptions.length === 0) {
			continue;
		}
		const totalAmount = dueSubscriptions
			.reduce((sum, sub) => sum + sub.price, 0)
			.toFixed(2);
		const notificationContent = {
			title: "Subtracker - Subscriptions Due Today",
			body: `You have ${dueSubscriptions.length} subscription payment${dueSubscriptions.length > 0 ? "s" : ""} due today for a total of ${totalAmount}${currencyToSymbol(user.baseCurrency)}.`,
			icon: "/favicon.ico",
			url: env.BETTER_AUTH_URL,
		};

		await sendNotification(user.devices, notificationContent);
	}
};

export const startScheduler = async () => {
	await sendNotificationsForDueSubscriptions();
	console.log(`[SCHEDULER] Scheduler started with cron pattern: ${SCHEDULE}`);
	cron.schedule(SCHEDULE, async () => {
		console.log("[SCHEDULER] Running subscription due check...");
		await sendNotificationsForDueSubscriptions();
		console.log("[SCHEDULER] Subscription due check completed.");
	});
};
