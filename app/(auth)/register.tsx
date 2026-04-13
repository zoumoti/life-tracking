import { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { SafeScreen } from "../../components/SafeScreen";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../stores/authStore";

export default function RegisterScreen() {
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
        <Text className="text-text text-3xl font-bold mb-2">Creer un compte</Text>
        <Text className="text-text-secondary text-base mb-8">
          Commence a tracker ta vie
        </Text>

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
          className="bg-surface text-text rounded-button px-4 py-3 mb-3 text-base"
        />

        <TextInput
          placeholder="Confirmer le mot de passe"
          placeholderTextColor="#555566"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          className="bg-surface text-text rounded-button px-4 py-3 mb-6 text-base"
        />

        <Button title="Creer mon compte" onPress={handleRegister} loading={loading} />

        <View className="flex-row justify-center mt-6">
          <Text className="text-text-secondary">Deja un compte ? </Text>
          <Link href={"/(auth)/login" as any} asChild>
            <Pressable>
              <Text className="text-primary font-semibold">Connexion</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
