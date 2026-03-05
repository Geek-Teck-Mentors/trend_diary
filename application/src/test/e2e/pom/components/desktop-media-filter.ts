import { expect, type Locator, type Page } from '@playwright/test'
import { TIMEOUT } from '@/test/e2e/pom/constants'

type MediaOption = 'all' | 'qiita' | 'zenn'

export class DesktopMediaFilter {
  private readonly allOption: Locator
  private readonly qiitaOption: Locator
  private readonly zennOption: Locator

  constructor(private readonly page: Page) {
    this.allOption = page.locator("[data-slot='media-filter-all']")
    this.qiitaOption = page.locator("[data-slot='media-filter-qiita']")
    this.zennOption = page.locator("[data-slot='media-filter-zenn']")
  }

  async expectVisible(): Promise<void> {
    await this.allOption.waitFor({ state: 'visible', timeout: TIMEOUT })
    await expect(this.qiitaOption).toBeVisible()
    await expect(this.zennOption).toBeVisible()
  }

  async select(media: MediaOption): Promise<void> {
    await this.option(media).click()
  }

  private option(media: MediaOption): Locator {
    if (media === 'all') return this.allOption
    if (media === 'qiita') return this.qiitaOption
    return this.zennOption
  }
}
