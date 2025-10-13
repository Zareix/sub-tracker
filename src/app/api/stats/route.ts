import type { NextRequest } from "next/server";
import { getStats } from "~/lib/stats";
import { currencyToSymbol } from "~/lib/utils";
import { getAllSubscriptionsOfUser } from "~/server/api/routers/subscription";
import { verifyApiKey } from "~/server/auth";
import { db } from "~/server/db";

export async function GET(request: NextRequest) {
	const user = await verifyApiKey(request);
	if (!user) {
		return new Response("Unauthorized", { status: 401 });
	}

	const subscriptions = await getAllSubscriptionsOfUser(
		db,
		user.id,
		user.baseCurrency,
	);
	const stats = getStats(subscriptions, { users: user.id });
	return Response.json({
		stats,
		currency: {
			code: user.baseCurrency,
			symbol: currencyToSymbol(user.baseCurrency),
		},
	});
}
