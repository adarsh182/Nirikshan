import json
from dataclasses import dataclass
from typing import Any

import cv2
import numpy as np

# Known sRGB reference patch colors (BGR for OpenCV)
REFERENCE_PATCHES_BGR = [
    (255, 255, 255),  # white
    (118, 118, 118),  # 18% gray
    (0, 0, 255),      # red
    (0, 255, 0),      # green
    (255, 0, 0),      # blue
    (0, 0, 0),        # black
]


@dataclass
class ClassificationResult:
    result: str
    confidence: float
    details: dict[str, Any]


def _bgr_to_lab(color_bgr: tuple[int, int, int]) -> np.ndarray:
    arr = np.uint8([[list(color_bgr)]])
    return cv2.cvtColor(arr, cv2.COLOR_BGR2LAB)[0][0].astype(float)


def _lab_distance(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.linalg.norm(a - b))


def _detect_reference_card(image: np.ndarray) -> tuple[bool, np.ndarray | None]:
    """Detect reference card in bottom-right region using color clustering."""
    h, w = image.shape[:2]
    # Card expected in bottom-right quarter
    roi = image[int(h * 0.55) : h, int(w * 0.45) : w]
    if roi.size == 0:
        return False, None

    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    # Look for saturated color patches (red, green, blue)
    sat_mask = hsv[:, :, 1] > 80
    if np.sum(sat_mask) < 100:
        return False, None

    return True, roi


def _compute_color_correction(image: np.ndarray, card_roi: np.ndarray | None) -> np.ndarray:
    """Apply simple white-balance correction using detected or assumed gray reference."""
    corrected = image.astype(np.float32)

    if card_roi is not None:
        # Use gray patch area (center-left of card ROI) for white balance
        ch, cw = card_roi.shape[:2]
        gray_patch = card_roi[int(ch * 0.2) : int(ch * 0.5), int(cw * 0.05) : int(cw * 0.35)]
        if gray_patch.size > 0:
            mean_bgr = gray_patch.mean(axis=(0, 1))
            target_gray = 118.0
            scale = target_gray / (mean_bgr + 1e-6)
            corrected = np.clip(corrected * scale, 0, 255)
            return corrected.astype(np.uint8)

    # Fallback: gray-world assumption
    mean_bgr = image.mean(axis=(0, 1))
    gray = mean_bgr.mean()
    scale = gray / (mean_bgr + 1e-6)
    corrected = np.clip(corrected * scale, 0, 255)
    return corrected.astype(np.uint8)


def _extract_test_zone(
    image: np.ndarray,
    roi_x: float | None,
    roi_y: float | None,
    roi_width: float | None,
    roi_height: float | None,
) -> np.ndarray:
    h, w = image.shape[:2]
    if roi_x is not None and roi_y is not None and roi_width and roi_height:
        x1 = int(roi_x * w)
        y1 = int(roi_y * h)
        x2 = int((roi_x + roi_width) * w)
        y2 = int((roi_y + roi_height) * h)
    else:
        # Default: center-left region (test kit beside reference card)
        x1, y1 = int(w * 0.08), int(h * 0.35)
        x2, y2 = int(w * 0.42), int(h * 0.72)

    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)
    return image[y1:y2, x1:x2]


def _dominant_lab(zone: np.ndarray) -> np.ndarray:
    if zone.size == 0:
        return np.array([50.0, 128.0, 128.0])
    lab = cv2.cvtColor(zone, cv2.COLOR_BGR2LAB)
    # Use median to reduce noise
    return np.median(lab.reshape(-1, 3), axis=0).astype(float)


def classify_image(
    image_bytes: bytes,
    positive_lab: dict[str, float],
    negative_lab: dict[str, float],
    inconclusive_lab: dict[str, float] | None,
    confidence_threshold: float,
    roi_x: float | None = None,
    roi_y: float | None = None,
    roi_width: float | None = None,
    roi_height: float | None = None,
    override_result: str | None = None,
) -> ClassificationResult:
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if image is None:
        return ClassificationResult(
            result="inconclusive",
            confidence=0.0,
            details={"error": "Could not decode image", "reference_card_detected": False},
        )

    card_detected, card_roi = _detect_reference_card(image)
    corrected = _compute_color_correction(image, card_roi)
    test_zone = _extract_test_zone(corrected, roi_x, roi_y, roi_width, roi_height)
    dominant = _dominant_lab(test_zone)

    pos = np.array([positive_lab["L"], positive_lab["a"], positive_lab["b"]])
    neg = np.array([negative_lab["L"], negative_lab["a"], negative_lab["b"]])

    dist_pos = _lab_distance(dominant, pos)
    dist_neg = _lab_distance(dominant, neg)

    distances = {"positive": dist_pos, "negative": dist_neg}
    if inconclusive_lab:
        inc = np.array([inconclusive_lab["L"], inconclusive_lab["a"], inconclusive_lab["b"]])
        distances["inconclusive"] = _lab_distance(dominant, inc)

    sorted_results = sorted(distances.items(), key=lambda x: x[1])
    best_result, best_dist = sorted_results[0]
    second_dist = sorted_results[1][1] if len(sorted_results) > 1 else best_dist + 50

    # Confidence: ratio of separation between best and second-best
    separation = second_dist - best_dist
    confidence = min(1.0, max(0.0, separation / 40.0))

    if confidence < confidence_threshold or (best_dist > 35 and separation < 8):
        best_result = "inconclusive"
        confidence = max(confidence, 0.3)

    if override_result in ("positive", "negative", "inconclusive"):
        best_result = override_result
        confidence = 1.0

    # Convert dominant LAB back to RGB swatch for UI
    lab_pixel = np.uint8([[dominant.astype(np.uint8)]])
    bgr = cv2.cvtColor(lab_pixel, cv2.COLOR_LAB2BGR)[0][0]
    rgb = [int(bgr[2]), int(bgr[1]), int(bgr[0])]

    details = {
        "reference_card_detected": card_detected,
        "dominant_lab": {"L": float(dominant[0]), "a": float(dominant[1]), "b": float(dominant[2])},
        "positive_distance": dist_pos,
        "negative_distance": dist_neg,
        "method": "rule_based_lab",
        "corrected_swatch_rgb": rgb,
    }

    return ClassificationResult(result=best_result, confidence=confidence, details=details)


def parse_lab_json(lab_str: str) -> dict[str, float]:
    return json.loads(lab_str)
