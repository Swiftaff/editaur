<script>
    import Greet from "./lib/Greet.svelte";
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
    let cursor = { r: 0, c: 0 };
    function caret(r, c) {
        console.log("click", r, c);
        if (r < rows.length) {
            if (c > rows[r].length - 1) c = rows[r].length;
            cursor = { r, c };
        }
    }
    function handleKeyPress(e) {
        console.log(e.key);
    }
</script>

<main class="container" on:keypress={handleKeyPress}>
    {#each rows as row, r}
        <div on:mouseup={(e) => caret(r, 100000)}>
            <span class="num" on:mouseup|stopPropagation={(e) => caret(r, 0)}>{1000 + r}: </span><span class="text"
                >{#each [...row, ""] as char, c}{#if cursor.r == r && cursor.c == c}<i />{/if}<b
                        style={"z-index:" + 100 + c}
                        on:mouseup|stopPropagation={(e) => caret(r, c)}><u>.</u>{char}</b
                    >{/each}</span
            >
        </div>
    {/each}
</main>

<style>
    main {
        border: 1px solid 666;
        background-color: #eee;
        height: calc(100vh - 80px);
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
