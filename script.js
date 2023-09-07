notload = document.querySelectorAll("section");
notload.forEach((element) => {
  element.style.display = "none";
});

const markForm = document.getElementById("markForm");
const addButton = document.getElementById("addButton");
const markList = document.getElementById("markList");
const container = document.getElementById("form-container");
var newBtn = document.getElementById("newbtn");
const cancelButton = document.getElementById("cancelButton");

let marks = JSON.parse(localStorage.getItem("marks")) || [];
let editingIndex = -1;
let originalData = null; // Store original data during editing

function saveMarksToLocalStorage() {
  localStorage.setItem("marks", JSON.stringify(marks));
}

function renderMarks() {
  if (marks.length === 0) {
    document.getElementById("deleteAllBtn").style.display = "none";
    setTimeout(() => {
      document.getElementById("message").style.display = "block";
    }, 1000);
  } else {
    setTimeout(() => {
      document.getElementById("deleteAllBtn").style.display = "flex";
    }, 2000);

    markList.innerHTML = `<tr><th>Name</th><th>Mark1</th><th>Mark2</th><th>Mark3</th><th>Average</th><th colspan="2">Option</th></tr>`;
    marks.forEach((mark, index) => {
      const listItem = document.createElement("tr");
      listItem.innerHTML = `
        <td>${mark.name}</td>
        <td><span>${mark.mark1}</span></td><td><span>${mark.mark2}</span></td><td><span>${mark.mark3}</span></td><td><span>${mark.average}</span></td>
        <td><button id="editBtn" onclick="editMark(${index})">Edit</button></td>
        <td><button onclick="deleteMark(${index})">Delete</button></td>
      `;

      markList.appendChild(listItem);
    });
    addButton.textContent = editingIndex === -1 ? "Add" : "Edit";
  }
}

function addMark(event) {
  event.preventDefault();
  var name = document.getElementById("name").value;
  var mark1 = document.getElementById("mark1").value;
  mark1 = mark1.padStart(2, "0");
  var mark2 = document.getElementById("mark2").value;
  mark2 = mark2.padStart(2, "0");
  var mark3 = document.getElementById("mark3").value;
  mark3 = mark3.padStart(2, "0");
  var average = document.getElementById("avg").value;

  var n = [parseInt(mark1), parseInt(mark2), parseInt(mark3)];
  n.sort(function (a, b) {
    return a - b;
  });

  var avg = 0;
  avg = (n[2] + n[1]) / 2;
  // console.log(avg);

  if (avg > 0) {
    average = parseFloat(avg).toFixed(2);
  } else {
    average = 0;
  }

  if (name && mark1 && mark2 && mark3 && average) {
    if (editingIndex === -1) {
      // If not in edit mode, add a new mark
      marks.push({ name, mark1, mark2, mark3, average });
      saveMarksToLocalStorage();
      renderMarks();
      markForm.reset();
      toggleEvent();
      showPopupWithCloseButton("successfully added");
    } else {
      // If in edit mode, update the existing mark
      marks[editingIndex] = { name, mark1, mark2, mark3, average };
      editingIndex = -1; // Reset the editing state after editing is completed
      saveMarksToLocalStorage();
      renderMarks();
      markForm.reset();
      toggleEvent();
      showPopupWithCloseButton("successfully updated");
    }
  }
}

function editMark(index) {
  markForm.reset();
  toggleEvent();
  if (editingIndex !== -1) {
    // Cancel the ongoing edit and restore the data
    marks[editingIndex] = restoreData(originalData);
    toggleEvent();
  }

  originalData = { ...marks[index] };

  var { name, mark1, mark2, mark3, average } = marks[index];
  document.getElementById("name").value = name;
  document.getElementById("mark1").value = mark1;
  document.getElementById("mark2").value = mark2;
  document.getElementById("mark3").value = mark3;
  document.getElementById("avg").value = average;
  editingIndex = index;
  renderMarks();
  addButton.textContent = "Edit";
}

function cancelEdit() {
  marks[editingIndex] = restoreData(originalData); // Restore the original data
  editingIndex = -1; // Reset the editingIndex
  renderMarks();
  addButton.textContent = "Add";
  toggleEvent();
  markForm.reset();
}

function deleteMark(index) {
  marks.splice(index, 1);
  saveMarksToLocalStorage();
  renderMarks();
  showPopupWithCloseButton("successfully deleted");
  setTimeout(() => {
    location.reload();
  }, 1000);
}

function restoreData(data) {
  if (data) {
    return { ...data }; // Return a copy of the original data to restore it
  }
  return null; // Return null if there's no original data
}

function toggleEvent() {
  container.style.display === "none"
    ? (markForm.reset(),
      (container.style.display = "flex"),
      (document.getElementById("message").style.display = "none"))
    : editingIndex !== -1
      ? (markForm.reset(),
        (container.style.display = "flex"),
        cancelEdit(),
        toggleEvent())
      : (container.style.display = "none");
}

//for popup
const popupContainer = document.querySelector(".popup-box");
const closeButton = document.querySelector(".close-button");
const popupMessage = document.querySelector(".popup-message");
// Function to show the popup with a close button and a custom message
function showPopupWithCloseButton(message) {
  // Set the custom message in the popup
  popupMessage.textContent = message;
  closeButton.textContent = "✖";

  // Show the popup container
  popupContainer.style.display = "flex";

  // Add an event listener to close the popup when the close button is clicked
  closeButton.addEventListener("click", hidePopup);

  // Automatically hide the popup after 5 seconds
  setTimeout(hidePopup, 2000); // 5000 milliseconds (5 seconds)
}

// Function to hide the popup
function hidePopup() {
  // Hide the popup container
  popupContainer.style.display = "none";
}

newBtn.addEventListener("click", toggleEvent);
markForm.addEventListener("submit", addMark);

cancelButton.addEventListener("click", cancelEdit); // Add an event listener for the "Cancel" button

document.addEventListener("DOMContentLoaded", () => {
  renderMarks();
  toggleEvent();
  notload.forEach((element) => {
    element.style.display = "flex";
  });
});

document.getElementById("deleteAllBtn").addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all marks?")) {
    localStorage.removeItem("marks");
    marks = []; // Clear the marks array as well
    saveMarksToLocalStorage();
    // Display a popup message after successful deletion
    showPopupWithCloseButton("All marks have been deleted successfully.");
    setTimeout(() => {
      renderMarks();
      location.reload();
    }, 1000);
  }
});

document.addEventListener("visibilitychange", function () {
  let originalTitle = 'Internal Marks'
  if (document.hidden) {
    document.title = "😢 Come back! We miss you!";
    clearTimeout(originalTitle);
  } else {
    document.title = "🙂 Welcome back!";
    // Regardless of the condition, revert to the default title after 5 seconds
    setTimeout(function () {
      document.title = "Internal Marks"; // Replace with your actual default title
    }, 2000); // Run after 2 seconds
  }
});
