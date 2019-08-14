const THIRTY_MINUTES = 1000 * 60 * 30;

let rm = null;
let bm = null;
let time = null;

let startUp = () => {
    if (rm === null) {
        bm = new BadgeManager();
        rm = new RequestManager(url => bm.notifyUpdate(url), THIRTY_MINUTES);
    }

};

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({updatedUrls: {}}, startUp);

});
chrome.runtime.onStartup.addListener(startUp);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    startUp();
    if (request.msg === "request-received") {
        let data = request.data;
        let settings = [data.type, data.option];
        rm.addRequest(data.type, data.url, data.option, THIRTY_MINUTES, settings);

    } else if (request.msg === "delete") {
        let url = request.data.url;
        console.log('deleting url', url);
        rm.removeRequest(url);
        bm.updateChecked(url);
    } else if (request.msg === "checked") {
        let url = request.data.url;
        console.log('checked:', url);
        bm.updateChecked(url);
    }
    console.log(request.msg);
});
