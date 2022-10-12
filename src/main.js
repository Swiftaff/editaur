import "./style.css";
import imported_rows from "./test_data.js";
export default (function () {
    main();
})();
function main() {
    console.log("test");
    console.log(imported_rows);

    const cursor = init_cursor();
    const rows = init_rows(imported_rows, cursor);

    console.log(rows);

    //let c = 0;
    //setInterval(() => {
    //c++;
    cursor.update(0, 0);
    //}, 1300);
}

function init_rows(imported_rows, cursor) {
    let text_div = document.getElementById("text");
    console.log(text_div);
    let rows = [];
    imported_rows.forEach((text) => {
        let el = document.createElement("div");
        el.innerHTML = text;
        el.style.width = cursor.w * text.length + "px";
        text_div.append(el);
        let row = {
            el,
        };
        rows.push(row);
    });
    return rows;
}

function init_cursor() {
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
            this.el.style.left = `${this.c * this.w - 1}px`;
            this.el.style.top = `${this.r * this.h}px`;
            this.flash = setTimeout(() => {
                this.el.className = "flashy";
            }, 400);
        },
    };
}

function get_char_dimensions() {
    // This just gets an average height and width of the fixed width font
    // by measuring the benchmark div which contains 5 rows of 5 characters
    // then deleting it
    const benchmark = document.getElementById("benchmark");
    benchmark.innerHTML = "XXXXX<br />XXXXX<br />XXXXX<br />XXXXX<br />XXXXX";
    const b = get_el_xywh(benchmark);
    benchmark.innerHTML = "";
    benchmark.remove();
    return { w: Math.floor(b.w / 5), h: Math.floor(b.h / 5) };
}

function get_el_xywh(el) {
    let { x, y, width, height } = el.getBoundingClientRect();
    let w = Math.floor(width);
    let h = Math.floor(height);
    return { x, y, w, h };
}
