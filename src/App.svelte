<script>
    import rows from "./test_data.js";
    let main;
    let caret;
    let cursor = { r: 0, c: 0 };
    let previous_c = 0;
    function caret_update(r, c) {
        //console.log("click", r, c);
        if (r < rows.length) {
            if (c > rows[r].length - 1) c = rows[r].length;
            cursor = { r, c };
        }
    }
    function handleKeyPress(e) {
        //console.log("key:", e.key);
        if (e.key == "ArrowDown") arrow_down();
        if (e.key == "ArrowUp") arrow_up();
        if (e.key == "ArrowLeft") arrow_left();
        if (e.key == "ArrowRight") arrow_right();
    }
    function arrow_down() {
        let { r, c } = cursor;
        scroll_down();
        if (r < rows.length - 1) {
            r = r + 1;
            c = move_caret_to_eol_if_shorter_than_previous(r, c);
            c = move_caret_back_to_previous_if_line_is_long_enough(r, c);
        } else {
            c = move_caret_to_end_and_reset_previous_if_moving_down_from_within_bottom_line(r, c);
        }
        cursor = { r, c };
    }
    function arrow_up() {
        let { r, c } = cursor;
        scroll_up();
        if (r > 0) {
            r = r - 1;
            c = move_caret_to_eol_if_shorter_than_previous(r, c);
            c = move_caret_back_to_previous_if_line_is_long_enough(r, c);
        } else {
            c = move_caret_to_start_and_reset_previous_if_moving_up_from_within_top_line(r, c);
        }
        cursor = { r, c };
    }
    function move_caret_to_eol_if_shorter_than_previous(r, c) {
        if (c > rows[r].length) {
            previous_c = c;
            c = rows[r].length;
        }
        return c;
    }
    function move_caret_back_to_previous_if_line_is_long_enough(r, c) {
        if (c < previous_c && previous_c <= rows[r].length) c = previous_c;
        return c;
    }
    function move_caret_to_start_and_reset_previous_if_moving_up_from_within_top_line(r, c) {
        if (c > 0) {
            c = 0;
            previous_c = 0;
        }
        return c;
    }
    function move_caret_to_end_and_reset_previous_if_moving_down_from_within_bottom_line(r, c) {
        if (c < rows[r].length) {
            c = rows[r].length;
            previous_c = rows[r].length;
        }
        return c;
    }
    function arrow_left() {
        let { r, c } = cursor;
        if (c > 0) {
            c = c - 1;
            cursor = { r, c };
            previous_c = 0;
        } else if (r > 0) {
            r = r - 1;
            c = rows[r].length;
            previous_c = 0;
            cursor = { r, c };
        }
    }
    function arrow_right() {
        let { r, c } = cursor;
        if (c < rows[cursor.r].length) {
            c = c + 1;
            cursor = { r, c };
            previous_c = 0;
        } else if (r < rows.length - 1) {
            r = r + 1;
            c = 0;
            previous_c = 0;
            cursor = { r, c };
        }
    }
    function scroll_up() {
        let caret_position = caret.getBoundingClientRect();
        if (caret_position.top < caret_position.height) {
            main.scrollTo(0, main.scrollTop - caret_position.height);
        }
    }
    function scroll_down() {
        let caret_position = caret.getBoundingClientRect();
        let main_position = main.getBoundingClientRect();
        if (caret_position.top + caret_position.height > main_position.height) {
            main.scrollTo(0, main.scrollTop + caret_position.height);
        }
    }
</script>

<svelte:window on:keydown|preventDefault={handleKeyPress} />

<main bind:this={main}>
    {#each rows as row, r}
        <div on:mouseup={(e) => caret_update(r, 100000)} class={r == cursor.r ? "highlighted" : ""}>
            <span class="num" on:mouseup|stopPropagation={(e) => caret_update(r, 0)}>{1000 + r}: </span><span
                class="text"
                >{#each [...row, ""] as char, c}{#if cursor.r == r && cursor.c == c}<i bind:this={caret} />{/if}<b
                        style={"z-index:" + 100 + c}
                        on:mouseup|stopPropagation={(e) => caret_update(r, c)}><u>.</u>{char}</b
                    >{/each}</span
            >
        </div>
    {/each}
</main>
