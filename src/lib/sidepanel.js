import { readDir, readTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { open } from "@tauri-apps/api/dialog";

async function init(cursor) {
    let obj = {
        el: document.getElementById("sidepanel"),
        path_el: document.getElementById("path"),
        projects_el: document.getElementById("projects"),
        projects_button_el: document.getElementById("projects_button"),
        get_new_sidepanel_row(entry, parent, insert_after_this_el) {
            let el;
            let is_dir = "children" in entry;
            if (is_dir) el = document.createElement("ul");
            else el = document.createElement("li");
            el.textContent = entry.name;
            el.setAttribute("data-type", is_dir ? "dir" : "file");
            el.setAttribute("data-parent", parent);
            el.setAttribute("data-name", entry.name);
            if (is_dir) el.setAttribute("data-expanded", "false");
            el.onmousedown = (e) => this.select_file(e, el);
            insert_after_this_el.append(el);
        },
        async refresh_listing(dir) {
            let rows = [...this.el.querySelectorAll("ul"), ...this.el.querySelectorAll("li")];
            rows.forEach((element) => {
                element.remove();
            });
            cursor.directory = dir;
            let entries = await this.get_files(dir);
            for (const entry of entries) {
                this.get_new_sidepanel_row(entry, cursor.directory, this.el);
            }
            this.path_el.textContent = "/" + dir;
        },
        async get_files(dir) {
            if (dir.length && dir[0] === "/") dir = dir.slice(1);
            return await readDir(dir, { dir: BaseDirectory.Desktop, recursive: false });
        },
        async projects_toggle(e) {
            console.log("projects_toggle", e);
            if (this.projects_el.className === "") {
                this.projects_el.className = "expanded";
            } else {
                this.projects_el.removeAttribute("class");
            }
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
            let rows = [...this.el.querySelectorAll("ul"), ...this.el.querySelectorAll("li")];
            rows.forEach((element) => {
                element.removeAttribute("class");
            });
            el.className = "selected";
        },
        async select_file(e, el) {
            e.stopPropagation();
            if (e.button === 0) {
                let is_dir = el.getAttribute("data-type") === "dir";
                let parent = el.getAttribute("data-parent");
                if (parent.length && parent[0] === "/") parent = parent.slice(1);
                if (is_dir) {
                    let dir = el.getAttribute("data-name");
                    cursor.directory = parent + "/" + dir;
                    let expanded = el.getAttribute("data-expanded");
                    if (expanded === "true") {
                        el.setAttribute("data-expanded", "false");
                        let children = [...document.querySelectorAll(`[data-parent='${parent}/${dir}']`)];
                        children.forEach((child) => child.remove());
                    } else {
                        el.setAttribute("data-expanded", "true");
                        this.select_el(el);
                        let entries = await this.get_files(parent + "/" + dir);
                        for (const entry of entries.reverse()) {
                            this.get_new_sidepanel_row(entry, parent + "/" + dir, el);
                        }
                    }
                    //console.log("dir", parent + "/" + dir, el);
                } else {
                    let filename = el.getAttribute("data-name");
                    const contents = await readTextFile(parent + "/" + filename, {
                        dir: BaseDirectory.Desktop,
                    });
                    cursor.refresh_from_text(contents);
                    this.select_el(el);
                    cursor.file = filename;
                    cursor.directory = parent;
                    cursor.tabs.update_first_tab_name(filename);
                    //console.log("select file", cursor.directory, filename, contents);
                }
            }
        },
    };

    obj.path_el.onmousedown = async (e) => await obj.select_directory(e);
    obj.projects_button_el.onmousedown = async (e) => await obj.projects_toggle(e);
    await obj.refresh_listing("");
    return obj;
}

export default { init };
