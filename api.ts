const API_URL = 'http://localhost:3001';

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
