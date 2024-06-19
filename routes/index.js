var express = require('express');
var router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const path = require('path');
const oracledb = require('oracledb');
const db = require('../db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Laberinto', laberinto: [], path: [] });
});

router.post('/upload', upload.single('file'), async (req, res) => {
  console.log('Archivo recibido:', req.file);

  const filePath = path.join(__dirname, '../', req.file.path);
  console.log('Ruta del archivo:', filePath);

  // Leer el archivo y cargar los datos en la base de datos
  fs.readFile(filePath, 'utf8', async (err, data) => {
    if (err) {
      console.error('Error al leer el archivo:', err);
      return res.status(500).send('Error al leer el archivo.');
    }

    console.log('Contenido del archivo:', data);

    const lines = data.trim().split('\n');
    const laberinto = lines.map(line => line.split('').map(Number));

    console.log('Matriz del laberinto:', laberinto);

    // Conectar a la base de datos y cargar el laberinto
    try {
      const connection = await db.getPool().getConnection();
      console.log('Conexión a la base de datos establecida');

      await connection.execute(`DELETE FROM laberinto`);
      let id = 1;

      // Insertar el nuevo laberinto en la base de datos
      for (let i = 0; i < laberinto.length; i++) {
        for (let j = 0; j < laberinto[i].length; j++) {
          await connection.execute(
            `INSERT INTO laberinto (id, fila, columna, valor) VALUES (:id, :fila, :columna, :valor)`,
            { id, fila: i + 1, columna: j + 1, valor: laberinto[i][j] }
          );
          id++;
        }
      }

      console.log('Laberinto cargado en la base de datos');

      // Ejecutar la función para encontrar el camino
      const result = await connection.execute(
        `BEGIN :result := encontrar_camino(1, 1); END;`,
        { result: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
      );

      console.log('Resultado de encontrar_camino:', result.outBinds);

      // Commit de la transacción
      await connection.commit();

      const pathQuery = await connection.execute(
        `SELECT fila, columna FROM laberinto WHERE valor = 9 ORDER BY fila, columna`
      );

      await connection.close();

      // Si se encontró un camino, devolverlo en la respuesta
      if (result.outBinds.result) {
        console.log('Camino encontrado:', pathQuery.rows);
        res.render('index', { title: 'Laberinto', laberinto, path: pathQuery.rows });
      } else {
        console.log('No se encontró un camino');
        res.render('index', { title: 'Laberinto', laberinto, path: [] });
      }
    } catch (err) {
      console.error('Error al procesar la base de datos:', err);
      res.status(500).send('Error al procesar la base de datos.');
    }
  });
});

module.exports = router;
