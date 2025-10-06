"use client";

import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { Button } from "./ui/button";

export default function PushNotification() {
	const [permission, setPermission] = useState<string | null>(null);
	const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
	const subscribeUserMutation = api.user.subscribeUserToPush.useMutation();
	const publicVapidKeyQuery = api.user.getPublicVapidKey.useQuery();

	useEffect(() => {
		async function registerServiceWorker() {
			try {
				const registration = await navigator.serviceWorker.register("/sw.js", {
					scope: "/",
					updateViaCache: "none",
				});

				if (navigator.serviceWorker.controller) {
					setIsServiceWorkerReady(true);
				} else {
					// Wait for service worker to be installed
					registration.onupdatefound = () => {
						const installingWorker = registration.installing;
						if (installingWorker) {
							installingWorker.onstatechange = () => {
								if (
									installingWorker.state === "installed" &&
									navigator.serviceWorker.controller
								) {
									setIsServiceWorkerReady(true);
								}
							};
						}
					};
				}
			} catch (error) {
				console.error("Service Worker registration failed:", error);
			}
		}

		const handleNotificationPermission = async () => {
			if (typeof Notification !== "undefined") {
				const currentPermission = Notification.permission;
				setPermission(currentPermission);

				if (currentPermission === "default") {
					const newPermission = await Notification.requestPermission();
					setPermission(newPermission);

					if (newPermission === "granted") {
						await registerServiceWorker();
					} else {
						console.error("Notification permission denied");
					}
				} else if (currentPermission === "granted") {
					await registerServiceWorker();
				}
			}
		};

		handleNotificationPermission();
	}, []);

	useEffect(() => {
		const subscribeToPush = async () => {
			if (isServiceWorkerReady && publicVapidKeyQuery.data) {
				try {
					const registration = await navigator.serviceWorker.ready;
					const sub = await registration.pushManager.subscribe({
						userVisibleOnly: true,
						applicationServerKey: publicVapidKeyQuery.data,
					});

					const res = await subscribeUserMutation.mutateAsync(sub.toJSON());
					console.log("Subscription successful:", res.success);
				} catch (error) {
					console.error("Push subscription failed:", error);
				}
			}
		};

		subscribeToPush();
	}, [
		isServiceWorkerReady,
		subscribeUserMutation.mutateAsync,
		publicVapidKeyQuery.data,
	]);

	if (permission !== "default") {
		return null;
	}

	return (
		<div className="fixed right-4 bottom-4 z-50">
			<Button
				onClick={() => Notification.requestPermission().then(setPermission)}
			>
				Enable Notifications ?
			</Button>
		</div>
	);
}
