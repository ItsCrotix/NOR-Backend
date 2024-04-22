import { NextFunction, Request, Response } from "express";
import pool from "../db";

export const getResults = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const results = await pool.query("SELECT * FROM results");
    res.status(200).json(results.rows);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

export const getResultById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM result WHERE driver_id = $1",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error: " + err);
  }
};

export const updateResult = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: result_id } = req.params;
  const { race, position, fastest_lap } = req.body;

  try {
    const result = await pool.query(
      "UPDATE results SET (race, position, fastest_lap, updated_at) = ($1, $2, $3, $4) AND result_id = $6 RETURNING *",
      [race, position, fastest_lap, new Date(), result_id]
    );
    res.status(200).json({ message: "Result updated", result: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

export const deleteResult = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM results WHERE result_id = $1 RETURNING *",
      [id]
    );
    res.status(200).json({ message: "Result deleted", result: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};
