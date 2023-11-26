import {expect, test} from '@playwright/test'
import { HomePage } from '~/playwright/models/pages/homepage'


test.beforeEach(async ({page}) => {
  await page.goto('/')
  let homePage = new HomePage(page)
  await expect(homePage.searchToolbar).toBeVisible()
})

test('Toggle left side pane', async ({page}) => {
  let homePage = new HomePage(page)
  await homePage.clickToggleLeftPane()
})