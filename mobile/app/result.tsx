import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
  Linking,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ResultCard from "../components/ResultCard";
import {
  overrideTestResult,
  submitTest,
  getTestDetail,
  verifyTest,
  deleteTest,
  API_BASE,
} from "../services/api";
import { Colors, Radius, Spacing } from "../constants/theme";
import type { TestRecord, VerificationResult } from "../types";

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    testId?: string;
    kitId?: string;
    imageUri?: string;
    latitude?: string;
    longitude?: string;
    accuracy?: string;
    locationSource?: string;
    locationVerified?: string;
    capturedAt?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<TestRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [overriding, setOverriding] = useState(false);

  useEffect(() => {
    // Case 1: Viewing an existing test record by ID (from history)
    if (params.testId) {
      getTestDetail(params.testId)
        .then((res) => {
          setRecord(res);
          setLoading(false);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to load test record");
          setLoading(false);
        });
      return;
    }

    // Case 2: Submitting a new capture
    if (params.imageUri && params.kitId && params.latitude && params.longitude) {
      submitTest(
        params.imageUri,
        params.kitId,
        {
          latitude: parseFloat(params.latitude),
          longitude: parseFloat(params.longitude),
          accuracy: params.accuracy ? parseFloat(params.accuracy) : null,
          source: (params.locationSource as any) || "network_ip_approximate",
          verified: params.locationVerified === "true",
        },
        { deviceCapturedAt: params.capturedAt },
      )
        .then((res) => {
          setRecord(res);
          setLoading(false);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Image analysis failed");
          setLoading(false);
        });
    } else {
      setError("Missing test parameters for analysis.");
      setLoading(false);
    }
  }, [params.testId, params.imageUri, params.kitId, params.latitude, params.longitude, params.accuracy, params.capturedAt]);

  const handleVerifyIntegrity = async () => {
    if (!record) return;
    setVerifying(true);
    try {
      const result = await verifyTest(record.id);
      setVerification(result);
    } catch {
      Alert.alert("Verification Error", "Could not verify cryptographic integrity against server.");
    } finally {
      setVerifying(false);
    }
  };

  const handleOverride = (newResult: "positive" | "negative" | "inconclusive") => {
    if (!record || record.result === newResult) return;

    Alert.alert(
      "Confirm Officer Override",
      `Are you sure you want to manually mark this test as ${newResult.toUpperCase()}? This action will be logged in the permanent record.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Override",
          onPress: async () => {
            setOverriding(true);
            try {
              const updated = await overrideTestResult(
                record.id,
                newResult,
                `Officer manual override to ${newResult}`,
              );
              setRecord(updated);
              setVerification(null);
            } catch (err) {
              Alert.alert("Override Failed", err instanceof Error ? err.message : "Could not update result");
            } finally {
              setOverriding(false);
            }
          },
        },
      ],
    );
  };

  const handleShare = async () => {
    if (!record) return;
    try {
      const message = `[Presumptive Drug Test Record]\nID: ${record.id}\nResult: ${record.result.toUpperCase()} (${(record.confidence * 100).toFixed(1)}%)\nKit: ${record.kit_type_name || "Presumptive"}\nOfficer: ${record.operator_badge_id}\nTime: ${new Date(record.captured_at).toISOString()}\nLocation: ${record.latitude.toFixed(5)}, ${record.longitude.toFixed(5)}\nImage SHA-256: ${record.image_hash}\nHMAC: ${record.signature}`;
      await Share.share({ message });
    } catch {
      // ignore
    }
  };

  const handleDeleteRecord = () => {
    if (!record) return;
    Alert.alert(
      "Permanently Delete Evidence?",
      `Are you sure you want to delete dossier #${record.id.slice(0, 8)}? This will permanently purge the photographic evidence file and cryptographic chain-of-custody signatures.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Permanently",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTest(record.id);
              Alert.alert("Record Deleted", "Evidence dossier has been permanently purged.", [
                {
                  text: "OK",
                  onPress: () => router.replace("/(tabs)/history"),
                },
              ]);
            } catch (e: any) {
              Alert.alert("Deletion Failed", e?.message || "Could not delete evidence record.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
        <Text style={styles.loadingTitle}>Processing Colorimetric Reaction</Text>
        <Text style={styles.loadingSub}>
          Calibrating LAB color space against 6-patch reference card...
        </Text>
      </View>
    );
  }

  if (error || !record) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={54} color={Colors.positive} style={{ marginBottom: 12 }} />
        <Text style={styles.errorTitle}>Analysis Unsuccessful</Text>
        <Text style={styles.errorText}>{error || "Unknown error occurred"}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="#ffffff" />
          <Text style={styles.retryBtnText}>Return to Capture</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const details = record.classification_details;
  const swatchRgb = details?.corrected_swatch_rgb as number[] | undefined;
  const imageSource = params.imageUri
    ? { uri: params.imageUri }
    : { uri: `${API_BASE}/tests/${record.id}/image` };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Banner with Image Preview */}
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.previewImage} resizeMode="cover" />
        <View style={styles.imageOverlayTag}>
          <Ionicons name="camera" size={12} color="#ffffff" />
          <Text style={styles.imageTagText}>Field Capture</Text>
        </View>
      </View>

      {/* Result Card */}
      <ResultCard
        result={record.result}
        confidence={record.confidence}
        swatchRgb={swatchRgb}
        kitName={record.kit_type_name}
      />

      {/* Forensic Test Details Card */}
      <View style={styles.detailsCard}>
        <Text style={styles.cardSectionTitle}>Field Examination Record</Text>

        <MetaRow label="Test Kit" value={record.kit_type_name || "Presumptive Kit"} />
        <MetaRow label="Captured Time" value={new Date(record.captured_at).toLocaleString()} />
        <MetaRow
          label="GPS Location"
          value={`${record.latitude.toFixed(5)}°, ${record.longitude.toFixed(5)}°${
            record.location_accuracy_m ? ` (±${record.location_accuracy_m.toFixed(0)}m)` : ""
          }`}
        />
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => {
            Linking.openURL(
              `https://www.google.com/maps?q=${record.latitude},${record.longitude}&z=17`
            );
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="map-outline" size={13} color={Colors.primary} />
          <Text style={styles.mapBtnText}>Open Pinned GPS in Google Maps</Text>
          <Ionicons name="open-outline" size={12} color={Colors.primary} />
        </TouchableOpacity>
        <MetaRow
          label="Location Integrity"
          value={record.location_verified ? "Hardware GPS (Verified)" : "Approximate Fix (Unverified)"}
          valueColor={record.location_verified ? Colors.primaryLight : Colors.inconclusive}
        />
        <MetaRow
          label="Reference Card"
          value={details?.reference_card_detected ? "Calibrated (Detected)" : "Fallback (Standard)"}
          valueColor={details?.reference_card_detected ? Colors.primaryLight : Colors.inconclusive}
        />
        <MetaRow label="Operator Badge" value={record.operator_badge_id || "Officer"} />
        {record.notes && <MetaRow label="Notes" value={record.notes} />}
      </View>

      {/* Tamper-Evident Security Section */}
      <View style={styles.securityCard}>
        <View style={styles.securityHeader}>
          <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
          <Text style={styles.securityTitle}>Tamper-Evident Chain of Custody</Text>
        </View>

        <Text style={styles.hashLabel}>RECORD ID</Text>
        <Text style={styles.hashValue} selectable>{record.id}</Text>

        <Text style={styles.hashLabel}>SHA-256 IMAGE HASH</Text>
        <Text style={styles.hashValue} numberOfLines={1} selectable>{record.image_hash}</Text>

        <Text style={styles.hashLabel}>HMAC-SHA256 SIGNATURE</Text>
        <Text style={styles.hashValue} numberOfLines={1} selectable>{record.signature}</Text>

        {/* Verification Button & Status */}
        {verification ? (
          <View
            style={[
              styles.verificationResult,
              {
                backgroundColor: verification.valid ? Colors.negativeLight : Colors.positiveLight,
                borderColor: verification.valid ? Colors.negativeBorder : Colors.positiveBorder,
              },
            ]}
          >
            <Ionicons
              name={verification.valid ? "checkmark-circle" : "close-circle"}
              size={20}
              color={verification.valid ? Colors.negative : Colors.positive}
            />
            <Text
              style={[
                styles.verificationText,
                { color: verification.valid ? Colors.negative : Colors.positive },
              ]}
            >
              {verification.message}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.verifyBtn}
            onPress={handleVerifyIntegrity}
            disabled={verifying}
          >
            {verifying ? (
              <ActivityIndicator color={Colors.primary} size="small" />
            ) : (
              <>
                <Ionicons name="shield-outline" size={16} color={Colors.primary} />
                <Text style={styles.verifyBtnText}>Verify Cryptographic Signature</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Officer Override Controls */}
      <View style={styles.overrideSection}>
        <Text style={styles.overrideHeader}>Officer Reclassification (Chain of Custody logged):</Text>
        <View style={styles.overrideButtonsRow}>
          {(["positive", "negative", "inconclusive"] as const).map((r) => {
            const isActive = record.result === r;
            return (
              <TouchableOpacity
                key={r}
                style={[styles.overrideBtn, isActive && styles.overrideBtnActive]}
                onPress={() => handleOverride(r)}
                disabled={overriding}
              >
                <Text
                  style={[styles.overrideBtnText, isActive && styles.overrideBtnTextActive]}
                >
                  {r.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={18} color={Colors.text} />
          <Text style={styles.shareBtnText}>Share Summary</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.newTestBtn}
          onPress={() => router.replace("/new-test")}
        >
          <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
          <Text style={styles.newTestBtnText}>New Field Test</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.deleteRecordBtn}
        onPress={handleDeleteRecord}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={16} color="#ef4444" />
        <Text style={styles.deleteRecordBtnText}>Permanently Delete Evidence Record</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MetaRow({
  label,
  value,
  valueColor = Colors.text,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={[styles.metaValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl + 20,
  },
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  loadingSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 280,
    lineHeight: 18,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.positive,
  },
  errorText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    marginBottom: Spacing.lg,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  retryBtnText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: Radius.lg,
    overflow: "hidden",
    backgroundColor: Colors.backgroundSecondary,
    marginBottom: Spacing.md,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlayTag: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  imageTagText: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "600",
  },
  detailsCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.sm + 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  metaLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
    marginLeft: Spacing.sm,
  },
  securityCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  securityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: Spacing.sm,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
  },
  hashLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    letterSpacing: 0.5,
  },
  hashValue: {
    fontSize: 11,
    color: Colors.accentBlue,
    fontFamily: "monospace",
    marginTop: 2,
  },
  verifyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 4,
    marginTop: Spacing.md,
  },
  verifyBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary,
  },
  verificationResult: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: Spacing.sm + 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  verificationText: {
    fontSize: 13,
    fontWeight: "600",
  },
  overrideSection: {
    marginBottom: Spacing.lg,
  },
  overrideHeader: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  overrideButtonsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  overrideBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: "center",
  },
  overrideBtnActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primary,
  },
  overrideBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  overrideBtnTextActive: {
    color: Colors.primaryLight,
  },
  bottomActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  shareBtnText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  newTestBtn: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
  },
  newTestBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  mapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderColor: "rgba(16, 185, 129, 0.25)",
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 2,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  mapBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  deleteRecordBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.25)",
    borderRadius: Radius.md,
    paddingVertical: 12,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  deleteRecordBtnText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "700",
  },
});
