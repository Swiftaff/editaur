function init() {
    return {
        text_top: 0,
        text_left: 100,
        r: 0,
        c: 0,
        flash: null,
        el: document.getElementsByTagName("i")[0],
        ...get_char_dimensions(),
        update(r, c) {
            this.r = r;
            this.c = c;
            clearTimeout(this.flash);
            this.el.classList.remove("flashy");
            this.el.style.left = `${Math.floor(this.c * this.w - 1)}px`;
            this.el.style.top = `${Math.floor(this.r * this.h)}px`;
            this.flash = setTimeout(() => {
                this.el.className = "flashy";
            }, 400);
        },
        main: document.getElementsByTagName("main")[0],
        selection: { start: { r: 0, c: 0 }, end: { r: 0, c: 0 }, active: false },
        update_from_mouse(e, text) {
            if (this.selection.active) {
                let { r, c } = this.get_rc_from_mouse(e, text);
                this.update(r, c);
                this.selection.end = { r, c };
                text.selection_update(this);
            }
        },
        selection_start(e, text) {
            let is_inside_scrollbars = e.clientX < this.main.offsetWidth - 7 && e.clientY < this.main.offsetHeight - 7;
            if (is_inside_scrollbars) {
                let { r, c } = this.get_rc_from_mouse(e, text);
                this.selection = { start: { r, c }, end: { r, c }, active: true };
                this.update_from_mouse(e, text);
                text.selection_reset();
            }
        },
        selection_stop() {
            this.selection = { start: { r: 0, c: 0 }, end: { r: 0, c: 0 }, active: false };
        },
        get_rc_from_mouse(e, text) {
            let scrollTop = this.main.scrollTop;
            let scrollLeft = this.main.scrollLeft;
            let c = Math.floor((e.clientX - this.text_left + this.w_overlap + scrollLeft) / this.w);
            let r = Math.floor((e.clientY - this.text_top + scrollTop) / this.h);
            if (c > text.rows[r].el.textContent.length - 1) c = text.rows[r].el.textContent.length;
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
    let w_overlap = b.w / 5 / 6;
    return { w: b.w / 5, h: b.h / 5, w_overlap };
}

function get_el_xywh(el) {
    let { x, y, width, height } = el.getBoundingClientRect();
    let w = width;
    let h = height;
    return { x, y, w, h };
}

export default { init };
