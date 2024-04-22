import { NextFunction, Request, Response } from "express";
import pool from "../db";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users");
    res.status(200).json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];
    user.password = undefined;

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE CASCADE FROM users WHERE user_id = $1", [id]);
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
