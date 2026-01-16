// backend/src/middlewares/validation.middleware.js

const Joi = require('joi');

// --- A. SCHEMA MURID (STUDENT) ---

const studentValidationSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    age: Joi.number().integer().min(1).required(),
    school_origin: Joi.string().max(100).optional().allow(null, ''),
    address: Joi.string().max(255).optional().allow(null, ''),
    status: Joi.string().valid('AKTIF', 'NON-AKTIF').uppercase().default('AKTIF'),
    package_id: Joi.number().integer().optional().allow(null),
    parent_name: Joi.string().min(3).max(100).required(),
    parent_phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).required(),
});

const updateStudentValidationSchema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    age: Joi.number().integer().min(1).optional(),
    school_origin: Joi.string().max(100).optional().allow(null, ''),
    address: Joi.string().max(255).optional().allow(null, ''),
    status: Joi.string().valid('AKTIF', 'NON-AKTIF').uppercase().optional(),
    package_id: Joi.number().integer().optional().allow(null),
    parent_name: Joi.string().min(3).max(100).optional(),
    parent_phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).optional(),
}).min(1).message('Request body cannot be empty');

// --- B. SCHEMA KEUANGAN & TRANSAKSI ---
const moneyValidationSchema = Joi.object({
    amount: Joi.number().min(0).required(),
    description: Joi.string().max(255).optional().allow(null, ''),
});

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

// --- C. SCHEMA AUTH & USER (TETAP MENGGUNAKAN No. HP) ---
const registerValidationSchema = Joi.object({
    username: Joi.string().trim().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone_number: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).required(),
    birthday: Joi.date().iso().required()
});

const loginValidationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const registerInternalValidationSchema = Joi.object({
    username: Joi.string().trim().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('OWNER', 'ADMIN', 'BENDAHARA', 'MENTOR').uppercase().required(),
    phone_number: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).optional().allow(null, ''),
    birthday: Joi.date().iso().optional().allow(null),
    salary_per_session: Joi.number().integer().min(0).optional().allow(null),
    subjects: Joi.string().optional().allow(null, ''),
    expertise: Joi.string().optional().allow(null, ''),
});

// --- D. SCHEMA MENTOR & JADWAL ---
const mentorValidationSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    phone_number: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).optional().allow(null, ''),
    address: Joi.string().max(255).optional().allow(null, ''),
    subject: Joi.string().optional().allow(null, ''),
    expertise: Joi.string().optional().allow(null, ''),
    salary_per_session: Joi.number().integer().min(0).optional().default(0),
    status: Joi.string().valid('AKTIF', 'NON-AKTIF').uppercase().default('AKTIF')
});

const scheduleValidationSchema = Joi.object({
    student_id: Joi.string().uuid().required(),
    mentor_id: Joi.string().uuid().required(),
    date: Joi.date().iso().required(),
    start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    subject: Joi.string().optional().allow(null, ''),
    planned_sessions: Joi.number().integer().min(1).max(31).default(4)
});

// --- E. VALIDATOR FUNCTION ---
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