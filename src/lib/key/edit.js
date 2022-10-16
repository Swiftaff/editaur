function backspace(cursor, text) {
    let { r, c } = cursor;
    let at_start_of_line = c === 0;
    let at_end_of_line = c === text.rows[r].el.textContent.length;
    let row_text = text.rows[r].el.textContent;
    if (at_start_of_line) {
        if (r > 0) {
            let r2 = r - 1;
            let c2 = text.rows[r2].el.textContent.length;
            let text1 = text.rows[r - 1].el.textContent;
            text.rows[r - 1].el.textContent = text1.concat(row_text);
            text.rows[r].el.remove();
            text.rows.splice(r, 1);
            cursor.update(r2, c2, c2);
        }
    } else if (at_end_of_line) {
        text.rows[r].el.textContent = row_text.slice(0, c - 1);
        cursor.update(r, c - 1, c - 1);
    } else {
        //mid-line
        text.rows[r].el.textContent = row_text.slice(0, c - 1).concat(row_text.slice(c));
        cursor.update(r, c - 1, c - 1);
    }
    //scroll_up();
    //scroll_down();
}

export default { backspace };
