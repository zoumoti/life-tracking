import { useEffect, useState, useCallback } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = "1063289815690-6eggvslg2kn9buvbqa3fc95io2qmn0gp.apps.googleusercontent.com";

const SCOPES = [
  "https://www.googleapis.com/auth/tasks",
  "https://www.googleapis.com/auth/calendar.events",
];

const STORAGE_KEY_ACCESS = "google_access_token";
const STORAGE_KEY_REFRESH = "google_refresh_token";
const STORAGE_KEY_EXPIRY = "google_token_expiry";

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

export function useGoogleAuth() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const redirectUri = AuthSession.makeRedirectUri();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: SCOPES,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  // Check stored tokens on mount
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem(STORAGE_KEY_ACCESS);
      setIsConnected(!!token);
    })();
  }, []);

  // Handle auth response
  useEffect(() => {
    if (response?.type === "success" && response.params.code) {
      exchangeCode(response.params.code, request?.codeVerifier ?? "");
    }
  }, [response]);

  const exchangeCode = async (code: string, codeVerifier: string) => {
    try {
      setLoading(true);
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: GOOGLE_CLIENT_ID,
          code,
          redirectUri,
          extraParams: { code_verifier: codeVerifier },
        },
        discovery
      );

      if (tokenResponse.accessToken) {
        await AsyncStorage.setItem(STORAGE_KEY_ACCESS, tokenResponse.accessToken);
        if (tokenResponse.refreshToken) {
          await AsyncStorage.setItem(STORAGE_KEY_REFRESH, tokenResponse.refreshToken);
        }
        const expiry = Date.now() + (tokenResponse.expiresIn ?? 3600) * 1000;
        await AsyncStorage.setItem(STORAGE_KEY_EXPIRY, String(expiry));
        setIsConnected(true);
      }
    } catch (e) {
      console.warn("Google token exchange failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const connect = useCallback(() => {
    promptAsync();
  }, [promptAsync]);

  const disconnect = useCallback(async () => {
    await AsyncStorage.multiRemove([STORAGE_KEY_ACCESS, STORAGE_KEY_REFRESH, STORAGE_KEY_EXPIRY]);
    setIsConnected(false);
  }, []);

  return { isConnected, loading, connect, disconnect, request };
}

/**
 * Returns a valid access token, refreshing if needed.
 * Returns null if not connected.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const token = await AsyncStorage.getItem(STORAGE_KEY_ACCESS);
  if (!token) return null;

  const expiryStr = await AsyncStorage.getItem(STORAGE_KEY_EXPIRY);
  const expiry = expiryStr ? Number(expiryStr) : 0;

  // If token has more than 5 min left, use it
  if (Date.now() < expiry - 5 * 60 * 1000) {
    return token;
  }

  // Try refresh
  const refreshToken = await AsyncStorage.getItem(STORAGE_KEY_REFRESH);
  if (!refreshToken) return null;

  try {
    const resp = await AuthSession.refreshAsync(
      {
        clientId: GOOGLE_CLIENT_ID,
        refreshToken,
      },
      discovery
    );

    if (resp.accessToken) {
      await AsyncStorage.setItem(STORAGE_KEY_ACCESS, resp.accessToken);
      const newExpiry = Date.now() + (resp.expiresIn ?? 3600) * 1000;
      await AsyncStorage.setItem(STORAGE_KEY_EXPIRY, String(newExpiry));
      return resp.accessToken;
    }
  } catch (e) {
    console.warn("Google token refresh failed:", e);
  }

  return null;
}
