import { InteractionResponseType, InteractionType } from "discord-interactions";
import { NextFunction, Request, Response } from "express";
import { serverStatus } from "../subscribers/serverStatusSubscriber";

export const DiscordInteractionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, id, data } = req.body;

    console.log("Received interaction", req.body);

    if (type === InteractionType.PING) {
      console.log("Responding to ping");
      return res.status(200).json({ type: InteractionResponseType.PONG });
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data;

      if (name === "test") {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: serverStatus
              ? `Server is ${serverStatus.status}`
              : "Server status is currently unknown",
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
