// UI Ex https://dribbble.com/shots/19113627-Weather-Dashboard
// UI Ex https://www.google.com/search?client=firefox-b-d&q=weather+rimbo 
// UI Ex https://smarthomescene.com/blog/top-10-home-assistant-weather-cards/ 

// API url https://opendata.smhi.se/apidocs/metfcst/parameters.html

// SOME ICONS TEMPORARILY TAKEN FROM https://www.smhi.se/kunskapsbanken/meteorologi/vaderprognoser/vad-betyder-smhis-vadersymboler-1.12109 

// https://developers.google.com/s/results/maps?q=coordinates&text=coordinates
// https://github.com/sphrak/svenska-stader
/**
 * ~~TODO: modulate fetchAndProcessData
 * ~~TODO: Fix var names
 * TODO: Add icons
 * ~~TODO: Add arrows
 * TODO: Error handling -- show it to user
 * ~~TODO: Unit Testing?
 * ~~TODO: alt text
 */

// Disclaimer
let disclaimerText = "SOME ICONS TEMPORARILY TAKEN FROM https://www.smhi.se/kunskapsbanken/meteorologi/vaderprognoser/vad-betyder-smhis-vadersymboler-1.12109"
console.log(disclaimerText);

// Define the longitude and latitude for the reqd place
let reqdLat = 59.334591;
let reqdLon = 18.063240;
let reqdCoordinates = [reqdLon, reqdLat]  // Notice that longitude is first
let reqdDate;

const LOOPTIMEMS = 6e4;

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
			reqdDate = formatTime(buttonNr);      // Format the selected date
			const tableBody = document.getElementById("weather-table-body");
			tableBody.innerHTML = "";       // Clear the weather table

			fetchAndProcessData(reqdCoordinates, reqdDate);   // Fetch and process data for the selected date
		});
	}
}


// Function to format time string to YYYY-MM-DD
function formatTime(dayOffset = 0) {
	const singleDayTimestamp = 864e5;    // Ammount of miliseconds in one day
	let newDateTimestamp = Date.now() + singleDayTimestamp * dayOffset;
	let ISODateTime = new Date(newDateTimestamp).toISOString().slice(0, 10);
	return ISODateTime;
}


// Update table time header
function updateTableHeader(displayDate) {
	const dateToday = new Date();
	// let clockHours = dateToday.getHours();
	// let clockMinutes = String(dateToday.getMinutes()).padStart(2, '0');
	// let clock = `${clockHours}:${clockMinutes}`;
	document.getElementById("table-date").innerHTML = `${displayDate}`;  //| ${clock}
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

	return `<img src="${imageSrc}" alt="${label}" class="${imgClass}"/><p>${label}</p>`;
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


/// Function to create a table row with time data
function createTimeCell(APIData) {
	let cellContent;
	if (APIData.validTime) {
		cellContent = APIData.validTime.slice(11, 16);
	} 
	
	else {
		cellContent = "No data";
	}

	return createTableCell(cellContent);
}


// Function to create a cell for a parameter
function createParameterCell(parameter, unit, matchingObject) {
	let cellContent;

	if (matchingObject) {
		
		if (parameter === "Wsymb2") {
			let imgNr = matchingObject.values[0];
			cellContent = createWeatherIcon(imgNr);
		} 

		else if (parameter === "wd") {
			let rotateDeg = matchingObject.values[0];
			cellContent = createWindArrow(rotateDeg);
		} 
		
		else {
			let value = matchingObject.values[0];
			
			if (["t", "pmedian", "ws"].includes(parameter)) {
				value = addDecimalIfNeeded(value);
			}
			cellContent = `${value} ${unit}`;
		}
	} 
	
	else {
		cellContent = "No data";
	}

	return createTableCell(cellContent);
}


// Function to create a new table row from API data
function createTableRowFromData(APIData) {
	const newRow = document.createElement("tr");
	newRow.classList.add("api-data");

	// Add time cell to the row
	newRow.appendChild(createTimeCell(APIData));

	const parameterInfo = [
		{ parameter: "Wsymb2", unit: "N/A" },
		{ parameter: "t", unit: "C°" },
		{ parameter: "pmedian", unit: "mm" },
		{ parameter: "r", unit: "%" },
		{ parameter: "ws", unit: "m/s" },
		{ parameter: "wd", unit: "N/A" }
	];

	// Add parameter cells to the row
	parameterInfo.forEach(data => {
		let matchingObject = APIData["parameters"].find(obj => obj.name === data.parameter);
		newRow.appendChild(createParameterCell(data.parameter, data.unit, matchingObject));
	});

	return newRow;
}


// Update table
function updateTable(urlData, validTimeDate) {
	let table = document.getElementById("weather-table-body");
	table.innerHTML = "";

	// Process data and populate the weather table
	for (let timeSerie = 0; timeSerie < urlData.timeSeries.length; timeSerie++) {
		let dataSubset = urlData.timeSeries[timeSerie];

		if (dataSubset["validTime"].includes(validTimeDate.slice(0, 10))) {

			let newRow = createTableRowFromData(dataSubset);

			// Add new row to the weather table
			table.appendChild(newRow);
		}
	}
}


// Function to fetch and process API data
async function fetchAndProcessData(coords, validTimeDate) {
	try {
		let apiUrl = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${coords[0]}/lat/${coords[1]}/data.json`;
		let urlData = await fetchData(apiUrl);

		updateTableHeader(validTimeDate);

		updateTable(urlData, validTimeDate);

	} catch (error) {
		console.error('Error with Promise:', error);
	}
}


// Data that should update x minutes
function requestNewTable(coords) {
	reqdDate = formatTime();
	fetchAndProcessData(coords, reqdDate);
}


// ===================== MAP code ========================
let latLng = [reqdLat, reqdLon]
let forcastAreaCoords = [[52.500440, 2.250475], [52.547483,27.348870], [70.740996, 37.848053], [70.655722, -8.541278]]

var map = L.map('map').setView(latLng, 0).setMaxBounds(forcastAreaCoords);
var marker = L.marker(latLng).addTo(map);

//DEBUG =====================
//L.polygon(forcastAreaCoords, {color: 'green', opacity: 0.2, fillOpacity: 0.07}).addTo(map);
//DEBUG =====================


// Load the image
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 14,
		minZoom: 4,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)


function onMapClick(e) {
	let newCoordsObj = e.latlng;
	
	map.panTo(newCoordsObj);
	marker.setLatLng(newCoordsObj);

	reqdCoordinates = [newCoordsObj.lng.toFixed(6), newCoordsObj.lat.toFixed(6)];

	requestNewTable(reqdCoordinates);

}

map.on('click', onMapClick);



//======================== INIT ========================

// Initialize the buttons and start the update cycle
setButtons();

requestNewTable(reqdCoordinates);
