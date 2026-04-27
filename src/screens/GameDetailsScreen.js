import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import RequestCard from "../components/RequestCard";
import SectionTitle from "../components/SectionTitle";
import { useAuth } from "../context/AuthContext";
import {
  sendJoinRequest,
  subscribeToGame,
  subscribeToGameRequests,
  updateGameStatus,
  updateJoinRequestStatus,
} from "../services/gameService";
import colors from "../theme/colors";
import { formatGameDate } from "../utils/date";

export default function GameDetailsScreen({ route }) {
  const { gameId } = route.params;
  const { user, profile } = useAuth();
  const [game, setGame] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribeGame = subscribeToGame(gameId, setGame);
    const unsubscribeRequests = subscribeToGameRequests(gameId, setRequests);

    return () => {
      unsubscribeGame();
      unsubscribeRequests();
    };
  }, [gameId]);

  const isCreator = useMemo(() => game?.creatorId === user?.uid, [game?.creatorId, user?.uid]);
  const myRequest = useMemo(
    () => requests.find((request) => request.userId === user?.uid),
    [requests, user?.uid]
  );
  const pendingCount = requests.filter((request) => request.status === "pending").length;
  const acceptedCount = requests.filter((request) => request.status === "accepted").length;

  const handleJoinRequest = async () => {
    if (!game) {
      return;
    }

    try {
      setLoading(true);
      const result = await sendJoinRequest({
        gameId,
        userId: user.uid,
        userName: profile?.name || "Gully User",
      });

      Alert.alert(
        result.alreadyRequested ? "Already requested" : "Request sent",
        result.alreadyRequested
          ? "You already have a join request for this game."
          : "The game creator can now accept or reject your request."
      );
    } catch (error) {
      Alert.alert("Unable to request", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestUpdate = async (requestId, status) => {
    if (!game) {
      return;
    }

    if (status === "accepted" && game.playerCount >= game.maxPlayers) {
      Alert.alert("Game is full", "This game has already reached its player limit.");
      return;
    }

    const nextPlayerCount = status === "accepted" ? game.playerCount + 1 : game.playerCount;
    const gameStatus = nextPlayerCount >= game.maxPlayers ? "full" : "open";

    try {
      await updateJoinRequestStatus({ gameId, requestId, status, nextPlayerCount, gameStatus });
    } catch (error) {
      Alert.alert("Unable to update request", error.message);
    }
  };

  const handleToggleGameStatus = async () => {
    if (!game) {
      return;
    }

    try {
      setLoading(true);
      await updateGameStatus({
        gameId,
        status: game.status === "open" ? "full" : "open",
      });
    } catch (error) {
      Alert.alert("Unable to update game", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!game) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.loadingText}>Loading game details...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroStatus}>{game.status === "full" ? "Full roster" : "Open for players"}</Text>
        <SectionTitle title={game.sport} subtitle={game.locationName} light />
        <Text style={styles.heroMeta}>Hosted by {game.creatorName}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statValue}>{game.playerCount}</Text>
          <Text style={styles.statLabel}>Current players</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statValue}>{Math.max(game.maxPlayers - game.playerCount, 0)}</Text>
          <Text style={styles.statLabel}>Spots left</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statValue}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending asks</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.infoText}>Time: {formatGameDate(game.gameTime)}</Text>
        <Text style={styles.infoText}>Level: {game.skillLevel || "Mixed"}</Text>
        <Text style={styles.infoText}>Players: {game.playerCount}/{game.maxPlayers}</Text>
        <Text style={styles.infoText}>Accepted joiners: {acceptedCount}</Text>
        {game.notes ? <Text style={styles.notesText}>Notes: {game.notes}</Text> : null}

        {myRequest ? (
          <View style={styles.requestStateBox}>
            <Text style={styles.requestStateTitle}>Your request status</Text>
            <Text style={styles.requestStateText}>{myRequest.status}</Text>
          </View>
        ) : null}

        {!isCreator ? (
          <PrimaryButton
            title={myRequest ? `Request: ${myRequest.status}` : "Send Join Request"}
            onPress={handleJoinRequest}
            loading={loading}
            disabled={Boolean(myRequest) || game.status !== "open"}
            style={styles.button}
          />
        ) : null}

        {isCreator ? (
          <PrimaryButton
            title={game.status === "open" ? "Mark Game Full" : "Reopen Game"}
            onPress={handleToggleGameStatus}
            loading={loading}
            style={styles.secondaryButton}
          />
        ) : null}
      </View>

      {isCreator ? (
        <View style={styles.requestsCard}>
          <Text style={styles.requestsTitle}>Creator dashboard</Text>
          <Text style={styles.requestsSubtitle}>
            Review incoming requests and fill the remaining {Math.max(game.maxPlayers - game.playerCount, 0)} spots.
          </Text>
          {requests.length === 0 ? (
            <Text style={styles.emptyRequests}>No requests yet.</Text>
          ) : (
            requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                showActions
                onAccept={() => handleRequestUpdate(request.id, "accepted")}
                onReject={() => handleRequestUpdate(request.id, "rejected")}
              />
            ))
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
  },
  loadingText: {
    color: colors.subText,
    fontSize: 15,
  },
  container: {
    backgroundColor: colors.background,
    padding: 20,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: "#0F62FE",
    borderRadius: 24,
    padding: 20,
  },
  heroStatus: {
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
  heroMeta: {
    color: "#DBEAFE",
    fontSize: 14,
    marginTop: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  statPill: {
    backgroundColor: colors.card,
    borderRadius: 20,
    flex: 1,
    padding: 16,
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    color: colors.subText,
    fontSize: 12,
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    marginTop: 16,
    padding: 20,
  },
  infoText: {
    color: colors.subText,
    fontSize: 14,
    marginTop: 10,
  },
  requestStateBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 18,
    marginTop: 16,
    padding: 16,
  },
  requestStateTitle: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "700",
  },
  requestStateText: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 6,
    textTransform: "capitalize",
  },
  button: {
    marginTop: 18,
  },
  secondaryButton: {
    backgroundColor: colors.accent,
    marginTop: 14,
  },
  notesText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
  },
  requestsCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    marginTop: 18,
    padding: 20,
  },
  requestsTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  requestsSubtitle: {
    color: colors.subText,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  emptyRequests: {
    color: colors.subText,
    fontSize: 14,
    marginTop: 12,
  },
});
