// @ts-check
import { test, expect } from "@playwright/test";

test("clicking or arrowing to a row highlights it. The highlight should be full width regardless of length of row text", async ({
    page,
}) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test1", "abc");
    await this_test(page, "http://127.0.0.1:1420?testname=test2", "abcd");
    async function this_test(page, url, expected_text_2nd_row) {
        await page.goto(url);
        await expect(page).toHaveTitle("editaur");
        let row1 = page.locator("#text div").nth(0);
        let row2 = page.locator("#text div").nth(1);
        let text = page.locator("#text");

        //check data
        await expect(row2).toHaveText(expected_text_2nd_row);

        //check widths of long rows are the same as mains width
        let boxtext = await text.boundingBox();
        let box1 = await row1.boundingBox();
        let box2 = await row2.boundingBox();
        await expect(boxtext && box1 && boxtext.width === box1.width).toBeTruthy();

        //both rows are unhighlighted
        await expect(row1).toHaveClass("");
        await expect(row2).toHaveClass("");

        //click first row highlights it only
        row1.click();
        await expect(row1).toHaveClass("highlighted");
        await expect(row2).toHaveClass("");

        //arrowdown highlights second row only
        await page.keyboard.press("ArrowDown");
        await expect(row1).toHaveClass("");
        await expect(row2).toHaveClass("highlighted");
    }
});
