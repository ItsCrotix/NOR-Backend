import { NextFunction, Request, Response } from "express";
import pool from "../db";

export const grantAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.body;

    const currentRole = await pool.query(
      "SELECT role FROM users WHERE user_id = $1",
      [id]
    );

    if (currentRole.rows[0].role === "Admin") {
      return res.status(400).json({ message: "User is already an Admin" });
    }

    await pool.query("UPDATE users SET role = 'Admin' WHERE user_id = $1", [
      id,
    ]);

    res.status(200).json({ message: "Admin granted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const revokeAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.body;

    const currentRole = await pool.query(
      "SELECT role FROM users WHERE user_id = $1",
      [id]
    );

    if (currentRole.rows[0].role !== "Admin") {
      return res.status(400).json({ message: "User is not an Admin" });
    }

    await pool.query("UPDATE users SET role = 'User' WHERE user_id = $1", [id]);

    res.status(200).json({ message: "Admin revoked" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
