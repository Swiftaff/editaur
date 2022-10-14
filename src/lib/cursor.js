function init() {
    return {
        r: 2,
        c: 1,
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
        update_from_mouse(e, rows) {
            let TEXT_TOP = 0;
            let TEXT_LEFT = 100;
            let CHAR_WIDTH_THIRD = this.w / 3;
            let c = Math.floor((e.clientX - TEXT_LEFT + CHAR_WIDTH_THIRD) / this.w);
            let r = Math.floor((e.clientY - TEXT_TOP) / this.h);
            if (c > rows[r].el.textContent.length - 1) c = rows[r].el.textContent.length;
            if (c < 0) c = 0;
            this.update(r, c);
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
    return { w: b.w / 5, h: b.h / 5 };
}

function get_el_xywh(el) {
    let { x, y, width, height } = el.getBoundingClientRect();
    let w = width;
    let h = height;
    return { x, y, w, h };
}

export default { init };
