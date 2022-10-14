function get_fifty_rows() {
    const imported_rows = [];
    for (let index = 0; index < 52; index++) {
        imported_rows.push("abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz".slice(0, index + 1));
    }
    return imported_rows;
}

function cursor_move_right(cursor, interval) {
    let c = 0;
    setInterval(() => {
        c++;
        cursor.update(0, c);
    }, interval);
}

export default { get_fifty_rows, cursor_move_right };
