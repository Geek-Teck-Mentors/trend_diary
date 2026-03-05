import { expect, type Locator, type Page } from '@playwright/test'
import { TIMEOUT } from '@/test/e2e/pom/constants'

type MediaOption = 'all' | 'qiita' | 'zenn'

export class MobileFilterPanel {
  private readonly trigger: Locator
  private readonly mediaTrigger: Locator
  private readonly allOption: Locator
  private readonly qiitaOption: Locator
  private readonly zennOption: Locator
  private readonly applyButton: Locator

  constructor(private readonly page: Page) {
    this.trigger = page.getByRole('button', { name: '絞り込み' })
    this.mediaTrigger = page.getByRole('button', { name: 'メディアフィルター' })
    this.allOption = page.getByRole('menuitem', { name: 'すべて' })
    this.qiitaOption = page.getByRole('menuitem', { name: 'Qiita' })
    this.zennOption = page.getByRole('menuitem', { name: 'Zenn' })
    this.applyButton = page.getByRole('button', { name: '適用' })
  }

  async expectTriggerLabel(label: string): Promise<void> {
    await this.trigger.waitFor({ state: 'visible', timeout: TIMEOUT })
    await expect(this.trigger).toContainText(label)
  }

  async openPanel(): Promise<void> {
    await this.trigger.waitFor({ state: 'visible', timeout: TIMEOUT })
    await this.trigger.click()
    await this.applyButton.waitFor({ state: 'visible', timeout: TIMEOUT })
  }

  async select(media: MediaOption): Promise<void> {
    await this.applyButton.waitFor({ state: 'visible', timeout: TIMEOUT })
    await this.mediaTrigger.waitFor({ state: 'visible', timeout: TIMEOUT })
    await this.mediaTrigger.click()

    const option = this.option(media)
    await option.waitFor({ state: 'visible', timeout: TIMEOUT })
    await option.click()
  }

  async apply(): Promise<void> {
    await this.applyButton.click()
  }

  private option(media: MediaOption): Locator {
    if (media === 'all') return this.allOption
    if (media === 'qiita') return this.qiitaOption
    return this.zennOption
  }
}
