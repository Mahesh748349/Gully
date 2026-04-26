import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import GameCard from "../components/GameCard";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import SectionTitle from "../components/SectionTitle";
import { SPORTS } from "../constants/sports";
import { useAuth } from "../context/AuthContext";
import { subscribeToGames } from "../services/gameService";
import colors from "../theme/colors";

export default function HomeScreen({ navigation }) {
  const { profile } = useAuth();
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

  return (
    <View style={styles.container}>
      <View style={styles.topCard}>
        <SectionTitle
          title={`Hi ${profile?.name?.split(" ")[0] || "Player"}`}
          subtitle="Browse open games in real time and filter them by sport or address."
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

        <InputField
          label="Search by sport or address"
          onChangeText={setSearchText}
          placeholder="Example: cricket or Dadar"
          value={searchText}
          style={styles.searchField}
        />

        <View style={styles.filterRow}>
          {["All", ...SPORTS].map((item) => {
            const selected = sportFilter === item;

            return (
              <Text
                key={item}
                onPress={() => setSportFilter(item)}
                style={[styles.filterChip, selected && styles.selectedFilterChip]}
              >
                {item}
              </Text>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filteredGames}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GameCard item={item} onPress={() => navigation.navigate("GameDetails", { gameId: item.id })} />
        )}
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
    padding: 20,
  },
  topCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
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
    backgroundColor: "#E5EEFF",
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  profileButtonText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "700",
  },
  searchField: {
    marginTop: 18,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  filterChip: {
    backgroundColor: "#EEF2FF",
    borderRadius: 999,
    color: colors.primaryDark,
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  selectedFilterChip: {
    backgroundColor: colors.primary,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 18,
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
