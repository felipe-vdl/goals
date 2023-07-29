import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { prisma } from "./db";
import cors from "cors";
import { Difficulty } from "@prisma/client";

dotenv.config();

const app = express();
const port = 4000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello from the server.",
  });
});

app.get("/goals", async (req: Request, res: Response) => {
  const goals = await prisma.goal.findMany({
    where: {
      deleted_at: {
        equals: null,
      }
    }
  });
  return res.status(200).json(goals);
});

app.post("/goals/new", async (req: Request, res: Response) => {
  const { title, content, deadline } = req.body;
  const difficulty = req.body.difficulty as Difficulty
  
  if (!title || !content) {
    return res.status(500).json({ message: "No input was provided." });
  };

  const newGoal = await prisma.goal.create({
    data: {
      title,
      content,
      deadline: new Date(deadline),
      difficulty
    }
  });

  return res.status(200).json({ success: true, goal: newGoal });
});

app.post("/goals/:id/update", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, deadline, completed_at, deleted_at } = req.body;
  const difficulty = req.body.difficulty as Difficulty
  
  const oldGoal = await prisma.goal.findFirst({ where: { id } });

  const updatedGoal = await prisma.goal.update({
    where: { id },
    data: {
      title,
      content,
      difficulty,
      completed_at: completed_at ? new Date(completed_at) : null,
      deadline: deadline ? new Date(deadline) : null,
      deleted_at: deleted_at ? new Date(deleted_at) : null
    }
  });

  return res.status(200).json({ goal: oldGoal, message: "Updated goal.", });
});

app.post("/goals/delete", async (req: Request, res: Response) => {
  const { id, deleted_at } = req.body;

  const oldGoal = await prisma.goal.findFirst({ where: { id } });

  const deletedGoal = await prisma.goal.update({
    where: { id },
    data: {
      deleted_at: deleted_at ? null : new Date(),
    }
  });

  return res.status(200).json({ message: deleted_at ? "Restored goal." : "Deleted goal.", goal: oldGoal });
});

app.post("/goals/complete", async (req: Request, res: Response) => {
  const { id, completed_at } = req.body;

  const completedGoal = await prisma.goal.update({
    where: { id },
    data: {
      completed_at: completed_at ? null : new Date(),
    }
  });

  return res.status(200).json({ goal: completedGoal, message: completed_at ? "Uncompleted goal." : "Completed goal.", });
});

app.listen(port, () => {
  console.log(`[backend]: Server is listening at port ${port}`);
});
