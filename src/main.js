import "./style.css";
import imported_rows from "./test_data.js";
//const imported_rows = debug.get_fifty_rows();

import debug from "./lib/debug.js";
import textlib from "./lib/text.js";
import cursorlib from "./lib/cursor.js";
import keylib from "./lib/key.js";

export default (function main() {
    const cursor = cursorlib.init();
    const text = textlib.init(imported_rows, cursor);
    window.onmousedown = (e) => cursor.selection_start(e, text);
    window.onmousemove = (e) => cursor.update_from_mouse(e, text);
    window.onmouseup = () => cursor.selection_stop();
    window.onkeydown = (e) => keylib.down(e, cursor, text);
    //debug.cursor_move_right(cursor, 1234);
})();
