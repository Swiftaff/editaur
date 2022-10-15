import "./style.css";
import imported_rows from "./test_data.js";
//const imported_rows = debug.get_fifty_rows();

import debug from "./lib/debug.js";
import text from "./lib/text.js";
import cursorlib from "./lib/cursor.js";

function main() {
    console.log("test");
    const cursor = cursorlib.init();
    const rows = text.init(imported_rows, cursor);
    window.onmousedown = (e) => cursor.selecting_start(e, rows);
    window.onmousemove = (e) => cursor.update_from_mouse(e, rows);
    window.onmouseup = () => cursor.selecting_stop();
    cursor.update(0, 0);
    //debug.cursor_move_right(cursor, 1234);
}

export default (function () {
    main();
})();

function selection_start(e) {
    console.log(e);
}
