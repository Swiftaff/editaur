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
            case "Shift":
                shift_key_down();
                break;
            case "Control":
                control_key_down();
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
