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
        expect(boxtext && box1 && boxtext.width === box1.width).toBeTruthy();

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

test("clicking somewhere puts the cursor between two characters", async ({ page }) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test1", 2);
    await this_test(page, "http://127.0.0.1:1420?testname=test2", 10);
    async function this_test(page, url, characters) {
        await page.goto(url);

        // get leftmost position of #text wrapper
        let text = await page.locator("#text");
        let { x } = await text.boundingBox();

        // get width of 1 character
        let row3 = await page.locator("#text div").nth(2);
        let { width } = await row3.boundingBox();

        // click 2 characters into 1st row of text
        page.mouse.click(x + width * characters, 10);

        //cursor should be within a couple of pixels of calculated position
        let cursor = await page.locator("i").nth(0);
        let { x: cursor_x } = await cursor.boundingBox();
        //console.log(x, width, characters, cursor_x);
        expect(x && width && x + width * characters - cursor_x < 2).toBeTruthy();
    }
});

test("clicking left of a row puts cursor before first character", async ({ page }) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test1");
    async function this_test(page, url) {
        await page.goto(url);

        // get leftmost and topmost position of #text wrapper
        let text = await page.locator("#text");
        let { x, y } = await text.boundingBox();

        // get width and height of 1 character
        let row3 = await page.locator("#text div").nth(2);
        let { width, height } = await row3.boundingBox();

        // click left of second row of text
        page.mouse.click(x - 10, y + height);

        //cursor should be within a couple of pixels of calculated position
        let cursor = await page.locator("i").nth(0);
        let { x: cursor_x, y: cursor_y } = await cursor.boundingBox();
        //console.log(x, y, width, height, cursor_x, cursor_y);
        expect(x - cursor_x < 2).toBeTruthy();
        expect(y + height - cursor_y < 2).toBeTruthy();
        //await page.pause();
    }
});

test("cursor blink animation restarts after each action", async ({ page }) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test1");
    async function this_test(page, url) {
        await page.goto(url);

        //after arrowdown, cursor should have no class, then flashy class
        let cursor = await page.locator("i").nth(0);
        await page.keyboard.press("ArrowDown");
        await expect(cursor).toHaveClass("");
        await expect(cursor).toHaveClass("flashy");
    }
});
