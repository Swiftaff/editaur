import { readDir, readTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { open } from "@tauri-apps/api/dialog";

async function init(text) {
    let obj = {
        el: document.getElementById("sidepanel"),
        path_el: document.getElementById("path"),
        rows: [],
        dir: "",
        get_new_row(entry) {
            let el = document.createElement("div");
            el.textContent = ("children" in entry ? "> " : "- ") + entry.name;
            el.onmousedown = (e) => this.select_file(e, entry.name, el);
            this.el.append(el);
            this.rows.push(el);
        },
        async refresh_listing(dir) {
            this.dir = dir;
            this.remove_rows();
            let entries = await this.get_files(dir);
            for (const entry of entries) {
                this.get_new_row(entry);
            }
            this.path_el.textContent = "\\" + dir;
        },
        remove_rows() {
            for (const row of this.rows) {
                row.remove();
            }
            this.rows = [];
        },
        async get_files(dir) {
            return await readDir(dir, { dir: BaseDirectory.Desktop, recursive: false });
        },
        async select_directory(e) {
            if (e && "button" in e && e.button === 0) {
                const selected = await open({
                    directory: true,
                    defaultPath: "" + BaseDirectory.Desktop,
                });
                if (Array.isArray(selected)) {
                    //multiple selected
                } else if (selected === null) {
                    // user cancelled the selection
                } else {
                    // user selected a single file
                    let split = selected.split("Desktop\\");
                    if (split.length) {
                        let path = split[1];
                        await this.refresh_listing(path || "");
                    }
                }
            }
        },
        select_el(el) {
            this.rows.forEach((element) => {
                element.removeAttribute("class");
            });
            el.className = "selected";
        },
        async select_file(e, filename, el) {
            const contents = await readTextFile(this.dir + "\\" + filename, { dir: BaseDirectory.Desktop });
            text.refresh_from_text(contents);
            this.select_el(el);
            console.log("select file", this.dir, filename, contents);
        },
    };

    obj.path_el.onmousedown = (e) => obj.select_directory(e);
    await obj.refresh_listing("editaur_test");
    return obj;
}

export default { init };
