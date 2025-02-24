import { useEffect, useState } from "hono/jsx";
import { render } from "hono/jsx/dom";

function App() {
  return (
    <>
      <h1>Hello hono/jsx/dom!</h1>
      <h2>Example of useState()</h2>
      <Counter />
      <h2>Example of API fetch()</h2>
    </>
  );
}

function Counter() {
  const [count, setCount] = useState(0);

  // これならonclick、useEffectも動作する
  useEffect(() => {
    setCount(10);
  }, []);

  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      You clicked me {count} times
    </button>
  );
}

const root = document.getElementById("root")!;
render(<App />, root);
