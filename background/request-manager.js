class RequestManager {
    constructor(updateHandler, interval) {
        this.uh = updateHandler;
        this.ih = new IntervalHandler();
        this.urlDict = {};
        this.interval = interval;

        this.htmlRecords = {};

        let that = this;

        // populate previous data with this htmlRecords
        chrome.storage.local.get('htmlRecords', (value) => {
            console.log(`Current html records: ${value.htmlRecords}`);
            console.log(value.htmlRecords);
            that.htmlRecords = value.htmlRecords || {};

            Object.keys(that.htmlRecords).forEach((url) => {
                console.log('start up:', url);
                let [oldHtml, newHtml, interval, settings] = that.htmlRecords[url];
                let [type, option] = settings;
                that.addRequest(type, url, option, interval, settings)
            });
        });
    }

    addRequest(type, url, option, interval, settings) {
        switch (type) {
            case "None":
                this.addTagRequest(url, "html", interval, settings);
                break;
            case "Tag":
                this.addTagRequest(url, option, interval, settings);
                break;
            case "Class":
                this.addClassRequest(url, option, interval, settings);
                break;
            case "ID":
                this.addIdRequest(url, option, interval, settings);
                break;
            case "Regex":
                this.addRegexRequest(url, option, interval, settings);
                break;
        }
    }

    addTagRequest(url, tagName, interval, settings) {
        /**
         * url: url to fetch data
         * tagName: name of a tag in the fetched html
         * interval: time in milliseconds to repeat fetching
         */
        let request = new Requestor(url);
        this.setRequest(() => request.fetchTags(tagName), url, interval, settings);
    }

    addClassRequest(url, className, interval, settings) {
        /**
         * url: url to fetch data
         * className: name of a class in the fetched html
         * interval: time in milliseconds to repeat fetching
         */

        let request = new Requestor(url);
        this.setRequest(() => request.fetchClass(className), url, interval, settings);
    }

    addIdRequest(url, id, interval, settings) {
        /**
         * url: url to fetch data
         * id: name of the id in the fetched html
         * interval: time in milliseconds to repeat fetching
         */

        let request = new Requestor(url);
        this.setRequest(() => request.fetchId(id), url, interval, settings);
    }

    addRegexRequest(url, regex, interval, settings) {
        /**
         * url: url to fetch data
         * regex: regex to match in fetched html. Matches all possible regex.
         * interval: time in milliseconds to repeat fetching
         */

        let request = new Requestor(url);
        this.setRequest(() => request.fetchRegex(regex), url, interval, settings);
    }

    setRequest(requestor, url, interval, settings) {
        let that = this;
        let fid = this.urlDict[url];

        if (fid) {
            this.ih.removeTimer(fid);
            delete this.urlDict[url];
        }

        let f = () => {
            requestor().then(html => {
                console.log('dict', that.htmlRecords);
                if(updateHtmlData(that.htmlRecords, url, html, interval, settings)) {
                    that.uh(url);
                }
            });
        };

        this.urlDict[url] = this.ih.callWithInterval(f, interval);
    }

    removeRequest(url) {
        let fid = this.urlDict[url];

        if (fid) {
            this.ih.removeTimer(fid);
            delete this.urlDict[url];
        }

        return new Promise((resolve) => {
            console.log('trying to remove', url);
            chrome.storage.local.get('htmlRecords', (value) => {
                let newRecords = value.htmlRecords;
                delete newRecords[url];
                chrome.storage.local.set({htmlRecords: newRecords}, () => {
                    console.log("removed", url);
                    resolve();
                });
            });
        });
    }

}

function updateHtmlData(prevHtmls, url, newHtml, interval, settings) {
    console.log(`Recieved newHTML ${newHtml.slice(0, 20)}`);
    // returns html is updated
    if (prevHtmls[url] === undefined) {
        prevHtmls[url] = [undefined, newHtml, interval, settings];

        chrome.storage.local.set({htmlRecords: prevHtmls}, () => {
            console.log("local data added");
        });

        return false;

    } else {
        let oldHtml = prevHtmls[url][1];
        if (oldHtml === newHtml) return false;

        prevHtmls[url] = [oldHtml, newHtml, interval, settings];

        chrome.storage.local.set({htmlRecords: prevHtmls}, () => {
            console.log("local data updated");
        });

        return true;
    }
}