import { useEffect, useState, useCallback } from "react";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY_CONNECTED = "google_connected";

GoogleSignin.configure({
  webClientId: "1063289815690-6eggvslg2kn9buvbqa3fc95io2qmn0gp.apps.googleusercontent.com",
  scopes: [
    "https://www.googleapis.com/auth/tasks",
    "https://www.googleapis.com/auth/calendar.events",
  ],
  offlineAccess: true,
});

export function useGoogleAuth() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_CONNECTED);
      if (stored === "true") {
        // Verify still signed in
        const isSignedIn = GoogleSignin.getCurrentUser();
        setIsConnected(!!isSignedIn);
        if (!isSignedIn) {
          await AsyncStorage.removeItem(STORAGE_KEY_CONNECTED);
        }
      }
    })();
  }, []);

  const connect = useCallback(async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      await AsyncStorage.setItem(STORAGE_KEY_CONNECTED, "true");
      setIsConnected(true);
    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        console.warn("Google Sign-In failed:", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await GoogleSignin.signOut();
    } catch {}
    await AsyncStorage.removeItem(STORAGE_KEY_CONNECTED);
    setIsConnected(false);
  }, []);

  return { isConnected, loading, connect, disconnect };
}

/**
 * Returns a valid access token for Google API calls.
 * Returns null if not signed in.
 */
export async function getValidAccessToken(): Promise<string | null> {
  try {
    const currentUser = GoogleSignin.getCurrentUser();
    if (!currentUser) return null;

    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken;
  } catch (e) {
    console.warn("Failed to get Google token:", e);
    return null;
  }
}
