let color = '#3aa757';
let watch = [
  "font-family"
]
let samples = [

]

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color, watch, samples });
  console.log('Default background color set to %cgreen', `color: ${color}`);
});
