function init(imported_rows, cursor) {
    let text_div = document.getElementById("text");

    let rows = [];
    imported_rows.forEach((text) => {
        let el = document.createElement("div");
        el.innerHTML = text;
        el.style.width = Math.ceil(cursor.w * text.length) + "px";
        el.style["background-color"] = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
            Math.random() * 255
        }, 0.2)`;

        let select = document.createElement("div");
        select.style.cssText = `z-index: -1; position: absolute; background-color:pink; top: 0px; left: 0px; width: 0px; height: ${cursor.h}px;`;
        el.append(select);

        text_div.append(el);
        let row = {
            el,
            select,
        };
        rows.push(row);
    });
    return rows;
}

export default { init };
