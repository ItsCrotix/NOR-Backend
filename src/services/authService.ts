import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import pool from "../db";
import {
  createAccessToken,
  createRefreshToken,
  getUserByEmail,
  verifyRefreshToken,
} from "../lib/utils";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Both email and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 8);

    const newUser = {
      user_id: uuid(),
      email,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await pool.query(
      "INSERT INTO users (user_id, email, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        newUser.user_id,
        newUser.email,
        newUser.password,
        newUser.created_at,
        newUser.updated_at,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(500).json({ message: "Failed to create user" });
    }

    const user = result.rows[0];
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
      })
      .header("Authorization", `Bearer ${accessToken}`);
    res.status(201).json({
      message: "User created",
      user: {
        user_id: newUser.user_id,
        email: newUser.email,
      },
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
      })
      .header("Authorization", `Bearer ${accessToken}`)
      .status(201)
      .json({
        message: "User logged in successfully",
        user: {
          user_id: user.user_id,
          email: user.email,
          role: user.role,
        },
      });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

export const refreshUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await getUserByEmail(decoded.email);

    const accessToken = createAccessToken(user);

    res.header("Authorization", `Bearer ${accessToken}`);
    return res.status(201).json({ message: "Access token refreshed" });
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
