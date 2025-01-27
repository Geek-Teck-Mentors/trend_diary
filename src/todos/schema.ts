import { z } from "zod";
import { Todo } from "./todo";

export const todoSchema = z.object({
  todoId: z.string().uuid(),
  title: z.string().min(1, "Title cannot be empty"),
  description: z.string().optional(),
  completed: z.boolean(),
  dueDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TodoInput = z.input<typeof todoSchema>;
export type TodoOutput = z.output<typeof todoSchema>;

export type UpdateTodoInput = Omit<TodoInput, "createdAt" | "updatedAt">;

export function isTodo(value: unknown): value is TodoOutput {
  return todoSchema.safeParse(value).success;
}
