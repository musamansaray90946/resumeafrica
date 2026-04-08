const prisma = require('../prisma')

const getResumes = async (req, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' }
    })
    res.json(resumes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getResume = async (req, res) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId }
    })
    if (!resume) return res.status(404).json({ error: 'Resume not found' })
    res.json(resume)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const createResume = async (req, res) => {
  try {
    const resume = await prisma.resume.create({
      data: { userId: req.userId, title: req.body.title || 'Untitled Resume' }
    })
    res.json(resume)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const updateResume = async (req, res) => {
  try {
    const allowed = ['title','template','photo','fullName','firstName','lastName','jobTarget','email','phone','location','postalCode','linkedin','website','summary','experience','education','skills','languages','references','certifications','colorTheme','fontFamily']
    const data = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        const val = req.body[key]
        if (Array.isArray(val)) {
          data[key] = JSON.stringify(val)
        } else {
          data[key] = val
        }
      }
    }
    const resume = await prisma.resume.update({
      where: { id: parseInt(req.params.id) },
      data
    })
    res.json(resume)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const deleteResume = async (req, res) => {
  try {
    await prisma.resume.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Resume deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const duplicateResume = async (req, res) => {
  try {
    const original = await prisma.resume.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId }
    })
    if (!original) return res.status(404).json({ error: 'Resume not found' })
    const { id, createdAt, updatedAt, ...rest } = original
    const resume = await prisma.resume.create({
      data: { ...rest, title: `${original.title} (Copy)` }
    })
    res.json(resume)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getResumes, getResume, createResume, updateResume, deleteResume, duplicateResume }