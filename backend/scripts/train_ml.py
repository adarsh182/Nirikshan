"""Train a simple color-feature classifier for hybrid ML fallback."""

import json
import sys
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier

sys.path.insert(0, str(Path(__file__).parent.parent))

MODEL_DIR = Path(__file__).parent.parent / "models"
MODEL_PATH = MODEL_DIR / "color_classifier.joblib"


def generate_synthetic_training_data(n_per_class: int = 50) -> tuple[np.ndarray, np.ndarray]:
    """Generate synthetic LAB/HSV feature vectors for ML classification model."""
    rng = np.random.default_rng(42)
    X, y = [], []

    profiles = {
        "positive": {"L": 35, "a": 145, "b": 120, "H": 280, "S": 180, "V": 120},
        "negative": {"L": 165, "a": 145, "b": 155, "H": 25, "S": 160, "V": 200},
        "inconclusive": {"L": 100, "a": 128, "b": 128, "H": 128, "S": 80, "V": 150},
    }

    for label, profile in profiles.items():
        for _ in range(n_per_class):
            features = []
            for key in ("L", "a", "b", "H", "S", "V"):
                mean = profile[key]
                features.extend([
                    mean + rng.normal(0, 8),
                    abs(rng.normal(5, 2)),
                    mean + rng.normal(0, 5),
                ])
            X.append(features)
            y.append(label)

    return np.array(X), np.array(y)


def train() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    X, y = generate_synthetic_training_data()
    model = RandomForestClassifier(n_estimators=50, random_state=42)
    model.fit(X, y)
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")
    print(f"Classes: {list(model.classes_)}")


if __name__ == "__main__":
    train()
