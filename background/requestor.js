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
                console.error(error)
            );
    }

    fetchId(id) {
        return this.fetchUrl().then(doc => {
            return doc.getElementById(id).outerHTML;
        });
    }

    fetchTags(tagName) {
        return this.fetchUrl().then(doc => {
            return doc.getElementsByTagName(tagName).map(tag => tag.outerHTML).join();
        });
    }

    fetchClass(className) {
        return this.fetchUrl().then(doc => {
            return doc.getElementsByClassName(className).map(tag => tag.outerHTML).join();
        });
    }

    fetchRegex(regex) {
        return this.fetchUrl().then(doc => {
            return doc.outerHTML.match(new RegExp(regex, 'g')).join();
        });
    }
}



  