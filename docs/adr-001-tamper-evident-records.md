# ADR 001: Tamper-Evident Records & Dual-Layer Cryptographic Verification

## Status
Accepted

## Context
Nirikshan (निरीक्षण) serves as a digital companion for field narcotics officers executing presumptive colorimetric field drug tests (e.g., Marquis, Mecke). In forensic law and court proceedings, digital evidence is vulnerable to allegations of:
1. **Image alteration**: Splicing, adjusting contrast, or modifying reaction color hues.
2. **Metadata tampering**: Modifying timestamps, location coordinates, operator identity, or test classification.
3. **Repudiation**: Denying that an officer performed a specific test at the recorded location.

## Decision
We implement a dual-layer cryptographic integrity architecture:

### 1. Image Content Immutability
- Upon receiving the test photo, compute `SHA-256(image_bytes)` before writing to disk.
- Store `image_hash` immutably on the `TestRecord`.
- Verification recalculates `SHA-256` of the stored file to confirm bitwise parity.

### 2. Canonical Payload & HMAC-SHA256 Signing
- Construct a canonical payload containing the immutable record fields:
  ```json
  {
    "id": "...",
    "operator_id": "...",
    "kit_type_id": "...",
    "result": "...",
    "captured_at": "...",
    "latitude": 19.076,
    "longitude": 72.877,
    "image_hash": "...",
    "location_source": "...",
    "location_verified": true,
    "location_accuracy_m": 12.5
  }
  ```
- Serialize with deterministic sorting (`sort_keys=True`, `separators=(',', ':')`).
- Compute `record_hash = SHA256(canonical_json)`.
- Sign with `HMAC-SHA256(record_hash, signing_secret)`.

### 3. Verification Protocol (`GET /tests/{id}/verify`)
The verification endpoint performs three independent checks:
1. `image_hash_match`: Stored file hash matches `record.image_hash`.
2. `record_hash_match`: Canonical payload recomputation matches `record.record_hash`.
3. `signature_valid`: HMAC verification using constant-time comparison (`hmac.compare_digest`).

## Consequences
- **Positive**: Any modification to the image file, GPS coordinates, test result, or timestamp is immediately flagged as invalid.
- **Positive**: Zero external cloud dependency for verification; can run in disconnected, on-premise, or courtroom environments.
- **Maintenance**: Schema changes affecting canonical payload fields require versioned hashing protocols.
