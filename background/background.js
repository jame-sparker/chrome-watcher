const THIRTY_MINUTES = 1000 * 60 * 30;

let rm = null;

let startUp = () => {
    console.log("start up");
    if (rm === null) {
        rm = new RequestManager((url) => {console.log(`${url} is updated`)}, THIRTY_MINUTES);
    }
};

chrome.runtime.onInstalled.addListener(startUp);
chrome.runtime.onStartup.addListener(startUp);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    startUp();
    if (request.msg === "something_completed") {
        //  To do something
        console.log("received message");
        console.log(request.data.content)
    }
    rm.addTagRequest("https://aumo.jp/articles/24525", "body", 5000);
});
