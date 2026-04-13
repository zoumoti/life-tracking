import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import GorhomBottomSheet from "@gorhom/bottom-sheet";
import { SafeScreen } from "../../components/SafeScreen";
import { BottomSheet } from "../../components/ui/BottomSheet";
import { Button } from "../../components/ui/Button";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { VisionCard } from "../../components/objectives/VisionCard";
import { VisionForm } from "../../components/objectives/VisionForm";
import { ObjectiveForm } from "../../components/objectives/ObjectiveForm";
import { ObjectiveDetail } from "../../components/objectives/ObjectiveDetail";
import { UpdateValueForm } from "../../components/objectives/UpdateValueForm";
import { useVisionStore } from "../../stores/visionStore";
import { useObjectiveStore } from "../../stores/objectiveStore";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type SheetMode =
  | { type: "none" }
  | { type: "addVision" }
  | { type: "editVision"; vision: Tables<"visions"> }
  | { type: "addObjective"; visionId: string }
  | { type: "editObjective"; objective: Tables<"objectives"> }
  | { type: "updateValue"; objective: Tables<"objectives"> }
  | { type: "detail"; objective: Tables<"objectives">; visionColor: string };

type ConfirmAction =
  | { type: "none" }
  | { type: "deleteVision"; vision: Tables<"visions"> }
  | { type: "deleteObjective"; objective: Tables<"objectives"> };

export default function ObjectivesScreen() {
  const { visions, loading: visionsLoading, fetchVisions, addVision, updateVision, deleteVision } = useVisionStore();
  const { objectives, loading: objectivesLoading, fetchObjectives, addObjective, updateObjective, deleteObjective, logUpdate, getObjectivesByVision } = useObjectiveStore();

  const sheetRef = useRef<GorhomBottomSheet>(null);
  const [sheetMode, setSheetMode] = useState<SheetMode>({ type: "none" });
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({ type: "none" });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchVisions();
    fetchObjectives();
  }, []);

  // --- Sheet helpers ---
  const openSheet = useCallback((mode: SheetMode) => {
    setSheetMode(mode);
    setTimeout(() => sheetRef.current?.snapToIndex(0), 50);
  }, []);

  const closeSheet = useCallback(() => {
    sheetRef.current?.close();
    setSheetMode({ type: "none" });
  }, []);

  // --- Vision CRUD handlers ---
  const handleAddVision = async (data: { title: string; description: string; icon: string; color: string }) => {
    setFormLoading(true);
    await addVision(data);
    setFormLoading(false);
    closeSheet();
  };

  const handleEditVision = async (data: { title: string; description: string; icon: string; color: string }) => {
    if (sheetMode.type !== "editVision") return;
    setFormLoading(true);
    await updateVision(sheetMode.vision.id, data);
    setFormLoading(false);
    closeSheet();
  };

  const handleDeleteVision = async () => {
    if (confirmAction.type !== "deleteVision") return;
    await deleteVision(confirmAction.vision.id);
    setConfirmAction({ type: "none" });
  };

  // --- Objective CRUD handlers ---
  const handleAddObjective = async (data: {
    vision_id: string;
    title: string;
    description: string;
    unit: string;
    current_value: number;
    target_value: number;
    deadline: string;
  }) => {
    setFormLoading(true);
    await addObjective(data);
    setFormLoading(false);
    closeSheet();
  };

  const handleEditObjective = async (data: {
    vision_id: string;
    title: string;
    description: string;
    unit: string;
    current_value: number;
    target_value: number;
    deadline: string;
  }) => {
    if (sheetMode.type !== "editObjective") return;
    setFormLoading(true);
    await updateObjective(sheetMode.objective.id, data);
    setFormLoading(false);
    closeSheet();
  };

  const handleDeleteObjective = async () => {
    if (confirmAction.type !== "deleteObjective") return;
    await deleteObjective(confirmAction.objective.id);
    setConfirmAction({ type: "none" });
    // If we were viewing detail, go back to list
    if (sheetMode.type === "detail") closeSheet();
  };

  const handleLogUpdate = async (newValue: number, note: string) => {
    if (sheetMode.type !== "updateValue") return;
    setFormLoading(true);
    await logUpdate(sheetMode.objective.id, newValue, note);
    setFormLoading(false);
    closeSheet();
  };

  // --- Render helpers ---
  const loading = visionsLoading || objectivesLoading;

  const renderSheetContent = () => {
    switch (sheetMode.type) {
      case "addVision":
        return (
          <VisionForm
            onSubmit={handleAddVision}
            onCancel={closeSheet}
            loading={formLoading}
          />
        );
      case "editVision":
        return (
          <VisionForm
            initial={sheetMode.vision}
            onSubmit={handleEditVision}
            onCancel={closeSheet}
            loading={formLoading}
          />
        );
      case "addObjective":
        return (
          <ObjectiveForm
            visions={visions}
            initialVisionId={sheetMode.visionId}
            onSubmit={handleAddObjective}
            onCancel={closeSheet}
            loading={formLoading}
          />
        );
      case "editObjective":
        return (
          <ObjectiveForm
            visions={visions}
            initial={sheetMode.objective}
            onSubmit={handleEditObjective}
            onCancel={closeSheet}
            loading={formLoading}
          />
        );
      case "updateValue":
        return (
          <UpdateValueForm
            objective={sheetMode.objective}
            onSubmit={handleLogUpdate}
            onCancel={closeSheet}
            loading={formLoading}
          />
        );
      case "detail":
        return (
          <ObjectiveDetail
            objective={sheetMode.objective}
            visionColor={sheetMode.visionColor}
            onUpdate={() => {
              closeSheet();
              setTimeout(() => openSheet({ type: "updateValue", objective: sheetMode.objective }), 300);
            }}
            onEdit={() => {
              closeSheet();
              setTimeout(() => openSheet({ type: "editObjective", objective: sheetMode.objective }), 300);
            }}
            onDelete={() => setConfirmAction({ type: "deleteObjective", objective: sheetMode.objective })}
            onClose={closeSheet}
          />
        );
      default:
        return null;
    }
  };

  const sheetTitle = (() => {
    switch (sheetMode.type) {
      case "addVision": return "Nouvelle vision";
      case "editVision": return "Modifier la vision";
      case "addObjective": return "Nouvel objectif";
      case "editObjective": return "Modifier l'objectif";
      case "updateValue": return "Mise a jour";
      case "detail": return undefined;
      default: return undefined;
    }
  })();

  const snapPoints = sheetMode.type === "detail" ? ["85%"] : ["70%", "90%"];

  return (
    <SafeScreen>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4 mt-2">
        <Text className="text-text text-2xl font-bold">Objectifs</Text>
        <Pressable
          onPress={() => openSheet({ type: "addVision" })}
          className="flex-row items-center bg-primary px-3 py-2 rounded-button active:opacity-80"
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text className="text-white text-sm font-semibold ml-1">Vision</Text>
        </Pressable>
      </View>

      {/* Content */}
      {loading && visions.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : visions.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Feather name="target" size={48} color={colors.textMuted} />
          <Text className="text-text text-lg font-bold mt-4 mb-2">Aucune vision</Text>
          <Text className="text-text-secondary text-sm text-center mb-6">
            Commence par creer une vision — une grande direction de vie — puis ajoute des objectifs mesurables.
          </Text>
          <Button title="Creer ma premiere vision" onPress={() => openSheet({ type: "addVision" })} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {visions.map((vision) => (
            <VisionCard
              key={vision.id}
              vision={vision}
              objectives={getObjectivesByVision(vision.id)}
              onPressObjective={(obj) =>
                openSheet({ type: "detail", objective: obj, visionColor: vision.color })
              }
              onAddObjective={() => openSheet({ type: "addObjective", visionId: vision.id })}
              onEditVision={() => openSheet({ type: "editVision", vision })}
              onDeleteVision={() => setConfirmAction({ type: "deleteVision", vision })}
            />
          ))}
          {/* Spacer for bottom tabs */}
          <View className="h-4" />
        </ScrollView>
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        ref={sheetRef}
        title={sheetTitle}
        snapPoints={snapPoints}
        onClose={() => setSheetMode({ type: "none" })}
      >
        {renderSheetContent()}
      </BottomSheet>

      {/* Confirm Modal — delete vision */}
      <ConfirmModal
        visible={confirmAction.type === "deleteVision"}
        title="Supprimer cette vision ?"
        message="Tous les objectifs associes seront egalement supprimes. Cette action est irreversible."
        confirmLabel="Supprimer"
        onConfirm={handleDeleteVision}
        onCancel={() => setConfirmAction({ type: "none" })}
      />

      {/* Confirm Modal — delete objective */}
      <ConfirmModal
        visible={confirmAction.type === "deleteObjective"}
        title="Supprimer cet objectif ?"
        message="L'historique des mises a jour sera perdu. Cette action est irreversible."
        confirmLabel="Supprimer"
        onConfirm={handleDeleteObjective}
        onCancel={() => setConfirmAction({ type: "none" })}
      />
    </SafeScreen>
  );
}
