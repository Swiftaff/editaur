function init(imported_rows, cursor) {
    let obj = {
        el: document.getElementById("text"),
        first_tab_el: document.getElementById("tabs").firstElementChild,
        rows: [],
        imported_rows: [],
        hash_imported_rows: 0,
        hash_current: 0,
        tab_spaces: 4,
        selection_reset() {
            this.rows.forEach((_row, r) => {
                this.selection_update_one_row(r, 0, 0, 0);
            });
        },
        selection_update(cursor) {
            let num_rows = Math.abs(cursor.selection.end.r - cursor.selection.start.r);
            let reverse_direction =
                cursor.selection.start.r > cursor.selection.end.r ||
                (cursor.selection.start.r === cursor.selection.end.r &&
                    cursor.selection.start.c > cursor.selection.end.c);
            this.selection_reset();
            if (num_rows === 0) {
                if (reverse_direction) {
                    this.selection_update_one_row(cursor.r, cursor.selection.end.c, cursor.selection.start.c, cursor.w);
                } else {
                    this.selection_update_one_row(cursor.r, cursor.selection.start.c, cursor.c, cursor.w);
                }
            } else {
                for (let index = 0; index <= num_rows; index++) {
                    // TODO allow for screen scrolling up/down
                    // TODO allow for screen scrolling left/right
                    let this_row = cursor.selection.start.r + (reverse_direction ? -index : index);
                    let this_row_length = this.rows[this_row].textContent.length;
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
        get_new_row(text_content, cursor, testy) {
            let el = document.createElement("div");
            this.update_text(el, text_content);
            if (testy) {
                el.style.backgroundColor = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
                    Math.random() * 255
                }, 0.2)`;
            }

            return el;
        },
        update_text(el, text_content) {
            el.textContent = text_content;
            el.style.width = Math.ceil(cursor.w * text_content.length) + "px";
        },
        selection_update_one_row(r, c_start, c_end, c_width) {
            if (c_start === c_end) {
                this.rows[r].style.background = "";
                delete this.rows[r].dataset.start;
                delete this.rows[r].dataset.end;
            } else {
                let c_start2 = c_start < c_end ? c_start : c_end;
                let c_end2 = c_start < c_end ? c_end : c_start;
                let start = Math.floor(c_start * c_width) + "px";
                let end = Math.floor(c_end * c_width) + "px";
                let bgnd = "rgba(255, 255, 255, 0)";
                let highlight = "rgba(255, 0, 0, 1)";
                let style = `linear-gradient(90deg, ${bgnd} ${start}, ${highlight} ${start}, ${highlight} ${end}, ${bgnd} ${end})`;
                this.rows[r].style.background = style;
                // added below for easier testing
                this.rows[r].dataset.start = c_start2;
                this.rows[r].dataset.end = c_end2;
            }
        },
        highlight_row(cursor) {
            this.highlight_none();
            if (!cursor.selection.is_in_progress()) {
                this.rows[cursor.r].className = "highlighted";
                this.rows[cursor.r].style.width = "100%";
            }
        },
        highlight_none() {
            let { width } = cursor.scrolling.main.getBoundingClientRect();
            this.el.style.width = width + "px";
            this.rows.forEach((row) => {
                row.removeAttribute("class");
                row.style.width = Math.ceil(cursor.w * row.textContent.length) + "px";
            });
        },
        refresh_from_text(text, cursor) {
            let array = text.split("\r\n");
            this.refresh_from_array(array, cursor);
        },
        refresh_from_array(array, cursor) {
            if (!array.length) {
                array = [""];
            }
            this.imported_rows = array;
            this.remove_all_rows_and_dom_nodes();
            array.forEach((text_content) => {
                let row = obj.get_new_row(text_content, cursor);
                this.el.append(row);
                this.rows.push(row);
            });
            cursor.update(0, 0, 0);
            this.hashes_reset();
        },
        remove_all_rows_and_dom_nodes() {
            this.rows.forEach((row) => {
                row.remove();
            });
            this.rows = [];
        },
        check_if_changed() {
            this.hash_current = this.hash(this.rows.map((r) => r.textContent));
            if (this.hash_current === this.hash_imported_rows) {
                this.first_tab_el.removeAttribute("class");
            } else {
                this.first_tab_el.className = "dot";
            }
        },
        hashes_reset() {
            this.hash_current = this.hash(this.imported_rows);
            this.hash_imported_rows = this.hash_current;
            this.first_tab_el.removeAttribute("class");
        },
        hash(arr) {
            let hash = 0;
            let str = arr.join("\r\n");
            for (let i = 0, len = str.length; i < len; i++) {
                let chr = str.charCodeAt(i);
                hash = (hash << 5) - hash + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        },
        update_first_tab_name(name) {
            this.first_tab_el.textContent = name;
        },
    };
    obj.refresh_from_array(imported_rows, cursor);
    return obj;
}

export default { init };
