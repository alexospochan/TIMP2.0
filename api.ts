const API_URL = 'http://192.168.30.94:3000';

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
