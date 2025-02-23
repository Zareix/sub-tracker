import { TRPCError } from "@trpc/server";
import { asc } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: [asc(users.name)],
    });
  }),
  create: publicProcedure
    .input(z.object({ name: z.string(), email: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const usersReturned = await ctx.db
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
        })
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
        });
      const user = usersReturned[0];
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating user",
        });
      }
      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    }),
});
