import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { MOCK_WALLETS, getWalletsByCategory, type Category } from "@/lib/mockData";

export const walletsRouter = router({
  getAll: publicProcedure
    .input(z.object({
      category: z.string(),
      maxBotScore: z.number().default(25),
      minWinRate: z.number().default(70),
      topN: z.number().default(10),
      sortBy: z.enum(["winRate", "pnl", "volume"]).default("winRate"),
    }))
    .query(({ input }) => {
      const wallets = getWalletsByCategory(
        input.category as Category,
        input.maxBotScore,
        input.minWinRate,
        input.topN * 3
      );
      const sorted = [...wallets].sort((a, b) => {
        if (input.sortBy === "winRate") return b.winRate - a.winRate;
        if (input.sortBy === "pnl") return b.pnl - a.pnl;
        return b.totalVolume - a.totalVolume;
      });
      return sorted.slice(0, input.topN);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return MOCK_WALLETS.find(w => w.id === input.id) ?? null;
    }),
});
