import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import {
  Competition,
  Driver,
  DriverResponse,
  Result,
  ResultResponse,
  Track,
  TrackDriverResponse,
  User,
  WeekendCompetitionResponse,
  WeekendResponse,
} from "./types";
import pool from "../db";

export const scores = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

export async function getUserByEmail(email: string) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0] as User;
}

export function createAccessToken(user: User | JwtPayload) {
  console.log(user);
  return jwt.sign(
    { id: user.user_id, email: user.email, role: user.role },
    process.env.JWT_SECRET as Secret,
    {
      expiresIn: "1h",
    }
  );
}

export function createRefreshToken(user: User) {
  return jwt.sign(
    { id: user.user_id, email: user.email, role: user.role },
    process.env.REFRESH_SECRET as Secret,
    {
      expiresIn: "1d",
    }
  );
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, process.env.REFRESH_SECRET!) as JwtPayload;
}

export function decodeAccessToken(token: string | undefined) {
  if (!token) return null;

  const isValid = jwt.verify(token, process.env.JWT_SECRET!);
  if (isValid) {
    return jwt.decode(token) as JwtPayload;
  }
  return null;
}

export const calculateRacePoints = (result: Result) => {
  const type = result.type;
  const pos = parseInt(result.position);
  const fastest_lap = result.fastest_lap;
  let points = 0;

  switch (type) {
    case "Race":
      points = pos <= 10 ? scores[pos - 1] : 0;
      break;
    case "Qualifying":
      fastest_lap ? (points = 1) : (points = 0);
      break;
  }
  return points;
};

export const parseDriverResponse = (result: Driver): DriverResponse => {
  const response: DriverResponse = {
    id: result.driver_id,
    userName: result.user_name,
    firstName: result.first_name,
    lastName: result.last_name,
    birthdate: result.birthdate,
    country: result.country,
    carNumber: result.car_number,
    results: result.results.map(parseDriverResults),
  };
  return response;
};

export const parseDriverResults = (result: Result): ResultResponse => {
  result.points = calculateRacePoints(result);
  const response: ResultResponse = {
    id: result.result_id,
    position: result.position,
    fastestLap: result.fastest_lap,
    points: result.points,
    race: {
      id: result.race_id,
      weekend: parseResultWeekend(result),
      track: parseResultTrack(result),
      durationMs: result.duration_ms,
      type: result.type,
      startTime: result.start_time,
    },
  };
  return response;
};

export const parseResultWeekend = (result: Result): WeekendResponse => {
  const response: WeekendResponse = {
    id: result.weekend_id,
    competition: parseResultCompetition(result),
    weekendName: result.weekend_name,
  };
  return response;
};

export const parseResultTrack = (result: Track): TrackDriverResponse => {
  const response: TrackDriverResponse = {
    id: result.track_id,
    name: result.track_name,
  };
  return response;
};

export const parseResultCompetition = (
  result: Competition
): WeekendCompetitionResponse => {
  const response: WeekendCompetitionResponse = {
    id: result.competition_id,
    name: result.competition_name,
  };
  return response;
};
