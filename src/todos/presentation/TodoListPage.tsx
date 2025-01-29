// 試験的実装なので、Typeガン無視で行く
export const TodoListPage = ({ todos }) => {
  return (
    <div>
      <h1>Todoリスト</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.todoId}>
            <div>{todo.title}</div>
            <div>{todo.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};
