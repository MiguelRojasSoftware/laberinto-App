#Laberinto Solver con Node.js y Oracle
##Descripción

ejecucion

npm start

Requerimientos

modulos de node

Este proyecto permite resolver laberintos utilizando Node.js, Express.js y Oracle Database. Los usuarios pueden cargar un archivo de texto que representa un laberinto, y el sistema utiliza una función PL/SQL para encontrar el camino desde el inicio hasta la salida del laberinto. Los resultados se muestran gráficamente en la interfaz web.
Requerimientos de Instalación
Prerrequisitos

Antes de comenzar, asegúrate de tener instalados los siguientes componentes:

    Node.js
    Oracle Database (puede ser Oracle Database XE o una instancia accesible de Oracle Database)
    Oracle Instant Client
    Librerías de Node.js:
        express
        oracledb
        multer
        path
        fs
        

CREATE TABLE laberinto (
  id NUMBER PRIMARY KEY,
  fila NUMBER NOT NULL,
  columna NUMBER NOT NULL,
  valor NUMBER NOT NULL
);


create or replace FUNCTION encontrar_camino(x IN NUMBER, y IN NUMBER) RETURN NUMBER IS
  -- Variables locales
  TYPE tipo_laberinto IS TABLE OF NUMBER INDEX BY PLS_INTEGER;
  laberinto tipo_laberinto;
  resultado NUMBER := 0;

  -- Subfunción recursiva para encontrar el camino
  FUNCTION encontrar(x IN NUMBER, y IN NUMBER) RETURN BOOLEAN IS
  BEGIN
    -- Verificar si estamos fuera del laberinto
    IF x < 1 OR y < 1 OR x > 10 OR y > 10 THEN
      RETURN FALSE;
    END IF;

    -- Verificar si encontramos la salida
    IF laberinto((x - 1) * 10 + y) = 5 THEN
      RETURN TRUE;
    END IF;

    -- Verificar si la celda no es transitable
    IF laberinto((x - 1) * 10 + y) != 1 THEN
      RETURN FALSE;
    END IF;

    -- Marcar la celda como parte del camino
    laberinto((x - 1) * 10 + y) := 9;

    -- Intentar moverse en las cuatro direcciones
    IF encontrar(x, y - 1) THEN
      RETURN TRUE;
    ELSIF encontrar(x + 1, y) THEN
      RETURN TRUE;
    ELSIF encontrar(x, y + 1) THEN
      RETURN TRUE;
    ELSIF encontrar(x - 1, y) THEN
      RETURN TRUE;
    END IF;

    -- Desmarcar la celda si no es parte del camino
    laberinto((x - 1) * 10 + y) := 1;
    RETURN FALSE;
  END encontrar;

BEGIN
  -- Inicializar el laberinto con ceros
  FOR i IN 1..100 LOOP
    laberinto(i) := 0;
  END LOOP;

  -- Cargar el laberinto desde la tabla
  BEGIN
    FOR fila IN (SELECT * FROM laberinto ORDER BY fila, columna) LOOP
      laberinto((fila.fila - 1) * 10 + fila.columna) := fila.valor;
    END LOOP;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RETURN 0;
  END;

  -- Llamar a la subfunción recursiva
  IF encontrar(x, y) THEN
    -- Actualizar la tabla laberinto para marcar el camino
    FOR i IN 1..10 LOOP
      FOR j IN 1..10 LOOP
        IF laberinto((i - 1) * 10 + j) = 9 THEN
          UPDATE laberinto SET valor = 9 WHERE fila = i AND columna = j;
        END IF;
      END LOOP;
    END LOOP;
    resultado := 1;
  END IF;

  RETURN resultado;
END encontrar_camino;
