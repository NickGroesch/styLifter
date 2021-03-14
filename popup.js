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
async function setPageBackgroundColor() {
  chrome.storage.sync.get("color", ({ color }) => {
    document.body.style.backgroundColor = color;
  });
  const theCssRules = []

  const linkNodes = document.querySelectorAll('link[rel=stylesheet]')
  linkNodes.forEach(async node => {
    console.log(node.getAttribute("href"))
    const nodesHref = node.getAttribute("href")

    if (nodesHref.slice(0, 5) == "https") {
      //probably cdn
      console.log("not gonna do it")
    } else {
      //probably local css
      const css = await fetch(nodesHref)
        .then(res => res.text())
      const cssLines = css.split("\n")
      console.log(cssLines)
      //this approach only works for politely formatted source css

      //parse minified or bundled css differently
      //from  https://stackoverflow.com/questions/3326494/parsing-css-in-javascript-jquery
      //You can easily use the Browser's own CSSOM to parse CSS:

      var extractRulesForCssText = function (styleContent) {

        var doc = document.implementation.createHTMLDocument(""),
          styleElement = document.createElement("style");

        styleElement.textContent = styleContent;
        // the style will only be parsed once it is added to a document
        doc.body.appendChild(styleElement);

        return styleElement.sheet.cssRules;
      };
      const cssRules = (extractRulesForCssText(css))
      theCssRules.push(cssRules)
      // const cssRulesLen = cssRules.length
      // console.log(cssRules)
      // console.log(cssRulesLen)

      // for (let index = 0; index < cssRulesLen; index++) {
      //   const rule = cssRules[index];
      //   console.log(rule.styleMap)
      //   console.log(typeof rule.style)
      //   console.log(Object.keys(rule.style))
      // }
    }

  })

  setTimeout(() => analyzeRules(), 3000)
  const analyzeRules = () => {
    theCssRules.forEach(ruleSet => {
      console.log(ruleSet.length)
      for (let index = 0; index < ruleSet.length; index++) {
        const rule = ruleSet[index];
        console.log(rule?.href)//import rules will have an href
        //other style rules
        console.log(rule)
        console.log(rule.style)
        if (rule?.style?.length) {
          for (let index = 0; index < rule?.style?.length; index++) {
            const ruleKey = rule.style[index];
            console.log(ruleKey)
            console.log(rule.style[ruleKey])
          }
        }

      }
    })
  }

}
