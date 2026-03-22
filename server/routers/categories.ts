import { router, publicProcedure } from "../trpc";
import { CATEGORIES, MOCK_WALLETS, MOCK_SIGNALS } from "@/lib/mockData";

export const categoriesRouter = router({
  getStats: publicProcedure.query(() => {
    return CATEGORIES.map(cat => ({
      name: cat,
      walletCount: MOCK_WALLETS.filter(w => w.categories.includes(cat)).length,
      signalCount: MOCK_SIGNALS.filter(s => s.category === cat).length,
      strongSignals: MOCK_SIGNALS.filter(s => s.category === cat && s.tier === "STRONG").length,
    }));
  }),
});
