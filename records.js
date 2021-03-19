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
    //recs.unshift("")
    const cardHTML = recs.reduce((accum, siteData) => {
        return accum + `<div style='width:300px;height:300px;'>
        <h2> <a href="${siteData.href}">${siteData.href}</a></h2>
        <ul>${siteData.watch.reduce((accum, curr) => {
            return accum + `<li> 
            &#128064; ${curr} &#128064; 
            </li>`
        }, "")}
        </ul>
        ${siteData.palette.reduce((accum, curr) => {
            console.log(accum, curr)
            return accum + `<button style='background-color:${curr};'>
            ${curr}
            </button>`
        }, "")}
        </div>`
    }, "")
    $tableDiv.innerHTML = (cardHTML)
}
