import { readDir, readTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { open } from "@tauri-apps/api/dialog";

async function init(text, cursor) {
    let obj = {
        el: document.getElementById("sidepanel"),
        path_el: document.getElementById("path"),
        get_new_row(entry, parent, insert_after_this_el) {
            let el = document.createElement("div");
            let is_dir = "children" in entry;
            el.textContent = entry.name;
            el.setAttribute("data-type", is_dir ? "dir" : "file");
            el.setAttribute("data-parent", parent);
            if (is_dir) el.setAttribute("data-expanded", "false");
            el.onmousedown = (e) => this.select_file(e, el);
            if (insert_after_this_el) {
                insert_after_this_el.after(el);
            } else {
                this.el.append(el);
            }
        },
        async refresh_listing(dir) {
            cursor.directory = dir;
            let entries = await this.get_files(dir);
            for (const entry of entries) {
                this.get_new_row(entry, cursor.directory);
            }
            this.path_el.textContent = "/" + dir;
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
                    let split = selected.split("Desktop/");
                    if (split.length) {
                        let path = split[1];
                        await this.refresh_listing(path || "");
                    }
                }
            }
        },
        select_el(el) {
            let rows = [...this.el.querySelectorAll("div")];
            rows.forEach((element) => {
                element.removeAttribute("class");
            });
            el.className = "selected";
        },
        async select_file(e, el) {
            let is_dir = el.getAttribute("data-type") === "dir";
            let parent = el.getAttribute("data-parent");
            if (is_dir) {
                let dir = el.textContent;
                cursor.directory = parent + "/" + dir;
                let expanded = el.getAttribute("data-expanded");
                if (expanded === "true") {
                    el.setAttribute("data-expanded", "false");
                    let children = [...document.querySelectorAll(`div[data-parent='${parent}/${dir}']`)];
                    children.forEach((child) => child.remove());
                } else {
                    el.setAttribute("data-expanded", "true");
                    this.select_el(el);
                    let entries = await this.get_files(parent + "/" + dir);
                    for (const entry of entries.reverse()) {
                        this.get_new_row(entry, parent + "/" + dir, el);
                    }
                }
                //console.log("dir", parent + "/" + dir, el);
            } else {
                let filename = el.textContent;
                const contents = await readTextFile(parent + "/" + filename, {
                    dir: BaseDirectory.Desktop,
                });
                text.refresh_from_text(contents, cursor);
                this.select_el(el);
                cursor.file = filename;
                cursor.directory = parent;
                //console.log("select file", cursor.directory, filename, contents);
            }
        },
    };

    obj.path_el.onmousedown = (e) => obj.select_directory(e);
    await obj.refresh_listing("editaur_test");
    return obj;
}

export default { init };
