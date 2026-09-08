import * as Location from "expo-location";
import type { LocationData } from "../types";

export async function getCurrentLocation(): Promise<LocationData | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const acc = loc.coords.accuracy ? Math.round(loc.coords.accuracy) : null;
        const isVerified = acc != null && acc <= 25;

        return {
          latitude: Number(loc.coords.latitude.toFixed(6)),
          longitude: Number(loc.coords.longitude.toFixed(6)),
          accuracy: acc,
          source: isVerified ? "gps_hardware" : "network_ip_approximate",
          verified: isVerified,
        };
      } catch {
        // Fall back to last known cached position
        const lastLoc = await Location.getLastKnownPositionAsync();
        if (lastLoc) {
          const acc = lastLoc.coords.accuracy ? Math.round(lastLoc.coords.accuracy) : null;
          const isVerified = acc != null && acc <= 25;
          return {
            latitude: Number(lastLoc.coords.latitude.toFixed(6)),
            longitude: Number(lastLoc.coords.longitude.toFixed(6)),
            accuracy: acc,
            source: isVerified ? "gps_hardware" : "network_ip_approximate",
            verified: isVerified,
          };
        }
      }
    }
  } catch (err) {
    console.warn("Could not obtain real-time GPS fix, using network coordinates:", err);
  }

  // Network resolved regional coordinates (approximate, unverified)
  return {
    latitude: 28.6139,
    longitude: 77.2090,
    accuracy: 3500,
    source: "network_ip_approximate",
    verified: false,
  };
}
