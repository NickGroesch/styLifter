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
  const headNodes = document.head.childNodes
  const headNodesArray = Array.from(headNodes)
  console.log(headNodesArray.filter(node => {
    console.log(node)
    console.log(Object.keys(node))

    return node.localname == 'link'
  }))
  const headNodesLen = headNodes.length
  for (let index = 0; index < headNodes.length; index++) {
    const element = headNodes[index];
    console.log(element)
  }

}
