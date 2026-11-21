import {useEffect,useState} from 'react';
import {CloudSun,Cloud,Sun,CloudRain,CloudSnow,CloudLightning,CloudFog,MapPin,Wind,Droplets,Thermometer,Search,CalendarDays,Menu,RefreshCw,Gauge,Navigation,Eye} from 'lucide-react';
import WeatherMap from './WeatherMap.jsx';
const cities=[['Buenos Aires','Buenos Aires',-34.6037,-58.3816],['Córdoba','Córdoba',-31.4201,-64.1888],['Rosario','Santa Fe',-32.9468,-60.6393],['Mendoza','Mendoza',-32.8895,-68.8458],['Mar del Plata','Buenos Aires',-38.0055,-57.5426],['Bariloche','Río Negro',-41.1335,-71.3103],['Salta','Salta',-24.7821,-65.4232],['Ushuaia','Tierra del Fuego',-54.8019,-68.3030]].map(([name,province,latitude,longitude])=>({name,province,latitude,longitude}));
const codes={0:['Despejado',Sun],1:['Mayormente despejado',CloudSun],2:['Parcialmente nublado',CloudSun],3:['Nublado',Cloud],45:['Niebla',CloudFog],48:['Niebla',CloudFog],51:['Llovizna',CloudRain],53:['Llovizna',CloudRain],55:['Llovizna intensa',CloudRain],61:['Lluvia ligera',CloudRain],63:['Lluvia',CloudRain],65:['Lluvia intensa',CloudRain],71:['Nieve ligera',CloudSnow],73:['Nieve',CloudSnow],75:['Nevada intensa',CloudSnow],80:['Chaparrones',CloudRain],81:['Chaparrones',CloudRain],82:['Chaparrones intensos',CloudRain],95:['Tormenta',CloudLightning],96:['Tormenta con granizo',CloudLightning],99:['Tormenta fuerte',CloudLightning]};
const day=d=>new Intl.DateTimeFormat('es-AR',{weekday:'short',day:'numeric',month:'short'}).format(new Date(d+'T12:00:00')).replace('.','');
function Metric({Icon,label,value}){return <article className="metric panel"><span className="metric-icon"><Icon size={18}/></span><small>{label}</small><strong>{value}</strong></article>}
export default function App(){
 const [city,setCity]=useState(cities[0]),[data,setData]=useState(null),[query,setQuery]=useState(''),[message,setMessage]=useState(''),[loading,setLoading]=useState(false),[section,setSection]=useState('Resumen'),[menu,setMenu]=useState(false);
 async function load(c){setLoading(true);setMessage('');try{const p=new URLSearchParams({latitude:c.latitude,longitude:c.longitude});const r=await fetch('/api/weather?'+p);if(!r.ok)throw Error('No se pudo consultar el pronóstico.');setData(await r.json());setCity(c);}catch(e){setMessage(e.message+' Revisá que el backend esté iniciado.');}finally{setLoading(false)}}
 async function search(e){e.preventDefault();if(!query.trim())return;setMessage('Buscando localidad…');try{const r=await fetch('/api/geocode?name='+encodeURIComponent(query));const d=await r.json();if(!r.ok)throw Error(d.error||'Localidad no encontrada.');await load(d.city);setQuery('')}catch(e){setMessage(e.message)}}
 useEffect(()=>{load(cities[0])},[]);
 const current=data?.current,daily=data?.daily,[condition,WeatherIcon]=codes[current?.weather_code]||['Condición no disponible',CloudSun];
 const today=new Intl.DateTimeFormat('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
 return <div className="shell">
 <aside className={'sidebar '+(menu?'open':'')}><a className="brand"><span className="brandicon"><CloudSun size={26}/></span><span><b>MeteoArg</b><em>Horacio</em><small>METEOROLOGÍA ARGENTINA</small></span></a><label>PLATAFORMA</label><nav>{[['Resumen',Gauge],['Pronóstico',CalendarDays],['Radar',CloudRain],['Mapas',Navigation],['Alertas',Eye]].map(([n,I])=><button className={section===n?'active':''} onClick={() => {
  console.log('Sección seleccionada:', n);
  setSection(n);
  setMenu(false);
}}><I size={17}/>{n}{n==='Alertas'&&<small>PRONTO</small>}</button>)}</nav><div className="sidefoot"><i/> Cobertura nacional<p>Información meteorológica para todo el territorio argentino.</p><small>METEOARGHORACIO · V1.0</small></div></aside>
 <main><header><button className="menubtn" onClick={()=>setMenu(!menu)}><Menu/></button><span>Argentina　/　<strong>{section}</strong></span><small><i/> SISTEMA OPERATIVO</small></header><div className="content">
 <div className="welcome"><div><label>CENTRO METEOROLÓGICO DIGITAL</label><h1>El clima de Argentina<span>.</span></h1><p>Datos, pronósticos y seguimiento meteorológico en un solo lugar.</p></div><time><CalendarDays size={15}/>{today}</time></div>
 <form className="search" onSubmit={search}><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar una localidad argentina…"/><button>Buscar localidad</button></form>
 <div className="cities"><label>ACCESO RÁPIDO</label>{cities.map(c=><button className={city.name===c.name?'chosen':''} onClick={()=>load(c)}>{c.name}</button>)}</div>
 {message&&<div className="message">{message}</div>}
 

{section === 'Resumen' && (
  <>
    <div className="sectionhead">
      <div>
        <label>CONDICIONES ACTUALES</label>
        <h2>Tu tiempo ahora</h2>
      </div>
      <button onClick={() => load(city)} disabled={loading}>
        <RefreshCw size={14} /> Actualizar
      </button>
    </div>

    <section className="weathergrid">
      <article className="hero panel">
        <div className="location">
          <MapPin size={15} />
          {city.name}, {city.province}
          <span>● EN VIVO</span>
        </div>
        {current ? (
          <>
            <div className="now">
              <div>
                <strong>{Math.round(current.temperature_2m)}<sup>°</sup></strong>
                <p>{condition}</p>
                <small>
                  Sensación térmica: {Math.round(current.apparent_temperature)}°C
                </small>
              </div>
              <WeatherIcon className="bigicon" />
            </div>
            <div className="highlow">
              Máx. {Math.round(daily.temperature_2m_max[0])}° / Mín. {Math.round(daily.temperature_2m_min[0])}°
            </div>
          </>
        ) : (
          <div className="waiting">Consultando datos meteorológicos…</div>
        )}
      </article>

      <div className="metrics">
        <Metric Icon={Thermometer} label="Sensación térmica" value={current ? Math.round(current.apparent_temperature) + '°' : '—'} />
        <Metric Icon={Droplets} label="Humedad relativa" value={current ? current.relative_humidity_2m + '%' : '—'} />
        <Metric Icon={Wind} label="Velocidad del viento" value={current ? Math.round(current.wind_speed_10m) + ' km/h' : '—'} />
        <Metric Icon={CloudRain} label="Prob. de precipitación" value={daily ? daily.precipitation_probability_max[0] + '%' : '—'} />
      </div>
    </section>

    <section className="forecast panel">
      <div className="forecasthead">
        <div><label>PRÓXIMOS DÍAS</label><h2>Pronóstico extendido</h2></div>
        <small>PRÓXIMOS 7 DÍAS</small>
      </div>
      {daily ? daily.time.map((d, i) => {
        const [txt, I] = codes[daily.weather_code[i]] || ['Sin datos', CloudSun];
        return (
          <div className="dayrow" key={d}>
            <span>{day(d)}</span>
            <I size={21} />
            <span className="condition">{txt}</span>
            <b>{Math.round(daily.temperature_2m_max[i])}°</b>
            <span>{Math.round(daily.temperature_2m_min[i])}°</span>
            <small><Droplets size={12} />{daily.precipitation_probability_max[i]}%</small>
          </div>
        );
      }) : <div className="waiting">El pronóstico aparecerá al conectar el servidor.</div>}
    </section>
  </>
)}

{section === 'Mapas' && <WeatherMap />}

{section === 'Radar' && (
  <WeatherMap />
)}

{section === 'Pronóstico' && (
  <section className="forecast panel">
    <h2>Pronóstico extendido</h2>
    <p>Consultá los próximos 7 días en la sección Resumen.</p>
  </section>
)}

{section === 'Alertas' && (
  <section className="panel" style={{padding: 24}}>
    <h2>Alertas meteorológicas</h2>
    <p>Esta sección estará disponible en una próxima etapa.</p>
  </section>
)}
 <footer>© {new Date().getFullYear()} MeteoArgHoracio <span>Datos: Open-Meteo · Proyecto en desarrollo</span></footer>
 </div></main></div>
}