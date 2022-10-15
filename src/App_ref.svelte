<script>
    import imported_rows from "./test_data.js";
    let rows = [];
    let main;
    let caret;
    let highlighted_row;
    let benchmark;
    let max_text_width = 0;
    let selection = { start: { r: 0, c: 0 }, end: { r: 0, c: 0 }, in_progress: false, rows: [] };
    let cursor = { r: 0, c: 0 };
    let previous_c = 0;
    let pressing_shift = false;
    let pressing_control = false;
    let scrollTop = 0;
    let CHAR_WIDTH = 0;
    const SHIFT_SCROLL_DEFAULT = 3;
    const SHIFT_SCROLL_MULTIPLIER = 5;

    function handle_key_down(e) {
        //console.log("key:", e.key);
        switch (e.key) {
            case "ArrowLeft":
                arrow_left();
                break;
            case "ArrowRight":
                arrow_right();
                break;
            case "Shift":
                shift_key_down();
                break;
            case "Control":
                control_key_down();
                break;
            case "Enter":
                enter();
                break;
            case "Delete":
                del();
                break;
            case "Backspace":
                backspace();
                break;
            default:
                insert(e.key);
                break;
        }
    }
    function handle_key_up(e) {
        //console.log("key:", e.key);
        if (e.key == "Shift") shift_key_up();
        if (e.key == "Control") control_key_up();
    }
    function insert(char) {
        //console.log("insert", char);
        if (!pressing_control && char.length == 1) {
            let { r, c } = cursor;
            let new_rows = [...rows];
            new_rows[r].text = new_rows[r].text.slice(0, c).concat(char, new_rows[r].text.slice(c));
            cursor = { r, c: c + 1 };
            rows = new_rows;
            scroll_up();
            scroll_down();
            //caret_update(r, c);
        }
    }
    function backspace() {
        //console.log("Backspace");
        let { r, c } = cursor;
        let new_rows = [...rows];
        if (c == 0) {
            //console.log("start of line");
            if (r > 0) {
                cursor = { r: r - 1, c: new_rows[r - 1].text.length };
                new_rows[r - 1].text = new_rows[r - 1].text.concat(new_rows[r].text);
                new_rows.splice(r, 1);
            }
        } else if (c == rows[r].text.length) {
            //console.log("eol");
            new_rows[r].text = new_rows[r].text.slice(0, c - 1).concat(new_rows[r].text.slice(c));
            cursor = { r, c: c - 1 };
        } else {
            //console.log("mid line");
            new_rows[r].text = new_rows[r].text.slice(0, c - 1).concat(new_rows[r].text.slice(c));
            cursor = { r, c: c - 1 };
        }
        rows = new_rows;
        scroll_up();
        scroll_down();
        //caret_update(r, c);
    }
    function del() {
        //console.log("Delete");
        let { r, c } = cursor;
        let new_rows = [...rows];
        if (c == 0) {
            //console.log("start of line");
            new_rows[r].text = new_rows[r].text.slice(c + 1);
        } else if (c == rows[r].text.length) {
            //console.log("eol");
            if (new_rows.length > r + 1) {
                new_rows[r].text = new_rows[r].text.concat(new_rows[r + 1].text);
                new_rows.splice(r + 1, 1);
            }
        } else {
            //console.log("mid line");
            new_rows[r].text = new_rows[r].text.slice(0, c).concat(new_rows[r].text.slice(c + 1));
        }
        rows = new_rows;
        scroll_up();
        scroll_down();
        //caret_update(r, c);
    }
    function enter() {
        //console.log("Enter");
        let { r, c } = cursor;
        let new_rows = [...rows];
        if (c == 0) {
            //console.log("start of line");
            new_rows.splice(r, 0, { text: "", w: 0 });
        } else if (c == rows[r].text.length) {
            //console.log("eol");
            new_rows.splice(r + 1, 0, { text: "", w: 0 });
        } else {
            //console.log("mid line");
            let first_half = new_rows[r].text.substring(0, c);
            let second_half = new_rows[r].text.substring(c, new_rows[r].text.length);
            new_rows[r].text = first_half;
            new_rows.splice(r + 1, 0, { text: second_half, w: second_half.length * CHAR_WIDTH });
        }
        cursor = { r: r + 1, c: 0 };
        rows = new_rows;
        scroll_down();
        //caret_update(r, c);
    }
    function shift_key_down() {
        if (!pressing_shift) pressing_shift = true;
    }
    function shift_key_up() {
        pressing_shift = false;
    }
    function control_key_down() {
        if (!pressing_control) pressing_control = true;
    }
    function control_key_up() {
        pressing_control = false;
    }

    function arrow_left() {
        let { r, c } = cursor;
        if (c > 0) {
            c = c - 1;
            cursor = { r, c };
            previous_c = 0;
        } else if (r > 0) {
            r = r - 1;
            c = rows[r].text.length;
            previous_c = 0;
            cursor = { r, c };
        }
        //caret_update(r, c);
    }
    function arrow_right() {
        let { r, c } = cursor;
        if (c < rows[cursor.r].text.length) {
            c = c + 1;
            cursor = { r, c };
            previous_c = 0;
        } else if (r < rows.length - 1) {
            r = r + 1;
            c = 0;
            previous_c = 0;
            cursor = { r, c };
        }
        //caret_update(r, c);
    }
</script>

<!--<svelte:window
  on:keydown|preventDefault={handle_key_down}
  on:keyup|preventDefault={handle_key_up}
  use:wheel={true}
/>-->
<!-- <div class="selection_parent" style={`top: ${-scrollTop}px;`} > -->

<main bind:this={main}>
    <div class="selection_parent">
        <!--<div class="highlighted_row" bind:this={highlighted_row} />-->
    </div>
</main>
