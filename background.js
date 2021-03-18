let db = null;

function createIndexedDB() {
  const indexDBplease = self.indexedDB.open('styLifter')
  indexDBplease.onerror = e => { console.error(e.target.errorCode) }
  indexDBplease.onsuccess = e => {
    db = e.target.result
    console.log(e.target)
  }
  indexDBplease.onupgradeneeded = e => {
    var db = e.target.result;
    const liftStore = db.createObjectStore("lift", { keyPath: "id", autoIncrement: true })
    const hrefIndex = liftStore.createIndex("href", "href", {})
    const watchListIndex = liftStore.createIndex("watchlist", "watchlist", {})

    analysisStore = db.createObjectStore("timepoints", { keyPath: "id", autoIncrement: true });
    const paletteIndex = analysisStore.createIndex("palette", "palette", {})
    const liftIndex = analysisStore.createIndex("analysis", "analysis", {}) //"foreign key"
  };
}

function getliftTransactionStore() {
  const transaction = db.transaction(['lift'], 'readwrite')
  return transaction.objectStore('lift')
}
function getAnalysisTransactionStore() {
  const transaction = db.transaction(['analysis'], 'readwrite')
  return transaction.objectStore('analysis')
}

let imgUrl = "";

//self.addEventListener()

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    color: 'aquamarine',
    "watch": [
      "font-family",
      "background-color"
    ],
    samples: []
  })
  console.log('Default background color set to aquamarine');
  createIndexedDB()

});

chrome.runtime.onMessage.addListener( //on lift (capture) Popup 
  async function (request, sender, sendResponse) {
    console.log(sender.tab ?
      "from a content script:" + sender.tab.url :
      "from the extension");
    console.log(sender.tab)
    if (request.wants == "LIFTED") capTab(sendResponse)

  }
);

chrome.runtime.onConnect.addListener(function (port) { //new Analysis page GETS image data as base64url
  console.log('listening on the port', port)
  console.assert(port.name == "imagePlease");
  port.onMessage.addListener(function (msg) {
    if (msg.gimme == "data")
      port.postMessage({ data: imgUrl });
    console.log("data was sent")
  });
});

// capTab=>makeNewTab
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
