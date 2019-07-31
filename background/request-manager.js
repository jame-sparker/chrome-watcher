import {Requestor} from './requestor.js'
import {IntervalHandler} from './interval-handler.js'

export class RequestManager {
    constructor(updateHandler) {
        this.uh = updateHandler;
        this.ih = new IntervalHandler();
        this.urlDict = {};
    }

    addTagRequest(url, tagName, interval) {
        /**
         * url: url to fetch data
         * tagName: name of a tag in the fetched html
         * interval: time in milliseconds to repeat fetching
         */

        this.removeRequest(url);

        let request = new Requestor(url);
        let f = () => {
            request.fetchTags(tagName)
                .then(x => console.log(x));
        };
        this.ih.callWithInterval(f, interval);
    }

    addClassRequest(url, className, interval) {
        /**
         * url: url to fetch data
         * className: name of a class in the fetched html
         * interval: time in milliseconds to repeat fetching
         */

        this.removeRequest(url);

        let request = new Requestor(url);
        this.ih.callWithInterval(() => {}, interval);
    }

    addIdRequest(url, id, interval) {
        /**
         * url: url to fetch data
         * id: name of the id in the fetched html
         * interval: time in milliseconds to repeat fetching
         */

        this.removeRequest(url);

    }

    removeRequest(url) {
        let f = this.urlDict[url];
        if (!f) return;
        this.ih.removeTimer(f);
    }
}