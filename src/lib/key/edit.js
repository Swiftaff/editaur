const clipboard = {
    // allow for testing in a plain browser window where there is no ability to readText
    // this just adds a global window variable to read and write to instead of standard clipboard
    readText: async () => {
        let clip = "";
        if (navigator.clipboard.readText) {
            clip = await navigator.clipboard.readText();
        } else if (window["__EDITAUR__"] && "clipboard" in window["__EDITAUR__"]) {
            clip = window["__EDITAUR__"].clipboard;
        }
        return clip;
    },
    writeText: async (clip) => {
        if (typeof clip === "string") {
            if (navigator.clipboard.readText) {
                await navigator.clipboard.writeText(clip);
            } else {
                if (!window["__EDITAUR__"] || !window["__EDITAUR__"].clipboard) {
                    window["__EDITAUR__"] = { clipboard: "" };
                }
                window["__EDITAUR__"].clipboard = clip;
            }
        }
    },
};

function backspace(cursor, text) {
    if (cursor.selection.is_in_progress()) {
        del(cursor, text);
    } else {
        let { r, c } = cursor;
        let at_start_of_line = c === 0;
        let at_end_of_line = c === text.rows[r].textContent.length;
        let row_text = text.rows[r].textContent;
        if (at_start_of_line) {
            if (r > 0) {
                let r2 = r - 1;
                let c2 = text.rows[r2].textContent.length;
                let text1 = text.rows[r - 1].textContent;
                text.update_text(text.rows[r - 1], text1.concat(row_text));
                text.rows[r].remove();
                text.rows.splice(r, 1);
                cursor.update(r2, c2, c2);
                text.highlight_row(cursor);
            }
        } else if (at_end_of_line) {
            text.update_text(text.rows[r], row_text.slice(0, c - 1));
            cursor.update(r, c - 1, c - 1);
        } else {
            //mid-line
            text.update_text(text.rows[r], row_text.slice(0, c - 1).concat(row_text.slice(c)));
            cursor.update(r, c - 1, c - 1);
        }
        //scroll_up();
        //scroll_down();
    }
}

function del(cursor, text) {
    if (cursor.selection.is_in_progress()) {
        let start = cursor.selection.start;
        let end = cursor.selection.end;
        if (start.r === end.r) {
            if (start.c > end.c) {
                start = cursor.selection.end;
                end = cursor.selection.start;
            }
            let new_text =
                text.rows[start.r].textContent.slice(0, start.c) + text.rows[start.r].textContent.slice(end.c);
            text.update_text(text.rows[start.r], new_text);
            cursor.update(start.r, start.c, start.c);
            cursor.selection_reset_to_cursor();
            text.selection_update(cursor);
        } else {
            if (start.r > end.r) {
                start = cursor.selection.end;
                end = cursor.selection.start;
            }
            //delete from bottom up so index always refers to an existing row
            for (let index = end.r; index >= start.r; index--) {
                if (index === start.r) {
                    let new_text =
                        text.rows[start.r].textContent.slice(0, start.c) +
                        (text.rows[index + 1] ? text.rows[index + 1].textContent.slice(end.c) : "");
                    text.update_text(text.rows[start.r], new_text);
                    cursor.update(start.r, start.c, start.c);
                    cursor.selection_reset_to_cursor();
                    text.selection_update(cursor);
                } else {
                    // end or middle rows
                    text.rows[index].remove();
                    text.rows.splice(index, 1);
                }
            }
        }
        text.highlight_row(cursor);
    } else {
        let { r, c } = cursor;
        let at_start_of_line = c === 0;
        let row_text = text.rows[r].textContent;
        let at_end_of_line = c === row_text.length;
        let at_last_row = r === text.rows.length - 1;
        let current_line_has_no_text = row_text.length === 0;
        if (at_start_of_line) {
            if (current_line_has_no_text) {
                if (!at_last_row) {
                    text.rows[r].remove();
                    text.rows.splice(r, 1);
                }
            } else {
                text.update_text(text.rows[r], row_text.slice(c + 1));
            }
        } else if (at_end_of_line) {
            if (!at_last_row) {
                text.update_text(text.rows[r], row_text.concat(text.rows[r + 1].textContent));
                text.rows[r + 1].remove();
                text.rows.splice(r + 1, 1);
            }
        } else {
            //mid-line
            text.update_text(text.rows[r], row_text.slice(0, c).concat(row_text.slice(c + 1)));
        }
        //scroll_up();
        //scroll_down();
    }
}

function enter(cursor, text) {
    let { r, c } = cursor;
    let at_start_of_line = c === 0;
    let row_text = text.rows[r].textContent;
    let at_end_of_line = c === row_text.length;

    if (at_start_of_line) {
        let new_row = text.get_new_row("", cursor);
        text.el.insertBefore(new_row, text.rows[r]);
        text.rows.splice(r, 0, new_row);
        cursor.update(r + 1, c, c);
    } else if (at_end_of_line) {
        let new_row = text.get_new_row("", cursor);
        text.el.insertBefore(new_row, text.rows[r + 1]);
        text.rows.splice(r + 1, 0, new_row);
        cursor.update(r + 1, 0, 0);
        text.highlight_row(cursor);
    } else {
        //mid-line
        let first_half = row_text.substring(0, c);
        let second_half = row_text.substring(c, row_text.length);
        text.update_text(text.rows[r], first_half);
        let new_row = text.get_new_row(second_half, cursor);
        text.el.insertBefore(new_row, text.rows[r + 1]);
        text.rows.splice(r + 1, 0, new_row);
        cursor.update(r + 1, 0, 0);
        text.highlight_row(cursor);
    }
    //scroll_down();
}

function insert(chars, cursor, text) {
    //if (!pressing_control && char.length == 1) {
    if (chars.length > 0) {
        let { r, c } = cursor;
        let row_text = text.rows[r].textContent;
        text.update_text(text.rows[r], row_text.slice(0, c).concat(chars, row_text.slice(c)));
        //scroll_up();
        //scroll_down();
        cursor.update(r, c + chars.length, c + chars.length);
        //cursor.selection_reset_to_cursor();
    }
}

function select_all(cursor, text) {
    console.log("ctrl-a");
    let r = text.rows.length - 1;
    let c = text.rows[r].textContent.length;
    cursor.selection.start = { r: 0, c: 0 };
    cursor.selection.end = { r: r, c };
    cursor.active = true;
    cursor.update(r, c, c, false);
    text.selection_update(cursor);
    console.log(cursor);
}

function shift_key_down(cursor) {
    console.log("shift");
    if (!cursor.pressing_shift) cursor.pressing_shift = true;
}

function shift_key_up(cursor) {
    if (cursor.pressing_shift) cursor.pressing_shift = false;
}

function control_key_down(cursor) {
    if (!cursor.pressing_control) cursor.pressing_control = true;
}

function control_key_up(cursor) {
    if (cursor.pressing_control) cursor.pressing_control = false;
}

async function paste(cursor, text) {
    let clip = await clipboard.readText();
    let split = clip.split("\r\n");
    if (split.length > 1) {
        split.forEach((new_row, i) => {
            insert(new_row, cursor, text);
            if (i < split.length - 1) {
                enter(cursor, text);
            }
        });
    } else {
        insert(clip, cursor, text);
    }
}

async function copy(cursor, text) {
    let no_selection =
        cursor.selection.start.r === cursor.selection.end.r && cursor.selection.start.c === cursor.selection.end.c;
    let single_line_selection = cursor.selection.start.r === cursor.selection.end.r;
    if (no_selection) {
        let cut_text = text.rows[cursor.selection.start.r].textContent;
        //await writeText(cut_text);
        await clipboard.writeText(cut_text);
    } else if (single_line_selection) {
        let start = cursor.selection.start.c < cursor.selection.end.c ? cursor.selection.start : cursor.selection.end;
        let end = cursor.selection.start.c < cursor.selection.end.c ? cursor.selection.end : cursor.selection.start;
        let cut_text = text.rows[start.r].textContent.slice(start.c, end.c);
        //await writeText(cut_text);
        await clipboard.writeText(cut_text);
    } else {
        //multi-line
        let start = cursor.selection.start.r < cursor.selection.end.r ? cursor.selection.start : cursor.selection.end;
        let end = cursor.selection.start.r < cursor.selection.end.r ? cursor.selection.end : cursor.selection.start;
        let cut_text = "";

        for (let index = start.r; index <= end.r; index++) {
            if (index === end.r) {
                cut_text += text.rows[index].textContent.slice(0, end.c);
            } else if (index === start.r) {
                cut_text += text.rows[index].textContent.slice(start.c, text.rows[index].textContent.length) + "\r\n";
            } else {
                cut_text += text.rows[index].textContent + "\r\n";
            }
        }
        //await writeText(cut_text);
        await clipboard.writeText(cut_text);
    }
}

async function cut(cursor, text) {
    await copy(cursor, text);
    await del(cursor, text);
}

function tab_in(cursor, text) {
    let single_line_selection = cursor.selection.start.r === cursor.selection.end.r;
    let { start, end } = cursor.selection.normalised_start_end();
    if (single_line_selection) {
        //replace selection
        let left = text.rows[start.r].textContent.slice(0, start.c);
        let right = text.rows[start.r].textContent.slice(end.c);
        text.update_text(text.rows[start.r], left + " ".repeat(text.tab_spaces) + right);
        text.selection_reset();
        cursor.update(start.r, start.c + 4, start.c + 4);
        text.selection_update(cursor);
    } else {
        //multi-line
        for (let index = start.r; index <= end.r; index++) {
            text.update_text(text.rows[index], " ".repeat(text.tab_spaces) + text.rows[index].textContent);
        }
        cursor.selection.start = { r: cursor.selection.start.r, c: cursor.selection.start.c + text.tab_spaces };
        cursor.selection.end = { r: cursor.selection.end.r, c: cursor.selection.end.c + text.tab_spaces };
        text.selection_update(cursor);
        cursor.update(cursor.selection.end.r, cursor.selection.end.c, cursor.selection.end.c, false);
    }
}

function tab_out(cursor, text) {
    let no_selection =
        cursor.selection.start.r === cursor.selection.end.r && cursor.selection.start.c === cursor.selection.end.c;
    let single_line_selection = cursor.selection.start.r === cursor.selection.end.r;
    let first_char = cursor.c === 0;
    if (first_char) {
        //noop
    } else if (no_selection || single_line_selection) {
        let current_text = text.rows[cursor.selection.start.r].textContent;
        let outdented = 0;
        for (let index = 0; index < text.tab_spaces; index++) {
            if (current_text.length && current_text[0] === " ") {
                outdented++;
                current_text = current_text.slice(1);
            }
        }
        console.log("tab_out", outdented, JSON.stringify(cursor.selection));
        text.update_text(text.rows[cursor.selection.start.r], current_text);
        cursor.update(
            cursor.selection.start.r,
            cursor.selection.start.c - outdented,
            cursor.selection.start.c - outdented
        );
        //cursor.selection_reset_to_cursor();
        console.log("tab_out", outdented, JSON.stringify(cursor.selection));
    } else {
        //multi-line
        /*let start = cursor.selection.start.r < cursor.selection.end.r ? cursor.selection.start : cursor.selection.end;
        let end = cursor.selection.start.r < cursor.selection.end.r ? cursor.selection.end : cursor.selection.start;
        for (let index = start.r; index <= end.r; index++) {
            text.update_text(text.rows[index], " ".repeat(text.tab_spaces) + text.rows[index].textContent);
        }
        cursor.selection.start.c = start.c + text.tab_spaces;
        cursor.selection.end.c = end.c + text.tab_spaces;
        cursor.update(end.r, end.c, end.c);
        text.selection_update(cursor);*/
    }
}

export default {
    backspace,
    del,
    enter,
    insert,
    shift_key_down,
    shift_key_up,
    control_key_down,
    control_key_up,
    copy,
    cut,
    paste,
    select_all,
    tab_in,
    tab_out,
};
