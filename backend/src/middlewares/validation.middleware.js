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

// Transaction validation schemas
const transactionValidationSchema = Joi.object({
    date: Joi.date().iso().required().messages({
        'date.iso': 'Invalid date format (YYYY-MM-DD)',
        'any.required': 'Date is required'
    }),
    category_id: Joi.number().integer().min(1).required().messages({
        'number.base': 'Category ID must be a number',
        'any.required': 'Category ID is required'
    }),
    amount: Joi.number().min(0).required().messages({
        'number.base': 'Amount must be a number',
        'number.min': 'Amount cannot be negative',
        'any.required': 'Amount is required'
    }),
    description: Joi.string().max(255).optional().allow(null, ''),
    type: Joi.string().valid('EXPENSE', 'INCOME').required().messages({
        'any.only': 'Type must be either EXPENSE or INCOME',
        'any.required': 'Type is required'
    })
});

const mentorValidationSchema = Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
        'string.empty': 'Name cannot be empty',
        'string.min': 'Name must be at least 3 characters long'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Invalid email address',
        'string.empty': 'Email cannot be empty'
    }),
    phone_number: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).optional().allow(null, ''),
    address: Joi.string().max(255).optional().allow(null, ''),
    subject: Joi.string().optional().allow(null, ''),
    expertise: Joi.string().optional().allow(null, ''),
    salary_per_session: Joi.number().integer().min(0).optional().default(0),
    status: Joi.string().valid('AKTIF', 'NON-AKTIF').uppercase().default('AKTIF')
});

const scheduleValidationSchema = Joi.object({
    student_id: Joi.string().uuid().required().messages({
        'string.guid': 'Student ID must be a valid UUID',
        'any.required': 'Student ID is required'
    }),
    mentor_id: Joi.string().uuid().required().messages({
        'string.guid': 'Mentor ID must be a valid UUID',
        'any.required': 'Mentor ID is required'
    }),
    date: Joi.date().iso().required().messages({
        'date.iso': 'Invalid date format (YYYY-MM-DD)',
        'any.required': 'Date is required'
    }),
    start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
        'string.pattern': 'Start time must be in HH:MM format',
        'any.required': 'Start time is required'
    }),
    end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
        'string.pattern': 'End time must be in HH:MM format',
        'any.required': 'End time is required'
    }),
    subject: Joi.string().optional().allow(null, ''),
    planned_sessions: Joi.number().integer().min(1).max(31).default(4).messages({
        'number.base': 'Planned sessions must be a number',
        'number.min': 'Planned sessions must be at least 1',
        'number.max': 'Planned sessions cannot exceed 31'
    })
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
    transactionValidationSchema,
    mentorValidationSchema,
    scheduleValidationSchema,
    validateSchema
};
