function arrow_down(cursor, text) {
    let { r, c, previous_c } = cursor;
    //scroll_down();

    if (r < text.rows.length - 1) {
        r = r + 1;
        let len = text.rows[r].el.textContent.length;
        const ret = move_caret_to_eol_if_shorter_than_previous(r, c, previous_c, len);
        c = ret.c;
        previous_c = ret.previous_c;
        c = move_caret_back_to_previous_if_line_is_long_enough(r, c, previous_c, len);
    } else {
        let len = text.rows[r].el.textContent.length;
        const ret = move_caret_to_end_and_reset_previous_if_moving_down_from_within_bottom_line(r, c, previous_c, len);
        c = ret.c;
        previous_c = ret.previous_c;
    }
    cursor.update(r, c, previous_c);
    if (cursor.pressing_shift) {
        cursor.selection.end = { r, c };
        text.selection_update(cursor);
    } else {
        cursor.selection_stop();
        text.selection_reset();
    }
}

function arrow_up(cursor, text) {
    let { r, c, previous_c } = cursor;
    //scroll_up();
    if (r > 0) {
        r = r - 1;
        let len = text.rows[r].el.textContent.length;
        const ret = move_caret_to_eol_if_shorter_than_previous(r, c, previous_c, len);
        c = ret.c;
        previous_c = ret.previous_c;
        c = move_caret_back_to_previous_if_line_is_long_enough(r, c, previous_c, len);
    } else {
        const ret = move_caret_to_start_and_reset_previous_if_moving_up_from_within_top_line(r, c, previous_c);
        c = ret.c;
        previous_c = ret.previous_c;
    }
    cursor.update(r, c, previous_c);
    if (cursor.pressing_shift) {
        cursor.selection.end = { r, c };
        text.selection_update(cursor);
    } else {
        cursor.selection_stop();
        text.selection_reset();
    }
}

function arrow_left(cursor, text) {
    let { r, c, previous_c } = cursor;
    if (c > 0) {
        c = c - 1;
        previous_c = 0;
    } else if (r > 0) {
        r = r - 1;
        c = text.rows[r].el.textContent.length;
        previous_c = 0;
    }
    cursor.update(r, c, previous_c);
    if (cursor.pressing_shift) {
        cursor.selection.end = { r, c };
        text.selection_update(cursor);
    } else {
        cursor.selection_stop();
        text.selection_reset();
    }
}

function arrow_right(cursor, text) {
    let { r, c, previous_c } = cursor;
    if (c < text.rows[r].el.textContent.length) {
        c = c + 1;
        previous_c = 0;
    } else if (r < text.rows.length - 1) {
        r = r + 1;
        c = 0;
        previous_c = 0;
    }
    cursor.update(r, c, previous_c);
    if (cursor.pressing_shift) {
        cursor.selection.end = { r, c };
        text.selection_update(cursor);
    } else {
        cursor.selection_stop();
        text.selection_reset();
    }
}

function move_caret_to_eol_if_shorter_than_previous(r, c, previous_c, len) {
    if (c > len) {
        previous_c = c;
        c = len;
    }
    return { c, previous_c };
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
