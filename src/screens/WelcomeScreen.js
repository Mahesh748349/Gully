import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import SectionTitle from "../components/SectionTitle";
import colors from "../theme/colors";

export default function WelcomeScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <View style={styles.topRow}>
          <View style={styles.brandLockup}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>G</Text>
            </View>
            <Text style={styles.brand}>Gully</Text>
          </View>
          <View style={styles.navRow}>
            <Pressable style={styles.navButton} onPress={() => navigation.navigate("Login")}>
              <Text style={styles.navButtonText}>Login</Text>
            </Pressable>
            <Pressable style={styles.navOutlineButton} onPress={() => navigation.navigate("Register")}>
              <Text style={styles.navOutlineButtonText}>Sign Up</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.heroBadge}>Live local sports network</Text>
        <SectionTitle
          title="Find the right players before the match starts."
          subtitle="Create games, pin grounds on the map, and manage join requests with a focused app for local sport communities."
          light
        />

        <View style={styles.productPanel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Today near you</Text>
            <Text style={styles.panelStatus}>Live</Text>
          </View>
          <View style={styles.matchRow}>
            <View style={styles.sportIcon}>
              <Text style={styles.sportIconText}>C</Text>
            </View>
            <View style={styles.matchCopy}>
              <Text style={styles.matchTitle}>Cricket at Shivaji Park</Text>
              <Text style={styles.matchMeta}>7 spots left - 2.4 km away</Text>
            </View>
          </View>
          <View style={styles.mapPreview}>
            <View style={[styles.mapPin, styles.mapPinPrimary]} />
            <View style={[styles.mapPin, styles.mapPinAccent]} />
            <View style={[styles.mapPin, styles.mapPinSuccess]} />
            <View style={styles.routeLine} />
          </View>
        </View>

        <View style={styles.heroActions}>
          <PrimaryButton title="Create Account" onPress={() => navigation.navigate("Register")} style={styles.heroButton} />
          <PrimaryButton
            title="I already play"
            onPress={() => navigation.navigate("Login")}
            style={styles.heroButton}
            variant="secondary"
          />
        </View>
      </View>

      <View style={styles.valueGrid}>
        {[
          ["Realtime", "Games and requests update instantly."],
          ["Map-first", "Grounds are pinned for better discovery."],
          ["Organized", "Hosts can review players in one flow."],
        ].map(([title, body]) => (
          <View key={title} style={styles.valueCard}>
            <Text style={styles.infoValue}>{title}</Text>
            <Text style={styles.infoLabel}>{body}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flexGrow: 1,
    padding: 18,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: colors.ink,
    borderRadius: 28,
    overflow: "hidden",
    padding: 20,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
  },
  brandLockup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  brandMarkText: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: "900",
  },
  navRow: {
    flexDirection: "row",
    gap: 8,
  },
  navButton: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
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
    borderRadius: 12,
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
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 42,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  productPanel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginTop: 28,
    padding: 16,
  },
  panelHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  panelTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  panelStatus: {
    backgroundColor: "#EAFBF3",
    borderRadius: 999,
    color: colors.success,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  matchRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  sportIcon: {
    alignItems: "center",
    backgroundColor: colors.softCard,
    borderRadius: 14,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  sportIconText: {
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: "900",
  },
  matchCopy: {
    flex: 1,
  },
  matchTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  matchMeta: {
    color: colors.subText,
    fontSize: 13,
    marginTop: 4,
  },
  mapPreview: {
    backgroundColor: "#F1F5F9",
    borderRadius: 18,
    height: 150,
    marginTop: 16,
    overflow: "hidden",
  },
  routeLine: {
    backgroundColor: "#CBD5E1",
    height: 3,
    left: 54,
    position: "absolute",
    right: 54,
    top: 78,
    transform: [{ rotate: "-18deg" }],
  },
  mapPin: {
    borderColor: "#FFFFFF",
    borderRadius: 11,
    borderWidth: 4,
    height: 22,
    position: "absolute",
    width: 22,
  },
  mapPinPrimary: {
    backgroundColor: colors.primary,
    left: 38,
    top: 54,
  },
  mapPinAccent: {
    backgroundColor: colors.accent,
    right: 52,
    top: 78,
  },
  mapPinSuccess: {
    backgroundColor: colors.success,
    left: 128,
    top: 34,
  },
  heroActions: {
    gap: 12,
    marginTop: 22,
  },
  heroButton: {
    width: "100%",
  },
  valueGrid: {
    gap: 12,
    marginTop: 18,
  },
  valueCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  infoValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  infoLabel: {
    color: colors.subText,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
});
