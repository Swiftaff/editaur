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
        page.waitForTimeout(500);
        await expect(row1).toHaveClass("highlighted");
        await expect(row2).toHaveClass("");

        //arrowdown highlights second row only
        await page.keyboard.press("ArrowDown");
        page.waitForTimeout(500);
        await expect(row1).toHaveClass("");
        await expect(row2).toHaveClass("highlighted");

        //await page.pause();
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

        // doubleclick in middle of first word of first row of text = selection should be 0 to 10
        await page.mouse.dblclick(x + w, y + 10);
        await page.locator('#text div >> nth=0 data-start="0" data-end="10"');

        //await page.pause();
    }
});

test("triple-clicking anywhere on a line will select the whole line", async ({ page }) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test2");
    async function this_test(page, url) {
        await page.goto(url);
        let { x, y } = await get_text_xy(page);
        let { w, h } = await get_char_wh(page);
        let row1 = await page.locator("#text div").nth(0);

        // tripleclick in middle of first word of first row of text = selection should be whole line
        await page.mouse.dblclick(x + w, y + 10);
        await page.mouse.click(x + w, y + 10);
        await page.locator('#text div >> nth=0 data-start="0" data-end="219"');

        //await page.pause();
    }
});

test("use arrow keys to move up, down, left, right", async ({ page }) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test1");
    async function this_test(page, url) {
        await page.goto(url);
        let { x, y } = await get_text_xy(page);
        let { w, h } = await get_char_wh(page);
        let cursor = await page.locator("i").nth(0);

        //starts in top left position
        let cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x && cursor_box.y === y).toBeTruthy();

        //move down 1 row
        await page.keyboard.press("ArrowDown");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 && cursor_box.y === y + h).toBeTruthy(); // x = 109 not 110?

        //move right 1 char
        await page.keyboard.press("ArrowRight");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w && cursor_box.y === y + h).toBeTruthy();

        //move up 1 row
        await page.keyboard.press("ArrowUp");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w && cursor_box.y === y).toBeTruthy();

        //move left 1 char
        await page.keyboard.press("ArrowLeft");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 && cursor_box.y === y).toBeTruthy();

        //await page.pause();
    }
});

test("left arrow at start of a row, moves cursor to end of previous row, except first row", async ({ page }) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test1");
    async function this_test(page, url) {
        await page.goto(url);
        let { x, y } = await get_text_xy(page);
        let { w, h } = await get_char_wh(page);
        let cursor = await page.locator("i").nth(0);

        //move down 1 row
        await page.keyboard.press("ArrowDown");
        let cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 && cursor_box.y === y + h).toBeTruthy(); // x = 109 not 110?

        //move left 1 char, is at end of first row
        await page.keyboard.press("ArrowLeft");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w * 3 && cursor_box.y === y).toBeTruthy();

        //move left 3 times, is at start of first row
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("ArrowLeft");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 && cursor_box.y === y).toBeTruthy();

        //move left again, is still at start of row
        await page.keyboard.press("ArrowLeft");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 && cursor_box.y === y).toBeTruthy();

        //await page.pause();
    }
});

test("right arrow at end of a row, moves cursor to start of next row, except last row", async ({ page }) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test1");
    async function this_test(page, url) {
        await page.goto(url);
        let { x, y } = await get_text_xy(page);
        let { w, h } = await get_char_wh(page);
        let cursor = await page.locator("i").nth(0);

        //move down 1 row
        await page.keyboard.press("ArrowDown");
        let cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 && cursor_box.y === y + h).toBeTruthy(); // x = 109 not 110?

        //move right 3 chars, is at end of first row
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w * 3 && cursor_box.y === y + h).toBeTruthy();

        //move right 1 times, is at start of third row
        await page.keyboard.press("ArrowRight");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 && cursor_box.y === y + h * 2).toBeTruthy();

        //move right 1 time, is at end of third row
        await page.keyboard.press("ArrowRight");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w && cursor_box.y === y + h * 2).toBeTruthy();

        //move right 1 time again, is still at end of third row
        await page.keyboard.press("ArrowRight");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w && cursor_box.y === y + h * 2).toBeTruthy();

        //await page.pause();
    }
});

test("using up and down arrow keys will remember the current column starting point across lines of differing lengths", async ({
    page,
}) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test4");
    async function this_test(page, url) {
        await page.goto(url);
        let { x, y } = await get_text_xy(page);
        let { w, h } = await get_char_wh(page);
        let cursor = await page.locator("i").nth(0);

        //move right 3 chars, is at 3rd char of first row
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        let cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w * 3 && cursor_box.y === y).toBeTruthy();

        //move down 1 row, is at end of second 2 char row
        await page.keyboard.press("ArrowDown");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w * 2 && cursor_box.y === y + h).toBeTruthy();

        //move down 1 row, is at end of third 1 char row
        await page.keyboard.press("ArrowDown");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w && cursor_box.y === y + h * 2).toBeTruthy();

        //move down 1 row, is at 3rd char of last 4 char row - not the end, but same as starting point 3rd char
        await page.keyboard.press("ArrowDown");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w * 3 && cursor_box.y === y + h * 3).toBeTruthy();

        //move right 3 chars, and left 1 char, is at 5th char of last row
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowLeft");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w * 5 && cursor_box.y === y + h * 3).toBeTruthy();

        // go back up after resetting the previous column position (previous_c)

        //move up 1 row, is at end of third 1 char row
        await page.keyboard.press("ArrowUp");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w && cursor_box.y === y + h * 2).toBeTruthy();

        //move up 1 row, is at end of second 2 char row
        await page.keyboard.press("ArrowUp");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w * 2 && cursor_box.y === y + h).toBeTruthy();

        //move up 1 row, is back to 5th char of first row
        await page.keyboard.press("ArrowUp");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w * 5 && cursor_box.y === y).toBeTruthy();

        //await page.pause();
    }
});

test("using left and right arrow or other cursor moving functions (e.g. paste) will reset this column starting point for future up down moves", async ({
    page,
}) => {
    //same as above test - replacing the ArrowRight/Left reset with two kepresses inserting "XY"

    await this_test(page, "http://127.0.0.1:1420?testname=test4");
    async function this_test(page, url) {
        await page.goto(url);
        let { x, y } = await get_text_xy(page);
        let { w, h } = await get_char_wh(page);
        let cursor = await page.locator("i").nth(0);

        //move right 3 chars, is at 3rd char of first row
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        let cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w * 3 && cursor_box.y === y).toBeTruthy();

        //move down 1 row, is at end of second 2 char row
        await page.keyboard.press("ArrowDown");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w * 2 && cursor_box.y === y + h).toBeTruthy();

        //move down 1 row, is at end of third 1 char row
        await page.keyboard.press("ArrowDown");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w && cursor_box.y === y + h * 2).toBeTruthy();

        //move down 1 row, is at 3rd char of last 4 char row - not the end, but same as starting point 3rd char
        await page.keyboard.press("ArrowDown");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w * 3 && cursor_box.y === y + h * 3).toBeTruthy();

        //type 2 chars, is at 5th char of last row
        await page.keyboard.press("X");
        await page.keyboard.press("Y");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w * 5 && cursor_box.y === y + h * 3).toBeTruthy();

        // go back up after resetting the previous column position (previous_c)

        //move up 1 row, is at end of third 1 char row
        await page.keyboard.press("ArrowUp");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w && cursor_box.y === y + h * 2).toBeTruthy();

        //move up 1 row, is at end of second 2 char row
        await page.keyboard.press("ArrowUp");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w * 2 && cursor_box.y === y + h).toBeTruthy();

        //move up 1 row, is back to 5th char of first row
        await page.keyboard.press("ArrowUp");
        cursor_box = await cursor.boundingBox();
        expect(cursor_box.x === x - 1 + w * 5 && cursor_box.y === y).toBeTruthy();

        //await page.pause();
    }
});

test("copy selected text, including mulitline to the clipboard, paste clipboard, including multiline, starting at the current cursor (not yet replacing selection)", async ({
    page,
}) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test1");
    async function this_test(page, url) {
        await page.goto(url);

        let { x, y } = await get_text_xy(page);
        let { w, h } = await get_char_wh(page);
        let row2 = page.locator("#text div").nth(1);
        let row2_text = await row2.textContent();
        expect(row2_text === "abc").toBeTruthy();

        //copy 3 chars from first row
        await page.keyboard.down("Shift");
        await page.waitForTimeout(500);
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.up("Shift");
        await page.waitForTimeout(500);
        await page.keyboard.down("Control");
        await page.keyboard.press("C");

        //paste into end of second row
        await page.keyboard.press("ArrowDown");
        await page.waitForTimeout(500);
        await page.keyboard.press("V");
        await page.keyboard.up("Control");

        row2_text = await row2.textContent();
        expect(row2_text === "abc123").toBeTruthy();

        //move cursor back to start
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("ArrowLeft");

        //copy first 3 chars of 2 lines, plus line break of first line
        await page.keyboard.down("Shift");
        await page.waitForTimeout(500);
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.up("Shift");
        await page.waitForTimeout(500);
        await page.keyboard.down("Control");
        await page.keyboard.press("C");

        //paste into end of third row
        await page.keyboard.press("ArrowDown");
        await page.waitForTimeout(500);
        await page.keyboard.press("V");
        await page.keyboard.up("Control");

        let row3 = page.locator("#text div").nth(2);
        let row4 = page.locator("#text div").nth(3);
        let row3_text = await row3.textContent();
        let row4_text = await row4.textContent();
        expect(row3_text === "x123").toBeTruthy();
        expect(row4_text === "abc").toBeTruthy();

        //await page.pause();
    }
});

test("tabbing while a multiline select is active, will insert [4] spaces at the start of all selected rows - and shift the selection to match original", async ({
    page,
}) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test1");
    async function this_test(page, url) {
        await page.goto(url);
        let row1 = page.locator("#text div").nth(0);
        let row2 = page.locator("#text div").nth(1);
        let row3 = page.locator("#text div").nth(2);

        expect((await row1.textContent()) === "123").toBeTruthy();
        expect((await row2.textContent()) === "abc").toBeTruthy();
        expect((await row3.textContent()) === "x").toBeTruthy();

        // select 1st 2 full rows, tab in
        await page.keyboard.down("Shift");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.up("Shift");
        await page.keyboard.press("Tab");
        await page.waitForTimeout(500);

        expect((await row1.textContent()) === "    123").toBeTruthy();
        expect((await row2.textContent()) === "    abc").toBeTruthy();
        expect((await row3.textContent()) === "x").toBeTruthy();

        // select last 2 rows, tab in
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.down("Shift");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.up("Shift");
        await page.keyboard.press("Tab");
        await page.waitForTimeout(500);

        expect((await row1.textContent()) === "    123").toBeTruthy();
        expect((await row2.textContent()) === "        abc").toBeTruthy();
        expect((await row3.textContent()) === "    x").toBeTruthy();

        // select all 3 rows, tab in
        await page.keyboard.press("ArrowUp");
        await page.keyboard.down("Shift");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.up("Shift");
        await page.keyboard.press("Tab");
        await page.waitForTimeout(500);

        expect((await row1.textContent()) === "        123").toBeTruthy();
        expect((await row2.textContent()) === "            abc").toBeTruthy();
        expect((await row3.textContent()) === "        x").toBeTruthy();

        //await page.pause();
    }
});

test("tabbing while a single line select is active, will replace that selection with [4] spaces", async ({ page }) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test1");
    async function this_test(page, url) {
        await page.goto(url);
        let row1 = page.locator("#text div").nth(0);
        let row2 = page.locator("#text div").nth(1);
        let row3 = page.locator("#text div").nth(2);

        expect((await row1.textContent()) === "123").toBeTruthy();
        expect((await row2.textContent()) === "abc").toBeTruthy();
        expect((await row3.textContent()) === "x").toBeTruthy();

        // select 1st 2 chars of 1st row, tab in
        await page.keyboard.down("Shift");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.up("Shift");
        await page.keyboard.press("Tab");
        await page.waitForTimeout(500);

        expect((await row1.textContent()) === "    3").toBeTruthy();
        expect((await row2.textContent()) === "abc").toBeTruthy();
        expect((await row3.textContent()) === "x").toBeTruthy();

        // select 2nd char of 2nd row, tab in
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.down("Shift");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.up("Shift");
        await page.keyboard.press("Tab");
        await page.waitForTimeout(500);

        expect((await row1.textContent()) === "    3").toBeTruthy();
        expect((await row2.textContent()) === "a    c").toBeTruthy();
        expect((await row3.textContent()) === "x").toBeTruthy();

        //await page.pause();
    }
});

test("using delete on a selection will delete it all, and leave cursor at leftmost point", async ({ page }) => {
    await this_test(page, "http://127.0.0.1:1420?testname=test1");
    async function this_test(page, url) {
        await page.goto(url);
        let row1 = page.locator("#text div").nth(0);
        let row2 = page.locator("#text div").nth(1);
        let row3 = page.locator("#text div").nth(2);

        expect((await row1.textContent()) === "123").toBeTruthy();
        expect((await row2.textContent()) === "abc").toBeTruthy();
        expect((await row3.textContent()) === "x").toBeTruthy();

        // select 1st 2 chars of 1st row, Delete
        await page.keyboard.down("Shift");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.up("Shift");
        await page.keyboard.press("Delete");
        await page.waitForTimeout(500);

        expect((await row1.textContent()) === "3").toBeTruthy();
        expect((await row2.textContent()) === "abc").toBeTruthy();
        expect((await row3.textContent()) === "x").toBeTruthy();

        // select 2nd char of 2nd row, Delete
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.down("Shift");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.up("Shift");
        await page.keyboard.press("Delete");
        await page.waitForTimeout(500);

        expect((await row1.textContent()) === "3").toBeTruthy();
        expect((await row2.textContent()) === "ac").toBeTruthy();
        expect((await row3.textContent()) === "x").toBeTruthy();

        //select 1st and 2nd row, Delete
        await page.keyboard.press("ArrowUp");
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.down("Shift");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.up("Shift");
        await page.keyboard.press("Delete");
        await page.waitForTimeout(500);

        row1 = page.locator("#text div").nth(0);
        row2 = page.locator("#text div").nth(1);

        expect((await row1.textContent()) === "").toBeTruthy();
        expect((await row2.textContent()) === "x").toBeTruthy();

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
