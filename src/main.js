import "./style.css";
import imported_rows from "./test_data.js";
import test_data from "../tests/testing_data.js";
//const imported_rows = debug.get_fifty_rows();

import debug from "./lib/debug.js";
import textlib from "./lib/text.js";
import cursorlib from "./lib/cursor.js";
import key from "./lib/key/lib.js";
import sidepanel_lib from "./lib/sidepanel.js";

export default (function main() {
    const cursor = cursorlib.init();
    const urlParams = new URLSearchParams(window.location.search);
    const testname = urlParams.get("testname");
    if (testname) {
        //turn off animations when testing
        let sheet = window.document.styleSheets[0];
        sheet.insertRule(".flashy { animation: none !important }", sheet.cssRules.length);
    }
    let data = testname ? test_data[testname] : imported_rows;
    const text = textlib.init(data, cursor);
    const sidepanel = sidepanel_lib.init(text);
    window.onmousedown = (e) => cursor.selection_start(e, text);
    window.onmousemove = (e) => cursor.update_from_mouse(e, text);
    window.onmouseup = () => cursor.selection_stop(text);
    window.onkeydown = (e) => key.down(e, cursor, text);
    window.onkeyup = (e) => key.up(e, cursor, text);
    //debug.cursor_move_right(cursor, 1234);
})();
