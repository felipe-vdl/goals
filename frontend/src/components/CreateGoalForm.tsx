import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Goal, API_URL, difficultyStyle } from "../App";

export default function CreateGoalForm() {
  const [form, setForm] = useState<Omit<Goal, "id" | "created_at" | "updated_at">>({
    title: "",
    content: "",
    deadline: undefined,
    difficulty: undefined
  });

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
        deadline: undefined,
        difficulty: undefined
      })
      queryClient.invalidateQueries(["goals"]);
    },
    onError: (error: unknown) => {
      console.log(error);
    }
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

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    createGoalsMutation.mutate(form);
  }

  return (
    <form onKeyDown={handleKeyDown} onSubmit={handleSubmit} className="p-4 rounded bg-slate-800/80 text-white bg-gradient-to-br from-white/5 to-black/10 flex flex-col">
      <h3 className="text-xl font-light border-b pb-2 text-center mb-4">
        Add a New Goal
      </h3>
      <div className="flex flex-col gap-3 flex-1">
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
          <label className="text-white">Difficulty</label>
          <div className="flex justify-around items-center">
            <div className="flex items-center justify-center py-1">
              <label htmlFor="EASY" className={`absolute z-10 cursor-pointer ${form.difficulty ? difficultyStyle[form.difficulty] : "text-slate-800/90"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                </svg>
              </label>
              <input id="EASY" className="z-20 opacity-0 cursor-pointer" type="radio" name="difficulty" required defaultChecked={form.difficulty === "EASY"} value="EASY" onChange={handleChange} />
            </div>
            <div className="flex items-center justify-center py-1">
              <label htmlFor="MODERATE" className={`absolute z-10 cursor-pointer ${form.difficulty && ["HARD", "MODERATE"].includes(form.difficulty) ? difficultyStyle[form.difficulty] : "text-slate-800/90"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                </svg>
              </label>
              <input id="MODERATE" className="z-20 opacity-0 cursor-pointer" type="radio" name="difficulty" required defaultChecked={form.difficulty === "MODERATE"} value="MODERATE" onChange={handleChange} />
            </div>
            <div className="flex items-center justify-center py-1">
              <label htmlFor="HARD" className={`absolute z-10 cursor-pointer ${form.difficulty === "HARD" ? difficultyStyle[form.difficulty] : "text-slate-800/90"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                </svg>
              </label>
              <input id="HARD" className="z-20 opacity-0 cursor-pointer" type="radio" name="difficulty" required defaultChecked={form.difficulty === "HARD"} value="HARD" onChange={handleChange} />
            </div>
          </div>
        </div>
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
  );
}