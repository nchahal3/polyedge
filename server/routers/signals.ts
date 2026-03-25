import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { calculateConsensusSignals } from "@/server/services/consensusEngine";

export const signalsRouter = router({
  getAll: publicProcedure
    .input(z.object({
      category: z.string().default("all"),
      minStrength: z.number().default(0.3),
      minWinRate: z.number().default(55),
      maxBotScore: z.number().default(40),
      topN: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const signals = await calculateConsensusSignals(input.category, {
        minWinRate: input.minWinRate,
        maxBotScore: input.maxBotScore,
        topN: input.topN,
      });
      return signals.filter((s) => s.strength >= input.minStrength);
    }),
});
