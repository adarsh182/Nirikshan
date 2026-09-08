"""ML classification stretch goal — hybrid fallback with rule-based classifier."""

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cv2
import joblib
import numpy as np

MODEL_PATH = Path(__file__).parent.parent.parent / "models" / "color_classifier.joblib"


@dataclass
class MLResult:
    result: str
    confidence: float
    available: bool


def _extract_features(image_bytes: bytes) -> np.ndarray | None:
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if image is None:
        return None

    h, w = image.shape[:2]
    zone = image[int(h * 0.35) : int(h * 0.72), int(w * 0.08) : int(w * 0.42)]
    if zone.size == 0:
        return None

    lab = cv2.cvtColor(zone, cv2.COLOR_BGR2LAB)
    hsv = cv2.cvtColor(zone, cv2.COLOR_BGR2HSV)

    features = []
    for channel in (lab, hsv):
        for i in range(3):
            features.extend([
                float(np.mean(channel[:, :, i])),
                float(np.std(channel[:, :, i])),
                float(np.median(channel[:, :, i])),
            ])
    return np.array(features).reshape(1, -1)


def classify_ml(image_bytes: bytes) -> MLResult:
    if not MODEL_PATH.exists():
        return MLResult(result="inconclusive", confidence=0.0, available=False)

    try:
        model = joblib.load(MODEL_PATH)
        features = _extract_features(image_bytes)
        if features is None:
            return MLResult(result="inconclusive", confidence=0.0, available=True)

        prediction = model.predict(features)[0]
        if hasattr(model, "predict_proba"):
            proba = model.predict_proba(features)[0]
            confidence = float(max(proba))
        else:
            confidence = 0.7

        return MLResult(result=str(prediction), confidence=confidence, available=True)
    except Exception:
        return MLResult(result="inconclusive", confidence=0.0, available=False)


def hybrid_classify(
    rule_result: str,
    rule_confidence: float,
    rule_details: dict[str, Any],
    image_bytes: bytes,
    ml_enabled: bool,
) -> tuple[str, float, dict[str, Any]]:
    """Combine rule-based and ML results; prefer higher-confidence source."""
    details = dict(rule_details)
    details["method"] = "rule_based_lab"

    if not ml_enabled:
        return rule_result, rule_confidence, details

    ml = classify_ml(image_bytes)
    details["ml_result"] = ml.result if ml.available else None
    details["ml_confidence"] = ml.confidence if ml.available else None

    if not ml.available:
        return rule_result, rule_confidence, details

    if ml.confidence > rule_confidence + 0.1:
        details["method"] = "hybrid_ml_preferred"
        return ml.result, ml.confidence, details

    if rule_confidence >= ml.confidence:
        details["method"] = "hybrid_rule_preferred"
        return rule_result, rule_confidence, details

    details["method"] = "hybrid_ml_preferred"
    return ml.result, ml.confidence, details
