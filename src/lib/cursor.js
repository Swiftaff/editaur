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
            console.log(r, c);
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
        selecting: { start: { r: 0, c: 0 }, end: { r: 0, c: 0 }, active: false },
        update_from_mouse(e, rows) {
            if (this.selecting.active) {
                console.log(e.clientX, this.text_left, this.w_overlap, this.w);
                let c = Math.floor((e.clientX - this.text_left + this.w_overlap) / this.w);
                let r = Math.floor((e.clientY - this.text_top) / this.h);
                if (c > rows[r].el.textContent.length - 1) c = rows[r].el.textContent.length;
                if (c < 0) c = 0;
                this.update(r, c);
                this.selecting.end = { r, c };
                rows[r].select.style.width = Math.floor((c - this.selecting.start.c) * this.w) + "px";
            }
        },
        selecting_start(e, rows) {
            let c = Math.floor((e.clientX - this.text_left + this.w_overlap) / this.w);
            let r = Math.floor((e.clientY - this.text_top) / this.h);
            this.selecting = { start: { r, c }, end: { r, c }, active: true };
            this.update_from_mouse(e, rows);
            rows[this.r].select.style.left = c * this.w + "px";
            rows[this.r].select.style.width = "0px";
        },
        selecting_stop() {
            this.selecting = { start: { r: 0, c: 0 }, end: { r: 0, c: 0 }, active: false };
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
