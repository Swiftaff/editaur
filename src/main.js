import "./style.css";
import imported_rows from "./test_data.js";
//const imported_rows = debug_get_fifty_rows();
export default (function () {
    main();
})();
function main() {
    console.log("test");
    console.log(imported_rows);
    const cursor = init_cursor();
    const rows = init_rows(imported_rows, cursor);
    console.log(rows);

    cursor.update(0, 0);
    debug_cursor_move_right(cursor, 1234);
}

function init_rows(imported_rows, cursor) {
    let text_div = document.getElementById("text");

    let rows = [];
    imported_rows.forEach((text) => {
        let el = document.createElement("div");
        el.innerHTML = text;
        el.style.width = Math.ceil(cursor.w * text.length) + "px";
        el.style["background-color"] = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
            Math.random() * 255
        }, 0.4)`;
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
            this.el.style.left = `${Math.floor(this.c * this.w - 1)}px`;
            this.el.style.top = `${Math.floor(this.r * this.h)}px`;
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

function debug_get_fifty_rows() {
    const imported_rows = [];
    for (let index = 0; index < 52; index++) {
        imported_rows.push("abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz".slice(0, index + 1));
    }
    return imported_rows;
}

function debug_cursor_move_right(cursor, interval) {
    let c = 0;
    setInterval(() => {
        c++;
        cursor.update(0, c);
    }, interval);
}

set;
