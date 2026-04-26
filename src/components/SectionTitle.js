import React from "react";
import { StyleSheet, Text } from "react-native";
import colors from "../theme/colors";

export default function SectionTitle({ title, subtitle }) {
  return (
    <>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.subText,
    fontSize: 15,
    marginTop: 6,
  },
});
