let container = document.getElementById('container');

chrome.storage.local.get('diffUrl', (value) => {
    let url = value.diffUrl;

    document.title = `Diff of ${url}`;

    chrome.storage.local.get('htmlRecords', (value) => {
        let updatedUrls = value.htmlRecords;
        console.log(updatedUrls);
        let [oldHtml, newHtml, interval, settings] = updatedUrls[url];
        container.innerHTML = htmldiff(oldHtml, oldHtml);
    });
});

