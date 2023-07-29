import type { Goal } from "../App";

type SortOrder = "asc" | "desc";
export type GoalSorting = { type: "created-at" | "completed-at" | "deadline" | "difficulty" | "title", order: SortOrder };

const goalSortingFns = {
  "created-at": (a: Goal, b: Goal, order: SortOrder): number => {
    const createdA = new Date(a.created_at);
    const createdB = new Date(b.created_at);
    if (createdA.getTime() > createdB.getTime()) return order === "asc" ? 1 : -1
    if (createdA.getTime() < createdB.getTime()) return order === "asc" ? -1 : 1
    return 0;
  },
  "completed-at": (a: Goal, b: Goal, order: SortOrder): number => {
    // Put at last if not completed.
    if (!a.completed_at) return 1;
    if (!b.completed_at) return order === "asc" ? 1 : -1

    const completedA = new Date(a.completed_at);
    const completedB = new Date(b.completed_at);

    if (completedA.getTime() > completedB.getTime()) return order === "asc" ? 1 : -1
    if (completedA.getTime() < completedB.getTime()) return order === "asc" ? -1 : 1
    return 0;
  },
  "deadline": (a: Goal, b: Goal, order: SortOrder): number => {
    if (!a.deadline) return order === "asc" ? -1 : 1;
    if (!b.deadline) return order === "asc" ? 1 : -1;

    // Put at last if already completed.
    if (a.completed_at) return 1;

    const deadlineA = new Date(a.deadline);
    const deadlineB = new Date(b.deadline);

    if (deadlineA.getTime() > deadlineB.getTime()) return order === "asc" ? 1 : -1
    if (deadlineA.getTime() < deadlineB.getTime()) return order === "asc" ? -1 : 1
    return 0
  },
  "title": (a: Goal, b: Goal, order: SortOrder): number => {
    if (a.title > b.title) return order === "asc" ? 1 : -1
    if (a.title < b.title) return order === "asc" ? -1 : 1
    return 0;
  },
  "difficulty": (a: Goal, b: Goal, order: SortOrder): number => {
    let result = 0;

    if (a.difficulty === "EASY" && b.difficulty !== "EASY") result = -1;
    else if (a.difficulty === "MODERATE" && b.difficulty === "EASY") result = 1;
    else if (a.difficulty === "MODERATE" && b.difficulty === "HARD") result = -1;
    else if (a.difficulty === "HARD" && ["EASY", "MODERATE"].includes(b.difficulty!)) result = 1;

    return result * (order === "asc" ? 1 : -1);
  }
};

export default goalSortingFns;