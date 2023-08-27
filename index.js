// UI Ex https://dribbble.com/shots/19113627-Weather-Dashboard
// UI Ex https://www.google.com/search?client=firefox-b-d&q=weather+runbi
// API url https://opendata.smhi.se/apidocs/metfcst/parameters.html
// ICONS TEMPORARILY TAKEN FROM https://www.smhi.se/kunskapsbanken/meteorologi/vaderprognoser/vad-betyder-smhis-vadersymboler-1.12109 

/**
 * //TODO: modulate fetchAndProcessData
 * //TODO: Fix var names
 * TODO: Add icons
 * TODO: Add arrows
 * TODO: Error handling -- show it to user
 * TODO: Unit Testing?
 * TODO: alt text
 */

console.log("ICONS TEMPORARILY TAKEN FROM https://www.smhi.se/kunskapsbanken/meteorologi/vaderprognoser/vad-betyder-smhis-vadersymboler-1.12109");
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
    newCell.innerHTML = cellContent;
    return newCell;
}


// Create the weather icon
function createWeatherIcon(imgNr) {
    let iconAlt = [
        "Clear sky",
        "Nearly clear sky",
        "Variable cloudiness",
        "Halfclear sky",
        "Cloudy sky",
        "Overcast",
        "Fog",
        "Light rain showers",
        "Moderate rain showers",
        "Heavy rain showers",
        "Thunderstorm",
        "Light sleet showers",
        "Moderate sleet showers",
        "Heavy sleet showers",
        "Light snow showers",
        "Moderate snow showers",
        "Heavy snow showers",
        "Light rain",
        "Moderate rain",
        "Heavy rain",
        "Thunder",
        "Light sleet",
        "Moderate sleet",
        "Heavy sleet",
        "Light snowfall",
        "Moderate snowfall",
        "Heavy snowfall"
    ]

    let imageSrc = `resources/${imgNr}.png`;
    let label = iconAlt[imgNr];
    let imgClass = "weather-icon";
    
    return `<img src="${imageSrc}" alt="${label}" class="${imgClass}"/>`;
}


// Create the wind dir arrow
function createWindArrow(rotateDeg) {
    let imageSrc = "resources/arrow.svg";
    let label = `Arrow ${rotateDeg} degrees`;
    let imgClass = "arrow";
    
    return `<img src="${imageSrc}" alt="${label}" class="${imgClass}" style="-webkit-transform: rotateZ(${rotateDeg}deg); -ms-transform: rotateZ(${rotateDeg}deg); transform: rotateZ(${rotateDeg}deg);"/>`;
}


// Add a decimal if the number doesn't already have one
function addDecimalIfNeeded(number) {
    const numberStr = number.toString();
    return numberStr.includes('.') ? numberStr : numberStr + '.0';
}


// Create new row from data in table
function createTableRowFromData(APIData) {
    // Create new row
    const newRow = document.createElement("tr");
    newRow.classList.add("api-data");

    // Add time to row data
    let cellContent;

    // Handle the case where validTime is missing
    if (APIData.validTime) {
        cellContent = APIData.validTime.slice(11,16);
    }
    else {
        cellContent = "No data";
    }

    // Create a new cell with the time data and append it to the row
    const newCell = createTableCell(cellContent);
    newRow.appendChild(newCell);

    // Define information about parameters and their units
    let parameterInfo = [
        { parameter: "Wsymb2",   unit: "N/A" },
        { parameter: "t",        unit: "C°"  },
        { parameter: "pmedian",  unit: "mm"  },
        { parameter: "r",        unit: "%"   },
        { parameter: "ws",       unit: "m/s" },
        { parameter: "wd",       unit: "N/A" }
    ];

    // Process each parameter's data
    parameterInfo.forEach(data => {
        let parameter = data.parameter;
        let matchingObject = APIData["parameters"].find(obj => obj.name === parameter);
        let cellContent;

        // Check if matchingObject exists for the parameter
        if (matchingObject) {
            // Create content based on parameter type
            if (parameter == "Wsymb2") {
                let imgNr = matchingObject.values[0];
                cellContent = createWeatherIcon(imgNr);
            }

            else if (parameter == "wd") {
                let rotateDeg = matchingObject.values[0];
                cellContent = createWindArrow(rotateDeg);
            }

            else {
                let value = matchingObject.values[0];
                
                if (["t", "pmedian", "ws"].includes(parameter)) {
                    value = addDecimalIfNeeded(value);
                }

                let unit = data.unit;
    
                cellContent = `${value} ${unit}`;
            }
        } 

        // Handle missing data
        else {
            cellContent = "No data";
        }

        // Create and append new cell with the processed content to new row
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
