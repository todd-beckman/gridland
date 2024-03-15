let GRID_ROWS = 20;
let GRID_COLS = 10;

function cellID(row, col) {
    return row + "," + col;
}

let Game = {
    init: function () {
        console.log("init called");
        let outerContainer = document.getElementById("body");

        let table = document.createElement("table");
        table.classList.add("grid__table");
        outerContainer.appendChild(table);

        for (let row = 0; row < GRID_ROWS; row++) {
            let tr = document.createElement("tr");
            tr.classList.add("grid__row");
            table.appendChild(tr);

            for (let col = 0; col < GRID_COLS; col++) {
                let td = document.createElement("td");
                let id = cellID(row, col);
                td.id = id
                td.classList.add("grid__cell-container");
                // td.appendChild(document.createTextNode(id));
                tr.appendChild(td);
            }
        }
        console.log("init done");
    }
}