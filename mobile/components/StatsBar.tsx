import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, Radius, Spacing } from "../constants/theme";
import type { DashboardStats } from "../types";

interface StatsBarProps {
  stats: DashboardStats | null;
}

export default function StatsBar({ stats }: StatsBarProps) {
  if (!stats) return null;

  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <Text style={styles.value}>{stats.tests_today}</Text>
        <Text style={styles.label}>Today</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.statItem}>
        <Text style={styles.value}>{stats.total_tests}</Text>
        <Text style={styles.label}>Total</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.statItem}>
        <Text style={[styles.value, { color: Colors.positive }]}>
          {stats.positive_count}
        </Text>
        <Text style={styles.label}>Positive</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.statItem}>
        <Text style={[styles.value, { color: Colors.negative }]}>
          {stats.negative_count}
        </Text>
        <Text style={styles.label}>Negative</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  label: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.borderLight,
  },
});
