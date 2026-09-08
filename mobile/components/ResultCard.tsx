import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius, Spacing } from "../constants/theme";

interface ResultCardProps {
  result: "positive" | "negative" | "inconclusive";
  confidence: number;
  swatchRgb?: number[];
  kitName?: string | null;
}

export default function ResultCard({
  result,
  confidence,
  swatchRgb,
  kitName,
}: ResultCardProps) {
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const config = {
    positive: {
      title: "PRESUMPTIVE POSITIVE",
      color: Colors.positive,
      bg: Colors.positiveLight,
      border: Colors.positiveBorder,
      icon: "warning" as const,
      description: "Reaction indicates probable presence of target substance.",
    },
    negative: {
      title: "PRESUMPTIVE NEGATIVE",
      color: Colors.negative,
      bg: Colors.negativeLight,
      border: Colors.negativeBorder,
      icon: "checkmark-circle" as const,
      description: "No characteristic reaction detected for target substance.",
    },
    inconclusive: {
      title: "INCONCLUSIVE",
      color: Colors.inconclusive,
      bg: Colors.inconclusiveLight,
      border: Colors.inconclusiveBorder,
      icon: "help-circle" as const,
      description: "Color separation below threshold. Confirm with secondary kit.",
    },
  }[result];

  const swatchColor = swatchRgb
    ? `rgb(${swatchRgb[0]}, ${swatchRgb[1]}, ${swatchRgb[2]})`
    : null;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          borderColor: config.border,
          backgroundColor: config.bg,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconCircle, { backgroundColor: config.border }]}>
          <Ionicons name={config.icon} size={24} color={config.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.resultTitle, { color: config.color }]}>
            {config.title}
          </Text>
          {kitName && <Text style={styles.kitSubtitle}>{kitName}</Text>}
        </View>
      </View>

      <Text style={styles.description}>{config.description}</Text>

      {/* Confidence Section */}
      <View style={styles.confidenceContainer}>
        <View style={styles.confidenceHeader}>
          <Text style={styles.confidenceLabel}>Reference Color-Match Confidence</Text>
          <Text style={[styles.confidenceValue, { color: config.color }]}>
            {(confidence * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(100, Math.max(10, confidence * 100))}%`,
                backgroundColor: config.color,
              },
            ]}
          />
        </View>
      </View>

      {/* Detected Reaction Swatch */}
      {swatchColor && (
        <View style={styles.swatchRow}>
          <View style={[styles.swatchBox, { backgroundColor: swatchColor }]} />
          <View style={styles.swatchDetails}>
            <Text style={styles.swatchLabel}>Calibrated Color Sample</Text>
            <Text style={styles.swatchRgb}>
              RGB: {swatchRgb?.[0]}, {swatchRgb?.[1]}, {swatchRgb?.[2]}
            </Text>
          </View>
        </View>
      )}

      {/* Legal disclaimer */}
      <View style={styles.disclaimerContainer}>
        <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
        <Text style={styles.disclaimerText}>
          Presumptive screening result — confirmatory laboratory analysis required.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  kitSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  confidenceContainer: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    padding: Spacing.sm + 4,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  confidenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  confidenceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  swatchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    padding: Spacing.sm + 4,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  swatchBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: "#fff",
    marginRight: Spacing.md,
  },
  swatchDetails: {
    flex: 1,
  },
  swatchLabel: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "600",
  },
  swatchRgb: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "monospace",
    marginTop: 2,
  },
  disclaimerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    paddingTop: Spacing.sm,
  },
  disclaimerText: {
    fontSize: 11,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 14,
  },
});
