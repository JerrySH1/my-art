import { ArrowLeft, Loader2, User } from 'lucide-react'
import useStore from '../store'

export default function UI() {
  const { data, view, goBack, activeProject } = useStore()

  if (!data) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
        <Loader2 className="animate-spin text-red-500" size={32} />
      </div>
    )
  }

  const { personalInfo } = data

  return (
    <div className="absolute inset-0 pointer-events-none z-10 font-mono overflow-hidden">
      {/* 个人简介 - 从 data.json 的 personalInfo 读取数据 */}
      <div className={`absolute top-12 bottom-12 left-12 p-10 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-3xl transition-all duration-1000 shadow-2xl w-[25vw] min-w-[360px] pointer-events-auto ${view === 'DETAIL' ? 'opacity-0 -translate-x-20 pointer-events-none' : 'opacity-100 translate-x-0'} z-50`}>
        <div className="flex flex-col h-full">
          {/* Avatar and Name */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500 to-purple-600 p-[2px] shadow-lg shadow-red-500/20 flex-shrink-0">
              <div className="w-full h-full rounded-[1.4rem] bg-black flex items-center justify-center overflow-hidden">
                {personalInfo.avatar ? (
                  <img src={personalInfo.avatar} alt={personalInfo.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-white/10" />
                )}
              </div>
            </div>
            <div className="flex-1 drop-shadow-md">
              <h1 className="text-[2rem] leading-none font-black text-white tracking-tighter uppercase">{personalInfo.name}</h1>
              <p className="text-xs text-red-400 font-bold tracking-[0.3em] mt-3 uppercase">{personalInfo.title}</p>
            </div>
          </div>

          {/* Bio Section */}
          <div className="space-y-4 border-l-2 border-red-500/50 pl-8 mt-12 flex-1 drop-shadow-md">
            <div className="space-y-1">
              <p className="text-xl text-white font-bold tracking-tight">{personalInfo.school}</p>
              <p className="text-base text-white/90 font-medium">{personalInfo.major}</p>
            </div>
            <p className="text-sm text-white/80 leading-relaxed italic pt-4 font-medium">
              {personalInfo.bio}
            </p>
          </div>

          {/* Bottom Footer */}
          <div className="flex gap-4 pt-8 mt-auto drop-shadow-md">
            <div className="h-[2px] w-12 bg-red-500/50 mt-2"></div>
            <div className="text-xs text-white/70 uppercase tracking-[0.2em] font-bold">{personalInfo.schoolEn}</div>
          </div>
        </div>
      </div>

      {/* 右侧详情 UI - 从 data.json 的 activeProject 读取数据 */}
      <div className={`absolute right-0 top-0 w-full md:w-1/2 h-full bg-black/40 backdrop-blur-3xl border-l border-white/5 p-12 md:p-24 transition-all duration-1000 transform pointer-events-auto overflow-y-auto ${view === 'DETAIL' ? 'translate-x-0' : 'translate-x-full'}`}>
        <button
          onClick={() => goBack()}
          className="flex items-center gap-4 text-cyan-400 hover:text-white transition-all mb-16 group"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-2 transition-transform" />
          <span className="uppercase tracking-[0.5em] text-[10px] font-bold italic">Back to Grid</span>
        </button>

        {activeProject && (
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-6xl font-black text-white tracking-tighter leading-[0.9] uppercase italic">{activeProject.title}</h2>
              <p className="text-red-500 text-[10px] font-bold tracking-[0.5em] uppercase">{activeProject.subtitle}</p>
            </div>
            
            <div className="w-16 h-[2px] bg-red-500"></div>

            <div className="grid grid-cols-2 gap-12 text-[10px] text-white/40 uppercase tracking-[0.3em] pb-8 border-b border-white/10">
              <div className="space-y-2">
                <p className="text-white/20">Creative Role</p>
                <p className="text-cyan-400 font-bold">{activeProject.role}</p>
              </div>
              <div className="space-y-2">
                <p className="text-white/20">Core Engine</p>
                <p className="text-pink-500 font-bold">{activeProject.techStack}</p>
              </div>
            </div>

            {/* 动态渲染内容块 (文本、图片、视频) */}
            <div className="space-y-12 pb-24">
              {activeProject.details?.map((detail, index) => {
                if (detail.type === 'text') {
                  return (
                    <p key={index} className="text-gray-300 leading-relaxed text-lg font-light opacity-90">
                      {detail.content}
                    </p>
                  )
                }
                if (detail.type === 'image') {
                  return (
                    <div key={index} className="space-y-3">
                      <img src={detail.url} alt={detail.caption || 'Project Image'} className="w-full rounded-xl shadow-2xl border border-white/10" />
                      {detail.caption && <p className="text-center text-xs text-white/30 italic">{detail.caption}</p>}
                    </div>
                  )
                }
                if (detail.type === 'video') {
                  return (
                    <div key={index} className="space-y-3">
                      <video src={detail.url} autoPlay loop muted playsInline controls className="w-full rounded-xl shadow-2xl border border-white/10" />
                      {detail.caption && <p className="text-center text-xs text-white/30 italic">{detail.caption}</p>}
                    </div>
                  )
                }
                return null
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
