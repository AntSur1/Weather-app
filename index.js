// UI Ex https://dribbble.com/shots/19113627-Weather-Dashboard
// UI Ex https://www.google.com/search?client=firefox-b-d&q=weather+runbi
// API url https://opendata.smhi.se/apidocs/metfcst/parameters.html
/**
 * //TODO: modulate fetchAndProcessData
 * TODO: Fix var names
 * TODO: Add icons
 * TODO: Add arrows
 * TODO: Error handling -- show it to user
 * TODO: 
 */

// Define the longitude and latitude for the requested place
let rqLon = 18.7;
let rqLat = 59.8;
let rqPlace = [rqLon, rqLat]


// Function to set up the week buttons for different days
function setButtons() {
    const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dateToday = new Date();

    // Find the start day's index
    let startDay = weekday[dateToday.getDay()];
    let indexOfStartDay = weekday.findIndex(item => item === startDay);

    // Replace button texts with correct days
    for (let buttonNr = 0; buttonNr < 7; buttonNr++) {
        let button = document.getElementById(`day-${buttonNr}`);
        button.textContent += weekday[indexOfStartDay];

        indexOfStartDay = (indexOfStartDay + 1) % weekday.length;

        // Add a click event listener to each button
        button.addEventListener("click", () => {
            let rqDate = formatTime(buttonNr);      // Format the selected date
            const tableBody = document.getElementById("weather-table");
            tableBody.innerHTML = "";       // Clear the weather table
            fetchAndProcessData(rqPlace, rqDate);   // Fetch and process data for the selected date
        });
    }
}

// Function to format time string to YYYY-MM-DD
function formatTime(_extraDays = 0) {
    const singleDayTimestamp = 86400000;    // Ammount of miliseconds in one day
    let newDateTimestamp = Date.now() + singleDayTimestamp * _extraDays;
    let ISODateTime = new Date(newDateTimestamp).toISOString().slice(0, 10);
    return ISODateTime;
}


// Update table time header
function updateTableHeader(date) {
    const dateToday = new Date();
    let clockHours = dateToday.getHours();
    let clockMinutes = String(dateToday.getMinutes()).padStart(2, '0');
    let clock = `${clockHours}:${clockMinutes}`;
    document.getElementById("table-date").innerHTML = `${date} | ${clock}`;
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
function createTableCell(content) {
    const newCell = document.createElement("td");
    newCell.textContent = content;
    return newCell;
}


// Create new row from data in table
function createTableRowFromData(data) {
    // Create row
    const newRow = document.createElement("tr");
    newRow.classList.add("api-data");

    // Add time to row data
    let cellContent;

    // Error handling
    if (data.validTime) {
        cellContent = data.validTime;
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
        let matchingObject = data["parameters"].find(obj => obj.name === parameter);

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
function updateTable(urlData, _date) {
    // Process data and populate the weather table
    for (let timeSerie = 0; timeSerie < urlData.timeSeries.length; timeSerie++) {
        let data = urlData.timeSeries[timeSerie];

        if (data["validTime"].includes(_date.slice(0, 10))) {

            let newRow = createTableRowFromData(data);

            // Add new row to the weather table
            document.getElementById("weather-table").appendChild(newRow);
        }
    }
}

// Function to fetch and process API data
async function fetchAndProcessData(_place, _date) {
    try {
        let apiUrl = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${_place[0]}/lat/${_place[1]}/data.json`;
        let urlData = await fetchData(apiUrl);

        updateTableHeader(_date);

        const tableBody = document.getElementById("weather-table");

        // Process data and populate the weather table
        updateTable(urlData, _date);

    } catch (error) {
        console.error('Error with Promise:', error);
    }
}

// Format the current time
let validTime = formatTime();

// Initialize the buttons and fetch data for the initial validTime
setButtons();
fetchAndProcessData(rqPlace, validTime);
