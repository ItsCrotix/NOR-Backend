import { NextFunction, Request, Response } from "express";
import pool from "../db";
import { Driver, DriverResponse, Result } from "../lib/types";
import { decodeAccessToken, parseDriverResponse, scores } from "../lib/utils";
import { QueryResult } from "pg";

export const getDrivers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let response: DriverResponse[];
  try {
    const driversData: QueryResult<Driver> = await pool.query(
      `SELECT * FROM drivers`
    );
    const response: DriverResponse[] = [];

    const resultsData = await pool.query(
      `SELECT * FROM results 
            JOIN races ON results.race = races.race_id
            JOIN tracks ON races.track = tracks.track_id
            JOIN weekends ON races.weekend = weekends.weekend_id
            JOIN competitions ON weekends.competition = competitions.competition_id
        `
    );

    driversData.rows.map((driver: Driver) => {
      driver.results = resultsData.rows.filter(
        (result: Result) => result.driver === driver.driver_id
      );
      response.push(parseDriverResponse(driver));
    });

    res.json(response);
  } catch (err) {
    res.status(500).send("Internal Server Error: " + err);
  }
};

export const getDriverById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const driverDataResult = await pool.query(
      "SELECT * FROM drivers WHERE driver_id = $1",
      [id]
    );

    const driverData = driverDataResult.rows;

    const results = await pool.query(
      "SELECT * FROM results WHERE driver = $1",
      [id]
    );

    driverData.forEach((driver: Driver) => {
      driver.results = results.rows.filter(
        (results: Result) => results.driver === driver.driver_id
      );
      driver.results.forEach((result: Result) => {
        const pos = parseInt(result.position);
        result.driver = undefined;
        result.points = pos <= 10 ? scores[pos - 1] : 0;
      });
    });

    res.json(driverData);
  } catch (err) {
    res.status(500).send("Internal Server Error: " + err);
  }
};

export const createDriver = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    const decodedToken = decodeAccessToken(accessToken);
    if (!decodedToken) {
      return res.status(401).send("Unauthorized");
    }

    const user_id = decodedToken.id;
    const { user_name, car_number } = req.body;
    const newDriver = await pool.query(
      "INSERT INTO driver (driver_id, user_name, car_number, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user_id, user_name, car_number, new Date(), new Date()]
    );

    res
      .status(201)
      .send({ message: "Driver created", driver: newDriver.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

export const updateDriver = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { user_name, car_number } = req.body;

  try {
    const result = await pool.query(
      "UPDATE drivers SET user_name = $1, car_number = $2, updated_at = $3 WHERE driver_id = $4 RETURNING *",
      [user_name, car_number, new Date(), id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.status(200).json({ message: "Driver updated", driver: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

export const deleteDriver = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE CASCADE FROM drivers WHERE driver_id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.status(200).json({ message: "Driver deleted" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

export const getDriverResults = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const results = await pool.query(
      "SELECT * FROM results WHERE driver = $1",
      [id]
    );

    res.json(results.rows);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

export const createDriverResult = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { race, position, fastest_lap } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO results (driver, race, position, fastest_lap, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [id, race, position, fastest_lap, new Date(), new Date()]
    );
    res.status(201).json({ message: "Result created", result: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

export const addDriverToCompetition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { competition } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO drivers_competitions (driver, competition) VALUES ($1, $2) RETURNING *",
      [id, competition]
    );
    res
      .status(201)
      .json({ message: "Driver added to competition", result: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};
