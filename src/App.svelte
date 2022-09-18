<script>
    import imported_rows from "./test_data.js";
    let rows = imported_rows;
    let main;
    let caret;
    let cursor = { r: 0, c: 0 };
    let previous_c = 0;
    let pressing_shift = false;
    const SHIFT_SCROLL_DEFAULT = 3;
    const SHIFT_SCROLL_MULTIPLIER = 5;
    function caret_update(r, c) {
        //console.log("click", r, c);
        if (r < rows.length) {
            if (c > rows[r].length - 1) c = rows[r].length;
            cursor = { r, c };
        }
    }
    function handle_key_down(e) {
        console.log("key:", e.key);
        if (e.key == "ArrowDown") arrow_down();
        if (e.key == "ArrowUp") arrow_up();
        if (e.key == "ArrowLeft") arrow_left();
        if (e.key == "ArrowRight") arrow_right();
        if (e.key == "Shift") shift_key_down();
        if (e.key == "Enter") enter();
        if (e.key == "Delete") del();
    }
    function handle_key_up(e) {
        //console.log("key:", e.key);
        if (e.key == "Shift") shift_key_up();
    }
    function del() {
        console.log("Delete");
        let { r, c } = cursor;
        let new_rows = [...rows];
        if (c == 0) {
            console.log("start of line");
            new_rows[r] = new_rows[r].slice(c + 1);
        } else if (c == rows[r].length) {
            console.log("eol");
            if (new_rows.length > r + 1) {
                new_rows[r] = new_rows[r].concat(new_rows[r + 1]);
                new_rows.splice(r + 1, 1);
            }
        } else {
            console.log("mid line");
            new_rows[r] = new_rows[r].slice(0, c).concat(new_rows[r].slice(c + 1));
        }
        rows = new_rows;
        scroll_up();
        scroll_down();
    }
    function enter() {
        console.log("Enter");
        let { r, c } = cursor;
        let new_rows = [...rows];
        if (c == 0) {
            console.log("start of line");
            new_rows.splice(r, 0, "");
        } else if (c == rows[r].length) {
            console.log("eol");
            new_rows.splice(r + 1, 0, "");
        } else {
            console.log("mid line");
            let first_half = new_rows[r].substring(0, c);
            let second_half = new_rows[r].substring(c, new_rows[r].length);
            new_rows[r] = first_half;
            new_rows.splice(r + 1, 0, second_half);
        }
        cursor = { r: r + 1, c: 0 };
        rows = new_rows;
        scroll_down();
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
    function scroll_up(wheel = false) {
        let caret_pos = caret.getBoundingClientRect();
        let main_pos = main.getBoundingClientRect();
        if (!wheel && caret_pos.top < 0) scroll_offscrn_above(caret_pos);
        else if (!wheel && caret_pos.top > main_pos.height) scroll_offscrn_below(caret_pos, main_pos);
        else if (wheel || caret_pos.top < caret_pos.height) scroll_onscrn(caret_pos, wheel);
    }
    function scroll_down(wheel = false) {
        let caret_pos = caret.getBoundingClientRect();
        let main_pos = main.getBoundingClientRect();
        if (!wheel && caret_pos.top < 0) scroll_offscrn_above(caret_pos, true);
        else if (!wheel && caret_pos.top > main_pos.height) scroll_offscrn_below(caret_pos, main_pos, true);
        else if (wheel || caret_pos.top + caret_pos.height > main_pos.height) scroll_onscrn(caret_pos, wheel, true);
    }
    function scroll_onscrn(caret_pos, wheel, down = false) {
        let direction = down ? 1 : -1;
        main.scrollTo(
            0,
            main.scrollTop +
                direction *
                    (caret_pos.height * (wheel ? (pressing_shift ? SHIFT_SCROLL_MULTIPLIER : SHIFT_SCROLL_DEFAULT) : 1))
        );
    }
    function scroll_offscrn_above(caret_pos, down = false) {
        let direction = down ? 1 : -1;
        main.scrollTo(
            0,
            main.scrollTop +
                Math.floor(caret_pos.top / caret_pos.height) * caret_pos.height +
                caret_pos.height * direction
        );
    }
    function scroll_offscrn_below(caret_pos, main_pos, down = false) {
        let direction = down ? 2 : 1;
        main.scrollTo(
            0,
            main.scrollTop +
                Math.floor(caret_pos.top / caret_pos.height) * caret_pos.height +
                caret_pos.height * direction -
                main_pos.height
        );
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
                on:mouseup={(e) => caret_update(r, 100000)}
                >{#each [...row, ""] as char, c}{#if cursor.r == r && cursor.c == c}<i bind:this={caret} />{/if}<b
                        style={"z-index:" + 100 + c}
                        on:mouseup|stopPropagation={(e) => caret_update(r, c)}><u>.</u>{char}</b
                    >{/each}</span
            >
        </div>
    {/each}
</main>
