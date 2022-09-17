<script>
    let rows = [
        "example of really long text on a single line like you might see in a sentence with many words, much like this one. It might even go onto another line, or go on for thousands of characters in the case of a minified file.",
        "text",
        "text",
        "text",
        "example of really long text on a single line like you might see in a sentence with many words, much like this one. It might even go onto another line, or go on for thousands of characters in the case of a minified file.",
        "text",
        "text",
        "text",
        "example of really long text on a single line like you might see in a sentence with many words, much like this one. It might even go onto another line, or go on for thousands of characters in the case of a minified file.",
        "example of really long text on a single line like you might see in a sentence with many words, much like this one. It might even go onto another line, or go on for thousands of characters in the case of a minified file.",
        "text",
        "text",
        "text",
        "example of really long text on a single line like you might see in a sentence with many words, much like this one. It might even go onto another line, or go on for thousands of characters in the case of a minified file.",
        "text",
        "text",
        "text",
        "example of really long text on a single line like you might see in a sentence with many words, much like this one. It might even go onto another line, or go on for thousands of characters in the case of a minified file.",
    ];
    let caret;
    let cursor = { r: 0, c: 0 };
    let previous_updown_c = 0;
    function caret_update(r, c) {
        console.log("click", r, c);
        if (r < rows.length) {
            if (c > rows[r].length - 1) c = rows[r].length;
            cursor = { r, c };
        }
    }
    function handleKeyPress(e) {
        console.log("key:", e.key);
        if (e.key == "ArrowDown") arrowDown();
        if (e.key == "ArrowUp") arrowUp();
        if (e.key == "ArrowLeft") arrowLeft();
        if (e.key == "ArrowRight") arrowRight();
    }
    function arrowDown() {
        let { r, c } = cursor;
        if (r < rows.length - 1) {
            r = r + 1;
            if (c > rows[r].length) {
                previous_updown_c = c;
                c = rows[r].length;
            }
            if (c < previous_updown_c && previous_updown_c <= rows[r].length) c = previous_updown_c;
            cursor = { r, c };
        } else if (c < rows[r].length) {
            cursor = { r, c: rows[r].length };
            previous_updown_c = rows[r].length;
        }
    }
    function arrowUp() {
        let { r, c } = cursor;
        if (r > 0) {
            r = r - 1;
            if (c > rows[r].length) {
                previous_updown_c = c;
                c = rows[r].length;
            }
            if (c < previous_updown_c && previous_updown_c <= rows[r].length) c = previous_updown_c;
            cursor = { r, c };
        } else if (c > 0) {
            cursor = { r, c: 0 };
            previous_updown_c = 0;
        }
    }
    function arrowLeft() {
        let { r, c } = cursor;
        if (c > 0) {
            c = c - 1;
            cursor = { r, c };
            previous_updown_c = 0;
        } else if (r > 0) {
            r = r - 1;
            c = rows[r].length;
            previous_updown_c = 0;
            cursor = { r, c };
        }
    }
    function arrowRight() {
        let { r, c } = cursor;
        if (c < rows[cursor.r].length) {
            c = c + 1;
            cursor = { r, c };
            previous_updown_c = 0;
        } else if (r < rows.length - 1) {
            r = r + 1;
            c = 0;
            previous_updown_c = 0;
            cursor = { r, c };
        }
    }
</script>

<svelte:window on:keydown|preventDefault={handleKeyPress} />

<main>
    test
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
