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
    } else {
        //mid-line
        let first_half = row_text.substring(0, c);
        let second_half = row_text.substring(c, row_text.length);
        text.update_text(text.rows[r], first_half);
        let new_row = text.get_new_row(second_half, cursor);
        text_div.insertBefore(new_row, text.rows[r + 1]);
        text.rows.splice(r + 1, 0, new_row);
        cursor.update(r + 1, 0, 0);
    }
    //scroll_down();
}

function insert(chars, cursor, text) {
    //console.log("insert", char);
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

export default { backspace, del, enter, insert, shift_key_down, shift_key_up, control_key_down, control_key_up };
