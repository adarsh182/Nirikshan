import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius, Spacing } from "../constants/theme";
import StatsBar from "../components/StatsBar";
import { getKits, getStats } from "../services/api";
import { clearAuth, getStoredOperator } from "../services/auth";
import type { DashboardStats, KitType } from "../types";

export default function NewTestScreen() {
  const [kits, setKits] = useState<KitType[]>([]);
  const [selectedKit, setSelectedKit] = useState<string | null>(null);
  const [operator, setOperator] = useState<{ badge_id: string; name: string } | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [kitList, op, statData] = await Promise.all([
        getKits(),
        getStoredOperator(),
        getStats().catch(() => null),
      ]);
      setKits(kitList);
      setOperator(op);
      setStats(statData);
      if (kitList.length > 0 && !selectedKit) {
        setSelectedKit(kitList[0].id);
      }
    } catch {
      Alert.alert("Connection Error", "Could not load test kits or server statistics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedKit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleStart = () => {
    if (!selectedKit) {
      Alert.alert("Selection Required", "Please select a test kit type to continue.");
      return;
    }
    router.push({ pathname: "/capture", params: { kitId: selectedKit } });
  };

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to end your officer session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await clearAuth();
          router.replace("/");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
        <Text style={styles.loadingText}>Initializing Field Terminal...</Text>
      </View>
    );
  }

  const selectedKitObj = kits.find((k) => k.id === selectedKit);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      {/* Officer Header Card */}
      <View style={styles.officerCard}>
        <View style={styles.officerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {operator?.name ? operator.name.slice(0, 2).toUpperCase() : "OP"}
            </Text>
          </View>
          <View>
            <Text style={styles.officerName}>{operator?.name || "Field Officer"}</Text>
            <View style={styles.badgeRow}>
              <Ionicons name="shield" size={12} color={Colors.primary} />
              <Text style={styles.badgeText}>Badge: {operator?.badge_id || "OFF-001"}</Text>
              <View style={styles.dot} />
              <Text style={styles.statusLive}>ONLINE</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Live Server Stats */}
      <StatsBar stats={stats} />

      {/* Navigation Quick Links */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navCard}
          onPress={() => router.push("/history")}
          activeOpacity={0.7}
        >
          <View style={[styles.navIconBox, { backgroundColor: "rgba(56, 189, 248, 0.15)" }]}>
            <Ionicons name="file-tray-full" size={20} color={Colors.accentBlue} />
          </View>
          <View style={styles.navTextContainer}>
            <Text style={styles.navTitle}>Test History</Text>
            <Text style={styles.navSubtitle}>Past records & hashes</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navCard}
          onPress={() => router.push("/guide")}
          activeOpacity={0.7}
        >
          <View style={[styles.navIconBox, { backgroundColor: "rgba(168, 85, 247, 0.15)" }]}>
            <Ionicons name="color-palette" size={20} color={Colors.accentPurple} />
          </View>
          <View style={styles.navTextContainer}>
            <Text style={styles.navTitle}>Card Guide</Text>
            <Text style={styles.navSubtitle}>Calibration reference</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Select Kit Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Select Presumptive Kit</Text>
        <Text style={styles.sectionCount}>{kits.length} Available</Text>
      </View>

      {kits.map((kit) => {
        const isSelected = selectedKit === kit.id;
        return (
          <TouchableOpacity
            key={kit.id}
            style={[styles.kitCard, isSelected && styles.kitSelected]}
            onPress={() => setSelectedKit(kit.id)}
            activeOpacity={0.8}
          >
            <View style={styles.kitTopRow}>
              <View style={styles.kitIconBadge}>
                <Ionicons
                  name="flask"
                  size={20}
                  color={isSelected ? Colors.primary : Colors.textSecondary}
                />
              </View>
              <View style={styles.kitHeader}>
                <Text style={[styles.kitName, isSelected && styles.kitNameSelected]}>
                  {kit.name}
                </Text>
                <Text style={styles.kitIdTag}>ID: {kit.id.toUpperCase()}</Text>
              </View>
              <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </View>

            {kit.description && <Text style={styles.kitDesc}>{kit.description}</Text>}

            <View style={styles.kitFooter}>
              <View style={styles.thresholdPill}>
                <Ionicons name="analytics" size={12} color={Colors.textMuted} />
                <Text style={styles.thresholdText}>
                  Min Confidence: {(kit.confidence_threshold * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Bottom Start Action Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.startButton, !selectedKit && styles.buttonDisabled]}
          onPress={handleStart}
          disabled={!selectedKit}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={22} color="#ffffff" />
          <Text style={styles.startButtonText}>
            Launch Camera & Calibration Overlay
          </Text>
        </TouchableOpacity>
        {selectedKitObj && (
          <Text style={styles.readyNote}>
            Ready to capture using <Text style={{ color: Colors.primary }}>{selectedKitObj.name}</Text>
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md + 2,
    paddingBottom: Spacing.xxl + 20,
  },
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontSize: 14,
  },
  officerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  officerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
  officerName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  badgeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    marginHorizontal: 4,
  },
  statusLive: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  logoutBtn: {
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.backgroundSecondary,
  },
  navRow: {
    flexDirection: "row",
    gap: Spacing.sm + 2,
    marginBottom: Spacing.lg,
  },
  navCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.sm + 4,
  },
  navIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  navTextContainer: {
    flex: 1,
  },
  navTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  navSubtitle: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm + 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  kitCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.sm + 4,
  },
  kitSelected: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
  },
  kitTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  kitIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm + 2,
  },
  kitHeader: {
    flex: 1,
  },
  kitName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  kitNameSelected: {
    color: Colors.primaryLight,
  },
  kitIdTag: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  kitDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: Spacing.sm,
  },
  kitFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm + 2,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  thresholdPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  thresholdText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  actionContainer: {
    marginTop: Spacing.md,
    alignItems: "center",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.lg,
    width: "100%",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  readyNote: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: Spacing.sm + 2,
  },
});
