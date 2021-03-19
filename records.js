let $tableDiv = document.getElementById("tableDiv");

makeSampleList()

function makeSampleList() {//TODO: This should move to a new page // might be harder than origianlly though

    // chrome.runtime.sendMessage({ wants: "ALL" }, function (response) {
    //     console.log("wantsALLsponse", response)
    //     //console.log(response.woohoo);
    //     //console.log(response.boohoo);
    // });

    const postPort = chrome.runtime.connect({ name: "imagePlease" })
    postPort.postMessage({ gimme: "records" })
    postPort.onMessage.addListener(function (msg) {
        console.log("msg", msg)
        if (msg.records) {
            showRecords(msg.records)
        }
    })

    // chrome.storage.local.get(["samples", "color"], ({ samples, color }) => {
    // })
}

function showRecords(recs) {

    const cardHTML = recs.reduce((accum, siteData) => {
        return accum + `<div style='width:300px;height:300px;'>
        <p>${siteData.href}</p>
        <ul>${siteData.watch.reduce((accum, curr) => {
            return accum + `<li>${curr}</li>`
        }, "")}
        </ul>
        </div>`
    }, "")

    $tableDiv.innerHTML = (cardHTML)
}
