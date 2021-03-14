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
  const thisSample = {
    cdns: [],
    props: []
  }
  chrome.storage.sync.get("color", ({ color }) => {
    document.body.style.backgroundColor = color;
  });
  chrome.storage.sync.get(["watch"], ({ watch }) => {
    console.log(watch)
    const theCssRules = []

    const linkNodes = document.querySelectorAll('link[rel=stylesheet]')
    linkNodes.forEach(async node => {
      console.log(node.getAttribute("href"))
      const nodesHref = node.getAttribute("href")

      if (nodesHref.slice(0, 5) == "https") {
        //probably cdn
        thisSample.cdns.push(nodesHref)
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

      }
    })

    setTimeout(() => analyzeRules(), 1000)
    const analyzeRules = () => {
      theCssRules.forEach(ruleSet => {
        console.log(ruleSet.length)
        for (let index = 0; index < ruleSet.length; index++) {
          const rule = ruleSet[index];
          console.log("%crule", "color: orangered", rule)
          //import rules will have an href
          if (rule?.href) {
            console.log("%chref for import", "color: green", rule?.href)
          } else {
            //other style rules
            console.log("%cstyle", "color: green", rule.style)
          }
          const ruleSelector = rule.selectorText
          if (rule?.style?.length) {
            for (let index = 0; index < rule?.style?.length; index++) {
              const ruleKey = rule.style[index];
              const ruleVal = rule.style[ruleKey]
              // console.log(`%c${ruleKey}`, "color : blue")
              // console.log(`%c${ruleVal]}`, 'color: aquamarine')//this seems simple

              //console.log(rule.style.getPropertyValue(ruleKey))//this seems like it might be the long, right way

              //add to results if watched
              if (watch.includes(ruleKey)) {
                thisSample.props.push({
                  key: ruleKey,
                  val: ruleVal,
                  selector: ruleSelector
                })
              }
            }
          }
        }
        console.log(thisSample)
        chrome.storage.sync.set({ samples: thisSample })
      })
    }

  })
}
