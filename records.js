let $tableDiv = document.getElementById("tableDiv");

makeSampleList()

function makeSampleList() {//TODO: This should move to a new page // might be harder than origianlly though
    chrome.storage.sync.get(["samples", "color"], ({ samples, color }) => {
        samples.forEach(element => {
            console.log(element)

            const p = document.createElement('p')
            p.classList.add('tooltip')
            p.textContent = element.location
            const tooltip = document.createElement('div')
            tooltip.classList.add('tooltiptext')
            tooltip.textContent = element.watch.join(",")//TODO: make this a map like options
            tooltip.style.backgroundColor = color
            tooltip.style.color = "black"
            p.appendChild(tooltip)
            $tableDiv.appendChild(p);
        });
    })
}

