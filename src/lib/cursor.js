function init() {
    return {
        text_top: 0,
        text_left: 100,
        r: 0,
        c: 0,
        previous_c: 0,
        flash: null,
        pressing_shift: false,
        pressing_control: false,
        pressing_mouseleft: false,
        pressing_mouseright: false,
        multiple_clicks: 0,
        el: document.getElementsByTagName("i")[0],
        ...get_char_dimensions(),
        update(r, c, previous_c) {
            this.r = r;
            this.c = c;
            this.previous_c = previous_c;
            clearTimeout(this.flash);
            // TODO if update takes cursor offscreen - scroll to cursor
            this.el.classList.remove("flashy");
            this.el.style.left = `${Math.floor(this.c * this.w - 1)}px`;
            this.el.style.top = `${Math.floor(this.r * this.h)}px`;
            this.flash = setTimeout(() => {
                this.el.className = "flashy";
            }, 100);
        },
        scrolling: {
            scroll_left: 0,
            scroll_top: 0,
            mouse_x: 0,
            mouse_y: 0,
        },
        scrolling_reset(e) {
            this.scrolling = {
                scroll_left: this.main.scrollLeft,
                scroll_top: this.main.scrollTop,
                mouse_x: e.clientX,
                mouse_y: e.clientY,
            };
        },
        scrolling_update(e) {
            if (this.mouse_is_offscreen_right(e) || this.mouse_is_offscreen_left(e)) {
                let dx = e.clientX - this.scrolling.mouse_x;
                let left = dx - this.scrolling.scroll_left;
                this.main.scrollLeft = left;
                this.scrolling.scroll_left = this.scrolling.scroll_left - dx / 10;
            }
            if (this.mouse_is_offscreen_bottom(e) || this.mouse_is_offscreen_top(e)) {
                let dy = e.clientY - this.scrolling.mouse_y;
                let top = dy - this.scrolling.scroll_top;
                this.main.scrollTop = top;
                this.scrolling.scroll_top = this.scrolling.scroll_top - dy / 10;
            }
        },
        main: document.getElementsByTagName("main")[0],
        selection: { start: { r: 0, c: 0 }, end: { r: 0, c: 0 }, active: false },
        selection_reset() {
            this.selection = { start: { r: 0, c: 0 }, end: { r: 0, c: 0 }, active: false };
        },
        update_from_mouse(e, text) {
            if (this.selection.active && this.multiple_clicks < 2) {
                this.scrolling_update(e);
                let { r, c } = this.get_rc_from_mouse(e, text);
                this.update(r, c);
                this.selection.end = { r, c };
                text.selection_update(this);
                text.highlight_row(this);
            }
        },
        mouse_is_inside_scrollbars(e) {
            return !this.mouse_is_offscreen_right(e) && !this.mouse_is_offscreen_bottom(e);
        },
        mouse_is_offscreen_left(e) {
            return e.clientX < 40;
        },
        mouse_is_offscreen_right(e) {
            return e.clientX >= this.main.offsetWidth - 40;
        },
        mouse_is_offscreen_top(e) {
            return e.clientY < 40;
        },
        mouse_is_offscreen_bottom(e) {
            return e.clientY >= this.main.offsetHeight - 40;
        },
        selection_in_progress() {
            return this.selection.start.r !== this.selection.end.r || this.selection.start.c !== this.selection.end.c;
        },
        selection_reset_to_cursor(optional_bool = null) {
            this.selection = {
                start: { r: this.r, c: this.c },
                end: { r: this.r, c: this.c },
                active: optional_bool !== null ? optional_bool : this.selection.active,
            };
        },
        selection_start(e, text) {
            this.pressing_mouseleft = true;
            if (this.mouse_is_inside_scrollbars(e)) {
                this.scrolling_reset(e);
                let { r, c } = this.get_rc_from_mouse(e, text);
                this.update(r, c);

                if (this.pressing_shift) {
                    this.selection = { start: this.selection.start, end: { r: this.r, c: this.c }, active: true };
                    text.selection_update(this);
                } else {
                    this.selection_reset_to_cursor(true);
                    text.selection_reset();
                    text.highlight_row(this);
                }
                this.handle_multiple_clicks(text);
            }
        },
        selection_stop(text) {
            this.pressing_mouseleft = false;
            this.selection = { start: this.selection.start, end: { r: this.r, c: this.c }, active: false };
            text.highlight_row(this);
        },
        handle_multiple_clicks(text) {
            this.multiple_clicks = this.multiple_clicks + 1;
            this.multiple_clicks_reset();
            let row_text = text.rows[this.r].textContent;
            if (this.multiple_clicks === 3) {
                this.selection = {
                    start: { r: this.r, c: 0 },
                    end: { r: this.r, c: row_text.length },
                    active: true,
                };
                let c = row_text.length;
                this.update(this.r, c, c);
                text.selection_update(this);
            } else if (this.multiple_clicks === 2) {
                if (this.c > 0 && this.c < row_text.length) {
                    let left_char = row_text.substring(this.c - 1, this.c);
                    let right_char = row_text.slice(this.c, this.c + 1);
                    if (left_char !== " " && right_char !== " ") {
                        let left = row_text.slice(0, this.c);
                        let left_split = 0;
                        for (let index = this.c - 1; index >= 0; index--) {
                            let char = left[index];
                            if (left_split === 0 && char == " ") {
                                left_split = index + 1;
                                break;
                            }
                        }
                        let right = row_text.slice(this.c);
                        let right_split = right.length - 1;
                        for (let index = 0; index < right.length - 1; index++) {
                            let char = right[index];
                            if (right_split === right.length - 1 && char == " ") {
                                right_split = index;
                                break;
                            }
                        }
                        this.selection = {
                            start: { r: this.r, c: left_split },
                            end: { r: this.r, c: this.c + right_split },
                            active: true,
                        };
                        let c = this.c + right_split;
                        this.update(this.r, c, c);
                        text.selection_update(this);
                    }
                }
            }
        },
        multiple_clicks_reset() {
            setTimeout(() => {
                if (this.multiple_clicks > 0) this.multiple_clicks = this.multiple_clicks - 1;
            }, 400);
        },
        get_rc_from_mouse(e, text) {
            let scrollTop = this.main.scrollTop;
            let scrollLeft = this.main.scrollLeft;
            let c = Math.floor((e.clientX - this.text_left + scrollLeft + this.w_overlap - 7) / this.w);
            let r = Math.floor((e.clientY - this.text_top + scrollTop - 7) / this.h);
            if (r < 0) r = 0;
            if (r > text.rows.length - 1) r = text.rows.length - 1;
            if (c > text.rows[r].textContent.length - 1) c = text.rows[r].textContent.length;
            if (c < 0) c = 0;
            return { r, c };
        },
    };
}

function get_char_dimensions() {
    // This just gets an average height and width of the fixed width font
    // by measuring the benchmark div which contains 5 rows of 5 characters
    // then deleting it
    const benchmark = document.getElementById("benchmark");
    benchmark.innerHTML = "<span>XXXXX<br />XXXXX<br />XXXXX<br />XXXXX<br />XXXXX</span>";
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
