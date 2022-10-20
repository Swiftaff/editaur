import move from "./move.js";
import edit from "./edit.js";

function down(e, cursor, text) {
    e.preventDefault();
    switch (e.key) {
        case "ArrowDown":
            move.arrow_down(cursor, text);
            break;
        case "ArrowUp":
            move.arrow_up(cursor, text);
            break;
        case "ArrowLeft":
            move.arrow_left(cursor, text);
            break;
        case "ArrowRight":
            move.arrow_right(cursor, text);
            break;
        case "Backspace":
            edit.backspace(cursor, text);
            break;
        case "Delete":
            edit.del(cursor, text);
            break;
        case "Enter":
            edit.enter(cursor, text);
            break;
        case "Shift":
            edit.shift_key_down(cursor);
            break;
        case "Control":
            edit.control_key_down(cursor);
            break;
        case "Tab":
            edit.tab_in(cursor, text);
            break;
        default:
            if (cursor.pressing_control) {
                switch (e.key) {
                    case "c":
                        edit.copy(cursor, text);
                        break;
                    case "v":
                        edit.paste(cursor, text);
                        break;
                }
            } else {
                edit.insert(e.key, cursor, text);
            }
            break;
    }
}

function up(e, cursor, text) {
    e.preventDefault();
    switch (e.key) {
        case "Shift":
            edit.shift_key_up(cursor);
            break;
        case "Control":
            edit.control_key_up(cursor);
            break;
    }
}

export default { down, up };
