import { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { SafeScreen } from "../../components/SafeScreen";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../stores/authStore";
import { useColors } from "../../lib/theme";

export default function LoginScreen() {
  const c = useColors();
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
        <Text style={{ color: c.text }} className="text-3xl font-bold mb-2">Life Tracker</Text>
        <Text style={{ color: c.textSecondary }} className="text-base mb-8">Connecte-toi pour continuer</Text>

        {error && (
          <View style={{ backgroundColor: c.danger + "33" }} className="rounded-button p-3 mb-4">
            <Text style={{ color: c.danger }} className="text-sm">{error}</Text>
          </View>
        )}

        <TextInput
          placeholder="Email"
          placeholderTextColor={c.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          className="rounded-button px-4 py-3 mb-3 text-base"
          style={{ backgroundColor: c.surface, color: c.text }}
        />

        <TextInput
          placeholder="Mot de passe"
          placeholderTextColor={c.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="rounded-button px-4 py-3 mb-6 text-base"
          style={{ backgroundColor: c.surface, color: c.text }}
        />

        <Button title="Se connecter" onPress={handleLogin} loading={loading} />

        <View className="flex-row justify-center mt-6">
          <Text style={{ color: c.textSecondary }}>Pas encore de compte ? </Text>
          <Link href={"/(auth)/register" as any} asChild>
            <Pressable>
              <Text style={{ color: c.primary }} className="font-semibold">Inscription</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
