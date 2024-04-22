import { NextFunction, Request, Response } from "express";
import pool from "../db";

export const getCompetitions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rows = await pool.query("SELECT * FROM competition");
    return res.status(200).json(rows.rows);
  } catch (err) {
    return res.status(500).json("Internal Server Error");
  }
};

export const getCompetitionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const rows = await pool.query("SELECT * FROM competition WHERE id = $1", [
      id,
    ]);
    if (rows.rowCount === 0) {
      return res.status(404).json("Competition not found");
    }
    return res.status(200).json(rows.rows[0]);
  } catch (err) {
    return res.status(500).json("Internal Server Error");
  }
};

export const createCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body;
  try {
    const rows = await pool.query(
      "INSERT INTO competition (name) VALUES ($1) RETURNING *",
      [name]
    );

    return res.status(201).json(rows.rows[0]);
  } catch (err) {
    return res.status(500).json("Internal Server Error");
  }
};

export const updateCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const rows = await pool.query(
      "UPDATE competition SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );
    if (rows.rowCount === 0) {
      return res.status(404).json("Competition not found");
    }
    return res.status(200).json(rows.rows[0]);
  } catch (err) {
    return res.status(500).json("Internal Server Error");
  }
};

export const deleteCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const rows = await pool.query("DELETE FROM competition WHERE id = $1", [
      id,
    ]);
    if (rows.rowCount === 0) {
      return res.status(404).json("Competition not found");
    }
    return res.status(204).json();
  } catch (err) {
    return res.status(500).json("Internal Server Error");
  }
};

export const getDriversInCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.*, d.* FROM drivers_competitions dc
      JOIN drivers d ON dc.driver = d.driver_id
      JOIN competitions c ON dc.competition = c.competition_id 
      WHERE competition = $1;`,
      [id]
    );

    const drivers = result.rows.map((row) => {
      return {
        driver: {
          id: row.driver_id,
          user_name: row.user_name,
          car_number: row.car_number,
        },
        competition: {
          id: row.competition_id,
          name: row.competition_name,
        },
      };
    });

    return res.status(200).json(drivers);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", err });
  }
};

export const deleteDriverFromCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const driverId = req.body.driverId;

  try {
    const rows = await pool.query(
      "DELETE FROM competition_driver WHERE competition_id = $1 AND driver_id = $2",
      [id, driverId]
    );
    if (rows.rowCount === 0) {
      return res.status(404).json("Driver not found in competition");
    }
    return res.status(204).json();
  } catch (err) {
    return res.status(500).json("Internal Server Error");
  }
};
