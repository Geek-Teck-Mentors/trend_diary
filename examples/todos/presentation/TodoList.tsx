import React from 'react';
import Todo from '../todo';

type Props = {
  loading: boolean;
  todos: Todo[];
  addTodo: () => void;
};

export default function TodoList({ loading, todos, addTodo }: Props) {
  return (
    <div>
      <h1>Todoリスト</h1>
      <button onClick={addTodo} disabled={loading} type='button'>
        {loading ? '追加中...' : '新しいTodoを追加'}
      </button>
      <ul>
        {todos.map((todo: Todo) => (
          <li key={todo.todoId.toString()}>
            <div>{todo.title}</div>
            <div>{todo.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
