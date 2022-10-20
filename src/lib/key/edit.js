function backspace(cursor, text) {
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

function del(cursor, text) {
    let { r, c } = cursor;
    let at_start_of_line = c === 0;
    let row_text = text.rows[r].textContent;
    let at_end_of_line = c === row_text.length;
    let at_last_row = r === text.rows.length;
    let current_line_has_no_text = row_text.length === 0;
    if (at_start_of_line) {
        if (current_line_has_no_text) {
            text.rows[r].remove();
            text.rows.splice(r, 1);
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

function enter(cursor, text) {
    let { r, c } = cursor;
    let at_start_of_line = c === 0;
    let row_text = text.rows[r].textContent;
    let at_end_of_line = c === row_text.length;
    let text_div = document.getElementById("text");

    if (at_start_of_line) {
        let new_row = text.get_new_row("", cursor);
        text_div.insertBefore(new_row, text.rows[r]);
        text.rows.splice(r, 0, new_row);
        cursor.update(r + 1, c, c);
    } else if (at_end_of_line) {
        let new_row = text.get_new_row("", cursor);
        text_div.insertBefore(new_row, text.rows[r + 1]);
        text.rows.splice(r + 1, 0, new_row);
        cursor.update(r + 1, 0, 0);
        text.highlight_row(cursor);
    } else {
        //mid-line
        let first_half = row_text.substring(0, c);
        let second_half = row_text.substring(c, row_text.length);
        text.update_text(text.rows[r], first_half);
        let new_row = text.get_new_row(second_half, cursor);
        text_div.insertBefore(new_row, text.rows[r + 1]);
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
    }
}

function shift_key_down(cursor) {
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
    let clip = await navigator.clipboard.readText();
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
        await navigator.clipboard.writeText(cut_text);
    } else if (single_line_selection) {
        let start = cursor.selection.start.c < cursor.selection.end.c ? cursor.selection.start : cursor.selection.end;
        let end = cursor.selection.start.c < cursor.selection.end.c ? cursor.selection.end : cursor.selection.start;
        let cut_text = text.rows[start.r].textContent.slice(start.c, end.c);
        await navigator.clipboard.writeText(cut_text);
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
        await navigator.clipboard.writeText(cut_text);
    }
}

function tab_in(cursor, text) {
    let no_selection =
        cursor.selection.start.r === cursor.selection.end.r && cursor.selection.start.c === cursor.selection.end.c;
    let single_line_selection = cursor.selection.start.r === cursor.selection.end.r;
    if (no_selection) {
        insert(" ".repeat(text.tab_spaces), cursor, text);
    } else if (single_line_selection) {
        //replace selection
        let start = cursor.selection.start.c < cursor.selection.end.c ? cursor.selection.start : cursor.selection.end;
        let end = cursor.selection.start.c < cursor.selection.end.c ? cursor.selection.end : cursor.selection.start;
        let left = text.rows[start.r].textContent.slice(0, start.c);
        let right = text.rows[start.r].textContent.slice(end.c);
        text.update_text(text.rows[start.r], left + " ".repeat(text.tab_spaces) + right);
        text.selection_reset();
        cursor.selection_reset();
        cursor.update(start.r, start.c + 4, start.c + 4);
        //text.selection_update(cursor);
    } else {
        //multi-line
        let start = cursor.selection.start.r < cursor.selection.end.r ? cursor.selection.start : cursor.selection.end;
        let end = cursor.selection.start.r < cursor.selection.end.r ? cursor.selection.end : cursor.selection.start;
        for (let index = start.r; index <= end.r; index++) {
            text.rows[index].textContent = " ".repeat(text.tab_spaces) + text.rows[index].textContent;
        }
        cursor.selection.start.c = start.c + text.tab_spaces;
        cursor.selection.end.c = end.c + text.tab_spaces;
        cursor.update(end.r, end.c, end.c);
        //text.selection_update(cursor);
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
    paste,
    tab_in,
};
