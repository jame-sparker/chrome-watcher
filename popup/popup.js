console.log("popup js loaded");

let submit = document.getElementById('submit');
console.log("setting onclick");

submit.onclick = (element) => {
    console.log("sending message");
    chrome.runtime.sendMessage({
        msg: "something_completed",
        data: {
            url: "Loading",
            type: "Just completed!"
        }
    });
};

// chrome.storage.local.set