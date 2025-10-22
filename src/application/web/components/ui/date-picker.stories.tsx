import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { DatePicker } from './date-picker'

const meta = {
  title: 'UI/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(undefined)
    return <DatePicker date={date} onDateChange={setDate} />
  },
}

export const WithSelectedDate: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date('2024-01-01'))
    return <DatePicker date={date} onDateChange={setDate} />
  },
}

export const WithCustomPlaceholder: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(undefined)
    return (
      <DatePicker
        date={date}
        onDateChange={setDate}
        placeholder="カスタムプレースホルダー"
      />
    )
  },
}

export const Disabled: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date('2024-01-01'))
    return <DatePicker date={date} onDateChange={setDate} disabled />
  },
}
