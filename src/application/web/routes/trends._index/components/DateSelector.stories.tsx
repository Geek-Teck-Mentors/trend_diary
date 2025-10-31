import type { Meta, StoryObj } from '@storybook/react-vite'
import { subDays } from 'date-fns'
import { expect, userEvent, waitFor } from 'storybook/test'
import DateSelector from './DateSelector'

const meta: Meta<typeof DateSelector> = {
  component: DateSelector,
  parameters: {
    layout: 'centered',
  },
}
export default meta

type Story = StoryObj<typeof DateSelector>

const today = new Date()
const yesterday = subDays(today, 1)
const twoDaysAgo = subDays(today, 2)

export const TodaySelected: Story = {
  args: {
    date: today,
    onDateChange: () => {
      // Storybook display only
    },
  },
  play: async ({ canvas, step }) => {
    await step('前日ボタンと日付ボタンが表示されることを確認', async () => {
      const prevButton = canvas.getByRole('button', { name: '前日' })
      const dateButton = canvas.getByRole('button', { name: /日付を選択/ })
      await expect(prevButton).toBeInTheDocument()
      await expect(dateButton).toBeInTheDocument()
    })

    await step('今日の場合、翌日ボタンが無効化されることを確認', async () => {
      const nextButton = canvas.getByRole('button', { name: '翌日' })
      await expect(nextButton).toBeDisabled()
    })
  },
}

export const YesterdaySelected: Story = {
  args: {
    date: yesterday,
    onDateChange: () => {
      // Storybook display only
    },
  },
  play: async ({ canvas, step }) => {
    await step('前日、翌日ボタンが表示されることを確認', async () => {
      const prevButton = canvas.getByRole('button', { name: '前日' })
      const nextButton = canvas.getByRole('button', { name: '翌日' })
      await expect(prevButton).toBeInTheDocument()
      await expect(nextButton).toBeInTheDocument()
    })

    await step('昨日の場合、翌日ボタンが有効化されることを確認', async () => {
      const nextButton = canvas.getByRole('button', { name: '翌日' })
      await expect(nextButton).toBeEnabled()
    })
  },
}

export const TwoDaysAgoSelected: Story = {
  args: {
    date: twoDaysAgo,
    onDateChange: () => {
      // Storybook display only
    },
  },
  play: async ({ canvas, step }) => {
    await step('前日、翌日ボタンが表示され、両方有効化されることを確認', async () => {
      const prevButton = canvas.getByRole('button', { name: '前日' })
      const nextButton = canvas.getByRole('button', { name: '翌日' })
      await expect(prevButton).toBeEnabled()
      await expect(nextButton).toBeEnabled()
    })
  },
}

export const ClickPreviousDayButton: Story = {
  args: {
    date: today,
    onDateChange: () => {
      // Storybook display only
    },
  },
  play: async ({ canvas, step }) => {
    await step('前日ボタンをクリック', async () => {
      const prevButton = canvas.getByRole('button', { name: '前日' })
      await userEvent.click(prevButton)
    })
  },
}

export const ClickNextDayButton: Story = {
  args: {
    date: yesterday,
    onDateChange: () => {
      // Storybook display only
    },
  },
  play: async ({ canvas, step }) => {
    await step('翌日ボタンをクリック', async () => {
      const nextButton = canvas.getByRole('button', { name: '翌日' })
      await userEvent.click(nextButton)
    })
  },
}

export const OpenCalendar: Story = {
  args: {
    date: today,
    onDateChange: () => {
      // Storybook display only
    },
  },
  play: async ({ canvas, step }) => {
    let dateButton: HTMLElement

    await step('日付ボタンをクリック', async () => {
      dateButton = canvas.getByRole('button', { name: /日付を選択/ })
      await userEvent.click(dateButton)
    })

    await step('カレンダーが表示されることを確認', async () => {
      await waitFor(async () => {
        // カレンダーのグリッドが表示されることを確認
        const calendar = document.querySelector('[role="application"]')
        await expect(calendar).toBeInTheDocument()
      })
    })
  },
}
