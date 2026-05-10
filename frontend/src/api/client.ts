import type {
  CheckinCreate,
  CheckinResponse,
  DashboardResponse,
  HabitCreate,
  HabitResponse,
  HabitUpdate,
  HealthResponse,
} from './types';

const BASE = '/api';

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function extractMessage(detail: unknown, fallback: string): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string };
    return first.msg ?? fallback;
  }
  return fallback;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { detail?: unknown };
    throw new ApiError(res.status, extractMessage(body.detail, res.statusText));
  }
  return res.json() as Promise<T>;
}

async function requestEmpty(path: string, options: RequestInit): Promise<void> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { detail?: unknown };
    throw new ApiError(res.status, extractMessage(body.detail, res.statusText));
  }
}

async function requestBlob(path: string): Promise<Blob> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new ApiError(res.status, res.statusText);
  }
  return res.blob();
}

// ---------------------------------------------------------------------------
// API client
// ---------------------------------------------------------------------------

export const api = {
  // Health
  getHealth(): Promise<HealthResponse> {
    return request<HealthResponse>('/health');
  },

  // Habits
  listHabits(): Promise<HabitResponse[]> {
    return request<HabitResponse[]>('/habits');
  },

  createHabit(body: HabitCreate): Promise<HabitResponse> {
    return request<HabitResponse>('/habits', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  updateHabit(id: number, body: HabitUpdate): Promise<HabitResponse> {
    return request<HabitResponse>(`/habits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  // Check-ins
  createCheckin(body: CheckinCreate): Promise<CheckinResponse> {
    return request<CheckinResponse>('/checkins', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  listCheckins(fromDate: string, toDate: string): Promise<CheckinResponse[]> {
    const params = new URLSearchParams({ from: fromDate, to: toDate });
    return request<CheckinResponse[]>(`/checkins?${params}`);
  },

  deleteCheckin(id: number): Promise<void> {
    return requestEmpty(`/checkins/${id}`, { method: 'DELETE' });
  },

  // Dashboard
  getDashboard(): Promise<DashboardResponse> {
    return request<DashboardResponse>('/dashboard');
  },

  // Export
  exportCsv(): Promise<Blob> {
    return requestBlob('/export');
  },
};
