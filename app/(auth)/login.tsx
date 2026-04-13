import { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { SafeScreen } from "../../components/SafeScreen";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../stores/authStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const signIn = useAuthStore((s) => s.signIn);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Remplis tous les champs");
      return;
    }
    setError(null);
    setLoading(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setLoading(false);
    if (signInError) setError(signInError);
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center"
      >
        <Text className="text-text text-3xl font-bold mb-2">Life Tracker</Text>
        <Text className="text-text-secondary text-base mb-8">Connecte-toi pour continuer</Text>

        {error && (
          <View className="bg-danger/20 rounded-button p-3 mb-4">
            <Text className="text-danger text-sm">{error}</Text>
          </View>
        )}

        <TextInput
          placeholder="Email"
          placeholderTextColor="#555566"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          className="bg-surface text-text rounded-button px-4 py-3 mb-3 text-base"
        />

        <TextInput
          placeholder="Mot de passe"
          placeholderTextColor="#555566"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="bg-surface text-text rounded-button px-4 py-3 mb-6 text-base"
        />

        <Button title="Se connecter" onPress={handleLogin} loading={loading} />

        <View className="flex-row justify-center mt-6">
          <Text className="text-text-secondary">Pas encore de compte ? </Text>
          <Link href={"/(auth)/register" as any} asChild>
            <Pressable>
              <Text className="text-primary font-semibold">Inscription</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
