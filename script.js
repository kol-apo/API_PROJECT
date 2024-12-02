const API_KEY = '954e275e80mshf3c345360328bb1p1ca339jsnd3f53cdfd325'; // Replace with your OpenWeatherMap API key
const locationInput = document.getElementById('location-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const currentWeather = document.getElementById('current-weather');
const forecastContainer = document.getElementById('forecast-container');
const errorMessage = document.getElementById('error-message');

// Fetch Weather by Coordinates
async function fetchWeatherData(lat, long) {
    const url = `https://open-weather13.p.rapidapi.com/city/latlon/${lat}/${long}`;

    const env = await loadEnv();

    console.log({ env })

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'open-weather13.p.rapidapi.com',
            'x-rapidapi-key': env.API_KEY,
        }
    };

    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
    }

    return await response.json();
}

async function loadEnv() {
    const response = await fetch('secrets.env');
    const envText = await response.text();
    const env = {};
  
    envText.split('\n').forEach(line => {
      // Skip comments and empty lines
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=').map(part => part.trim());
        // Remove quotes if present
        env[key] = value.replace(/^["']|["']$/g, '');
      }
    });
  
    return env;
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
    try {
        
        const { latitude, longitude } = await getUserLocation();
    
        const response = await fetchWeatherData(latitude, longitude);
        
        displayWeatherData(response);
    } catch (error) {
        
    }
}


// Optional: Load weather for a default city on page load
document.addEventListener('DOMContentLoaded', async () => await main());