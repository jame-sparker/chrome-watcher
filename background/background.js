chrome.runtime.onInstalled.addListener(() => {
    // initial setup or updated
    // default setting ?
    console.log("installed");
});

chrome.runtime.onStartup.addListener(() => {
    conosole.log("startup");

    chrome.storage.local.get(['requests'], function(result) {
        let requests = result.variable;

    });
});


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.msg === "something_completed") {
            //  To do something
            console.log("received message");
            console.log(request.data.content)
        }
    }
);
