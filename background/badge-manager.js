

class BadgeManager {
    constructor() {
        this.urlDict = {};
        let that = this;
        chrome.storage.local.get('updatedUrls', (urls) => {
            that.urlDict = urls || {};
            that.updateBadge();
        });

    }

    notifyUpdate(url) {
        this.urlDict[url] = true;
        chrome.storage.local.set({updatedUrls: this.urlDict}, () => {
            that.updateBadge();
        });
    }

    updateChecked(url) {
        delete this.urlDict[url];
        chrome.storage.local.set({updatedUrls: this.urlDict}, () => {
            that.updateBadge();
        });
    }

    updateBadge() {
        let notifications = Object.keys(this.urlDict).length.toString();
        if (notifications > 0) chrome.browserAction.setBadgeText({text: notifications});
    }

}