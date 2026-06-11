"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Search, X } from "lucide-react"
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
    
    // Convert markdown-style formatting to HTML
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/• (.*?)(?=\n|$)/g, '<li>$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-200 hover:text-white underline">$1</a>')
    
    // Wrap list items in ul tags
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc list-inside space-y-1 ml-4">$1</ul>')
    }
    
    return <div dangerouslySetInnerHTML={{ __html: formatted }} />
  }

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
              src="/CSR_white.png"
              alt="CSR IBM Logo"
              width={200} // add your desired width
              height={100} // add your desired height
            />
          </div>
           <Image
              src="/CSR_IBM_logo_PNG-04.png"
              alt="CSR IBM Logo"
              width={200} // add your desired width
              height={100} // add your desired height
            />
        </div>

        {/* Main Content */}
        <div className="text-center text-white mb-8 lg:mb-12">
          {/* <div className="text-base text-xl sm:text-3xl lg:text-2xl xl:text-4xl mb-2 italic font-light"></div> Welcome to */}
          <div className="text-xl sm:text-3xl lg:text-2xl xl:text-4xl font-bold leading-tight">
            IBM Skillsbuild Project Based Learning Program 2025
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Notice Board */}
          <div className="lg:w-1/2 xl:w-2/5">
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white rounded-3xl p-4 lg:p-6 h-80 lg:h-96">
              <div className="bg-white text-blue-800 font-bold text-base lg:text-lg px-4 lg:px-6 py-2 lg:py-3 rounded-xl inline-block mb-4 lg:mb-6">
                Notice Board
              </div>
              <div className="text-white space-y-3 lg:space-y-4 max-h-52 lg:max-h-64 overflow-y-auto">
                {notices.length > 0 ? (
                  notices.slice(0, 5).map((notice) => (
                    <div key={notice._id} className="text-sm lg:text-base opacity-90 border-b border-white/20 pb-3 last:border-b-0">
                      <div className="font-semibold mb-1">{notice.title}</div>
                      <div className="text-xs lg:text-sm opacity-75 leading-relaxed">
                        {renderFormattedContent(notice.content)}
                      </div>
                      <div className="text-xs opacity-60 mt-2">
                        {new Date(notice.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center opacity-75 py-8">
                    <div className="text-sm lg:text-base">No notices available at the moment</div>
                  </div>
                )}
              </div>
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
                  placeholder="Enter Your Registered GMAIL ID"
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