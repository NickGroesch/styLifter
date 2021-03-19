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
    const cardHTML = recs.reduce((accum, siteData) => {
        return accum + `<div style='width:300px;height:300px;'>
        <h2>${siteData.href}</h2>
        <ul>${siteData.watch.reduce((accum, curr) => {
            return accum + `<li>${curr}</li>`
        }, "")}
        </ul>
        ${siteData.palette.reduce((accum, curr) => {
            return accum + `<button style='background-color:${curr};'>${curr}</button>`
        })}
        </div>`
    }, "")
    $tableDiv.innerHTML = (cardHTML)
}
