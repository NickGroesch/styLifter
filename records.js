let $tableDiv = document.getElementById("tableDiv");

makeSampleList()

function makeSampleList() {
    const postPort = chrome.runtime.connect({ name: "imagePlease" })
    postPort.postMessage({ gimme: "records" })
    postPort.onMessage.addListener(function (msg) {
        console.log("msg", msg)
        if (msg.records) {
            showRecords(msg.records)
        }
    })
}

function showRecords(recs) {
    //TODO: add tooltips of watched values
    recs.forEach(siteData => {
        const thisSite = {}
        for (term of siteData.watch) {
            thisSite[term] = {}
        }
        for (prop of siteData.props) {
            const { key, val, selector } = prop
            if (thisSite[key][val]) {
                thisSite[key][val].push(selector)
            } else {
                thisSite[key][val] = [selector]
            }
        }
        siteData.watchMap = thisSite
    })

    const cardHTML = recs.reduce((accum, siteData) => {
        console.log(siteData)
        return accum + `<div style='width:300px;height:300px;' class='selected'>
        <h2> <a href="${siteData.href}" target="_blank">${siteData.href}</a></h2>
        <ul>${siteData.watch.reduce((accum, curr) => {
            return accum + `<li> 
            &#128064; ${curr} &#128064; 
            </li>`
        }, "")}
        </ul>
        ${siteData.palette.reduce((accum, curr) => {
            console.log(accum, curr)//TODO:it could be nice to analyze which color to use programatially for sufficient contrast
            return accum + `<button style='background-color:${curr};'>
            ${curr}
            </button>`
        }, "")}
        </div>`
    }, "")
    $tableDiv.innerHTML = (cardHTML)
}
