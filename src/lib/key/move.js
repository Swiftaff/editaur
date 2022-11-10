function arrow_down(cursor) {
    let { r, c, previous_c } = cursor;
    let is_not_last_row = r < cursor.text.rows.length - 1;
    if (is_not_last_row) {
        r = r + 1;
        let len = cursor.text.rows[r].textContent.length;
        c = move_caret_to_eol_if_shorter_than_previous(c, previous_c, len);
        c = move_caret_back_to_previous_if_line_is_long_enough(r, c, previous_c, len);
    } else {
        let len = cursor.text.rows[r].textContent.length;
        const ret = move_caret_to_end_and_reset_previous_if_moving_down_from_within_bottom_line(r, c, previous_c, len);
        c = ret.c;
        previous_c = ret.previous_c;
    }

    if (cursor.pressing_shift) {
        cursor.update(r, c, previous_c, false);
        cursor.selection.end = { r, c };
        cursor.text_selection_update();
    } else {
        cursor.update(r, c, previous_c);
        cursor.selection_stop();
        cursor.text.selection_reset();
    }
    cursor.highlight_row();
}

function arrow_up(cursor) {
    let { r, c, previous_c } = cursor;
    if (r > 0) {
        r = r - 1;
        let len = cursor.text.rows[r].textContent.length;
        c = move_caret_to_eol_if_shorter_than_previous(c, previous_c, len);
        c = move_caret_back_to_previous_if_line_is_long_enough(r, c, previous_c, len);
    } else {
        const ret = move_caret_to_start_and_reset_previous_if_moving_up_from_within_top_line(r, c, previous_c);
        c = ret.c;
        previous_c = ret.previous_c;
    }

    if (cursor.pressing_shift) {
        cursor.update(r, c, previous_c, false);
        cursor.selection.end = { r, c };
        cursor.text_selection_update();
    } else {
        cursor.update(r, c, previous_c);
        cursor.selection_stop();
        cursor.text.selection_reset();
    }
    cursor.highlight_row();
}

function arrow_left(cursor) {
    let { r, c, previous_c } = cursor;
    let is_not_first_char = c > 0;
    let is_not_first_row = r > 0;
    if (is_not_first_char) {
        c = c - 1;
        previous_c = c;
    } else if (is_not_first_row) {
        r = r - 1;
        c = cursor.text.rows[r].textContent.length;
        previous_c = 0;
    }

    if (cursor.pressing_shift) {
        cursor.update(r, c, previous_c, false);
        cursor.selection.end = { r, c };
        cursor.text_selection_update();
    } else {
        cursor.update(r, c, previous_c);
        cursor.selection_stop();
        cursor.text.selection_reset();
    }
}

function arrow_right(cursor) {
    let { r, c, previous_c } = cursor;
    let is_not_last_row = r < cursor.text.rows.length - 1;
    if (c < cursor.text.rows[r].textContent.length) {
        c = c + 1;
        previous_c = c;
    } else if (is_not_last_row) {
        r = r + 1;
        c = 0;
        previous_c = 0;
    }

    if (cursor.pressing_shift) {
        cursor.update(r, c, previous_c, false);
        cursor.selection.end = { r, c };
        cursor.text_selection_update();
    } else {
        cursor.update(r, c, previous_c);
        cursor.selection_stop();
        cursor.text.selection_reset();
    }
}

function move_caret_to_eol_if_shorter_than_previous(c, previous_c, len) {
    if (c > len) {
        c = len;
    } else if (previous_c > len) {
        c = previous_c;
        if (c > len) {
            c = len;
        }
    }
    return c;
}

function move_caret_back_to_previous_if_line_is_long_enough(r, c, previous_c, len) {
    if (c < previous_c && previous_c <= len) c = previous_c;
    return c;
}

function move_caret_to_end_and_reset_previous_if_moving_down_from_within_bottom_line(r, c, previous_c, len) {
    if (c < len) {
        c = len;
        previous_c = len;
    }
    return { c, previous_c };
}

function move_caret_to_start_and_reset_previous_if_moving_up_from_within_top_line(r, c, previous_c) {
    if (c > 0) {
        c = 0;
        previous_c = 0;
    }
    return { c, previous_c };
}

export default { arrow_down, arrow_up, arrow_left, arrow_right };
