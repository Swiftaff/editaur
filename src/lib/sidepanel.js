import { readDir, BaseDirectory } from "@tauri-apps/api/fs";

async function init() {
    let obj = {
        el: document.getElementById("sidepanel"),
        rows: [],
        get_new_row(entry) {
            let el = document.createElement("div");
            el.textContent = ("children" in entry ? "> " : "- ") + entry.name;
            this.el.append(el);
            this.rows.push(el);
        },
        async refresh_listing(dir) {
            this.rows = [];
            let entries = await this.get_files(dir);
            for (const entry of entries) {
                this.get_new_row(entry);
            }
        },
        async get_files(dir) {
            return await readDir(dir, { dir: BaseDirectory.Desktop, recursive: false });
        },
    };
    await obj.refresh_listing("pics");
    return obj;
}

export default { init };
