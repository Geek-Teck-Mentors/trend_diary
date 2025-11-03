import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import DateFilter from './DateFilter'

describe('DateFilter', () => {
  const mockOnDateChange = vi.fn()
  const testDate = new Date('2024-01-15')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本表示', () => {
    it('日付が表示される', () => {
      render(<DateFilter date={testDate} onDateChange={mockOnDateChange} />)

      expect(screen.getByText(/2024年1月15日/)).toBeInTheDocument()
    })

    it('左矢印ボタンが表示される', () => {
      render(<DateFilter date={testDate} onDateChange={mockOnDateChange} />)

      const prevButton = screen.getByRole('button', { name: '前の日' })
      expect(prevButton).toBeInTheDocument()
    })

    it('右矢印ボタンが表示される', () => {
      render(<DateFilter date={testDate} onDateChange={mockOnDateChange} />)

      const nextButton = screen.getByRole('button', { name: '次の日' })
      expect(nextButton).toBeInTheDocument()
    })

    it('非表示の日付入力フィールドが存在する', () => {
      render(<DateFilter date={testDate} onDateChange={mockOnDateChange} />)

      const dateInput = screen.getByLabelText('日付を選択')
      expect(dateInput).toBeInTheDocument()
      expect(dateInput).toHaveAttribute('type', 'date')
    })
  })

  describe('左矢印ボタンの動作', () => {
    it('左矢印ボタンをクリックすると、前の日の日付でonDateChangeが呼ばれる', async () => {
      const user = userEvent.setup()
      render(<DateFilter date={testDate} onDateChange={mockOnDateChange} />)

      const prevButton = screen.getByRole('button', { name: '前の日' })
      await user.click(prevButton)

      expect(mockOnDateChange).toHaveBeenCalledTimes(1)
      const calledDate = mockOnDateChange.mock.calls[0][0]
      expect(calledDate.getFullYear()).toBe(2024)
      expect(calledDate.getMonth()).toBe(0)
      expect(calledDate.getDate()).toBe(14)
    })
  })

  describe('右矢印ボタンの動作', () => {
    it('右矢印ボタンをクリックすると、次の日の日付でonDateChangeが呼ばれる', async () => {
      const user = userEvent.setup()
      render(<DateFilter date={testDate} onDateChange={mockOnDateChange} />)

      const nextButton = screen.getByRole('button', { name: '次の日' })
      await user.click(nextButton)

      expect(mockOnDateChange).toHaveBeenCalledTimes(1)
      const calledDate = mockOnDateChange.mock.calls[0][0]
      expect(calledDate.getFullYear()).toBe(2024)
      expect(calledDate.getMonth()).toBe(0)
      expect(calledDate.getDate()).toBe(16)
    })
  })

  describe('日付入力フィールドの動作', () => {
    it('日付入力フィールドで日付を変更すると、onDateChangeが呼ばれる', async () => {
      const user = userEvent.setup()
      render(<DateFilter date={testDate} onDateChange={mockOnDateChange} />)

      const dateInput = screen.getByLabelText('日付を選択')
      await user.type(dateInput, '2024-06-20')

      expect(mockOnDateChange).toHaveBeenCalled()
    })
  })

  describe('エッジケース', () => {
    it('月の境界で前の日に移動できる', async () => {
      const user = userEvent.setup()
      const monthBoundaryDate = new Date('2024-02-01')
      render(<DateFilter date={monthBoundaryDate} onDateChange={mockOnDateChange} />)

      const prevButton = screen.getByRole('button', { name: '前の日' })
      await user.click(prevButton)

      const calledDate = mockOnDateChange.mock.calls[0][0]
      expect(calledDate.getFullYear()).toBe(2024)
      expect(calledDate.getMonth()).toBe(0) // 1月
      expect(calledDate.getDate()).toBe(31)
    })

    it('月の境界で次の日に移動できる', async () => {
      const user = userEvent.setup()
      const monthBoundaryDate = new Date('2024-01-31')
      render(<DateFilter date={monthBoundaryDate} onDateChange={mockOnDateChange} />)

      const nextButton = screen.getByRole('button', { name: '次の日' })
      await user.click(nextButton)

      const calledDate = mockOnDateChange.mock.calls[0][0]
      expect(calledDate.getFullYear()).toBe(2024)
      expect(calledDate.getMonth()).toBe(1) // 2月
      expect(calledDate.getDate()).toBe(1)
    })

    it('年の境界で前の日に移動できる', async () => {
      const user = userEvent.setup()
      const yearBoundaryDate = new Date('2024-01-01')
      render(<DateFilter date={yearBoundaryDate} onDateChange={mockOnDateChange} />)

      const prevButton = screen.getByRole('button', { name: '前の日' })
      await user.click(prevButton)

      const calledDate = mockOnDateChange.mock.calls[0][0]
      expect(calledDate.getFullYear()).toBe(2023)
      expect(calledDate.getMonth()).toBe(11) // 12月
      expect(calledDate.getDate()).toBe(31)
    })

    it('年の境界で次の日に移動できる', async () => {
      const user = userEvent.setup()
      const yearBoundaryDate = new Date('2024-12-31')
      render(<DateFilter date={yearBoundaryDate} onDateChange={mockOnDateChange} />)

      const nextButton = screen.getByRole('button', { name: '次の日' })
      await user.click(nextButton)

      const calledDate = mockOnDateChange.mock.calls[0][0]
      expect(calledDate.getFullYear()).toBe(2025)
      expect(calledDate.getMonth()).toBe(0) // 1月
      expect(calledDate.getDate()).toBe(1)
    })
  })
})
