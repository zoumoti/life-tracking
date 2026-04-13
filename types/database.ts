export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          icon: string;
          color: string;
          frequency_type: "daily" | "specific_days" | "x_per_week";
          frequency_value: number;
          frequency_days: number[] | null;
          time_of_day: "morning" | "afternoon" | "evening" | "anytime";
          reminder_time: string | null;
          linked_objective_id: string | null;
          sort_order: number;
          is_active: boolean;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string;
          icon?: string;
          color?: string;
          frequency_type?: "daily" | "specific_days" | "x_per_week";
          frequency_value?: number;
          frequency_days?: number[] | null;
          time_of_day?: "morning" | "afternoon" | "evening" | "anytime";
          reminder_time?: string | null;
          linked_objective_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          icon?: string;
          color?: string;
          frequency_type?: "daily" | "specific_days" | "x_per_week";
          frequency_value?: number;
          frequency_days?: number[] | null;
          time_of_day?: "morning" | "afternoon" | "evening" | "anytime";
          reminder_time?: string | null;
          linked_objective_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          completed_date: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          completed_date: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          completed_date?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      visions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          icon: string;
          color: string;
          target_date: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          icon?: string;
          color?: string;
          target_date?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          icon?: string;
          color?: string;
          target_date?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      objectives: {
        Row: {
          id: string;
          user_id: string;
          vision_id: string;
          title: string;
          description: string;
          target_value: number | null;
          current_value: number;
          unit: string | null;
          deadline: string | null;
          status: string;
          sort_order: number;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vision_id: string;
          title: string;
          description?: string;
          target_value?: number | null;
          current_value?: number;
          unit?: string | null;
          deadline?: string | null;
          status?: string;
          sort_order?: number;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          vision_id?: string;
          title?: string;
          description?: string;
          target_value?: number | null;
          current_value?: number;
          unit?: string | null;
          deadline?: string | null;
          status?: string;
          sort_order?: number;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      objective_updates: {
        Row: {
          id: string;
          objective_id: string;
          user_id: string;
          previous_value: number;
          new_value: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          objective_id: string;
          user_id: string;
          previous_value: number;
          new_value: number;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          objective_id?: string;
          user_id?: string;
          previous_value?: number;
          new_value?: number;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      exercises: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          muscle_group: string;
          secondary_muscle_group: string | null;
          description: string | null;
          is_compound: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          muscle_group: string;
          secondary_muscle_group?: string | null;
          description?: string | null;
          is_compound?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          muscle_group?: string;
          secondary_muscle_group?: string | null;
          description?: string | null;
          is_compound?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      workout_programs: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workout_program_exercises: {
        Row: {
          id: string;
          program_id: string;
          exercise_id: string;
          day_of_week: number;
          sets_target: number;
          reps_target: string;
          rest_seconds: number;
          sort_order: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          exercise_id: string;
          day_of_week: number;
          sets_target?: number;
          reps_target?: string;
          rest_seconds?: number;
          sort_order?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          program_id?: string;
          exercise_id?: string;
          day_of_week?: number;
          sets_target?: number;
          reps_target?: string;
          rest_seconds?: number;
          sort_order?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          program_id: string | null;
          name: string;
          started_at: string;
          finished_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          program_id?: string | null;
          name: string;
          started_at?: string;
          finished_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          program_id?: string | null;
          name?: string;
          started_at?: string;
          finished_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      workout_sets: {
        Row: {
          id: string;
          session_id: string;
          exercise_id: string;
          set_number: number;
          reps: number;
          weight_kg: number;
          is_warmup: boolean;
          rpe: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          exercise_id: string;
          set_number: number;
          reps: number;
          weight_kg: number;
          is_warmup?: boolean;
          rpe?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          exercise_id?: string;
          set_number?: number;
          reps?: number;
          weight_kg?: number;
          is_warmup?: boolean;
          rpe?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      running_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          distance_km: number;
          duration_minutes: number;
          pace_per_km: number | null;
          type: "easy" | "tempo" | "intervals" | "race";
          perceived_effort: number;
          heart_rate_avg: number | null;
          notes: string | null;
          linked_objective_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          distance_km: number;
          duration_minutes: number;
          pace_per_km?: number | null;
          type?: "easy" | "tempo" | "intervals" | "race";
          perceived_effort: number;
          heart_rate_avg?: number | null;
          notes?: string | null;
          linked_objective_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          distance_km?: number;
          duration_minutes?: number;
          pace_per_km?: number | null;
          type?: "easy" | "tempo" | "intervals" | "race";
          perceived_effort?: number;
          heart_rate_avg?: number | null;
          notes?: string | null;
          linked_objective_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      frequency_type: "daily" | "specific_days" | "x_per_week";
      time_of_day: "morning" | "afternoon" | "evening" | "anytime";
      running_type: "easy" | "tempo" | "intervals" | "race";
    };
  };
}

// Convenience type aliases
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
