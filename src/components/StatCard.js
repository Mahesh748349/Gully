import React from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../theme/colors";

export default function StatCard({ label, value, tone = "default" }) {
  const toneStyles = {
    default: { backgroundColor: colors.card, valueColor: colors.text, borderColor: colors.border },
    primary: { backgroundColor: "#EEF4FF", valueColor: colors.primaryDark, borderColor: "#D9E6FF" },
    success: { backgroundColor: "#EAFBF3", valueColor: colors.success, borderColor: "#CFF4DF" },
    accent: { backgroundColor: "#FFF4E8", valueColor: colors.accent, borderColor: "#FFE0C2" },
  };

  const selectedTone = toneStyles[tone] || toneStyles.default;

  return (
    <View style={[styles.card, { backgroundColor: selectedTone.backgroundColor, borderColor: selectedTone.borderColor }]}>
      <Text style={[styles.value, { color: selectedTone.valueColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    minHeight: 86,
    padding: 14,
  },
  value: {
    fontSize: 22,
    fontWeight: "800",
  },
  label: {
    color: colors.subText,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
});
