import express, { Router } from "express";
import { DiscordInteractionHandler } from "../services/discordService";
import { VerifyDiscordRequest } from "../discord/utils";

const router = Router();

router.use(
  express.json({ verify: VerifyDiscordRequest(process.env.DISCORD_PUBLIC_KEY) })
);

router.post("/interactions", DiscordInteractionHandler);

export default router;
