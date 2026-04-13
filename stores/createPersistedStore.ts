import { create, StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function createPersistedStore<T>(
  name: string,
  initializer: StateCreator<T, [["zustand/persist", unknown]]>
) {
  return create<T>()(
    persist(initializer, {
      name,
      storage: createJSONStorage(() => AsyncStorage),
    })
  );
}
