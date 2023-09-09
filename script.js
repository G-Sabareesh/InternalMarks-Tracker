// All element are hidden until the document is fully loaded
notload = document.querySelectorAll("section");
notload.forEach((element) => {
    element.style.display = "none";
});

// variable initialization
const markForm = document.getElementById("markForm"); // markForm : Entier Form
const addButton = document.getElementById("addButton"); // addButton : Form submit
const markList = document.getElementById("markList"); // markList : Table
const container = document.getElementById("form-container"); // container : Form-parent
const cancelButton = document.getElementById("cancelButton"); // cancelButton : Form cancel
var newBtn = document.getElementById("newbtn"); // newBtn : processButton(+NEW)

let marks = JSON.parse(localStorage.getItem("marks")) || []; //to store the all marks in array
let editingIndex = -1; //Is edit or not
let originalData = null; // Store original data during editing

//in this functin sotre the value in the local storage JSON
function saveMarksToLocalStorage() {
    localStorage.setItem("marks", JSON.stringify(marks));
}

//Its render/display the marks and create new table for new entry
function renderMarks() {
    //check the length of the local storage then process
    if (marks.length === 0) {
        document.getElementById("deleteAllBtn").style.display = "none";
        setTimeout(() => {
            document.getElementById("message").style.display = "block";
        }, 1000);
    } else {
        setTimeout(() => {
            document.getElementById("deleteAllBtn").style.display = "flex";
        }, 2000);
        // heading for table
        markList.innerHTML = `<tr><th>Name</th><th>Mark1</th><th>Mark2</th><th>Mark3</th><th>Average</th><th colspan="2">Option</th></tr>`;
        //create a new table row
        marks.forEach((mark, index) => {
            const listItem = document.createElement("tr");
            listItem.innerHTML = `
        <td>${mark.name}</td>
        <td><span>${mark.mark1}</span></td><td><span>${mark.mark2}</span></td><td><span>${mark.mark3}</span></td><td><span>${mark.average}</span></td>
        <td><button id="editBtn" onclick="editMark(${index})">Edit</button></td>
        <td><button onclick="deleteMark(${index})">Delete</button></td>
      `;
            markList.appendChild(listItem); //append all data into the table
        });
        addButton.textContent = editingIndex === -1 ? "Add" : "Edit";
    }
}

//New entry or Edit then save the data
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
    }); //first two largest value

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
            marks.push({ name, mark1, mark2, mark3, average }); //push all into the local storage
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

//once click the edit button call this function first..
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

//click the cancel button this function execute
function cancelEdit() {
    marks[editingIndex] = restoreData(originalData); // Restore the original data
    editingIndex = -1; // Reset the editingIndex
    renderMarks();
    addButton.textContent = "Add";
    toggleEvent();
    markForm.reset();
}

//delete only one data at a time
function deleteMark(index) {
    if (confirm(`Are you sure to delete "${marks[index].name}"`)) {
        marks.splice(index, 1); // Remove the data from the array
        saveMarksToLocalStorage();
        renderMarks();
        showPopupWithCloseButton("successfully deleted");
        setTimeout(() => {
            location.reload(); //after deleted relode the document
        }, 500);
    }
}

//If anything wrong in the process of editing this function will execute
function restoreData(data) {
    if (data) {
        return { ...data }; // Return a copy of the original data to restore it
    }
    return null; // Return null if there's no original data
}

// toggleEvent to hide and unhide the element
function toggleEvent() {
    container.style.display === "none" //if form is hidden
        ? (markForm.reset(),
            (container.style.display = "flex"),
            (document.getElementById("message").style.display = "none"))
        : editingIndex !== -1 //If in editing mode click (+NEW) or (Edit) this will work
            ? (markForm.reset(),
                (container.style.display = "flex"),
                cancelEdit(), //cancel the previous editing or new entry session
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
    popupContainer.style.display = "flex"; // Show the popup container
    closeButton.addEventListener("click", hidePopup); // Add an event listener to close the popup when the close button is clicked
    setTimeout(hidePopup, 2000); // Automatically hide the popup after 2 seconds, 2000 milliseconds (2 seconds)
}

// Function to hide the popup
function hidePopup() {
    popupContainer.style.display = "none"; // Hide the popup container
}

//Create an event listener for Delete all Marks button
document.getElementById("deleteAllBtn").addEventListener("click", () => {
    //Conformation for delete all the data
    if (confirm("Are you sure, you want to delete all marks?")) {
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

//change the document title dynamically
document.addEventListener("visibilitychange", function () {
    let originalTitle = "Internal Marks";
    if (document.hidden) {
        document.title = "😢 Come back! We miss you!";
        clearTimeout(originalTitle);
    } else {
        document.title = "🙂 Welcome back!";
        // Regardless of the condition, revert to the default title after 5 seconds
        setTimeout(function () {
            document.title = originalTitle; // Replace with your actual default title
        }, 2000); // Run after 2 seconds
    }
});

newBtn.addEventListener("click", toggleEvent); //(+NEW) button even listener

markForm.addEventListener("submit", addMark); // Add an event listener for the "Submit"(Add or Edit) button

cancelButton.addEventListener("click", cancelEdit); // Add an event listener for the "Cancel" button

//once all js(DOM) loaded all element are display
document.addEventListener("DOMContentLoaded", () => {
    renderMarks(); // Initially call this function to display the marks
    toggleEvent(); // Then call this for preload
    notload.forEach((element) => {
        element.style.display = "flex";
    });
});
