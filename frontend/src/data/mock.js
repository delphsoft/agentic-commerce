export const SRC = {
  meli:         { label: 'MELI',      bg: '#FFE600', tc: '#333' },
  fravega:      { label: 'FRÁVEGA',   bg: '#E8002D', tc: '#fff' },
  garbarino:    { label: 'GARBARINO', bg: '#0057B8', tc: '#fff' },
  musimundo:    { label: 'MUSIMUNDO', bg: '#FF6B00', tc: '#fff' },
  naldo:        { label: 'NALDO',     bg: '#8B1A1A', tc: '#fff' },
  cetrogar:     { label: 'CETROGAR',  bg: '#1A5276', tc: '#fff' },
  nico_calzados:{ label: 'NICO',      bg: '#2C3E50', tc: '#fff' },
}

export const CAT_EMOJI = {
  electronica: '📱', celulares: '📲', hogar: '🏠',
  moda: '👟', computacion: '💻', default: '📦',
}

export const MOCK_PRODUCTS = [
  {
    id: 1, title: 'Auriculares Sony WH-1000XM5', brand: 'Sony',
    category: 'electronica', emoji: '🎧',
    best_offer: { source: 'meli', price: 280000, shipping_cost: 0, shipping_days: 2, gmb_rating: null, gmb_verified: false, score: 0.78, installments: 12, installments_rate: 0, is_official_store: false },
    offers: [
      { id:'o1', source:'meli', seller_name:'TechStore AR', price:280000, oldPrice:320000, shipping_cost:0, shipping_days:2, warranty:'12 meses', seller_reputation:0.95, gmb_rating:null, gmb_verified:false, gmb_name:null, stock_available:true, url:'#', score:0.78, installments:12, installments_rate:0, is_official_store:false, breakdown:{precio:.9,reputacion:.8,envio:.85,gmb:.2,garantia:.7,cuotas:1} },
      { id:'o2', source:'fravega', seller_name:'Frávega', price:298000, shipping_cost:0, shipping_days:3, warranty:'12 meses oficial', seller_reputation:0.85, gmb_rating:3.8, gmb_verified:true, gmb_name:'Frávega Córdoba', stock_available:true, url:'#', score:0.74, installments:18, installments_rate:0, is_official_store:true, breakdown:{precio:.7,reputacion:.87,envio:.75,gmb:.84,garantia:1,cuotas:1} },
    ],
  },
  {
    id: 2, title: 'Smart TV LG 55" 4K UHD', brand: 'LG',
    category: 'electronica', emoji: '📺',
    best_offer: { source: 'fravega', price: 415000, shipping_cost: 0, shipping_days: 3, gmb_rating: 3.8, gmb_verified: true, score: 0.82, installments: 18, installments_rate: 0, is_official_store: true },
    offers: [
      { id:'o3', source:'fravega', seller_name:'Frávega', price:415000, oldPrice:490000, shipping_cost:0, shipping_days:3, warranty:'24 meses oficial', seller_reputation:0.85, gmb_rating:3.8, gmb_verified:true, gmb_name:'Frávega Av. Colón', stock_available:true, url:'#', score:0.82, installments:18, installments_rate:0, is_official_store:true, breakdown:{precio:.9,reputacion:.87,envio:.75,gmb:.84,garantia:1,cuotas:1} },
      { id:'o4', source:'garbarino', seller_name:'Garbarino', price:420000, shipping_cost:0, shipping_days:4, warranty:'12 meses', seller_reputation:0.80, gmb_rating:3.5, gmb_verified:true, gmb_name:'Garbarino Shopping', stock_available:true, url:'#', score:0.71, installments:6, installments_rate:0, is_official_store:true, breakdown:{precio:.85,reputacion:.82,envio:.6,gmb:.77,garantia:.7,cuotas:.65} },
    ],
  },
  {
    id: 3, title: 'Motorola Moto G54 5G 256GB', brand: 'Motorola',
    category: 'celulares', emoji: '📱',
    best_offer: { source: 'meli', price: 178000, shipping_cost: 0, shipping_days: 1, gmb_rating: 4.2, gmb_verified: true, score: 0.91, installments: 12, installments_rate: 0, is_official_store: true },
    offers: [
      { id:'o5', source:'meli', seller_name:'Motorola Oficial AR', price:178000, oldPrice:210000, shipping_cost:0, shipping_days:1, warranty:'12 meses oficial', seller_reputation:0.98, gmb_rating:4.2, gmb_verified:true, gmb_name:'Motorola Store AR', stock_available:true, url:'#', score:0.91, installments:12, installments_rate:0, is_official_store:true, breakdown:{precio:1,reputacion:.99,envio:.95,gmb:.9,garantia:1,cuotas:1} },
      { id:'o6', source:'musimundo', seller_name:'Musimundo', price:185000, shipping_cost:0, shipping_days:4, warranty:'12 meses', seller_reputation:0.78, gmb_rating:3.6, gmb_verified:true, gmb_name:'Musimundo Palermo', stock_available:true, url:'#', score:0.72, installments:12, installments_rate:0, is_official_store:true, breakdown:{precio:.85,reputacion:.79,envio:.6,gmb:.8,garantia:.7,cuotas:1} },
    ],
  },
  {
    id: 4, title: 'Heladera No Frost Samsung 400L', brand: 'Samsung',
    category: 'hogar', emoji: '🏠',
    best_offer: { source: 'naldo', price: 610000, shipping_cost: 0, shipping_days: 4, gmb_rating: 4.0, gmb_verified: true, score: 0.76, installments: 18, installments_rate: 0, is_official_store: true },
    offers: [
      { id:'o7', source:'naldo', seller_name:'Naldo', price:610000, oldPrice:680000, shipping_cost:0, shipping_days:4, warranty:'12 meses', seller_reputation:0.80, gmb_rating:4.0, gmb_verified:true, gmb_name:'Naldo Rosario', stock_available:true, url:'#', score:0.76, installments:18, installments_rate:0, is_official_store:true, breakdown:{precio:1,reputacion:.84,envio:.6,gmb:.87,garantia:.7,cuotas:1} },
      { id:'o8', source:'fravega', seller_name:'Frávega', price:625000, shipping_cost:0, shipping_days:3, warranty:'24 meses oficial', seller_reputation:0.85, gmb_rating:3.8, gmb_verified:true, gmb_name:'Frávega Palermo', stock_available:true, url:'#', score:0.74, installments:18, installments_rate:0, is_official_store:true, breakdown:{precio:.88,reputacion:.87,envio:.75,gmb:.84,garantia:1,cuotas:1} },
      { id:'o9', source:'cetrogar', seller_name:'Cetrogar', price:599000, shipping_cost:null, shipping_days:5, warranty:'12 meses', seller_reputation:0.78, gmb_rating:3.9, gmb_verified:true, gmb_name:'Cetrogar Córdoba', stock_available:true, url:'#', score:0.68, installments:12, installments_rate:0, is_official_store:true, breakdown:{precio:1,reputacion:.81,envio:.35,gmb:.86,garantia:.7,cuotas:1} },
    ],
  },
  {
    id: 5, title: 'Notebook Lenovo IdeaPad 15" i5 16GB', brand: 'Lenovo',
    category: 'computacion', emoji: '💻',
    best_offer: { source: 'meli', price: 880000, shipping_cost: 0, shipping_days: 2, gmb_rating: null, gmb_verified: false, score: 0.72, installments: 12, installments_rate: 0, is_official_store: false },
    offers: [
      { id:'o10', source:'meli', seller_name:'CompuAR', price:880000, shipping_cost:0, shipping_days:2, warranty:'12 meses', seller_reputation:0.92, gmb_rating:null, gmb_verified:false, gmb_name:null, stock_available:true, url:'#', score:0.72, installments:12, installments_rate:0, is_official_store:false, breakdown:{precio:.9,reputacion:.78,envio:.85,gmb:.2,garantia:.7,cuotas:1} },
    ],
  },
  {
    id: 6, title: 'Zapatillas Adidas Stan Smith', brand: 'Adidas',
    category: 'moda', emoji: '👟',
    best_offer: { source: 'meli', price: 44000, shipping_cost: 0, shipping_days: 3, gmb_rating: 4.5, gmb_verified: true, score: 0.85, installments: 6, installments_rate: 0, is_official_store: true },
    offers: [
      { id:'o11', source:'meli', seller_name:'Adidas Oficial AR', price:44000, oldPrice:52000, shipping_cost:0, shipping_days:3, warranty:'—', seller_reputation:0.97, gmb_rating:4.5, gmb_verified:true, gmb_name:'Adidas Tienda Oficial', stock_available:true, url:'#', score:0.85, installments:6, installments_rate:0, is_official_store:true, breakdown:{precio:1,reputacion:.98,envio:.75,gmb:.96,garantia:.1,cuotas:.65} },
      { id:'o12', source:'nico_calzados', seller_name:'Nico Calzados', price:42000, shipping_cost:null, shipping_days:5, warranty:'—', seller_reputation:0.72, gmb_rating:4.2, gmb_verified:true, gmb_name:'Nico Calzados Córdoba', stock_available:true, url:'#', score:0.71, installments:3, installments_rate:0, is_official_store:true, breakdown:{precio:1,reputacion:.79,envio:.35,gmb:.9,garantia:.1,cuotas:.65} },
    ],
  },
]

export const MOCK_MAS_BUSCADOS = [
  { id:3, emoji:'📱', title:'Motorola Moto G54 5G', price:178000, searches:'12.4k', src:'meli', rank:1 },
  { id:2, emoji:'📺', title:'Smart TV LG 55" 4K', price:415000, searches:'9.8k', src:'fravega', rank:2 },
  { id:1, emoji:'🎧', title:'Auriculares Sony WH-1000XM5', price:280000, searches:'8.2k', src:'meli', rank:3 },
  { id:4, emoji:'🏠', title:'Heladera Samsung 400L', price:610000, searches:'7.1k', src:'naldo', rank:4 },
  { id:6, emoji:'👟', title:'Adidas Stan Smith', price:44000, searches:'6.5k', src:'meli', rank:5 },
]

export const MOCK_RECENT_OFFERS = [
  { id:1, emoji:'🎧', title:'Auriculares Sony WH-1000XM5', price:280000, oldPrice:320000, src:'meli', disc:13, when:'hace 2hs' },
  { id:2, emoji:'📺', title:'Smart TV LG 55" 4K', price:415000, oldPrice:490000, src:'fravega', disc:15, when:'hace 4hs' },
  { id:3, emoji:'📱', title:'Moto G54 5G 256GB', price:178000, oldPrice:210000, src:'meli', disc:15, when:'hace 6hs' },
  { id:4, emoji:'🏠', title:'Heladera Samsung 400L', price:610000, oldPrice:680000, src:'naldo', disc:10, when:'hace 9hs' },
  { id:6, emoji:'👟', title:'Adidas Stan Smith', price:44000, oldPrice:52000, src:'meli', disc:15, when:'hace 11hs' },
]

export const MOCK_TOP_CATS = {
  electronica: [
    { id:3, emoji:'📱', title:'Moto G54 5G', price:178000, src:'meli', meta:'18.2k vendidos', rank:1 },
    { id:2, emoji:'📺', title:'Smart TV LG 55"', price:415000, src:'fravega', meta:'12.1k vendidos', rank:2 },
    { id:1, emoji:'🎧', title:'Sony WH-1000XM5', price:280000, src:'meli', meta:'8.4k vendidos', rank:3 },
  ],
  hogar: [
    { id:4, emoji:'🏠', title:'Heladera Samsung 400L', price:610000, src:'naldo', meta:'9.2k vendidos', rank:1 },
    { id:4, emoji:'❄️', title:'Aire Acond. Split 3000W', price:620000, src:'fravega', meta:'7.8k vendidos', rank:2 },
    { id:4, emoji:'🫧', title:'Lavarropas 8kg Auto.', price:380000, src:'garbarino', meta:'5.1k vendidos', rank:3 },
  ],
  moda: [
    { id:6, emoji:'👟', title:'Adidas Stan Smith', price:44000, src:'meli', meta:'31k vendidos', rank:1 },
    { id:6, emoji:'👠', title:'Botineta Cuero Mujer', price:38000, src:'nico_calzados', meta:'18k vendidos', rank:2 },
    { id:6, emoji:'🧥', title:'Campera North Face', price:89000, src:'meli', meta:'9k vendidos', rank:3 },
  ],
}

export const MOCK_BANCO_PROMOS = [
  { id:'galicia', banco:'Galicia', color:'#E8002D', initial:'G', promo:'30% OFF', desc:'Electrodomésticos y electrónica en Frávega y Garbarino', tags:['electronica','hogar'], dias:['Martes','Miércoles'], stores:['fravega','garbarino'], tipo:'descuento', pct:30, hot:true },
  { id:'santander', banco:'Santander', color:'#EC0000', initial:'S', promo:'20% OFF', desc:'Indumentaria y calzado · Visa y Mastercard', tags:['moda'], dias:['Lunes','Jueves'], stores:['meli','nico_calzados'], tipo:'descuento', pct:20, hot:false },
  { id:'bbva', banco:'BBVA', color:'#004B87', initial:'B', promo:'18 cuotas s/i', desc:'Tecnología y celulares en toda la web', tags:['celulares','electronica'], dias:['Todos'], stores:['meli','musimundo'], tipo:'cuotas', cuotas:18, hot:false },
  { id:'naranja', banco:'Naranja X', color:'#FF6B00', initial:'N', promo:'25% OFF', desc:'Muebles y hogar · Tarjeta Naranja', tags:['hogar'], dias:['Viernes'], stores:['garbarino','naldo'], tipo:'descuento', pct:25, hot:false },
  { id:'macro', banco:'Macro', color:'#DAA520', initial:'M', promo:'12 cuotas s/i', desc:'Electrodomésticos en todo el país', tags:['hogar','electronica'], dias:['Todos'], stores:['fravega','naldo','cetrogar'], tipo:'cuotas', cuotas:12, hot:false },
  { id:'bna', banco:'BNA', color:'#0D47A1', initial:'BNA', promo:'Reintegro $5k', desc:'Supermercados y farmacias · Débito', tags:[], dias:['Martes','Viernes'], stores:[], tipo:'reintegro', hot:false },
]

export const GUIDE_TIPS = [
  { ico:'🎯', title:'Sé específico con el uso', desc:'En lugar de "auriculares", describí para qué los usás.', example:'auriculares para home office con cancelación de ruido' },
  { ico:'💰', title:'Incluí tu presupuesto', desc:'El agente filtra y prioriza lo que entra en tu rango.', example:'celular hasta 200000 pesos buena cámara' },
  { ico:'🏪', title:'Elegí dónde comprás', desc:'Podés pedir que filtre por tienda o que priorice envío gratis.', example:'smart tv en Frávega con cuotas sin interés' },
  { ico:'📸', title:'Buscá con foto o voz', desc:'Usá el micrófono para dictar o la cámara para identificar.', example:null },
]
