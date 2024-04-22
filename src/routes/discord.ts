import express, { Router } from "express";
import { DiscordInteractionHandler } from "../services/discordService";

const router = Router();

router.post("/interactions", DiscordInteractionHandler);

export default router;
