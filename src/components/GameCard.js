import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../theme/colors";
import { formatGameDate } from "../utils/date";
import { getSportMeta } from "../utils/sportMeta";

export default function GameCard({ item, onPress, distanceText }) {
  const sport = getSportMeta(item.sport);
  const seatsLeft = Math.max((item.maxPlayers || 0) - (item.playerCount || 0), 0);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.headerRow}>
        <View style={styles.sportRow}>
          <View style={[styles.iconWrap, { backgroundColor: sport.tint }]}>
            <Text style={styles.iconText}>{sport.icon}</Text>
          </View>
          <View>
            <Text style={styles.sport}>{item.sport}</Text>
            <Text style={styles.hostText}>Hosted by {item.creatorName}</Text>
          </View>
        </View>
        <Text style={[styles.badge, item.status === "full" && styles.fullBadge]}>{item.status}</Text>
      </View>
      <View style={styles.metaRow}>
        {item.skillLevel ? <Text style={styles.skillText}>Level: {item.skillLevel}</Text> : null}
        {distanceText ? <Text style={styles.distanceText}>{distanceText}</Text> : null}
      </View>
      <Text style={styles.location}>{item.locationName}</Text>
      {item.locality ? <Text style={styles.locality}>{item.locality}</Text> : null}
      <Text style={styles.info}>Time: {formatGameDate(item.gameTime)}</Text>
      <View style={styles.footerRow}>
        <Text style={styles.playerInfo}>
          Players: {item.playerCount}/{item.maxPlayers}
        </Text>
        <Text style={styles.seatsText}>{seatsLeft} spots left</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
    marginBottom: 14,
    padding: 18,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 18,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sportRow: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: 12,
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  iconText: {
    fontSize: 20,
  },
  sport: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  hostText: {
    color: colors.subText,
    fontSize: 12,
    marginTop: 3,
  },
  badge: {
    backgroundColor: "#EAFBF1",
    borderRadius: 999,
    color: colors.success,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
    textTransform: "capitalize",
  },
  fullBadge: {
    backgroundColor: "#FEE2E2",
    color: colors.danger,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  skillText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "700",
  },
  distanceText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  location: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 10,
  },
  locality: {
    color: colors.subText,
    fontSize: 13,
    marginTop: 6,
  },
  info: {
    color: colors.subText,
    fontSize: 14,
    marginTop: 8,
  },
  footerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  playerInfo: {
    color: colors.subText,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
  },
  seatsText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },
});
