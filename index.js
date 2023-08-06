// UI Ex https://dribbble.com/shots/19113627-Weather-Dashboard
// UI Ex https://www.google.com/search?client=firefox-b-d&q=weather+runbi
// API url https://opendata.smhi.se/apidocs/metfcst/parameters.html

//TODO add wind direction
// url data
let rqLat = 59.8;
let rqLon = 18.3;
let rqTime = 18;

const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


function setButtons() {
    const d = new Date();
    let startDay = weekday[d.getDay()];

    let indexOfStartDay = weekday.findIndex(item => item === startDay);

    // Replace the button texts with correct days
    for ( let buttonNr = 0; buttonNr < 7; buttonNr++ ) {
        let button = document.getElementById(`day-${buttonNr}`);
        button.textContent += weekday[indexOfStartDay];
        console.log(indexOfStartDay);

        indexOfStartDay = (indexOfStartDay >= weekday.length - 1) ? 0 : (indexOfStartDay + 1);

        button.addEventListener("click", () => {
            console.log(buttonNr);
        });
    }
}


// Formats time to DD-MM-YYYYThh:00:00
function formatTime() {
    const date = new Date();

    let requestDay = date.getDate() <= 9 ? `0${date.getDate()}` : date.getDate();
    let requestMonth = date.getMonth() + 1 <= 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    let requestYear = date.getFullYear();

    let formattedDateTime = `${requestYear}-${requestMonth}-${requestDay}T${rqTime}:00:00Z`;

    return formattedDateTime;
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
async function fetchAndProcessData( date, time = rqTime, place = (rqLat, rqLon) ) {
    try {
        // Set the "Date Time Place" text here before fetching the data
        const date = new Date();
        const dateTimePlace = `${date.toLocaleDateString()} | ${rqTime}:00 | ${rqLat}°N, ${rqLon}°N`;
        document.getElementById('dateTimePlace').textContent = dateTimePlace;

        // url
        let apiUrl = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${rqLon}/lat/${rqLat}/data.json`;

        let urlData = await fetchData(apiUrl); 
        let validTime = formatTime();

        // Fectch data
        for (let i = 0; i < urlData.timeSeries.length; i++) {

            // Find validTime data (right day and time)
            if (urlData.timeSeries[i].validTime == validTime) {
                const data = urlData.timeSeries[i];
                console.log(data);

                // Find data parameters
                let dataParameterNameArray = [
                    "Wsymb2",
                    "t",
                    "pmedian",
                    "r",
                    "ws"]

                for (let dataParameter = 0; dataParameter < data.parameters.length; dataParameter++) {

                    // Compare the parameter name to array
                    for (let parameterName = 0; parameterName < dataParameterNameArray.length; parameterName++) {

                        // Save if found matching name
                        if (data.parameters[dataParameter].name == dataParameterNameArray[parameterName]) {
                            //console.log(dataParameterNameArray[parameterName] + " " + data.parameters[dataParameter].values[0] + " " + data.parameters[dataParameter].unit);
                            const parameterValue = data.parameters[dataParameter].values[0];
                            const parameterUnit = data.parameters[dataParameter].unit;
                            const parameterCellId = dataParameterNameArray[parameterName];
                  
                            // Update the corresponding table cell with the fetched data
                            document.getElementById(parameterCellId).textContent = parameterValue + " " + parameterUnit;
                        }

                    }
                    
                    

                }


                break;
            }
            /*
            else {
                console.error("Error: validTime not found");
            }
            */
        }

    } 
    catch (error) {
        
        console.error('Error with Promise:', error);
    }
}

setButtons();

fetchAndProcessData();