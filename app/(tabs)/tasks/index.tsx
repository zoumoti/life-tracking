import { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, AppState } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { SafeScreen } from "../../../components/SafeScreen";
import { useColors } from "../../../lib/theme";
import { useTaskStore } from "../../../stores/taskStore";
import { useGoogleAuth } from "../../../lib/googleAuth";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import { TaskFilters } from "../../../components/tasks/TaskFilters";
import { TaskList } from "../../../components/tasks/TaskList";
import { TaskForm } from "../../../components/tasks/TaskForm";
import type { Task, TaskInput, TaskFilter } from "../../../types/task";

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekEnd(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function TasksScreen() {
  const c = useColors();
  const { tasks, loading, fetchTasks, addTask, updateTask, deleteTask, toggleComplete, syncWithGoogle } =
    useTaskStore();
  const { isConnected, connect, loading: authLoading } = useGoogleAuth();

  const [filter, setFilter] = useState<TaskFilter>("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const formRef = useRef<BottomSheetModal>(null);

  // Confirm modal
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const navigation = useNavigation();

  // Fetch on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Sync when tab gets focus (switching tabs, coming back to app)
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchTasks();
      if (isConnected) syncWithGoogle();
    });
    return unsubscribe;
  }, [navigation, isConnected]);

  // Also sync on app foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && isConnected) {
        syncWithGoogle();
      }
    });
    return () => sub.remove();
  }, [isConnected]);

  // Background sync every 15 min
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => syncWithGoogle(), 15 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === "today") {
      return task.due_date === getToday();
    }
    if (filter === "week") {
      if (!task.due_date) return false;
      const today = getToday();
      const weekEnd = getWeekEnd();
      return task.due_date >= today && task.due_date <= weekEnd;
    }
    if (filter === "no_date") {
      return !task.due_date;
    }
    return true;
  });

  // Handlers
  const openNew = () => {
    setEditingTask(null);
    formRef.current?.present();
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    formRef.current?.present();
  };

  const handleSave = async (input: TaskInput) => {
    if (editingTask) {
      await updateTask(editingTask.id, input);
    } else {
      await addTask(input);
    }
    formRef.current?.dismiss();
  };

  const handleDelete = (id: string) => {
    setConfirmAction(() => async () => {
      await deleteTask(id);
      formRef.current?.dismiss();
      setConfirmVisible(false);
    });
    setConfirmVisible(true);
  };

  const closeForm = useCallback(() => {
    formRef.current?.dismiss();
    setEditingTask(null);
  }, []);

  return (
    <SafeScreen>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-2xl font-bold" style={{ color: c.text }}>
          Taches
        </Text>

        {/* Google connect button */}
        <Pressable
          onPress={isConnected ? undefined : connect}
          className="flex-row items-center px-3 py-1.5 rounded-xl"
          style={{
            backgroundColor: isConnected ? c.surface : c.primary,
          }}
        >
          <Feather
            name="link"
            size={14}
            color={isConnected ? c.success : c.primaryOnText}
          />
          <Text
            className="ml-1.5 text-xs font-semibold"
            style={{
              color: isConnected ? c.success : c.primaryOnText,
            }}
          >
            {authLoading ? "..." : isConnected ? "Google" : "Connecter Google"}
          </Text>
        </Pressable>
      </View>

      {/* Filters */}
      <TaskFilters active={filter} onChange={setFilter} />

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <TaskList
            tasks={filteredTasks}
            onTaskPress={openEdit}
            onToggle={toggleComplete}
          />
        </ScrollView>
      )}

      {/* FAB */}
      <Pressable
        onPress={openNew}
        className="absolute bottom-6 right-0 w-14 h-14 rounded-full items-center justify-center active:opacity-80"
        style={{
          backgroundColor: c.primary,
          elevation: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }}
      >
        <Feather name="plus" size={26} color={c.primaryOnText} />
      </Pressable>

      {/* Form bottom sheet */}
      <TaskForm
        ref={formRef}
        editingTask={editingTask}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={closeForm}
      />

      {/* Confirm modal for deletes */}
      <ConfirmModal
        visible={confirmVisible}
        title="Confirmation"
        message="Supprimer cette tache ? Cette action est irreversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        destructive
        onConfirm={() => confirmAction?.()}
        onCancel={() => setConfirmVisible(false)}
      />
    </SafeScreen>
  );
}
