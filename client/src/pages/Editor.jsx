import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import API from '../config'
import axios from 'axios'

const TEMPLATES = ['classic', 'modern', 'bold', 'elegant', 'minimal']
const COLORS = ['#2563eb','#059669','#dc2626','#7c3aed','#ea580c','#0891b2','#4f46e5','#be185d','#0d9488','#ca8a04']
const FONTS = ['Inter','Georgia','Arial','Times New Roman','Helvetica','Verdana','Garamond','Palatino']

const STEPS = [
  { id: 'personal', label: 'Personal Details', icon: '👤' },
  { id: 'experience', label: 'Professional Experience', icon: '💼' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'skills', label: 'Skills', icon: '⚡' },
  { id: 'extras', label: 'Additional Info', icon: '📎' },
  { id: 'design', label: 'Customize Design', icon: '🎨' },
]

export default function Editor() {
  const { id } = useParams()
  const { token } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const previewRef = useRef()
  const [resume, setResume] = useState(null)
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => { fetchResume() }, [id])

  const fetchResume = async () => {
    try {
      const res = await axios.get(`${API}/resumes/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      const d = res.data
      ;['experience','education','skills','languages','references','certifications'].forEach(k => {
        d[k] = typeof d[k] === 'string' ? JSON.parse(d[k]) : d[k]
      })
      setResume(d)
    } catch { toast.error('Failed to load'); navigate('/dashboard') }
  }

  const autoSave = (updated) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setSaving(true)
      try { await axios.put(`${API}/resumes/${id}`, updated, { headers: { Authorization: `Bearer ${token}` } }) } catch {}
      setSaving(false)
    }, 600)
  }

  const update = (field, value) => {
    setResume(prev => ({ ...prev, [field]: value }))
    autoSave({ [field]: value })
  }

  const updateArray = (field, index, key, value) => {
    const arr = [...resume[field]]
    arr[index] = { ...arr[index], [key]: value }
    setResume(prev => ({ ...prev, [field]: arr }))
    autoSave({ [field]: arr })
  }

  const addItem = (field, template) => update(field, [...resume[field], template])
  const removeItem = (field, index) => update(field, resume[field].filter((_, i) => i !== index))

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return toast.error('Photo must be under 2MB')
    const reader = new FileReader()
    reader.onload = () => update('photo', reader.result)
    reader.readAsDataURL(file)
  }

  const handlePrint = () => {
    const content = previewRef.current.innerHTML
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html>
<html>
<head>
<title>${resume.title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ${resume.fontFamily}, sans-serif; color: #1f2937; line-height: 1.5; }
  @page { size: A4; margin: 10mm; }
  @media print {
    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    img { max-width: 80px !important; max-height: 80px !important; }
  }
  img { max-width: 80px; max-height: 80px; border-radius: 50%; object-fit: cover; }
  .resume-page { max-width: 210mm; margin: 0 auto; }
  h1 { font-size: 24pt; }
  h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; padding-bottom: 4px; }
  h3 { font-size: 11pt; }
  p, span, li { font-size: 10pt; }
  .text-xs { font-size: 9pt; }
  .footer-credit { text-align: center; font-size: 7pt; color: #9ca3af; margin-top: 20px; padding-top: 10px; border-top: 1px solid #e5e7eb; }
</style>
</head>
<body>
<div class="resume-page">${content}</div>
<div class="footer-credit">Built with ResumeAfrica — resumeafrica.vercel.app | Created by Musa Mansaray</div>
</body>
</html>`)
    win.document.close()
    setTimeout(() => { win.print(); win.close() }, 600)
  }

  const progress = Math.round(((step + 1) / STEPS.length) * 100)

  if (!resume) return <div className="text-center py-20 text-gray-400">Loading...</div>

  return (
    <div className="flex h-[calc(100vh-65px)]">
      {/* LEFT PANEL */}
      <div className="w-[520px] border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <input type="text" value={resume.title} onChange={e => update('title', e.target.value)} className="text-lg font-bold text-gray-900 border-none focus:outline-none bg-transparent w-48" />
          </div>
          <div className="flex items-center gap-2">
            {saving && <span className="text-xs text-emerald-500 flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>Saving</span>}
            <button onClick={handlePrint} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print / PDF
            </button>
          </div>
        </div>

        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Step {step + 1} of {STEPS.length}</span>
            <span className="text-xs font-medium text-emerald-600">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex justify-between mt-3">
            {STEPS.map((s, i) => (
              <button key={s.id} onClick={() => setStep(i)} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${i === step ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : i < step ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                  {i < step ? '✓' : s.icon}
                </div>
                <span className={`text-[10px] font-medium ${i === step ? 'text-emerald-600' : 'text-gray-400'}`}>{s.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">{STEPS[step].icon} {STEPS[step].label}</h2>
          <p className="text-sm text-gray-400 mb-6">
            {step === 0 && 'Add your contact information so employers can reach you.'}
            {step === 1 && 'Add your work history, starting with the most recent.'}
            {step === 2 && 'Add your educational background.'}
            {step === 3 && 'List the skills that make you a great candidate.'}
            {step === 4 && 'Add languages, certifications, and references.'}
            {step === 5 && 'Choose a template, colors, and font.'}
          </p>
          <div className="space-y-4">
            {step === 0 && <PersonalStep resume={resume} update={update} handlePhoto={handlePhoto} />}
            {step === 1 && <ExperienceStep resume={resume} updateArray={updateArray} addItem={addItem} removeItem={removeItem} />}
            {step === 2 && <EducationStep resume={resume} updateArray={updateArray} addItem={addItem} removeItem={removeItem} />}
            {step === 3 && <SkillsStep resume={resume} update={update} removeItem={removeItem} />}
            {step === 4 && <ExtrasStep resume={resume} update={update} updateArray={updateArray} addItem={addItem} removeItem={removeItem} />}
            {step === 5 && <DesignStep resume={resume} update={update} />}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-between">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-30">← Previous</button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="px-6 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition">
              Next: {STEPS[step + 1].label.split(' ')[0]} →
            </button>
          ) : (
            <button onClick={handlePrint} className="px-6 py-2.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition">Download PDF →</button>
          )}
        </div>
      </div>

      {/* RIGHT: LIVE PREVIEW */}
      <div className="flex-1 bg-gray-100 overflow-y-auto p-8">
        <div className="sticky top-0 mb-4 flex justify-end z-10">
          <span className="text-xs bg-white px-3 py-1.5 rounded-full text-gray-500 shadow-sm">Live Preview — A4</span>
        </div>
        <div ref={previewRef} className="w-[210mm] min-h-[297mm] mx-auto bg-white shadow-xl" style={{ fontFamily: resume.fontFamily }}>
          {resume.template === 'classic' && <ClassicTemplate resume={resume} />}
          {resume.template === 'modern' && <ModernTemplate resume={resume} />}
          {resume.template === 'bold' && <BoldTemplate resume={resume} />}
          {resume.template === 'elegant' && <ElegantTemplate resume={resume} />}
          {resume.template === 'minimal' && <MinimalTemplate resume={resume} />}
        </div>
        <div className="text-center text-xs text-gray-400 mt-4">Built with ResumeAfrica by Musa Mansaray</div>
      </div>
    </div>
  )
}

/* =================== RICH TEXT AREA =================== */

function RichTextArea({ value, onChange, placeholder, rows = 4 }) {
  const editorRef = useRef(null)
  const [fontSize, setFontSize] = useState(14)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [])

  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val)
    editorRef.current.focus()
    onChange(editorRef.current.innerHTML)
  }

  const handleInput = () => onChange(editorRef.current.innerHTML)

  const changeFontSize = (delta) => {
    const newSize = Math.min(24, Math.max(10, fontSize + delta))
    setFontSize(newSize)
    exec('fontSize', 4)
    const fontElements = editorRef.current.querySelectorAll('font[size="4"]')
    fontElements.forEach(el => {
      el.removeAttribute('size')
      el.style.fontSize = newSize + 'px'
    })
    onChange(editorRef.current.innerHTML)
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500">
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
        <ToolBtn onClick={() => exec('bold')} title="Bold"><b>B</b></ToolBtn>
        <ToolBtn onClick={() => exec('italic')} title="Italic"><i>I</i></ToolBtn>
        <ToolBtn onClick={() => exec('underline')} title="Underline"><u>U</u></ToolBtn>
        <div className="w-px h-5 bg-gray-300 mx-1"></div>
        <ToolBtn onClick={() => changeFontSize(-1)} title="Decrease font">A-</ToolBtn>
        <span className="text-xs text-gray-500 w-6 text-center">{fontSize}</span>
        <ToolBtn onClick={() => changeFontSize(1)} title="Increase font">A+</ToolBtn>
        <div className="w-px h-5 bg-gray-300 mx-1"></div>
        <ToolBtn onClick={() => exec('justifyLeft')} title="Align left">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" /></svg>
        </ToolBtn>
        <ToolBtn onClick={() => exec('justifyCenter')} title="Center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M5 18h14" /></svg>
        </ToolBtn>
        <ToolBtn onClick={() => exec('justifyRight')} title="Align right">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h14" /></svg>
        </ToolBtn>
        <div className="w-px h-5 bg-gray-300 mx-1"></div>
        <ToolBtn onClick={() => exec('insertUnorderedList')} title="Bullet list">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h.01M8 6h12M4 12h.01M8 12h12M4 18h.01M8 18h12" /></svg>
        </ToolBtn>
        <ToolBtn onClick={() => exec('insertOrderedList')} title="Numbered list">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20h14M7 12h14M7 4h14M3 20h.01M3 12h.01M3 4h.01" /></svg>
        </ToolBtn>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        className="px-4 py-3 text-sm min-h-[80px] focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
        style={{ minHeight: rows * 24 + 'px' }}
      />
    </div>
  )
}

function ToolBtn({ onClick, title, children }) {
  return (
    <button onClick={onClick} title={title} className="w-7 h-7 rounded flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition text-xs">
      {children}
    </button>
  )
}

/* =================== STEP COMPONENTS =================== */

function PersonalStep({ resume, update, handlePhoto }) {
  return (
    <>
      <div className="flex items-center gap-4 mb-2">
        <div className="relative">
          {resume.photo ? (
            <img src={resume.photo} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
          )}
          <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </label>
        </div>
        <div className="text-sm text-gray-500">
          <p className="font-medium text-gray-700">Profile Photo</p>
          <p>JPG or PNG, max 2MB</p>
          {resume.photo && <button onClick={() => update('photo', '')} className="text-red-400 hover:text-red-600 text-xs mt-1">Remove</button>}
        </div>
      </div>
      <Field label="Job Target" value={resume.jobTarget} onChange={v => update('jobTarget', v)} placeholder="e.g. Software Developer" hint="+10% more recruiter interest" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name" value={resume.firstName} onChange={v => update('firstName', v)} placeholder="Musa" />
        <Field label="Last Name" value={resume.lastName} onChange={v => update('lastName', v)} placeholder="Mansaray" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Email" value={resume.email} onChange={v => update('email', v)} placeholder="musa@email.com" type="email" />
        <Field label="Phone" value={resume.phone} onChange={v => update('phone', v)} placeholder="+90 555 000 0000" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Location / City" value={resume.location} onChange={v => update('location', v)} placeholder="Nicosia, Cyprus" />
        <Field label="Postal Code" value={resume.postalCode} onChange={v => update('postalCode', v)} placeholder="99010" />
      </div>
      <Field label="LinkedIn URL" value={resume.linkedin} onChange={v => update('linkedin', v)} placeholder="linkedin.com/in/yourprofile" />
      <Field label="Website / Portfolio" value={resume.website} onChange={v => update('website', v)} placeholder="yourwebsite.com" />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Professional Summary</label>
        <RichTextArea value={resume.summary} onChange={v => update('summary', v)} placeholder="Experienced developer with 5+ years..." rows={4} />
        <p className="text-xs text-gray-400 mt-1">Tip: Write 2-4 sentences highlighting your top achievements.</p>
      </div>
    </>
  )
}

function ExperienceStep({ resume, updateArray, addItem, removeItem }) {
  return (
    <>
      {resume.experience.map((exp, i) => (
        <div key={i} className="bg-gray-50 rounded-xl p-5 space-y-3 relative group">
          <button onClick={() => removeItem('experience', i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">{i + 1}</span>
            <span className="text-sm font-medium text-gray-700">{exp.title || 'New Position'}</span>
          </div>
          <Field label="Job Title" value={exp.title} onChange={v => updateArray('experience', i, 'title', v)} placeholder="Software Developer" />
          <Field label="Company" value={exp.company} onChange={v => updateArray('experience', i, 'company', v)} placeholder="Google" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date" value={exp.startDate} onChange={v => updateArray('experience', i, 'startDate', v)} placeholder="Jan 2022" />
            <Field label="End Date" value={exp.endDate} onChange={v => updateArray('experience', i, 'endDate', v)} placeholder="Present" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <RichTextArea value={exp.description} onChange={v => updateArray('experience', i, 'description', v)} placeholder="• Led a team of 5 developers&#10;• Built REST APIs serving 10k users" rows={4} />
          </div>
        </div>
      ))}
      <button onClick={() => addItem('experience', { title: '', company: '', startDate: '', endDate: '', description: '' })} className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-sm text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add Experience
      </button>
    </>
  )
}

function EducationStep({ resume, updateArray, addItem, removeItem }) {
  return (
    <>
      {resume.education.map((edu, i) => (
        <div key={i} className="bg-gray-50 rounded-xl p-5 space-y-3 relative group">
          <button onClick={() => removeItem('education', i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          <Field label="Degree / Qualification" value={edu.degree} onChange={v => updateArray('education', i, 'degree', v)} placeholder="BSc Computer Science" />
          <Field label="School / University" value={edu.school} onChange={v => updateArray('education', i, 'school', v)} placeholder="University of Lagos" />
          <Field label="Description (optional)" value={edu.description} onChange={v => updateArray('education', i, 'description', v)} placeholder="Dean's list, GPA 3.8" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Year" value={edu.startYear} onChange={v => updateArray('education', i, 'startYear', v)} placeholder="2018" />
            <Field label="End Year" value={edu.endYear} onChange={v => updateArray('education', i, 'endYear', v)} placeholder="2022" />
          </div>
        </div>
      ))}
      <button onClick={() => addItem('education', { degree: '', school: '', description: '', startYear: '', endYear: '' })} className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-sm text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add Education
      </button>
    </>
  )
}

function SkillsStep({ resume, update, removeItem }) {
  const [val, setVal] = useState('')
  const addSkill = () => { if (val.trim()) { update('skills', [...resume.skills, val.trim()]); setVal('') } }
  return (
    <>
      <div className="flex gap-2">
        <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} placeholder="Type a skill and press Enter..." className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <button onClick={addSkill} className="bg-emerald-600 text-white px-4 rounded-xl text-sm font-medium hover:bg-emerald-700 transition">Add</button>
      </div>
      <p className="text-xs text-gray-400">Suggested: JavaScript, React, Node.js, Python, SQL, Git, Leadership</p>
      <div className="flex flex-wrap gap-2 mt-2">
        {resume.skills.map((skill, i) => (
          <span key={i} className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium">
            {skill}
            <button onClick={() => removeItem('skills', i)} className="text-emerald-400 hover:text-red-500">×</button>
          </span>
        ))}
      </div>
      {resume.skills.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No skills added yet.</p>}
    </>
  )
}

function ExtrasStep({ resume, update, updateArray, addItem, removeItem }) {
  return (
    <>
      <h3 className="font-semibold text-gray-900 text-sm">Languages</h3>
      {resume.languages.map((lang, i) => (
        <div key={i} className="flex items-center gap-2">
          <input value={lang.name} onChange={e => updateArray('languages', i, 'name', e.target.value)} placeholder="Language" className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <select value={lang.level} onChange={e => updateArray('languages', i, 'level', e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option>Native</option><option>Fluent</option><option>Intermediate</option><option>Basic</option>
          </select>
          <button onClick={() => removeItem('languages', i)} className="text-red-400 hover:text-red-600 text-lg">×</button>
        </div>
      ))}
      <button onClick={() => addItem('languages', { name: '', level: 'Intermediate' })} className="text-sm text-emerald-600 hover:underline">+ Add Language</button>

      <h3 className="font-semibold text-gray-900 text-sm mt-6">Certifications</h3>
      {resume.certifications.map((cert, i) => (
        <div key={i} className="flex items-center gap-2">
          <input value={cert.name} onChange={e => updateArray('certifications', i, 'name', e.target.value)} placeholder="Certification name" className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input value={cert.year} onChange={e => updateArray('certifications', i, 'year', e.target.value)} placeholder="Year" className="w-20 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <button onClick={() => removeItem('certifications', i)} className="text-red-400 hover:text-red-600 text-lg">×</button>
        </div>
      ))}
      <button onClick={() => addItem('certifications', { name: '', year: '' })} className="text-sm text-emerald-600 hover:underline">+ Add Certification</button>

      <h3 className="font-semibold text-gray-900 text-sm mt-6">References</h3>
      {resume.references.map((ref, i) => (
        <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3 relative group">
          <button onClick={() => removeItem('references', i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition">×</button>
          <Field label="Name" value={ref.name} onChange={v => updateArray('references', i, 'name', v)} placeholder="Jane Smith" />
          <Field label="Position" value={ref.position} onChange={v => updateArray('references', i, 'position', v)} placeholder="Manager at Google" />
          <Field label="Contact" value={ref.contact} onChange={v => updateArray('references', i, 'contact', v)} placeholder="jane@google.com" />
        </div>
      ))}
      <button onClick={() => addItem('references', { name: '', position: '', contact: '' })} className="text-sm text-emerald-600 hover:underline">+ Add Reference</button>
    </>
  )
}

function DesignStep({ resume, update }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Template</label>
        <div className="grid grid-cols-3 gap-3">
          {TEMPLATES.map(t => (
            <button key={t} onClick={() => update('template', t)} className={`py-4 rounded-xl text-sm font-medium capitalize border-2 transition ${resume.template === t ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-emerald-300'}`}>{t}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Accent Color</label>
        <div className="flex gap-3 flex-wrap">
          {COLORS.map(c => (
            <button key={c} onClick={() => update('colorTheme', c)} className={`w-10 h-10 rounded-full border-2 transition ${resume.colorTheme === c ? 'border-gray-900 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Font Family</label>
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map(f => (
            <button key={f} onClick={() => update('fontFamily', f)} className={`py-3 rounded-xl text-sm border-2 transition ${resume.fontFamily === f ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-emerald-300'}`} style={{ fontFamily: f }}>{f}</button>
          ))}
        </div>
      </div>
    </>
  )
}

/* =================== SHARED =================== */

function Field({ label, value, onChange, placeholder, type = 'text', hint }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {hint && <span className="text-xs text-emerald-600 font-medium">{hint}</span>}
      </div>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
    </div>
  )
}

/* =================== TEMPLATES =================== */

function ClassicTemplate({ resume: r }) {
  const c = r.colorTheme
  const name = r.fullName || `${r.firstName} ${r.lastName}`.trim() || 'Your Name'
  return (
    <div className="p-10">
      <div className="flex items-start gap-5 mb-6">
        {r.photo && <img src={r.photo} alt="" className="w-20 h-20 rounded-full object-cover flex-shrink-0" />}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: c }}>{name}</h1>
          {r.jobTarget && <p className="text-gray-600 font-medium text-sm mt-0.5">{r.jobTarget}</p>}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
            {r.email && <span>{r.email}</span>}
            {r.phone && <span>• {r.phone}</span>}
            {r.location && <span>• {r.location}</span>}
            {r.postalCode && <span>{r.postalCode}</span>}
            {r.linkedin && <span>• {r.linkedin}</span>}
            {r.website && <span>• {r.website}</span>}
          </div>
        </div>
      </div>
      {r.summary && <Sec t="Summary" c={c}><div className="text-xs text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: r.summary }} /></Sec>}
      {r.experience?.length > 0 && <Sec t="Experience" c={c}>{r.experience.map((e,i) => <ExpBlock key={i} e={e} c={c} />)}</Sec>}
      {r.education?.length > 0 && <Sec t="Education" c={c}>{r.education.map((e,i) => <EduBlock key={i} e={e} />)}</Sec>}
      {r.skills?.length > 0 && <Sec t="Skills" c={c}><div className="flex flex-wrap gap-1.5">{r.skills.map((s,i) => <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: c+'15', color: c }}>{s}</span>)}</div></Sec>}
      {r.certifications?.length > 0 && <Sec t="Certifications" c={c}>{r.certifications.map((cert,i) => <p key={i} className="text-xs text-gray-700">{cert.name} {cert.year && `(${cert.year})`}</p>)}</Sec>}
      {r.languages?.length > 0 && <Sec t="Languages" c={c}><div className="flex gap-3">{r.languages.map((l,i) => <span key={i} className="text-xs text-gray-700">{l.name} — <span className="text-gray-400">{l.level}</span></span>)}</div></Sec>}
      {r.references?.length > 0 && <Sec t="References" c={c}><div className="grid grid-cols-2 gap-3">{r.references.map((ref,i) => <div key={i}><p className="font-semibold text-xs text-gray-900">{ref.name}</p><p className="text-xs text-gray-500">{ref.position}</p><p className="text-xs text-gray-400">{ref.contact}</p></div>)}</div></Sec>}
    </div>
  )
}

function ModernTemplate({ resume: r }) {
  const c = r.colorTheme
  const name = r.fullName || `${r.firstName} ${r.lastName}`.trim() || 'Your Name'
  return (
    <div className="flex min-h-[297mm]">
      <div className="w-[180px] p-5 text-white text-xs" style={{ backgroundColor: c }}>
        {r.photo && <img src={r.photo} alt="" className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-3 border-white/30" />}
        <SideSection title="Contact">
          {r.email && <p className="mb-1.5 break-all opacity-90">{r.email}</p>}
          {r.phone && <p className="mb-1.5 opacity-90">{r.phone}</p>}
          {r.location && <p className="mb-1.5 opacity-90">{r.location} {r.postalCode}</p>}
          {r.linkedin && <p className="mb-1.5 break-all opacity-90">{r.linkedin}</p>}
          {r.website && <p className="mb-1.5 break-all opacity-90">{r.website}</p>}
        </SideSection>
        {r.skills?.length > 0 && <SideSection title="Skills">{r.skills.map((s,i) => <p key={i} className="opacity-90 mb-1">{s}</p>)}</SideSection>}
        {r.languages?.length > 0 && <SideSection title="Languages">{r.languages.map((l,i) => <p key={i} className="opacity-90 mb-1">{l.name} — {l.level}</p>)}</SideSection>}
        {r.certifications?.length > 0 && <SideSection title="Certifications">{r.certifications.map((cert,i) => <p key={i} className="opacity-90 mb-1">{cert.name} {cert.year && `(${cert.year})`}</p>)}</SideSection>}
      </div>
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-0.5" style={{ color: c }}>{name}</h1>
        {r.jobTarget && <p className="text-gray-600 font-medium text-sm">{r.jobTarget}</p>}
        {r.summary && <div className="text-xs text-gray-600 leading-relaxed mt-3 mb-5" dangerouslySetInnerHTML={{ __html: r.summary }} />}
        {r.experience?.length > 0 && <Sec t="Experience" c={c}>{r.experience.map((e,i) => <ExpBlock key={i} e={e} c={c} />)}</Sec>}
        {r.education?.length > 0 && <Sec t="Education" c={c}>{r.education.map((e,i) => <EduBlock key={i} e={e} />)}</Sec>}
        {r.references?.length > 0 && <Sec t="References" c={c}><div className="grid grid-cols-2 gap-3">{r.references.map((ref,i) => <div key={i}><p className="font-semibold text-xs text-gray-900">{ref.name}</p><p className="text-xs text-gray-500">{ref.position}</p><p className="text-xs text-gray-400">{ref.contact}</p></div>)}</div></Sec>}
      </div>
    </div>
  )
}

function BoldTemplate({ resume: r }) {
  const c = r.colorTheme
  const name = r.fullName || `${r.firstName} ${r.lastName}`.trim() || 'Your Name'
  return (
    <div>
      <div className="p-8 text-white" style={{ backgroundColor: c }}>
        <div className="flex items-center gap-5">
          {r.photo && <img src={r.photo} alt="" className="w-20 h-20 rounded-2xl object-cover border-3 border-white/30 flex-shrink-0" />}
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            {r.jobTarget && <p className="opacity-80 mt-0.5">{r.jobTarget}</p>}
            <div className="flex flex-wrap gap-3 mt-2 text-xs opacity-80">
              {r.email && <span>{r.email}</span>}
              {r.phone && <span>{r.phone}</span>}
              {r.location && <span>{r.location}</span>}
            </div>
          </div>
        </div>
        {r.summary && <div className="text-xs mt-3 opacity-90 leading-relaxed" dangerouslySetInnerHTML={{ __html: r.summary }} />}
      </div>
      <div className="p-8">
        {r.experience?.length > 0 && <Sec t="Experience" c={c}>{r.experience.map((e,i) => <div key={i} className="mb-4 pl-3 border-l-2" style={{ borderColor: c }}><ExpBlock e={e} c={c} /></div>)}</Sec>}
        {r.education?.length > 0 && <Sec t="Education" c={c}>{r.education.map((e,i) => <div key={i} className="mb-3 pl-3 border-l-2" style={{ borderColor: c }}><EduBlock e={e} /></div>)}</Sec>}
        <div className="grid grid-cols-2 gap-6">
          {r.skills?.length > 0 && <Sec t="Skills" c={c}><div className="flex flex-wrap gap-1.5">{r.skills.map((s,i) => <span key={i} className="text-xs px-2 py-1 rounded text-white" style={{ backgroundColor: c }}>{s}</span>)}</div></Sec>}
          {r.languages?.length > 0 && <Sec t="Languages" c={c}>{r.languages.map((l,i) => <p key={i} className="text-xs text-gray-700 mb-1">{l.name} — {l.level}</p>)}</Sec>}
        </div>
        {r.certifications?.length > 0 && <Sec t="Certifications" c={c}>{r.certifications.map((cert,i) => <p key={i} className="text-xs text-gray-700">{cert.name} {cert.year && `(${cert.year})`}</p>)}</Sec>}
        {r.references?.length > 0 && <Sec t="References" c={c}><div className="grid grid-cols-2 gap-3">{r.references.map((ref,i) => <div key={i} className="p-2 rounded bg-gray-50"><p className="font-semibold text-xs text-gray-900">{ref.name}</p><p className="text-xs text-gray-500">{ref.position}</p><p className="text-xs text-gray-400">{ref.contact}</p></div>)}</div></Sec>}
      </div>
    </div>
  )
}

function ElegantTemplate({ resume: r }) {
  const c = r.colorTheme
  const name = r.fullName || `${r.firstName} ${r.lastName}`.trim() || 'Your Name'
  return (
    <div className="p-10">
      <div className="text-center border-b-2 pb-5 mb-5" style={{ borderColor: c }}>
        {r.photo && <img src={r.photo} alt="" className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-3" style={{ borderColor: c }} />}
        <h1 className="text-3xl font-light tracking-wide" style={{ color: c }}>{name}</h1>
        {r.jobTarget && <p className="text-gray-600 mt-1">{r.jobTarget}</p>}
        <div className="flex justify-center flex-wrap gap-3 mt-2 text-xs text-gray-500">
          {r.email && <span>{r.email}</span>}
          {r.phone && <span>• {r.phone}</span>}
          {r.location && <span>• {r.location}</span>}
          {r.linkedin && <span>• {r.linkedin}</span>}
        </div>
      </div>
      {r.summary && <Sec t="Profile" c={c}><div className="text-xs text-gray-700 leading-relaxed italic" dangerouslySetInnerHTML={{ __html: r.summary }} /></Sec>}
      {r.experience?.length > 0 && <Sec t="Experience" c={c}>{r.experience.map((e,i) => <ExpBlock key={i} e={e} c={c} />)}</Sec>}
      {r.education?.length > 0 && <Sec t="Education" c={c}>{r.education.map((e,i) => <EduBlock key={i} e={e} />)}</Sec>}
      {r.skills?.length > 0 && <Sec t="Skills" c={c}><div className="flex flex-wrap gap-1.5">{r.skills.map((s,i) => <span key={i} className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: c, color: c }}>{s}</span>)}</div></Sec>}
      {r.languages?.length > 0 && <Sec t="Languages" c={c}><div className="flex gap-3">{r.languages.map((l,i) => <span key={i} className="text-xs text-gray-700">{l.name} — {l.level}</span>)}</div></Sec>}
    </div>
  )
}

function MinimalTemplate({ resume: r }) {
  const c = r.colorTheme
  const name = r.fullName || `${r.firstName} ${r.lastName}`.trim() || 'Your Name'
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-0.5">{name}</h1>
      {r.jobTarget && <p className="text-sm text-gray-500 mb-2">{r.jobTarget}</p>}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-5 pb-5 border-b border-gray-200">
        {r.email && <span>{r.email}</span>}
        {r.phone && <span>• {r.phone}</span>}
        {r.location && <span>• {r.location}</span>}
        {r.linkedin && <span>• {r.linkedin}</span>}
        {r.website && <span>• {r.website}</span>}
      </div>
      {r.summary && <div className="text-xs text-gray-700 leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: r.summary }} />}
      {r.experience?.length > 0 && <Sec t="EXPERIENCE" c={c}>{r.experience.map((e,i) => <ExpBlock key={i} e={e} c={c} />)}</Sec>}
      {r.education?.length > 0 && <Sec t="EDUCATION" c={c}>{r.education.map((e,i) => <EduBlock key={i} e={e} />)}</Sec>}
      {r.skills?.length > 0 && <Sec t="SKILLS" c={c}><p className="text-xs text-gray-700">{r.skills.join(' • ')}</p></Sec>}
      {r.languages?.length > 0 && <Sec t="LANGUAGES" c={c}><p className="text-xs text-gray-700">{r.languages.map(l => `${l.name} (${l.level})`).join(' • ')}</p></Sec>}
      {r.certifications?.length > 0 && <Sec t="CERTIFICATIONS" c={c}>{r.certifications.map((cert,i) => <p key={i} className="text-xs text-gray-700">{cert.name} {cert.year && `— ${cert.year}`}</p>)}</Sec>}
    </div>
  )
}

/* =================== SHARED TEMPLATE HELPERS =================== */

function Sec({ t, c, children }) {
  return (
    <div className="mb-5">
      <h2 className="text-xs font-bold uppercase tracking-wider mb-2 pb-1.5 border-b-2" style={{ color: c, borderColor: c + '40' }}>{t}</h2>
      {children}
    </div>
  )
}

function SideSection({ title, children }) {
  return (
    <div className="mb-4">
      <h2 className="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">{title}</h2>
      {children}
    </div>
  )
}

function ExpBlock({ e, c }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900 text-xs">{e.title}</h3>
          <p className="text-xs" style={{ color: c }}>{e.company}</p>
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{e.startDate} — {e.endDate}</span>
      </div>
      {e.description && <div className="text-xs text-gray-600 mt-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: e.description }} />}
    </div>
  )
}

function EduBlock({ e }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-xs">{e.degree}</h3>
          <p className="text-xs text-gray-500">{e.school}</p>
        </div>
        <span className="text-xs text-gray-500 ml-2">{e.startYear} — {e.endYear}</span>
      </div>
      {e.description && <p className="text-xs text-gray-500 mt-0.5">{e.description}</p>}
    </div>
  )
}