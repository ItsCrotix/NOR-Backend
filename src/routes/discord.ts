import express, { Router } from "express";
import { DiscordInteractionHandler } from "../services/discordService";
import { VerifyDiscordRequest } from "../discord/utils";

const router = Router();

const veryifyRequest = express.json({
  verify: VerifyDiscordRequest(process.env.DISCORD_PUBLIC_KEY),
});

router.post("/interactions", veryifyRequest, DiscordInteractionHandler);

export default router;
