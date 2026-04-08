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
    const { title, template, photo, fullName, email, phone, location, summary, experience, education, skills, languages, references, colorTheme, fontFamily } = req.body
    const data = {}
    if (title !== undefined) data.title = title
    if (template !== undefined) data.template = template
    if (photo !== undefined) data.photo = photo
    if (fullName !== undefined) data.fullName = fullName
    if (email !== undefined) data.email = email
    if (phone !== undefined) data.phone = phone
    if (location !== undefined) data.location = location
    if (summary !== undefined) data.summary = summary
    if (experience !== undefined) data.experience = typeof experience === 'string' ? experience : JSON.stringify(experience)
    if (education !== undefined) data.education = typeof education === 'string' ? education : JSON.stringify(education)
    if (skills !== undefined) data.skills = typeof skills === 'string' ? skills : JSON.stringify(skills)
    if (languages !== undefined) data.languages = typeof languages === 'string' ? languages : JSON.stringify(languages)
    if (references !== undefined) data.references = typeof references === 'string' ? references : JSON.stringify(references)
    if (colorTheme !== undefined) data.colorTheme = colorTheme
    if (fontFamily !== undefined) data.fontFamily = fontFamily

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