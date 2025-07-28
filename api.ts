import { API_URL} from '@env';

export const getUsuarios = async () => {
  try {
    const response = await fetch(`${API_URL}/usuarios`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return [];
  }
};

export const getProyectoPorId = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/proyectos/${id}`);
    if (!response.ok) throw new Error('Error al obtener proyecto');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo proyecto:', error);
    return null;
  }
};

export const getUsuarioPorId = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/usuarios/${id}`);
    if (!response.ok) throw new Error('Error al obtener usuario');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }
};

// NUEVO: Obtener TODOS los reportes, sin filtro
export const getTodosLosReportes = async () => {
  try {
    const response = await fetch(`${API_URL}/reportes`);
    if (!response.ok) throw new Error('Error al obtener todos los reportes');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo todos los reportes:', error);
    return [];
  }
};

export const getReportesPorProyecto = async (proyectoId: string) => {
  try {
    const response = await fetch(`${API_URL}/reportes/proyecto/${proyectoId}`);
    if (!response.ok) throw new Error('Error al obtener reportes');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    return [];
  }
};

export const crearReporte = async (datosReporte: any) => {
  try {
    const response = await fetch(`${API_URL}/reportes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosReporte),
    });
    if (!response.ok) throw new Error('Error al crear reporte');
    return await response.json();
  } catch (error) {
    console.error('Error creando reporte:', error);
    throw error;
  }
};

export const actualizarReporte = async (id: string, datosReporte: any) => {
  try {
    const response = await fetch(`${API_URL}/reportes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosReporte),
    });
    if (!response.ok) throw new Error('Error al actualizar reporte');
    return await response.json();
  } catch (error) {
    console.error('Error actualizando reporte:', error);
    throw error;
  }
};

// NUEVO: Marcar reporte como leído por un usuario
export const marcarReporteComoLeido = async (reporteId: string, usuarioId: string) => {
  try {
    const response = await fetch(`${API_URL}/reportes/${reporteId}/marcar-leido`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuarioId }),
    });
    if (!response.ok) throw new Error('Error al marcar reporte como leído');
    return await response.json();
  } catch (error) {
    console.error('Error marcando como leído:', error);
    throw error;
  }
};

export const marcarComentarioLeido = async (reporteId: string) => {
  try {
    const response = await fetch(`${API_URL}/reportes/comentario/${reporteId}`, {
      method: 'PUT',
    });
    if (!response.ok) throw new Error('Error al marcar comentario como leído');
    return await response.json();
  } catch (error) {
    console.error('Error marcando comentario como leído:', error);
    throw error;
  }
};
export const crearProyecto = async (datosProyecto: any) => {
  try {
    const response = await fetch(`${API_URL}/proyectos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosProyecto),
    });
    if (!response.ok) throw new Error('Error al crear proyecto');
    return await response.json();
  } catch (error) {
    console.error('Error creando proyecto:', error);
    throw error;
  }
};
