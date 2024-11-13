El back-end está desarrollado con node.js con el framework de express, tiene una estructura
de modelo-vista-controlador.

En la carpeta models se utiliza sequelize para definir los modelos de la base de datos
como objetos de js para mayor facilidad, cada archivo representa una tabla en la base de datos.
En el archivo index.js dentro de la carpeta models se definen las relaciones entre las tablas,
es necesario tener en cuenta que la conexión a la base de datos también se realizó utilizando
sequelize en la carpeta db en el archivo connection.js

## Importar la Base de Datos

1. Descarga el archivo `bdh.sql` del repositorio.
2. Abre phpMyAdmin y selecciona la base de datos en la que deseas importar los datos.
3. Ve a la pestaña "Importar" y selecciona el archivo `bdh.sql`.
4. Haz clic en "Continuar" para importar los datos.

18/07/2024 : puse autoincremental los ids de algunos modelos y lo modifiqué en la bd,
también agregué un campo tipo (tipo enum con valores: 'admin', 'contratista', 'practicante') a 
la tabla de administrador, y corregí algunos errores en los modelos y controladores

RECORDAR IMOPRTARNTE COMO HACER BACKLOG O COPIA DEL PROYECTO!!!!

TENER EN CUENTA EL MÉTODO PUTCH EN LUGAR DE PUT PORQUE SOLO ACTUALIZA UNA PARTE DEL RECURSO, NO EL RECURSO COMPLETO

cuadrar lo de los tipos para que quede como los roles, dar acceso solo a uno ----

tener en cuenta que si un instructor va ahacer un encargo debe indicar la zona del encargo
ANTES DE TODO, para que solo le aparezcan los elementos disponibles en esa área !!!

TENER EN CUENTA que hacer cuando se edita la contraseña de un administrador o cliente,
con el bcrypt y todo eso, en este momento no funciona !!!

Y que la imagen se actualiza cuando se intenta registrar un cliente que ya existe!!!

REVISAR si lo de CASCADA en los registros de la bd funciona!!!

El controlador de cliente, el de editar, no está funcionando, revisar, el de elemento editar tampoco funciona!!!

HAY un lugar en el que la contraseña no me la está poniendo obligatoria y debería, pero no me acuerdo donde, así que se debe!!!

Código de elementos manual   ----

Lo de las baja tipo daño y traspasos y que tenga ID, elemento, archivo, observaciones ----

Que se pueda pasar de prestamos a consumo!!!!

Restringir consumo hasta cierto punto, que no se puedan consumir todas, Control de mínimos (agregar campo "minimo" en la tabla de elementos) ----

Observaciones para los elementos ----

PENSAR COMO MANEJAR QUE LOS PRESTAMOS QUEDEN GUARDADOS, EL REGISTRO, COMO MANAJAR CUANDO LA CANNTIDAD 
DE PRESTAMO ES 0, CUANDO YA TODOS LOS ELEMENTOS SEAN DEVUELTOS, ETC !!!!!!!

FALTA VALIDAR TVENCIMIENTO DE TOKEN!!!

RECORDAR PONER TEXTAREA PARA LAS OBSERVACIONES EN EL FRONT---- REVISAR CANTIDADES DE TABLAS EN EL CAMPO DE OBSERVACIONES---- TERMINAR DE REVISAR EL ADDORUPDATE ---- Y REVISAR RELACIONES CON MORAS DAÑOS Y BAJAS QUE TENGO DUDAS!!! ----

MIRAR VIDEO Y PONER PRACTICAMENTE TODO IGUAL!!! LO DE BUSCAR ELEMENTOS POR EL CÓDIGO Y AL DAR ENTER 