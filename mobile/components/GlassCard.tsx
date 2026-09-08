import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { Colors, Radius, Spacing } from "../constants/theme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "accent" | "highlight" | "danger" | "success";
}

export default function GlassCard({
  children,
  style,
  variant = "default",
}: GlassCardProps) {
  const getBorderColor = () => {
    switch (variant) {
      case "accent":
        return Colors.primaryGlow;
      case "highlight":
        return Colors.primary;
      case "danger":
        return Colors.positiveBorder;
      case "success":
        return Colors.negativeBorder;
      default:
        return Colors.cardBorder;
    }
  };

  return (
    <View
      style={[
        styles.card,
        { borderColor: getBorderColor() },
        variant === "accent" && styles.cardAccent,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cardAccent: {
    backgroundColor: "rgba(19, 30, 51, 0.9)",
  },
});
