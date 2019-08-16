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
                let isDiffAllowed = oldHtml !== undefined && oldHtml !== null;
                insertNewDataRow(url, type, option, isHighlight, isDiffAllowed);
            });
        });
    });

    console.log(document.getElementById("options"));
    document.getElementById("options").onclick = (e) => {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
    }
};

function onDropdownSelect(e) {
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
    insertNewDataRow(url, selectedType, option, false, false);


    chrome.runtime.sendMessage({
        msg: "request-received",
        data: {
            url: url,
            type: selectedType,
            option: option,
        }
    });
}

function getRowUrlFromEvent(e) {
    let row = e.target;
    while (row && row.parentElement.parentElement !== table) {
        row = row.parentElement;
    }
    let linkCell = row.children[0].children;
    return linkCell[linkCell.length - 1].innerHTML;
}

function isButtonDisabled(e) {
    let element = e.target;
    while (element && element.tagName !== 'BUTTON') {
        element = element.parentElement;
    }
    return element.classList.contains('disabled');
}

function deleteRequest(e) {
    let url = getRowUrlFromEvent(e);

    chrome.runtime.sendMessage({
        msg: "delete",
        data: {
            url: url
        }
    });

    table.deleteRow(getRowNumber(e.target));
}

function diffRequest(e) {
    if (isButtonDisabled(e)) return;
    let url = getRowUrlFromEvent(e);

    chrome.storage.local.set({diffUrl: url}, () => {
        let win = window.open('diff.html', '_blank');
        win.focus();
    });
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
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, (tabs) => {
        let url = tabs[0].url;
        if(!url.startsWith('http')) {
            url = '';
        }

        let row = `
        <tr>
            <td>
                <input placeholder="https://youtu.be/kT2Gd4V5rrQ" value="${url}" type="text" name="url">
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
            e.onchange = onDropdownSelect;
        });


    });

}

function insertNewDataRow(url, type, option, isHighlight, isDiffAllowed) {

    let arrow = '';
    if (isHighlight) {
        arrow = `
            <svg class="arrow" viewBox="0 0 8 16" version="1.1" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.5 8l-5 5L1 11.5 4.75 8 1 4.5 2.5 3l5 5z"></path>
            </svg>
        `
    }

    let diffDisabled = isDiffAllowed ? '' : 'disabled';

    let row = `
        <tr>
            <td>${arrow}<a href="${url}" target="_blank">${url}</a></td>
            <td>${type}</td>
            <td>${option}</td>
            <td>
                <button class="diff btn-circle ${diffDisabled}">
                    <svg class="octicon octicon-git-compare" viewBox="0 0 14 16" version="1.1" aria-hidden="true">
                        <path fill-rule="evenodd" d="M5 12H4c-.27-.02-.48-.11-.69-.31-.21-.2-.3-.42-.31-.69V4.72A1.993 1.993 0 0 0 2 1a1.993 1.993 0 0 0-1 3.72V11c.03.78.34 1.47.94 2.06.6.59 1.28.91 2.06.94h1v2l3-3-3-3v2zM2 1.8c.66 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2C1.35 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2zm11 9.48V5c-.03-.78-.34-1.47-.94-2.06-.6-.59-1.28-.91-2.06-.94H9V0L6 3l3 3V4h1c.27.02.48.11.69.31.21.2.3.42.31.69v6.28A1.993 1.993 0 0 0 12 15a1.993 1.993 0 0 0 1-3.72zm-1 2.92c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z"></path>
                    </svg>
                </button>
            </td>
            <td>
                <button class="delete btn-circle">
                    <svg class="octicon octicon-x" viewBox="0 0 12 16" version="1.1" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"></path>
                    </svg>
                </button>
            </td>
        </tr>`;
    insertNewRow(row);

    /*Delete buttons*/
    let deleteButtons = document.getElementsByClassName("delete");
    Array.from(deleteButtons).forEach((e) =>{
        e.onclick = deleteRequest;
    });

    /*Diff buttons*/
    let diffButtons = document.getElementsByClassName("diff");
    Array.from(diffButtons).forEach((e) =>{
        e.onclick = diffRequest;
    });

    /*links*/
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

/*Get row number from an event e*/
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