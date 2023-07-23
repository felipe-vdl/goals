import { Goal } from "../App"
import { UseMutationResult } from "@tanstack/react-query";

interface GoalListItemProps {
  goal: Goal;
  handleEditGoal: (goal: Goal) => void;
  deleteGoalMutation: UseMutationResult<any, unknown, { id: string, deleted_at: Date | undefined }, unknown>;
  completeGoalMutation: UseMutationResult<any, unknown, { id: string, completed_at: Date | undefined }, unknown>;
}

const titleFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short" });
const formatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

type RelativeTimeFormatUnit = "day" | "days" | "hour" | "hours" | "minute" | "minutes" | "month" | "months" | "quarter" | "quarters" | "second" | "seconds" | "week" | "weeks" | "year" | "years";

type Division = {
  amount: number;
  name: RelativeTimeFormatUnit;
}

const DIVISIONS: Division[] = [
  { amount: 60, name: "seconds" },
  { amount: 60, name: "minutes" },
  { amount: 24, name: "hours" },
  { amount: 7, name: "days" },
  { amount: 4.34524, name: "weeks" },
  { amount: 12, name: "months" },
  { amount: Number.POSITIVE_INFINITY, name: "years" },
]

const formatTimeAgo = (date: Date) => {
  let duration = (date.getTime() - new Date().getTime()) / 1000

  for (let i = 0; i < DIVISIONS.length; i++) {
    const division = DIVISIONS[i]
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.name);
    }
    duration /= division.amount
  }
}

export default function GoalListItem({ goal, handleEditGoal, deleteGoalMutation, completeGoalMutation }: GoalListItemProps) {

  return <div
    className={`p-2 border rounded flex items-center
    ${goal.completed_at ? "text-green-300 border-green-300/70" : "text-white border-white/70"}
  `}>
    <div className="flex flex-col flex-1">
      <h3 className={`text-xl font-semi tracking-wide pb-2 mb-1 border-b ${goal.completed_at ? "border-green-300/70" : "border-white/40"} flex justify-between`}>
        {goal.title}
        <div className="flex gap-4">
          <button className="hover:text-yellow-400" title="Edit goal." onClick={() => handleEditGoal(goal)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
              <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
            </svg>
          </button>
          <button className="hover:text-red-400" title="Delete goal." onClick={() => deleteGoalMutation.mutate({ id: goal.id, deleted_at: goal.deleted_at })}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
            </svg>
          </button>
          <button className="hover:text-green-400" title={`${goal.completed_at ? "Undo completion." : "Mark as completed."}`} onClick={() => completeGoalMutation.mutate({ id: goal.id, completed_at: goal.completed_at })}>
            {goal.completed_at ?
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z" />
              </svg>
              :
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
              </svg>
            }
          </button>
        </div>
      </h3>
      <p className={`${goal.completed_at ? "text-green-300/80" : "text-white/80"} text-md`}>{goal.content}</p>
      {!goal.completed_at && goal.deadline ?
        new Date(goal.deadline).getTime() < new Date().getTime() ?
          <small title={titleFormatter.format(new Date(goal.deadline))} className="border-t border-white/40 mt-1 pt-1 text-xs text-red-400">Expired {formatTimeAgo(new Date(goal.deadline))}.</small>
          :
          <small title={titleFormatter.format(new Date(goal.deadline))} className="border-t border-white/40 mt-1 pt-1 text-xs text-green-400">Expires {formatTimeAgo(new Date(goal.deadline))}.</small>
        : <></>}
    </div>
  </div>
}