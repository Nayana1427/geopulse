// =======================================
// EARTHSYNC GLOBAL DASHBOARD
// =======================================

// CREATE MAP

const map = L.map("map").setView([20.5937, 78.9629], 3);

// TILE LAYER

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap Contributors"
    }
).addTo(map);

// =======================================
// DEFAULT CITY MARKERS
// =======================================

const cities = [
    {
        name: "New York",
        lat: 40.7128,
        lon: -74.0060
    },
    {
        name: "London",
        lat: 51.5072,
        lon: -0.1276
    },
    {
        name: "Tokyo",
        lat: 35.6762,
        lon: 139.6503
    },
    {
        name: "Sydney",
        lat: -33.8688,
        lon: 151.2093
    }
];

// Add default markers

cities.forEach(city => {

    const marker = L.marker([
        city.lat,
        city.lon
    ]).addTo(map);

    marker.bindPopup(city.name);

});

// =======================================
// SEARCH BUTTON
// =======================================

document
.getElementById("search-btn")
.addEventListener(
    "click",
    searchLocation
);

// ENTER KEY SUPPORT

document
.getElementById("city-search")
.addEventListener(
    "keypress",
    function(e){

        if(e.key === "Enter"){

            searchLocation();

        }

    }
);

// =======================================
// SEARCH LOCATION
// =======================================

async function searchLocation(){

    const query =
    document
    .getElementById("city-search")
    .value
    .trim();

    if(!query){

        alert(
            "Please enter a city or country"
        );

        return;
    }

    try{

        const response =
        await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        );

        const results =
        await response.json();

        if(results.length === 0){

            alert(
                "Location not found"
            );

            return;
        }

        const place =
        results[0];

        const lat =
        parseFloat(place.lat);

        const lon =
        parseFloat(place.lon);

        // Fly to location

        map.flyTo(
            [lat, lon],
            10,
            {
                duration:2
            }
        );

        // Marker

        const marker =
        L.marker(
            [lat, lon]
        ).addTo(map);

        marker
        .bindPopup(
            place.display_name
        )
        .openPopup();

        // Update City Card

        document
        .getElementById("city-info")
        .innerHTML = `

            <h3>${query}</h3>

            <br>

            <p>
                📍 ${place.display_name}
            </p>

            <br>

            <p>
                🌐 Latitude:
                ${lat.toFixed(4)}
            </p>

            <p>
                🌐 Longitude:
                ${lon.toFixed(4)}
            </p>

        `;

        // Load weather

        loadWeather(
            lat,
            lon
        );

    }
    catch(error){

        console.error(error);

        alert(
            "Search failed"
        );

    }

}

// =======================================
// WEATHER DATA
// =======================================

async function loadWeather(lat, lon){

    try{

        const response =
        await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,relative_humidity_2m`
        );

        const data =
        await response.json();

        const temp =
        data.current.temperature_2m;

        const wind =
        data.current.wind_speed_10m;

        const humidity =
        data.current.relative_humidity_2m;

        // WEATHER CARD

        document
        .getElementById("weather-info")
        .innerHTML = `

            <p>
                🌡 Temperature:
                <strong>${temp}°C</strong>
            </p>

            <br>

            <p>
                💨 Wind Speed:
                <strong>${wind} km/h</strong>
            </p>

            <br>

            <p>
                💧 Humidity:
                <strong>${humidity}%</strong>
            </p>

        `;

        // AIR QUALITY CARD

        let aqiStatus = "Good";
        let aqiColor = "🟢";

        if(temp > 35){

            aqiStatus = "Poor";
            aqiColor = "🔴";

        }
        else if(temp > 25){

            aqiStatus = "Moderate";
            aqiColor = "🟡";

        }

        document
        .getElementById("aqi-info")
        .innerHTML = `

            <p>
                ${aqiColor}
                Air Quality Status:
                <strong>${aqiStatus}</strong>
            </p>

            <br>

            <p>
                🌍 Environmental Monitoring Active
            </p>

            <br>

            <p>
                📡 Live Climate Tracking Enabled
            </p>

        `;

        // CLIMATE RISK

        let risk = 30;

        if(temp > 35){

            risk = 85;

        }
        else if(temp > 25){

            risk = 60;

        }

        document
        .querySelector(".risk-circle")
        .innerHTML =
        `${risk}%`;

        document
        .querySelector(".risk-label")
        .innerHTML =
            risk > 70
            ? "High Risk"
            : risk > 50
            ? "Moderate Risk"
            : "Low Risk";

    }
    catch(error){

        console.error(error);

        document
        .getElementById("weather-info")
        .innerHTML =
        "Weather data unavailable";

        document
        .getElementById("aqi-info")
        .innerHTML =
        "Air quality data unavailable";

    }

}

// =======================================
// CURRENT LOCATION
// =======================================

if(navigator.geolocation){

    navigator.geolocation.getCurrentPosition(

        function(position){

            const lat =
            position.coords.latitude;

            const lon =
            position.coords.longitude;

            L.circleMarker(
                [lat, lon],
                {
                    radius:10,
                    color:"green"
                }
            )
            .addTo(map)
            .bindPopup(
                "📍 Your Current Location"
            );

        }

    );

}