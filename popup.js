// Initialize butotn with users's prefered color
let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get("color", ({ color }) => {
  changeColor.style.backgroundColor = color;
});

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: setPageBackgroundColor,
  });
});

// The body of this function will be execuetd as a content script inside the
// current page
function setPageBackgroundColor() {
  chrome.storage.sync.get("color", ({ color }) => {
    document.body.style.backgroundColor = color;
  });
  const linkNodes = document.querySelectorAll('link[rel=stylesheet]')
  linkNodes.forEach(node => {
    console.log(node.getAttribute("href"))
    const nodesHref = node.getAttribute("href")
    if (nodesHref.slice(0, 5) == "https") {
      //probably cdn
      console.log("not gonna do it")
    } else {
      //probably local css
      fetch(nodesHref)
        .then(res => res.text())
        .then(css => console.log(css))
    }
  })


}
