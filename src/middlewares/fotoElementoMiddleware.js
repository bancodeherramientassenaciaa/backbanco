import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads/'); 
    },
    filename: (req, file, cb) => {
        // esto es para eliminar los espacios si el nombre del elementto tiene mas de una palabra, para que así se pueda guardar como una imagen
        let nombreElemento = req.body.descripcion.replace(/\s+/g, '');
        const uniqueSuffix = nombreElemento;
        cb(null, uniqueSuffix + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage });

export default upload;