import move from "./move.js";
import edit from "./edit.js";

function down(e, cursor, text) {
    e.preventDefault();
    let key_combination = e.key.toLowerCase();
    //console.log(key_combination);
    if (cursor.pressing_shift && "shift_" + key_combination in down_functions) {
        down_functions["shift_" + key_combination](cursor, text);
    } else if (cursor.pressing_control && "control_" + key_combination in down_functions) {
        down_functions["control_" + key_combination](cursor, text);
    } else if (key_combination in down_functions) {
        down_functions[key_combination](cursor, text);
    } else {
        edit.insert(e.key, cursor, text);
    }
    //}
}
const noop = () => {};

const down_functions = {
    shift: edit.shift_key_down,
    control: edit.control_key_down,
    capslock: noop,
    //
    control_a: edit.select_all,
    control_v: edit.paste,
    control_c: edit.copy,
    control_x: edit.cut,
    control_tab: edit.tab_in,
    //
    shift_tab: edit.tab_out,
    //
    arrowdown: move.arrow_down,
    arrowup: move.arrow_up,
    arrowleft: move.arrow_left,
    arrowright: move.arrow_right,
    backspace: edit.backspace,
    delete: edit.del,
    enter: edit.enter,
    tab: edit.tab_in,
};

function up(e, cursor, text) {
    e.preventDefault();
    let key_combination = e.key.toLowerCase();
    if (key_combination in up_functions) {
        up_functions[key_combination](cursor);
    }
}

const up_functions = {
    shift: edit.shift_key_up,
    control: edit.control_key_up,
};

export default { down, up };
