import React, { useState } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";

import GoalListItem from "./components/GoalListItem"
import GoalEditorModal from "./components/GoalEditorModal";

export type Goal = {
  id: string;
  title: string;
  content: string;
  deadline?: string;
  completed_at?: string;
};

export type GoalEditor = {
  goal: Goal,
  isEditing: boolean
}

export default function App() {
  const { data, isSuccess } = useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await fetch("http://localhost:4000/goals");
      const data = await res.json();
      return data;
    },
    onSuccess: (data: Goal[]) => {
      console.log("Successfully fetched goals!", data);
    },
  });

  const [form, setForm] = useState<Omit<Goal, "id">>({
    title: "",
    content: "",
    deadline: ""
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
      goalsMutation.mutate(form);
    }
  }

  const queryClient = useQueryClient();

  const goalsMutation = useMutation({
    mutationFn: async (variables: Omit<Goal, "id">) => {
      const res = await fetch('http://localhost:4000/goals/new', {
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
        deadline: ""
      })
      queryClient.invalidateQueries(["goals"]);
    },
    onError: (error: unknown) => {
      console.log(error);
    }
  });

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    goalsMutation.mutate(form);
  }

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("http://localhost:4000/goals/delete", {
        method: "POST",
        body: JSON.stringify({ id }),
        headers: {
          "Content-Type": "application/json",
        }
      });

      const data = await res.json();

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["goals"]);
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
                  value={form.deadline}
                />
              </div>
              <input type="submit" hidden />
              <button disabled={goalsMutation.isLoading} className="transition-colors hover:from-red-500 hover:to-amber-500 rounded px-2 py-2 w-full bg-gradient-to-r from-green-500 to-cyan-500 text-white disabled:from-green-600/70 disabled:to-cyan-600/70">Send</button>
            </div>
          </form>
          <div className="p-4 rounded bg-slate-800/80 text-white bg-gradient-to-br from-white/5 to-black/10 flex-1 flex flex-col">
            <h2 className="text-xl font-light border-b px-2 pb-2 mb-4">Goals:</h2>
            <div className="flex-1 flex flex-col gap-4 overflow-auto pr-2">
              {isSuccess &&
                data.length > 0 ?
                <>
                  {data.map((goal) => (
                    <GoalListItem key={uuid()} handleEditGoal={handleEditGoal} deleteGoalMutation={deleteGoalMutation} goal={goal} />
                  ))}
                </>
                : <h3 className="text-white m-auto">No goals were found.</h3>
              }
            </div>
          </div>
        </main>
      </div>
      {goalEditor.isEditing && <GoalEditorModal goal={goalEditor.goal} setGoalEditor={setGoalEditor} />}
    </>
  );
}
