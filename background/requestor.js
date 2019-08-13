class Requestor {
    constructor(url) {
        this.url = url;
    }

    fetchUrl() {
        return fetch(this.url).then((response) => {
                return response.text();
            }).then(html => {
                let parser = new DOMParser();
                return parser.parseFromString(html, "text/html");
            }).catch((error) =>
                console.log('This error occurred while fetching data' + error)
            );
    }

    fetchId(id) {
        return this.fetchUrl().then(doc => {
            return doc.getElementById(id).outerHTML;
        });
    }

    fetchTags(tagName) {
        return this.fetchUrl().then(doc => {
            let doms = [...doc.getElementsByTagName(tagName)];
            return doms.map(tag => tag.outerHTML).join();
        });
    }

    fetchClass(className) {
        return this.fetchUrl().then(doc => {
            let doms = [...doc.getElementsByClassName(className)];
            return doms.map(tag => tag.outerHTML).join();
        });
    }

    fetchRegex(regex) {
        return this.fetchUrl().then(doc => {
            return doc.outerHTML.match(new RegExp(regex, 'g')).join();
        });
    }
}



  