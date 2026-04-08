import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import API from '../config'
import axios from 'axios'

const TEMPLATES = ['classic', 'modern', 'bold']
const COLORS = ['#2563eb', '#059669', '#dc2626', '#7c3aed', '#ea580c', '#0891b2', '#4f46e5', '#be185d']
const FONTS = ['Inter', 'Georgia', 'Arial', 'Times New Roman', 'Courier New', 'Verdana']

export default function Editor() {
  const { id } = useParams()
  const { token } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const previewRef = useRef()
  const [resume, setResume] = useState(null)
  const [tab, setTab] = useState('personal')
  const [saving, setSaving] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    fetchResume()
  }, [id])

  const fetchResume = async () => {
    try {
      const res = await axios.get(`${API}/resumes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = res.data
      data.experience = typeof data.experience === 'string' ? JSON.parse(data.experience) : data.experience
      data.education = typeof data.education === 'string' ? JSON.parse(data.education) : data.education
      data.skills = typeof data.skills === 'string' ? JSON.parse(data.skills) : data.skills
      data.languages = typeof data.languages === 'string' ? JSON.parse(data.languages) : data.languages
      data.references = typeof data.references === 'string' ? JSON.parse(data.references) : data.references
      setResume(data)
    } catch {
      toast.error('Failed to load resume')
      navigate('/dashboard')
    }
  }

  const autoSave = (updated) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setSaving(true)
      try {
        await axios.put(`${API}/resumes/${id}`, updated, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch {}
      setSaving(false)
    }, 800)
  }

  const update = (field, value) => {
    const updated = { ...resume, [field]: value }
    setResume(updated)
    autoSave({ [field]: value })
  }

  const updateArray = (field, index, key, value) => {
    const arr = [...resume[field]]
    arr[index] = { ...arr[index], [key]: value }
    const updated = { ...resume, [field]: arr }
    setResume(updated)
    autoSave({ [field]: arr })
  }

  const addItem = (field, template) => {
    const arr = [...resume[field], template]
    update(field, arr)
  }

  const removeItem = (field, index) => {
    const arr = resume[field].filter((_, i) => i !== index)
    update(field, arr)
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update('photo', reader.result)
    reader.readAsDataURL(file)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html><head><title>${resume.title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ${resume.fontFamily}, sans-serif; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
      </head><body>${previewRef.current.innerHTML}</body></html>
    `)
    printWindow.document.close()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 500)
  }

  if (!resume) return <div className="text-center py-20 text-gray-400">Loading...</div>

  const tabs = [
    { id: 'personal', label: 'Personal' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'extras', label: 'Extras' },
    { id: 'design', label: 'Design' },
  ]

  return (
    <div className="flex h-[calc(100vh-65px)]">
      {/* LEFT: FORM */}
      <div className="w-[480px] border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <input
            type="text"
            value={resume.title}
            onChange={e => update('title', e.target.value)}
            className="text-lg font-bold text-gray-900 border-none focus:outline-none bg-transparent"
          />
          <div className="flex items-center gap-2">
            {saving && <span className="text-xs text-gray-400">Saving...</span>}
            <button onClick={handlePrint} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              PDF
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-gray-100 px-4 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${tab === t.id ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {/* PERSONAL */}
          {tab === 'personal' && (
            <>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  {resume.photo ? (
                    <img src={resume.photo} alt="Photo" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
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
                {resume.photo && (
                  <button onClick={() => update('photo', '')} className="text-xs text-red-400 hover:text-red-600">Remove photo</button>
                )}
              </div>
              <Field label="Full Name" value={resume.fullName} onChange={v => update('fullName', v)} placeholder="John Doe" />
              <Field label="Email" value={resume.email} onChange={v => update('email', v)} placeholder="john@example.com" type="email" />
              <Field label="Phone" value={resume.phone} onChange={v => update('phone', v)} placeholder="+234 800 000 0000" />
              <Field label="Location" value={resume.location} onChange={v => update('location', v)} placeholder="Lagos, Nigeria" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Professional Summary</label>
                <textarea
                  value={resume.summary}
                  onChange={e => update('summary', e.target.value)}
                  placeholder="A brief summary of your professional background..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-28"
                />
              </div>
            </>
          )}

          {/* EXPERIENCE */}
          {tab === 'experience' && (
            <>
              {resume.experience.map((exp, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3 relative">
                  <button onClick={() => removeItem('experience', i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <Field label="Job Title" value={exp.title} onChange={v => updateArray('experience', i, 'title', v)} placeholder="Software Developer" />
                  <Field label="Company" value={exp.company} onChange={v => updateArray('experience', i, 'company', v)} placeholder="Tech Corp" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start Date" value={exp.startDate} onChange={v => updateArray('experience', i, 'startDate', v)} placeholder="Jan 2022" />
                    <Field label="End Date" value={exp.endDate} onChange={v => updateArray('experience', i, 'endDate', v)} placeholder="Present" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={e => updateArray('experience', i, 'description', e.target.value)}
                      placeholder="Describe your responsibilities and achievements..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-20"
                    />
                  </div>
                </div>
              ))}
              <button onClick={() => addItem('experience', { title: '', company: '', startDate: '', endDate: '', description: '' })} className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition">
                + Add Experience
              </button>
            </>
          )}

          {/* EDUCATION */}
          {tab === 'education' && (
            <>
              {resume.education.map((edu, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3 relative">
                  <button onClick={() => removeItem('education', i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <Field label="Degree" value={edu.degree} onChange={v => updateArray('education', i, 'degree', v)} placeholder="BSc Computer Science" />
                  <Field label="School" value={edu.school} onChange={v => updateArray('education', i, 'school', v)} placeholder="University of Lagos" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start Year" value={edu.startYear} onChange={v => updateArray('education', i, 'startYear', v)} placeholder="2018" />
                    <Field label="End Year" value={edu.endYear} onChange={v => updateArray('education', i, 'endYear', v)} placeholder="2022" />
                  </div>
                </div>
              ))}
              <button onClick={() => addItem('education', { degree: '', school: '', startYear: '', endYear: '' })} className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition">
                + Add Education
              </button>
            </>
          )}

          {/* SKILLS */}
          {tab === 'skills' && (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {resume.skills.map((skill, i) => (
                  <span key={i} className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm">
                    {skill}
                    <button onClick={() => removeItem('skills', i)} className="text-emerald-400 hover:text-red-500 ml-1">×</button>
                  </span>
                ))}
              </div>
              <SkillAdder onAdd={(skill) => update('skills', [...resume.skills, skill])} placeholder="Type a skill and press Enter..." />
            </>
          )}

          {/* EXTRAS */}
          {tab === 'extras' && (
            <>
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Languages</h3>
              {resume.languages.map((lang, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input
                    value={lang.name}
                    onChange={e => updateArray('languages', i, 'name', e.target.value)}
                    placeholder="Language"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <select
                    value={lang.level}
                    onChange={e => updateArray('languages', i, 'level', e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>Native</option>
                    <option>Fluent</option>
                    <option>Intermediate</option>
                    <option>Basic</option>
                  </select>
                  <button onClick={() => removeItem('languages', i)} className="text-red-400 hover:text-red-600">×</button>
                </div>
              ))}
              <button onClick={() => addItem('languages', { name: '', level: 'Intermediate' })} className="text-sm text-emerald-600 hover:underline mb-6">+ Add Language</button>

              <h3 className="font-semibold text-gray-900 text-sm mb-3 mt-6">References</h3>
              {resume.references.map((ref, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3 relative mb-3">
                  <button onClick={() => removeItem('references', i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600">×</button>
                  <Field label="Name" value={ref.name} onChange={v => updateArray('references', i, 'name', v)} placeholder="Jane Smith" />
                  <Field label="Position" value={ref.position} onChange={v => updateArray('references', i, 'position', v)} placeholder="Manager at Tech Corp" />
                  <Field label="Contact" value={ref.contact} onChange={v => updateArray('references', i, 'contact', v)} placeholder="jane@example.com" />
                </div>
              ))}
              <button onClick={() => addItem('references', { name: '', position: '', contact: '' })} className="text-sm text-emerald-600 hover:underline">+ Add Reference</button>
            </>
          )}

          {/* DESIGN */}
          {tab === 'design' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Template</label>
                <div className="grid grid-cols-3 gap-3">
                  {TEMPLATES.map(t => (
                    <button key={t} onClick={() => update('template', t)} className={`py-3 rounded-xl text-sm font-medium capitalize border-2 transition ${resume.template === t ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-emerald-300'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Color Theme</label>
                <div className="flex gap-3 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => update('colorTheme', c)} className={`w-10 h-10 rounded-full border-2 transition ${resume.colorTheme === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Font</label>
                <div className="grid grid-cols-2 gap-2">
                  {FONTS.map(f => (
                    <button key={f} onClick={() => update('fontFamily', f)} className={`py-2.5 rounded-xl text-sm border-2 transition ${resume.fontFamily === f ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-emerald-300'}`} style={{ fontFamily: f }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT: LIVE PREVIEW */}
      <div className="flex-1 bg-gray-100 overflow-y-auto p-8">
        <div ref={previewRef} className="max-w-[210mm] mx-auto bg-white shadow-xl" style={{ fontFamily: resume.fontFamily }}>
          {resume.template === 'classic' && <ClassicTemplate resume={resume} />}
          {resume.template === 'modern' && <ModernTemplate resume={resume} />}
          {resume.template === 'bold' && <BoldTemplate resume={resume} />}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
    </div>
  )
}

function SkillAdder({ onAdd, placeholder }) {
  const [val, setVal] = useState('')
  const handleKey = (e) => {
    if (e.key === 'Enter' && val.trim()) {
      onAdd(val.trim())
      setVal('')
    }
  }
  return <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={handleKey} placeholder={placeholder} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
}

/* =================== TEMPLATES =================== */

function ClassicTemplate({ resume }) {
  const c = resume.colorTheme
  const exp = resume.experience || []
  const edu = resume.education || []
  const skills = resume.skills || []
  const langs = resume.languages || []
  const refs = resume.references || []

  return (
    <div className="p-10">
      <div className="flex items-start gap-6 mb-8">
        {resume.photo && <img src={resume.photo} alt="" className="w-24 h-24 rounded-full object-cover" />}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: c }}>{resume.fullName || 'Your Name'}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
            {resume.email && <span>{resume.email}</span>}
            {resume.phone && <span>{resume.phone}</span>}
            {resume.location && <span>{resume.location}</span>}
          </div>
        </div>
      </div>

      {resume.summary && (
        <Section title="Professional Summary" color={c}>
          <p className="text-sm text-gray-700 leading-relaxed">{resume.summary}</p>
        </Section>
      )}

      {exp.length > 0 && (
        <Section title="Work Experience" color={c}>
          {exp.map((e, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{e.title}</h3>
                  <p className="text-sm text-gray-600">{e.company}</p>
                </div>
                <span className="text-xs text-gray-500">{e.startDate} — {e.endDate}</span>
              </div>
              {e.description && <p className="text-sm text-gray-600 mt-1">{e.description}</p>}
            </div>
          ))}
        </Section>
      )}

      {edu.length > 0 && (
        <Section title="Education" color={c}>
          {edu.map((e, i) => (
            <div key={i} className="mb-3 last:mb-0 flex justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{e.degree}</h3>
                <p className="text-sm text-gray-600">{e.school}</p>
              </div>
              <span className="text-xs text-gray-500">{e.startYear} — {e.endYear}</span>
            </div>
          ))}
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Skills" color={c}>
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <span key={i} className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: c + '15', color: c }}>{s}</span>
            ))}
          </div>
        </Section>
      )}

      {langs.length > 0 && (
        <Section title="Languages" color={c}>
          <div className="flex flex-wrap gap-4">
            {langs.map((l, i) => (
              <span key={i} className="text-sm text-gray-700">{l.name} <span className="text-gray-400">— {l.level}</span></span>
            ))}
          </div>
        </Section>
      )}

      {refs.length > 0 && (
        <Section title="References" color={c}>
          <div className="grid grid-cols-2 gap-4">
            {refs.map((r, i) => (
              <div key={i}>
                <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                <p className="text-xs text-gray-600">{r.position}</p>
                <p className="text-xs text-gray-500">{r.contact}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

function ModernTemplate({ resume }) {
  const c = resume.colorTheme
  const exp = resume.experience || []
  const edu = resume.education || []
  const skills = resume.skills || []
  const langs = resume.languages || []
  const refs = resume.references || []

  return (
    <div className="flex min-h-[297mm]">
      {/* SIDEBAR */}
      <div className="w-[200px] p-6 text-white" style={{ backgroundColor: c }}>
        {resume.photo && <img src={resume.photo} alt="" className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-white/30" />}
        <h2 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-70">Contact</h2>
        {resume.email && <p className="text-xs mb-2 break-all opacity-90">{resume.email}</p>}
        {resume.phone && <p className="text-xs mb-2 opacity-90">{resume.phone}</p>}
        {resume.location && <p className="text-xs mb-4 opacity-90">{resume.location}</p>}

        {skills.length > 0 && (
          <>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3 mt-6 opacity-70">Skills</h2>
            <div className="space-y-1.5">
              {skills.map((s, i) => (
                <p key={i} className="text-xs opacity-90">{s}</p>
              ))}
            </div>
          </>
        )}

        {langs.length > 0 && (
          <>
            <h2 className="text-xs font-bold uppercase tracking-wider mb-3 mt-6 opacity-70">Languages</h2>
            {langs.map((l, i) => (
              <p key={i} className="text-xs opacity-90 mb-1">{l.name} — {l.level}</p>
            ))}
          </>
        )}
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: c }}>{resume.fullName || 'Your Name'}</h1>
        {resume.summary && <p className="text-sm text-gray-600 leading-relaxed mt-3 mb-6">{resume.summary}</p>}

        {exp.length > 0 && (
          <Section title="Experience" color={c}>
            {exp.map((e, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm">{e.title}</h3>
                  <span className="text-xs text-gray-500">{e.startDate} — {e.endDate}</span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{e.company}</p>
                {e.description && <p className="text-xs text-gray-600">{e.description}</p>}
              </div>
            ))}
          </Section>
        )}

        {edu.length > 0 && (
          <Section title="Education" color={c}>
            {edu.map((e, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm">{e.degree}</h3>
                  <span className="text-xs text-gray-500">{e.startYear} — {e.endYear}</span>
                </div>
                <p className="text-xs text-gray-500">{e.school}</p>
              </div>
            ))}
          </Section>
        )}

        {refs.length > 0 && (
          <Section title="References" color={c}>
            <div className="grid grid-cols-2 gap-3">
              {refs.map((r, i) => (
                <div key={i}>
                  <p className="font-semibold text-gray-900 text-xs">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.position}</p>
                  <p className="text-xs text-gray-400">{r.contact}</p>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

function BoldTemplate({ resume }) {
  const c = resume.colorTheme
  const exp = resume.experience || []
  const edu = resume.education || []
  const skills = resume.skills || []
  const langs = resume.languages || []
  const refs = resume.references || []

  return (
    <div>
      {/* HEADER */}
      <div className="p-10 text-white" style={{ backgroundColor: c }}>
        <div className="flex items-center gap-6">
          {resume.photo && <img src={resume.photo} alt="" className="w-24 h-24 rounded-2xl object-cover border-4 border-white/30" />}
          <div>
            <h1 className="text-3xl font-bold">{resume.fullName || 'Your Name'}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm opacity-80">
              {resume.email && <span>{resume.email}</span>}
              {resume.phone && <span>{resume.phone}</span>}
              {resume.location && <span>{resume.location}</span>}
            </div>
          </div>
        </div>
        {resume.summary && <p className="text-sm mt-4 opacity-90 leading-relaxed">{resume.summary}</p>}
      </div>

      <div className="p-10">
        {exp.length > 0 && (
          <Section title="Work Experience" color={c}>
            {exp.map((e, i) => (
              <div key={i} className="mb-5 last:mb-0 pl-4 border-l-2" style={{ borderColor: c }}>
                <div className="flex justify-between">
                  <h3 className="font-bold text-gray-900">{e.title}</h3>
                  <span className="text-xs text-gray-500 font-medium">{e.startDate} — {e.endDate}</span>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: c }}>{e.company}</p>
                {e.description && <p className="text-sm text-gray-600">{e.description}</p>}
              </div>
            ))}
          </Section>
        )}

        {edu.length > 0 && (
          <Section title="Education" color={c}>
            {edu.map((e, i) => (
              <div key={i} className="mb-3 last:mb-0 pl-4 border-l-2" style={{ borderColor: c }}>
                <h3 className="font-bold text-gray-900">{e.degree}</h3>
                <p className="text-sm text-gray-600">{e.school} · {e.startYear} — {e.endYear}</p>
              </div>
            ))}
          </Section>
        )}

        <div className="grid grid-cols-2 gap-8">
          {skills.length > 0 && (
            <Section title="Skills" color={c}>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span key={i} className="text-sm px-3 py-1.5 rounded-lg font-medium text-white" style={{ backgroundColor: c }}>{s}</span>
                ))}
              </div>
            </Section>
          )}

          {langs.length > 0 && (
            <Section title="Languages" color={c}>
              {langs.map((l, i) => (
                <p key={i} className="text-sm text-gray-700 mb-1">{l.name} — <span className="text-gray-500">{l.level}</span></p>
              ))}
            </Section>
          )}
        </div>

        {refs.length > 0 && (
          <Section title="References" color={c}>
            <div className="grid grid-cols-2 gap-4">
              {refs.map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-gray-50">
                  <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                  <p className="text-xs text-gray-600">{r.position}</p>
                  <p className="text-xs text-gray-500">{r.contact}</p>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, color, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold uppercase tracking-wider mb-3 pb-2 border-b-2" style={{ color, borderColor: color + '40' }}>{title}</h2>
      {children}
    </div>
  )
}