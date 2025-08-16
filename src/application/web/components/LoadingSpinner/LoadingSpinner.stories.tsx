import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import LoadingSpinner from '.'

const meta: Meta<typeof LoadingSpinner> = {
  component: LoadingSpinner,
  parameters: {
    layout: 'fullscreen',
  },
}
export default meta

type Story = StoryObj<typeof LoadingSpinner>

export const Default: Story = {
  play: async ({ canvas }) => {
    // LoadingSpinnerのコンテナ要素をroleで取得
    const container = canvas.getByRole('status', { name: 'Loading...' })
    await expect(container).toBeInTheDocument()

    // 実際のCSSプロパティを確認
    const computedStyle = window.getComputedStyle(container as Element)

    // fixed positionが実際に適用されていることを確認
    await expect(computedStyle.position).toBe('fixed')

    // inset-0 (top, right, bottom, left: 0) が実際に適用されていることを確認
    await expect(computedStyle.top).toBe('0px')
    await expect(computedStyle.right).toBe('0px')
    await expect(computedStyle.bottom).toBe('0px')
    await expect(computedStyle.left).toBe('0px')

    // フレックスボックスのセンタリングが実際に適用されていることを確認
    await expect(computedStyle.display).toBe('flex')
    await expect(computedStyle.alignItems).toBe('center')
    await expect(computedStyle.justifyContent).toBe('center')

    // 背景色（bg-gray-50）が実際に適用されていることを確認
    // Tailwind bg-gray-50 は oklch(0.985 0.002 247.839)
    await expect(computedStyle.backgroundColor).toBe('oklch(0.985 0.002 247.839)')

    // backdrop-blur-smが実際に適用されていることを確認
    await expect(computedStyle.backdropFilter).toBe('blur(8px)')

    // スピナーコンポーネントが存在することを確認
    const spinner = container.querySelector('div > div')
    await expect(spinner).toBeInTheDocument()
  },
}

export const SpinnerValidation: Story = {
  play: async ({ canvas }) => {
    // スピナーの基本スタイルが正しく適用されていることを確認
    const container = canvas.getByRole('status', { name: 'Loading...' })
    const spinner = container.querySelector('div > div')
    await expect(spinner).toBeInTheDocument()

    const spinnerStyle = window.getComputedStyle(spinner as Element)

    // スピナーのサイズが実際に適用されていることを確認 (h-7, w-7 = 28px)
    await expect(spinnerStyle.height).toBe('28px')
    await expect(spinnerStyle.width).toBe('28px')

    // rounded-fullが実際に適用されていることを確認 (border-radius: 50%)
    // 実際の計算値は大きな数値になるため、50%相当であることを確認
    const radiusValue = Number.parseFloat(spinnerStyle.borderRadius)
    await expect(radiusValue).toBeGreaterThan(1000000) // 50%の計算値は非常に大きな数値

    // border-[3px]が実際に適用されていることを確認
    await expect(spinnerStyle.borderWidth).toBe('3px')

    // 実際のborder-styleがsolidであることを確認
    await expect(spinnerStyle.borderStyle).toBe('solid')

    // スピナーのカスタムカラーが実際に適用されていることを確認
    // borderColorは複数の値を含むため、border-secondary値を含むことを確認
    await expect(spinnerStyle.borderColor).toContain('oklch(0.968 0.007 247.896)')

    // border-t-primary: oklch(0.208 0.042 265.755)
    await expect(spinnerStyle.borderTopColor).toBe('oklch(0.208 0.042 265.755)')

    // アニメーションが実際に適用されていることを確認
    await expect(spinnerStyle.animation).toContain('spin')
    await expect(spinnerStyle.animationDuration).toBe('1s')
    await expect(spinnerStyle.animationIterationCount).toBe('infinite')
    await expect(spinnerStyle.animationTimingFunction).toBe('linear')
  },
}

export const OverlayProperties: Story = {
  play: async ({ canvas }) => {
    const container = canvas.getByRole('status', { name: 'Loading...' })
    const computedStyle = window.getComputedStyle(container as Element)

    // オーバーレイが全画面をカバーすることを実際のCSSプロパティで確認
    await expect(computedStyle.position).toBe('fixed')
    await expect(computedStyle.top).toBe('0px')
    await expect(computedStyle.right).toBe('0px')
    await expect(computedStyle.bottom).toBe('0px')
    await expect(computedStyle.left).toBe('0px')

    // backdrop-blur-smが実際に適用されていることを確認
    await expect(computedStyle.backdropFilter).toContain('blur')
    // blur(8px)が具体的に適用されていることを確認
    await expect(computedStyle.backdropFilter).toBe('blur(8px)')

    // 背景色と透明度が実際に適用されていることを確認
    // bg-gray-50 + bg-opacity-75 = oklch(0.985 0.002 247.839)
    await expect(computedStyle.backgroundColor).toBe('oklch(0.985 0.002 247.839)')

    // z-indexがデフォルト値であることを確認
    const zIndex = computedStyle.zIndex
    expect(['auto', '0', '']).toContain(zIndex)

    // オーバーレイの表示が正しくblock要素として機能していることを確認
    await expect(computedStyle.display).toBe('flex') // flex containerとして機能
  },
}

export const CenteringLayout: Story = {
  play: async ({ canvas }) => {
    const container = canvas.getByRole('status', { name: 'Loading...' })
    const computedStyle = window.getComputedStyle(container as Element)

    // フレックスボックスによる中央配置が実際に適用されていることを確認
    await expect(computedStyle.display).toBe('flex')
    await expect(computedStyle.alignItems).toBe('center')
    await expect(computedStyle.justifyContent).toBe('center')

    // コンテナが全画面をカバーしていることを実際のCSSで確認
    await expect(computedStyle.position).toBe('fixed')
    await expect(computedStyle.top).toBe('0px')
    await expect(computedStyle.right).toBe('0px')
    await expect(computedStyle.bottom).toBe('0px')
    await expect(computedStyle.left).toBe('0px')

    // スピナーが中央に配置されていることを確認
    const spinner = container.querySelector('div > div')
    await expect(spinner).toBeInTheDocument()

    // スピナーの実際の位置が中央付近であることを確認
    const containerRect = (container as Element).getBoundingClientRect()
    const spinnerRect = (spinner as Element).getBoundingClientRect()

    // スピナーがコンテナの中央に配置されていることを数値的に確認
    const containerCenterX = containerRect.left + containerRect.width / 2
    const containerCenterY = containerRect.top + containerRect.height / 2
    const spinnerCenterX = spinnerRect.left + spinnerRect.width / 2
    const spinnerCenterY = spinnerRect.top + spinnerRect.height / 2

    // 中央からの誤差を許容範囲内で確認（1px以下の誤差を許可）
    await expect(Math.abs(containerCenterX - spinnerCenterX)).toBeLessThanOrEqual(1)
    await expect(Math.abs(containerCenterY - spinnerCenterY)).toBeLessThanOrEqual(1)
  },
}

export const ResponsiveLayout: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvas }) => {
    const container = canvas.getByRole('status', { name: 'Loading...' })
    const computedStyle = window.getComputedStyle(container as Element)

    // モバイル表示でも要素が正しく表示されることを実際のCSSで確認
    await expect(container).toBeInTheDocument()
    await expect(computedStyle.position).toBe('fixed')
    await expect(computedStyle.top).toBe('0px')
    await expect(computedStyle.right).toBe('0px')
    await expect(computedStyle.bottom).toBe('0px')
    await expect(computedStyle.left).toBe('0px')

    // スピナーがモバイルでも正しく表示されることを実際のサイズで確認
    const spinner = container.querySelector('div > div')
    await expect(spinner).toBeInTheDocument()
    const spinnerStyle = window.getComputedStyle(spinner as Element)
    await expect(spinnerStyle.height).toBe('28px')
    await expect(spinnerStyle.width).toBe('28px')

    // フレックスボックスレイアウトがモバイルでも実際に機能することを確認
    await expect(computedStyle.display).toBe('flex')
    await expect(computedStyle.alignItems).toBe('center')
    await expect(computedStyle.justifyContent).toBe('center')

    // モバイルビューポートでの実際のサイズを確認
    const containerRect = (container as Element).getBoundingClientRect()
    // mobile1は通常320px x 568pxなので、それに近い値であることを確認
    await expect(containerRect.width).toBeGreaterThan(300)
    await expect(containerRect.height).toBeGreaterThan(500)

    // スピナーがモバイルでも中央に配置されていることを確認
    const spinnerRect = (spinner as Element).getBoundingClientRect()
    const containerCenterX = containerRect.left + containerRect.width / 2
    const containerCenterY = containerRect.top + containerRect.height / 2
    const spinnerCenterX = spinnerRect.left + spinnerRect.width / 2
    const spinnerCenterY = spinnerRect.top + spinnerRect.height / 2

    await expect(Math.abs(containerCenterX - spinnerCenterX)).toBeLessThanOrEqual(1)
    await expect(Math.abs(containerCenterY - spinnerCenterY)).toBeLessThanOrEqual(1)
  },
}

export const DarkTheme: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
  play: async ({ canvas }) => {
    const container = canvas.getByRole('status', { name: 'Loading...' })

    // ダークテーマでも基本的なレイアウトが機能することを確認
    await expect(container).toBeInTheDocument()

    const computedStyle = window.getComputedStyle(container as Element)

    // fixed positionとinset-0が実際に適用されていることを確認
    await expect(computedStyle.position).toBe('fixed')
    await expect(computedStyle.top).toBe('0px')
    await expect(computedStyle.right).toBe('0px')
    await expect(computedStyle.bottom).toBe('0px')
    await expect(computedStyle.left).toBe('0px')

    // 背景色と透明度が実際に適用されていることを確認
    // bg-gray-50 + bg-opacity-75 = oklch(0.985 0.002 247.839)
    await expect(computedStyle.backgroundColor).toBe('oklch(0.985 0.002 247.839)')

    // スピナーがダークテーマでも表示されることを確認
    const spinner = container.querySelector('div > div')
    await expect(spinner).toBeInTheDocument()

    const spinnerStyle = window.getComputedStyle(spinner as Element)

    // アニメーションが実際に適用されていることを確認
    await expect(spinnerStyle.animation).toContain('spin')
    await expect(spinnerStyle.animationDuration).toBe('1s')
    await expect(spinnerStyle.animationIterationCount).toBe('infinite')
    await expect(spinnerStyle.animationTimingFunction).toBe('linear')

    // スピナーのカスタムカラーが実際に適用されていることを確認
    // borderColorは複数の値を含むため、border-secondary値を含むことを確認
    await expect(spinnerStyle.borderColor).toContain('oklch(0.968 0.007 247.896)')

    // border-t-primary: oklch(0.208 0.042 265.755)
    await expect(spinnerStyle.borderTopColor).toBe('oklch(0.208 0.042 265.755)')

    // スピナーのサイズとボーダーが実際に適用されていることを確認
    await expect(spinnerStyle.height).toBe('28px')
    await expect(spinnerStyle.width).toBe('28px')
    await expect(spinnerStyle.borderWidth).toBe('3px')
    await expect(spinnerStyle.borderStyle).toBe('solid')
  },
}
