import { expect, type Locator, type Page } from '@playwright/test'
import { TIMEOUT } from '@/test/e2e/pom/constants'

type MediaOption = 'all' | 'qiita' | 'zenn' | 'hatena'

export class MobileFilterPanel {
  private readonly trigger: Locator
  private readonly allOption: Locator
  private readonly qiitaOption: Locator
  private readonly zennOption: Locator
  private readonly hatenaOption: Locator
  private readonly applyButton: Locator
  private readonly clearButton: Locator

  constructor(private readonly page: Page) {
    this.trigger = page.getByRole('button', { name: '絞り込み' })
    this.allOption = page.locator("[data-slot='media-filter-all']")
    this.qiitaOption = page.locator("[data-slot='media-filter-qiita']")
    this.zennOption = page.locator("[data-slot='media-filter-zenn']")
    this.hatenaOption = page.locator("[data-slot='media-filter-hatena']")
    this.applyButton = page.locator("[data-slot='mobile-filter-apply']")
    this.clearButton = page.locator("[data-slot='mobile-filter-clear']")
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
    const option = this.option(media)
    await option.waitFor({ state: 'visible', timeout: TIMEOUT })
    await option.click()
  }

  async apply(): Promise<void> {
    await this.applyButton.click()
  }

  async clear(): Promise<void> {
    await this.clearButton.click()
  }

  private option(media: MediaOption): Locator {
    if (media === 'all') return this.allOption
    if (media === 'qiita') return this.qiitaOption
    if (media === 'zenn') return this.zennOption
    return this.hatenaOption
  }
}
