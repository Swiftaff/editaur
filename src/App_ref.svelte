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
            case "Control":
                control_key_down();
                break;
        }
    }
    function handle_key_up(e) {
        //console.log("key:", e.key);
        if (e.key == "Control") control_key_up();
    }
    function control_key_down() {
        if (!pressing_control) pressing_control = true;
    }
    function control_key_up() {
        pressing_control = false;
    }
</script>

<!--<svelte:window
  use:wheel={true}
/>-->
