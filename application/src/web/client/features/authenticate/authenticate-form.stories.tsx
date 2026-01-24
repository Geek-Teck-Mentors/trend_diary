import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { AuthenticateForm } from './authenticate-form'

const meta: Meta<typeof AuthenticateForm> = {
  component: AuthenticateForm,
}
export default meta

type Story = StoryObj<typeof AuthenticateForm>

const defaultArgs = {
  loadingSubmitButtonText: 'ログイン中...',
  submitButtonText: 'ログイン',
  async handleSubmit() {
    await new Promise((resolve) => {
      setTimeout(resolve, 300)
    })
  },
}

export const EmptyForm: Story = {
  args: defaultArgs,
  play: async ({ canvas }) => {
    // 初期状態の確認
    await expect(canvas.getByLabelText('メールアドレス')).toBeInTheDocument()
    await expect(canvas.getByLabelText('パスワード')).toBeInTheDocument()
    await expect(canvas.getByRole('button')).toBeInTheDocument()

    // フィールドが空であることを確認
    await expect(canvas.getByLabelText('メールアドレス')).toHaveValue('')
    await expect(canvas.getByLabelText('パスワード')).toHaveValue('')

    // Submitボタンのテキストが正しいことを確認
    await expect(canvas.getByRole('button')).toHaveTextContent('ログイン')

    // エラーメッセージが表示されていないことを確認
    await expect(canvas.queryByText('有効なメールアドレスを入力してください')).not.toBeInTheDocument()
    await expect(
      canvas.queryByText('パスワードは8文字以上必要です'),
    ).not.toBeInTheDocument()

    // aria-invalid属性が設定されていないことを確認
    await expect(canvas.getByLabelText('メールアドレス')).not.toHaveAttribute('aria-invalid')
    await expect(canvas.getByLabelText('パスワード')).not.toHaveAttribute('aria-invalid')

    // ボタンが有効であることを確認
    await expect(canvas.getByRole('button')).not.toBeDisabled()
  },
}

export const FilledForm: Story = {
  args: defaultArgs,
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('メールアドレス'), 'email@provider.com')

    await userEvent.type(canvas.getByLabelText('パスワード'), 'Password1!')

    await userEvent.click(canvas.getByRole('button'))

    await waitFor(() => {
      expect(canvas.getByRole('button')).toHaveTextContent('ログイン中...')
    })
  },
}

export const FormValidationError: Story = {
  args: defaultArgs,
  play: async ({ canvas, userEvent }) => {
    // 有効なメールアドレスを入力
    await userEvent.type(canvas.getByLabelText('メールアドレス'), 'user@example.com')

    // 短すぎるパスワードを入力（7文字）
    await userEvent.type(canvas.getByLabelText('パスワード'), '1234567')

    // Submitしてバリデーションエラーを発生させる
    await userEvent.click(canvas.getByRole('button'))

    // バリデーションエラーメッセージが表示されることを確認
    await expect(
      canvas.getByText('パスワードは8文字以上必要です'),
    ).toBeInTheDocument()

    // aria-invalid属性が正しく設定されることを確認
    await expect(canvas.getByLabelText('パスワード')).toHaveAttribute('aria-invalid', 'true')

    // Submitボタンがローディング状態にならないことを確認（バリデーションエラーのため）
    await expect(canvas.getByRole('button')).toHaveTextContent('ログイン')
  },
}
