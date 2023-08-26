// UI Ex https://dribbble.com/shots/19113627-Weather-Dashboard
// UI Ex https://www.google.com/search?client=firefox-b-d&q=weather+runbi
// API url https://opendata.smhi.se/apidocs/metfcst/parameters.html
// TODO Set buttons to look for different hours


// url data
let rqLon = 18.7;
let rqLat = 59.8;
let rqPlace = [rqLon, rqLat]

const dateToday = new Date(); 
let dateObj = new Date();

console.log(dateObj);


// Sets the week buttons
function setButtons() {
    const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    let startDay = weekday[dateObj.getDay()];

    let indexOfStartDay = weekday.findIndex(item => item === startDay);

    // Replace the button texts with correct days
    for ( let buttonNr = 0; buttonNr < 7; buttonNr++ ) {
        let button = document.getElementById(`day-${buttonNr}`);
        button.textContent += weekday[indexOfStartDay];

        indexOfStartDay = (indexOfStartDay + 1) % weekday.length;

        // Button js
        button.addEventListener("click", () => {
            // Format new date array to API friendly format
            rqDate = formatTime( buttonNr );

            // Clear table
            const tableBody = document.getElementById("weather-table");
            tableBody.innerHTML = "";

            // Request new data
            fetchAndProcessData( rqPlace , rqDate);
        });
    }
}


// Formats time string to YYYY-MM-DD
function formatTime( _extraDays = 0 ) {
    const singleDayTimestamp = 86400000;

    let newDateTimestamp = Date.now() + singleDayTimestamp * _extraDays;
    console.log("newDateTimestamp:",newDateTimestamp);

    let ISODateTime = new Date(newDateTimestamp).toISOString().slice(0, 10);
    console.log("ISODateTime:",ISODateTime);


    return ISODateTime;
}


// Fetches api data
async function fetchData(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        //console.log('Success fetching data.');
        return data;
    } 
    catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}


// Fetches and processes api data
async function fetchAndProcessData( _place, _time) {
    //! OBS _time needs to be in the YYYY-MM-DD format
    try {
        // url
        let apiUrl = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${_place[0]}/lat/${_place[1]}/data.json`;

        let urlData = await fetchData(apiUrl); 
        //console.log(urlData);

        let clockHours = dateObj.getHours();
        let clockMinuntes = String(dateObj.getMinutes()).padStart(2, '0');
        let clock = `${clockHours}:${clockMinuntes}`;

        document.getElementById("table-date").innerHTML = `${_time} | ${clock}`;

        const tableBody = document.getElementById("weather-table");

        // Fectch data
        for (let timeSerie = 0; timeSerie < urlData.timeSeries.length; timeSerie++) {
                let data = urlData.timeSeries[timeSerie];

                if ( data["validTime"].includes(_time.slice(0, 10)) ) {

                    const newRow = document.createElement("tr");
                    newRow.classList.add("api-data");

                    // Find data parameters
                    let dataParameterArray = [
                        "Wsymb2",
                        "t",
                        "pmedian",
                        "r",
                        "ws",
                        "wd"]
                        
                    const newCell = document.createElement("td");
                    newCell.textContent = data["validTime"];
                    newRow.appendChild(newCell);

                    // Filter data
                    dataParameterArray.map(parameter => {
                        let matchingObject = data["parameters"].find(obj => obj.name === parameter);
                        
                        const newCell = document.createElement("td");
                        
                        unit = matchingObject ? matchingObject.unit : null,
                        value = matchingObject ? matchingObject.values : null
                        
                        newCell.textContent = `${value} ${unit}`;
                        newRow.appendChild(newCell);
                    });

                    // Add new row
                    tableBody.appendChild(newRow);        
            }    
        }
    } 
    catch (error) {
        
        console.error('Error with Promise:', error);
    }
}


let validTime = formatTime();

setButtons();
fetchAndProcessData( rqPlace, validTime );