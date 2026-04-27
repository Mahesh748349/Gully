import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import SectionTitle from "../components/SectionTitle";
import { useAuth } from "../context/AuthContext";
import colors from "../theme/colors";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing details", "Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (error) {
      Alert.alert("Login failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.badge}>Find players nearby</Text>
        <SectionTitle
          title="Welcome to Gully"
          subtitle="Log in and discover cricket, football, and more games happening around you."
        />

        <InputField
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="you@example.com"
          value={email}
          style={styles.field}
        />
        <InputField
          label="Password"
          secureTextEntry
          onChangeText={setPassword}
          placeholder="Enter your password"
          value={password}
          style={styles.field}
        />

        <PrimaryButton title="Login" onPress={handleLogin} loading={loading} style={styles.button} />

        <Text style={styles.linkText} onPress={() => navigation.navigate("Register")}>
          New here? Create an account
        </Text>
        <Text style={styles.secondaryLinkText} onPress={() => navigation.navigate("Welcome")}>
          Back to home
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 22,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#DBEAFE",
    borderRadius: 999,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 16,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  field: {
    marginTop: 18,
  },
  button: {
    marginTop: 22,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 18,
    textAlign: "center",
  },
  secondaryLinkText: {
    color: colors.subText,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
});
