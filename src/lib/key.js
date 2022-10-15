function down(e, cursor, text) {
    e.preventDefault();
    switch (e.key) {
        case "ArrowDown":
            arrow_down(cursor, text);
            break;
        default:
            //insert(e.key);
            break;
    }
}

function arrow_down(cursor, text) {
    console.log("down");
    let { r, c, previous_c } = cursor;
    //scroll_down();

    if (r < text.rows.length - 1) {
        console.log("down2");
        r = r + 1;
        let len = text.rows[r].el.textContent.length;
        const ret = move_caret_to_eol_if_shorter_than_previous(r, c, previous_c, len);
        c = ret.c;
        previous_c = ret.previous_c;
        c = move_caret_back_to_previous_if_line_is_long_enough(r, c, previous_c, len);
    } else {
        console.log("down3");
        let len = text.rows[r].el.textContent.length;
        const ret = move_caret_to_end_and_reset_previous_if_moving_down_from_within_bottom_line(r, c, previous_c, len);
        c = ret.c;
        previous_c = ret.previous_c;
    }
    cursor.update(r, c, previous_c);
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

export default { down };
