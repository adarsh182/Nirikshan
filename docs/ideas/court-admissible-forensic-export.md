# Idea One-Pager: Court-Admissible Forensic Certificate Export

## Problem Statement
How might we transform raw digital presumptive test logs into an indisputable, court-admissible forensic evidence package that prosecutors, defense attorneys, and judges can independently verify without needing direct access to the Nirikshan application database?

---

## Recommended Direction: Cryptographically Sealed PDF/A Package
Generate a standardized PDF/A-1b document containing:
1. **Officer & Kit Attribution**: Badge ID, Officer Name, Jurisdiction, Kit Lot Number, Expiration.
2. **Geographic & Environmental Context**: Reverse-geocoded address, GPS coordinates, accuracy circle, network attribution.
3. **Forensic Imagery**: The raw captured reaction image side-by-side with the reference-card calibrated swatch.
4. **Colorimetric LAB Analysis**: Distance vectors from known positive/negative standards, confidence scores, and rule vs ML classification notes.
5. **Cryptographic Sealing Box**:
   - Primary Image SHA-256 Hash.
   - Canonical Record SHA-256 Hash.
   - HMAC-SHA256 Digital Signature.
   - **Offline Verification QR Code**: Encodes a signed JWT verification URL (`https://.../tests/{id}/verify`) allowing any mobile phone camera or court scanner to verify authenticity in real-time.

---

## Key Assumptions & Stress Testing
- **Assumption 1**: Courtrooms have intermittent or no internet access.
  - *Mitigation*: The QR code payload contains the full canonical hash and signature, allowing offline public-key validation via standard command-line tools (`openssl dgst -sha256 -verify`).
- **Assumption 2**: Defense counsel will challenge color accuracy under non-standard ambient lighting.
  - *Mitigation*: The certificate details the Gray-Patch 18% calibration correction algorithm applied to the reaction well.

---

## MVP Scope
- Endpoint: `GET /api/tests/{id}/export-pdf`
- Generates high-resolution single-page forensic evidence summary.
- Embedded SHA-256 visual barcode / QR link.
- "Export Evidence Certificate" button on Web Dashboard `TestDetail` view.

---

## What We Are NOT Doing (Explicit Non-Goals)
- We are NOT claiming this replaces confirmatory gas chromatography-mass spectrometry (GC-MS) laboratory testing.
- We are NOT storing officer personal contact information on the public document.
