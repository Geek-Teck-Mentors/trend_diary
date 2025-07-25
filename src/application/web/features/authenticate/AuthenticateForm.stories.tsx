import type { Meta, StoryObj } from '@storybook/react-vite'
import { AuthenticateForm } from './AuthenticateForm'

const meta: Meta<typeof AuthenticateForm> = {
  component: AuthenticateForm,
}
export default meta

type Story = StoryObj<typeof AuthenticateForm>

export const EmptyForm: Story = {
  args: {
    loadingSubmitButtonText: 'ログイン中...',
    submitButtonText: 'ログイン',
    handleSubmit() {
      setTimeout(() => {
        // 0.3s待機（ダミー処理）
      }, 300)
    },
  },
}
