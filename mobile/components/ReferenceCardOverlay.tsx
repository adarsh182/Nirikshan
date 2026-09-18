import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Image, Easing, AccessibilityInfo } from "react-native";
import { Colors, Motion } from "../constants/theme";

interface ReferenceCardOverlayProps {
  cardLocked?: boolean;
  isLevel?: boolean;
  reactionTimeLeft?: number | null;
  lightingStatus?: "optimal" | "low" | "glare";
}

export default function ReferenceCardOverlay({
  cardLocked = false,
  isLevel = true,
  reactionTimeLeft = null,
  lightingStatus = "optimal",
}: ReferenceCardOverlayProps) {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (reduceMotion) {
        pulseAnim.setValue(0.85);
        return;
      }

      // Sinusoidal easing for authentic optical reticle breathing
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: Motion.duration.ambient,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: Motion.duration.ambient,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
    });

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [pulseAnim]);

  const cornerColor = cardLocked ? "#10b981" : Colors.primary;
  const cardBorderColor = cardLocked ? "rgba(16, 185, 129, 0.8)" : "rgba(56, 189, 248, 0.5)";

  return (
    <View style={styles.container} pointerEvents="none">
      {/* High-Resolution Tactical HUD Vector Asset */}
      <Image
        source={require("../assets/hud_viewfinder_overlay.png")}
        style={styles.hudBackdrop}
        resizeMode="cover"
      />

      {/* Top Quality Gate Status Banner */}
      <View style={styles.qualityGateContainer}>
        {reactionTimeLeft !== null && reactionTimeLeft > 0 ? (
          <View style={[styles.statusPill, styles.pillAmber]}>
            <Text style={styles.statusPillText}>
              REACTION KINETICS: {reactionTimeLeft}s
            </Text>
          </View>
        ) : cardLocked ? (
          <View style={[styles.statusPill, styles.pillGreen]}>
            <Text style={styles.statusPillText}>✓ CALIBRATION LOCKED</Text>
          </View>
        ) : (
          <View style={[styles.statusPill, styles.pillNeutral]}>
            <Text style={styles.statusPillText}>ALIGN SPECIMEN & CARD</Text>
          </View>
        )}

        {lightingStatus === "low" && (
          <View style={[styles.statusPill, styles.pillWarning]}>
            <Text style={styles.statusPillText}>LOW LIGHT — USE TORCH</Text>
          </View>
        )}
      </View>

      {/* Artificial Horizon Gyro Reticle */}
      <View style={styles.horizonContainer}>
        <View
          style={[
            styles.horizonCircle,
            isLevel ? styles.horizonLevel : styles.horizonTilted,
          ]}
        >
          <View
            style={[
              styles.horizonDot,
              isLevel ? styles.horizonDotLevel : styles.horizonDotTilted,
            ]}
          />
        </View>
        <Text style={[styles.horizonLabel, isLevel ? styles.textGreen : styles.textAmber]}>
          {isLevel ? "PLANAR LEVEL ±0°" : "TILT HORIZONTAL"}
        </Text>
      </View>

      {/* Test kit guide frame (left) */}
      <View style={styles.testKitFrame}>
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>TEST ZONE</Text>
        </View>
        <Animated.View style={[styles.corner, styles.topLeft, { borderColor: cornerColor, opacity: pulseAnim }]} />
        <Animated.View style={[styles.corner, styles.topRight, { borderColor: cornerColor, opacity: pulseAnim }]} />
        <Animated.View style={[styles.corner, styles.bottomLeft, { borderColor: cornerColor, opacity: pulseAnim }]} />
        <Animated.View style={[styles.corner, styles.bottomRight, { borderColor: cornerColor, opacity: pulseAnim }]} />
        <View style={styles.centerTarget}>
          <View style={styles.crosshairH} />
          <View style={styles.crosshairV} />
        </View>
      </View>

      {/* Reference card guide frame (right) */}
      <View style={[styles.cardFrame, { borderColor: cardBorderColor }]}>
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>
            {cardLocked ? "CARD 100% LOCKED" : "COLOR CALIBRATION CARD"}
          </Text>
        </View>
        <Animated.View style={[styles.corner, styles.topLeft, { borderColor: cornerColor, opacity: pulseAnim }]} />
        <Animated.View style={[styles.corner, styles.topRight, { borderColor: cornerColor, opacity: pulseAnim }]} />
        <Animated.View style={[styles.corner, styles.bottomLeft, { borderColor: cornerColor, opacity: pulseAnim }]} />
        <Animated.View style={[styles.corner, styles.bottomRight, { borderColor: cornerColor, opacity: pulseAnim }]} />

        <View style={styles.patchRow}>
          <View style={[styles.patch, { backgroundColor: "#ffffff" }]}>
            <Text style={styles.patchLabel}>W</Text>
          </View>
          <View style={[styles.patch, { backgroundColor: "#767676" }]}>
            <Text style={styles.patchLabel}>G</Text>
          </View>
          <View style={[styles.patch, { backgroundColor: "#ef4444" }]}>
            <Text style={styles.patchLabel}>R</Text>
          </View>
        </View>
        <View style={styles.patchRow}>
          <View style={[styles.patch, { backgroundColor: "#22c55e" }]}>
            <Text style={styles.patchLabel}>G</Text>
          </View>
          <View style={[styles.patch, { backgroundColor: "#3b82f6" }]}>
            <Text style={styles.patchLabel}>B</Text>
          </View>
          <View style={[styles.patch, { backgroundColor: "#000000", borderColor: "#475569", borderWidth: 1 }]}>
            <Text style={[styles.patchLabel, { color: "#94a3b8" }]}>K</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
  },
  hudBackdrop: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.85,
  },
  qualityGateContainer: {
    position: "absolute",
    top: 90,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 6,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    fontFamily: "System",
  },
  pillGreen: {
    backgroundColor: "rgba(6, 78, 59, 0.9)",
    borderColor: "rgba(52, 211, 153, 0.6)",
  },
  pillAmber: {
    backgroundColor: "rgba(120, 53, 15, 0.9)",
    borderColor: "rgba(251, 191, 36, 0.6)",
  },
  pillWarning: {
    backgroundColor: "rgba(127, 29, 29, 0.9)",
    borderColor: "rgba(248, 113, 113, 0.6)",
  },
  pillNeutral: {
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderColor: "rgba(148, 163, 184, 0.3)",
  },
  horizonContainer: {
    position: "absolute",
    top: 140,
    alignSelf: "center",
    alignItems: "center",
  },
  horizonCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  horizonLevel: {
    borderColor: "rgba(52, 211, 153, 0.8)",
  },
  horizonTilted: {
    borderColor: "rgba(251, 191, 36, 0.8)",
  },
  horizonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  horizonDotLevel: {
    backgroundColor: "#10b981",
  },
  horizonDotTilted: {
    backgroundColor: "#f59e0b",
  },
  horizonLabel: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  textGreen: {
    color: "#34d399",
  },
  textAmber: {
    color: "#fbbf24",
  },
  testKitFrame: {
    position: "absolute",
    left: "6%",
    top: "32%",
    width: "40%",
    height: "28%",
    borderColor: "rgba(52, 211, 153, 0.4)",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 8,
    backgroundColor: "rgba(16, 185, 129, 0.04)",
  },
  cardFrame: {
    position: "absolute",
    right: "6%",
    bottom: "22%",
    width: "44%",
    height: "22%",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 8,
    backgroundColor: "rgba(56, 189, 248, 0.04)",
    padding: 6,
    justifyContent: "center",
    gap: 4,
  },
  labelContainer: {
    position: "absolute",
    top: -20,
    left: 4,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  labelText: {
    color: Colors.primaryLight,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  patchRow: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
  },
  patch: {
    flex: 1,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  patchLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "rgba(0,0,0,0.5)",
  },
  centerTarget: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  crosshairH: {
    position: "absolute",
    width: 20,
    height: 1,
    backgroundColor: "rgba(52, 211, 153, 0.4)",
  },
  crosshairV: {
    position: "absolute",
    width: 1,
    height: 20,
    backgroundColor: "rgba(52, 211, 153, 0.4)",
  },
  corner: {
    position: "absolute",
    width: 16,
    height: 16,
  },
  topLeft: { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 4 },
  topRight: { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 4 },
  bottomLeft: { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 4 },
  bottomRight: { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 4 },
});
