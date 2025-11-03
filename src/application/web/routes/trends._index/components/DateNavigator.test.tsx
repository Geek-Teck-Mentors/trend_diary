import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DateNavigator from './DateNavigator'

describe('DateNavigator', () => {
  const mockOnDateChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('日付が表示される', () => {
    const testDate = new Date('2024-01-15')
    render(<DateNavigator date={testDate} onDateChange={mockOnDateChange} />)

    expect(screen.getByText(/2024\/1\/15/)).toBeInTheDocument()
  })

  it('前日ボタンをクリックすると、前日の日付でonDateChangeが呼ばれる', async () => {
    const user = userEvent.setup()
    const testDate = new Date('2024-01-15')
    render(<DateNavigator date={testDate} onDateChange={mockOnDateChange} />)

    const prevButton = screen.getByRole('button', { name: '前日' })
    await user.click(prevButton)

    expect(mockOnDateChange).toHaveBeenCalledTimes(1)
    const calledDate = mockOnDateChange.mock.calls[0][0] as Date
    expect(calledDate.getFullYear()).toBe(2024)
    expect(calledDate.getMonth()).toBe(0)
    expect(calledDate.getDate()).toBe(14)
  })

  it('翌日ボタンをクリックすると、翌日の日付でonDateChangeが呼ばれる', async () => {
    const user = userEvent.setup()
    const testDate = new Date('2024-01-15')
    render(<DateNavigator date={testDate} onDateChange={mockOnDateChange} />)

    const nextButton = screen.getByRole('button', { name: '翌日' })
    await user.click(nextButton)

    expect(mockOnDateChange).toHaveBeenCalledTimes(1)
    const calledDate = mockOnDateChange.mock.calls[0][0] as Date
    expect(calledDate.getFullYear()).toBe(2024)
    expect(calledDate.getMonth()).toBe(0)
    expect(calledDate.getDate()).toBe(16)
  })

  it('日付部分をクリックすると、DatePickerダイアログが開く', async () => {
    const user = userEvent.setup()
    const testDate = new Date('2024-01-15')
    render(<DateNavigator date={testDate} onDateChange={mockOnDateChange} />)

    const dateButton = screen.getByText(/2024\/1\/15/)
    await user.click(dateButton)

    expect(screen.getByText('日付を選択')).toBeInTheDocument()
  })
})
