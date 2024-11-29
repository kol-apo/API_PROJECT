const API_KEY = '954e275e80mshf3c345360328bb1p1ca339jsnd3f53cdfd325'; // Replace with your OpenWeatherMap API key
const locationInput = document.getElementById('location-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const currentWeather = document.getElementById('current-weather');
const forecastContainer = document.getElementById('forecast-container');
const errorMessage = document.getElementById('error-message');

// Event Listeners
// searchBtn.addEventListener('click', () => fetchWeather(locationInput.value));
// locationInput.addEventListener('keypress', (e) => {
//     if (e.key === 'Enter') fetchWeather(locationInput.value);
// });
// locationBtn.addEventListener('click', getUserLocation);

async function fetchWeatherData(lat, long) {
    const url = `https://open-weather13.p.rapidapi.com/city/latlon/${lat}/${long}`;

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'open-weather13.p.rapidapi.com',
            'x-rapidapi-key': '954e275e80mshf3c345360328bb1p1ca339jsnd3f53cdfd325',
        }
    };

    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
    }

    const json = await response.json();
    
    console.log({ json })

    return json
}
// Fetch Weather by City Name
async function fetchWeather(city) {
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    try {
        // Clear previous data
        currentWeather.innerHTML = '';
        forecastContainer.innerHTML = '';
        errorMessage.textContent = '';

        // Current Weather
        const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const currentData = await currentResponse.json();

        if (currentData.cod !== 200) {
            showError(currentData.message);
            return;
        }

        // 5-Day Forecast
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastResponse.json();

        displayCurrentWeather(currentData);
        displayForecast(forecastData);
    } catch (error) {
        console.error('Weather fetch error:', error);
        showError('Failed to fetch weather data');
    }
}

// Display Current Weather
function displayCurrentWeather(data) {
    const { name, main, weather, wind } = data;
    
    currentWeather.innerHTML = `
        <h2>${name}</h2>
        <div class="current-weather-details">
            <div>
                <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="${weather[0].description}" class="weather-icon">
                <p>${weather[0].description}</p>
            </div>
            <div>
                <h3 class="temperature">${Math.round(main.temp)}°C</h3>
                <p>Feels like ${Math.round(main.feels_like)}°C</p>
            </div>
            <div>
                <p>Humidity: ${main.humidity}%</p>
                <p>Wind: ${wind.speed} m/s</p>
            </div>
        </div>
    `;
}

// Display 5-Day Forecast
function displayForecast(data) {
    // Group forecast by day
    const dailyForecasts = {};
    data.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (!dailyForecasts[day]) {
            dailyForecasts[day] = {
                temps: [],
                icon: forecast.weather[0].icon
            };
        }
        
        dailyForecasts[day].temps.push(forecast.main.temp);
    });

    // Create forecast cards
    Object.entries(dailyForecasts).slice(0, 5).forEach(([day, data]) => {
        const avgTemp = Math.round(
            data.temps.reduce((a, b) => a + b, 0) / data.temps.length
        );

        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');
        forecastCard.innerHTML = `
            <h3>${day}</h3>
            <img src="https://openweathermap.org/img/wn/${data.icon}@2x.png" alt="Weather Icon" class="forecast-icon">
            <p>${avgTemp}°C</p>
        `;

        forecastContainer.appendChild(forecastCard);
    });
}

// Get User's Geolocation
async function getUserLocation() {
    return await new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    resolve({latitude, longitude});
                },
                error => {
                    reject(error);
                }
            );
        } else {
            reject(new Error('Geolocation is not supported by your browser'));
        }
    })
}

// Fetch Weather by Coordinates
async function fetchWeatherByCoords(lat, lon) {
    try {
        const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const currentData = await currentResponse.json();

        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastResponse.json();

        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        
        // Update input with city name
        locationInput.value = currentData.name;
    } catch (error) {
        console.error('Coordinates weather fetch error:', error);
        showError('Failed to fetch weather data by location');
    }
}

// Show Error Message
function showError(message) {
    errorMessage.textContent = message;
    currentWeather.innerHTML = '';
    forecastContainer.innerHTML = '';
}

function displayWeatherData(apiResponse){
    // Populate data
document.getElementById('city-name').textContent = `${apiResponse.name}, ${apiResponse.sys.country}`;
document.getElementById('temperature').textContent = `${Math.round(apiResponse.main.temp)}°C`;
document.getElementById('weather-description').textContent = apiResponse.weather[0].description;
document.getElementById('feels-like').textContent = Math.round(apiResponse.main.feels_like);
document.getElementById('humidity').textContent = apiResponse.main.humidity;
document.getElementById('wind-speed').textContent = apiResponse.wind.speed;
document.getElementById('pressure').textContent = apiResponse.main.pressure;

// Update weather icon
document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${apiResponse.weather[0].icon}@2x.png`;
document.getElementById('weather-icon').alt = apiResponse.weather[0].description;
}


async function main(){
    const { latitude, longitude } = await getUserLocation();

    const response = await fetchWeatherData(latitude, longitude);
    
    displayWeatherData(response);
}


// Optional: Load weather for a default city on page load
document.addEventListener('DOMContentLoaded', async () => await main());