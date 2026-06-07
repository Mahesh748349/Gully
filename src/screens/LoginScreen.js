import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.brand}>Gully</Text>
          <Text style={styles.headerText}>Welcome back. Your local matches are waiting.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.badge}>Secure sign in</Text>
          <SectionTitle
            title="Log in"
            subtitle="Use the account you created to join games, manage requests, and track your player activity."
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

          <Pressable style={styles.switchRow} onPress={() => navigation.navigate("Register")}>
            <Text style={styles.switchText}>New to Gully?</Text>
            <Text style={styles.switchLink}>Create account</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => navigation.navigate("Welcome")}>
          <Text style={styles.secondaryLinkText}>Back to welcome</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    marginBottom: 22,
  },
  brand: {
    color: colors.primaryDark,
    fontSize: 32,
    fontWeight: "900",
  },
  headerText: {
    color: colors.subText,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.softCard,
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
  switchRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    padding: 14,
  },
  switchText: {
    color: colors.subText,
    fontSize: 14,
    fontWeight: "700",
  },
  switchLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 6,
  },
  secondaryLinkText: {
    color: colors.subText,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 18,
    textAlign: "center",
  },
});
