import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import InputField from "../components/InputField";
import PrimaryButton from "../components/PrimaryButton";
import SectionTitle from "../components/SectionTitle";
import { useAuth } from "../context/AuthContext";
import colors from "../theme/colors";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing details", "Please fill all the fields.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak password", "Password should be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      await register({ name: name.trim(), email: email.trim(), password });
    } catch (error) {
      Alert.alert("Registration failed", error.message);
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
        <Text style={styles.badge}>Create your squad</Text>
        <SectionTitle
          title="Start with your account"
          subtitle="Register once, then create matches or join nearby games in seconds."
        />

        <InputField
          label="Full Name"
          onChangeText={setName}
          placeholder="Your name"
          value={name}
          style={styles.field}
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
          placeholder="At least 6 characters"
          value={password}
          style={styles.field}
        />

        <PrimaryButton title="Register" onPress={handleRegister} loading={loading} style={styles.button} />

        <Text style={styles.linkText} onPress={() => navigation.goBack()}>
          Already have an account? Login
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
    backgroundColor: "#DCFCE7",
    borderRadius: 999,
    color: colors.success,
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
