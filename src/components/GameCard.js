import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../theme/colors";
import { formatGameDate } from "../utils/date";

export default function GameCard({ item, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={styles.sport}>{item.sport}</Text>
        <Text style={styles.badge}>{item.status}</Text>
      </View>
      <Text style={styles.location}>{item.locationName}</Text>
      <Text style={styles.info}>Time: {formatGameDate(item.gameTime)}</Text>
      <Text style={styles.info}>
        Players: {item.playerCount}/{item.maxPlayers}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginBottom: 14,
    padding: 18,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sport: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  badge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 999,
    color: colors.success,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
    textTransform: "capitalize",
  },
  location: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 10,
  },
  info: {
    color: colors.subText,
    fontSize: 14,
    marginTop: 8,
  },
});
