let $buttonDiv = document.getElementById("buttonDiv");
let $tableDiv = document.getElementById("tableDiv");
let selectedClassName = "current";
const presetButtonColors = ["blue", "orangered", "aquamarine", "green"];

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

function makeList() {
  chrome.storage.sync.get(["samples", "color"], ({ samples, color }) => {
    samples.forEach(element => {
      console.log(element)
      const p = document.createElement('p')
      p.classList.add('tooltip')
      p.textContent = element.location
      const tooltip = document.createElement('div')
      tooltip.classList.add('tooltiptext')
      tooltip.textContent = "cool"
      tooltip.style.backgroundColor = color
      tooltip.style.color = "black"
      p.appendChild(tooltip)
      $tableDiv.appendChild(p);
    });
  })
}
// Initialize the page by constructing the color options
constructOptions(presetButtonColors);
makeList()
