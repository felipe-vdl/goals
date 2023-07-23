import React, { useState } from "react";
import useLocalStorage from "./hooks/useLocalStorage";
import { createPortal } from "react-dom";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";
import goalSortingFns, { type GoalSorting } from "./utils/goalSortingFns"

import GoalListItem from "./components/GoalListItem"
import GoalEditorModal from "./components/GoalEditorModal";
import UndoGoalPopup from "./components/UndoGoalPopup";

export type Goal = {
  id: string;
  title: string;
  content: string;
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
}

export type UndoGoalParams = Goal;

export const API_URL = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_PORT) ? `${import.meta.env.VITE_API_URL}:${import.meta.env.VITE_API_PORT}` : "http://localhost:4000";

export default function App() {
  const [sortType, setSortType] = useLocalStorage<GoalSorting>({
    type: "created-at", order: "desc"
  }, "goals-order");
  const handleSortChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    setSortType(st => ({
      ...st,
      [evt.target.name]: evt.target.value,
    }));
  }

  const { data, isSuccess } = useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/goals`);
      const data = await res.json() as Goal[];
      return data;
    },
    onSuccess: (data: Goal[]) => {
      console.log("Successfully fetched goals!", data);
    },
  });

  const [form, setForm] = useState<Omit<Goal, "id" | "created_at" | "updated_at">>({
    title: "",
    content: "",
    deadline: undefined
  });

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(st => ({
      ...st,
      [evt.target.name]: evt.target.value
    }));
  }

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLFormElement>) => {
    if (evt.key === "Enter" && !evt.shiftKey) {
      evt.preventDefault();
      createGoalsMutation.mutate(form);
    }
  }

  const queryClient = useQueryClient();

  const createGoalsMutation = useMutation({
    mutationFn: async (variables: Omit<Goal, "id" | "created_at" | "updated_at">) => {
      const res = await fetch(`${API_URL}/goals/new`, {
        body: JSON.stringify(variables),
        method: "post",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();

      return data as {
        goal: Goal,
        success: boolean
      };
    },
    onSuccess: () => {
      setForm({
        title: "",
        content: "",
        deadline: undefined
      })
      queryClient.invalidateQueries(["goals"]);
    },
    onError: (error: unknown) => {
      console.log(error);
    }
  });

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    createGoalsMutation.mutate(form);
  }

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
  const [goalEditor, setGoalEditor] = useState<GoalEditor>({
    goal: {
      id: "",
      content: "",
      title: ""
    },
    isEditing: false
  });
  const handleEditGoal = (goal: Goal) => {
    setGoalEditor({
      isEditing: true,
      goal
    });
  }

  const completeGoalMutation = useMutation({
    mutationFn: async ({ id, completed_at }:
      {
        id: string, completed_at: Date | undefined
      }) => {
      const res = await fetch(`${API_URL}/goals/complete`, {
        method: "POST",
        body: JSON.stringify({ id, completed_at }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["goals"]);
      console.log(data);
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async ({ id, deleted_at }: { id: string, deleted_at: Date | undefined }) => {
      const res = await fetch(`${API_URL}/goals/delete`, {
        method: "POST",
        body: JSON.stringify({ id, deleted_at }),
        headers: {
          "Content-Type": "application/json",
        }
      });

      const data = await res.json();

      return data;
    },
    onSuccess: ({ goal, message }: { goal: Goal, message: string }) => {
      console.log(goal, message);
      queryClient.invalidateQueries(["goals"]);
      setUndoList(st => ([...st, { ...goal, message }]));
      setTimeout(() => {
        setUndoList(st => {
          return st.filter(g => goal.id !== g.id);
        });
      }, 4000);
    }
  });



  return (
    <>
      <div className="h-screen flex flex-col bg-slate-600 bg-gradient-to-br from-blue-500/50 to-green-500/50">
        <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-auto">
          <form onKeyDown={handleKeyDown} onSubmit={handleSubmit} className="p-4 rounded bg-slate-800/80 text-white bg-gradient-to-br from-white/5 to-black/10 flex flex-col">
            <h3 className="text-xl font-light border-b pb-2 text-center mb-4">
              Add a New Goal
            </h3>
            <div className="flex flex-col gap-2 flex-1">
              <input
                value={form.title}
                onChange={handleChange}
                type="text"
                name="title"
                placeholder="Title"
                className="p-2 outline-0 text-white bg-slate-800 rounded"
              />
              <textarea
                value={form.content}
                onChange={handleChange}
                name="content"
                placeholder="Content"
                className="p-2 outline-0 text-white bg-slate-800 flex-1 rounded resize-none"
              />
              <div className="flex flex-col gap-2">
                <label className="text-white" htmlFor="deadline">Deadline</label>
                <input
                  id="deadline"
                  type="datetime-local"
                  name="deadline"
                  min={new Date().toISOString().slice(0, 16)}
                  className="bg-slate-800 text-white flex-1 py-1 px-2 outline-0 rounded"
                  onChange={handleChange}
                  value={form?.deadline ? `${form.deadline}` : ""}
                />
              </div>
              <input type="submit" hidden />
              <button disabled={createGoalsMutation.isLoading} className="transition-colors hover:from-red-500 hover:to-amber-500 rounded px-2 py-2 w-full bg-gradient-to-r from-green-500 to-cyan-500 text-white disabled:from-green-600/70 disabled:to-cyan-600/70">Send</button>
            </div>
          </form>
          <div className="p-4 rounded bg-slate-800/80 text-white bg-gradient-to-br from-white/5 to-black/10 flex-1 flex flex-col">
            <div className="flex border-b px-2 pb-2 mb-4 items-center">
              <h2 className="flex-1 text-xl font-light">Goals:</h2>
              <div className="flex">
                <label className="flex-1">Order by:</label>
                <select className="flex-1 bg-slate-500 outline-0 text-center rounded mx-2 py-1" onChange={handleSortChange} name="type" defaultValue={sortType.type}>
                  <option value="created-at">Creation</option>
                  <option value="deadline">Deadline</option>
                  <option value="completed-at">Completion</option>
                  <option value="title">Title</option>
                </select>
                <select className="flex-1 bg-slate-500 outline-0 text-center rounded py-1" onChange={handleSortChange} name="order" defaultValue={sortType.order}>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-4 overflow-auto pr-2">
              {isSuccess &&
                data.length > 0 ?
                <>
                  {data.sort((a, b) => {
                    return goalSortingFns[sortType.type ? sortType.type : "created-at"](a, b, sortType.order);
                  }).map((goal) => (
                    <GoalListItem key={uuid()} handleEditGoal={handleEditGoal} completeGoalMutation={completeGoalMutation} deleteGoalMutation={deleteGoalMutation} goal={goal} />
                  ))}
                </>
                : <h3 className="text-white m-auto">No goals were found.</h3>
              }
            </div>
          </div>
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
