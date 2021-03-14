
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    color: 'aquamarine',
    "watch": [
      "font-family",
      "background-color"
    ],
    samples: []
  })
  console.log('Default background color set to %cgreen', `color: ${color}`);
});
