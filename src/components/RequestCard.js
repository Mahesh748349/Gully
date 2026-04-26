import React from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../theme/colors";
import PrimaryButton from "./PrimaryButton";

export default function RequestCard({ request, onAccept, onReject, showActions }) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{request.userName}</Text>
      <Text style={styles.status}>Status: {request.status}</Text>
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
    backgroundColor: colors.card,
    borderRadius: 18,
    marginTop: 12,
    padding: 16,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  status: {
    color: colors.subText,
    fontSize: 14,
    marginTop: 6,
    textTransform: "capitalize",
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
