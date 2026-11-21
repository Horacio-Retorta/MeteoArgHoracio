
import { useEffect, useState } from 'react';

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
  ZoomControl
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

const locations = [
  { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
  { name: 'Córdoba', lat: -31.4201, lon: -64.1888 },
  { name: 'Rosario', lat: -32.9468, lon: -60.6393 },
  { name: 'Mendoza', lat: -32.8895, lon: -68.8458 },
  { name: 'Mar del Plata', lat: -38.0055, lon: -57.5426 },
  { name: 'Bariloche', lat: -41.1335, lon: -71.3103 },
  { name: 'Salta', lat: -24.7821, lon: -65.4232 },
  { name: 'Ushuaia', lat: -54.8019, lon: -68.3030 }
];

function rainColor(probability) {
  if (probability >= 70) return '#2685ff';
  if (probability >= 40) return '#36c5d8';
  if (probability >= 20) return '#a4d94b';
  return '#55c9f5';
}

export default function WeatherMap() {
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeather() {
      try {
        const results = await Promise.all(
          locations.map(async (location) => {
            const params = new URLSearchParams({
              latitude: location.lat,
              longitude: location.lon
            });

            const response = await fetch('/api/weather?' + params);

            if (!response.ok) {
              throw new Error('No se pudieron cargar los datos');
            }

            const data = await response.json();

            return {
              name: location.name,
              temperature: Math.round(data.current.temperature_2m),
              rain: data.daily.precipitation_probability_max[0],
              wind: Math.round(data.current.wind_speed_10m)
            };
          })
        );

        const weatherData = {};

        results.forEach(item => {
          weatherData[item.name] = item;
        });

        setWeather(weatherData);
      } catch (error) {
        console.error('Error al cargar el mapa:', error);
      } finally {
        setLoading(false);
      }
    }

    loadWeather();
  }, []);

  return (
    <section className="weather-map panel">
      <div className="weather-map-head">
        <div>
          <label>MAPA INTERACTIVO</label>
          <h2>Temperaturas y precipitaciones</h2>
        </div>
        <span>{loading ? 'ACTUALIZANDO...' : 'DATOS METEOROLÓGICOS'}</span>
      </div>

      <MapContainer
        center={[-38.4, -63.6]}
        zoom={4}
        minZoom={3}
        maxZoom={10}
        scrollWheelZoom={true}
        zoomControl={false}
        className="argentina-map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position="topright" />

        {locations.map(location => {
          const item = weather[location.name];

          return (
            <CircleMarker
              key={location.name}
              center={[location.lat, location.lon]}
              radius={9}
              pathOptions={{
                color: '#ffffff',
                fillColor: item ? rainColor(item.rain) : '#777777',
                fillOpacity: 1,
                weight: 2
              }}
            >
              <Tooltip permanent direction="top" offset={[0, -8]}>
                {item
                  ? `${item.temperature}°C · ${item.rain}%`
                  : '--'}
              </Tooltip>

              <Popup>
                <strong>{location.name}</strong>
                <br />
                Temperatura: {item ? `${item.temperature}°C` : 'Sin datos'}
                <br />
                Probabilidad de lluvia: {item ? `${item.rain}%` : 'Sin datos'}
                <br />
                Velocidad del viento: {item ? `${item.wind} km/h` : 'Sin datos'}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div className="rain-legend">
        <span>Probabilidad de lluvia:</span>
        <span> <i style={{background: '#55c9f5'}} /> 0–19%</span>
        <span> <i style={{background: '#a4d94b'}} /> 20–39%</span>
        <span> <i style={{background: '#36c5d8'}} /> 40–69%</span>
        <span> <i style={{background: '#2685ff'}} /> 70–100%</span>
      </div>
        <span>Viento: al seleccionar una ciudad podés consultar su velocidad en km/h.</span>
    </section>
  );
}
