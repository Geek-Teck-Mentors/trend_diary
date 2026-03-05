import { expect, type Locator, type Page } from '@playwright/test'
import { TIMEOUT } from '@/test/e2e/pom/constants'

type MediaOption = 'all' | 'qiita' | 'zenn'

export class DesktopMediaFilter {
  private readonly trigger: Locator
  private readonly allOption: Locator
  private readonly qiitaOption: Locator
  private readonly zennOption: Locator

  constructor(private readonly page: Page) {
    this.trigger = page.getByRole('button', { name: 'メディアフィルター' })
    this.allOption = page.getByRole('menuitem', { name: 'すべて' })
    this.qiitaOption = page.getByRole('menuitem', { name: 'Qiita' })
    this.zennOption = page.getByRole('menuitem', { name: 'Zenn' })
  }

  async expectTriggerLabel(label: string): Promise<void> {
    await this.trigger.waitFor({ state: 'visible', timeout: TIMEOUT })
    await expect(this.trigger).toContainText(label)
  }

  async select(media: MediaOption): Promise<void> {
    const option = this.option(media)

    await expect(async () => {
      await this.trigger.click()
      await expect(option).toBeVisible({ timeout: 1000 })
    }).toPass({ timeout: TIMEOUT })
    await option.click()
  }

  private option(media: MediaOption): Locator {
    if (media === 'all') return this.allOption
    if (media === 'qiita') return this.qiitaOption
    return this.zennOption
  }
}
