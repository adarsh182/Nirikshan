import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { Operator, TokenResponse } from "../types";

const TOKEN_KEY = "token";
const OPERATOR_KEY = "operator";
const OPERATOR_ID_KEY = "operator_id";

export async function saveAuth(data: TokenResponse): Promise<void> {
  const op = JSON.stringify({
    operator_id: data.operator_id,
    badge_id: data.badge_id,
    name: data.name,
  });
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(OPERATOR_KEY, op);
    localStorage.setItem(OPERATOR_ID_KEY, data.operator_id);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
    await SecureStore.setItemAsync(OPERATOR_KEY, op);
    await SecureStore.setItemAsync(OPERATOR_ID_KEY, data.operator_id);
  }
}

export async function saveSelectedOperator(op: Operator): Promise<void> {
  const sessionToken = "session-" + op.id;
  const opJson = JSON.stringify({
    operator_id: op.id,
    badge_id: op.badge_id,
    name: op.name,
    role: op.role,
  });
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, sessionToken);
    localStorage.setItem(OPERATOR_KEY, opJson);
    localStorage.setItem(OPERATOR_ID_KEY, op.id);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, sessionToken);
    await SecureStore.setItemAsync(OPERATOR_KEY, opJson);
    await SecureStore.setItemAsync(OPERATOR_ID_KEY, op.id);
  }
}

export async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === "web") return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(OPERATOR_ID_KEY);
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) return token;
  return SecureStore.getItemAsync(OPERATOR_ID_KEY);
}

export async function getStoredOperatorId(): Promise<string | null> {
  if (Platform.OS === "web") return localStorage.getItem(OPERATOR_ID_KEY);
  return SecureStore.getItemAsync(OPERATOR_ID_KEY);
}

export async function getStoredOperator(): Promise<{ operator_id: string; badge_id: string; name: string; role?: string } | null> {
  let raw: string | null;
  if (Platform.OS === "web") raw = localStorage.getItem(OPERATOR_KEY);
  else raw = await SecureStore.getItemAsync(OPERATOR_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearAuth(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(OPERATOR_KEY);
    localStorage.removeItem(OPERATOR_ID_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(OPERATOR_KEY);
    await SecureStore.deleteItemAsync(OPERATOR_ID_KEY);
  }
}
