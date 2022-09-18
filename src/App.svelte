<script>
    import rows from "./test_data.js";
    let main;
    let caret;
    let cursor = { r: 0, c: 0 };
    let previous_c = 0;
    let pressing_shift = false;
    const SHIFT_SCROLL_MULTIPLIER = 5;
    function caret_update(r, c) {
        //console.log("click", r, c);
        if (r < rows.length) {
            if (c > rows[r].length - 1) c = rows[r].length;
            cursor = { r, c };
        }
    }
    function handle_key_down(e) {
        //console.log("key:", e.key);
        if (e.key == "ArrowDown") arrow_down();
        if (e.key == "ArrowUp") arrow_up();
        if (e.key == "ArrowLeft") arrow_left();
        if (e.key == "ArrowRight") arrow_right();
        if (e.key == "Shift") shift_key_down();
    }
    function handle_key_up(e) {
        //console.log("key:", e.key);
        if (e.key == "Shift") shift_key_up();
    }
    function shift_key_down() {
        if (!pressing_shift) pressing_shift = true;
    }
    function shift_key_up() {
        pressing_shift = false;
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
    function scroll_up(override = false) {
        let caret_position = caret.getBoundingClientRect();
        console.log("scroll_up", caret_position, main.scrollTop);
        if (caret_position.top < 0) {
            console.log("TODO - mange scrolling when caret is offscreen");
        }
        if (override || caret_position.top < caret_position.height) {
            main.scrollTo(
                0,
                main.scrollTop - caret_position.height * (override && pressing_shift ? SHIFT_SCROLL_MULTIPLIER : 1)
            );
        }
    }
    function scroll_down(override = false) {
        let caret_position = caret.getBoundingClientRect();
        let main_position = main.getBoundingClientRect();
        console.log("scroll_down", caret_position, main.scrollTop, main_position);
        if (caret_position.top < 0) {
            console.log("TODO - mange scrolling when caret is offscreen");
        }
        if (override || caret_position.top + caret_position.height > main_position.height) {
            main.scrollTo(
                0,
                main.scrollTop + caret_position.height * (override && pressing_shift ? SHIFT_SCROLL_MULTIPLIER : 1)
            );
        }
    }
    function wheel(node, _options) {
        const handler = (e) => {
            e.preventDefault();
            if (e.deltaY < 0) scroll_up(true);
            else scroll_down(true);
        };

        node.addEventListener("wheel", handler, { passive: false });

        return {
            destroy() {
                node.removeEventListener("wheel", handler, { passive: false });
            },
        };
    }
</script>

<svelte:window on:keydown|preventDefault={handle_key_down} on:keyup|preventDefault={handle_key_up} use:wheel={true} />

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
