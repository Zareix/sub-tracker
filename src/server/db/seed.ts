import { eq } from "drizzle-orm";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import * as schema from "./schema";

export const seed = async () => {
	console.log("Seeding database...");

	const users = await db.query.users.findMany();
	if (users.length === 0) {
		console.log("Creating admin user...");
		const res = await auth.api.signUpEmail({
			body: {
				name: "Admin",
				email: env.ADMIN_EMAIL,
				password: "password",
			},
		});
		// TODO Doesn't work because here requires session headers
		// await auth.api.setRole({
		// 	headers: await headers(),
		// 	body: {
		// 		userId: res.user.id,
		// 		role: "admin" satisfies UserRole,
		// 	},
		// });
		const updated = await db
			.update(schema.users)
			.set({ role: "admin" })
			.where(eq(schema.users.id, res.user.id))
			.returning();
		if (updated.length === 0) {
			throw new Error("Failed to set admin role for the user");
		}
		console.log(
			"Admin user created with id",
			res.user.id,
			"and email",
			res.user.email,
			"and default password is 'password'. Please change the password after logging in.",
		);
	}

	const cat = await db.query.categories.findMany();
	if (cat.length === 0) {
		console.log("Creating default category...");
		const insertedCatRes = await db
			.insert(schema.categories)
			.values({
				id: 1,
				name: "Misc",
				icon: "circle-ellipsis",
			})
			.returning();
		const insertedCat = insertedCatRes[0];
		if (!insertedCat) {
			throw new Error("Failed to create default category");
		}
		console.log("Default category created with id", insertedCat.id);
	}

	// same for defaut payment
	const pm = await db.query.paymentMethods.findMany();
	if (pm.length === 0) {
		console.log("Creating default payment method...");
		const insertedPmRes = await db
			.insert(schema.paymentMethods)
			.values({
				id: 1,
				name: "Credit Card",
			})
			.returning();
		const insertedPm = insertedPmRes[0];
		if (!insertedPm) {
			throw new Error("Failed to create default payment method");
		}
		console.log("Default payment method created with id", insertedPm.id);
	}

	console.log("Database seeded");
};
