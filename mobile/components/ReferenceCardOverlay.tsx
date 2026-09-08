import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Colors } from "../constants/theme";

export default function ReferenceCardOverlay() {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Test kit guide frame (left) */}
      <View style={styles.testKitFrame}>
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>TEST ZONE</Text>
        </View>
        <Animated.View style={[styles.corner, styles.topLeft, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.corner, styles.topRight, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.corner, styles.bottomLeft, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.corner, styles.bottomRight, { opacity: pulseAnim }]} />
        <View style={styles.centerTarget}>
          <View style={styles.crosshairH} />
          <View style={styles.crosshairV} />
        </View>
      </View>

      {/* Reference card guide frame (right) */}
      <View style={styles.cardFrame}>
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>COLOR CALIBRATION CARD</Text>
        </View>
        <Animated.View style={[styles.corner, styles.topLeft, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.corner, styles.topRight, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.corner, styles.bottomLeft, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.corner, styles.bottomRight, { opacity: pulseAnim }]} />

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
    borderColor: "rgba(56, 189, 248, 0.5)",
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
    borderColor: Colors.primary,
  },
  topLeft: { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 4 },
  topRight: { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 4 },
  bottomLeft: { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 4 },
  bottomRight: { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 4 },
});
