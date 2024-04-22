import express, { Router } from "express";
import { DiscordInteractionHandler } from "../services/discordService";
import { VerifyDiscordRequest } from "../discord/utils";

const router = Router();

router.post("/interactions", DiscordInteractionHandler);

export default router;
