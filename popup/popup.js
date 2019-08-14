import htmldiff from '../external/htmldiff.min.js'

const table = document.getElementById('request-list');
const newButton = document.getElementById("new-button");

newButton.onclick = insertNewInputRow;

window.onload = () => {
    console.log('records');
    chrome.storage.local.get('updatedUrls', (value) => {
        let updatedUrls = value.updatedUrls || {};
        console.log('current updates: ', updatedUrls);
        chrome.storage.local.get('htmlRecords', (value) => {
            let records = value.htmlRecords || {};
            console.log(records);

            Object.keys(records).forEach(url => {
                let [oldHtml, newHtml, interval, settings] = records[url];
                console.log(records[url]);
                let [type, option] = settings;
                let isHighlight = url in updatedUrls;
                insertNewDataRow(url, type, option, isHighlight);
            });
        });
    });

    console.log(document.getElementById("options"));
    document.getElementById("options").onclick = (e) => {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
    }
};

function onSelectChange(e) {
    console.log("selected");
    let ts = e.target;
    let selectedType = ts.options[ts.selectedIndex].value;
    console.log(selectedType);

    let rowElements = ts.parentNode.parentNode.children;
    let option = rowElements[2].children[0];
    option.disabled = selectedType === "None";
}

function confirm(event) {
    let confirmButton = event.target;
    while(confirmButton && confirmButton.tagName !== "BUTTON") {
        confirmButton = confirmButton.parentNode;
    }
    let rowElems = confirmButton.parentNode.parentNode.children;

    let url = rowElems[0].children[0].value;
    let ts = rowElems[1].children[0]; // type selector
    let selectedType = ts.options[ts.selectedIndex].value;
    let option = rowElems[2].children[0].value || "";

    table.deleteRow(getRowNumber(confirmButton));
    insertNewDataRow(url, selectedType, option);


    chrome.runtime.sendMessage({
        msg: "request-received",
        data: {
            url: url,
            type: selectedType,
            option: option,
        }
    });
}

function deleteRequest(e) {
    // get url and send delete request to background
    let row = e.target;
    while (row && row.parentElement.parentElement !== table) {
        row = row.parentElement;
    }
    let url = row.children[0].children[1].innerHTML;

    chrome.runtime.sendMessage({
        msg: "delete",
        data: {
            url: url
        }
    });

    table.deleteRow(getRowNumber(e.target));
}

function checkRequest(url) {
    console.log("checked");
    // get url and send delete request to background
    chrome.runtime.sendMessage({
        msg: "checked",
        data: {
            url: url
        }
    });
    return false;
}

function insertNewInputRow() {
    let row = `
    <tr>
        <td>
            <input placeholder="https://youtu.be/kT2Gd4V5rrQ" type="text" name="url">
        </td>
        <td>
            <select>
                <option value="None">None</option>
                <option value="Tag">Tag</option>
                <option value="Class">Class</option>
                <option value="Id">ID</option>
                <option value="Regex">Regex</option>
            </select>
        </td>
        <td>
            <input class disabled placeholder="" type="text" name="option">
        </td>
        <td>
            <button class="confirm btn-circle">
                <svg  class="octicon octicon-check" viewBox="0 0 12 16" version="1.1"  aria-hidden="true">
                    <path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path>
                </svg>
            </button>
        </td>
    </tr>`;
    insertNewRow(row);

    let classes = document.getElementsByClassName("confirm");
    Array.from(classes).forEach((e) =>{
        e.onclick = confirm;
    });

    let dropdowns = document.getElementsByTagName('select');
    Array.from(dropdowns).forEach((e) =>{
        console.log(e);
        e.onchange = onSelectChange;
    });

}

function insertNewDataRow(url, type, option, isHighlight) {

    let arrow = '';
    if (isHighlight) {
        arrow = `
            <svg class="arrow" viewBox="0 0 8 16" version="1.1" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.5 8l-5 5L1 11.5 4.75 8 1 4.5 2.5 3l5 5z"></path>
            </svg>
        `
    }

    let row = `
        <tr>
            <td>${arrow}<a href="${url}" target="_blank">${url}</a></td>
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

    let classes = document.getElementsByClassName("delete");
    Array.from(classes).forEach((e) =>{
        e.onclick = deleteRequest;
    });

    let anchors = document.getElementsByTagName("a");

    for (let i = 0; i < anchors.length ; i++) {
        if (anchors[i].innerHTML === "Options") continue;
        anchors[i].onclick = (event) => {
            let url = anchors[i].innerHTML;
            event.preventDefault();
            checkRequest(url);
            let win = window.open(url, '_blank');
            win.focus();
        };
    }

}

function insertNewRow(row) {
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