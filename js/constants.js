SICP.CONSTANTES = {
  CATEGORIAS_META: [
    'Componente 1: Producción de investigación',
    'Componente 2: Fortalecimiento de la comunidad HCTI',
    'Componente 3: Acceso universal al conocimiento',
    'Innovación', 'Liderazgo', 'Productividad'
  ],
  TIPOS_PRODUCTO: [
    { value: 'Artículo', label: 'Artículo científico', componente: 'C1' },
    { value: 'Libro', label: 'Libro', componente: 'C1' },
    { value: 'Capítulo', label: 'Capítulo de libro', componente: 'C1' },
    { value: 'Tesis', label: 'Tesis dirigida', componente: 'C2' },
    { value: 'Congreso', label: 'Congreso', componente: 'C1' },
    { value: 'Conferencia', label: 'Conferencia magistral', componente: 'C2' },
    { value: 'Proyecto', label: 'Proyecto de investigación', componente: 'C1' },
    { value: 'Innovación', label: 'Innovación', componente: 'C1' },
    { value: 'Software', label: 'Software o plataforma', componente: 'C1' },
    { value: 'Patente', label: 'Patente o modelo utilidad', componente: 'C1' },
    { value: 'Docencia', label: 'Docencia formal', componente: 'C2' },
    { value: 'Liderazgo', label: 'Liderazgo académico', componente: 'C2' },
    { value: 'Comité', label: 'Comité académico/editorial', componente: 'C2' },
    { value: 'Editorial', label: 'Editorial o revisión', componente: 'C2' },
    { value: 'Divulgación', label: 'Divulgación científica', componente: 'C3' },
    { value: 'Acceso abierto', label: 'Acceso abierto / repositorio', componente: 'C3' },
    { value: 'Consultoría', label: 'Consultoría especializada', componente: 'C1' },
    { value: 'Otro', label: 'Otro producto', componente: 'C1' }
  ],
  ESTADOS_META: ['No iniciada', 'En proceso', 'En revisión', 'Completada', 'Pausada', 'Cancelada'],
  PRIORIDADES: ['Crítica', 'Alta', 'Media', 'Baja'],
  ESTADOS_EVIDENCIA: ['Completa', 'Incompleta', 'Pendiente', 'No aplica'],
  MESES: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  AREAS_SNII: [
    'Ciencias Sociales', 'Humanidades y Ciencias de la Conducta',
    'Ciencia Política y Administración Pública', 'Economía y Finanzas',
    'Derecho', 'Artes y Letras',
    'Ciencias Biológicas, Químicas y de la Salud',
    'Ingenierías y Desarrollo Tecnológico',
    'Interdisciplinaria'
  ],
  PERFILES_INVESTIGACION: [
    { value: 'Ciencia básica y de frontera', icon: '🔬' },
    { value: 'Desarrollo tecnológico e innovación', icon: '💡' },
    { value: 'Atención a problemas nacionales', icon: '🇲🇽' },
    { value: 'Interdisciplinaria', icon: '🔗' }
  ],
  COMPONENTES_SNII: [
    { id: 'C1', nombre: 'Producción de investigación científica, humanística y tecnológica', peso: 40, color: '#2563eb' },
    { id: 'C2', nombre: 'Fortalecimiento y consolidación de la comunidad HCTI', peso: 30, color: '#d97706' },
    { id: 'C3', nombre: 'Acceso universal al conocimiento', peso: 30, color: '#16a34a' }
  ],
  NIVELES_SNII: [
    { id: 'Candidatura', rango: [20, 40], desc: 'Doctorado + capacidad de investigación demostrable' },
    { id: 'Nivel I', rango: [45, 70], desc: 'Producción constante en C1. Actividad en C2 y C3.' },
    { id: 'Nivel II', rango: [60, 85], desc: 'Producción sólida. Liderazgo nacional. Formación activa.' },
    { id: 'Nivel III', rango: [80, 100], desc: 'Excelencia. Liderazgo internacional. Alto impacto.' }
  ]
};

SICP.getComponenteDeProducto = function(tipo) {
  var p = SICP.CONSTANTES.TIPOS_PRODUCTO.find(function(t) { return t.value === tipo; });
  return p ? p.componente : 'C1';
};
