import "./style.css";
import imported_rows from "./test_data.js";
//const imported_rows = debug.get_fifty_rows();

import debug from "./lib/debug.js";
import text from "./lib/text.js";
import cursorlib from "./lib/cursor.js";

function main() {
    console.log("test");
    console.log(imported_rows);
    const cursor = cursorlib.init();
    const rows = text.init(imported_rows, cursor);
    console.log(rows);

    cursor.update(0, 0);
    debug.cursor_move_right(cursor, 1234);
}

export default (function () {
    main();
})();
