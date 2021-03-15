
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

function onCaptured(imageUri) {
  console.log("WOOHOO!", imageUri);
}

function capTab(responder) {
  console.log(responder)
  var capturing = chrome.tabs.captureVisibleTab();
  capturing.then(function (imageUri) {
    console.log("WOOHOO!", imageUri);
    responder({ woohoo: imageUri })
    //return imageUri
  }, function (error) {
    console.log(`Error: ${error}`);
    responder({ boohoo: error })
  });
}