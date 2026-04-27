import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import GameCard from "../components/GameCard";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import SectionTitle from "../components/SectionTitle";
import StatCard from "../components/StatCard";
import { SPORTS } from "../constants/sports";
import { useAuth } from "../context/AuthContext";
import { subscribeToGames } from "../services/gameService";
import colors from "../theme/colors";
import { getSportMeta } from "../utils/sportMeta";

export default function HomeScreen({ navigation }) {
  const { user, profile } = useAuth();
  const [games, setGames] = useState([]);
  const [sportFilter, setSportFilter] = useState("All");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToGames(setGames);
    return unsubscribe;
  }, []);

  const filteredGames = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return games
      .filter((game) => game.status === "open")
      .filter((game) => (sportFilter === "All" ? true : game.sport === sportFilter))
      .filter((game) =>
        normalizedSearch
          ? game.locationName?.toLowerCase().includes(normalizedSearch) ||
            game.sport?.toLowerCase().includes(normalizedSearch)
          : true
      );
  }, [games, searchText, sportFilter]);

  const myHostedGames = useMemo(
    () => games.filter((game) => game.creatorId === user?.uid).slice(0, 5),
    [games, user?.uid]
  );

  const openGamesCount = games.filter((game) => game.status === "open").length;
  const totalSpotsLeft = filteredGames.reduce(
    (total, game) => total + Math.max((game.maxPlayers || 0) - (game.playerCount || 0), 0),
    0
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredGames}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GameCard item={item} onPress={() => navigation.navigate("GameDetails", { gameId: item.id })} />
        )}
        ListHeaderComponent={
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroEyebrow}>Live community board</Text>
              <SectionTitle
                title={`Hi ${profile?.name?.split(" ")[0] || "Player"}`}
                subtitle="Find your next game, host one in minutes, and keep local sports moving."
                light
              />
              <View style={styles.headerActions}>
                <PrimaryButton
                  title="Create Game"
                  onPress={() => navigation.navigate("CreateGame")}
                  style={styles.headerButton}
                />
                <Pressable style={styles.profileButton} onPress={() => navigation.navigate("Profile")}>
                  <Text style={styles.profileButtonText}>Profile</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.statsRow}>
              <StatCard label="Open games today" value={openGamesCount} tone="primary" />
              <StatCard label="Your hosted games" value={myHostedGames.length} tone="success" />
              <StatCard label="Open player spots" value={totalSpotsLeft} tone="accent" />
            </View>

            <View style={styles.filtersCard}>
              <InputField
                label="Search by sport or address"
                onChangeText={setSearchText}
                placeholder="Example: cricket or Dadar"
                value={searchText}
              />

              <View style={styles.filterRow}>
                {["All", ...SPORTS].map((item) => {
                  const selected = sportFilter === item;
                  const sport = getSportMeta(item);

                  return (
                    <Text
                      key={item}
                      onPress={() => setSportFilter(item)}
                      style={[styles.filterChip, selected && styles.selectedFilterChip]}
                    >
                      {item === "All" ? "All" : `${sport.icon} ${item}`}
                    </Text>
                  );
                })}
              </View>
            </View>

            {myHostedGames.length > 0 ? (
              <View style={styles.hostedSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Your hosted games</Text>
                  <Text style={styles.sectionHint}>Quick view</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hostedRow}>
                  {myHostedGames.map((game) => (
                    <Pressable
                      key={game.id}
                      style={styles.hostedCard}
                      onPress={() => navigation.navigate("GameDetails", { gameId: game.id })}
                    >
                      <Text style={styles.hostedSport}>{game.sport}</Text>
                      <Text style={styles.hostedAddress} numberOfLines={2}>
                        {game.locationName}
                      </Text>
                      <Text style={styles.hostedMeta}>
                        {game.playerCount}/{game.maxPlayers} players
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Discover games</Text>
              <Text style={styles.sectionHint}>{filteredGames.length} showing</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No games found</Text>
            <Text style={styles.emptySubtitle}>Create a game or change your filters to see results.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 22,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 18,
  },
  heroEyebrow: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F0FF",
    borderRadius: 999,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 14,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  headerButton: {
    flex: 1,
  },
  profileButton: {
    alignItems: "center",
    backgroundColor: "#EAF2FF",
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  profileButtonText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  filtersCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    marginTop: 18,
    padding: 18,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  filterChip: {
    backgroundColor: "#EFF3F8",
    borderRadius: 999,
    color: colors.text,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  selectedFilterChip: {
    backgroundColor: colors.primary,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  hostedSection: {
    marginTop: 20,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  sectionHint: {
    color: colors.subText,
    fontSize: 13,
    fontWeight: "600",
  },
  hostedRow: {
    gap: 12,
    paddingRight: 8,
  },
  hostedCard: {
    backgroundColor: "#0F62FE",
    borderRadius: 22,
    minHeight: 128,
    padding: 18,
    width: 220,
  },
  hostedSport: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  hostedAddress: {
    color: "#DDE8FF",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  hostedMeta: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12,
  },
  listContent: {
    paddingTop: 0,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 20,
    marginTop: 10,
    padding: 24,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  emptySubtitle: {
    color: colors.subText,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
  },
});
