import { NextFunction, Request, Response } from "express";
import { serverStatus } from "../subscribers/serverStatusSubscriber";

export const checkServerStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!serverStatus) {
    res.status(500).json({ message: "Server status not available" });
  } else {
    res.status(200).json({ ...serverStatus });
  }
};
