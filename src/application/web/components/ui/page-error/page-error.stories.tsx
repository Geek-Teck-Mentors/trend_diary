import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import PageError from './index'

const meta: Meta<typeof PageError> = {
  component: PageError,
  parameters: {
    layout: 'padded',
  },
}
export default meta

type Story = StoryObj<typeof PageError>

export const Default: Story = {
  args: {
    pageError: {
      title: 'エラーが発生しました',
      description: 'システムでエラーが発生しました。しばらく時間をおいてから再度お試しください。',
    },
  },
  play: async ({ canvas }) => {
    // Alert要素が存在することを確認
    const alert = canvas.getByRole('alert')
    await expect(alert).toBeInTheDocument()

    // タイトルが正しく表示されることを確認
    await expect(canvas.getByText('エラーが発生しました')).toBeInTheDocument()

    // 説明文が正しく表示されることを確認
    await expect(
      canvas.getByText(
        'システムでエラーが発生しました。しばらく時間をおいてから再度お試しください。',
      ),
    ).toBeInTheDocument()
  },
}

export const LoginError: Story = {
  args: {
    pageError: {
      title: 'ログインに失敗しました',
      description: 'メールアドレスまたはパスワードが間違っています。',
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toBeInTheDocument()
    await expect(canvas.getByText('ログインに失敗しました')).toBeInTheDocument()
    await expect(
      canvas.getByText('メールアドレスまたはパスワードが間違っています。'),
    ).toBeInTheDocument()
  },
}

export const ValidationError: Story = {
  args: {
    pageError: {
      title: '入力エラー',
      description: '必須項目が入力されていません。すべての項目を正しく入力してください。',
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toBeInTheDocument()
    await expect(canvas.getByText('入力エラー')).toBeInTheDocument()
    await expect(
      canvas.getByText('必須項目が入力されていません。すべての項目を正しく入力してください。'),
    ).toBeInTheDocument()
  },
}

export const ServerError: Story = {
  args: {
    pageError: {
      title: 'サーバーエラー',
      description: 'サーバーで予期しないエラーが発生しました。管理者にお問い合わせください。',
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toBeInTheDocument()
    await expect(canvas.getByText('サーバーエラー')).toBeInTheDocument()
    await expect(
      canvas.getByText('サーバーで予期しないエラーが発生しました。管理者にお問い合わせください。'),
    ).toBeInTheDocument()
  },
}

export const LongMessage: Story = {
  args: {
    pageError: {
      title: '長いエラーメッセージのテスト',
      description:
        'これは非常に長いエラーメッセージのテストです。この説明文は複数行にわたって表示される可能性があります。レイアウトが崩れないかどうかを確認するために、意図的に長いテキストを使用しています。エラーメッセージが長い場合でも、適切に表示されることを確認します。',
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toBeInTheDocument()
    await expect(canvas.getByText('長いエラーメッセージのテスト')).toBeInTheDocument()

    // 長いメッセージの一部を確認（完全一致ではなく部分文字列で確認）
    await expect(canvas.getByText(/これは非常に長いエラーメッセージのテスト/)).toBeInTheDocument()
    await expect(canvas.getByText(/エラーメッセージが長い場合でも、適切に表示/)).toBeInTheDocument()
  },
}
