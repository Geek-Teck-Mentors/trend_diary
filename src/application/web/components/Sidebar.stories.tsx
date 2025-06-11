import type { Meta, StoryObj } from '@storybook/react-vite';
import AppSidebar from './Sidebar';
import { SidebarProvider } from './ui/sidebar';

// メタデータの設定
const meta = {
  title: 'Components/AppSidebar',
  component: AppSidebar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof AppSidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

const handleLogout = () => console.log('ログアウトしました');

// デフォルトのストーリー
export const DEFAULT: Story = {
  args: {
    displayName: 'ユーザー1',
    handleLogout,
  },
};

// 長い名前のユーザーストーリー
export const LONG_NAME: Story = {
  args: {
    displayName: 'とっても長いユーザー名のユーザーさん',
    handleLogout,
  },
};

// 英語名のユーザーストーリー
export const ENGLISH_NAME: Story = {
  args: {
    displayName: 'John Doe',
    handleLogout,
  },
};
