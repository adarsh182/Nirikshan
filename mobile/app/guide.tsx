import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius, Spacing } from "../constants/theme";

export default function GuideScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reference Color Card Calibration</Text>
          <Text style={styles.subtitle}>
            Standard Operating Procedure for In-Frame Colorimetric Normalization
          </Text>
        </View>

        {/* Visual 6-Patch Simulator Card */}
        <View style={styles.cardPreviewBox}>
          <Text style={styles.previewCardTitle}>Standard Calibration Card (50mm × 30mm)</Text>
          <View style={styles.colorCard}>
            <View style={styles.cardRow}>
              <View style={[styles.swatch, { backgroundColor: "#ffffff" }]}>
                <Text style={styles.swatchLabel}>WHITE</Text>
                <Text style={styles.swatchVal}>#FFFFFF</Text>
              </View>
              <View style={[styles.swatch, { backgroundColor: "#767676" }]}>
                <Text style={[styles.swatchLabel, { color: "#ffffff" }]}>18% GRAY</Text>
                <Text style={[styles.swatchVal, { color: "#e2e8f0" }]}>#767676</Text>
              </View>
              <View style={[styles.swatch, { backgroundColor: "#ef4444" }]}>
                <Text style={[styles.swatchLabel, { color: "#ffffff" }]}>RED</Text>
                <Text style={[styles.swatchVal, { color: "#fee2e2" }]}>#EF4444</Text>
              </View>
            </View>
            <View style={styles.cardRow}>
              <View style={[styles.swatch, { backgroundColor: "#22c55e" }]}>
                <Text style={[styles.swatchLabel, { color: "#ffffff" }]}>GREEN</Text>
                <Text style={[styles.swatchVal, { color: "#dcfce7" }]}>#22C55E</Text>
              </View>
              <View style={[styles.swatch, { backgroundColor: "#3b82f6" }]}>
                <Text style={[styles.swatchLabel, { color: "#ffffff" }]}>BLUE</Text>
                <Text style={[styles.swatchVal, { color: "#dbeafe" }]}>#3B82F6</Text>
              </View>
              <View style={[styles.swatch, { backgroundColor: "#000000", borderWidth: 1, borderColor: "#334155" }]}>
                <Text style={[styles.swatchLabel, { color: "#94a3b8" }]}>BLACK</Text>
                <Text style={[styles.swatchVal, { color: "#64748b" }]}>#000000</Text>
              </View>
            </View>
          </View>
          <Text style={styles.cardCaption}>
            18% neutral gray provides automatic white-balance & gamma compensation across sunlight, shade, and indoor lights.
          </Text>
        </View>

        {/* Step-by-Step Instructions */}
        <View style={styles.stepsContainer}>
          <Text style={styles.sectionHeader}>Execution Steps</Text>

          <StepCard
            num="1"
            title="Perform Chemical Reaction"
            desc="Add presumptive chemical reagent to suspected substance per kit manufacturer's guidelines. Wait 15–30 seconds until reaction color stabilizes."
            icon="flask"
          />

          <StepCard
            num="2"
            title="Position Reference Card Beside Kit"
            desc="Lay the laminated 6-patch color card immediately to the right of the reaction zone on a flat surface."
            icon="card"
          />

          <StepCard
            num="3"
            title="Align Within Camera Guides"
            desc="Open the Capture screen. Ensure the test tube/strip is inside the LEFT green guide and the color card inside the RIGHT blue guide."
            icon="scan"
          />

          <StepCard
            num="4"
            title="Optimize Lighting & Avoid Glare"
            desc="Hold phone perpendicular to the surface. Avoid cast shadows. In low light, toggle the top flash torch button."
            icon="sunny"
          />
        </View>

        {/* Field Notice Box */}
        <View style={styles.noticeBox}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.accentBlue} />
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>Forensic Chain of Custody</Text>
            <Text style={styles.noticeText}>
              Every captured frame computes an irreversible SHA-256 digest alongside GPS coordinates and hardware timestamp.
            </Text>
          </View>
        </View>

        {/* Bottom Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
          <Text style={styles.actionBtnText}>Understood — Return</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StepCard({
  num,
  title,
  desc,
  icon,
}: {
  num: string;
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepLeft}>
        <View style={styles.stepNumCircle}>
          <Text style={styles.stepNumText}>{num}</Text>
        </View>
      </View>
      <View style={styles.stepRight}>
        <View style={styles.stepHeader}>
          <Ionicons name={icon} size={16} color={Colors.primary} />
          <Text style={styles.stepTitle}>{title}</Text>
        </View>
        <Text style={styles.stepDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md + 2,
    paddingBottom: Spacing.xxl + 20,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  cardPreviewBox: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  previewCardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: Spacing.sm + 2,
    textTransform: "uppercase",
  },
  colorCard: {
    borderRadius: Radius.md,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#475569",
    padding: 6,
    backgroundColor: "#1e293b",
    gap: 6,
  },
  cardRow: {
    flexDirection: "row",
    gap: 6,
    height: 48,
  },
  swatch: {
    flex: 1,
    borderRadius: Radius.sm,
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  swatchLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#0f172a",
  },
  swatchVal: {
    fontSize: 8,
    fontFamily: "monospace",
    color: "rgba(15, 23, 42, 0.7)",
  },
  cardCaption: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
    marginTop: Spacing.sm + 4,
  },
  stepsContainer: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.sm + 4,
  },
  stepCard: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.sm + 4,
  },
  stepLeft: {
    marginRight: Spacing.md,
  },
  stepNumCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  stepRight: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  stepDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  noticeBox: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.accentBlue,
    marginBottom: 2,
  },
  noticeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
  },
  actionBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
});
