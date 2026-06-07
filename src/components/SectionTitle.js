import React from "react";
import { StyleSheet, Text } from "react-native";
import colors from "../theme/colors";

export default function SectionTitle({ title, subtitle, light = false }) {
  return (
    <>
      <Text style={[styles.title, light && styles.lightTitle]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, light && styles.lightSubtitle]}>{subtitle}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 32,
  },
  lightTitle: {
    color: "#FFFFFF",
  },
  subtitle: {
    color: colors.subText,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  lightSubtitle: {
    color: "#DDE8FF",
  },
});
