<script>
    import Greet from "./lib/Greet.svelte";
    let rows = ["example", "text"];
    let cursor = { row: 0, col: 7 };
    function handleKeyPress(e) {
        console.log(e.key);
    }
</script>

<main class="container">
    <h1>Tauri Svelte Editor</h1>

    {#each rows as row}
        <input bind:value={row} on:keypress={handleKeyPress} />
    {/each}
    {JSON.stringify(rows)}
    {JSON.stringify(cursor)}
    <ul>
        <li>separate lines of text as inputs - can't easily move up and down without createRange / setStart</li>
    </ul>
</main>

<style>
    .logo.vite:hover {
        filter: drop-shadow(0 0 2em #747bff);
    }

    .logo.svelte:hover {
        filter: drop-shadow(0 0 2em #ff3e00);
    }
</style>
