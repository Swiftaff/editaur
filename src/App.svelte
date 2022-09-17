<script>
    import Greet from "./lib/Greet.svelte";
    let rows = ["example", "text"];
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
    <h1>Tauri Svelte Editor</h1>

    {#each rows as row, r}
        <div on:mouseup={(e) => caret(r, 100000)}>
            <span on:mouseup|stopPropagation={(e) => caret(r, 0)}
                >{r}:
            </span>{#each [...row, ""] as char, c}{#if cursor.r == r && cursor.c == c}<i>.</i>{/if}<b
                    style={"z-index:" + 100 + c}
                    on:mouseup|stopPropagation={(e) => caret(r, c)}><u>.</u>{char}</b
                >{/each}
        </div>
    {/each}
    {JSON.stringify(rows)}
    {JSON.stringify(cursor)}
    <ul>
        <li>rows of divs of characters = better text display, caret position selection and display</li>
    </ul>
</main>

<style>
    div {
        user-select: none;
        cursor: text;
    }
    div:hover {
        background-color: #ddd;
    }
    /* a character with a dot to the left for overlapping with adjacent-left character for ease of selection */
    b {
        font-weight: normal;
        margin-left: -0.25em;
        position: relative;
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
        margin-top: 2px;
        height: 1.3rem;
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
</style>
