import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../theme/colors";

export default function PrimaryButton({ title, onPress, loading = false, disabled = false, style, variant = "primary" }) {
  const isDisabled = loading || disabled;
  const variantStyle = variant === "secondary" ? styles.secondaryButton : styles.button;
  const textStyle = variant === "secondary" ? styles.secondaryButtonText : styles.buttonText;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.baseButton,
        variantStyle,
        isDisabled && styles.disabledButton,
        pressed && !isDisabled && (variant === "secondary" ? styles.secondaryPressedButton : styles.pressedButton),
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={variant === "secondary" ? colors.primary : "#FFFFFF"} /> : (
        <View style={styles.contentRow}>
          <Text style={textStyle}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    alignItems: "center",
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  button: {
    backgroundColor: colors.primary,
    elevation: 2,
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 14,
  },
  secondaryButton: {
    backgroundColor: colors.softCard,
    borderColor: "#D7E5FF",
    borderWidth: 1,
  },
  disabledButton: {
    opacity: 0.55,
  },
  pressedButton: {
    backgroundColor: colors.primaryDark,
  },
  secondaryPressedButton: {
    backgroundColor: "#DDEBFF",
  },
  contentRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButtonText: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: "800",
  },
});
