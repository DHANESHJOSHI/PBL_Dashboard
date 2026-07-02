"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Search, X, Bell, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [collegeId, setCollegeId] = useState("")
  const [selectedCollegeName, setSelectedCollegeName] = useState("")
  const [colleges, setColleges] = useState([])
  const [notices, setNotices] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isCollegeDropdownOpen, setIsCollegeDropdownOpen] = useState(false)
  const [collegeSearch, setCollegeSearch] = useState("")
  const [activeNoticeIndex, setActiveNoticeIndex] = useState(0)
  const [noticeAnimating, setNoticeAnimating] = useState(false)
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCollegeDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    fetchColleges()
    fetchNotices()
  }, [])

  const fetchColleges = async () => {
    try {
      const response = await fetch("/api/colleges")
      const data = await response.json()

      if (data.success) {
        setColleges(data.data.colleges)
      }
    } catch (error) {
      console.error("Fetch colleges error:", error)
    }
  }

  const fetchNotices = async () => {
    try {
      const response = await fetch("/api/admin/notices")
      const data = await response.json()
      if (data.success) {
        setNotices(data.data.notices)
      }
    } catch (error) {
      console.error("Fetch notices error:", error)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch("/api/team/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, collegeId }),
      })

      const data = await response.json()

      if (data.success) {
        // Store team info and JWT token in localStorage
        localStorage.setItem("teamLoggedIn", "true")
        localStorage.setItem("teamToken", data.data.token)
        localStorage.setItem("teamData", JSON.stringify(data.data.team))
        router.push("/team")
      } else {
        if (data.data && data.data.errors) {
          // Handle validation errors
          const errorObj = {}
          data.data.errors.forEach(error => {
            if (error.includes('email')) {
              errorObj.email = error
            } else if (error.includes('College ID')) {
              errorObj.collegeId = error
            }
          })
          setErrors(errorObj)
        } else {
          setErrors({ general: data.message })
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setErrors({ general: "Login failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const renderFormattedContent = (content) => {
    if (!content) return null
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/• (.*?)(?=\n|$)/g, '<li>$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-amber-200 hover:text-white underline font-medium">$1</a>')
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc list-inside space-y-1 ml-4">$1</ul>')
    }
    return <div dangerouslySetInnerHTML={{ __html: formatted }} />
  }

  const getRelativeTime = (dateStr) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const goToNotice = useCallback((idx) => {
    if (noticeAnimating || notices.length === 0) return
    setNoticeAnimating(true)
    setTimeout(() => {
      setActiveNoticeIndex((idx + notices.length) % notices.length)
      setNoticeAnimating(false)
    }, 300)
  }, [noticeAnimating, notices.length])

  useEffect(() => {
    if (notices.length <= 1) return
    const timer = setInterval(() => goToNotice(activeNoticeIndex + 1), 5000)
    return () => clearInterval(timer)
  }, [notices.length, activeNoticeIndex, goToNotice])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-full"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-32 left-40 w-20 h-20 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 border-2 border-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white rounded-full"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 lg:mb-12">
          <div className="flex items-center mb-4 lg:mb-0">
             <Image
              src="/bharatcares_white.png"
              alt="BharatCares Logo"
              width={200}
              height={100}
              style={{ width: "auto", height: "auto", maxHeight: "60px" }}
              priority
            />
          </div>
           <Image
              src="/Gap@2x.png"
              alt="IBM Logo"
              width={150}
              height={100}
              style={{ width: "auto", height: "auto", maxHeight: "80px", minWidth: "80px" }}
              priority
            />
        </div>

        {/* Main Content */}
        <div className="text-center text-white mb-8 lg:mb-12">
          {/* <div className="text-base text-xl sm:text-3xl lg:text-2xl xl:text-4xl mb-2 italic font-light"></div> Welcome to */}
          <div className="text-xl sm:text-3xl lg:text-2xl xl:text-4xl font-bold leading-tight">
            IBM SkillsBuild Academic Internships 2026
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Notice Board */}
          <div className="lg:w-1/2 xl:w-2/5">
            <div className="relative h-80 lg:h-96" style={{ perspective: '1000px' }}>
              {/* Glass card container */}
              <div className="h-full rounded-3xl overflow-hidden" style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5" style={{
                  background: 'rgba(255,255,255,0.10)',
                  borderBottom: '1px solid rgba(255,255,255,0.15)'
                }}>
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ background: 'rgba(251,191,36,0.25)', border: '1px solid rgba(251,191,36,0.4)' }}>
                      <Bell className="h-4 w-4 text-amber-300" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm lg:text-base leading-tight">Notice Board</div>
                      {notices.length > 0 && (
                        <div className="text-white/50 text-[10px]">{notices.length} announcement{notices.length > 1 ? 's' : ''}</div>
                      )}
                    </div>
                  </div>
                  {notices.length > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => goToNotice(activeNoticeIndex - 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-white/50 text-xs font-mono">{activeNoticeIndex + 1}/{notices.length}</span>
                      <button
                        onClick={() => goToNotice(activeNoticeIndex + 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Notice Content Area */}
                <div className="relative flex-1 overflow-hidden" style={{ height: 'calc(100% - 56px)' }}>
                  {notices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/60 gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <Bell className="h-6 w-6 text-white/30" />
                      </div>
                      <div className="text-sm font-medium">No notices at the moment</div>
                      <div className="text-xs text-white/40">Check back soon for updates</div>
                    </div>
                  ) : (
                    <div
                      className="h-full overflow-y-auto px-5 py-4 transition-all duration-300"
                      style={{ opacity: noticeAnimating ? 0 : 1, transform: noticeAnimating ? 'translateY(8px)' : 'translateY(0)' }}
                    >
                      {/* Notice number badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold text-white" style={{ background: 'rgba(251,191,36,0.7)' }}>
                          {activeNoticeIndex + 1}
                        </div>
                        <div className="flex items-center gap-1.5 text-white/40 text-[10px]">
                          <Calendar className="h-3 w-3" />
                          {getRelativeTime(notices[activeNoticeIndex]?.createdAt)}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-white font-bold text-sm lg:text-base leading-snug mb-3" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                        {notices[activeNoticeIndex]?.title}
                      </h3>

                      {/* Divider */}
                      <div className="mb-3" style={{ height: '1px', background: 'linear-gradient(90deg, rgba(251,191,36,0.5), rgba(255,255,255,0.05))' }} />

                      {/* Content */}
                      <div className="text-white/80 text-xs lg:text-sm leading-relaxed notice-content">
                        {renderFormattedContent(notices[activeNoticeIndex]?.content)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dot indicators */}
              {notices.length > 1 && (
                <div className="absolute -bottom-5 left-0 right-0 flex justify-center gap-1.5">
                  {notices.slice(0, 8).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToNotice(i)}
                      className="transition-all duration-300 rounded-full"
                      style={{
                        width: i === activeNoticeIndex ? '20px' : '6px',
                        height: '6px',
                        background: i === activeNoticeIndex ? 'rgba(251,191,36,0.9)' : 'rgba(255,255,255,0.3)'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Login Form */}
          <div className="lg:w-1/2 xl:w-3/5">
            <div className="text-white text-center mb-6 lg:mb-8">
              <div className="text-lg lg:text-xl xl:text-2xl font-medium bold">
                LOGIN TO YOUR TEAM DASHBOARD
              </div>
            </div>

            {errors.general && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-400 text-white rounded-lg backdrop-blur-sm">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6 lg:space-y-8 max-w-lg mx-auto lg:max-w-none">
              <div>
                <label className="block text-white font-medium mb-3 text-left text-sm lg:text-base">
                  ENTER YOUR GMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl border-2 bg-transparent text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:bg-white/10 transition-all duration-200 text-sm lg:text-base ${
                    errors.email ? 'border-red-400' : 'border-white focus:border-blue-300'
                  }`}
                  placeholder="Enter Your Registered EMAIL ID"
                  required
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-300">{errors.email}</p>
                )}
                {/* <p className="mt-1 text-xs text-white/70">Only Gmail addresses are accepted</p> */}
              </div>

              <div>
                <label className="block text-white font-medium mb-3 text-left text-sm lg:text-base">
                  SELECT YOUR COLLEGE
                </label>
                <div className="relative" ref={dropdownRef}>
                  <div
                    onClick={() => {
                      const next = !isCollegeDropdownOpen;
                      setIsCollegeDropdownOpen(next);
                      if (next) setTimeout(() => searchInputRef.current?.focus(), 50);
                    }}
                    className={`w-full px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl border-2 bg-blue-700/50 backdrop-blur-sm text-white focus:outline-none focus:bg-blue-700/70 cursor-pointer transition-all duration-200 text-sm lg:text-base pr-12 flex items-center justify-between ${
                      errors.collegeId ? 'border-red-400' : 'border-white hover:border-blue-300'
                    }`}
                  >
                    <span className={`truncate ${!collegeId ? 'opacity-70' : ''}`}>
                      {collegeId
                        ? `${collegeId} - ${selectedCollegeName}`
                        : 'Select your college'}
                    </span>
                    <ChevronDown className={`h-5 w-5 lg:h-6 lg:w-6 text-white transition-transform ${isCollegeDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isCollegeDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-blue-800 border border-blue-400 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
                      <div className="p-3 border-b border-blue-600 flex items-center bg-blue-900/50">
                        <Search className="h-4 w-4 text-white/70 mr-2" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          className="w-full bg-transparent text-white placeholder-white/50 focus:outline-none text-sm"
                          placeholder="Search colleges..."
                          value={collegeSearch}
                          onChange={(e) => setCollegeSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {collegeSearch && (
                          <X
                            className="h-4 w-4 text-white/70 cursor-pointer hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              setCollegeSearch("")
                            }}
                          />
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {[...colleges]
                          .sort((a, b) => Number(a.collegeId) - Number(b.collegeId))
                          .filter((college) =>
                            `${college.collegeId} ${college.collegeName}`
                              .toLowerCase()
                              .includes(collegeSearch.toLowerCase())
                          )
                          .map((college) => (
                            <div
                              key={`${college.collegeId}-${college.collegeName}`}
                              className={`px-4 py-3 cursor-pointer text-sm text-white hover:bg-blue-600 transition-colors ${
                                college.collegeId === collegeId && college.collegeName === selectedCollegeName ? 'bg-blue-600 font-medium' : ''
                              }`}
                              onClick={() => {
                                setCollegeId(college.collegeId)
                                setSelectedCollegeName(college.collegeName)
                                setIsCollegeDropdownOpen(false)
                                setCollegeSearch("")
                                setErrors((prev) => ({ ...prev, collegeId: null }))
                              }}
                            >
                              {college.collegeId} - {college.collegeName}
                            </div>
                          ))}
                        {colleges.filter((college) =>
                          `${college.collegeId} ${college.collegeName}`
                            .toLowerCase()
                            .includes(collegeSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-3 text-sm text-white/70 text-center">
                            No colleges found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {errors.collegeId && (
                  <p className="mt-2 text-sm text-red-300">{errors.collegeId}</p>
                )}
              </div>

              <div className="text-center pt-4 lg:pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-white text-blue-800 font-bold px-8 lg:px-12 py-3 lg:py-4 rounded-xl lg:rounded-2xl hover:bg-blue-50 transition-all duration-200 text-base lg:text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800 mr-2"></div>
                      Logging in...
                    </div>
                  ) : (
                    "LOGIN"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}