import { NextFunction, Request, Response, Router } from "express";
import { DiscordInteractionHandler } from "../services/discordService";

const router = Router();

type DiscordAuthResponse = {
  code: string;
  guild_id: string;
  permissions: string;
};

router.post("/interactions", DiscordInteractionHandler);
