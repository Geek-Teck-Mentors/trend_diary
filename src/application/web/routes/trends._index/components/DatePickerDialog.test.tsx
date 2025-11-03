import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DatePickerDialog from './DatePickerDialog'

describe('DatePickerDialog', () => {
  const mockOnClose = vi.fn()
  const mockOnDateSelect = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('isOpen=trueの場合、ダイアログが表示される', () => {
    const testDate = new Date('2024-01-15')
    render(
      <DatePickerDialog
        isOpen={true}
        onClose={mockOnClose}
        selectedDate={testDate}
        onDateSelect={mockOnDateSelect}
      />,
    )

    expect(screen.getByText('日付を選択')).toBeInTheDocument()
    expect(screen.getByText('2024年1月')).toBeInTheDocument()
  })

  it('isOpen=falseの場合、ダイアログが表示されない', () => {
    const testDate = new Date('2024-01-15')
    render(
      <DatePickerDialog
        isOpen={false}
        onClose={mockOnClose}
        selectedDate={testDate}
        onDateSelect={mockOnDateSelect}
      />,
    )

    expect(screen.queryByText('日付を選択')).not.toBeInTheDocument()
  })

  it('前月ボタンをクリックすると、前月のカレンダーが表示される', async () => {
    const user = userEvent.setup()
    const testDate = new Date('2024-01-15')
    render(
      <DatePickerDialog
        isOpen={true}
        onClose={mockOnClose}
        selectedDate={testDate}
        onDateSelect={mockOnDateSelect}
      />,
    )

    expect(screen.getByText('2024年1月')).toBeInTheDocument()

    const prevButton = screen.getByRole('button', { name: '前月' })
    await user.click(prevButton)

    expect(screen.getByText('2023年12月')).toBeInTheDocument()
  })

  it('翌月ボタンをクリックすると、翌月のカレンダーが表示される', async () => {
    const user = userEvent.setup()
    const testDate = new Date('2024-01-15')
    render(
      <DatePickerDialog
        isOpen={true}
        onClose={mockOnClose}
        selectedDate={testDate}
        onDateSelect={mockOnDateSelect}
      />,
    )

    expect(screen.getByText('2024年1月')).toBeInTheDocument()

    const nextButton = screen.getByRole('button', { name: '翌月' })
    await user.click(nextButton)

    expect(screen.getByText('2024年2月')).toBeInTheDocument()
  })

  it('日付をクリックすると、onDateSelectが呼ばれる', async () => {
    const user = userEvent.setup()
    const testDate = new Date('2024-01-15')
    render(
      <DatePickerDialog
        isOpen={true}
        onClose={mockOnClose}
        selectedDate={testDate}
        onDateSelect={mockOnDateSelect}
      />,
    )

    const dayButton = screen.getByRole('button', { name: '20' })
    await user.click(dayButton)

    expect(mockOnDateSelect).toHaveBeenCalledTimes(1)
    const calledDate = mockOnDateSelect.mock.calls[0][0] as Date
    expect(calledDate.getFullYear()).toBe(2024)
    expect(calledDate.getMonth()).toBe(0)
    expect(calledDate.getDate()).toBe(20)
  })

  it('閉じるボタンをクリックすると、onCloseが呼ばれる', async () => {
    const user = userEvent.setup()
    const testDate = new Date('2024-01-15')
    render(
      <DatePickerDialog
        isOpen={true}
        onClose={mockOnClose}
        selectedDate={testDate}
        onDateSelect={mockOnDateSelect}
      />,
    )

    const closeButton = screen.getByRole('button', { name: '閉じる' })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('曜日が日本語で表示される', () => {
    const testDate = new Date('2024-01-15')
    render(
      <DatePickerDialog
        isOpen={true}
        onClose={mockOnClose}
        selectedDate={testDate}
        onDateSelect={mockOnDateSelect}
      />,
    )

    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getByText('月')).toBeInTheDocument()
    expect(screen.getByText('火')).toBeInTheDocument()
    expect(screen.getByText('水')).toBeInTheDocument()
    expect(screen.getByText('木')).toBeInTheDocument()
    expect(screen.getByText('金')).toBeInTheDocument()
    expect(screen.getByText('土')).toBeInTheDocument()
  })
})
