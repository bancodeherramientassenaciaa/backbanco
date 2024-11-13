import jwt from 'jsonwebtoken';
import config from '../../config/config.js';

const secret = config.jwt.secret;

// Middleware para verificar el token JWT
const authenticate = (req, res, next) => {

  if (req.header('Authorization') == undefined) {
    return res.status(401).json({ mensaje: 'Debes Iniciar Sesión para acceder a este sitio' });
  } 
    
  const token = req.header('Authorization').replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'No puedes acceder a este sitio, inténtalo mas tarde' });
  }
};

const verifyType = (tipoPermitido) => {
  return (req, res, next) => {
    const { type } = req.user; 

    if (tipoPermitido.includes(type)) {
      next();
    } else {
      return res.status(403).json({ mensaje: 'Este tipo de usuario no tiene autorización' });
    }
  };
};

const verifyRole = (rolesPermitidos) => {
  return (req, res, next) => {
    const { role } = req.user;

    if (rolesPermitidos.includes(role)) {
      next();
    } else {
      return res.status(403).json({ mensaje: 'Acceso denegado, no tienes el rol adecuado' });
    }
  };
};

const verifyArea = (req, res, next) => {
  const { area } = req.user; 
  if (!area) {
      return res.status(403).json({ mensaje: 'No se ha podido verificar el área del usuario' });
  }
  req.area = area;
  next();
};

export {authenticate, verifyType, verifyRole, verifyArea};


