import axios from "axios";
import type {
  DashboardStats,
  KitType,
  Operator,
  TestRecord,
  TestRecordList,
  TokenResponse,
  VerificationResult,
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const operatorId = localStorage.getItem("operator_id");
  if (operatorId) {
    config.headers["X-Operator-Id"] = operatorId;
  }
  return config;
});

export async function getOperators(): Promise<Operator[]> {
  const { data } = await api.get<Operator[]>("/auth/operators");
  return data;
}

export async function login(badgeId: string, password?: string): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/auth/login", {
    badge_id: badgeId,
    password: password || "",
  });
  return data;
}

export async function getKits(): Promise<KitType[]> {
  const { data } = await api.get<KitType[]>("/kits");
  return data;
}

export async function getTests(params: Record<string, string | number>): Promise<TestRecordList> {
  const { data } = await api.get<TestRecordList>("/tests", { params });
  return data;
}

export async function getTest(id: string): Promise<TestRecord> {
  const { data } = await api.get<TestRecord>(`/tests/${id}`);
  return data;
}

export async function getStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>("/tests/stats");
  return data;
}

export async function verifyTest(id: string): Promise<VerificationResult> {
  const { data } = await api.get<VerificationResult>(`/tests/${id}/verify`);
  return data;
}

export async function overrideTestResult(
  id: string,
  overrideResult: string,
  notes?: string,
): Promise<TestRecord> {
  const form = new FormData();
  form.append("override_result", overrideResult);
  if (notes) form.append("notes", notes);
  const { data } = await api.patch<TestRecord>(`/tests/${id}`, form);
  return data;
}

export async function submitTest(
  imageBlob: Blob,
  kitTypeId: string,
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
    source?: string;
    verified?: boolean;
  },
  options?: {
    notes?: string;
    deviceCapturedAt?: string;
  },
): Promise<TestRecord> {
  const form = new FormData();
  form.append("image", imageBlob, "field_capture.jpg");
  form.append("kit_type_id", kitTypeId);
  form.append("latitude", String(location.latitude));
  form.append("longitude", String(location.longitude));
  if (location.accuracy != null) {
    form.append("location_accuracy_m", String(location.accuracy));
  }
  if (location.source) {
    form.append("location_source", location.source);
  }
  if (location.verified != null) {
    form.append("location_verified", String(location.verified));
  }
  if (options?.deviceCapturedAt) {
    form.append("device_captured_at", options.deviceCapturedAt);
  }
  if (options?.notes) {
    form.append("notes", options.notes);
  }

  const { data } = await api.post<TestRecord>("/tests", form);
  return data;
}

export function getImageUrl(id: string): string {
  const token = localStorage.getItem("token");
  return `${API_BASE}/tests/${id}/image?token=${token}`;
}

export function getAuthenticatedImageUrl(id: string): string {
  return `${API_BASE}/tests/${id}/image`;
}

export interface LocationInfo {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
  isp?: string;
  accuracy: number;
  source: string;
}

export async function detectLocation(): Promise<LocationInfo> {
  const { data } = await api.get<LocationInfo>("/location/detect");
  return data;
}

export { api };
