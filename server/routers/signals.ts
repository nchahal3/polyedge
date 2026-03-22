import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { getSignalsByCategory, type Category } from "@/lib/mockData";

export const signalsRouter = router({
  getAll: publicProcedure
    .input(z.object({
      category: z.string().default("all"),
      minStrength: z.number().default(0.3),
    }))
    .query(({ input }) => {
      return getSignalsByCategory(input.category as Category | "all")
        .filter(s => s.strength >= input.minStrength)
        .sort((a, b) => b.strength - a.strength);
    }),
});
