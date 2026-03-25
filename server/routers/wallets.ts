import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { getTopWallets, processWallet } from "@/server/services/walletTracker";

export const walletsRouter = router({
  getAll: publicProcedure
    .input(z.object({
      category: z.string().default("all"),
      maxBotScore: z.number().default(25),
      minWinRate: z.number().default(55),
      topN: z.number().default(10),
      sortBy: z.enum(["winRate", "pnl", "volume"]).default("winRate"),
    }))
    .query(async ({ input }) => {
      return getTopWallets(
        input.category,
        input.minWinRate,
        input.maxBotScore,
        input.topN,
        input.sortBy
      );
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return processWallet(input.id);
    }),
});
