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

<main class="container">
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

<style>
    main {
        border: 1px solid 666;
        background-color: #eee;
        min-height: calc(100vh - 80px);
        padding: 5px;
    }
    div {
        user-select: none;
        cursor: text;
        position: relative;
        padding: 0px;
        margin: 0px;
        min-height: 1.5rem;
    }
    div:hover {
        background-color: #ddd;
    }
    /* a character with a dot to the left for overlapping with adjacent-left character for ease of selection */
    b {
        font-weight: normal;
        margin-left: -0.25em;
        position: relative;
        padding-top: 0.25rem;
        padding-bottom: 0.25rem;
    }
    /* just the dot character inside the b above */
    u {
        opacity: 0;
    }
    /* flashing caret */
    i {
        font-weight: bold;
        font-style: normal;
        position: absolute;
        margin-top: 0.02rem;
        height: 1.5rem;
        margin-left: -0.05rem;
        width: 3px;
        background-color: green;
        animation: flash 1s linear infinite;
        z-index: 2000;
    }
    @keyframes flash {
        0%,
        50% {
            opacity: 1;
        }
        51%,
        100% {
            opacity: 0;
        }
    }
    .text {
        display: inline-block;
        /* todo fix hard-coded width with flexbox layout? */
        width: calc(100% - 150px);
        margin-left: 100px;
        position: relative;
        top: 0px;
    }
    .num {
        display: inline-block;
        position: absolute;
        top: 0px;
    }
</style>
