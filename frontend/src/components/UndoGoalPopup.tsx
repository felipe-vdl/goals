import { UseMutationResult } from "@tanstack/react-query";
import { UndoGoalParams, Goal } from "../App";

export type UndoGoalProps = {
  goal: Goal & { message: string },
  undoGoalMutation: UseMutationResult<any, unknown, UndoGoalParams, unknown>
}

export default function UndoGoalPopup({ goal, undoGoalMutation }: UndoGoalProps) {
  return (
    <div className="w-3/5 md:w-1/3 text-white bg-slate-800 bg-gradient-to-br from-blue-500/50 to-green-500/50 py-2 px-4 rounded opacity-90">
      <div className="flex justify-between text-sm">
        <p>{goal.message}</p>
        <button disabled={undoGoalMutation.isLoading} className="hover:text-green-500 disabled:text-green-600" onClick={() => undoGoalMutation.mutate(goal)}>Undo</button>
      </div>
    </div>
  );
}