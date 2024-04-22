import {
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
} from "discord-interactions";
import { NextFunction, Request, Response } from "express";
import { serverStatus } from "../subscribers/serverStatusSubscriber";

export const DiscordInteractionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, id, data } = req.body;

    if (type === InteractionType.PING) {
      console.log("Responding to ping");
      return res.status(200).json({ type: InteractionResponseType.PONG });
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data;

      if (name === "status") {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          ephemeral: true,
          data: {
            content: parseServerStatus(serverStatus.status),
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }
    }
    return res.status(400).json({ message: "Unknown command" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const parseServerStatus = (status) => {
  return status ? "online:white_large_square:" : "offline:red_square:";
};
