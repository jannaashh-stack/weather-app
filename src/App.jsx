
import { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchWeather(event) {
    event.preventDefault();

    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=en&format=json`
      );

      if (!geoResponse.ok) {
        throw new Error("Unable to search for this city.");
      }

      const geoData = await geoResponse.json();
      const place = geoData.results?.[0];

      if (!place) {
        throw new Error("City not found. Please try another name.");
      }

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`
      );

      if (!weatherResponse.ok) {
        throw new Error("Unable to fetch weather data.");
      }

      const weatherData = await weatherResponse.json();

      setWeather({
        city: place.name,
        country: place.country || "",
        temperature: weatherData.current.temperature_2m,
        feelsLike: weatherData.current.apparent_temperature,
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: weatherData.current.wind_speed_10m,
        precipitation: weatherData.current.precipitation,
        condition: getWeatherCondition(
          weatherData.current.weather_code
        ),
        isDay: weatherData.current.is_day,
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function getWeatherCondition(code) {
    if (code === 0) return "Clear sky";
    if ([1, 2].includes(code)) return "Partly cloudy";
    if (code === 3) return "Overcast";
    if ([45, 48].includes(code)) return "Foggy";
    if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
      return "Rainy";
    }
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return "Snowy";
    }
    if ([95, 96, 99].includes(code)) return "Thunderstorm";
    return "Weather unavailable";
  }

  return (
    <div className="weather-app">
      <div className="weather-card">
        <h1>Weather App</h1>
        <p className="subtitle">
          Discover the weather in your city
        </p>

        <form className="search-form" onSubmit={searchWeather}>
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {loading && <p className="status-message">Loading weather...</p>}

        {weather && !loading && (
          <div className="weather-result">
            <h2>
              {weather.city}, {weather.country}
            </h2>

            <div className="weather-icon">
              {weather.condition.includes("Rain")
                ? "🌧️"
                : weather.condition === "Thunderstorm"
                ? "⛈️"
                : weather.condition === "Snowy"
                ? "❄️"
                : weather.condition === "Foggy"
                ? "🌫️"
                : weather.condition.includes("cloud") ||
                  weather.condition === "Overcast"
                ? "☁️"
                : weather.isDay
                ? "☀️"
                : "🌙"}
            </div>

            <h3 className="temperature">
              {weather.temperature}°C
            </h3>

            <p className="condition">{weather.condition}</p>
            <p className="feels-like">
              Feels like {weather.feelsLike}°C
            </p>

            <div className="weather-details">
              <div className="detail">
                <span>💧</span>
                <p>Humidity</p>
                <strong>{weather.humidity}%</strong>
              </div>

              <div className="detail">
                <span>💨</span>
                <p>Wind Speed</p>
                <strong>{weather.windSpeed} km/h</strong>
              </div>

              <div className="detail">
                <span>🌧️</span>
                <p>Precipitation</p>
                <strong>{weather.precipitation} mm</strong>
              </div>
            </div>
          </div>
        )}

        {!weather && !loading && !error && (
          <p className="empty-message">
            Search for a city to see its weather.
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
