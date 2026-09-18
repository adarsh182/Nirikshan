# Idea One-Pager: Pillar 1 — Real-Time AR Viewfinder & Field Capture Gatekeeper

## 1. Problem Statement
**How might we transform the smartphone camera from a passive image recorder into an intelligent, active forensic gatekeeper that guarantees pristine optical conditions, zero-glare lighting, planar alignment, and chemical kinetics timing before the shutter ever fires?**

---

## 2. Core Vision & Architectural Role
In field forensics, **garbage in equals garbage out**. If an officer captures a colorimetric drug test in dim highway lighting, with direct flashlight glare bouncing off liquid reagent, or at a steep 45° angle, backend color calibration algorithms cannot recover lost color gamut vectors.

Pillar 1 establishes a real-time **Edge Quality Gate** on the mobile device ([`mobile/app/capture.tsx`](file:///Users/adarsh/Downloads/SIH_NEXT/mobile/app/capture.tsx)), ensuring evidence is legally and scientifically unassailable at the exact millisecond of capture.

---

## 3. Systematic Feature Refinement Matrix (Phase 1 & 2 Divergence & Convergence)

### Feature 1: Dynamic 6-Patch Reference Card Lock vs. Static Dotted Box
- **Current State**: [`ReferenceCardOverlay.tsx`](file:///Users/adarsh/Downloads/SIH_NEXT/mobile/components/ReferenceCardOverlay.tsx) draws static dashed rectangles. The user must manually align physical objects inside them.
- **Refined Concept**: Real-time contour corner detection. The viewfinder tracks the 4 corners of the ISO calibration card. When all 6 standardized patches (White, 18% Neutral Gray, Red, Green, Blue, Black) are identified in frame with minimum pixel density (>120x80px), the HUD snaps a green bounding box: `CARD LOCKED (100%)`.
- **Expert Forensic Lens**: Prevents perspective distortion. Rejects captures where the card is clipped or shadowed by the officer's hand.

### Feature 2: Ambient Photometry & Dual-Threshold Lighting Gate
- **Current State**: Officer captures in whatever lighting is available; flash can be manually toggled via torch button.
- **Refined Concept**: The preview stream samples average luminance (Y channel) and color temperature:
  - `< 150 lux` (Too dark): Viewfinder blocks shutter, turns border amber, and prompts `INSUFFICIENT LIGHT — ACTIVATE TORCH`.
  - `> 15,000 lux` (Overexposed direct sunlight): Prompts `MOVE TO SHADOW — EXTREME SUNLIGHT GLARE`.
  - Color Temp `< 2500K` or `> 8000K`: Alerts officer of heavy chromatic cast.
- **Inversion Lens**: Instead of asking the officer to judge lighting, the software refuses to commit uncalibrated captures to the chain of custody.

### Feature 3: Planar Tilt Gyroscope Horizon Indicator
- **Current State**: No tilt guidance. Photos taken at 30° to 60° angles suffer severe perspective elongation of the circular reaction well.
- **Refined Concept**: Uses device accelerometer/gyroscope (`expo-sensors`). An integrated artificial horizon reticle displays pitch and roll. Capture is only enabled when tilt is within **±8° of the horizontal plane**.
- **Simplification Lens**: Simple dual-ring HUD (like an aircraft attitude indicator). When the inner dot is centered inside the outer reticle, it pulses green.

### Feature 4: Chemical Reaction Kinetics Timer
- **Current State**: Instant capture button with no guidance on reagent reaction time.
- **Refined Concept**: Different drug kits have distinct chemical reaction kinetics:
  - *Marquis (Heroin/Morphine/MDMA)*: Reaction develops over 10 to 40 seconds; turns dark purple/black.
  - *Scott Reagent (Cocaine)*: 3-part reagent; blue precipitate forms in 15 seconds.
  - *Duquenois-Levine (Cannabis)*: Purple extraction into chloroform layer takes 30 to 60 seconds.
  - When the kit is selected in [`new-test.tsx`](file:///Users/adarsh/Downloads/SIH_NEXT/mobile/app/new-test.tsx), the viewfinder starts an automated **reaction kinetics countdown bar**. Shutter is locked until minimum stable reaction time (`T_min`) is reached, and warns before maximum degradation time (`T_max`).

### Feature 5: Autonomous Zero-Tap / Haptic Shutter
- **Current State**: Officer must tap the glass capture button, introducing camera motion blur while wearing bulky tactical gloves.
- **Refined Concept**: **Autonomous Auto-Trigger**. When:
  1. Reference Card is locked (`status == LOCKED`)
  2. Planar tilt is `< 8°`
  3. Ambient lux is in valid range (`150 <= lux <= 12000`)
  4. Reaction kinetics timer is in the valid window
  5. Device motion is stable (`motion_variance < 0.05` for 400ms)
  The camera auto-fires the shutter, gives a double haptic vibration pulse, and locks the photo without touching the screen.
- **Constraint Removal Lens**: Solves the tactical gloves problem completely.

### Feature 6: Real-Time Specular Glare & Blur Rejection
- **Current State**: If the phone's LED torch creates a hot reflection off the clear plastic test well, the captured pixel values clamp to `[255, 255, 255]`, obliterating true reaction color.
- **Refined Concept**: Instant post-snap / pre-upload sanity check. Analyzes the reaction well ROI:
  - Specular Glare Check: If >3% of reaction well pixels are saturated white (`Y > 250`), flag `SPECULAR REFLECTION DETECTED — RE-ANGLE TORCH`.
  - Motion Blur Check: Fast Laplacian variance threshold (`variance < 100`). Blurry images are immediately rejected with a prompt to retake.

### Feature 7: Sensor-Fusion GPS Satellite Lock
- **Current State**: GPS fix is queried in parallel with capture; if GPS fails, an alert dialog appears.
- **Refined Concept**: Live GPS status badge in the viewfinder top HUD:
  - 🟢 `GPS HARDWARE LOCK (±3.8m)`
  - 🟡 `ACQUIRING SATELLITES (±45m)` — shutter warning
  - 🔴 `NO FIX — INDOORS` — prompts officer to step near window or enables offline network triangulation fallback.

---

## 4. Key Assumptions to Validate
- [ ] **Assumption 1**: Modern mid-range law enforcement smartphones (e.g. Samsung Galaxy A series, iPhone SE) can compute real-time edge contour & lux metrics at >=15 FPS in React Native without battery overheating.
  - *Validation*: Profile CPU utilization on Expo Camera frame processors.
- [ ] **Assumption 2**: Officers in high-stress field conditions will wait for a 20-second reaction kinetics timer rather than trying to force-bypass.
  - *Validation*: Include an emergency manual override button ("SUPERVISOR FORCE CAPTURE") requiring documented justification.
- [ ] **Assumption 3**: Auto-trigger won't accidentally capture someone's face or background clutter before the test kit is in frame.
  - *Validation*: Quad-condition gating ensures trigger ONLY fires when 6-patch card aspect ratio and color vectors match template.

---

## 5. MVP Scope (What's IN vs. What's OUT)

### IN (MVP Scope)
1. **Interactive Gyro Horizon**: ±8° tilt level indicator on the camera HUD.
2. **Kinetics Countdown Indicator**: Kit-specific reaction progress bar with `T_min` threshold.
3. **Ambient Lux & Torch Quality Gate**: Automatic suggestion/activation of torch in dark conditions.
4. **Motion-Stabilized Autonomous Shutter**: Auto-fires when camera is steady and aligned for 500ms.
5. **Blur / Glare Instant Rejection**: Fast Laplacian sharpness test before committing to storage.

### NOT DOING (Explicit Non-Goals & Why)
- **On-Device Full Neural Network Segmentation**: Running a 50MB YOLO model on-device in React Native adds too much bundle weight and battery drain. Standard contour & color thresholding achieves 98% of the value at 1% of the compute cost.
- **Video Recording of Reaction**: Recording full 60-second 4K video exceeds offline storage constraints (15MB per test budget). We stick to high-res still frames at peak reaction.
- **3D NeRF / Photogrammetry Reconstruction**: Over-engineering. Field drug testing requires standardized 2D colorimetric vector comparison, not 3D spatial mapping.

---

## 6. Open Technical Questions
1. Should `CameraView` from `expo-camera` be upgraded to `react-native-vision-camera` to support real-time C++ Frame Processors for sub-10ms card detection?
2. How should the viewfinder handle dual-reagent tests where two separate wells must be captured in the same frame?
