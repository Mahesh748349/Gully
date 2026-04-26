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

  if (!game) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.loadingText}>Loading game details...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <SectionTitle title={game.sport} subtitle={game.locationName} />
        <Text style={styles.infoText}>Time: {formatGameDate(game.gameTime)}</Text>
        <Text style={styles.infoText}>
          Players: {game.playerCount}/{game.maxPlayers}
        </Text>
        <Text style={styles.infoText}>Created by: {game.creatorName}</Text>

        {!isCreator ? (
          <PrimaryButton
            title={myRequest ? `Request: ${myRequest.status}` : "Send Join Request"}
            onPress={handleJoinRequest}
            loading={loading}
            disabled={Boolean(myRequest) || game.status !== "open"}
            style={styles.button}
          />
        ) : null}
      </View>

      {isCreator ? (
        <View style={styles.requestsCard}>
          <Text style={styles.requestsTitle}>Join requests</Text>
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
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
  },
  infoText: {
    color: colors.subText,
    fontSize: 14,
    marginTop: 10,
  },
  button: {
    marginTop: 18,
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
  emptyRequests: {
    color: colors.subText,
    fontSize: 14,
    marginTop: 12,
  },
});
