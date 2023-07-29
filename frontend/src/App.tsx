import { useState } from "react";
import { createPortal } from "react-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";
import GoalEditorModal from "./components/GoalEditorModal";
import UndoGoalPopup from "./components/UndoGoalPopup";
import CreateGoalForm from "./components/CreateGoalForm";
import GoalList from "./components/GoalList";

export type Goal = {
  id: string;
  title: string;
  content: string;
  difficulty?: "HARD" | "MODERATE" | "EASY";
  deadline?: Date;
  completed_at?: Date;
  deleted_at?: Date;
  created_at: Date;
  updated_at?: Date;
};

export type GoalEditor = {
  goal: Omit<Goal, "created_at" | "updated_at">,
  isEditing: boolean
}

export type UpdateGoalForm = {
  id: string;
  title: string;
  content: string;
  deadline?: string;
  difficulty?: "HARD" | "MODERATE" | "EASY";
}

export type UndoGoalParams = Goal;

export const difficultyStyle = {
  "EASY": "text-green-500",
  "MODERATE": "text-yellow-500",
  "HARD": "text-red-600",
}

export const API_URL = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_PORT) ? `${import.meta.env.VITE_API_URL}:${import.meta.env.VITE_API_PORT}` : "http://localhost:4000";

export default function App() {
  const queryClient = useQueryClient();

  const updateGoalMutation = useMutation({
    mutationFn: async (goal: UpdateGoalForm) => {
      const res = await fetch(`${API_URL}/goals/${goal.id}/update`, {
        method: "POST",
        body: JSON.stringify(goal),
        headers: {
          "Content-Type": "application/json",
        }
      });

      const data = await res.json();

      return data as {
        goal: Goal,
        message: string;
      }
    },
    onSuccess: ({ goal, message }: { goal: Goal, message: string }) => {
      console.log(goal, message);
      queryClient.invalidateQueries(["goals"]);
      setGoalEditor(st => ({ ...st, isEditing: false }));

      setUndoList(st => [...st, { ...goal, message }]);

      setTimeout(() => {
        setUndoList(st => {
          return st.filter(g => goal.id !== g.id);
        });
      }, 5000);
    }
  });

  const [undoList, setUndoList] = useState<(Goal & { message: string })[]>([]);
  const undoGoalMutation = useMutation({
    mutationFn: async (goal: UndoGoalParams) => {
      const res = await fetch(`${API_URL}/goals/${goal.id}/update`, {
        method: "POST",
        body: JSON.stringify(goal),
        headers: {
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      return data;
    },
    onSuccess: ({ goal }: { goal: Goal }) => {
      queryClient.invalidateQueries(["goals"]);
      setUndoList(st => {
        return st.filter(g => goal.id !== g.id);
      });
    }
  });

  const [goalEditor, setGoalEditor] = useState<GoalEditor>({
    goal: {
      id: "",
      content: "",
      title: "",
      difficulty: undefined
    },
    isEditing: false
  });

  return (
    <>
      <div className="h-screen flex flex-col bg-slate-600 bg-gradient-to-br from-blue-500/50 to-green-500/50">
        <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-auto">
          <CreateGoalForm />
          <GoalList setGoalEditor={setGoalEditor} updateGoalMutation={updateGoalMutation} setUndoList={setUndoList} />
        </main>
      </div>
      {goalEditor.isEditing && <GoalEditorModal goal={goalEditor.goal} updateGoalMutation={updateGoalMutation} setGoalEditor={setGoalEditor} />}
      {undoList.length > 0 && createPortal(
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col w-full items-center gap-4">
          <UndoGoalPopup key={uuid()} undoGoalMutation={undoGoalMutation} goal={undoList[undoList.length - 1]} />
        </div>,
        document.querySelector<HTMLDivElement>("#undo-list")!
      )}
    </>
  );
}
