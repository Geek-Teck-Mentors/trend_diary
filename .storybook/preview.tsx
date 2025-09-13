import type { Preview } from '@storybook/react-vite'
import { createMemoryRouter, RouterProvider } from 'react-router'
import '../src/application/web/styles.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  decorators: [
    // React Routerを使用するコンポーネントのStory用デコレーター
    // useNavigate, useLocation等のhookを使用するコンポーネントが
    // Storybook内でエラーにならないように、メモリルーターでラップする
    (Story) => {
      const router = createMemoryRouter(
        [
          {
            path: '/',
            element: <Story />,
          },
          {
            path: '/login',
            element: <Story />,
          },
          {
            path: '/signup',
            element: <Story />,
          },
          {
            path: '*',
            element: <Story />,
          },
        ],
        {
          initialEntries: ['/'],
        },
      )
      return <RouterProvider router={router} />
    },
  ],
}

export default preview
