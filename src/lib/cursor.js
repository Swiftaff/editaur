function init() {
    return {
        text_top: 0,
        text_left: 100,
        r: 0,
        c: 0,
        top: document.getElementById("tabs").getBoundingClientRect().height,
        directory: "",
        file: "",
        previous_c: 0,
        flash1: null,
        flash2: null,
        pressing_shift: false,
        pressing_control: false,
        multiple_clicks: { r: 0, c: 0, clicks: 0 },
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
            let c = Math.floor((e.clientX - this.text_left + scrollLeft + this.w_overlap - 7) / this.w);
            let r = Math.floor((e.clientY - this.text_top + scrollTop - 7 - this.top) / this.h);
            if (r < 0) r = 0;
            if (r > text.rows.length - 1) r = text.rows.length - 1;
            if (c > text.rows[r].textContent.length - 1) c = text.rows[r].textContent.length;
            if (c < 0) c = 0;
            return { r, c };
        },
        update_from_mouse(e, text) {
            if (this.selection.active && this.multiple_clicks.clicks < 2) {
                this.scrolling.update(e);
                let { r, c } = this.get_rc_from_mouse(e, text);
                this.update(r, c, c, false);
                this.selection.end = { r, c };
                text.selection_update(this);
                text.highlight_row(this);
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
        select_all(text) {
            let r = text.rows.length - 1;
            let c = text.rows[r].textContent.length;
            this.selection.start = { r: 0, c: 0 };
            this.selection.end = { r: r, c };
            this.selection.active = false;
            this.update(r, c, c, false);
            text.selection_update(this);
        },
        selection_reset_to_cursor(optional_bool = null) {
            this.selection.start = { r: this.r, c: this.c };
            this.selection.end = { r: this.r, c: this.c };
            this.selection.active = optional_bool !== null ? optional_bool : this.selection.active;
        },
        selection_start(e, text) {
            if (this.scrolling.mouse_is_inside_scrollbars(e)) {
                this.scrolling.reset(e);
                let { r, c } = this.get_rc_from_mouse(e, text);
                this.update(r, c, c, false);

                if (this.pressing_shift) {
                    //this.selection.start = this.selection.start;
                    this.selection.end = { r: this.r, c: this.c };
                    this.selection.active = true;
                    //this.selection_reset_to_cursor();
                    //text.selection_update(this);
                } else {
                    this.selection_reset_to_cursor(true);
                    text.selection_reset();
                    text.highlight_row(this);
                }
                this.handle_multiple_clicks(text);
            }
        },
        selection_stop(text) {
            this.selection.end = { r: this.r, c: this.c };
            this.selection.active = false;
            text.highlight_row(this);
        },
        handle_multiple_clicks(text) {
            if (this.multiple_clicks.c === this.c && this.multiple_clicks.r === this.r) {
                this.multiple_clicks.clicks = this.multiple_clicks.clicks + 1;
            } else {
                this.multiple_clicks = { r: this.r, c: this.c, clicks: 0 };
            }

            this.multiple_clicks_reset();
            let row_text = text.rows[this.r].textContent;
            if (this.multiple_clicks.clicks === 4) {
                console.log(4);
                this.select_all(text);
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
                text.selection_update(this);
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
                    text.selection_update(this);
                }
            } else {
                text.selection_update(this);
            }
        },
        multiple_clicks_reset() {
            setTimeout(() => {
                if (this.multiple_clicks.clicks > 0) this.multiple_clicks.clicks = this.multiple_clicks.clicks - 1;
            }, 600);
        },
    };
}

function get_char_dimensions() {
    // This just gets an average height and width of the fixed width font
    // by measuring the benchmark div which contains 5 rows of 5 characters
    // then deleting it
    const text = document.getElementById("text");
    const benchmark = document.createElement("div");
    text.append(benchmark);
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
