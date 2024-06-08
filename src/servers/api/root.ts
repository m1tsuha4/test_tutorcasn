import { flashcardRouter } from "./routers/flashcard";
import { documentRouter } from "./routers/document";
import { highlightRouter } from "./routers/highlight";
import { messageRouter } from "./routers/message";
import { userRouter } from "./routers/user";
import { createTRPCRouter } from "./trpc";
import { categoryRouter } from "./routers/category";
import { subcategoryRouter } from "./routers/subcategory";

export const appRouter = createTRPCRouter({
  document: documentRouter,
  user: userRouter,
  highlight: highlightRouter,
  message: messageRouter,
  flashcard: flashcardRouter,
  category: categoryRouter,
  subcategory: subcategoryRouter,
});

export type AppRouter = typeof appRouter;
