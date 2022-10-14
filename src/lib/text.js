function init(imported_rows, cursor) {
    let text_div = document.getElementById("text");

    let rows = [];
    imported_rows.forEach((text) => {
        let el = document.createElement("div");
        el.innerHTML = text;
        el.style.width = Math.ceil(cursor.w * text.length) + "px";
        el.style["background-color"] = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
            Math.random() * 255
        }, 0.4)`;
        text_div.append(el);
        let row = {
            el,
        };
        rows.push(row);
    });
    return rows;
}

export default { init };
