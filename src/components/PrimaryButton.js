import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import colors from "../theme/colors";

export default function PrimaryButton({ title, onPress, loading = false, disabled = false, style }) {
  const isDisabled = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.disabledButton,
        pressed && !isDisabled && styles.pressedButton,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
  },
  disabledButton: {
    opacity: 0.7,
  },
  pressedButton: {
    backgroundColor: colors.primaryDark,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
