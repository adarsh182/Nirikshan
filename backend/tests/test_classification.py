import numpy as np
import pytest

from app.services.classification import (
    _lab_distance,
    classify_image,
    parse_lab_json,
)


def test_lab_distance():
    a = np.array([50.0, 20.0, 30.0])
    b = np.array([50.0, 20.0, 30.0])
    assert _lab_distance(a, b) == 0.0

    c = np.array([50.0, 20.0, 34.0])
    assert _lab_distance(a, c) == pytest.approx(4.0)


def test_parse_lab_json():
    json_str = '{"L": 52.3, "a": 14.2, "b": -8.1}'
    parsed = parse_lab_json(json_str)
    assert parsed["L"] == pytest.approx(52.3)
    assert parsed["a"] == pytest.approx(14.2)
    assert parsed["b"] == pytest.approx(-8.1)


def test_classify_invalid_image():
    # Corrupt/empty bytes should return inconclusive with 0 confidence
    res = classify_image(
        image_bytes=b"not a valid image",
        positive_lab={"L": 40.0, "a": 25.0, "b": -15.0},
        negative_lab={"L": 75.0, "a": 5.0, "b": 40.0},
        inconclusive_lab=None,
        confidence_threshold=0.6,
    )
    assert res.result == "inconclusive"
    assert res.confidence == 0.0
