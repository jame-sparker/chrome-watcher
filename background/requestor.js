export class Requestor {
  constructor(url) {
    this.url = url;
  }

  fetchUrl() {
    return fetch(this.url)
      .then((response) => {
        return response.text();
    }).catch((error) => 
      console.error(error)
    );
  }

  fetchId(id) {
    return this.fetchUrl();
  }

  fetchTags(tagName) {
    return this.fetchUrl()
  }

  fetchClass(className) {

  }
}


  