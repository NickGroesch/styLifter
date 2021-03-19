let db = null;
//chrome.tts.speak('Hello, world.');
function createIndexedDB() {
  const indexDBplease = self.indexedDB.open('styLifter')
  indexDBplease.onerror = e => { console.error(e.target.errorCode) }
  indexDBplease.onsuccess = e => {
    db = e.target.result
    console.log(e.target)
  }
  indexDBplease.onupgradeneeded = e => {
    var db = e.target.result;
    const liftStore = db.createObjectStore("lift", {
      // keyPath: "id",  autoIncrement: true 
      keyPath: "href"
    })
    const hrefIndex = liftStore.createIndex("href", "href", {})
    const watchListIndex = liftStore.createIndex("watch", "watch", {})

    analysisStore = db.createObjectStore("analysis", {
      keyPath: "href"
      //  keyPath: "id", autoIncrement: true 
    });
    const paletteIndex = analysisStore.createIndex("palette", "palette", {})
    const liftIndex = analysisStore.createIndex("lift", "lift", {}) //"foreign key"
    const hrefIndex2 = analysisStore.createIndex("href", "href", {})
  };
  return db
}

function getIDB() {
  if (!db) {
    db = new Promise((resolve, reject) => {
      const indexDBplease = self.indexedDB.open('styLifter')
      indexDBplease.onerror = e => {
        console.error(e.target.errorCode)
        reject(openreq.error);
      }
      indexDBplease.onsuccess = e => {
        db = e.target.result
        console.log(e.target)
        resolve(indexDBplease.result);
      }
      indexDBplease.onupgradeneeded = e => {
        var db = e.target.result;
        const liftStore = db.createObjectStore("lift", {
          // keyPath: "id",  autoIncrement: true 
          keyPath: "href"
        })
        const hrefIndex = liftStore.createIndex("href", "href", {})
        const watchListIndex = liftStore.createIndex("watch", "watch", {})

        const analysisStore = db.createObjectStore("analysis", {
          keyPath: "href"
          //  keyPath: "id", autoIncrement: true 
        });
        const hrefIndex2 = analysisStore.createIndex("href", "href", {})
        const paletteIndex = analysisStore.createIndex("palette", "palette", {})
      };

    });
  }
  return db;

}

async function getLiftTransactionStore() {
  if (db === null) {
    console.log('there is no db')
    db = await getIDB()
  } else {
    console.log('there is db', db)
  }
  const transaction = db.transaction(['lift'], 'readwrite')
  transaction.oncomplete = function (event) {
    console.log('lift transaction complete', event)
  };
  transaction.onerror = function (event) {
    console.log(transaction.error)
  };
  return transaction.objectStore('lift')
}

async function getAnalysisTransactionStore() {
  console.log(db)
  if (db === null) {
    console.log('there is no db')
    db = await getIDB()
  } else {
    console.log('there is db')
    console.log(db)
  }
  const transaction = db.transaction(['analysis'], 'readwrite')
  transaction.oncomplete = function (event) {
    console.log('analysis transaction complete', event)
  };
  transaction.onerror = function (event) {
    console.log(event)
  };
  return transaction.objectStore('analysis')
}

let imgUrl = ""; //WRONG for an event driven service worker
let tabUrl = ""
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
    console.log(request)

    if (request.wants == "LIFTED") {
      capTab(sendResponse)
      tabUrl = sender.tab.url
    }
    if (request.sample) addLift(request.sample)

  }
);

chrome.runtime.onConnect.addListener(function (port) { //new Analysis page GETS image data as base64url
  createIndexedDB()
  // console.log('listening on the port', port)
  port.onMessage.addListener(function (msg) {
    console.log("port; msg", port, msg)
    if (msg.gimme == "data") {
      port.postMessage({ data: imgUrl, href: tabUrl });
    }
    if (msg.analysis) {
      console.log(msg.analysis)
      addAnalysis(msg.analysis)
    }
    if (msg.palette) {
      updateAnalysis(msg.sourceHref, msg.palette)
    }
    // if (msg.rossMe) {
    //   console.log(msg.rossMe)
    //   debugger
    //   chrome.tts.speak(msg.rossMe)
    // }
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
    //console.log("WOOHOO!", imageUri);
    imgUrl = imageUri
    //responder({ woohoo: imageUri })
    makeNewTab("/analysis.html")
  }, function (error) {
    console.log(`Error: ${error}`);
    //responder({ boohoo: error })
  });
}

async function addLift(sample) {
  const liftStore = await getLiftTransactionStore()
  console.log("lifting", liftStore, sample)

  liftStore.put(sample)
}

async function addAnalysis(analysis) {
  const analysisStore = await getAnalysisTransactionStore()
  analysisStore.put(analysis)
}

async function updateAnalysis(href, palette) {
  console.log(href, palette)
  const analysisStore = await getAnalysisTransactionStore()
  console.log(analysisStore)
  const newCursor = analysisStore.openCursor(href)

  newCursor.onsuccess = event => {
    const cursor = event.target.result;
    console.log("where is the cursor", cursor)
    const updateData = cursor.value
    updateData.palette = palette
    console.log(updateData)
    const cursorRequest = cursor.update(updateData)

    cursorRequest.onsuccess = function (event) {
      console.log("we put the palette?")
    }
    cursorRequest.onerror = function (event) {
      console.log("put pallete error?")
    }

  }

  // analysisStore.get({})
  // analysisStore.put(analysis)
}