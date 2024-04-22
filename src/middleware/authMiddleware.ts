import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

enum Role {
  GUEST = 0,
  USER = 1,
  ADMIN = 2,
}

const roles = ["Guest", "User", "Admin"];

export const authAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (roles.indexOf(decoded.role) < Role.ADMIN) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const authUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (roles.indexOf(decoded.role) < Role.USER) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const authSelf = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (decoded.user_id !== req.params.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const authSelfOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (
      decoded.id !== req.params.id &&
      roles.indexOf(decoded.role) < Role.ADMIN
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
