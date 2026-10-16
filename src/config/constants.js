/**
 * Configuración comercial y constantes del Frontend
 */

export const COMPANY_CONFIG = {
  name: import.meta.env.VITE_COMPANY_NAME || 'TechConnect Seguridad & Redes',
  slogan: import.meta.env.VITE_COMPANY_SLOGAN || 'Instalación profesional de seguridad electrónica, Starlink y conectividad de alta velocidad',
  phone: import.meta.env.VITE_COMPANY_PHONE || '+54 9 11 0000-0000',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '5491100000000',
  email: import.meta.env.VITE_COMPANY_EMAIL || 'contacto@serviciostecnologicos.com',
  address: import.meta.env.VITE_COMPANY_ADDRESS || 'Atención personalizada en toda la región',
  defaultLocality: import.meta.env.VITE_DEFAULT_LOCALITY || 'Córdoba',
};

export const SERVICE_CODES = {
  CAMARAS_CABLEADAS: 'CAMARAS_CABLEADAS',
  CAMARAS_SOLARES: 'CAMARAS_SOLARES',
  STARLINK: 'STARLINK',
  TV_STREAMING: 'TV_STREAMING',
  REDES_CONECTIVIDAD: 'REDES_CONECTIVIDAD',
};

export const INITIAL_SERVICES = [
  {
    code: SERVICE_CODES.CAMARAS_CABLEADAS,
    name: 'Cámaras de seguridad cableadas',
    badge: 'Seguridad Continua',
    shortDescription: 'Monitoreo 24/7 sin cortes con cableado estructurado UTP/FTP y grabadores DVR/NVR profesionales.',
    longDescription: 'Instalación integral para interiores y exteriores. Provisión de equipamiento de alta definición, visión nocturna infrarroja y color, alimentación PoE y configuración para acceso remoto seguro desde tu celular o computadora sin costos mensuales ocultos.',
    benefits: [
      'Visualización en vivo y grabaciones desde tu smartphone.',
      'Sistemas DVR/NVR con respaldo en disco rígido especializado.',
      'Cero interferencias de señal y máxima estabilidad.',
      'Ideal para hogares, comercios, oficinas y naves industriales.',
    ],
    icon: 'Camera',
    gradient: 'from-blue-600 to-cyan-500',
  },
  {
    code: SERVICE_CODES.CAMARAS_SOLARES,
    name: 'Cámaras con paneles solares',
    badge: '100% Autónomo',
    shortDescription: 'Vigilancia autónoma alimentada por energía solar para zonas rurales, campos y accesos sin tendido eléctrico.',
    longDescription: 'Sistemas inteligentes equipados con panel fotovoltaico de alto rendimiento y batería de litio de larga duración. Conexión inalámbrica vía Wi-Fi o datos celulares 4G según cobertura, pensadas para resistir las inclemencias climáticas más exigentes.',
    benefits: [
      'Autonomía energética total con carga solar continua.',
      'Detección inteligente de movimiento con alertas push al celular.',
      'Fácil reubicación según las necesidades del predio.',
      'Excelente para campos, fincas, galpones, obras y tranqueras.',
    ],
    icon: 'SunMedium',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    code: SERVICE_CODES.STARLINK,
    name: 'Internet satelital Starlink',
    badge: 'Alta Velocidad Global',
    shortDescription: 'Instalación técnica certificada de antenas Starlink con soportes resistentes y cableado prolijo.',
    longDescription: 'Montaje profesional de antenas satelitales en techos, torres y mástiles con máxima línea de visión despejada. Enrutamiento estético y seguro del cable hacia el interior, anclajes reforzados contra vientos y puesta en marcha de red local.',
    benefits: [
      'Fijaciones y soportes de alta resistencia mecánica.',
      'Cero cables a la vista y pasamuros sellados contra filtraciones.',
      'Configuración del router, red Wi-Fi y pruebas de velocidad.',
      'Conectividad de banda ancha en cualquier rincón del país.',
    ],
    icon: 'Satellite',
    gradient: 'from-sky-500 to-indigo-600',
  },
  {
    code: SERVICE_CODES.TV_STREAMING,
    name: 'Televisión y streaming',
    badge: 'Entretenimiento HD/4K',
    shortDescription: 'Configuración de Smart TV, Chromecast, Fire TV y asistentes para disfrutar de tus plataformas favoritas.',
    longDescription: 'Puesta a punto completa de televisores inteligentes y dongles de streaming. Sincronización con tu red Wi-Fi, actualización de software, organización de apps compatibles y vinculación de tus cuentas existentes para que disfrutes de Netflix, Disney+, YouTube y TV digital sin complicaciones.',
    benefits: [
      'Instalación y configuración de dispositivos de streaming.',
      'Calibración óptima de audio, video y conexión de red.',
      'Asistencia personalizada con tus suscripciones y perfiles.',
      'Soluciones para dormitorios, salas de estar y habitaciones de hotel.',
    ],
    icon: 'Tv',
    gradient: 'from-purple-600 to-pink-500',
  },
  {
    code: SERVICE_CODES.REDES_CONECTIVIDAD,
    name: 'Redes y conectividad',
    badge: 'Máxima Cobertura Wi-Fi',
    shortDescription: 'Cableado Ethernet y puntos de acceso Wi-Fi Mesh para eliminar zonas muertas en casas y empresas.',
    longDescription: 'Diseño e implementación de infraestructura de red robusta. Instalación de bocas de red cableadas para puestos de trabajo, consolas y Smart TVs, junto con sistemas Access Point de largo alcance para una cobertura fluida y roaming sin cortes en toda la propiedad.',
    benefits: [
      'Eliminación definitiva de zonas sin señal Wi-Fi.',
      'Bocas de red Gigabit Ethernet categoría 6 de alta velocidad.',
      'Switches y routers configurados para tráfico prioritario.',
      'Conectividad garantizada para cámaras, servidores y televisores.',
    ],
    icon: 'Network',
    gradient: 'from-emerald-500 to-teal-600',
  },
];

export const LEAD_STATUS_CONFIG = {
  NEW: {
    label: 'Nuevo',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    dotColor: 'bg-blue-500',
    description: 'Solicitud recién recibida desde la web.',
  },
  CONTACTED: {
    label: 'Contactado',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    dotColor: 'bg-yellow-500',
    description: 'Primer contacto telefónico o por WhatsApp realizado.',
  },
  QUALIFIED: {
    label: 'Calificado',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    dotColor: 'bg-indigo-500',
    description: 'Necesidad y factibilidad técnica confirmadas.',
  },
  VISIT_SCHEDULED: {
    label: 'Visita Programada',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    dotColor: 'bg-purple-500',
    description: 'Relevamiento o instalación acordada en fecha específica.',
  },
  QUOTE_SENT: {
    label: 'Presupuesto Enviado',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    dotColor: 'bg-cyan-500',
    description: 'Cotización comercial formal entregada al cliente.',
  },
  WON: {
    label: 'Convertido',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dotColor: 'bg-emerald-500',
    description: 'Instalación concretada con éxito.',
  },
  LOST: {
    label: 'Descartado',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    dotColor: 'bg-slate-400',
    description: 'Oportunidad desestimada o fuera de alcance.',
  },
};

export const CUSTOMER_TYPE_OPTIONS = [
  { value: 'HOGAR', label: 'Hogar / Particular' },
  { value: 'LOCAL_COMERCIAL', label: 'Local Comercial' },
  { value: 'OFICINA', label: 'Oficina / Corporativo' },
  { value: 'HOTEL_ALOJAMIENTO', label: 'Hotel / Alojamiento Turístico' },
  { value: 'EMPRESA_RURAL', label: 'Establecimiento Rural / Galpón' },
  { value: 'OTRO', label: 'Otro' },
];

export const PREFERRED_CONTACT_OPTIONS = [
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'LLAMADA', label: 'Llamada Telefónica' },
  { value: 'EMAIL', label: 'Correo Electrónico' },
];
