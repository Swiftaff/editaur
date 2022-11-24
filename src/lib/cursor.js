function init(imported_rows) {
    let obj = {
        tabs: {
            first_tab_el: document.getElementById("tabs").firstElementChild,
            update_first_tab_name(name) {
                this.first_tab_el.textContent = name;
            },
        },
        text: {
            el: document.getElementById("text"),
            top: 0,
            left: 100,
            rows: [],
            imported_rows: [],
            selection_reset() {
                this.rows.forEach((_row, r) => {
                    this.selection_update_one_row(r, 0, 0, 0);
                });
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
        },
        hash: {
            imported_rows: 0,
            current: 0,

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
        },
        check_if_changed() {
            this.hash.current = this.hash.hash(this.text.rows.map((r) => r.textContent));
            if (this.hash.current === this.hash.imported_rows) {
                this.tabs.first_tab_el.removeAttribute("class");
            } else {
                this.tabs.first_tab_el.className = "dot";
            }
        },
        hashes_reset() {
            this.hash.current = this.hash.hash(this.text.imported_rows);
            this.hash.imported_rows = this.hash.current;
            this.tabs.first_tab_el.removeAttribute("class");
        },
        refresh_from_text(text) {
            let array = text.split("\r\n");
            this.refresh_from_array(array);
        },
        refresh_from_array(array) {
            if (!array.length) {
                array = [""];
            }
            this.text.imported_rows = array;
            this.remove_all_rows_and_dom_nodes();
            array.forEach((text_content) => {
                let row = this.get_new_row(text_content);
                this.text.el.append(row);
                this.text.rows.push(row);
            });
            this.update(0, 0, 0);
            this.hashes_reset();
        },
        text_selection_update() {
            let num_rows = Math.abs(this.selection.end.r - this.selection.start.r);
            let reverse_direction =
                this.selection.start.r > this.selection.end.r ||
                (this.selection.start.r === this.selection.end.r && this.selection.start.c > this.selection.end.c);
            this.text.selection_reset();
            if (num_rows === 0) {
                if (reverse_direction) {
                    this.text.selection_update_one_row(this.r, this.selection.end.c, this.selection.start.c, this.w);
                } else {
                    this.text.selection_update_one_row(this.r, this.selection.start.c, this.c, this.w);
                }
            } else {
                for (let index = 0; index <= num_rows; index++) {
                    // TODO allow for screen scrolling up/down
                    // TODO allow for screen scrolling left/right
                    let this_row = this.selection.start.r + (reverse_direction ? -index : index);
                    let this_row_length = this.text.rows[this_row].textContent.length;
                    let first_row = reverse_direction ? index === num_rows : index === 0;
                    let last_row = reverse_direction ? index === 0 : index === num_rows;
                    let start = this.selection.start.c;
                    let end = this.selection.end.c;
                    if (reverse_direction) {
                        if (first_row) {
                            this.text.selection_update_one_row(this_row, end, this_row_length, this.w);
                        } else if (last_row) {
                            this.text.selection_update_one_row(this_row, 0, start, this.w);
                        } else {
                            // all other rows
                            this.text.selection_update_one_row(this_row, 0, this_row_length, this.w);
                        }
                    } else {
                        if (first_row) {
                            this.text.selection_update_one_row(this_row, start, this_row_length, this.w);
                        } else if (last_row) {
                            this.text.selection_update_one_row(this_row, 0, end, this.w);
                        } else {
                            // all other rows
                            this.text.selection_update_one_row(this_row, 0, this_row_length, this.w);
                        }
                    }
                }
            }
        },
        r: 0,
        c: 0,
        sidepanel_wrapper_el: document.getElementById("sidepanel_wrapper"),
        sidepanel_el: document.getElementById("sidepanel"),
        top: document.getElementById("tabs").getBoundingClientRect().height,
        drag_handle: {
            el: document.getElementById("drag_handle"),
            click_x: 0,
            offset_x: 0,
            current_x: 0,
            dragging: false,
            click_offset_x: 0,
            mousedown(e) {
                console.log("down", this.offset_x);
                let { x } = this.el.getBoundingClientRect();
                this.click_offset_x = Math.floor(x) - e.x;
                this.click_x = e.x - this.click_offset_x;
                this.current_x = e.x - this.click_offset_x;
                this.dragging = true;
            },
            mousemove(e, cursor) {
                if (this.dragging) {
                    let magic_number = 6;
                    let min_width = 30;
                    this.current_x = e.x;
                    if (this.current_x < min_width) this.current_x = min_width;
                    if (this.current_x > window.innerWidth - min_width) this.current_x = window.innerWidth - min_width;
                    this.el.style.left = `${this.current_x + this.click_offset_x}px`;
                    let new_width = window.innerWidth - this.current_x - this.click_offset_x - 10 - magic_number;
                    //cursor.scrolling.main.style.width = `${this.current_x + this.click_offset_x - 2}px`;
                    cursor.scrolling.main.style.width = `${this.current_x + this.click_offset_x - 4}px`;
                    cursor.sidepanel_wrapper_el.style.left = `${this.current_x + this.click_offset_x + magic_number}px`;
                    cursor.sidepanel_wrapper_el.style.width = `${new_width}px`;
                    cursor.sidepanel_el.style.width = `${new_width}px`;
                    cursor.highlight_row();
                }
            },
            mouseup(e, cursor) {
                if (this.dragging) {
                    console.log("up", this.offset_x, this.click_x, this.current_x);
                    this.dragging = false;
                    this.offset_x = this.offset_x + this.click_x - this.current_x;
                    console.log("up", this.offset_x);
                    cursor.highlight_row();
                }
            },
        },
        directory: "",
        file: "",
        previous_c: 0,
        flash1: null,
        flash2: null,
        pressing_shift: false,
        pressing_control: false,
        multiple_clicks: {
            r: 0,
            c: 0,
            clicks: 0,
            decr_on_timeout() {
                setTimeout(() => {
                    if (this.clicks > 0) this.clicks = this.clicks - 1;
                }, 600);
            },
            incr_or_restart() {
                if (this.c === this.c && this.r === this.r) {
                    this.clicks = this.clicks + 1;
                } else {
                    this.r = this.r;
                    this.c = this.c;
                    this.clicks = 0;
                }
            },
        },
        el: document.getElementsByTagName("i")[0],
        ...get_char_dimensions(),
        update(r, c, previous_c, reset_cursor = true) {
            this.r = r;
            this.c = c;
            this.previous_c = previous_c;
            clearTimeout(this.flash1);
            clearTimeout(this.flash2);
            this.el.classList.remove("flashy");
            this.el.style.left = `${Math.floor(this.c * this.w - 1)}px`;
            this.el.style.top = `${Math.floor(this.r * this.h)}px`;
            this.flash1 = setTimeout(() => {
                this.el.className = "flashy moved";
                //added for easier testing
                this.flash2 = setTimeout(() => {
                    this.el.className = "flashy";
                }, 200);
            }, 100);
            if (reset_cursor) this.selection_reset_to_cursor();
        },
        get_rc_from_mouse(e, text) {
            let scrollTop = this.scrolling.main.scrollTop;
            let scrollLeft = this.scrolling.main.scrollLeft;
            let c = Math.floor((e.clientX - this.text.left + scrollLeft + this.w_overlap - 7) / this.w);
            let r = Math.floor((e.clientY - this.text.top + scrollTop - 7 - this.top) / this.h);
            if (r < 0) r = 0;
            if (r > this.text.rows.length - 1) r = this.text.rows.length - 1;
            if (c > this.text.rows[r].textContent.length - 1) c = this.text.rows[r].textContent.length;
            if (c < 0) c = 0;
            return { r, c };
        },
        update_from_mouse(e, text) {
            if (this.selection.active && this.multiple_clicks.clicks < 2) {
                this.scrolling.update(e);
                let { r, c } = this.get_rc_from_mouse(e, text);
                this.update(r, c, c, false);
                this.selection.end = { r, c };
                this.text_selection_update();
                this.highlight_row();
            }
        },
        scrolling: {
            main: document.getElementsByTagName("main")[0],
            scroll_left: 0,
            scroll_top: 0,
            mouse_x: 0,
            mouse_y: 0,
            reset(e) {
                this.scroll_left = this.main.scrollLeft;
                this.scroll_top = this.main.scrollTop;
                this.mouse_x = e.clientX;
                this.mouse_y = e.clientY;
            },
            update(e) {
                if (this.mouse_is_offscreen_right(e) || this.mouse_is_offscreen_left(e)) {
                    let dx = e.clientX - this.mouse_x;
                    let left = dx - this.scroll_left;
                    this.main.scrollLeft = left;
                    this.scroll_left = this.scroll_left - dx / 10;
                }
                if (this.mouse_is_offscreen_bottom(e) || this.mouse_is_offscreen_top(e)) {
                    let dy = e.clientY - this.mouse_y;
                    let top = dy - this.scroll_top;
                    this.main.scrollTop = top;
                    this.scroll_top = this.scroll_top - dy / 10;
                }
            },
            mouse_is_offscreen_right(e) {
                return e.clientX >= this.main.offsetWidth - 40;
            },
            mouse_is_offscreen_left(e) {
                return e.clientX < 40;
            },
            mouse_is_offscreen_top(e) {
                return e.clientY < 40;
            },
            mouse_is_offscreen_bottom(e) {
                return e.clientY >= this.main.offsetHeight - 40;
            },
            mouse_is_inside_scrollbars(e) {
                return !this.mouse_is_offscreen_right(e) && !this.mouse_is_offscreen_bottom(e);
            },
        },
        selection: {
            start: { r: 0, c: 0 },
            end: { r: 0, c: 0 },
            active: false,
            is_in_progress() {
                return this.start.r !== this.end.r || this.start.c !== this.end.c;
            },
            reset() {
                this.start = { r: 0, c: 0 };
                this.end = { r: 0, c: 0 };
                this.active = false;
            },
            normalised_start_end() {
                if (this.start.r < this.end.r) {
                    return { start: this.start, end: this.end };
                } else if (this.start.r === this.end.r) {
                    if (this.start.c <= this.end.c) {
                        return { start: this.start, end: this.end };
                    } else {
                        return { start: this.end, end: this.start };
                    }
                } else {
                    return { start: this.end, end: this.start };
                }
            },
            is_reversed() {
                return this.start.r > this.end.r || (this.is_single_line && this.start.c > this.end.c);
            },
        },
        select_all() {
            let r = this.text.rows.length - 1;
            let c = this.text.rows[r].textContent.length;
            this.selection.start = { r: 0, c: 0 };
            this.selection.end = { r: r, c };
            this.selection.active = false;
            this.update(r, c, c, false);
            this.text_selection_update();
        },
        selection_reset_to_cursor(optional_bool = null) {
            this.selection.start = { r: this.r, c: this.c };
            this.selection.end = { r: this.r, c: this.c };
            this.selection.active = optional_bool !== null ? optional_bool : this.selection.active;
        },
        selection_start(e) {
            if (this.scrolling.mouse_is_inside_scrollbars(e)) {
                this.scrolling.reset(e);
                let { r, c } = this.get_rc_from_mouse(e);
                this.update(r, c, c, false);

                if (this.pressing_shift) {
                    this.selection.end = { r: this.r, c: this.c };
                    this.selection.active = true;
                } else {
                    this.selection_reset_to_cursor(true);
                    this.text.selection_reset();
                    this.highlight_row();
                }
                this.handle_multiple_clicks();
            }
        },
        selection_stop() {
            this.selection.end = { r: this.r, c: this.c };
            this.selection.active = false;
            this.highlight_row();
        },
        handle_multiple_clicks() {
            this.multiple_clicks.incr_or_restart();
            this.multiple_clicks.decr_on_timeout();
            let row_text = this.text.rows[this.r].textContent;
            if (this.multiple_clicks.clicks === 4) {
                console.log(4);
                this.select_all();
            } else if (this.multiple_clicks.clicks === 3) {
                let c = row_text.length;
                let r = this.r;
                if (this.pressing_shift) {
                    if (this.selection.is_reversed()) c = 0;
                    this.selection.end = { r, c };
                } else {
                    this.selection.start = { r, c: 0 };
                    this.selection.end = { r, c };
                }
                this.selection.active = true;
                this.update(r, c, c, false);
                this.text_selection_update();
            } else if (this.multiple_clicks.clicks === 2) {
                let left_char = row_text.substring(this.c - 1, this.c);
                let right_char = row_text.slice(this.c, this.c + 1);
                let clicked_within_word = left_char !== " " && right_char !== " ";
                if (clicked_within_word) {
                    //get word_start, either start of line or after first space
                    let left = row_text.slice(0, this.c);
                    let left_split = 0;
                    for (let index = this.c - 1; index >= 0; index--) {
                        let char = left[index];
                        if (char === " ") {
                            left_split = index + 1;
                            break;
                        }
                    }

                    //get word_end, either end of line or before first space
                    let right = row_text.slice(this.c);
                    let right_split = right.length;
                    for (let index = 0; index < right.length - 1; index++) {
                        let char = right[index];
                        if (char === " ") {
                            right_split = index;
                            break;
                        }
                    }

                    let c = this.c + right_split;
                    if (this.pressing_shift) {
                        if (this.selection.is_reversed()) c = left_split;
                        this.selection.end = { r: this.selection.end.r, c };
                    } else {
                        this.selection.start = { r: this.r, c: left_split };
                        this.selection.end = { r: this.r, c };
                    }
                    this.selection.active = true;
                    this.update(this.r, c, c, false);
                    this.text_selection_update();
                }
            } else {
                this.text_selection_update();
            }
        },
        update_row_text_and_width(el, text_content) {
            el.textContent = text_content;
            el.style.width = Math.ceil(this.w * text_content.length) + "px";
        },
        get_new_row(text_content) {
            let el = document.createElement("div");
            this.update_row_text_and_width(el, text_content);
            return el;
        },
        remove_all_rows_and_dom_nodes() {
            this.text.rows.forEach((row) => {
                row.remove();
            });
            this.text.rows = [];
        },
        highlight_row() {
            this.highlight_none();
            if (!this.selection.is_in_progress()) {
                this.text.rows[this.r].className = "highlighted";
                this.text.rows[this.r].style.width = "100%";
            }
        },
        highlight_none() {
            let { width } = this.scrolling.main.getBoundingClientRect();
            this.text.el.style.width = width - 100 + "px";
            this.text.rows.forEach((row) => {
                row.removeAttribute("class");
                row.style.width = Math.ceil(this.w * row.textContent.length) + "px";
            });
        },
    };
    obj.refresh_from_array(imported_rows);
    obj.drag_handle.el.onmousedown = (e) => obj.drag_handle.mousedown(e);
    return obj;
}

function get_char_dimensions() {
    // This just gets an average height and width of the fixed width font
    // by measuring the benchmark div which contains 5 rows of 5 characters
    // then deleting it
    const text_el = document.getElementById("text");
    const benchmark = document.createElement("div");
    text_el.append(benchmark);
    benchmark.innerHTML = "XXXXX<br />XXXXX<br />XXXXX<br />XXXXX<br />XXXXX";
    const b = get_el_xywh(benchmark);
    benchmark.remove();
    let num_Xs = 5;
    let one_half_of_char_width = 0.5;
    let w_overlap = (b.w / num_Xs) * one_half_of_char_width;
    let w = b.w / num_Xs;
    let h = b.h / num_Xs;
    return { w, h, w_overlap };
}

function get_el_xywh(el) {
    let { x, y, width, height } = el.getBoundingClientRect();
    let w = width;
    let h = height;
    return { x, y, w, h };
}

export default { init };
