let apiKey = 'c6c62bbd217c5f9e1d1153a9baa5ce0b'

//Defined variables for HTML
let searchInput = $('.searchInput');
let searchBtn = $('.searchBtn');
let currentDate = $('.currentDate');
let weatherIconEl = $('.weatherIcon')
let tempEl = $('.temp');
let cityNameEl = $('.cityName');
let searchHistoryEl = $('.historyItems');
let humidityEl = $('.humidity');
let windSpeedEl = $('.windSpeed');
let uvIndexEl = $('.uvIndex');
let cardRow = $(".card-row");

//Current Date 
var today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0');
let yyyy = today.getFullYear();
var today = mm + '/' + dd + '/' + yyyy;

//Gets the weather when user hits search
searchBtn.on('click', function(index) {
    index.preventDefault();
    getWeather(searchInput.val());
});

// Renders history if there is a history
function renderSearchHistory(cityName) {
    searchHistoryEl.empty();
    let searchHistoryArr = JSON.parse(localStorage.getItem('searchHistory'));
    for (let i = 0; i < searchHistoryArr.length; i++) {
        let newListItem = $("<li>").attr("class", "historyEntry");
        newListItem.text(searchHistoryArr[i]);
        searchHistoryEl.prepend(newListItem);
    }
}
if (JSON.parse(localStorage.getItem('searchHistory')) === null) {
    console.log('No search history')
} else {
    renderSearchHistory();
}

//click history items
$(document).on('click', ".historyEntry", function() {
    let thisElement = $(this);
    getWeather(thisElement.text());
});

//Renders weather data on right side of page for selected city
function renderWeatherData(cityName, cityTemp, cityHumidity, cityWindSpeed, cityWeatherIcon, uvVal) {
    cityNameEl.text(cityName)
    currentDate.text(`(${today})`)
    tempEl.text(`Temperature: ${cityTemp} °F`);
    humidityEl.text(`Humidity: ${cityHumidity}%`);
    windSpeedEl.text(`Wind Speed: ${cityWindSpeed} MPH`);
    uvIndexEl.text(`UV Index: ${uvVal}`);
    weatherIconEl.attr("src", cityWeatherIcon);
}

//Gets weather data from API for the searched city
function getWeather(searchedCity) {
    let queryUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchedCity}&APPID=${apiKey}&units=imperial`;
    $.ajax({ //Allows the page to update without reloading the page
        url: queryUrl,
        method: "GET"
    })
    .then(function(weatherData) {
        let cityObj = {
            cityName: weatherData.name,
            cityTemp: weatherData.main.temp,
            cityHumidity: weatherData.main.humidity,
            cityWindSpeed: weatherData.wind.speed,
            cityUVIndex: weatherData.coord,
            cityWeatherIconName: weatherData.weather[0].icon
        }
    let queryUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${cityObj.cityUVIndex.lat}&lon=${cityObj.cityUVIndex.lon}&APPID=${apiKey}&units=imperial`
    $.ajax({
        url: queryUrl,
        method: 'GET'
    })
    .then(function(uvData) {
        if (JSON.parse(localStorage.getItem("searchHistory")) == null) {
            let searchHistoryArr = [];
            if (searchHistoryArr.indexOf(cityObj.cityName) === -1) {
                searchHistoryArr.push(cityObj.cityName);
                localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArr));
                let renderedWeatherIcon = `https:///openweathermap.org/img/w/${cityObj.cityWeatherIconName}.png`;
                renderWeatherData(cityObj.cityName, cityObj.cityTemp, cityObj.cityHumidity, cityObj.cityWindSpeed, renderedWeatherIcon, uvData.value);
                renderSearchHistory(cityObj.cityName);
            }else {
                let renderedWeatherIcon = `https://openweathermap.org/img/w/${cityObj.cityWeatherIconName}.png`;
                renderWeatherData(cityObj.cityName, cityObj.cityTemp, cityObj.cityHumidity, cityObj.cityWindSpeed, renderedWeatherIcon, uvData.value);
            }
        }else{
            let searchHistoryArr = JSON.parse(localStorage.getItem('searchHistory'));
            if (searchHistoryArr.indexOf(cityObj.cityName) === -1) {
                searchHistoryArr.push(cityObj.cityName);
                localStorage.setItem('searchHistory', JSON.stringify(searchHistoryArr));
                let renderedWeatherIcon = `https://openweathermap.org/img/w/${cityObj.cityWeatherIconName}.png`;
                renderWeatherData(cityObj.cityName, cityObj.cityTemp, cityObj.cityHumidity, cityObj.cityWindSpeed, renderedWeatherIcon, uvData.value);
                renderSearchHistory(cityObj.cityName);
            }else {
                let renderedWeatherIcon = `https://openweathermap.org/img/w/${cityObj.cityWeatherIconName}.png`;
                renderWeatherData(cityObj.cityName, cityObj.cityTemp, cityObj.cityHumidity, cityObj.cityWindSpeed, renderedWeatherIcon, uvData.value);
            }
        }
    })

    });
    getFiveDayForecast();
//Five Day Forecast card 
    function getFiveDayForecast() {
        cardRow.empty();
        let queryUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${searchedCity}&APPID=${apiKey}&units=imperial`;
        $.ajax({
            url: queryUrl,
            method: "GET"
        })
        .then(function(fiveDayReponse) {
            for (let i = 0; i != fiveDayReponse.list.length; i+=8 ) {
                let cityObj = {
                    date: fiveDayReponse.list[i].dt_txt,
                    icon: fiveDayReponse.list[i].weather[0].icon,
                    temp: fiveDayReponse.list[i].main.temp,
                    humidity: fiveDayReponse.list[i].main.humidity
                }
                let dateStr = cityObj.date;
                let shortDate = dateStr.substring(0, 10); 
                let weatherIcon = `https://openweathermap.org/img/w/${cityObj.icon}.png`;
                createForecastCard(shortDate, weatherIcon, cityObj.temp, cityObj.humidity);
            }
        })
    }   
}

//Writes forecast info into card on HTML page
function createForecastCard(date, icon, temp, humidity) {

    let fiveDayCard = $("<div>").attr("class", "five-day-card");
    let cardDate = $("<h2>").attr("class", "card-text");
    let cardIcon = $("<img>").attr("class", "weatherIcon");
    let cardTemp = $("<p>").attr("class", "card-text");
    let cardHumidity = $("<p>").attr("class", "card-text");

    cardRow.append(fiveDayCard);
    cardDate.text(date);
    cardIcon.attr("src", icon);
    cardTemp.text(`Temp: ${temp} °F`);
    cardHumidity.text(`Humidity: ${humidity}%`);
    fiveDayCard.append(cardDate, cardIcon, cardTemp, cardHumidity);
}