import React, { useMemo, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import SectionTitle from "../components/SectionTitle";
import { SKILL_LEVELS } from "../constants/skillLevels";
import { SPORTS } from "../constants/sports";
import { useAuth } from "../context/AuthContext";
import { createGame } from "../services/gameService";
import colors from "../theme/colors";
import { getSportMeta } from "../utils/sportMeta";

const mergeDateAndTime = (datePart, timePart) => {
  const nextDate = new Date(datePart);
  nextDate.setHours(timePart.getHours(), timePart.getMinutes(), 0, 0);
  return nextDate;
};

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

export default function CreateGameScreen({ navigation }) {
  const { user, profile } = useAuth();
  const [sport, setSport] = useState(SPORTS[0]);
  const [skillLevel, setSkillLevel] = useState(SKILL_LEVELS[3]);
  const [maxPlayers, setMaxPlayers] = useState("10");
  const [gameDate, setGameDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [gameTime, setGameTime] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [locationName, setLocationName] = useState("");
  const [locality, setLocality] = useState(profile?.locality || "");
  const [coordinates, setCoordinates] = useState(null);
  const [notes, setNotes] = useState("");
  const [pickerMode, setPickerMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  const scheduledAt = mergeDateAndTime(gameDate, gameTime);
  const finalLocationName = locationName.trim();
  const finalLocality = locality.trim() || finalLocationName;
  const mapRegion = useMemo(
    () =>
      coordinates
        ? {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }
        : null,
    [coordinates]
  );

  const handleCreateGame = async () => {
    if (!finalLocationName) {
      Alert.alert("Location required", "Enter the ground or address.");
      return;
    }

    if (!maxPlayers || Number(maxPlayers) < 2) {
      Alert.alert("Invalid player count", "Enter at least 2 players.");
      return;
    }

    if (scheduledAt.getTime() <= Date.now()) {
      Alert.alert("Future time required", "Please choose a date and time in the future.");
      return;
    }

    try {
      setLoading(true);
      const gameRef = await createGame({
        creator: {
          uid: user.uid,
          name: profile?.name || "Gully User",
        },
        sport,
        skillLevel,
        gameTime: scheduledAt.toISOString(),
        locationName: finalLocationName,
        locality: finalLocality,
        coordinates,
        maxPlayers,
        notes,
      });

      Alert.alert("Game created", "Your game is now live.");
      navigation.replace("GameDetails", { gameId: gameRef.id });
    } catch (error) {
      Alert.alert("Could not create game", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickerChange = (_, selectedDate) => {
    if (Platform.OS === "android") {
      setPickerMode(null);
    }

    if (!selectedDate) {
      return;
    }

    if (pickerMode === "date") {
      setGameDate(selectedDate);
      return;
    }

    setGameTime(selectedDate);
  };

  const handleUseCurrentLocation = async () => {
    try {
      setLocating(true);
      setLocationStatus("");

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Location permission needed", "Allow location access or create the game without a map pin.");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const nextCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      const reverseGeocode = await Location.reverseGeocodeAsync(nextCoordinates);
      const formatted = formatReverseGeocode(reverseGeocode);

      setCoordinates(nextCoordinates);
      setLocationName((current) => current.trim() || formatted.label);
      setLocality((current) => current.trim() || formatted.locality);
      setLocationStatus("Current location pinned for the live map.");
    } catch (error) {
      Alert.alert("Could not use current location", error.message);
    } finally {
      setLocating(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.heroCard}>
        <Text style={styles.heroTag}>Host a match</Text>
        <SectionTitle
          title="Post a new game"
          subtitle="Add the sport, schedule, player limit, and ground details. Use GPS when you want the match on the live map."
          light
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Sport type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {SPORTS.map((item) => {
            const selected = sport === item;
            const sportItem = getSportMeta(item);

            return (
              <Pressable
                key={item}
                onPress={() => setSport(item)}
                style={[styles.chip, styles.sportChip, selected && styles.selectedSportChip]}
              >
                <Text style={[styles.chipText, selected && styles.selectedChipText]}>
                  {sportItem.icon} {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.label}>Skill level</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {SKILL_LEVELS.map((item) => {
            const selected = skillLevel === item;

            return (
              <Pressable
                key={item}
                onPress={() => setSkillLevel(item)}
                style={[styles.chip, styles.skillChip, selected && styles.selectedSkillChip]}
              >
                <Text style={[styles.chipText, styles.skillChipText, selected && styles.selectedChipText]}>{item}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <InputField
          label="Maximum players"
          keyboardType="number-pad"
          onChangeText={setMaxPlayers}
          placeholder="10"
          value={maxPlayers}
          style={styles.field}
        />

        <Text style={styles.label}>Game schedule</Text>
        <View style={styles.scheduleRow}>
          <Pressable style={styles.scheduleBox} onPress={() => setPickerMode("date")}>
            <Text style={styles.scheduleLabel}>Date</Text>
            <Text style={styles.scheduleValue}>
              {gameDate.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}
            </Text>
          </Pressable>
          <Pressable style={styles.scheduleBox} onPress={() => setPickerMode("time")}>
            <Text style={styles.scheduleLabel}>Time</Text>
            <Text style={styles.scheduleValue}>
              {gameTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </Text>
          </Pressable>
        </View>

        {pickerMode ? (
          <DateTimePicker
            value={pickerMode === "date" ? gameDate : gameTime}
            mode={pickerMode}
            minimumDate={pickerMode === "date" ? new Date() : undefined}
            onChange={handlePickerChange}
          />
        ) : null}

        <InputField
          label="Ground / address"
          onChangeText={setLocationName}
          placeholder="Example: Shivaji Park, Dadar, Mumbai"
          value={locationName}
          style={styles.field}
        />

        <InputField
          label="Locality"
          onChangeText={setLocality}
          placeholder="Example: Dadar"
          value={locality}
          style={styles.field}
        />

        <View style={styles.locationActions}>
          <PrimaryButton
            title="Use Current Location"
            onPress={handleUseCurrentLocation}
            loading={locating}
            variant="secondary"
            style={styles.locationActionButton}
          />
          {coordinates ? (
            <Pressable
              style={styles.clearPinButton}
              onPress={() => {
                setCoordinates(null);
                setLocationStatus("Map pin cleared. The game can still be created with address text.");
              }}
            >
              <Text style={styles.clearPinText}>Clear Pin</Text>
            </Pressable>
          ) : null}
        </View>
        {locationStatus ? <Text style={styles.statusText}>{locationStatus}</Text> : null}

        {coordinates ? (
          <View style={styles.mapWrap}>
            <MapView provider={PROVIDER_GOOGLE} style={styles.map} region={mapRegion}>
              <Marker coordinate={coordinates} title={locationName || "Game location"} description={locality} />
            </MapView>
          </View>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderTitle}>No map pin yet</Text>
            <Text style={styles.mapPlaceholderText}>The game will still work. Use current location to show it on Live Map.</Text>
          </View>
        )}

        <InputField
          label="Match notes"
          multiline
          onChangeText={setNotes}
          placeholder="Example: Bring your own bat, 7 AM sharp."
          value={notes}
          style={styles.field}
        />

        <PrimaryButton title="Create Game" onPress={handleCreateGame} loading={loading} style={styles.button} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: colors.ink,
    borderRadius: 22,
    marginBottom: 16,
    padding: 20,
  },
  heroTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 12,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 18,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 18,
  },
  chipsRow: {
    gap: 10,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  sportChip: {
    backgroundColor: colors.softCard,
    borderColor: "#D7E5FF",
    borderWidth: 1,
  },
  selectedSportChip: {
    backgroundColor: colors.primary,
  },
  skillChip: {
    backgroundColor: "#FFF4E8",
    borderColor: "#FFE0C2",
    borderWidth: 1,
  },
  skillChipText: {
    color: "#8A4A1F",
  },
  selectedSkillChip: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  selectedChipText: {
    color: "#FFFFFF",
  },
  field: {
    marginTop: 6,
  },
  scheduleRow: {
    flexDirection: "row",
    gap: 12,
  },
  scheduleBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  scheduleLabel: {
    color: colors.subText,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  scheduleValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
  },
  locationActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  locationActionButton: {
    flex: 1,
  },
  clearPinButton: {
    alignItems: "center",
    backgroundColor: "#FFF1E7",
    borderColor: "#FFE0C2",
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 16,
  },
  clearPinText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "800",
  },
  statusText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
  },
  mapWrap: {
    borderRadius: 20,
    marginTop: 16,
    overflow: "hidden",
  },
  map: {
    height: 210,
    width: "100%",
  },
  mapPlaceholder: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 16,
    minHeight: 130,
    padding: 18,
  },
  mapPlaceholderTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  mapPlaceholderText: {
    color: colors.subText,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    textAlign: "center",
  },
  button: {
    marginTop: 24,
  },
});
