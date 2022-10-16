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
        default:
            //insert(e.key);
            break;
    }
}

export default { down };
