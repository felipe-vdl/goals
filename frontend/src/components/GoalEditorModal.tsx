import { useState } from "react";
import { createPortal } from "react-dom";
import type { Goal, GoalEditor } from "../App";
import { UpdateGoalForm } from "../App";
import { UseMutationResult } from "@tanstack/react-query";

declare global {
  interface Date {
    addHours: (h: number) => Date
  }
}

Date.prototype.addHours = function (h: number): Date {
  this.setHours(this.getHours() + h);
  return this;
}

type GoalEditorProps = {
  goal: Omit<Goal, "created_at" | "updated_at">,
  setGoalEditor: React.Dispatch<React.SetStateAction<GoalEditor>>,
  updateGoalMutation: UseMutationResult<{
    goal: Goal;
  }, unknown, UpdateGoalForm, unknown>
}

export default function GoalEditorModal({ goal, setGoalEditor, updateGoalMutation }: GoalEditorProps) {
  const { mutate, isLoading } = updateGoalMutation;

  const [form, setForm] = useState<UpdateGoalForm>({
    ...goal,
    deadline: goal.deadline ? new Date(goal.deadline).addHours(-3).toISOString().slice(0, 16) : ""
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
      mutate(form);
    }
  }

  const handleCancel = (evt: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    evt.preventDefault();
    setGoalEditor(st => ({ ...st, isEditing: false }));
  }

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    mutate(form);
  }

  return createPortal(
    <>
      <div className="z-50 bg-slate-700 bg-gradient-to-br from-blue-500/20 to-green-500/20 w-96 p-4 rounded flex flex-col absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <h3 className="pb-2 text-white text-center text-2xl">Editing Goal</h3>
        <p className="pb-3 text-white/70">ID: {goal.id}</p>
        <form onKeyDown={handleKeyDown} onSubmit={handleSubmit} className="flex flex-col gap-3">
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
            rows={4}
          />
          <div className="flex flex-col gap-2">
            <label className="text-white" htmlFor="deadline">Deadline</label>
            <input
              id="deadline"
              type="datetime-local"
              name="deadline"
              className="bg-slate-800 text-white flex-1 py-1 px-2 outline-0 rounded"
              onChange={handleChange}
              value={form.deadline}
            />
          </div>
          <div className="flex gap-3 text-white">
            <button className="transition-colors disabled:bg-slate-300 hover:bg-slate-300/70 bg-slate-400/70 flex-1 rounded py-2" disabled={isLoading} onClick={handleCancel} type="button">
              {isLoading ? "Saving..." : "Cancel"}
            </button>
            <button className="transition-colors hover:from-red-500 hover:to-amber-500 rounded px-2 py-2 flex-1 bg-gradient-to-r from-green-500 to-cyan-500 text-white disabled:from-green-600/70 disabled:to-cyan-600/70" disabled={isLoading} type="submit">
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
      <div className="bg-black/30 z-40 w-screen h-screen absolute" onClick={handleCancel}></div>
    </>,
    document.querySelector<HTMLDivElement>('#modal-root')!
  )
}