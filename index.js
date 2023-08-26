// UI Ex https://dribbble.com/shots/19113627-Weather-Dashboard
// UI Ex https://www.google.com/search?client=firefox-b-d&q=weather+runbi
// API url https://opendata.smhi.se/apidocs/metfcst/parameters.html
/**
 * //TODO: modulate fetchAndProcessData
 * //TODO: Fix var names
 * TODO: Add icons
 * TODO: Add arrows
 * TODO: Error handling -- show it to user
 * TODO: 
 */

// Define the longitude and latitude for the requested place
let requestedLon = 18.7;
let requestedLat = 59.8;
let requestedCoordinates = [requestedLon, requestedLat]


// Function to set up the week buttons for different days
function setButtons() {
    const weekdayArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dateToday = new Date();

    // Find the start day's index
    let startDay = weekdayArray[dateToday.getDay()];
    let indexOfStartDay = weekdayArray.findIndex(item => item === startDay);

    // Replace button texts with correct days
    for (let buttonNr = 0; buttonNr < weekdayArray.length; buttonNr++) {
        const button = document.getElementById(`day-${buttonNr}`);
        button.textContent += weekdayArray[indexOfStartDay];

        indexOfStartDay = (indexOfStartDay + 1) % weekdayArray.length;

        // Add a click event listener to each button
        button.addEventListener("click", () => {
            let rqDate = formatTime(buttonNr);      // Format the selected date
            const tableBody = document.getElementById("weather-table");
            tableBody.innerHTML = "";       // Clear the weather table

            fetchAndProcessData(requestedCoordinates, rqDate);   // Fetch and process data for the selected date
        });
    }
}

// Function to format time string to YYYY-MM-DD
function formatTime(dayOffset = 0) {
    const singleDayTimestamp = 86400000;    // Ammount of miliseconds in one day
    let newDateTimestamp = Date.now() + singleDayTimestamp * dayOffset;
    let ISODateTime = new Date(newDateTimestamp).toISOString().slice(0, 10);
    return ISODateTime;
}


// Update table time header
function updateTableHeader(displayDate) {
    const dateToday = new Date();
    let clockHours = dateToday.getHours();
    let clockMinutes = String(dateToday.getMinutes()).padStart(2, '0');
    let clock = `${clockHours}:${clockMinutes}`;
    document.getElementById("table-date").innerHTML = `${displayDate} | ${clock}`;
}


// Function to fetch data from the API
async function fetchData(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}


// Create new cell
function createTableCell(cellContent) {
    const newCell = document.createElement("td");
    newCell.textContent = cellContent;
    return newCell;
}


// Create new row from data in table
function createTableRowFromData(APIData) {
    // Create row
    const newRow = document.createElement("tr");
    newRow.classList.add("api-data");

    // Add time to row data
    let cellContent;

    // Error handling
    if (APIData.validTime) {
        cellContent = APIData.validTime;
    }
    else {
        cellContent = "No data";
    }

    const newCell = createTableCell(cellContent);
    newRow.appendChild(newCell);

    let dataParameterArray = [
        "Wsymb2",
        "t",
        "pmedian",
        "r",
        "ws",
        "wd"
    ];

    // Filter and add sought after dataParameterArray to row data
    dataParameterArray.map(parameter => {
        let matchingObject = APIData["parameters"].find(obj => obj.name === parameter);

        let cellContent;

        // Error handling
        if (matchingObject) {
            cellContent = `${matchingObject.values} ${matchingObject.unit}`;
        }
        else {
            cellContent = "No data";
        }

        const newCell = createTableCell(cellContent);
        
        newRow.appendChild(newCell);
    });

    return newRow;
}


// Update table
function updateTable(urlData, validTimeDate) {
    // Process data and populate the weather table
    for (let timeSerie = 0; timeSerie < urlData.timeSeries.length; timeSerie++) {
        let dataSubset = urlData.timeSeries[timeSerie];

        if (dataSubset["validTime"].includes(validTimeDate.slice(0, 10))) {

            let newRow = createTableRowFromData(dataSubset);

            // Add new row to the weather table
            document.getElementById("weather-table").appendChild(newRow);
        }
    }
}


// Function to fetch and process API data
async function fetchAndProcessData(coords, validTimeDate) {
    try {
        let apiUrl = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${coords[0]}/lat/${coords[1]}/data.json`;
        let urlData = await fetchData(apiUrl);

        updateTableHeader(validTimeDate);

        const tableBody = document.getElementById("weather-table");

        // Process data and populate the weather table
        updateTable(urlData, validTimeDate);

    } catch (error) {
        console.error('Error with Promise:', error);
    }
}

// Format the current time
let validTime = formatTime();

// Initialize the buttons and fetch data for the initial validTime
setButtons();
fetchAndProcessData(requestedCoordinates, validTime);
