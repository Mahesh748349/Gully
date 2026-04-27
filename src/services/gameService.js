import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const subscribeToGames = (callback) => {
  const gamesQuery = query(collection(db, "games"), orderBy("gameTime", "asc"));
  return onSnapshot(gamesQuery, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
};

export const createGame = async ({
  creator,
  sport,
  skillLevel,
  gameTime,
  locationName,
  maxPlayers,
  notes,
}) => {
  return addDoc(collection(db, "games"), {
    creatorId: creator.uid,
    creatorName: creator.name,
    sport,
    skillLevel,
    gameTime,
    locationName,
    maxPlayers: Number(maxPlayers),
    notes: notes?.trim() || "",
    playerCount: 1,
    status: "open",
    createdAt: serverTimestamp(),
  });
};

export const subscribeToGame = (gameId, callback) => {
  return onSnapshot(doc(db, "games", gameId), (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    } else {
      callback(null);
    }
  });
};

export const subscribeToGameRequests = (gameId, callback) => {
  const requestQuery = query(collection(db, "games", gameId, "requests"), orderBy("createdAt", "desc"));
  return onSnapshot(requestQuery, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
};

export const sendJoinRequest = async ({ gameId, userId, userName }) => {
  const requestRef = doc(db, "games", gameId, "requests", userId);
  const existingRequest = await getDoc(requestRef);

  if (existingRequest.exists()) {
    return { alreadyRequested: true };
  }

  await setDoc(requestRef, {
    userId,
    userName,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return { alreadyRequested: false };
};

export const updateJoinRequestStatus = async ({ gameId, requestId, status, nextPlayerCount, gameStatus }) => {
  await updateDoc(doc(db, "games", gameId, "requests", requestId), { status });
  await updateDoc(doc(db, "games", gameId), {
    playerCount: nextPlayerCount,
    status: gameStatus,
  });
};

export const updateGameStatus = async ({ gameId, status }) => {
  await updateDoc(doc(db, "games", gameId), { status });
};
