import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import MediaFilter from './media-filter'

const meta: Meta<typeof MediaFilter> = {
  component: MediaFilter,
  parameters: {
    layout: 'centered',
  },
}
export default meta

type Story = StoryObj<typeof MediaFilter>

export const AllSelected: Story = {
  args: {
    selectedMedia: null,
    onMediaChange: () => {
      // Storybook display only
    },
  },
  play: async ({ canvas, step }) => {
    let trigger: HTMLElement
    await step('フィルタトリガーが表示され、「すべて」と表示されることを確認', async () => {
      trigger = canvas.getByRole('button')
      await expect(trigger).toBeInTheDocument()
      await expect(trigger).toHaveTextContent('すべて')
    })

    await step('フィルタがアクティブでないため、アイコンが灰色であることを確認', async () => {
      const icon = trigger.querySelector('svg')
      await expect(icon).toHaveClass('text-gray-600')
    })
  },
}

export const QiitaSelected: Story = {
  args: {
    selectedMedia: 'qiita',
    onMediaChange: () => {
      // Storybook display only
    },
  },
  play: async ({ canvas, step }) => {
    let trigger: HTMLElement
    await step('フィルタトリガーが表示され、「Qiita」と表示されることを確認', async () => {
      trigger = canvas.getByRole('button')
      await expect(trigger).toBeInTheDocument()
      await expect(trigger).toHaveTextContent('Qiita')
    })

    await step('フィルタがアクティブなため、アイコンが青色であることを確認', async () => {
      const icon = trigger.querySelector('svg')
      await expect(icon).toHaveClass('text-blue-600')
    })
  },
}

export const ZennSelected: Story = {
  args: {
    selectedMedia: 'zenn',
    onMediaChange: () => {
      // Storybook display only
    },
  },
  play: async ({ canvas, step }) => {
    let trigger: HTMLElement
    await step('フィルタトリガーが表示され、「Zenn」と表示されることを確認', async () => {
      trigger = canvas.getByRole('button')
      await expect(trigger).toBeInTheDocument()
      await expect(trigger).toHaveTextContent('Zenn')
    })

    await step('フィルタがアクティブなため、アイコンが青色であることを確認', async () => {
      const icon = trigger.querySelector('svg')
      await expect(icon).toHaveClass('text-blue-600')
    })
  },
}

export const OpenDropdownMenu: Story = {
  args: {
    selectedMedia: null,
    onMediaChange: () => {
      // Storybook display only
    },
  },
  play: async ({ canvas, step }) => {
    const trigger = canvas.getByRole('button')

    await step('フィルタトリガーをクリックしてドロップダウンを開く', async () => {
      await userEvent.click(trigger)
    })

    await step('ドロップダウンメニューが表示され、3つの項目があることを確認', async () => {
      await waitFor(async () => {
        const allItem = canvas.getByRole('menuitem', { name: 'すべて' })
        const qiitaItem = canvas.getByRole('menuitem', { name: 'Qiita' })
        const zennItem = canvas.getByRole('menuitem', { name: 'Zenn' })

        await expect(allItem).toBeVisible()
        await expect(qiitaItem).toBeVisible()
        await expect(zennItem).toBeVisible()
      })
    })
  },
}

export const SelectQiitaFromDropdown: Story = {
  args: {
    selectedMedia: null,
    onMediaChange: () => {
      // Storybook display only
    },
  },
  play: async ({ canvas, step }) => {
    const trigger = canvas.getByRole('button')

    await step('フィルタトリガーをクリック', async () => {
      await userEvent.click(trigger)
    })

    await step('Qiita項目をクリック', async () => {
      await waitFor(async () => {
        const qiitaItem = canvas.getByRole('menuitem', { name: 'Qiita' })
        await userEvent.click(qiitaItem)
      })
    })
  },
}

export const SelectZennFromDropdown: Story = {
  args: {
    selectedMedia: null,
    onMediaChange: () => {
      // Storybook display only
    },
  },
  play: async ({ canvas, step }) => {
    const trigger = canvas.getByRole('button')

    await step('フィルタトリガーをクリック', async () => {
      await userEvent.click(trigger)
    })

    await step('Zenn項目をクリック', async () => {
      await waitFor(async () => {
        const zennItem = canvas.getByRole('menuitem', { name: 'Zenn' })
        await userEvent.click(zennItem)
      })
    })
  },
}

export const ResetFilter: Story = {
  args: {
    selectedMedia: 'qiita',
    onMediaChange: () => {
      // Storybook display only
    },
  },
  play: async ({ canvas, step }) => {
    const trigger = canvas.getByRole('button')

    await step('初期状態でQiitaが選択されていることを確認', async () => {
      await expect(trigger).toHaveTextContent('Qiita')
    })

    await step('フィルタトリガーをクリック', async () => {
      await userEvent.click(trigger)
    })

    await step('「すべて」項目をクリック', async () => {
      await waitFor(async () => {
        const allItem = canvas.getByRole('menuitem', { name: 'すべて' })
        await userEvent.click(allItem)
      })
    })
  },
}
