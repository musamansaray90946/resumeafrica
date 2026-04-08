const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { getResumes, getResume, createResume, updateResume, deleteResume, duplicateResume } = require('../controllers/resumeController')

router.get('/', auth, getResumes)
router.get('/:id', auth, getResume)
router.post('/', auth, createResume)
router.put('/:id', auth, updateResume)
router.delete('/:id', auth, deleteResume)
router.post('/:id/duplicate', auth, duplicateResume)

module.exports = router