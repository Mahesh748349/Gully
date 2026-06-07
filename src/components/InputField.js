import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import colors from "../theme/colors";

export default function InputField({ label, style, ...props }) {
  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.subText}
        style={[styles.input, props.multiline && styles.multilineInput]}
        selectionColor={colors.primary}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
});
