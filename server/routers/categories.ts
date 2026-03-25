import { router, publicProcedure } from "../trpc";
import { getActiveEvents } from "@/server/services/polymarketClient";

const CATEGORIES = ["Politics", "Sports", "Crypto", "Finance", "Geopolitics", "Culture", "Economy", "Weather"];

export const categoriesRouter = router({
  getStats: publicProcedure.query(async () => {
    const results = await Promise.allSettled(
      CATEGORIES.map(async (cat) => {
        const events = await getActiveEvents(cat, 20);
        return {
          name: cat,
          walletCount: 0, // populated by walletTracker cache
          signalCount: events.filter((e) => e.active && !e.closed).length,
          strongSignals: 0,
        };
      })
    );

    return results
      .map((r, i) =>
        r.status === "fulfilled"
          ? r.value
          : { name: CATEGORIES[i], walletCount: 0, signalCount: 0, strongSignals: 0 }
      );
  }),
});
