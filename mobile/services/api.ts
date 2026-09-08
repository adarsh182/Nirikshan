import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type {
  DashboardStats,
  KitType,
  Operator,
  TestRecord,
  TestRecordList,
  TokenResponse,
  VerificationResult,
} from "../types";
import { getStoredOperatorId } from "./auth";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem("token");
  }
  return SecureStore.getItemAsync("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 15000,
): Promise<T> {
  const token = await getToken();
  const operatorId = await getStoredOperatorId();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (operatorId) headers["X-Operator-Id"] = operatorId;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Connection timed out. Check your network or server URL.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getOperators(): Promise<Operator[]> {
  return request<Operator[]>("/auth/operators");
}

export async function login(badgeId: string, password?: string): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ badge_id: badgeId, password: password || "" }),
  });
}

export async function getKits(): Promise<KitType[]> {
  return request<KitType[]>("/kits");
}

export async function getStats(): Promise<DashboardStats> {
  return request<DashboardStats>("/tests/stats");
}

export async function getTestHistory(params: {
  page?: number;
  pageSize?: number;
  result?: string;
  q?: string;
} = {}): Promise<TestRecordList> {
  const queryParts: string[] = [];
  if (params.page) queryParts.push(`page=${params.page}`);
  if (params.pageSize) queryParts.push(`page_size=${params.pageSize}`);
  if (params.result) queryParts.push(`result=${encodeURIComponent(params.result)}`);
  if (params.q) queryParts.push(`q=${encodeURIComponent(params.q)}`);

  const qs = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  return request<TestRecordList>(`/tests${qs}`);
}

export async function getTestDetail(testId: string): Promise<TestRecord> {
  return request<TestRecord>(`/tests/${testId}`);
}

export async function verifyTest(testId: string): Promise<VerificationResult> {
  return request<VerificationResult>(`/tests/${testId}/verify`);
}

export async function submitTest(
  imageUri: string,
  kitTypeId: string,
  location: {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    source?: string;
    verified?: boolean;
  },
  options?: {
    notes?: string;
    overrideResult?: string;
    deviceCapturedAt?: string;
  },
): Promise<TestRecord> {
  const form = new FormData();
  const filename = imageUri.split("/").pop() || "capture.jpg";
  form.append("image", {
    uri: imageUri,
    name: filename,
    type: "image/jpeg",
  } as unknown as Blob);
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
  if (options?.notes) form.append("notes", options.notes);
  if (options?.overrideResult) form.append("override_result", options.overrideResult);

  return request<TestRecord>("/tests", { method: "POST", body: form }, 30000);
}

export async function overrideTestResult(
  testId: string,
  overrideResult: string,
  notes?: string,
): Promise<TestRecord> {
  const form = new FormData();
  form.append("override_result", overrideResult);
  if (notes) form.append("notes", notes);
  return request<TestRecord>(`/tests/${testId}`, { method: "PATCH", body: form });
}

export async function deleteTest(testId: string): Promise<{ status: string; id: string }> {
  return request<{ status: string; id: string }>(`/tests/${testId}`, { method: "DELETE" });
}

export { API_BASE };

