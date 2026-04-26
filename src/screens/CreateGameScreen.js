import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import SectionTitle from "../components/SectionTitle";
import { SPORTS } from "../constants/sports";
import { useAuth } from "../context/AuthContext";
import { createGame } from "../services/gameService";
import colors from "../theme/colors";

export default function CreateGameScreen({ navigation }) {
  const { user, profile } = useAuth();
  const [sport, setSport] = useState(SPORTS[0]);
  const [maxPlayers, setMaxPlayers] = useState("10");
  const [gameTime, setGameTime] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [locationName, setLocationName] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateGame = async () => {
    if (!locationName.trim()) {
      Alert.alert("Address required", "Please enter the game address or ground name.");
      return;
    }

    if (!maxPlayers || Number(maxPlayers) < 2) {
      Alert.alert("Invalid player count", "Enter at least 2 players.");
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
        gameTime: gameTime.toISOString(),
        locationName: locationName.trim(),
        maxPlayers,
      });

      Alert.alert("Game created", "Your game is now live for players.");
      navigation.replace("GameDetails", { gameId: gameRef.id });
    } catch (error) {
      Alert.alert("Could not create game", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <SectionTitle
          title="Post a new game"
          subtitle="Choose a sport, set the time, and enter the game address so players know where to come."
        />

        <Text style={styles.label}>Sport type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sportsRow}>
          {SPORTS.map((item) => {
            const selected = sport === item;

            return (
              <Text
                key={item}
                onPress={() => setSport(item)}
                style={[styles.sportChip, selected && styles.selectedSportChip]}
              >
                {item}
              </Text>
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

        <Text style={styles.label}>Game time</Text>
        <Text style={styles.timeValue} onPress={() => setShowPicker(true)}>
          {gameTime.toLocaleString()}
        </Text>
        {showPicker ? (
          <DateTimePicker
            value={gameTime}
            mode="datetime"
            minimumDate={new Date()}
            onChange={(_, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) {
                setGameTime(selectedDate);
              }
            }}
          />
        ) : null}

        <InputField
          label="Ground / address"
          onChangeText={setLocationName}
          placeholder="Example: Shivaji Park, Dadar, Mumbai"
          value={locationName}
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
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 10,
  },
  sportsRow: {
    gap: 10,
  },
  sportChip: {
    backgroundColor: "#EEF2FF",
    borderRadius: 999,
    color: colors.primaryDark,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  selectedSportChip: {
    backgroundColor: colors.primary,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  field: {
    marginTop: 6,
  },
  timeValue: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  button: {
    marginTop: 24,
  },
});
