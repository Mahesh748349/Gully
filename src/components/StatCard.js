import React from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../theme/colors";

export default function StatCard({ label, value, tone = "default" }) {
  const toneStyles = {
    default: { backgroundColor: colors.card, valueColor: colors.text },
    primary: { backgroundColor: "#E8F0FF", valueColor: colors.primaryDark },
    success: { backgroundColor: "#EAFBF1", valueColor: colors.success },
    accent: { backgroundColor: "#FFF1E7", valueColor: colors.accent },
  };

  const selectedTone = toneStyles[tone] || toneStyles.default;

  return (
    <View style={[styles.card, { backgroundColor: selectedTone.backgroundColor }]}>
      <Text style={[styles.value, { color: selectedTone.valueColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    flex: 1,
    minHeight: 86,
    padding: 16,
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
