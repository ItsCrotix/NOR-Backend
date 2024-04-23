export type User = {
  user_id: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
  role: string;
  tfa_enabled: boolean;
  tfa_secret: string;
};

export type Driver = {
  driver_id: string;
  user_name: string;
  first_name: string;
  last_name: string;
  birthdate: string;
  country: string;
  car_number: string;
  created_at: string;
  updated_at: string;
  results: Result[];
};

export type Result = {
  result_id: string;
  driver?: string;
  position: string;
  race?: Race;
  fastest_lap?: boolean;
  points?: number;
} & Race &
  Track &
  Weekend &
  Competition;

export type Race = {
  race_id: string;
  weekend: string;
  track: Track;
  type: string;
  start_time: string;
  duration_ms: number;
  created_at: string;
  updated_at: string;
};

export type Track = {
  track_id: string;
  track_name: string;
  track_record_driver: string;
  track_record_time_ms: string;
  track_length: string;
  track_turns: string;
  created_at: string;
  updated_at: string;
};

export type Weekend = {
  weekend_id: string;
  competition: string;
  weekend_name: string;
  created_at: string;
  updated_at: string;
};

export type Competition = {
  competition_id: string;
  competition_name: string;
  created_at: string;
  updated_at: string;
};

export type RaceResponse = {
  id: string;
  weekend: WeekendResponse;
  track: TrackDriverResponse;
  durationMs: number;
  type: string;
  startTime: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DriverResponse = {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  country: string;
  carNumber: string;
  createdAt?: string;
  updatedAt?: string;
  results: ResultResponse[];
};

export type ResultResponse = {
  id: string;
  driver?: string;
  position: string;
  race?: RaceResponse;
  fastestLap?: boolean;
  points?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type TrackResponse = {
  id: string;
  name: string;
  trackRecordDriver: string;
  trackRecordTimeMs: string;
  trackLength: string;
  trackTurns: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TrackDriverResponse = {
  id: string;
  name: string;
};

export type WeekendResponse = {
  id: string;
  competition: WeekendCompetitionResponse;
  weekendName: string;
  createdAt?: string;
  updatedAt?: string;
};

export type WeekendCompetitionResponse = {
  id: string;
  name: string;
};

export type JWTToken = {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};
