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

    if (type === InteractionType.PING) {
      return res.status(200).json({ type: InteractionResponseType.PONG });
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data;

      // "test" command
      if (name === "test") {
        // Send a message into the channel where command was triggered from
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            // Fetches a random emoji to send from a helper function
            content: serverStatus
              ? `Server is ${serverStatus.status}`
              : "Server status is currenty unknown",
          },
        });
      }

      // If the command is not recognized, return a generic error message
      return res.status(400).json({ message: "Unknown command" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};
