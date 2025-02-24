import { jsxRenderer } from "hono/jsx-renderer";

// これでいけるから、うまいこと毎回rendererにオプションでscriptのパスを与えたら動作しそう。
// でも、その仕組み作るのもめんどくさいし、トランスパイル後のjsファイルの配置先も覚えないといけないので辛い。
export const renderer = jsxRenderer(({ children }) => {
  return (
    <html>
      <head>
        <link href="/static/style.css" rel="stylesheet" />
        {import.meta.env.PROD ? (
          <script type="module" src="/static/client.js" />
        ) : (
          <script type="module" src="/examples/spa/client.tsx" />
        )}
      </head>
      <body>
        <div id="root" />
        {children}
      </body>
    </html>
  );
});
