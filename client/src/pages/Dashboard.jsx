import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNavigate, Link } from 'react-router-dom'
import API from '../config'
import axios from 'axios'

export default function Dashboard() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return navigate('/login')
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    const res = await axios.get(`${API}/resumes`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setResumes(res.data)
    setLoading(false)
  }

  const createResume = async () => {
    const res = await axios.post(`${API}/resumes`, { title: 'My New Resume' }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.success('Resume created!')
    navigate(`/editor/${res.data.id}`)
  }

  const deleteResume = async (id) => {
    if (!confirm('Delete this resume?')) return
    await axios.delete(`${API}/resumes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.success('Resume deleted')
    fetchResumes()
  }

  const duplicateResume = async (id) => {
    await axios.post(`${API}/resumes/${id}/duplicate`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.success('Resume duplicated!')
    fetchResumes()
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
          <p className="text-gray-500 text-sm">{resumes.length} resume{resumes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={createResume} className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-emerald-700 transition flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Resume
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <p className="text-gray-400 text-lg mb-2">No resumes yet</p>
          <p className="text-gray-300 text-sm mb-6">Create your first professional CV</p>
          <button onClick={createResume} className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-emerald-700 transition">Create Resume</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map(resume => (
            <div key={resume.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-emerald-200 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: resume.colorTheme + '20', color: resume.colorTheme }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{resume.title}</h3>
                  <p className="text-gray-400 text-xs">Updated {new Date(resume.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-4">{resume.fullName || 'No name set'} · {resume.template} template</p>
              <div className="flex items-center gap-2">
                <Link to={`/editor/${resume.id}`} className="flex-1 text-center bg-emerald-50 text-emerald-700 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100 transition">Edit</Link>
                <button onClick={() => duplicateResume(resume.id)} className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition">Copy</button>
                <button onClick={() => deleteResume(resume.id)} className="px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-50 transition">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}