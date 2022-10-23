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
        let { x } = await get_text_xy(page);
        let { w } = await get_char_wh(page);

        // click 2 characters into 1st row of text
        page.mouse.click(x + w * characters, 10);

        //cursor should be within a couple of pixels of calculated position
        let cursor = await page.locator("i").nth(0);
        let { x: cursor_x } = await cursor.boundingBox();
        //console.log(x, width, characters, cursor_x);
        expect(x && w && x + w * characters - cursor_x < 2).toBeTruthy();
    }
});

test("clicking left of a row puts cursor before first character", async ({ page }) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test1");
    async function this_test(page, url) {
        await page.goto(url);
        let { x, y } = await get_text_xy(page);
        let { h } = await get_char_wh(page);

        // click left of second row of text
        page.mouse.click(x - 10, y + h);

        //cursor should be within a couple of pixels of calculated position
        let cursor = await page.locator("i").nth(0);
        let { x: cursor_x, y: cursor_y } = await cursor.boundingBox();
        //console.log(x, y, width, height, cursor_x, cursor_y);
        expect(x - cursor_x < 2).toBeTruthy();
        expect(y + h - cursor_y < 2).toBeTruthy();

        //await page.pause();
    }
});

test("cursor blink animation restarts after each action", async ({ page }) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test1");
    async function this_test(page, url) {
        await page.goto(url);
        let cursor = await page.locator("i").nth(0);

        //after arrowdown, cursor should have "flashy moved" class, then just "flashy" class
        await page.keyboard.press("ArrowDown");
        await expect(cursor).toHaveClass("flashy moved");
        await expect(cursor).toHaveClass("flashy");
    }
});

test("clicking right of last character on a row, puts cursor after last character", async ({ page }) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test1");
    async function this_test(page, url) {
        await page.goto(url);
        let { x, y } = await get_text_xy(page);
        let { w, h } = await get_char_wh(page);
        let row2 = await page.locator("#text div").nth(1);
        let chars_in_row2 = await get_row_char_count(row2);

        // click right of second row of text
        page.mouse.click(x + 100, y + h);

        //cursor should be within a couple of pixels of calculated position
        let cursor = await page.locator("i").nth(0);
        let { x: cursor_x, y: cursor_y } = await cursor.boundingBox();
        //console.log(x, chars, width, cursor_x);
        expect(x + chars_in_row2 * w - cursor_x < 2).toBeTruthy();
        expect(y + h - cursor_y < 2).toBeTruthy();

        //await page.pause();
    }
});

test("click and drag to the right and release on a single line, selects some characters", async ({ page }) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test1");
    async function this_test(page, url) {
        await page.goto(url);
        let { x, y } = await get_text_xy(page);
        let { w, h } = await get_char_wh(page);
        let row2 = await page.locator("#text div").nth(1);
        let chars_in_row2 = await get_row_char_count(row2);

        // mousedown left of second row of text, drag to right of end of text and mouseup
        await page.mouse.move(x - 10, y + h + 10);
        await page.mouse.down();
        await page.mouse.move(chars_in_row2 * w + x + 10, y + h + 10);
        await page.mouse.up();

        //selection should be 0 to num chars
        await page.locator(`#text div >> nth=1 data-start="0" data-end="${"" + chars_in_row2}"`);

        //await page.pause();
    }
});

test("click and drag to the left and release on a single line, selects some characters", async ({ page }) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test1");
    async function this_test(page, url) {
        await page.goto(url);
        let { x, y } = await get_text_xy(page);
        let { w, h } = await get_char_wh(page);
        let row2 = await page.locator("#text div").nth(1);
        let chars_in_row2 = await get_row_char_count(row2);

        // mousedown right of end of text, drag to left of second row of text, and mouseup
        await page.mouse.move(chars_in_row2 * w + x + 10, y + h + 10);
        await page.mouse.down();
        await page.mouse.move(x - 10, y + h + 10);
        await page.mouse.up();

        //selection should be 0 to num chars
        await page.locator(`#text div >> nth=1 data-start="0" data-end="${"" + chars_in_row2}"`);

        //await page.pause();
    }
});

test("click and drag to the right and down and release on multiple lines, selects to the end of first line, all of intermediate lines, and to the end selection of last lines", async ({
    page,
}) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test1");
    async function this_test(page, url) {
        await page.goto(url);
        let { x, y } = await get_text_xy(page);
        let { w, h } = await get_char_wh(page);
        let row1 = await page.locator("#text div").nth(0);
        let row2 = await page.locator("#text div").nth(1);
        let row3 = await page.locator("#text div").nth(2);
        let chars_in_row1 = await get_row_char_count(row1);
        let chars_in_row2 = await get_row_char_count(row2);
        let chars_in_row3 = await get_row_char_count(row3);

        // mousedown left of first row of text, drag to middle of third row of text and mouseup
        await page.mouse.move(x - 10, y + 10);
        await page.mouse.down();
        await page.mouse.move(2 * w + x, y + h * 2 + 10);
        await page.mouse.up();

        //selection should be 0 to num chars in all rows
        await page.locator(`#text div >> nth=0 data-start="0" data-end="${"" + chars_in_row1}"`);
        await page.locator(`#text div >> nth=1 data-start="0" data-end="${"" + chars_in_row2}"`);
        await page.locator(`#text div >> nth=2 data-start="0" data-end="${"" + chars_in_row3}"`);

        //await page.pause();
    }
});

test("click and drag to the left and up and release on multiple lines, selects from the end selection to the end of first line, all of intermediate lines, and to the start selection of last line", async ({
    page,
}) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test1");
    async function this_test(page, url) {
        await page.goto(url);
        let { x, y } = await get_text_xy(page);
        let { w, h } = await get_char_wh(page);
        let row1 = await page.locator("#text div").nth(0);
        let row2 = await page.locator("#text div").nth(1);
        let row3 = await page.locator("#text div").nth(2);
        let chars_in_row1 = await get_row_char_count(row1);
        let chars_in_row2 = await get_row_char_count(row2);
        let chars_in_row3 = await get_row_char_count(row3);

        // mousedown to middle of third row of text, drag to left of first row of text, and mouseup
        await page.mouse.move(2 * w + x, y + h * 2 + 10);
        await page.mouse.down();
        await page.mouse.move(x - 10, y + 10);
        await page.mouse.up();

        //selection should be 0 to num chars in all rows
        await page.locator(`#text div >> nth=0 data-start="0" data-end="${"" + chars_in_row1}"`);
        await page.locator(`#text div >> nth=1 data-start="0" data-end="${"" + chars_in_row2}"`);
        await page.locator(`#text div >> nth=2 data-start="0" data-end="${"" + chars_in_row3}"`);

        //await page.pause();
    }
});

test("holding shift after a selection allows the end point of the selection to be changed forwards or backwards, releasing finishes the selection", async ({
    page,
}) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test2");
    async function this_test(page, url) {
        await page.goto(url);
        let { x, y } = await get_text_xy(page);
        let { w, h } = await get_char_wh(page);
        let row1 = await page.locator("#text div").nth(0);

        // mousedown left of second row of text, drag to right and mouseup = selection should be 0 to 2
        await page.mouse.move(x - 10, y + 10);
        await page.mouse.down();
        await page.mouse.move(2 * w + x, y + 10);
        await page.mouse.up();
        await page.locator('#text div >> nth=0 data-start="0" data-end="2"');

        // Hold down shift, and click mouse 2 chars to the right, release shift = selection should be 0 to 4
        await page.keyboard.down("Shift");
        await page.waitForTimeout(500); //flaky, any other way to do it?
        await page.mouse.click(4 * w + x, y + 10);
        await page.locator('#text div >> nth=0 data-start="0" data-end="4"');

        // Hold down shift, and click mouse 1 char to the left, release shift = selection should be 0 to 3
        await page.keyboard.down("Shift");
        await page.waitForTimeout(500); //flaky, any other way to do it?
        await page.mouse.click(3 * w + x, y + 10);
        await page.locator('#text div >> nth=0 data-start="0" data-end="3"');

        //await page.pause();
    }
});

test("clicking and dragging a selection to the top, right or bottom of the scrolling window, will scroll it - albeit too fast", async ({
    page,
}) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test3");
    async function this_test(page, url) {
        // assumes playwright standard viewport size 1280x720, and default font Consolas, size: 20px, line-height: 1.2rem

        await page.goto(url);
        let { x, y } = await get_text_xy(page);
        let { w, h } = await get_char_wh(page);
        //let row1 = await page.locator("#text div").nth(0);

        // mousedown left of first row of text, drag down to bottom of viewport
        await page.mouse.move(x - 10, y + 10);
        await page.mouse.down();
        await page.mouse.move(x + w, 680);

        // the last row of text should be selected, although it wasn't originally onscreen
        await page.locator('#text div >> nth=55 data-start="0" data-end="1"');

        // text panel should not be scrolled right, but should be scrolled offscreen at top
        let { x: x1, y: y1 } = await get_text_xy(page);
        expect(x1 > 0).toBeTruthy();
        expect(y1 < 0).toBeTruthy();
        //console.log(x1, y1);

        // drag to bottom right of viewport
        await page.mouse.move(1260, 680);

        // text panel should be scrolled offscreen at left, and still scrolled offscreen at top
        let { x: x2, y: y2 } = await get_text_xy(page);
        expect(x2 < 0).toBeTruthy();
        expect(y2 < 0).toBeTruthy();
        //console.log(x2, y2);

        // drag to top right of viewport
        await page.mouse.move(1260, 5);
        await page.waitForTimeout(500); //flaky, any other way to do it?

        // text panel should be scrolled offscreen at left, but no longer scrolled offscreen at top
        let { x: x3, y: y3 } = await get_text_xy(page);
        expect(x3 < 0).toBeTruthy();
        expect(y3 > -100).toBeTruthy();
        //console.log(x3, y3);

        //await page.pause();
    }
});

test("double-clicking a word (between two non-space characters) will select that word", async ({ page }) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test2");
    async function this_test(page, url) {
        await page.goto(url);
        let { x, y } = await get_text_xy(page);
        let { w, h } = await get_char_wh(page);
        let row1 = await page.locator("#text div").nth(0);

        // mousedown in middle of first word of first row of text = selection should be 0 to 10
        await page.mouse.dblclick(x + w, y + 10);
        await page.locator('#text div >> nth=0 data-start="0" data-end="10"');

        //await page.pause();
    }
});

// helpers
async function get_text_xy(page) {
    // get leftmost and topmost position of #text wrapper
    let text = await page.locator("#text");
    let { x, y } = await text.boundingBox();
    return { x, y };
}

async function get_char_wh(page) {
    // get width and height of 1 character
    let row3 = await page.locator("#text div").nth(2);
    let { width, height } = await row3.boundingBox();
    return { w: width, h: height };
}

async function get_row_char_count(row) {
    let row_text = await row.textContent();
    return row_text.length;
}
