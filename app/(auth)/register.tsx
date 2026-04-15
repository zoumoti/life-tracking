import { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { SafeScreen } from "../../components/SafeScreen";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../stores/authStore";
import { useColors } from "../../lib/theme";

export default function RegisterScreen() {
  const c = useColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const signUp = useAuthStore((s) => s.signUp);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Remplis tous les champs");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caracteres");
      return;
    }
    setError(null);
    setLoading(true);
    const { error: signUpError } = await signUp(email.trim(), password);
    setLoading(false);
    if (signUpError) setError(signUpError);
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center"
      >
        <Text style={{ color: c.text }} className="text-3xl font-bold mb-2">Creer un compte</Text>
        <Text style={{ color: c.textSecondary }} className="text-base mb-8">
          Commence a tracker ta vie
        </Text>

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
          className="rounded-button px-4 py-3 mb-3 text-base"
          style={{ backgroundColor: c.surface, color: c.text }}
        />

        <TextInput
          placeholder="Confirmer le mot de passe"
          placeholderTextColor={c.textMuted}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          className="rounded-button px-4 py-3 mb-6 text-base"
          style={{ backgroundColor: c.surface, color: c.text }}
        />

        <Button title="Creer mon compte" onPress={handleRegister} loading={loading} />

        <View className="flex-row justify-center mt-6">
          <Text style={{ color: c.textSecondary }}>Deja un compte ? </Text>
          <Link href={"/(auth)/login" as any} asChild>
            <Pressable>
              <Text style={{ color: c.primary }} className="font-semibold">Connexion</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
