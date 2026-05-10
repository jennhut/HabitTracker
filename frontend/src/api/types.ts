/**
 * TypeScript types generated from http://localhost:8000/openapi.json
 * Do not hand-edit — regenerate from the OpenAPI spec if the backend changes.
 */

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export type HabitStatus = 'active' | 'archived';

// ---------------------------------------------------------------------------
// Habits
// ---------------------------------------------------------------------------

export interface HabitResponse {
  id: number;
  name: string;
  colour: string;
  status: HabitStatus;
  created_at: string;
  updated_at: string;
}

export interface HabitCreate {
  name: string;
  colour: string;
}

/** All fields optional — supply any combination to partially update a habit. */
export interface HabitUpdate {
  name?: string | null;
  colour?: string | null;
  status?: HabitStatus | null;
}

// ---------------------------------------------------------------------------
// Check-ins
// ---------------------------------------------------------------------------

export interface CheckinResponse {
  id: number;
  /** ISO date string: YYYY-MM-DD */
  date: string;
  habit_id: number;
  note: string | null;
  created_at: string;
}

export interface CheckinCreate {
  /** ISO date string: YYYY-MM-DD */
  date: string;
  habit_id: number;
  note?: string | null;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface DashboardResponse {
  current_streak: number;
  best_streak: number;
  this_week_count: number;
  this_week_target: number;
  /** Float 0–1, e.g. 0.875 = 87.5% */
  completion_rate: number;
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export interface HealthResponse {
  status: string;
}

// ---------------------------------------------------------------------------
// Errors (mirroring FastAPI's HTTPValidationError shape)
// ---------------------------------------------------------------------------

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[] | string;
}
