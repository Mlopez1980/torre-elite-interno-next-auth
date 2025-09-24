'use client'
import React, { useEffect, useMemo, useState } from 'react'

export default function Page(){
  const [data, setData] = useState([])
  const [reservas, setReservas] = useState({})
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [nivelSelect, setNivelSelect] = useState('')
  const [habs, setHabs] = useState('')
  const [areaMin, setAreaMin] = useState('')
  const [areaMax, setAreaMax] = useState('')
  const [estado, setEstado] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [modal, setModal] = useState({open:false, id:'', src:'', zoom:1, x:0, y:0})

 useEffect(() => {
  async function load() {
    try {
      const r = await fetch('/apartments.json', { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      setData(await r.json());
    } catch (e) {
      setError('No se pudo cargar apartments.json: ' + e.message);
    }

    try {
      // Leemos SIEMPRE lo último y normalizamos las claves (trim + upper)
      const rr = await fetch('/api/reservas?v=' + Date.now(), { cache: 'no-store' });
      if (rr.ok) {
        const raw = await rr.json();
        const normalized = Object.fromEntries(
          Object.entries(raw).map(([k, v]) => [String(k).trim().toUpperCase(), v])
        );
        setReservas(normalized);
      } else {
        console.warn('No se pudo leer /api/reservas, status:', rr.status);
      }
    } catch (e) {
      console.warn('Error leyendo /api/reservas:', e);
    }
  }
  load();
}, []);



  const niveles = useMemo(()=> Array.from(new Set(data.map(a=>a.nivel))).sort((a,b)=>a-b), [data])

  const items = useMemo(()=> data.filter(a=>{
    const q = search.trim().toLowerCase()
    if(q){
      const hay = (a.id + ' ' + (a.descripcion||'')).toLowerCase()
      if(!hay.includes(q)) return false
    }
    if(nivelSelect && String(a.nivel)!==String(nivelSelect)) return false
    if(selectedLevel && a.nivel !== selectedLevel) return false
    if(habs && String(a.habitaciones)!==String(habs)) return false
    const amin = parseFloat(areaMin)
    if(!Number.isNaN(amin) && a.area_m2 < amin) return false
    const amax = parseFloat(areaMax)
    if(!Number.isNaN(amax) && a.area_m2 > amax) return false
    if(estado==='disponible' && !a.disponible) return false
    if(estado==='reservado' && a.disponible) return false
    return true
  }), [data, search, nivelSelect, selectedLevel, habs, areaMin, areaMax, estado])

  function formatUSD(v){
    if (v === null || v === undefined || Number.isNaN(v)) return '—'
    try { return new Intl.NumberFormat('es-HN',{style:'currency',currency:'USD', minimumFractionDigits:2}).format(v) }
    catch { return `$${v}` }
  }
  function openPlano(a){
    const src = a.plano ? ('/' + a.plano) : ('/planos/' + a.id + '.png')
    setModal({open:true, id:a.id, src, zoom:1, x:0, y:0})
  }
  function closePlano(){ setModal(m=>({...m, open:false})) }
  function zoomIn(){ setModal(m=>({...m, zoom: Math.min(m.zoom+0.1,3)})) }
  function zoomOut(){ setModal(m=>({...m, zoom: Math.max(m.zoom-0.1,0.5)})) }
  function onPointerDown(e){
    const startX = e.clientX - modal.x, startY = e.clientY - modal.y
    function move(ev){ setModal(m=>({...m, x: ev.clientX - startX, y: ev.clientY - startY})) }
    function up(){ window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
  }
  const [lastTap, setLastTap] = useState(0)
  function onClickImg(){
    const now = Date.now()
    if(now - lastTap < 300){ setModal(m=>({...m, zoom: m.zoom>=2?1:Math.min(m.zoom+0.5,3), x:0, y:0})) }
    setLastTap(now)
  }

  return (
    <>
      <div className="header">
        <div className="container">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <img src="/logo-honduras-constructores.png" alt="Honduras Constructores" style={{height:40}} />
              <h1 style={{margin:0}}>Torre Élite · Interno</h1>
            </div>
            <span className="ribbon">INTERNAL</span>
          </div>
        </div>
      </div>

      <div className="container">
        {error && <div className="card" style={{background:'#3f1d2e',borderColor:'#fda4af'}}>⚠️ {error}</div>}

        <div className="level-tabs" role="tablist">
          <button className={'level-tab' + (selectedLevel==='' ? ' active' : '')} onClick={()=>setSelectedLevel('')} role="tab">Todos</button>
          {niveles.map(n => (
            <button key={n} className={'level-tab' + (String(selectedLevel)===String(n) ? ' active' : '')} onClick={()=>{setSelectedLevel(n); setNivelSelect('')}} role="tab">Nivel {n}</button>
          ))}
        </div>

        <div className="card">
          <div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
              <span className="badge ok">Disponible (verde)</span>
              <span className="badge no blink">Reservado (rosado)</span>
            </div>
            <div className="filters">
              <input className="input" placeholder="Buscar por ID o descripción..." value={search} onChange={e=>setSearch(e.target.value)} />
              <select className="select" value={nivelSelect} onChange={e=>setNivelSelect(e.target.value)}>
                <option value="">Nivel</option>
                {niveles.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <select className="select" value={habs} onChange={e=>setHabs(e.target.value)}>
                <option value="">Habitaciones</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
              <input className="input" type="number" step="0.001" placeholder="Área mín. m²" value={areaMin} onChange={e=>setAreaMin(e.target.value)} />
              <input className="input" type="number" step="0.001" placeholder="Área máx. m²" value={areaMax} onChange={e=>setAreaMax(e.target.value)} />
              <select className="select" value={estado} onChange={e=>setEstado(e.target.value)}>
                <option value="">Todos</option>
                <option value="disponible">Solo disponibles</option>
                <option value="reservado">Solo reservados</option>
              </select>
            </div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button className="button" onClick={()=>{setSearch('');setNivelSelect('');setHabs('');setAreaMin('');setAreaMax('');setEstado(''); setSelectedLevel('')}}>Limpiar</button>
          </div>
        </div>

        <div className="grid" style={{marginTop:14}}>
          {items.length ? items.map(a => {
          const key = String(a.id).trim().toUpperCase();
const reservado = !!reservas?.[key] || !a.disponible;
const r = reservas?.[key];
            return (
              <div key={a.id} className={`card ${reservado ? "reserved" : "available"}`} style={{opacity: reservado ? .95 : 1}}>
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
                    <div className="title-tap" style={{fontWeight:700,fontSize:16}} onClick={()=>openPlano(a)}>{a.id}</div>
                    <span className={'badge '+(reservado ? 'no blink':'ok')}>{reservado?'Reservado':'Disponible'}</span>
                  </div>
                  <div style={{marginTop:8,display:'grid',gridTemplateColumns:'repeat(2, minmax(0,1fr))',gap:6,fontSize:14}}>
                    <div><strong>Nivel:</strong> {a.nivel}</div>
                    <div><strong>Habitaciones:</strong> {a.habitaciones}</div>
                    <div><strong>Área:</strong> {Number(a.area_m2).toFixed(2)} m²</div>
                    <div><strong>Precio:</strong> {formatUSD(a.precio_usd)}</div>
                    {reservado && (
                      <div style={{gridColumn:'1 / -1', marginTop:6, padding:10, borderRadius:12, background:'#4b1f30', border:'1px solid #fda4af'}}>
                        <strong>Reservado por:</strong> {r?.cliente || '—'}
                        {r?.fecha ? (<><span style={{opacity:.6}}> · </span><strong>Fecha:</strong> {r.fecha}</>) : null}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center'}}>
                  {a.disponible ? (
                    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                      <button className="button" onClick={()=>openPlano(a)}>Ver plano</button>
                      <a className="button" href={`https://wa.me/50492513691?text=${encodeURIComponent(`Hola, me interesa el apartamento ${a.id} de Torre Élite`)}`} target="_blank" rel="noopener">Quiero este</a>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          }) : !error && <div style={{opacity:.7}}>No hay resultados con esos filtros.</div>}
        </div>

        <div className="footer">Uso interno — No compartir.</div>
      </div>

      <div className={'modal'+(modal.open?' open':'')} aria-hidden={!modal.open}>
        <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="planoTitulo">
          <div className="modal-head">
            <div id="planoTitulo" className="modal-title">Plano · {modal.id}</div>
            <div style={{display:'flex',gap:8}}>
              <button className="iconbtn" title="Acercar" onClick={zoomIn}>＋</button>
              <button className="iconbtn" title="Alejar" onClick={zoomOut}>－</button>
              <button className="iconbtn" title="Cerrar" onClick={closePlano}>✕</button>
            </div>
          </div>
          <div className="modal-body">
            {modal.open && (
              <img
                src={modal.src}
                alt="Plano del apartamento"
                onPointerDown={onPointerDown}
                onClick={onClickImg}
                style={{ transform:`translate(${modal.x}px, ${modal.y}px) scale(${modal.zoom})` }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
