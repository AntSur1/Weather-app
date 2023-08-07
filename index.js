// UI Ex https://dribbble.com/shots/19113627-Weather-Dashboard
// UI Ex https://www.google.com/search?client=firefox-b-d&q=weather+runbi
// API url https://opendata.smhi.se/apidocs/metfcst/parameters.html
// TODO Set buttons to look for different hours


// url data
let rqDate;
let rqTime = 18;
let rqLon = 18.3;
let rqLat = 59.8;
let rqPlace = [rqLon, rqLat]

const dateToday = new Date(); 
let dateObj = new Date(); 

//rqTime = (dateObj.getHours() + 1) % 24;
rqDate = dateObj.toLocaleDateString();

const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


function setButtons() {
    let startDay = weekday[dateObj.getDay()];

    let indexOfStartDay = weekday.findIndex(item => item === startDay);

    // Replace the button texts with correct days
    for ( let buttonNr = 0; buttonNr < 7; buttonNr++ ) {
        let button = document.getElementById(`day-${buttonNr}`);
        button.textContent += weekday[indexOfStartDay];

        indexOfStartDay = (indexOfStartDay + 1) % weekday.length;

        button.addEventListener("click", () => {
            
            dateObj.setDate(dateToday.getDate() + buttonNr);
            rqDate = dateObj.toLocaleDateString();
            
            fetchAndProcessData( rqDate, rqTime, rqPlace );
        });
    }
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


// Formats current time to DD-MM-YYYYThh:00:00
function formatTime() {
    let requestDay = dateObj.getDate() <= 9 ? `0${dateObj.getDate()}` : dateObj.getDate();
    let requestMonth = dateObj.getMonth() + 1 <= 9 ? `0${dateObj.getMonth() + 1}` : dateObj.getMonth() + 1;
    let requestYear = dateObj.getFullYear();

    let formattedDateTime = `${requestYear}-${requestMonth}-${requestDay}T${rqTime}:00:00Z`;

    return formattedDateTime;
}


// Fetches and processes api data
async function fetchAndProcessData( date, time, place ) {
    try {
        // Set the "Date Time Place" text here before fetching the data
        let dateTimePlace = `${date} | ${time}:00 | ${place[0]}°N, ${place[1]}°N`;
        document.getElementById('dateTimePlace').textContent = dateTimePlace;

        // url
        let apiUrl = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${place[0]}/lat/${place[1]}/data.json`;

        let urlData = await fetchData(apiUrl); 
        let validTime = formatTime();
        console.log(validTime);
        console.error(urlData.timeSeries);

        // Fectch data
        for (let i = 0; i < urlData.timeSeries.length; i++) {

            // Find validTime data (right day and time)
            if (urlData.timeSeries[i].validTime == validTime) {
                let data = urlData.timeSeries[i];
                //console.log(data);

                // Find data parameters
                let dataParameterNameArray = [
                    "Wsymb2",
                    "t",
                    "pmedian",
                    "r",
                    "ws",
                    "wd"]

                for (let dataParameter = 0; dataParameter < data.parameters.length; dataParameter++) {

                    // Compare the parameter name to array
                    for (let parameterName = 0; parameterName < dataParameterNameArray.length; parameterName++) {

                        // Save if found matching name
                        if (data.parameters[dataParameter].name == dataParameterNameArray[parameterName]) {
                            //console.log(dataParameterNameArray[parameterName] + " " + data.parameters[dataParameter].values[0] + " " + data.parameters[dataParameter].unit);
                            let parameterValue = data.parameters[dataParameter].values[0];
                            let parameterUnit = data.parameters[dataParameter].unit;
                            let parameterCellId = dataParameterNameArray[parameterName];
                  
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

fetchAndProcessData( rqDate, rqTime, rqPlace );