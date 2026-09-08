import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import ReferenceCardOverlay from "../components/ReferenceCardOverlay";
import { getCurrentLocation } from "../services/location";
import { Colors, Radius, Spacing } from "../constants/theme";
import type { LocationData } from "../types";

export default function CaptureScreen() {
  const { kitId } = useLocalSearchParams<{ kitId: string }>();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locating, setLocating] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={60} color={Colors.primary} style={{ marginBottom: 16 }} />
        <Text style={styles.permissionTitle}>Camera Permission Needed</Text>
        <Text style={styles.permissionText}>
          The Field Companion requires camera access to capture colorimetric reactions and the reference card.
        </Text>
        <TouchableOpacity style={styles.actionBtn} onPress={requestPermission}>
          <Text style={styles.actionBtnText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    setLocating(true);

    try {
      // Start GPS location in parallel with camera capture
      const locPromise = getCurrentLocation();

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
      });

      if (!photo?.uri) throw new Error("Image capture failed");

      const locResult = await locPromise;
      if (!locResult) {
        Alert.alert(
          "GPS Location Required",
          "A valid GPS fix is legally required for the chain of custody. Ensure Location Services are enabled.",
        );
        setCapturing(false);
        setLocating(false);
        return;
      }

      setLocation(locResult);
      setPreviewUri(photo.uri);
    } catch (err) {
      Alert.alert(
        "Capture Error",
        err instanceof Error ? err.message : "Failed to capture photo.",
      );
    } finally {
      setCapturing(false);
      setLocating(false);
    }
  };

  const handlePickGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
    });
    if (result.canceled || !result.assets[0]) return;

    setLocating(true);
    const locResult = await getCurrentLocation();
    setLocating(false);

    if (!locResult) {
      Alert.alert("GPS Required", "Could not obtain current GPS coordinates.");
      return;
    }

    setLocation(locResult);
    setPreviewUri(result.assets[0].uri);
  };

  const handleConfirmPhoto = () => {
    if (!previewUri || !location) return;

    router.push({
      pathname: "/result",
      params: {
        kitId: kitId || "",
        imageUri: previewUri,
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        accuracy: location.accuracy != null ? String(location.accuracy) : "",
        locationSource: location.source || "network_ip_approximate",
        locationVerified: location.verified ? "true" : "false",
        capturedAt: new Date().toISOString(),
      },
    });
  };

  const handleRetake = () => {
    setPreviewUri(null);
  };

  // Preview Mode
  if (previewUri) {
    return (
      <SafeAreaView style={styles.previewContainer}>
        <View style={styles.previewHeader}>
          <Text style={styles.previewTitle}>Review Field Photo</Text>
          <Text style={styles.previewSubtitle}>
            Ensure both test reaction & 6 color patches are clearly in frame and in focus
          </Text>
        </View>

        <View style={styles.previewImageWrapper}>
          <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
          <View style={styles.previewBadge}>
            <Ionicons name="location-sharp" size={14} color={Colors.primary} />
            <Text style={styles.previewGpsText}>
              GPS: {location?.latitude.toFixed(4)}°, {location?.longitude.toFixed(4)}°
              {location?.accuracy ? ` (±${location.accuracy.toFixed(0)}m)` : ""}
            </Text>
          </View>
        </View>

        <View style={styles.previewActions}>
          <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
            <Ionicons name="refresh-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.retakeBtnText}>Retake Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmPhoto}>
            <Ionicons name="analytics-outline" size={20} color="#ffffff" />
            <Text style={styles.confirmBtnText}>Analyze & Classify</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Live Camera Mode
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        enableTorch={torchOn}
      >
        <ReferenceCardOverlay />

        {/* Top Control Bar */}
        <SafeAreaView style={styles.topBar}>
          <TouchableOpacity style={styles.topIconBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.topInfoBadge}>
            <Text style={styles.topInfoText}>ALIGN BOTH SAMPLES</Text>
          </View>

          <TouchableOpacity
            style={[styles.topIconBtn, torchOn && styles.torchActive]}
            onPress={() => setTorchOn(!torchOn)}
          >
            <Ionicons
              name={torchOn ? "flash" : "flash-off"}
              size={22}
              color={torchOn ? "#fbbf24" : "#ffffff"}
            />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Instructions banner */}
        <View style={styles.instructionBanner}>
          <Ionicons name="information-circle" size={18} color={Colors.primary} />
          <Text style={styles.instructionText}>
            Kit on LEFT · 6-Patch Color Reference on RIGHT
          </Text>
        </View>

        {/* Bottom Control Bar */}
        <View style={styles.controlsBar}>
          <TouchableOpacity
            style={styles.sideBtn}
            onPress={handlePickGallery}
            disabled={capturing || locating}
          >
            <Ionicons name="images-outline" size={24} color="#ffffff" />
            <Text style={styles.sideBtnText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shutterBtn, (capturing || locating) && styles.shutterDisabled]}
            onPress={handleCapture}
            disabled={capturing || locating}
          >
            {capturing || locating ? (
              <ActivityIndicator color={Colors.textInverse} size="large" />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sideBtn}
            onPress={() => router.push("/guide")}
          >
            <Ionicons name="help-circle-outline" size={24} color="#ffffff" />
            <Text style={styles.sideBtnText}>Guide</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  permissionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  actionBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  actionBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingTop: 10,
  },
  topIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  torchActive: {
    backgroundColor: "rgba(245, 158, 11, 0.3)",
    borderColor: "#fbbf24",
    borderWidth: 1.5,
  },
  topInfoBadge: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  topInfoText: {
    color: Colors.primaryLight,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  instructionBanner: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  instructionText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  controlsBar: {
    position: "absolute",
    bottom: 36,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  sideBtn: {
    alignItems: "center",
    width: 64,
  },
  sideBtnText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  shutterBtn: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#ffffff",
  },
  shutterDisabled: {
    opacity: 0.6,
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.primary,
  },
  // Preview Screen Styles
  previewContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
  },
  previewHeader: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  previewSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: Spacing.md,
  },
  previewImageWrapper: {
    flex: 1,
    marginVertical: Spacing.md,
    borderRadius: Radius.lg,
    overflow: "hidden",
    backgroundColor: "#000000",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  previewGpsText: {
    color: Colors.text,
    fontSize: 11,
    fontFamily: "monospace",
  },
  previewActions: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  retakeBtn: {
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
  retakeBtnText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
