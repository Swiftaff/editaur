import "./style.css";
import imported_rows from "./test_data.js";
import test_data from "../tests/testing_data.js";
//const imported_rows = debug.get_fifty_rows();

import debug from "./lib/debug.js";
import cursorlib from "./lib/cursor.js";
import key from "./lib/key/lib.js";
import sidepanel_lib from "./lib/sidepanel.js";

export default (function main() {
    const urlParams = new URLSearchParams(window.location.search);
    const testname = urlParams.get("testname");
    if (testname) {
        //turn off animations when testing
        let sheet = window.document.styleSheets[0];
        sheet.insertRule(".flashy { animation: none !important }", sheet.cssRules.length);
    }
    let data = testname ? test_data[testname] : []; //imported_rows;
    const cursor = cursorlib.init(data);
    sidepanel_lib.init(cursor);
    window.onmousedown = (e) => {
        if (!cursor.drag_handle.dragging) cursor.selection_start(e);
    };
    window.onmousemove = (e) => {
        if (!cursor.drag_handle.dragging) cursor.update_from_mouse(e);
        cursor.drag_handle.mousemove(e, cursor);
    };
    window.onmouseup = (e) => {
        if (!cursor.drag_handle.dragging) cursor.selection_stop();
        cursor.drag_handle.mouseup(e);
    };
    window.onkeydown = (e) => key.down(e, cursor);
    window.onkeyup = (e) => key.up(e, cursor);
    //debug.cursor_move_right(cursor, 1234);
})();
