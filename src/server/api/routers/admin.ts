import { readdir } from "node:fs/promises";
import { env } from "~/env";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { updateExchangeRates } from "~/server/exchange-rates";

export const adminRouter = createTRPCRouter({
  cleanUpFiles: publicProcedure.mutation(async ({ ctx }) => {
    let filesInUse = (
      await ctx.db.query.subscriptions.findMany({
        columns: {
          image: true,
        },
        where: (tb, { isNotNull }) => isNotNull(tb.image),
      })
    ).map((subscription) => subscription.image);
    filesInUse = filesInUse.concat(
      (
        await ctx.db.query.paymentMethods.findMany({
          columns: {
            image: true,
          },
          where: (tb, { isNotNull }) => isNotNull(tb.image),
        })
      ).map((paymentMethod) => paymentMethod.image),
    );

    filesInUse = filesInUse
      .filter(Boolean)
      .map((file) => file.replace("/api/files?filename=", ""));

    for (const file of await readdir(env.UPLOADS_FOLDER)) {
      if (!filesInUse.includes(file)) {
        console.log("Deleting file", file);
        await Bun.file(`${env.UPLOADS_FOLDER}/${file}`).delete();
      }
    }
  }),
  updateExchangeRates: publicProcedure.mutation(async () => {
    await updateExchangeRates();
  }),
});
