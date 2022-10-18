function getUrlConfig() {
    var urlJson;
    (async() => {
        const fetchRequest = await fetch('./config/config.json');
        const json = await fetchRequest.json();
        urlJson = json["URL"];
    })();
    console.log(urlJson);
    return urlJson;
}