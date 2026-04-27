import React, { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
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

export default function CreateGameScreen({ navigation }) {
  const { user, profile } = useAuth();
  const [sport, setSport] = useState(SPORTS[0]);
  const [skillLevel, setSkillLevel] = useState(SKILL_LEVELS[3]);
  const [maxPlayers, setMaxPlayers] = useState("10");
  const [gameDate, setGameDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [gameTime, setGameTime] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [locationName, setLocationName] = useState("");
  const [notes, setNotes] = useState("");
  const [pickerMode, setPickerMode] = useState(null);
  const [loading, setLoading] = useState(false);

  const scheduledAt = mergeDateAndTime(gameDate, gameTime);

  const handleCreateGame = async () => {
    if (!locationName.trim()) {
      Alert.alert("Address required", "Please enter the game address or ground name.");
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
        locationName: locationName.trim(),
        maxPlayers,
        notes,
      });

      Alert.alert("Game created", "Your game is now live for players.");
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

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.heroCard}>
        <Text style={styles.heroTag}>Host a match</Text>
        <SectionTitle
          title="Post a new game"
          subtitle="Choose a sport, set the date and time, and enter the game address so players know where to come."
          light
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Sport type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sportsRow}>
          {SPORTS.map((item) => {
            const selected = sport === item;
            const sportItem = getSportMeta(item);

            return (
              <Text
                key={item}
                onPress={() => setSport(item)}
                style={[styles.sportChip, selected && styles.selectedSportChip]}
              >
                {sportItem.icon} {item}
              </Text>
            );
          })}
        </ScrollView>

        <Text style={styles.label}>Skill level</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sportsRow}>
          {SKILL_LEVELS.map((item) => {
            const selected = skillLevel === item;

            return (
              <Text
                key={item}
                onPress={() => setSkillLevel(item)}
                style={[styles.skillChip, selected && styles.selectedSkillChip]}
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

        <Text style={styles.label}>Game schedule</Text>
        <View style={styles.scheduleRow}>
          <Pressable style={styles.scheduleBox} onPress={() => setPickerMode("date")}>
            <Text style={styles.scheduleLabel}>Date</Text>
            <Text style={styles.scheduleValue}>
              {gameDate.toLocaleDateString([], {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </Pressable>
          <Pressable style={styles.scheduleBox} onPress={() => setPickerMode("time")}>
            <Text style={styles.scheduleLabel}>Time</Text>
            <Text style={styles.scheduleValue}>
              {gameTime.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
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
          label="Match notes"
          multiline
          onChangeText={setNotes}
          placeholder="Example: Bring your own bat, tennis-ball match, 7 AM sharp."
          value={notes}
          style={styles.field}
        />

        <PrimaryButton title="Create Game" onPress={handleCreateGame} loading={loading} style={styles.button} />
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Tips for better responses</Text>
        <Text style={styles.tipText}>
          Use a clear landmark, realistic player count, and keep the schedule in the future so players can plan.
        </Text>
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
  heroCard: {
    backgroundColor: "#0F62FE",
    borderRadius: 24,
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
    borderRadius: 24,
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
  skillChip: {
    backgroundColor: "#FFF1E7",
    borderRadius: 999,
    color: "#8A4A1F",
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  selectedSkillChip: {
    backgroundColor: colors.accent,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  field: {
    marginTop: 6,
  },
  scheduleRow: {
    flexDirection: "row",
    gap: 12,
  },
  scheduleBox: {
    backgroundColor: colors.background,
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
  button: {
    marginTop: 24,
  },
  tipCard: {
    backgroundColor: "#FFF1E7",
    borderRadius: 20,
    marginTop: 16,
    padding: 18,
  },
  tipTitle: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: "800",
  },
  tipText: {
    color: "#8A4A1F",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});
