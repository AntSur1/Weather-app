// https://dribbble.com/shots/19113627-Weather-Dashboard
// https://www.google.com/search?client=firefox-b-d&q=weather+runbi


// url data
let lat = 59.8;
let lon = 18.3;
let requestTime = 18;


function formatTime() {
    const date = new Date();

    let requestDay = date.getDate() <= 9 ? `0${date.getDate()}` : date.getDate();
    let requestMonth = date.getMonth() + 1 <= 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    let requestYear = date.getFullYear();

    let formattedDateTime = `${requestYear}-${requestMonth}-${requestDay}T${requestTime}:00:00Z`;
    console.log(formattedDateTime);

    return formattedDateTime;
}


// url
let apiUrl = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon}/lat/${lat}/data.json`;


async function fetchData() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log('Success fetching data.');
        return data;
    } 
    catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}


async function fetchAndProcessData() {
    try {
        // Set the "Date Time Place" text here before fetching the data
        const date = new Date();
        const options = { hour12: false, hour: '2-digit', minute: '2-digit' };
        const dateTimePlace = `${date.toLocaleDateString()} | ${requestTime}:00 | ${lat}°N, ${lon}°N`; // Modify "Place" with the actual location
        document.getElementById('dateTimePlace').textContent = dateTimePlace;

        let urlData = await fetchData(); 
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
                            console.log(dataParameterNameArray[parameterName] + " " + data.parameters[dataParameter].values[0] + " " + data.parameters[dataParameter].unit);
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


fetchAndProcessData();