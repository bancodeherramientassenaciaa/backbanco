import { Elemento, Area } from '../models/index.js';
import { Sequelize } from 'sequelize';
import upload from '../middlewares/fotoElementoMiddleware.js';

// Obtener todos los elementos
const getAllElements = async (req, res) => {
    try {
        const area = req.area;
        const elements = await Elemento.findAll({
            where: {
                areas_idarea: area,
                cantidad: {
                    [Sequelize.Op.gt]: 0 // Esto indica que cantidad debe ser mayor que 0
                }
            }
        });        
        res.json(elements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un elemento por id
const getElementById = async (req, res) => {
    try {
        const element = await Elemento.findByPk(req.params.idelemento);
        if (element) {
            res.json(element);
        } else {
            res.status(404).json({ message: 'El elemento ingresado no existe' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un elemento por su nombre
const getElementByName = async (req, res) => {
    try {
        const searchParam = req.params.descripcion.toLowerCase();
        const area = req.area;

        // Verifica si el parámetro es un número (posible id)
        const isId = !isNaN(searchParam);

        const elements = await Elemento.findAll({
            where: {
                cantidad: {
                    [Sequelize.Op.gt]: 0 // Esto indica que cantidad debe ser mayor que 0
                },
                areas_idarea: area,
                [Sequelize.Op.or]: [
                    // Si el parámetro es un id, busca por idelemento
                    isId ? { idelemento: searchParam } : null,
                    // Siempre busca por la descripción
                    Sequelize.where(
                        Sequelize.fn('LOWER', Sequelize.col('descripcion')),
                        'LIKE',
                        `%${searchParam}%`
                    )
                ].filter(Boolean)
            }
        });

        if (elements.length > 0) {
            res.json(elements);
        } else {
            res.status(404).json({ message: 'El elemento buscado no se encuentra' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear un nuevo elemento
const createElement = async (req, res) => {
    upload.single('foto')(req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({ mensaje: 'Error inesperado, vuelva a intentarlo' });
            }

            const { descripcion, cantidad, disponibles, ubicacion, observaciones, minimo, tipo, estado } = req.body;
            const area = req.area; 

            if (!area) {
                return res.status(400).json({ mensaje: 'El área del elemento no puede estar vacía' });
            }

            const areaExist = await Area.findByPk(area);
            if (!areaExist) {
                return res.status(400).json({ mensaje: 'El área ingresada no existe' });
            }

            const elementoMax = await Elemento.findOne({
                order: [['idelemento', 'DESC']],
                attributes: ['idelemento'],
            });
            const idelemento = elementoMax ? elementoMax.idelemento + 1 : 1;

            const foto = req.file ? req.file.filename : null;

            const element = await Elemento.create({
                idelemento: idelemento,
                descripcion: descripcion,
                cantidad: cantidad,
                disponibles: disponibles,
                ubicacion: ubicacion,
                minimo: minimo,
                observaciones,
                estado: estado,
                tipo: tipo,
                foto: foto,
                areas_idarea: area,
            });

            res.status(200).json(element);
        } catch (error) {
            console.log(error);
            res.status(500).json({ mensaje: 'Error inesperado, intente recargando la página' });
        }
    });
};

// Actualizar un elemento
const updateElement = async (req, res) => {
    try {
        // Manejar la carga de archivos (si se proporciona una nueva imagen)
        upload.single('foto')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ mensaje: 'Error al actualizar al guardar cambios, recarga la página' });
            }

            // Verificar si el elemento existe
            const element = await Elemento.findByPk(req.body.idelemento);
            if (!element) {
                return res.status(404).json({ mensaje: 'El elemento no existe' });
            }

            // Verificar si el área está vacía
            const areaMissing = req.body.areas_idarea;
            if (areaMissing === '') {
                return res.status(400).json({ mensaje: 'El área del elemento no puede estar vacía' });
            }

            // Verificar si el área existe
            const areaExist = await Area.findByPk(req.body.areas_idarea);
            if (!areaExist) {
                return res.status(400).json({ mensaje: 'El área ingresada no existe' });
            }

            // Obtener el nombre del archivo de la imagen subida, si existe una nueva imagen
            const foto = req.file ? req.file.filename : element.foto; // Mantener la imagen anterior si no se subió una nueva

            // Actualizar el elemento con los nuevos datos
            await element.update({ ...req.body, foto });

            res.status(200).json({ mensaje: 'Elemento actualizado correctamente', element });
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({ mensaje: 'Error al actualzar el elemento, por favor recarga la página' });
    }
};

// Eliminar un elemento
const deleteElement = async (req, res) => {
    try {
        const deleted = await Elemento.destroy({
            where: { idelemento: req.params.idelemento }
        });
        if (deleted) {
            res.status(200).json({ mensaje: 'Elemento eliminado correctamente' });
            // el 204 indica que el servidor ha recibido la solicitud con éxito, pero no devuelve ningún contenido.
        } else {
            res.status(404).json({ mensaje: 'Elemento no encontrado' });
        }
    } catch (error) {console.log(error)
        res.status(500).json({ error: error.message });
    }
};

// Obtener un elemento por su nombre para instructores por el problema del area
const getElementByNameInstructor = async (req, res) => {
    try {
        const searchParam = req.params.descripcion.toLowerCase();

        // Verifica si el parámetro es un número (posible id)
        const isId = !isNaN(searchParam);

        const elements = await Elemento.findAll({
            where: {
                cantidad: {
                    [Sequelize.Op.gt]: 0 // Esto indica que cantidad debe ser mayor que 0
                },
                [Sequelize.Op.or]: [
                    // Si el parámetro es un id, busca por idelemento
                    isId ? { idelemento: searchParam } : null,
                    // Siempre busca por la descripción
                    Sequelize.where(
                        Sequelize.fn('LOWER', Sequelize.col('descripcion')),
                        'LIKE',
                        `%${searchParam}%`
                    )
                ].filter(Boolean)
            }
        });

        if (elements.length > 0) {
            res.json(elements);
        } else {
            res.status(404).json({ message: 'El elemento buscado no se encuentra' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { getAllElements, getElementById, getElementByName, createElement, updateElement, deleteElement, getElementByNameInstructor };