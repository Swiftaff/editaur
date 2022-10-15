function init(imported_rows, cursor) {
    let text_div = document.getElementById("text");

    let rows = [];
    imported_rows.forEach((text) => {
        let el = document.createElement("div");
        el.innerHTML = text;
        el.style.width = Math.ceil(cursor.w * text.length) + "px";
        //el.style["background-color"] = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
        //    Math.random() * 255
        //}, 0.2)`;

        let select = document.createElement("div");
        select.className = "selection";
        el.append(select);

        text_div.append(el);
        let row = {
            el,
            select,
        };
        rows.push(row);
    });
    return {
        rows,
        selection_reset() {
            this.rows.forEach((_row, r) => {
                this.selection_update_one_row(r, 0, 0, 0);
            });
        },
        selection_update(cursor) {
            let num_rows = Math.abs(cursor.selection.end.r - cursor.selection.start.r);
            let reverse_direction = cursor.selection.start.r > cursor.selection.end.r;
            this.selection_reset();
            if (num_rows === 0) {
                this.selection_update_one_row(cursor.r, cursor.selection.start.c, cursor.c, cursor.w);
            } else {
                for (let index = 0; index < num_rows + 1; index++) {
                    // TODO allow for screen scrolling up/down
                    // TODO allow for screen scrolling left/right
                    let this_row = cursor.selection.start.r + (reverse_direction ? -index : index);
                    let this_row_length = this.rows[this_row].el.textContent.length;
                    let first_row = reverse_direction ? index === num_rows : index === 0;
                    let last_row = reverse_direction ? index === 0 : index === num_rows;
                    let start = cursor.selection.start.c;
                    let end = cursor.selection.end.c;
                    if (reverse_direction) {
                        if (first_row) {
                            this.selection_update_one_row(this_row, end, this_row_length, cursor.w);
                        } else if (last_row) {
                            this.selection_update_one_row(this_row, 0, start, cursor.w);
                        } else {
                            // all other rows
                            this.selection_update_one_row(this_row, 0, this_row_length, cursor.w);
                        }
                    } else {
                        if (first_row) {
                            this.selection_update_one_row(this_row, start, this_row_length, cursor.w);
                        } else if (last_row) {
                            this.selection_update_one_row(this_row, 0, end, cursor.w);
                        } else {
                            // all other rows
                            this.selection_update_one_row(this_row, 0, this_row_length, cursor.w);
                        }
                    }
                }
            }
        },
        selection_update_one_row(r, c_start, c_end, c_width) {
            let width = Math.abs(c_end - c_start);
            let start = c_start < c_end ? c_start : c_end;
            this.rows[r].select.style.left = Math.floor(start * c_width) + "px";
            this.rows[r].select.style.width = Math.floor(width * c_width) + "px";
        },
    };
}

export default { init };