import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type { Artist } from "@prisma/client";
import buildArtistOrderBy from "~/utils/buildArtistOrderBy";

export interface ArtistMetadata extends Artist {
  numberOfLikes: number;
  numberOfTabs: number;
  likedTabIds: number[];
}

export const artistRouter = createTRPCRouter({
  updateArtist: publicProcedure
    .input(
      z.object({
        id: z.string(),
        username: z.string().optional(),
        profileImageUrl: z.string().optional(),
        pinnedTabId: z.number().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.artist.update({
        where: {
          userId: input.id,
        },
        data: {
          username: input.username,
          profileImageUrl: input.profileImageUrl,
          pinnedTabId: input.pinnedTabId,
        },
      });
    }),

  getByIdOrUsername: publicProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        username: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const artist = await ctx.prisma.artist.findUnique({
        where: {
          [input.userId ? "userId" : "username"]: input.userId
            ? input.userId
            : input.username,
        },
        include: {
          likesGiven: {
            select: {
              tabId: true,
            },
          },
          _count: {
            select: {
              tabs: true,
              likesReceived: {
                where: {
                  [input.userId ? "tabArtistId" : "tabArtistUsername"]: {
                    equals: input.userId ? input.userId : input.username,
                  },
                },
              },
            },
          },
        },
      });

      if (!artist) return null;

      const artistMetadata: ArtistMetadata = {
        ...artist,
        numberOfTabs: artist._count.tabs,
        numberOfLikes: artist._count.likesReceived,
        likedTabIds: artist.likesGiven.map((like) => like.tabId),
      };

      return artistMetadata;
    }),

  getInfiniteArtistsBySearchQuery: publicProcedure
    .input(
      z.object({
        searchQuery: z.string(),
        sortByRelevance: z.boolean(),
        sortBy: z.enum(["newest", "oldest", "mostLiked", "leastLiked", "none"]),
        // limit: z.number(), fine to hardcode I think, maybe end up scaling down from 25 on smaller screens?
        cursor: z.number().nullish(), // <-- "cursor" needs to exist, but can be any type
      })
    )
    .query(async ({ input, ctx }) => {
      const { searchQuery, sortByRelevance, sortBy, cursor } = input;
      const limit = 25;

      const orderBy = buildArtistOrderBy(sortBy, sortByRelevance, searchQuery);

      const fullArtistListWithMetadata: ArtistMetadata[] = [];

      const [count, artistIds] = await Promise.all([
        ctx.prisma.artist.count({
          where: {
            username: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
        }),
        ctx.prisma.artist.findMany({
          take: limit + 1, // get an extra item at the end which we'll use as next cursor
          where: {
            username: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          select: {
            id: true,
            userId: true,
          },
          cursor: cursor ? { id: cursor } : undefined,
          ...(orderBy !== undefined ? { orderBy: orderBy } : {}),
        }),
      ]);

      let nextCursor: typeof cursor | undefined = undefined;
      if (artistIds.length > limit) {
        const nextItem = artistIds.pop();
        if (nextItem) {
          nextCursor = nextItem.id;
        }
      }

      for (const artist of artistIds) {
        const retrievedArtist = await ctx.prisma.artist.findUnique({
          where: {
            id: artist.id,
          },
          include: {
            likesGiven: {
              select: {
                tabId: true,
              },
            },
            _count: {
              select: {
                tabs: true,
                likesReceived: {
                  where: {
                    tabArtistId: {
                      equals: artist.userId,
                    },
                  },
                },
              },
            },
          },
        });

        if (retrievedArtist) {
          fullArtistListWithMetadata.push({
            ...retrievedArtist,
            numberOfTabs: retrievedArtist._count.tabs,
            numberOfLikes: retrievedArtist._count.likesReceived,
            likedTabIds: retrievedArtist.likesGiven.map((like) => like.tabId),
          });
        }
      }

      return {
        data: {
          artists: fullArtistListWithMetadata,
          nextCursor,
        },
        count,
      };
    }),

  // should be private
  deleteArtist: publicProcedure
    .input(z.string())
    .mutation(async ({ input: userId, ctx }) => {
      void clerkClient.users.deleteUser(userId);

      await ctx.prisma.artist.delete({
        where: {
          userId,
        },
      });
    }),
});
