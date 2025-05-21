import mysql from 'mysql2';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',   
    password: '',  
    database: 'timpapp' 
});

connection.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos');
    connection.query('SHOW TABLES;', (err, results) => {
    if (err) {
        console.error('Error al obtener las tablas:', err);
        return;
    }
    console.log('Tablas en la base de datos:', results);
});

});

export default connection;
