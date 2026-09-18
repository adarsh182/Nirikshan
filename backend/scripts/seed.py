"""Seed operators, forensic kit types, and realistic field test records."""

import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
import numpy as np
import cv2

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database.connection import SessionLocal, init_db
from app.models.kit_type import KitType
from app.models.operator import Operator
from app.models.test_record import TestRecord
from app.services.integrity import (
    build_record_payload,
    compute_record_hash,
    hash_password,
    sha256_bytes,
    sign_record,
)
from app.services.storage import ensure_upload_dir, save_image


def _add_noise(img: np.ndarray, intensity: int = 8) -> np.ndarray:
    """Add subtle Gaussian noise for photorealistic texture."""
    noise = np.random.normal(0, intensity, img.shape).astype(np.int16)
    noisy = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    return noisy


def _draw_rounded_rect(img: np.ndarray, pt1: tuple, pt2: tuple, color: tuple, radius: int = 12, thickness: int = -1):
    """Draw a rounded rectangle on the image."""
    x1, y1 = pt1
    x2, y2 = pt2
    r = min(radius, (x2 - x1) // 2, (y2 - y1) // 2)

    # Fill the main body
    cv2.rectangle(img, (x1 + r, y1), (x2 - r, y2), color, thickness)
    cv2.rectangle(img, (x1, y1 + r), (x2, y2 - r), color, thickness)
    # Four corner circles
    cv2.circle(img, (x1 + r, y1 + r), r, color, thickness)
    cv2.circle(img, (x2 - r, y1 + r), r, color, thickness)
    cv2.circle(img, (x1 + r, y2 - r), r, color, thickness)
    cv2.circle(img, (x2 - r, y2 - r), r, color, thickness)


def generate_synthetic_test_image(
    reaction_bgr: tuple[int, int, int],
    kit_name: str = "Marquis",
    result_label: str = "positive",
) -> bytes:
    """Generate a realistic synthetic field test evidence photo.

    Creates a photorealistic-looking image with:
    - Textured surface background (simulated lab/field surface)
    - Reagent test kit with labeled components
    - Reaction well showing the test result color
    - ISO-standard 6-patch calibration reference card
    - Evidence metadata overlay (timestamp, case reference)
    """
    W, H = 1200, 900
    rng = np.random.default_rng(hash(reaction_bgr) % (2**31))

    # --- 1. Textured surface background (dark matte surface) ---
    base_b = rng.integers(35, 50)
    base_g = rng.integers(38, 52)
    base_r = rng.integers(40, 55)
    img = np.full((H, W, 3), [base_b, base_g, base_r], dtype=np.uint8)

    # Add subtle texture grain
    for ch in range(3):
        texture = rng.integers(-12, 12, (H, W), dtype=np.int16)
        img[:, :, ch] = np.clip(img[:, :, ch].astype(np.int16) + texture, 0, 255).astype(np.uint8)

    # Slight radial vignette for natural camera look
    Y, X = np.ogrid[:H, :W]
    cx, cy = W // 2, H // 2
    dist = np.sqrt((X - cx) ** 2 + (Y - cy) ** 2).astype(np.float32)
    max_dist = np.sqrt(cx**2 + cy**2)
    vignette = 1.0 - 0.25 * (dist / max_dist) ** 2
    for ch in range(3):
        img[:, :, ch] = np.clip(img[:, :, ch].astype(np.float32) * vignette, 0, 255).astype(np.uint8)

    # --- 2. Test Kit Body (left-center) ---
    kit_x, kit_y = 80, 120
    kit_w, kit_h = 420, 620

    # Kit shadow
    shadow = img.copy()
    cv2.rectangle(shadow, (kit_x + 8, kit_y + 8), (kit_x + kit_w + 8, kit_y + kit_h + 8), (15, 15, 15), -1)
    img = cv2.addWeighted(img, 0.7, shadow, 0.3, 0)

    # Kit body (white plastic casing)
    _draw_rounded_rect(img, (kit_x, kit_y), (kit_x + kit_w, kit_y + kit_h), (235, 235, 240), radius=16)
    # Inner border
    _draw_rounded_rect(img, (kit_x + 3, kit_y + 3), (kit_x + kit_w - 3, kit_y + kit_h - 3), (210, 210, 215), radius=14, thickness=2)

    # Kit header label area (dark strip at top)
    cv2.rectangle(img, (kit_x + 15, kit_y + 15), (kit_x + kit_w - 15, kit_y + 80), (45, 50, 60), -1)
    cv2.rectangle(img, (kit_x + 15, kit_y + 15), (kit_x + kit_w - 15, kit_y + 80), (30, 35, 42), 2)

    # Kit name text
    cv2.putText(img, f"{kit_name.upper()} REAGENT", (kit_x + 30, kit_y + 55),
                cv2.FONT_HERSHEY_SIMPLEX, 0.75, (220, 225, 230), 2, cv2.LINE_AA)

    # "FIELD TEST KIT" subtitle
    cv2.putText(img, "PRESUMPTIVE FIELD TEST KIT", (kit_x + 30, kit_y + 110),
                cv2.FONT_HERSHEY_SIMPLEX, 0.42, (100, 100, 110), 1, cv2.LINE_AA)

    # Dashed divider line
    for dx in range(kit_x + 30, kit_x + kit_w - 30, 12):
        cv2.line(img, (dx, kit_y + 125), (dx + 6, kit_y + 125), (180, 180, 185), 1)

    # "SAMPLE" label
    cv2.putText(img, "SAMPLE WELL", (kit_x + 140, kit_y + 158),
                cv2.FONT_HERSHEY_SIMPLEX, 0.38, (130, 130, 140), 1, cv2.LINE_AA)

    # --- Reaction well (main circular result zone) ---
    well_cx = kit_x + kit_w // 2
    well_cy = kit_y + 280
    well_r = 80

    # Well depression ring (outer shadow)
    cv2.circle(img, (well_cx, well_cy), well_r + 12, (180, 180, 185), -1)
    cv2.circle(img, (well_cx, well_cy), well_r + 8, (195, 195, 200), -1)

    # Reaction color fill with slight radial gradient
    well_mask = np.zeros((H, W), dtype=np.uint8)
    cv2.circle(well_mask, (well_cx, well_cy), well_r, 255, -1)

    # Base reaction color
    cv2.circle(img, (well_cx, well_cy), well_r, reaction_bgr, -1)

    # Add subtle color variation within the well for realism
    well_noise = rng.integers(-15, 15, (H, W, 3), dtype=np.int16)
    well_area = img.copy()
    well_area = np.clip(well_area.astype(np.int16) + well_noise, 0, 255).astype(np.uint8)
    img[well_mask > 0] = well_area[well_mask > 0]

    # Well rim
    cv2.circle(img, (well_cx, well_cy), well_r, (90, 90, 95), 2, cv2.LINE_AA)
    cv2.circle(img, (well_cx, well_cy), well_r + 8, (160, 160, 165), 1, cv2.LINE_AA)

    # Result indicator text below well
    result_color = (0, 180, 0) if result_label == "positive" else (0, 160, 220) if result_label == "negative" else (0, 180, 220)
    cv2.putText(img, f"RESULT: {result_label.upper()}", (kit_x + 100, kit_y + 400),
                cv2.FONT_HERSHEY_SIMPLEX, 0.55, result_color, 2, cv2.LINE_AA)

    # Kit lot/batch info
    cv2.putText(img, "LOT: FTC-2026-0842", (kit_x + 30, kit_y + 460),
                cv2.FONT_HERSHEY_SIMPLEX, 0.35, (140, 140, 150), 1, cv2.LINE_AA)
    cv2.putText(img, "EXP: 2027-06", (kit_x + 30, kit_y + 485),
                cv2.FONT_HERSHEY_SIMPLEX, 0.35, (140, 140, 150), 1, cv2.LINE_AA)

    # Second small indicator well (control)
    ctrl_cx = kit_x + kit_w // 2
    ctrl_cy = kit_y + 540
    cv2.putText(img, "CONTROL", (ctrl_cx - 40, ctrl_cy - 28),
                cv2.FONT_HERSHEY_SIMPLEX, 0.32, (130, 130, 140), 1, cv2.LINE_AA)
    cv2.circle(img, (ctrl_cx, ctrl_cy), 25, (190, 190, 195), -1)
    cv2.circle(img, (ctrl_cx, ctrl_cy), 25, (210, 220, 210), -1)  # slightly greenish = valid control
    cv2.circle(img, (ctrl_cx, ctrl_cy), 25, (100, 100, 105), 1, cv2.LINE_AA)

    # Serial barcode placeholder at bottom of kit
    for bx in range(kit_x + 60, kit_x + kit_w - 60, 4):
        bar_w = rng.integers(1, 3)
        bar_h = rng.integers(25, 40)
        cv2.rectangle(img, (bx, kit_y + kit_h - 55), (bx + bar_w, kit_y + kit_h - 55 + bar_h), (40, 40, 45), -1)

    # --- 3. Reference Calibration Card (right side) ---
    card_x, card_y = 580, 280
    card_w, card_h = 530, 340

    # Card shadow
    shadow2 = img.copy()
    cv2.rectangle(shadow2, (card_x + 6, card_y + 6), (card_x + card_w + 6, card_y + card_h + 6), (12, 12, 12), -1)
    img = cv2.addWeighted(img, 0.75, shadow2, 0.25, 0)

    # Card body (white matte)
    _draw_rounded_rect(img, (card_x, card_y), (card_x + card_w, card_y + card_h), (248, 248, 250), radius=8)
    cv2.rectangle(img, (card_x + 2, card_y + 2), (card_x + card_w - 2, card_y + card_h - 2), (200, 200, 205), 1)

    # Card title
    cv2.putText(img, "COLORIMETRIC CALIBRATION STANDARD", (card_x + 20, card_y + 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.42, (60, 60, 70), 1, cv2.LINE_AA)
    cv2.putText(img, "FTC Standard v1.0  |  ISO/CIE Compliant", (card_x + 20, card_y + 50),
                cv2.FONT_HERSHEY_SIMPLEX, 0.32, (120, 120, 130), 1, cv2.LINE_AA)

    # Divider
    cv2.line(img, (card_x + 20, card_y + 60), (card_x + card_w - 20, card_y + 60), (200, 200, 205), 1)

    # 6 color patches in 2x3 grid
    patch_colors_bgr = [
        ((255, 255, 255), "White"),
        ((118, 118, 118), "18% Gray"),
        ((0, 0, 200),     "Red"),
        ((0, 200, 0),     "Green"),
        ((200, 0, 0),     "Blue"),
        ((0, 0, 0),       "Black"),
    ]

    patch_w, patch_h = 140, 100
    gap = 18
    start_x = card_x + 30
    start_y = card_y + 75

    for i, (color, label) in enumerate(patch_colors_bgr):
        row = i // 3
        col = i % 3
        px = start_x + col * (patch_w + gap)
        py = start_y + row * (patch_h + gap + 18)

        # Patch with slight inset border
        cv2.rectangle(img, (px, py), (px + patch_w, py + patch_h), color, -1)
        cv2.rectangle(img, (px, py), (px + patch_w, py + patch_h), (80, 80, 85), 1)

        # Patch label below
        label_color = (80, 80, 90) if color != (0, 0, 0) else (80, 80, 90)
        cv2.putText(img, label, (px + 5, py + patch_h + 14),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.30, label_color, 1, cv2.LINE_AA)

    # Card serial
    cv2.putText(img, "SN: CAL-2026-00147", (card_x + card_w - 180, card_y + card_h - 15),
                cv2.FONT_HERSHEY_SIMPLEX, 0.30, (150, 150, 160), 1, cv2.LINE_AA)

    # --- 4. Evidence metadata stamp (top-right corner) ---
    stamp_y = 30
    cv2.rectangle(img, (W - 420, stamp_y), (W - 20, stamp_y + 95), (20, 22, 25), -1)
    cv2.rectangle(img, (W - 420, stamp_y), (W - 20, stamp_y + 95), (0, 140, 100), 1)

    cv2.putText(img, "DIGITAL EVIDENCE RECORD", (W - 405, stamp_y + 22),
                cv2.FONT_HERSHEY_SIMPLEX, 0.40, (0, 200, 150), 1, cv2.LINE_AA)
    timestamp_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    cv2.putText(img, f"CAPTURED: {timestamp_str}", (W - 405, stamp_y + 45),
                cv2.FONT_HERSHEY_SIMPLEX, 0.33, (180, 185, 190), 1, cv2.LINE_AA)
    cv2.putText(img, f"REAGENT: {kit_name.upper()}  |  SHA-256 SECURED", (W - 405, stamp_y + 65),
                cv2.FONT_HERSHEY_SIMPLEX, 0.33, (140, 145, 150), 1, cv2.LINE_AA)
    cv2.putText(img, "INTEGRITY: HMAC-SHA256 SIGNED", (W - 405, stamp_y + 85),
                cv2.FONT_HERSHEY_SIMPLEX, 0.33, (0, 160, 120), 1, cv2.LINE_AA)

    # --- 5. Scale ruler (bottom edge) ---
    ruler_y = H - 45
    cv2.rectangle(img, (80, ruler_y), (480, ruler_y + 25), (240, 240, 245), -1)
    for cm in range(0, 21):
        rx = 80 + cm * 20
        tick_h = 18 if cm % 5 == 0 else 10
        cv2.line(img, (rx, ruler_y), (rx, ruler_y + tick_h), (30, 30, 35), 1)
        if cm % 5 == 0:
            cv2.putText(img, f"{cm}", (rx - 4, ruler_y + 23),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.28, (50, 50, 55), 1, cv2.LINE_AA)
    cv2.putText(img, "cm", (485, ruler_y + 18), cv2.FONT_HERSHEY_SIMPLEX, 0.30, (100, 100, 110), 1, cv2.LINE_AA)

    # --- 6. Crosshair markers (forensic alignment) ---
    for mx, my in [(60, 110), (W - 60, 110), (60, H - 60), (W - 60, H - 60)]:
        cv2.line(img, (mx - 12, my), (mx + 12, my), (0, 180, 130), 1, cv2.LINE_AA)
        cv2.line(img, (mx, my - 12), (mx, my + 12), (0, 180, 130), 1, cv2.LINE_AA)
        cv2.circle(img, (mx, my), 6, (0, 180, 130), 1, cv2.LINE_AA)

    # Final subtle noise pass
    img = _add_noise(img, intensity=5)

    _, encoded = cv2.imencode(".jpg", img, [int(cv2.IMWRITE_JPEG_QUALITY), 94])
    return encoded.tobytes()


def seed() -> None:
    init_db()
    ensure_upload_dir()
    db = SessionLocal()

    try:
        # Seed Operators
        op1 = db.query(Operator).filter(Operator.badge_id == "OFF-001").first()
        if not op1:
            op1 = Operator(
                badge_id="OFF-001",
                name="Officer R. Sharma",
                role="officer",
                password_hash=hash_password("demo123"),
            )
            db.add(op1)

        op2 = db.query(Operator).filter(Operator.badge_id == "OFF-002").first()
        if not op2:
            op2 = Operator(
                badge_id="OFF-002",
                name="Inspector A. Verma",
                role="supervisor",
                password_hash=hash_password("demo123"),
            )
            db.add(op2)
        db.commit()

        # Refresh operators
        op1 = db.query(Operator).filter(Operator.badge_id == "OFF-001").first()
        op2 = db.query(Operator).filter(Operator.badge_id == "OFF-002").first()

        # Seed Forensic Kit Types
        kits_data = [
            {
                "name": "Marquis",
                "description": "General screening reagent. Deep purple/violet indicates presence of opioids, MDMA, or amphetamines.",
                "positive_lab": json.dumps({"L": 35, "a": 145, "b": 120}),
                "negative_lab": json.dumps({"L": 165, "a": 145, "b": 155}),
                "inconclusive_lab": json.dumps({"L": 100, "a": 128, "b": 128}),
                "confidence_threshold": 0.55,
            },
            {
                "name": "Mecke",
                "description": "Opiate-specific reagent. Blue-green shift indicates heroin, morphine, or codeine.",
                "positive_lab": json.dumps({"L": 45, "a": 95, "b": 85}),
                "negative_lab": json.dumps({"L": 170, "a": 140, "b": 160}),
                "inconclusive_lab": json.dumps({"L": 110, "a": 128, "b": 128}),
                "confidence_threshold": 0.55,
            },
            {
                "name": "Scott Reagent",
                "description": "Field test for Cocaine HCl and freebase. Turns intense cobalt blue upon reaction.",
                "positive_lab": json.dumps({"L": 42, "a": 108, "b": 80}),
                "negative_lab": json.dumps({"L": 180, "a": 130, "b": 135}),
                "inconclusive_lab": json.dumps({"L": 115, "a": 128, "b": 128}),
                "confidence_threshold": 0.60,
            },
            {
                "name": "Mandelin",
                "description": "Screening reagent for Ketamine and Methamphetamine. Produces characteristic dark green/blue-grey.",
                "positive_lab": json.dumps({"L": 40, "a": 115, "b": 110}),
                "negative_lab": json.dumps({"L": 175, "a": 138, "b": 150}),
                "inconclusive_lab": json.dumps({"L": 105, "a": 128, "b": 128}),
                "confidence_threshold": 0.55,
            },
            {
                "name": "Duquenois-Levine",
                "description": "Rapid presumptive reagent for Cannabis / THC resin. Violet extraction in organic chloroform layer.",
                "positive_lab": json.dumps({"L": 38, "a": 150, "b": 112}),
                "negative_lab": json.dumps({"L": 185, "a": 125, "b": 130}),
                "inconclusive_lab": json.dumps({"L": 112, "a": 128, "b": 128}),
                "confidence_threshold": 0.58,
            },
        ]

        for kd in kits_data:
            existing = db.query(KitType).filter(KitType.name == kd["name"]).first()
            if not existing:
                db.add(KitType(**kd))
        db.commit()

        # Seed Realistic Field Records if count is low
        if db.query(TestRecord).count() < 5:
            now = datetime.now(timezone.utc)
            marquis_kit = db.query(KitType).filter(KitType.name == "Marquis").first()
            mecke_kit = db.query(KitType).filter(KitType.name == "Mecke").first()
            scott_kit = db.query(KitType).filter(KitType.name == "Scott Reagent").first()
            mandelin_kit = db.query(KitType).filter(KitType.name == "Mandelin").first()
            duq_kit = db.query(KitType).filter(KitType.name == "Duquenois-Levine").first()

            records_to_seed = [
                {
                    "operator": op1,
                    "kit": marquis_kit,
                    "result": "positive",
                    "confidence": 0.94,
                    "lat": 28.5562,
                    "lon": 77.1000,
                    "accuracy": 4.2,
                    "hours_ago": 1,
                    "notes": "Checkpoint Seizure: Suspected crystalline substance intercepted at IGI Cargo Terminal 3.",
                    "reaction_bgr": (128, 0, 128),  # purple
                    "swatch_rgb": [128, 0, 128],
                },
                {
                    "operator": op1,
                    "kit": scott_kit,
                    "result": "positive",
                    "confidence": 0.91,
                    "lat": 19.0760,
                    "lon": 72.8777,
                    "accuracy": 3.8,
                    "hours_ago": 3,
                    "notes": "Intercept at Nhava Sheva Container Port gate 2. Compact white powder packet.",
                    "reaction_bgr": (200, 50, 0),  # cobalt blue
                    "swatch_rgb": [0, 50, 200],
                },
                {
                    "operator": op2,
                    "kit": mecke_kit,
                    "result": "negative",
                    "confidence": 0.88,
                    "lat": 12.9716,
                    "lon": 77.5946,
                    "accuracy": 5.1,
                    "hours_ago": 6,
                    "notes": "Routine highway toll plaza screening. No characteristic discoloration.",
                    "reaction_bgr": (0, 140, 220),  # yellow-orange
                    "swatch_rgb": [220, 140, 0],
                },
                {
                    "operator": op1,
                    "kit": mandelin_kit,
                    "result": "positive",
                    "confidence": 0.87,
                    "lat": 13.0827,
                    "lon": 80.2707,
                    "accuracy": 4.0,
                    "hours_ago": 14,
                    "notes": "Harbour terminal express courier inspection. Green shift observed within 20s.",
                    "reaction_bgr": (50, 150, 20),  # dark green
                    "swatch_rgb": [20, 150, 50],
                },
                {
                    "operator": op2,
                    "kit": duq_kit,
                    "result": "positive",
                    "confidence": 0.96,
                    "lat": 22.5726,
                    "lon": 88.3639,
                    "accuracy": 6.0,
                    "hours_ago": 22,
                    "notes": "Railway parcel scanner flag. Chloroform layer turned deep violet.",
                    "reaction_bgr": (140, 20, 110),
                    "swatch_rgb": [110, 20, 140],
                },
            ]

            for item in records_to_seed:
                img_bytes = generate_synthetic_test_image(
                    item["reaction_bgr"],
                    kit_name=item["kit"].name,
                    result_label=item["result"],
                )
                img_path = save_image(img_bytes, ".jpg")
                img_hash = sha256_bytes(img_bytes)
                cap_time = now - timedelta(hours=item["hours_ago"])

                details = {
                    "reference_card_detected": True,
                    "method": "rule_based_lab",
                    "corrected_swatch_rgb": item["swatch_rgb"],
                    "confidence_metric": item["confidence"],
                }

                rec = TestRecord(
                    operator_id=item["operator"].id,
                    kit_type_id=item["kit"].id,
                    result=item["result"],
                    confidence=item["confidence"],
                    captured_at=cap_time,
                    device_captured_at=cap_time,
                    latitude=item["lat"],
                    longitude=item["lon"],
                    location_accuracy_m=item["accuracy"],
                    location_source="gps_hardware",
                    location_verified=True,
                    image_path=img_path,
                    image_hash=img_hash,
                    record_hash="",
                    signature="",
                    classification_details=json.dumps(details),
                    notes=item["notes"],
                )
                db.add(rec)
                db.flush()

                payload = build_record_payload(
                    record_id=rec.id,
                    operator_id=rec.operator_id,
                    kit_type_id=rec.kit_type_id,
                    result=rec.result,
                    captured_at=rec.captured_at,
                    latitude=rec.latitude,
                    longitude=rec.longitude,
                    image_hash=rec.image_hash,
                    location_source=rec.location_source,
                    location_verified=rec.location_verified,
                    location_accuracy_m=rec.location_accuracy_m,
                )
                rec.record_hash = compute_record_hash(payload)
                rec.signature = sign_record(rec.record_hash)

            db.commit()
            print("Seeded realistic field records.")

        print("Database seed verified successfully.")
        print("Credentials: OFF-001 (Officer), OFF-002 (Supervisor)")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
