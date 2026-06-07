import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../context/AuthContext";
import { subscribeToGames } from "../services/gameService";
import colors from "../theme/colors";
import { calculateDistanceInKm } from "../utils/location";

const DEFAULT_REGION = {
  latitude: 19.076,
  longitude: 72.8777,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
};

const toRegion = (coordinates, delta = 0.04) => ({
  latitude: coordinates.latitude,
  longitude: coordinates.longitude,
  latitudeDelta: delta,
  longitudeDelta: delta,
});

export default function PlayerMapScreen({ navigation }) {
  const mapRef = useRef(null);
  const hasCenteredOnPlayer = useRef(false);
  const { profile } = useAuth();
  const [games, setGames] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [canShowUserLocation, setCanShowUserLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState("idle");

  useEffect(() => {
    const unsubscribe = subscribeToGames(setGames);
    return unsubscribe;
  }, []);

  useEffect(() => {
    let locationSubscription;
    let mounted = true;

    const startLocationWatch = async () => {
      setLocationStatus("loading");
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        if (mounted) {
          setCanShowUserLocation(false);
          setLocationStatus("denied");
        }
        return;
      }

      if (mounted) {
        setCanShowUserLocation(true);
      }

      const lastKnownPosition = await Location.getLastKnownPositionAsync();
      if (mounted && lastKnownPosition?.coords) {
        setCurrentLocation({
          latitude: lastKnownPosition.coords.latitude,
          longitude: lastKnownPosition.coords.longitude,
        });
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 25,
          timeInterval: 10000,
        },
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus("ready");
        }
      );

      if (mounted) {
        setLocationStatus("ready");
      }
    };

    startLocationWatch().catch((error) => {
      setCanShowUserLocation(false);
      setLocationStatus("error");
      Alert.alert("Location unavailable", error.message);
    });

    return () => {
      mounted = false;
      locationSubscription?.remove();
    };
  }, []);

  const playerLocation = currentLocation || profile?.locationCoords || null;
  const openGames = useMemo(() => games.filter((game) => game.status === "open"), [games]);

  const openGamesWithCoordinates = useMemo(
    () =>
      openGames
        .filter((game) => game.coordinates)
        .map((game) => ({
          ...game,
          distanceKm: calculateDistanceInKm(playerLocation, game.coordinates),
        }))
        .sort((first, second) => {
          const firstDistance = first.distanceKm ?? Number.MAX_SAFE_INTEGER;
          const secondDistance = second.distanceKm ?? Number.MAX_SAFE_INTEGER;
          return firstDistance - secondDistance;
        }),
    [openGames, playerLocation]
  );
  const openGamesWithoutPins = openGames.length - openGamesWithCoordinates.length;

  const initialRegion = playerLocation
    ? toRegion(playerLocation, 0.08)
    : openGamesWithCoordinates[0]?.coordinates
      ? toRegion(openGamesWithCoordinates[0].coordinates, 0.08)
      : DEFAULT_REGION;

  useEffect(() => {
    if (!playerLocation || hasCenteredOnPlayer.current) {
      return;
    }

    hasCenteredOnPlayer.current = true;
    mapRef.current?.animateToRegion(toRegion(playerLocation, 0.08), 600);
  }, [playerLocation]);

  const handleCenterOnPlayer = () => {
    if (!playerLocation) {
      Alert.alert("Location not available", "Allow device location or set your locality in Profile.");
      return;
    }

    mapRef.current?.animateToRegion(toRegion(playerLocation), 600);
  };

  const handleFocusGame = (game) => {
    mapRef.current?.animateToRegion(toRegion(game.coordinates), 600);
  };

  const locationLabel =
    locationStatus === "loading"
      ? "Getting your location..."
      : locationStatus === "error"
        ? "Location unavailable"
        : locationStatus === "denied"
          ? "Location permission off"
          : playerLocation
            ? profile?.locationLabel || "Using live location"
            : "Set locality for nearby sorting";

  const emptyTitle = openGames.length === 0 ? "No open games yet" : "No pinned games yet";
  const emptyText =
    openGames.length === 0
      ? "Create the first game and pin its ground so it appears here."
      : `${openGamesWithoutPins} open game${openGamesWithoutPins === 1 ? "" : "s"} need a map pin. Create games by selecting a Google result or using current location.`;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={canShowUserLocation}
        showsMyLocationButton={false}
      >
        {openGamesWithCoordinates.map((game) => (
          <Marker
            key={game.id}
            coordinate={game.coordinates}
            title={`${game.sport} at ${game.locality || "nearby"}`}
            description={game.locationName}
            onCalloutPress={() => navigation.navigate("GameDetails", { gameId: game.id })}
          />
        ))}
      </MapView>

      <View style={styles.topPanel}>
        <View style={styles.topCopy}>
          <Text style={styles.eyebrow}>Realtime player map</Text>
          <Text style={styles.title}>{openGamesWithCoordinates.length} open games nearby</Text>
          <Text style={styles.subtitle}>{locationLabel}</Text>
        </View>
        <Pressable style={styles.locationButton} onPress={handleCenterOnPlayer}>
          <Text style={styles.locationButtonText}>Center</Text>
        </Pressable>
      </View>

      <View style={styles.bottomPanel}>
        {openGamesWithCoordinates.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{emptyTitle}</Text>
            <Text style={styles.emptyText}>{emptyText}</Text>
            <View style={styles.emptyActions}>
              <Pressable style={styles.emptyAction} onPress={() => navigation.navigate("CreateGame")}>
                <Text style={styles.emptyActionText}>Create Pinned Game</Text>
              </Pressable>
              <Pressable style={styles.emptySecondaryAction} onPress={() => navigation.navigate("Profile")}>
                <Text style={styles.emptySecondaryActionText}>Set My Locality</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          openGamesWithCoordinates.slice(0, 3).map((game) => (
            <Pressable key={game.id} style={styles.gameRow} onPress={() => handleFocusGame(game)}>
              <View style={styles.markerDot} />
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle} numberOfLines={1}>
                  {game.sport} - {game.locality || game.locationName}
                </Text>
                <Text style={styles.gameMeta} numberOfLines={1}>
                  {game.distanceKm !== null ? `${game.distanceKm.toFixed(1)} km away` : "Set GPS for distance"} |{" "}
                  {game.playerCount}/{game.maxPlayers} players
                </Text>
              </View>
              <Pressable
                style={styles.detailsButton}
                onPress={() => navigation.navigate("GameDetails", { gameId: game.id })}
              >
                <Text style={styles.detailsButtonText}>Open</Text>
              </Pressable>
            </Pressable>
          ))
        )}

        <PrimaryButton title="Create a Game" onPress={() => navigation.navigate("CreateGame")} style={styles.createButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topPanel: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    left: 16,
    padding: 16,
    position: "absolute",
    right: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 18,
    top: 16,
  },
  topCopy: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  },
  subtitle: {
    color: colors.subText,
    fontSize: 13,
    marginTop: 4,
  },
  locationButton: {
    backgroundColor: colors.softCard,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  locationButtonText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "800",
  },
  bottomPanel: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    bottom: 0,
    left: 0,
    padding: 16,
    paddingBottom: 24,
    position: "absolute",
    right: 0,
  },
  emptyState: {
    paddingVertical: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  emptyText: {
    color: colors.subText,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  emptyActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  emptyAction: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 10,
  },
  emptyActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  emptySecondaryAction: {
    alignItems: "center",
    backgroundColor: colors.softCard,
    borderColor: "#D7E5FF",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 10,
  },
  emptySecondaryActionText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  gameRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
  },
  markerDot: {
    backgroundColor: colors.primary,
    borderColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 3,
    height: 18,
    width: 18,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  gameMeta: {
    color: colors.subText,
    fontSize: 13,
    marginTop: 4,
  },
  detailsButton: {
    backgroundColor: "#FFF1E7",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  detailsButtonText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "800",
  },
  createButton: {
    marginTop: 10,
  },
});
