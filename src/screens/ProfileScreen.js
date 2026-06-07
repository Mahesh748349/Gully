import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import GameCard from "../components/GameCard";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import SectionTitle from "../components/SectionTitle";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { subscribeToGames, subscribeToUserRequests } from "../services/gameService";
import colors from "../theme/colors";
import { calculateDistanceInKm } from "../utils/location";

const formatReverseGeocode = (items) => {
  const place = items?.[0];

  if (!place) {
    return {
      label: "Current location",
      locality: "Current location",
    };
  }

  const labelParts = [place.name, place.street, place.district, place.city, place.region].filter(Boolean);
  const locality = place.district || place.subregion || place.city || place.name || "Current location";

  return {
    label: [...new Set(labelParts)].join(", ") || locality,
    locality,
  };
};

export default function ProfileScreen({ navigation }) {
  const { user, profile, logout, updateProfile } = useAuth();
  const [games, setGames] = useState([]);
  const [requests, setRequests] = useState([]);
  const [savingLocation, setSavingLocation] = useState(false);
  const [manualLocality, setManualLocality] = useState(profile?.locality || "");
  const [manualLocationLabel, setManualLocationLabel] = useState(profile?.locationLabel || "");
  const [locationStatus, setLocationStatus] = useState("");

  useEffect(() => {
    const unsubscribeGames = subscribeToGames(setGames);
    const unsubscribeRequests = subscribeToUserRequests(user.uid, setRequests);

    return () => {
      unsubscribeGames();
      unsubscribeRequests();
    };
  }, [user.uid]);

  const hostedGames = useMemo(() => games.filter((game) => game.creatorId === user?.uid), [games, user?.uid]);
  const requestGames = useMemo(
    () =>
      requests
        .map((request) => ({
          request,
          game: games.find((game) => game.id === request.gameId),
        }))
        .filter((item) => item.game),
    [games, requests]
  );
  const joinedGames = useMemo(
    () => requestGames.filter((item) => item.request.status === "accepted").map((item) => item.game),
    [requestGames]
  );
  const acceptedRequests = requests.filter((request) => request.status === "accepted");
  const pendingRequests = requests.filter((request) => request.status === "pending");
  const rejectedRequests = requests.filter((request) => request.status === "rejected");
  const completionRate = requests.length ? Math.round((acceptedRequests.length / requests.length) * 100) : 0;
  const totalPlayersJoined = hostedGames.reduce((total, game) => total + (game.playerCount || 0), 0);

  const getDistanceText = (game) => {
    const distanceKm = calculateDistanceInKm(profile?.locationCoords, game.coordinates);

    if (distanceKm !== null) {
      return `${distanceKm.toFixed(1)} km away`;
    }

    return profile?.locationCoords ? "Game has no map pin" : "Set GPS for distance";
  };

  const getRequestStatusStyle = (status) => {
    if (status === "accepted") {
      return styles.acceptedStatus;
    }

    if (status === "rejected") {
      return styles.rejectedStatus;
    }

    return styles.pendingStatus;
  };

  const handleManualLocationSave = async () => {
    if (!manualLocality.trim() && !manualLocationLabel.trim()) {
      setLocationStatus("Enter a locality or area label first.");
      return;
    }

    try {
      setSavingLocation(true);
      await updateProfile({
        locality: manualLocality.trim() || manualLocationLabel.trim(),
        locationLabel: manualLocationLabel.trim() || manualLocality.trim(),
        locationCoords: null,
      });
      setLocationStatus("Locality saved.");
    } finally {
      setSavingLocation(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setSavingLocation(true);
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setLocationStatus("Location permission was denied. You can still save locality text manually.");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const locationCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      const reverseGeocode = await Location.reverseGeocodeAsync(locationCoords);
      const formatted = formatReverseGeocode(reverseGeocode);

      await updateProfile({
        locationLabel: formatted.label,
        locality: formatted.locality,
        locationCoords,
      });
      setManualLocality(formatted.locality);
      setManualLocationLabel(formatted.label);
      setLocationStatus("Current location saved with coordinates.");
    } catch (error) {
      setLocationStatus(`Could not save current location: ${error.message}`);
    } finally {
      setSavingLocation(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.profileCard}>
        <Text style={styles.memberTag}>Player profile</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.name?.charAt(0)?.toUpperCase() || "G"}</Text>
        </View>
        <SectionTitle title={profile?.name || "Gully User"} subtitle={profile?.email || "No email available"} />
        <Text style={styles.locationBadge}>
          {profile?.locality ? `Locality: ${profile.locality}` : "Set your locality for nearby games"}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Games hosted" value={hostedGames.length} tone="primary" />
        <StatCard label="Requests accepted" value={acceptedRequests.length} tone="success" />
        <StatCard label="Join success rate" value={`${completionRate}%`} tone="accent" />
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Pending requests" value={pendingRequests.length} tone="primary" />
        <StatCard label="Rejected requests" value={rejectedRequests.length} tone="accent" />
        <StatCard label="Players reached" value={totalPlayersJoined} tone="success" />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Update your locality</Text>
        <Text style={styles.infoText}>
          Save your area so the home feed can sort nearby games. GPS coordinates are optional and only used for distance and map centering.
        </Text>
        <PrimaryButton
          title="Use Current Location"
          onPress={handleUseCurrentLocation}
          loading={savingLocation}
          variant="secondary"
          style={styles.currentLocationButton}
        />
        <InputField
          label="Locality"
          onChangeText={setManualLocality}
          placeholder="Example: Dadar"
          value={manualLocality}
          style={styles.manualField}
        />
        <InputField
          label="Area / address label"
          onChangeText={setManualLocationLabel}
          placeholder="Example: Dadar, Mumbai"
          value={manualLocationLabel}
          style={styles.manualField}
        />
        <PrimaryButton title="Save Locality" onPress={handleManualLocationSave} style={styles.manualButton} />
        {savingLocation ? <Text style={styles.savingText}>Saving locality...</Text> : null}
        {locationStatus ? <Text style={styles.locationStatus}>{locationStatus}</Text> : null}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Performance summary</Text>
        <Text style={styles.infoText}>
          You have hosted {hostedGames.length} games, joined {joinedGames.length} games, and your accepted join rate is {completionRate}%.
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My join requests</Text>
        <Text style={styles.sectionLink}>{requests.length} sent</Text>
      </View>

      {requestGames.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No requests sent yet</Text>
          <Text style={styles.emptyText}>Open a game and send a join request. Its status will appear here.</Text>
        </View>
      ) : (
        requestGames.map(({ request, game }) => (
          <Pressable
            key={`${request.gameId}-${request.userId}`}
            style={styles.requestStatusCard}
            onPress={() => navigation.navigate("GameDetails", { gameId: game.id })}
          >
            <View style={styles.requestStatusHeader}>
              <View style={styles.requestStatusCopy}>
                <Text style={styles.requestGameTitle} numberOfLines={1}>
                  {game.sport} at {game.locality || game.locationName}
                </Text>
                <Text style={styles.requestGameMeta} numberOfLines={1}>
                  Hosted by {game.creatorName} | {getDistanceText(game)}
                </Text>
              </View>
              <Text style={[styles.requestStatusBadge, getRequestStatusStyle(request.status)]}>{request.status}</Text>
            </View>
            <Text style={styles.requestLocation} numberOfLines={2}>
              {game.locationName}
            </Text>
          </Pressable>
        ))
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent hosted games</Text>
      </View>

      {hostedGames.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No hosted games yet</Text>
          <Text style={styles.emptyText}>Create your first match from the home screen and it will show up here.</Text>
        </View>
      ) : (
        hostedGames.slice(0, 3).map((game) => (
          <GameCard key={game.id} item={game} onPress={() => navigation.navigate("GameDetails", { gameId: game.id })} />
        ))
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent joined games</Text>
        <Text style={styles.sectionLink}>{joinedGames.length} joined</Text>
      </View>

      {joinedGames.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No joined games yet</Text>
          <Text style={styles.emptyText}>Send a join request from the home feed and accepted matches will appear here.</Text>
        </View>
      ) : (
        joinedGames.slice(0, 3).map((game) => (
          <GameCard
            key={`joined-${game.id}`}
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
    padding: 16,
    paddingBottom: 36,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  memberTag: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF4E8",
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
    backgroundColor: colors.softCard,
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
  locationBadge: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
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
  savingText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
  },
  locationStatus: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 10,
  },
  currentLocationButton: {
    marginTop: 12,
  },
  manualField: {
    marginTop: 12,
  },
  manualButton: {
    marginTop: 14,
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
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
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
  requestStatusCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  requestStatusHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  requestStatusCopy: {
    flex: 1,
  },
  requestGameTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  requestGameMeta: {
    color: colors.subText,
    fontSize: 12,
    marginTop: 5,
  },
  requestStatusBadge: {
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
    textTransform: "capitalize",
  },
  pendingStatus: {
    backgroundColor: "#FFF4D6",
    color: "#A16207",
  },
  acceptedStatus: {
    backgroundColor: "#DCFCE7",
    color: colors.success,
  },
  rejectedStatus: {
    backgroundColor: "#FEE2E2",
    color: colors.danger,
  },
  requestLocation: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 10,
  },
  button: {
    marginTop: 20,
  },
});
