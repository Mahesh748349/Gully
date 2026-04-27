import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import GameCard from "../components/GameCard";
import PrimaryButton from "../components/PrimaryButton";
import SectionTitle from "../components/SectionTitle";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { subscribeToGames } from "../services/gameService";
import colors from "../theme/colors";

export default function ProfileScreen({ navigation }) {
  const { user, profile, logout } = useAuth();
  const [games, setGames] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToGames(setGames);
    return unsubscribe;
  }, []);

  const hostedGames = useMemo(
    () => games.filter((game) => game.creatorId === user?.uid),
    [games, user?.uid]
  );
  const openHostedGames = hostedGames.filter((game) => game.status === "open");
  const fullHostedGames = hostedGames.filter((game) => game.status === "full");
  const totalPlayersJoined = hostedGames.reduce((total, game) => total + (game.playerCount || 0), 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileCard}>
        <Text style={styles.memberTag}>Community organiser</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.name?.charAt(0)?.toUpperCase() || "G"}</Text>
        </View>
        <SectionTitle title={profile?.name || "Gully User"} subtitle={profile?.email || "No email available"} />
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Games hosted" value={hostedGames.length} tone="primary" />
        <StatCard label="Still open" value={openHostedGames.length} tone="success" />
        <StatCard label="Players reached" value={totalPlayersJoined} tone="accent" />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Your hosting summary</Text>
        <Text style={styles.infoText}>
          You currently have {openHostedGames.length} open games and {fullHostedGames.length} full games.
          Keep posting clear addresses and correct timing so players trust your listings.
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent hosted games</Text>
        {hostedGames.length > 0 ? (
          <Pressable onPress={() => navigation.navigate("Home")}>
            <Text style={styles.sectionLink}>Back to feed</Text>
          </Pressable>
        ) : null}
      </View>

      {hostedGames.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No hosted games yet</Text>
          <Text style={styles.emptyText}>
            Create your first match from the home screen and it will show up here with live stats.
          </Text>
        </View>
      ) : (
        hostedGames.slice(0, 3).map((game) => (
          <GameCard
            key={game.id}
            item={game}
            onPress={() => navigation.navigate("GameDetails", { gameId: game.id })}
          />
        ))
      )}

      <PrimaryButton title="Logout" onPress={logout} style={styles.button} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: 20,
    paddingBottom: 36,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  memberTag: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF1E7",
    borderRadius: 999,
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 14,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#E8F0FF",
    borderRadius: 48,
    height: 96,
    justifyContent: "center",
    marginBottom: 16,
    width: 96,
  },
  avatarText: {
    color: colors.primaryDark,
    fontSize: 36,
    fontWeight: "800",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
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
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  sectionLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 20,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  emptyText: {
    color: colors.subText,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  button: {
    marginTop: 20,
  },
});
