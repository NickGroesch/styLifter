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
        console.log("%ccanYouDigIt?", "color: orangered", siteData)
        return accum + `<div style='width:300px;height:300px;' class='selected'>
        <h2> <a href="${siteData.href}" target="_blank">${siteData.href}</a></h2>
        <ul>${siteData.watch.reduce((accum, curr) => {
            return accum + `<li class="tooltip"> 
            &#128064; ${curr} &#128064; 
            <div class="tooltiptext">${Object.keys(siteData.watchMap[curr])} 
            </div>
            </li>`
        }, "")}
        </ul>
        ${siteData.palette.reduce((accum, curr) => {
            //https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
            //if (red*0.299 + green*0.587 + blue*0.114) > 186
            const currRgb = hexToRgb(curr)
            const fontColor = ((currRgb.r * 0.299 + currRgb.g * 0.587 + currRgb.b * 0.114) > 186) ? 'black' : 'white'
            //console.log(hexToRgb(curr))
            return accum + `<button style='background-color:${curr};color:${fontColor}'>
            ${curr}
            </button>`
        }, "")}
        </div>`
    }, "")
    $tableDiv.innerHTML = (cardHTML)
}
//https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}