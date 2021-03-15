let $buttonDiv = document.getElementById("buttonDiv");
let $tableDiv = document.getElementById("tableDiv");
let $newTerm = document.getElementById("newTerm");
let $termForm = document.getElementById("termForm");
let selectedClassName = "current";
const presetButtonColors = ["blue", "orangered", "aquamarine", "green"];
let localState;

// Reacts to a button click by marking marking the selected button and saving
// the selection
function handleButtonClick(event) {
  // Remove styling from the previously selected color
  let current = event.target.parentElement.querySelector(
    `.${selectedClassName}`
  );
  if (current && current !== event.target) {
    current.classList.remove(selectedClassName);
  }

  // Mark the button as selected
  let color = event.target.dataset.color;
  event.target.classList.add(selectedClassName);
  chrome.storage.sync.set({ color });
}

// Add a button to the page for each supplied color
function constructOptions(buttonColors) {
  chrome.storage.sync.get("color", (data) => {
    let currentColor = data.color;

    // For each color we were provided…
    for (let buttonColor of buttonColors) {
      // …crate a button with that color…
      let button = document.createElement("button");
      button.dataset.color = buttonColor;
      button.style.backgroundColor = buttonColor;

      // …mark the currently selected color…
      if (buttonColor === currentColor) {
        button.classList.add(selectedClassName);
      }

      // …and register a listener for when that button is clicked
      button.addEventListener("click", handleButtonClick);
      $buttonDiv.appendChild(button);
    }
  });
}
//read
makeWatchListInterfact()//also initializes local state array
function makeWatchListInterfact() {
  chrome.storage.sync.get(["watch"], ({ watch }) => {
    $tableDiv.innerHTML = renderWatchList(watch)
    localState = watch
  })
}
const renderWatchList = watchTerms => {
  return watchTerms.map(term => {
    return `<li class="m">
      <span class="">${term}</span>
      <button data-term="${term}" class="deleteTerm">x</button>
    </li>`
  }).join('')
}
//delete
$tableDiv.addEventListener('click', event => { // Step 2
  if (event.target.className === 'deleteTerm') { // Step 3
    console.log('Kill this term!');
    // console.log(event.target.dataset.term); d
    localState.splice(localState.indexOf(event.target.dataset.term), 1)
    chrome.storage.sync.set({ watch: localState })
    location.reload()
  }
});

//create
$termForm.addEventListener('submit', e => {
  e.preventDefault()
  const text = $newTerm.value
  localState.push(text.trim())
  chrome.storage.sync.set({ watch: localState })
  location.reload()
  // fetch('/api/todos', {
  //   method: 'POST',
  //   body: JSON.stringify({ text }),
  //   headers: {
  //     'Content-Type': 'application/json'
  //   }
  // })
  //   .then(getTodos)
  //   .catch(err => console.error(err))
})
// Initialize the page by constructing the color options
constructOptions(presetButtonColors);
