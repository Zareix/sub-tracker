import type { NextRequest } from "next/server";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsStringLiteral,
} from "nuqs/server";
import { SCHEDULES, type Schedule } from "~/lib/constant";
import type { Filters } from "~/lib/hooks/use-filters";
import { getStats } from "~/lib/stats";
import { currencyToSymbol, getFilteredSubscriptions } from "~/lib/utils";
import { getAllSubscriptionsOfUser } from "~/server/api/routers/subscription";
import { verifyApiKey } from "~/server/auth";
import { db } from "~/server/db";
import type { User } from "~/server/db/schema";

export async function GET(request: NextRequest) {
	let user: User | undefined;
	try {
		user = await verifyApiKey(request);
		if (!user) {
			return new Response("Unauthorized", { status: 401 });
		}
	} catch (error) {
		return new Response((error as Error).message || "Unauthorized", {
			status: 401,
		});
	}
	const searchParams = request.nextUrl.searchParams;
	const filters: Filters = {
		users: searchParams.get("users") ?? user.id,
		//@ts-expect-error typing is wrong in nuqs
		categories: parseAsArrayOf(parseAsInteger)
			.withDefault([])
			.parse(searchParams.get("categories") ?? ""),
		//@ts-expect-error typing is wrong in nuqs
		paymentMethods: parseAsArrayOf(parseAsInteger)
			.withDefault([])
			.parse(searchParams.get("paymentMethods") ?? ""),
		schedule: parseAsStringLiteral<Schedule>(SCHEDULES).parse(
			//@ts-expect-error typing is wrong in nuqs
			searchParams.get("schedule"),
		),
	};

	const subscriptions = getFilteredSubscriptions(
		await getAllSubscriptionsOfUser(db, user.id, user.baseCurrency),
		filters,
	);
	const stats = getStats(subscriptions, filters);
	return Response.json({
		stats,
		currency: {
			code: user.baseCurrency,
			symbol: currencyToSymbol(user.baseCurrency),
		},
	});
}
