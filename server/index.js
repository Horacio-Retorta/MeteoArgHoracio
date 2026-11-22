
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const PORT = process.env.PORT || 3001;
const dir = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'MeteoArgHoracio API'
  });
});

app.get('/api/weather', async (req, res) => {
  const lat = Number(req.query.latitude);
  const lon = Number(req.query.longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 || lat > 90 ||
    lon < -180 || lon > 180
  ) {
    return res.status(400).json({
      error: 'Coordenadas inválidas.'
    });
  }

  const p = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '7'
  });

  try {
    const r = await fetch(
      'https://api.open-meteo.com/v1/forecast?' + p
    );

    if (!r.ok) {
      const detalle = await r.text();

      console.error(
        'Error Open-Meteo:',
        r.status,
        detalle
      );

      return res.status(502).json({
        error: 'El proveedor meteorológico no respondió.',
        codigo: r.status
      });
    }

    res.set('Cache-Control', 'public,max-age=300');

    return res.json(await r.json());

  } catch (error) {
    console.error('Error de conexión:', error);

    return res.status(502).json({
      error: 'No fue posible conectar con el proveedor meteorológico.'
    });
  }
});

app.get('/api/geocode', async (req, res) => {
  const name = String(req.query.name || '').trim();

  if (!name || name.length > 100) {
    return res.status(400).json({
      error: 'Ingresá una localidad válida.'
    });
  }

  try {
    const p = new URLSearchParams({
      name,
      count: '10',
      language: 'es',
      format: 'json'
    });

    const r = await fetch(
      'https://geocoding-api.open-meteo.com/v1/search?' + p
    );

    if (!r.ok) {
      console.error('Error de geocodificación:', r.status);

      return res.status(502).json({
        error: 'Falló la búsqueda.'
      });
    }

    const d = await r.json();
    const m = (d.results || []).find(
      x => x.country_code === 'AR'
    );

    if (!m) {
      return res.status(404).json({
        error: 'No encontramos esa localidad en Argentina.'
      });
    }

    return res.json({
      city: {
        name: m.name,
        province: m.admin1 || 'Argentina',
        latitude: m.latitude,
        longitude: m.longitude
      }
    });

  } catch (error) {
    console.error('Error de búsqueda:', error);

    return res.status(502).json({
      error: 'No fue posible realizar la búsqueda.'
    });
  }
});

const dist = path.resolve(dir, '../dist');

app.use(express.static(dist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(
    path.join(dist, 'index.html'),
    error => {
      if (error) {
        res.status(404).send(
          'Frontend sin compilar. Ejecutá npm run build.'
        );
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`MeteoArgHoracio API iniciada en puerto ${PORT}`);
});
