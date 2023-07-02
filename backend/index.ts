import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { prisma } from "./db";
import cors from "cors";

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
  const goals = await prisma.goal.findMany();
  return res.status(200).json(goals);
});

app.post("/goals/new", async (req: Request, res: Response) => {
  const { title, content, deadline } = req.body;

  if (!title || !content) {
    return res.status(500).json({ message: "No input was provided." });
  };

  const newGoal = await prisma.goal.create({
    data: {
      title,
      content,
      deadline: new Date(deadline),
    }
  });

  return res.status(200).json({ success: true, goal: newGoal });
});

app.post("/goals/:id/update", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, deadline } = req.body;

  const updatedGoal = await prisma.goal.update({
    where: { id },
    data: {
      title,
      content,
      deadline: new Date(deadline)
    }
  });

  return res.status(200).json({ success: true, goal: updatedGoal });
});

app.post("/goals/delete", async (req: Request, res: Response) => {
  const { id } = req.body;

  const deletedGoal = await prisma.goal.delete({
    where: { id }
  });

  return res.status(200).json({ success: true, goal: deletedGoal });
});

app.listen(port, () => {
  console.log(`[backend]: Server is listening at port ${port}`);
});
