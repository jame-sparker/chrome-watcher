

class BadgeManager {
    constructor() {
        this.urlDict = {};
        let that = this;
        chrome.storage.local.get('updatedUrls', (value) => {
            that.urlDict = value.updatedUrls || {};
            that.updateBadge();
        });

    }

    notifyUpdate(url) {
        console.log("NOTIFY UPDATE:", url);
        let that = this;
        this.urlDict[url] = true;
        chrome.storage.local.set({updatedUrls: this.urlDict}, () => {
            this.updateBadge();
        });
    }

    updateChecked(url) {
        delete this.urlDict[url];
        console.log(url);
        console.log(this.urlDict[url]);
        console.log(this.urlDict);
        let that = this;
        chrome.storage.local.set({updatedUrls: this.urlDict}, () => {
            that.updateBadge();
        });
    }

    updateBadge() {
        let notifications = Object.keys(this.urlDict).length;
        let notString = notifications > 0 ? notifications.toString() : '';
        chrome.browserAction.setBadgeText({text: notString});
    }
}