import { createTRPCRouter } from "~/server/api/trpc";
import { genreRouter } from "~/server/api/routers/genre";
import { tabRouter } from "./routers/tab";
import { artistRouter } from "./routers/artist";
import { likeRouter } from "./routers/like";
import { postSignUpRegistrationRouter } from "./routers/postSignUpRegistration";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  genre: genreRouter,
  tab: tabRouter,
  artist: artistRouter,
  like: likeRouter,
  postSignUpRegistration: postSignUpRegistrationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
