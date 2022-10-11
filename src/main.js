import "./style.css";
export default (function () {
    main();
})();
function main() {
    console.log("test");
    let benchmark = document.getElementById("benchmark");
    let b = get_el_xywh(benchmark);
    let CHAR_WIDTH = Math.floor(b.w / 5);
    let CHAR_HEIGHT = Math.floor(b.h / 5);
    let cursor = { r: 2, c: 1 };
    let caret = document.getElementsByTagName("i")[0];

    //setInterval(() => {
    //cursor.c = cursor.c + 1;
    update_caret();
    //}, 1224);

    function update_caret() {
        caret.classList.remove("flashy");
        caret.style.left = `${cursor.c * CHAR_WIDTH - 1}px`;
        caret.style.top = `${cursor.r * CHAR_HEIGHT}px`;
        caret.className = "flashy";
    }
}
function get_el_xywh(el) {
    let { x, y, width, height } = el.getBoundingClientRect();
    let w = Math.floor(width);
    let h = Math.floor(height);
    return { x, y, w, h };
}
