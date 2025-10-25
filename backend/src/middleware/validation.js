const validator = require('validator');

/**
 * Validation middleware for common fields
 */
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (email && !validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }
  
  next();
};

const validatePassword = (req, res, next) => {
  const { password } = req.body;
  
  if (password) {
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    if (password.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Password must be less than 128 characters'
      });
    }
  }
  
  next();
};

const validatePhone = (req, res, next) => {
  const { phone } = req.body;
  
  if (phone && !validator.isMobilePhone(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number format'
    });
  }
  
  next();
};

const validatePrice = (req, res, next) => {
  const { price, comparePrice } = req.body;
  
  if (price !== undefined) {
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number'
      });
    }
  }
  
  if (comparePrice !== undefined) {
    const comparePriceNum = parseFloat(comparePrice);
    if (isNaN(comparePriceNum) || comparePriceNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Compare price must be a valid positive number'
      });
    }
  }
  
  next();
};

const validateRating = (req, res, next) => {
  const { rating } = req.body;
  
  if (rating !== undefined) {
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
  }
  
  next();
};

const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive integer'
      });
    }
  }
  
  if (limit) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100'
      });
    }
  }
  
  next();
};

const validateRequired = (fields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    fields.forEach(field => {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing',
        errors: missingFields.map(field => ({
          field,
          message: `${field} is required`
        }))
      });
    }
    
    next();
  };
};

const validateEnum = (field, allowedValues) => {
  return (req, res, next) => {
    const value = req.body[field];
    
    if (value !== undefined && !allowedValues.includes(value)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${field}. Must be one of: ${allowedValues.join(', ')}`
      });
    }
    
    next();
  };
};

const validateStringLength = (field, minLength = 0, maxLength = 255) => {
  return (req, res, next) => {
    const value = req.body[field];
    
    if (value !== undefined) {
      if (typeof value !== 'string') {
        return res.status(400).json({
          success: false,
          message: `${field} must be a string`
        });
      }
      
      if (value.length < minLength) {
        return res.status(400).json({
          success: false,
          message: `${field} must be at least ${minLength} characters long`
        });
      }
      
      if (value.length > maxLength) {
        return res.status(400).json({
          success: false,
          message: `${field} must be less than ${maxLength} characters long`
        });
      }
    }
    
    next();
  };
};

const validateArray = (field, minItems = 0, maxItems = 100) => {
  return (req, res, next) => {
    const value = req.body[field];
    
    if (value !== undefined) {
      if (!Array.isArray(value)) {
        return res.status(400).json({
          success: false,
          message: `${field} must be an array`
        });
      }
      
      if (value.length < minItems) {
        return res.status(400).json({
          success: false,
          message: `${field} must have at least ${minItems} items`
        });
      }
      
      if (value.length > maxItems) {
        return res.status(400).json({
          success: false,
          message: `${field} must have no more than ${maxItems} items`
        });
      }
    }
    
    next();
  };
};

const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file provided'
    });
  }
  
  next();
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validatePrice,
  validateRating,
  validatePagination,
  validateRequired,
  validateEnum,
  validateStringLength,
  validateArray,
  validateFileUpload
};
