import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius, Spacing } from "../constants/theme";
import type { TestRecord } from "../types";

interface TestHistoryCardProps {
  test: TestRecord;
  onPress: () => void;
}

export default function TestHistoryCard({ test, onPress }: TestHistoryCardProps) {
  const isPositive = test.result === "positive";
  const isNegative = test.result === "negative";

  const getBadgeStyle = () => {
    if (isPositive) {
      return {
        bg: Colors.positiveLight,
        border: Colors.positiveBorder,
        text: Colors.positive,
        icon: "alert-circle" as const,
      };
    }
    if (isNegative) {
      return {
        bg: Colors.negativeLight,
        border: Colors.negativeBorder,
        text: Colors.negative,
        icon: "checkmark-circle" as const,
      };
    }
    return {
      bg: Colors.inconclusiveLight,
      border: Colors.inconclusiveBorder,
      text: Colors.inconclusive,
      icon: "help-circle" as const,
    };
  };

  const badge = getBadgeStyle();
  const dateStr = new Date(test.captured_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <View style={styles.kitInfo}>
          <Text style={styles.kitName} numberOfLines={1}>
            {test.kit_type_name || "Presumptive Test"}
          </Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>

        <View
          style={[
            styles.badge,
            { backgroundColor: badge.bg, borderColor: badge.border },
          ]}
        >
          <Ionicons name={badge.icon} size={13} color={badge.text} />
          <Text style={[styles.badgeText, { color: badge.text }]}>
            {test.result.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Confidence</Text>
          <Text style={styles.metaVal}>
            {(test.confidence * 100).toFixed(0)}%
          </Text>
        </View>

        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Operator</Text>
          <Text style={styles.metaVal}>{test.operator_badge_id || "Field Officer"}</Text>
        </View>

        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Location</Text>
          <Text style={styles.metaVal} numberOfLines={1}>
            {test.latitude.toFixed(2)}°, {test.longitude.toFixed(2)}°
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.sm + 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  kitInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  kitName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  metaVal: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginTop: 1,
  },
});
