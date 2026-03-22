import { router } from "./trpc";
import { walletsRouter } from "./routers/wallets";
import { signalsRouter } from "./routers/signals";
import { categoriesRouter } from "./routers/categories";

export const appRouter = router({
  wallets: walletsRouter,
  signals: signalsRouter,
  categories: categoriesRouter,
});

export type AppRouter = typeof appRouter;
