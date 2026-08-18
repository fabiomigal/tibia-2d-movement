import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { acceptQuest, buyFromMerchant, claimQuest, collectGroundDrop, getGameSnapshot, listMerchantItems, resolveCombat, reviveCharacter, resumeIdleHunt, selectArchetype, setAutoPotion, startIdleHunt, travelToRegion, updateInventory } from "./gameService";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  game: router({
    bootstrap: publicProcedure.query(() => getGameSnapshot()),
    combat: publicProcedure.input(z.object({ monsterKey: z.string(), skillKey: z.string().optional() })).mutation(({ input }) => resolveCombat(input.monsterKey, input.skillKey)),
    revive: publicProcedure.mutation(() => reviveCharacter()),
    inventory: publicProcedure.input(z.object({ action: z.enum(["equip", "sell", "discard", "use"]), itemId: z.number().int() })).mutation(({ input }) => updateInventory(input.action, input.itemId)),
    travel: publicProcedure.input(z.object({ region: z.string() })).mutation(({ input }) => travelToRegion(input.region)),
    idleStart: publicProcedure.input(z.object({ monsterKey: z.string() })).mutation(({ input }) => startIdleHunt(input.monsterKey)),
    idleResume: publicProcedure.mutation(() => resumeIdleHunt()),
    merchant: publicProcedure.query(() => listMerchantItems()),
    merchantBuy: publicProcedure.input(z.object({ catalogKey: z.string(), confirmLegendary: z.boolean().optional() })).mutation(({ input }) => buyFromMerchant(input.catalogKey, input.confirmLegendary)),
    collectDrop: publicProcedure.input(z.object({ dropId: z.number().int() })).mutation(({ input }) => collectGroundDrop(input.dropId)),
    autoPotion: publicProcedure.input(z.object({ enabled: z.boolean() })).mutation(({ input }) => setAutoPotion(input.enabled)),
    questAccept: publicProcedure.input(z.object({ questKey: z.string() })).mutation(({ input }) => acceptQuest(input.questKey)),
    questClaim: publicProcedure.input(z.object({ questKey: z.string() })).mutation(({ input }) => claimQuest(input.questKey)),
    archetype: publicProcedure.input(z.object({ archetype: z.enum(["fighter", "archer", "mage"]) })).mutation(({ input }) => selectArchetype(input.archetype)),
  }),
});

export type AppRouter = typeof appRouter;
