export interface Operator {
  id: string;
  badge_id: string;
  name: string;
  role: string;
}

export interface KitType {
  id: string;
  name: string;
  description: string | null;
  confidence_threshold: number;
}

export interface TestRecord {
  id: string;
  operator_id: string;
  kit_type_id: string;
  kit_type_name: string | null;
  operator_name: string | null;
  operator_badge_id: string | null;
  result: "positive" | "negative" | "inconclusive";
  confidence: number;
  captured_at: string;
  device_captured_at: string | null;
  latitude: number;
  longitude: number;
  location_accuracy_m: number | null;
  location_source?: string;
  location_verified?: boolean;
  image_hash: string;
  record_hash: string;
  signature: string;
  classification_details: {
    reference_card_detected?: boolean;
    dominant_lab?: { L: number; a: number; b: number };
    positive_distance?: number;
    negative_distance?: number;
    method?: string;
    corrected_swatch_rgb?: [number, number, number];
    officer_override?: string;
    [key: string]: unknown;
  } | null;
  notes: string | null;
  created_at: string;
}

export interface TestRecordList {
  items: TestRecord[];
  total: number;
  page: number;
  page_size: number;
}

export interface DashboardStats {
  total_tests: number;
  positive_count: number;
  negative_count: number;
  inconclusive_count: number;
  tests_today: number;
}

export interface VerificationResult {
  valid: boolean;
  image_hash_match: boolean;
  record_hash_match: boolean;
  signature_valid: boolean;
  message: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  operator_id: string;
  badge_id: string;
  name: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  source?: string;
  verified?: boolean;
}
