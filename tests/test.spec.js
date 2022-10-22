// @ts-check
import { test, expect } from "@playwright/test";

test("clicking or arrowing to a row highlights it. The highlight should be full width regardless of length of row text", async ({
    page,
}) => {
    await page.goto("http://127.0.0.1:1420?testname=test1");

    await expect(page).toHaveTitle("editaur");
    let first_row = page.locator("#text div").nth(0);
    let second_row = page.locator("#text div").nth(1);

    //check data
    await expect(first_row).toHaveText("123");
    await expect(second_row).toHaveText("abc");

    //both rows are unhighlighted
    await expect(first_row).toHaveClass("");
    await expect(second_row).toHaveClass("");

    //click first row highlights it only
    first_row.click();
    await expect(first_row).toHaveClass("highlighted");
    await expect(second_row).toHaveClass("");

    //arrowdown highlights second row only
    await page.keyboard.press("ArrowDown");
    await expect(first_row).toHaveClass("");
    await expect(second_row).toHaveClass("highlighted");
});
