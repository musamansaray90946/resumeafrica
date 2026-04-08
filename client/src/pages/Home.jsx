import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div>
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <span className="inline-block bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
            Build Professional CVs in Minutes
          </span>
          <h1 className="text-5xl font-bold mb-4 leading-tight tracking-tight">
            Create Your Perfect <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-white">CV / Resume</span>
          </h1>
          <p className="text-emerald-100 text-lg mb-10 max-w-xl mx-auto">
            Choose from beautiful templates, customize colors and fonts, add your photo, and download as PDF. Ready to print.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to={user ? '/dashboard' : '/register'} className="bg-white text-emerald-700 px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition shadow-lg">
              {user ? 'Go to Dashboard' : 'Get Started Free'}
            </Link>
            <a href="#templates" className="border border-white/30 text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition">
              View Templates
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Easy Editor</h3>
            <p className="text-gray-500 text-sm">Simple form-based editor. Fill in your details and watch your CV come to life in real-time.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Beautiful Templates</h3>
            <p className="text-gray-500 text-sm">Choose from multiple professional templates. Customize colors and fonts to match your style.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Download & Print</h3>
            <p className="text-gray-500 text-sm">Download your CV as a high-quality PDF. Ready to print or send to employers.</p>
          </div>
        </div>

        <div id="templates" className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Template</h2>
          <p className="text-gray-500">Professional designs that make a great impression</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Classic', 'Modern', 'Bold'].map((name, i) => (
            <div key={name} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer">
              <div className={`h-48 rounded-xl mb-4 ${i === 0 ? 'bg-gradient-to-b from-gray-100 to-gray-200' : i === 1 ? 'bg-gradient-to-b from-blue-50 to-blue-100' : 'bg-gradient-to-b from-emerald-50 to-emerald-100'}`}></div>
              <h3 className="font-semibold text-gray-900">{name}</h3>
              <p className="text-gray-500 text-sm mt-1">{i === 0 ? 'Clean and traditional layout' : i === 1 ? 'Contemporary two-column design' : 'Eye-catching with color accents'}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">© {new Date().getFullYear()} ResumeAfrica. Built by Musa Mansaray</p>
          <p className="text-xs text-gray-500">Made with React, Node.js, PostgreSQL & Prisma</p>
        </div>
      </footer>
    </div>
  )
}