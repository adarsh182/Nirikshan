import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius, Spacing } from "../constants/theme";
import { getOperators } from "../services/api";
import { getStoredToken, saveSelectedOperator } from "../services/auth";
import type { Operator } from "../types";

export default function OperatorPickerScreen() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStoredToken().then((token) => {
      if (token) {
        router.replace("/new-test");
        return;
      }
      loadOperators();
    });
  }, []);

  const loadOperators = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getOperators();
      setOperators(list);
    } catch {
      setError("Unable to connect to field registry. Verify network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (op: Operator) => {
    await saveSelectedOperator(op);
    router.replace("/new-test");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Branding */}
        <View style={styles.brandContainer}>
          <Image
            source={require("../assets/icon.png")}
            style={styles.brandIcon}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>Nirikshan</Text>
          <Text style={styles.appSubtitle}>
            Forensic Intelligence & Presumptive Seizure Registry
          </Text>
        </View>

        {/* Operator Roster Card */}
        <View style={styles.rosterCard}>
          <View style={styles.rosterHeader}>
            <View>
              <Text style={styles.cardTitle}>Select Operating Officer</Text>
              <Text style={styles.cardSubtitle}>
                Attribution profile for digital custody signatures
              </Text>
            </View>
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>Terminal Active</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={Colors.primary} size="large" />
              <Text style={styles.loadingText}>Loading officer roster...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerBox}>
              <Ionicons name="alert-circle-outline" size={32} color={Colors.positive} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={loadOperators}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : operators.length === 0 ? (
            <View style={styles.centerBox}>
              <Text style={styles.emptyText}>No operators registered.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {operators.map((op) => (
                <TouchableOpacity
                  key={op.id}
                  style={styles.operatorItem}
                  onPress={() => handleSelect(op)}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {op.name.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.opInfo}>
                    <View style={styles.opTopRow}>
                      <Text style={styles.opBadge}>{op.badge_id}</Text>
                      <Text style={styles.opName} numberOfLines={1}>{op.name}</Text>
                    </View>
                    <Text style={styles.opRole}>{op.role || "Field Officer"}</Text>
                  </View>

                  <View style={styles.selectBtn}>
                    <Text style={styles.selectBtnText}>Select</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Plain Statutory Notice */}
        <View style={styles.noticeContainer}>
          <Text style={styles.noticeText}>
            Presumptive screening result — confirmatory laboratory analysis required
          </Text>
          <Text style={styles.noticeSub}>
            Cryptographic signatures permanently seal operator attribution in forensic ledger
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: "space-between",
  },
  brandContainer: {
    alignItems: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  brandIcon: {
    width: 68,
    height: 68,
    marginBottom: Spacing.sm + 2,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
  },
  appSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  rosterCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
  },
  rosterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm + 2,
    marginBottom: Spacing.sm + 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activePill: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primary,
  },
  centerBox: {
    paddingVertical: 36,
    alignItems: "center",
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: Spacing.md,
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  retryBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 20,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Radius.md,
  },
  retryBtnText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  list: {
    gap: Spacing.sm,
  },
  operatorItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    gap: Spacing.sm + 2,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },
  opInfo: {
    flex: 1,
  },
  opTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  opBadge: {
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primaryLight,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  opName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
  },
  opRole: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    textTransform: "capitalize",
  },
  selectBtn: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  selectBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primaryLight,
  },
  noticeContainer: {
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  noticeText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  noticeSub: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 2,
  },
});
