// import {Requestor} from './requestor.js'
// import {IntervalHandler} from './interval-handler.js'

function updateHtmlData(prevHtmls, url, newHtml) {
    console.log(`Recieved newHTML ${newHtml.slice(0, 10)}`);
    // returns True
    if (prevHtmls[url] === undefined) {
        prevHtmls[url] = newHtml;

        chrome.storage.local.set({htmlRecords: prevHtmls}, () => {
            console.log("local data updated");
        });

        return false;

    } else {
        if (prevHtmls[url] === newHtml) return false;
        prevHtmls[url] = newHtml;

        chrome.storage.local.set({htmlRecords: prevHtmls}, () => {
            console.log("local data updated");
        });

        return true;
    }

}

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

            for (const url in that.htmlRecords) {
                // add request

            }
        });
    }

    addTagRequest(url, tagName, interval) {
        /**
         * url: url to fetch data
         * tagName: name of a tag in the fetched html
         * interval: time in milliseconds to repeat fetching
         */
        let request = new Requestor(url);
        this.setRequest(() => request.fetchTags(tagName), url, interval);
    }

    addClassRequest(url, className, interval) {
        /**
         * url: url to fetch data
         * className: name of a class in the fetched html
         * interval: time in milliseconds to repeat fetching
         */

        let request = new Requestor(url);
        this.setRequest(() => request.fetchClass(className), url, interval);
    }

    addIdRequest(url, id, interval) {
        /**
         * url: url to fetch data
         * id: name of the id in the fetched html
         * interval: time in milliseconds to repeat fetching
         */

        let request = new Requestor(url);
        this.setRequest(() => request.fetchId(id), url, interval);
    }

    addRegexRequest(url, regex, interval) {
        /**
         * url: url to fetch data
         * regex: regex to match in fetched html. Matches all possible regex.
         * interval: time in milliseconds to repeat fetching
         */

        let request = new Requestor(url);
        this.setRequest(() => request.fetchRegex(regex), url, interval);
    }

    setRequest(requestor, url, interval) {
        let request = new Requestor(url);

        let that = this;
        this.removeRequest(url);

        let f = () => {
            requestor().then(html => {
                console.log('dict', that.htmlRecords);
                if(updateHtmlData(that.htmlRecords, url, html)) {
                    that.uh(url);
                }
            });
        };

        this.urlDict[url] = f;
        this.ih.callWithInterval(f, interval);

    }

    removeRequest(url) {
        let f = this.urlDict[url];
        if (!f) return;
        this.ih.removeTimer(f);
        delete this.urlDict[url];
    }
}