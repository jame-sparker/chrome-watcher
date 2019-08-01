const table = document.getElementById('request-list');
const newButton = document.getElementById("new-button");

newButton.onclick = insertNewInputRow;


ts.onchange = () => {
    let selectType = ts.options[ts.selectedIndex].value;
    let option = document.getElementById("option");

    option.disabled = selectType === "none";
};

confirm.onclick = (event) => {
    let url = document.getElementById("url").value;
    let ts = document.getElementById("type-selector");
    let selectType = ts.options[ts.selectedIndex].value;
    let option = document.getElementById("option").value;

    table.deleteRow(getRowNumber(event.target));


    console.log("sending message");
    // chrome.runtime.sendMessage({
    //     msg: "something_completed",
    //     data: {
    //         url: "Loading",
    //         type: "Just completed!"
    //     }
    // });
};

function insertNewInputRow() {
    let row = `
    <tr>
        <td>
            <input id="url" placeholder="https://youtu.be/kT2Gd4V5rrQ" type="text" name="url">
        </td>
        <td>
            <select id="type-selector">
                <option value="none">None</option>
                <option value="tag">Tag</option>
                <option value="class">Class</option>
                <option value="id">ID</option>
                <option value="regex">Regex</option>
            </select>
        </td>
        <td>
            <input id="option" disabled placeholder="" type="text" name="option">
        </td>
        <td>
            <button id="confirm" class="btn-circle">
                <svg  class="octicon octicon-check" viewBox="0 0 12 16" version="1.1"  aria-hidden="true">
                    <path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path>
                </svg>
            </button>
        </td>
    </tr>`;
    insertNewRow(row);
}

function insertNewDataRow(url, type, option) {
    let row = `
        <tr>
            <td>${url}</td>
            <td>${type}</td>
            <td>${option}</td>
            <td>
                <button class="delete btn-circle">
                    <svg class="octicon octicon-x" viewBox="0 0 12 16" version="1.1" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"></path>
                    </svg>
                </button>
            </td>
        </tr>`;
    insertNewRow(row);
}

function insertNewRow(row) {
    console.log('inserting');
    table.children[0].insertAdjacentHTML('beforeend', row);

}

function getRowNumber(e) {
    let row = e;
    while (row && row.parentElement.parentElement !== table) {
        row = row.parentElement;
    }

    if (!row) return -1;

    for (let i = 0; i < table.rows.length; i++) {
        if (table.rows[i] === row) return i;
    }

    return -1;
}