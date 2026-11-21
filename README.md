# MeteoArgHoracio

Portal meteorológico argentino con React + Vite (frontend) y Node.js + Express (backend).

## Requisitos
- Node.js 20 o superior
- npm
- Conexión a Internet para consultar Open-Meteo

## Instalación y ejecución
Desde esta carpeta raíz:

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3001  
Estado API: http://localhost:3001/api/health

## Compilar para producción
```bash
npm run build
npm start
```
Express sirve la compilación `client/dist`.

## Endpoints
- `GET /api/health`
- `GET /api/weather?latitude=-34.60&longitude=-58.38`
- `GET /api/geocode?name=Neuquen`

## Incluye
- Diseño tecnológico adaptable a escritorio y móvil.
- Ciudades destacadas de Argentina.
- Búsqueda de localidades argentinas.
- Condiciones actuales y pronóstico de 7 días.
- Backend propio que consulta Open-Meteo.

Las secciones Radar, Mapas y Alertas están preparadas en la navegación, pero aún no muestran radar ni avisos oficiales. Esta es la primera base funcional para continuar desarrollando.
