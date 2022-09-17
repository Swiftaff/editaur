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
    let previous_down_c = 0;
    let previous_up_c = 0;
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
    }
    function arrowDown() {
        let { r, c } = cursor;
        if (cursor.r < rows.length - 1) {
            r = cursor.r + 1;
            previous_up_c = 0;
            if (c > rows[r].length) {
                previous_down_c = c;
                c = rows[r].length;
            }
            if (c < previous_down_c && previous_down_c <= rows[r].length) c = previous_down_c;
            console.log("down", cursor, { r, c }, previous_down_c);
            cursor = { r, c };
        }
    }
    function arrowUp() {
        let { r, c } = cursor;
        if (cursor.r > 0) {
            r = cursor.r - 1;
            previous_down_c = 0;
            if (c > rows[r].length) {
                previous_up_c = c;
                c = rows[r].length;
            }
            if (c < previous_up_c && previous_up_c <= rows[r].length) c = previous_up_c;
            console.log("down", cursor, { r, c }, previous_up_c);
            cursor = { r, c };
        }
    }
</script>

<svelte:window on:keydown|preventDefault={handleKeyPress} />

<main>
    test
    {#each rows as row, r}
        <div on:mouseup={(e) => caret_update(r, 100000)}>
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
