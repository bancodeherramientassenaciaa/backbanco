import multer from 'multer';
import path from 'path';

// Configura el almacenamiento para archivos Excel
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads/'); // Cambia esto si deseas un directorio diferente
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`); // Genera un nombre único
    }
});

// Filtra los tipos de archivo para permitir solo archivos Excel
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.xlsx' && ext !== '.xls') {
        return cb(new Error('Solo se permiten archivos Excel'));
    }
    cb(null, true);
};

const upload = multer({ storage, fileFilter });

export default upload;
