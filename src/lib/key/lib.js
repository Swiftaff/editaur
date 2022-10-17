import move from "./move.js";
import edit from "./edit.js";

async function down(e, cursor, text) {
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
        default:
            if (cursor.pressing_control) {
                switch (e.key) {
                    case "v":
                        let clip = await navigator.clipboard.readText();
                        let split = clip.split("\r\n");
                        if (split.length > 1) {
                            split.forEach((new_row, i) => {
                                edit.insert(new_row, cursor, text);
                                if (i < split.length - 1) {
                                    edit.enter(cursor, text);
                                }
                            });
                        } else {
                            edit.insert(clip, cursor, text);
                        }
                        console.log("paste", split, text);

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
