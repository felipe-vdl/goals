import { useQuery, useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import useLocalStorage from "../hooks/useLocalStorage";
import { GoalEditor, API_URL, Goal, UpdateGoalForm } from "../App";
import { v4 as uuid } from "uuid";

import { GoalSorting } from "../utils/goalSortingFns";
import goalSortingFns from "../utils/goalSortingFns";

import GoalListItem from "./GoalListItem";

type GoalListProps = {
  setGoalEditor: React.Dispatch<React.SetStateAction<GoalEditor>>,
  updateGoalMutation: UseMutationResult<{
    goal: Goal;
  }, unknown, UpdateGoalForm, unknown>,
  setUndoList: React.Dispatch<React.SetStateAction<(Goal & {
    message: string;
  })[]>>
}

export default function GoalList({ setGoalEditor, setUndoList }: GoalListProps) {
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

  const handleEditGoal = (goal: Goal) => {
    setGoalEditor({
      isEditing: true,
      goal
    });
  }

  const queryClient = useQueryClient();

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
    <div className="p-4 rounded bg-slate-800/80 text-white bg-gradient-to-br from-white/5 to-black/10 flex-1 flex flex-col">
      <div className="flex border-b px-2 pb-2 mb-4 items-center">
        <h2 className="flex-1 text-xl font-light">Goals:</h2>
        <div className="flex">
          <label className="flex-1">Order by:</label>
          <select className="flex-1 bg-slate-500 outline-0 text-center rounded mx-2 py-1" onChange={handleSortChange} name="type" defaultValue={sortType.type}>
            <option value="created-at">Creation</option>
            <option value="deadline">Deadline</option>
            <option value="difficulty">Difficulty</option>
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
  );
}