function backspace(cursor, text) {
    console.log("Backspace");
    let { r, c } = cursor;
    //let new_rows = [...text.rows].map((row) => row.el.textContent);
    if (c == 0) {
        console.log("start of line");
        if (r > 0) {
            let r2 = r - 1;
            let c2 = text.rows[r2].el.textContent.length;
            let text1 = text.rows[r - 1].el.textContent;
            let text2 = text.rows[r].el.textContent;
            text.rows[r - 1].el.textContent = text1.concat(text2);
            text.rows[r].el.remove();
            text.rows.splice(r, 1);
            cursor.update(r2, c2, c2);
        }
    }
    /*else if (c == rows[r].text.length) {
        //console.log("eol");
        new_rows[r].text = new_rows[r].text.slice(0, c - 1).concat(new_rows[r].text.slice(c));
        cursor = { r, c: c - 1 };
    } else {
        //console.log("mid line");
        new_rows[r].text = new_rows[r].text.slice(0, c - 1).concat(new_rows[r].text.slice(c));
        cursor = { r, c: c - 1 };
    }
    rows = new_rows;
    scroll_up();
    scroll_down();
    //caret_update(r, c);
    */
}

export default { backspace };
