import "./style.css";
export default (function () {
    main();
})();
function main() {
    console.log("test");
    let benchmark = document.getElementById("benchmark");
    let b = get_el_xywh(benchmark);

    let cursor = {
        r: 2,
        c: 1,
        flash: null,
        CHAR_WIDTH: Math.floor(b.w / 5),
        CHAR_HEIGHT: Math.floor(b.h / 5),
        EL: document.getElementsByTagName("i")[0],
        update(r, c) {
            this.r = r;
            this.c = c;
            clearTimeout(this.flash);
            this.EL.classList.remove("flashy");
            this.EL.style.left = `${this.c * this.CHAR_WIDTH - 1}px`;
            this.EL.style.top = `${this.r * this.CHAR_HEIGHT}px`;
            this.flash = setTimeout(() => {
                this.EL.className = "flashy";
            }, 400);
        },
    };
    //let c = 0;
    //setInterval(() => {
    //c++;
    cursor.update(1, 4);
    //}, 1300);
}
function get_el_xywh(el) {
    let { x, y, width, height } = el.getBoundingClientRect();
    let w = Math.floor(width);
    let h = Math.floor(height);
    return { x, y, w, h };
}
