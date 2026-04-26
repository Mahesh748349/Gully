import React from "react";
import { StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import SectionTitle from "../components/SectionTitle";
import { useAuth } from "../context/AuthContext";
import colors from "../theme/colors";

export default function ProfileScreen() {
  const { profile, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.name?.charAt(0)?.toUpperCase() || "G"}</Text>
        </View>
        <SectionTitle title={profile?.name || "Gully User"} subtitle={profile?.email || "No email available"} />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>About this screen</Text>
        <Text style={styles.infoText}>
          This is a simple starter profile page. You can later extend it with match history, ratings,
          favorite sports, or profile photo upload.
        </Text>
      </View>

      <PrimaryButton title="Logout" onPress={logout} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    padding: 20,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    borderRadius: 44,
    height: 88,
    justifyContent: "center",
    marginBottom: 16,
    width: 88,
  },
  avatarText: {
    color: colors.primaryDark,
    fontSize: 34,
    fontWeight: "800",
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    marginTop: 18,
    padding: 20,
  },
  infoTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  infoText: {
    color: colors.subText,
    fontSize: 14,
    lineHeight: 21,
  },
  button: {
    marginTop: 20,
  },
});
