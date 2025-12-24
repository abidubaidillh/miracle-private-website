const Joi = require('joi');

const studentValidationSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    age: Joi.number().integer().min(1).required(),
    phone_number: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).optional().allow(null, ''),
    address: Joi.string().max(255).optional().allow(null, ''),
    status: Joi.string().valid('AKTIF', 'NON-AKTIF').uppercase().default('AKTIF'),
    package_id: Joi.number().integer().optional().allow(null),
    parent_name: Joi.string().min(3).max(100).required(),
    parent_phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).required(),
});

const updateStudentValidationSchema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    age: Joi.number().integer().min(1).optional(),
    phone_number: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).optional().allow(null, ''),
    address: Joi.string().max(255).optional().allow(null, ''),
    status: Joi.string().valid('AKTIF', 'NON-AKTIF').uppercase().optional(),
    package_id: Joi.number().integer().optional().allow(null),
    parent_name: Joi.string().min(3).max(100).optional(),
    parent_phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).optional(),
}).min(1).message('Request body cannot be empty'); // Ensure at least one field is provided for update

const moneyValidationSchema = Joi.object({
    amount: Joi.number().min(0).required(),
    description: Joi.string().max(255).optional().allow(null, ''),
});

const registerValidationSchema = Joi.object({
    username: Joi.string().trim().min(3).required().messages({
        'string.empty': 'Username cannot be empty',
        'string.min': 'Username must be at least 3 characters long'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email address',
        'string.empty': 'Email cannot be empty'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.empty': 'Password cannot be empty'
    }),
    phone_number: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).required().messages({
        'string.pattern': 'Invalid phone number format',
        'string.empty': 'Phone number cannot be empty'
    }),
    birthday: Joi.date().iso().required().messages({
        'date.iso': 'Invalid birthday format (YYYY-MM-DD)',
        'any.required': 'Birthday cannot be empty'
    })
});

const loginValidationSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email address',
        'string.empty': 'Email cannot be empty'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password cannot be empty'
    })
});

const registerInternalValidationSchema = Joi.object({
    username: Joi.string().trim().min(3).required().messages({
        'string.empty': 'Username cannot be empty',
        'string.min': 'Username must be at least 3 characters long'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email address',
        'string.empty': 'Email cannot be empty'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.empty': 'Password cannot be empty'
    }),
    role: Joi.string().valid('OWNER', 'ADMIN', 'BENDAHARA', 'MENTOR').uppercase().required().messages({
        'any.only': 'Invalid role specified',
        'string.empty': 'Role cannot be empty'
    }),
    phone_number: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).optional().allow(null, ''),
    birthday: Joi.date().iso().optional().allow(null),
    salary_per_session: Joi.number().integer().min(0).optional().allow(null),
    subjects: Joi.string().optional().allow(null, ''),
    expertise: Joi.string().optional().allow(null, ''),
});

const validateSchema = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (error) {
        const errors = error.details.map(err => ({ [err.context.key]: err.message }));
        return res.status(400).json({ errors });
    }
    next();
};

module.exports = {
    studentValidationSchema,
    updateStudentValidationSchema,
    moneyValidationSchema,
    registerValidationSchema,
    loginValidationSchema,
    registerInternalValidationSchema,
    validateSchema
};
