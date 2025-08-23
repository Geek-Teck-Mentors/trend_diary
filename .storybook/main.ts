import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    // NOTE: addon-vitestは一時的に無効化（直接vitestコマンドでテスト実行する）
    // {
    //   name: '@storybook/addon-vitest',
    //   options: {
    //     configFile: '.storybook/vitest.config.ts',
    //   },
    // },
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: 'vitest/config.storybook.ts',
      },
    },
  },
}
export default config
