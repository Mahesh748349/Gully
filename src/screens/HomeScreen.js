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
import { calculateDistanceInKm } from "../utils/location";
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

  const enrichedGames = useMemo(
    () =>
      games.map((game) => ({
        ...game,
        distanceKm: calculateDistanceInKm(profile?.locationCoords, game.coordinates),
      })),
    [games, profile?.locationCoords]
  );

  const filteredGames = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return enrichedGames
      .filter((game) => game.status === "open")
      .filter((game) => (sportFilter === "All" ? true : game.sport === sportFilter))
      .filter((game) =>
        normalizedSearch
          ? game.locationName?.toLowerCase().includes(normalizedSearch) ||
            game.sport?.toLowerCase().includes(normalizedSearch) ||
            game.locality?.toLowerCase().includes(normalizedSearch)
          : true
      )
      .sort((first, second) => {
        const firstDistance = first.distanceKm ?? Number.MAX_SAFE_INTEGER;
        const secondDistance = second.distanceKm ?? Number.MAX_SAFE_INTEGER;
        return firstDistance - secondDistance;
      });
  }, [enrichedGames, searchText, sportFilter]);

  const myHostedGames = useMemo(
    () => enrichedGames.filter((game) => game.creatorId === user?.uid).slice(0, 5),
    [enrichedGames, user?.uid]
  );

  const nearbyGamesCount = enrichedGames.filter(
    (game) => game.distanceKm !== null && game.distanceKm <= 10 && game.status === "open"
  ).length;
  const openGamesCount = enrichedGames.filter((game) => game.status === "open").length;
  const totalSpotsLeft = filteredGames.reduce(
    (total, game) => total + Math.max((game.maxPlayers || 0) - (game.playerCount || 0), 0),
    0
  );
  const getDistanceText = (game) => {
    if (game.distanceKm !== null) {
      return `${game.distanceKm.toFixed(1)} km away`;
    }

    return profile?.locationCoords ? "No map pin" : "Set GPS for distance";
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredGames}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GameCard
            item={item}
            distanceText={getDistanceText(item)}
            onPress={() => navigation.navigate("GameDetails", { gameId: item.id })}
          />
        )}
        ListHeaderComponent={
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <Text style={styles.heroEyebrow}>Local sports network</Text>
                <Text style={styles.liveBadge}>Live</Text>
              </View>
              <SectionTitle
                title={`Hi ${profile?.name?.split(" ")[0] || "Player"}`}
                subtitle={
                  profile?.locationLabel
                    ? `Showing games around ${profile.locationLabel}.`
                    : "Set your locality in Profile to find nearby matches faster."
                }
                light
              />
              <View style={styles.headerActions}>
                <PrimaryButton
                  title="Create Game"
                  onPress={() => navigation.navigate("CreateGame")}
                  style={styles.headerButton}
                />
                <Pressable style={styles.actionTile} onPress={() => navigation.navigate("PlayerMap")}>
                  <Text style={styles.actionIcon}>M</Text>
                  <Text style={styles.actionText}>Live Map</Text>
                </Pressable>
                <Pressable style={styles.actionTile} onPress={() => navigation.navigate("Profile")}>
                  <Text style={styles.actionIcon}>P</Text>
                  <Text style={styles.actionText}>Profile</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.statsRow}>
              <StatCard label="Nearby open games" value={nearbyGamesCount} tone="primary" />
              <StatCard label="Your hosted games" value={myHostedGames.length} tone="success" />
              <StatCard label="Open player spots" value={totalSpotsLeft} tone="accent" />
            </View>

            <View style={styles.filtersCard}>
              <InputField
                label="Search by sport or locality"
                onChangeText={setSearchText}
                placeholder="Example: cricket or Dadar"
                value={searchText}
              />

              <View style={styles.filterRow}>
                {["All", ...SPORTS].map((item) => {
                  const selected = sportFilter === item;
                  const sport = getSportMeta(item);

                  return (
                    <Pressable
                      key={item}
                      onPress={() => setSportFilter(item)}
                      style={[styles.filterChip, selected && styles.selectedFilterChip]}
                    >
                      <Text style={[styles.filterChipText, selected && styles.selectedFilterChipText]}>
                        {item === "All" ? "All" : `${sport.icon} ${item}`}
                      </Text>
                    </Pressable>
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
                        {game.locality || "No locality"} | {game.playerCount}/{game.maxPlayers}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Discover games</Text>
              <Text style={styles.sectionHint}>{filteredGames.length} of {openGamesCount} open</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No games found</Text>
            <Text style={styles.emptySubtitle}>
              Try another sport or update your locality in Profile for better nearby results.
            </Text>
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroCard: {
    backgroundColor: colors.ink,
    borderRadius: 24,
    padding: 20,
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 24,
  },
  heroTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroEyebrow: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 14,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  liveBadge: {
    backgroundColor: "#D1FAE5",
    borderRadius: 999,
    color: colors.success,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 20,
  },
  headerButton: {
    flexBasis: "100%",
  },
  actionTile: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 72,
    minWidth: 92,
    padding: 10,
  },
  actionIcon: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  actionText: {
    color: "#DDE8FF",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  filtersCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  selectedFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  selectedFilterChipText: {
    color: "#FFFFFF",
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
    backgroundColor: colors.ink,
    borderRadius: 18,
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
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
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
