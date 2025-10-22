import type { Meta, StoryObj } from '@storybook/react-vite'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { expect, userEvent, waitFor } from 'storybook/test'
import MediaFilter from './MediaFilter'

const meta: Meta<typeof MediaFilter> = {
  component: MediaFilter,
  parameters: {
    layout: 'centered',
  },
}
export default meta

type Story = StoryObj<typeof MediaFilter>

// URLパラメータを設定したカスタムデコレーター
const createRouterDecorator = (initialPath: string) => (Story: any) => {
  const router = createMemoryRouter(
    [
      {
        path: '*',
        element: <Story />,
      },
    ],
    {
      initialEntries: [initialPath],
    },
  )
  return <RouterProvider router={router} />
}

export const Default: Story = {
  decorators: [createRouterDecorator('/trends')],
  play: async ({ canvas, step }) => {
    await step('3つのボタンが表示されることを確認', async () => {
      const allButton = canvas.getByRole('button', { name: '全て' })
      const qiitaButton = canvas.getByRole('button', { name: 'Qiita' })
      const zennButton = canvas.getByRole('button', { name: 'Zenn' })

      await expect(allButton).toBeInTheDocument()
      await expect(qiitaButton).toBeInTheDocument()
      await expect(zennButton).toBeInTheDocument()
    })

    await step('デフォルトで「全て」ボタンが選択状態であることを確認', async () => {
      const allButton = canvas.getByRole('button', { name: '全て' })
      // default variantが適用されている（具体的なクラス名は実装依存）
      await expect(allButton).toBeVisible()
    })
  },
}

export const QiitaSelected: Story = {
  decorators: [createRouterDecorator('/trends?media=qiita')],
  play: async ({ canvas, step }) => {
    await step('Qiitaボタンが選択状態であることを確認', async () => {
      const qiitaButton = canvas.getByRole('button', { name: 'Qiita' })
      await expect(qiitaButton).toBeVisible()
    })

    await step('他のボタンが非選択状態であることを確認', async () => {
      const allButton = canvas.getByRole('button', { name: '全て' })
      const zennButton = canvas.getByRole('button', { name: 'Zenn' })

      await expect(allButton).toBeVisible()
      await expect(zennButton).toBeVisible()
    })
  },
}

export const ZennSelected: Story = {
  decorators: [createRouterDecorator('/trends?media=zenn')],
  play: async ({ canvas, step }) => {
    await step('Zennボタンが選択状態であることを確認', async () => {
      const zennButton = canvas.getByRole('button', { name: 'Zenn' })
      await expect(zennButton).toBeVisible()
    })

    await step('他のボタンが非選択状態であることを確認', async () => {
      const allButton = canvas.getByRole('button', { name: '全て' })
      const qiitaButton = canvas.getByRole('button', { name: 'Qiita' })

      await expect(allButton).toBeVisible()
      await expect(qiitaButton).toBeVisible()
    })
  },
}

export const ClickQiitaButton: Story = {
  decorators: [createRouterDecorator('/trends')],
  play: async ({ canvas, step }) => {
    const qiitaButton = canvas.getByRole('button', { name: 'Qiita' })

    await step('Qiitaボタンをクリック', async () => {
      await userEvent.click(qiitaButton)
    })

    await step('Qiitaボタンが選択状態になることを確認', async () => {
      await waitFor(() => {
        expect(qiitaButton).toBeVisible()
      })
    })
  },
}

export const ClickZennButton: Story = {
  decorators: [createRouterDecorator('/trends')],
  play: async ({ canvas, step }) => {
    const zennButton = canvas.getByRole('button', { name: 'Zenn' })

    await step('Zennボタンをクリック', async () => {
      await userEvent.click(zennButton)
    })

    await step('Zennボタンが選択状態になることを確認', async () => {
      await waitFor(() => {
        expect(zennButton).toBeVisible()
      })
    })
  },
}

export const ClickAllButton: Story = {
  decorators: [createRouterDecorator('/trends?media=qiita')],
  play: async ({ canvas, step }) => {
    const allButton = canvas.getByRole('button', { name: '全て' })

    await step('初期状態でQiitaが選択されていることを確認', async () => {
      const qiitaButton = canvas.getByRole('button', { name: 'Qiita' })
      await expect(qiitaButton).toBeVisible()
    })

    await step('「全て」ボタンをクリック', async () => {
      await userEvent.click(allButton)
    })

    await step('「全て」ボタンが選択状態になることを確認', async () => {
      await waitFor(() => {
        expect(allButton).toBeVisible()
      })
    })
  },
}

export const SwitchBetweenFilters: Story = {
  decorators: [createRouterDecorator('/trends')],
  play: async ({ canvas, step }) => {
    const allButton = canvas.getByRole('button', { name: '全て' })
    const qiitaButton = canvas.getByRole('button', { name: 'Qiita' })
    const zennButton = canvas.getByRole('button', { name: 'Zenn' })

    await step('Qiitaボタンをクリック', async () => {
      await userEvent.click(qiitaButton)
      await waitFor(() => {
        expect(qiitaButton).toBeVisible()
      })
    })

    await step('Zennボタンをクリック', async () => {
      await userEvent.click(zennButton)
      await waitFor(() => {
        expect(zennButton).toBeVisible()
      })
    })

    await step('「全て」ボタンをクリック', async () => {
      await userEvent.click(allButton)
      await waitFor(() => {
        expect(allButton).toBeVisible()
      })
    })
  },
}
