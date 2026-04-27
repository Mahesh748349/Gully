import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import SectionTitle from "../components/SectionTitle";
import colors from "../theme/colors";

export default function WelcomeScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.topRow}>
          <Text style={styles.brand}>Gully</Text>
          <View style={styles.navRow}>
            <Pressable style={styles.navButton} onPress={() => navigation.navigate("Login")}>
              <Text style={styles.navButtonText}>Login</Text>
            </Pressable>
            <Pressable style={styles.navOutlineButton} onPress={() => navigation.navigate("Register")}>
              <Text style={styles.navOutlineButtonText}>Sign Up</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.heroBadge}>Find players. Start games. Build local sports.</Text>
        <SectionTitle
          title="Your next match starts here"
          subtitle="Create or discover cricket, football, badminton and more with a simple community-first app."
          light
        />

        <View style={styles.previewGrid}>
          <View style={[styles.previewCard, styles.previewPrimary]}>
            <Text style={styles.previewTitle}>Live game feed</Text>
            <Text style={styles.previewText}>Open games update in real time so nearby players never miss a chance.</Text>
          </View>
          <View style={styles.previewColumn}>
            <View style={styles.previewMiniCard}>
              <Text style={styles.previewMiniTitle}>Easy join requests</Text>
            </View>
            <View style={[styles.previewMiniCard, styles.previewMiniAccent]}>
              <Text style={styles.previewMiniTitleDark}>Skill levels and match notes</Text>
            </View>
          </View>
        </View>

        <PrimaryButton title="Get Started" onPress={() => navigation.navigate("Register")} style={styles.heroButton} />
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoValue}>6</Text>
          <Text style={styles.infoLabel}>Core screens built</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoValue}>Live</Text>
          <Text style={styles.infoLabel}>Firestore updates</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoValue}>Fast</Text>
          <Text style={styles.infoLabel}>Simple Firebase backend</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flexGrow: 1,
    padding: 20,
  },
  heroCard: {
    backgroundColor: "#0F62FE",
    borderRadius: 32,
    minHeight: 620,
    padding: 22,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  navRow: {
    flexDirection: "row",
    gap: 8,
  },
  navButton: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  navButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  navOutlineButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  navOutlineButtonText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "800",
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 28,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  previewGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
  },
  previewCard: {
    borderRadius: 24,
    flex: 1,
    minHeight: 220,
    padding: 18,
  },
  previewPrimary: {
    backgroundColor: "#FFFFFF",
  },
  previewTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "800",
  },
  previewText: {
    color: colors.subText,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },
  previewColumn: {
    flex: 1,
    gap: 12,
  },
  previewMiniCard: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 24,
    flex: 1,
    justifyContent: "flex-end",
    padding: 18,
  },
  previewMiniAccent: {
    backgroundColor: "#FFF1E7",
  },
  previewMiniTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 22,
  },
  previewMiniTitleDark: {
    color: "#8A4A1F",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 22,
  },
  heroButton: {
    marginTop: 24,
  },
  infoRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    flex: 1,
    padding: 16,
  },
  infoValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  infoLabel: {
    color: colors.subText,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
});
