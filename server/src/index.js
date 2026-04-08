const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '10mb' }))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/resumes', require('./routes/resumes'))

app.get('/', (req, res) => {
  res.json({ message: 'ResumeAfrica API is running' })
})

const PORT = process.env.PORT || 5004
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))