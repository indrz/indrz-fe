import {Locator,Page, expect} from '@playwright/test'

export class HomePage {
  private page: Page
  searchToolbar: Locator
  private toggleLeftPaneBtn: Locator
  private searchInput: Locator
  private map: Locator

  constructor(page: Page) {
    this.page = page
    this.searchToolbar = this.page.getByTestId('searchToolbar')
    this.toggleLeftPaneBtn = this.page.getByTestId('leftPaneToggleBtn')
    this.searchInput = this.page.getByTestId('searchInput')
    this.map = this.page.getByTestId('map') // move to component as it's probably reused
  }

  async clickToggleLeftPane() {
    await this.toggleLeftPaneBtn.click()
  }

}