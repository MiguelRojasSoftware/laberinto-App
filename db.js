const oracledb = require('oracledb');

// Configurar el modo "Thick"
oracledb.initOracleClient({ libDir: 'C:\\oraclexe\\instantclient_21_14' }); // Asegúrate de que esta ruta es correcta

// Configuración de la conexión a la base de datos Oracle
const config = {
  user: 'laberinto', // Usuario de la base de datos
  password: 'algopersonal', // Contraseña del usuario
  connectString: 'localhost:1521/xe' // Cadena de conexión: host, puerto y SID
};

// Función para inicializar el pool de conexiones
async function initialize() {
  try {
    // Crear el pool de conexiones con la configuración proporcionada
    await oracledb.createPool(config);
    console.log('Connection pool started'); // Mensaje de éxito
  } catch (err) {
    console.error('Error starting connection pool', err); // Mensaje de error
    process.exit(1); // Salir del proceso si hay un error
  }
}

// Función para cerrar el pool de conexiones
async function close() {
  try {
    // Cerrar el pool de conexiones con un tiempo de espera de 10 segundos
    await oracledb.getPool().close(10);
    console.log('Connection pool closed'); // Mensaje de éxito
  } catch (err) {
    console.error('Error closing connection pool', err); // Mensaje de error
  }
}

// Exportar las funciones de inicialización, cierre y obtención del pool
module.exports = {
  initialize,
  close,
  getPool: () => oracledb.getPool()
};
