import { z } from 'zod';

export const todoSchema = z.object({
  todoId: z.string().uuid(),
  title: z.string().min(1, 'Title cannot be empty'),
  description: z.string().optional(),
  completed: z.boolean(),
  dueDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TodoInput = {
  todoId: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  description?: string | undefined;
  dueDate?: string | undefined;
};
export type TodoOutput = z.output<typeof todoSchema>;

export type UpdateTodoInput = Omit<z.input<typeof todoSchema>, 'createdAt' | 'updatedAt'>;

export function isTodo(value: unknown): value is TodoOutput {
  return todoSchema.safeParse(value).success;
}
