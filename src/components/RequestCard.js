import React from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../theme/colors";
import PrimaryButton from "./PrimaryButton";

export default function RequestCard({ request, onAccept, onReject, showActions }) {
  const statusStyle =
    request.status === "accepted"
      ? styles.acceptedStatus
      : request.status === "rejected"
      ? styles.rejectedStatus
      : styles.pendingStatus;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{request.userName}</Text>
        <Text style={[styles.statusBadge, statusStyle]}>{request.status}</Text>
      </View>
      {showActions && request.status === "pending" ? (
        <View style={styles.actions}>
          <PrimaryButton title="Accept" onPress={onAccept} style={styles.actionButton} />
          <PrimaryButton
            title="Reject"
            onPress={onReject}
            style={[styles.actionButton, styles.rejectButton]}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    marginTop: 12,
    padding: 16,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  statusBadge: {
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "700",
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
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
  },
  rejectButton: {
    backgroundColor: colors.danger,
  },
});
