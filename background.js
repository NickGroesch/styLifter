let imgUrl = "";
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    color: 'aquamarine',
    "watch": [
      "font-family",
      "background-color"
    ],
    samples: []
  })
  console.log('Default background color set to aquamarine');
});

chrome.runtime.onMessage.addListener(
  async function (request, sender, sendResponse) {
    console.log(sender.tab ?
      "from a content script:" + sender.tab.url :
      "from the extension");
    console.log(sender.tab)
    if (request.greeting == "hello") {
      capTab(sendResponse)
      // const data64 = await capTab()
      // console.log('data64',data64)
      // const capturePromise = chrome.tabs.captureVisibleTab(null, null, (dataUrl) => { console.log(dataUrl) });
      // console.log("capturePromise", capturePromise)
      //sendResponse({ farewell: "goodbye" });
    }
  }
);

const makeNewTab = (url) => {
  const onCreated = (tab) => { console.log(`Created new tab: ${tab.id}`) }
  const onError = (error) => { console.log(`makeNewTab Error: ${error}`); }
  // https://github.com/mdn/webextensions-examples/tree/master/store-collected-images/webextension-plain
  const creating = chrome.tabs.create({ url })
  creating.then(onCreated, onError);
}

function onCaptured(imageUri) {
  console.log("WOOHOO!", imageUri);
}

function capTab(responder) {
  console.log(responder)
  var capturing = chrome.tabs.captureVisibleTab();
  capturing.then(function (imageUri) {
    console.log("WOOHOO!", imageUri);
    imgUrl = imageUri
    responder({ woohoo: imageUri })
    makeNewTab("/analysis.html")
  }, function (error) {
    console.log(`Error: ${error}`);
    responder({ boohoo: error })
  });
}

chrome.runtime.onConnect.addListener(function (port) {
  console.log('listening on the port', port)
  console.assert(port.name == "imagePlease");
  port.onMessage.addListener(function (msg) {
    if (msg.gimme == "data")
      port.postMessage({ data: imgUrl });

  });
});