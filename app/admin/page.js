"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (data.success) {
        // Store admin info and JWT token in localStorage
        localStorage.setItem("adminLoggedIn", "true")
        localStorage.setItem("adminToken", data.data.token)
        localStorage.setItem("adminData", JSON.stringify(data.data.admin))
        router.push("/admin/dashboard")
      } else {
        if (data.data && data.data.errors) {
          // Handle validation errors
          const errorObj = {}
          data.data.errors.forEach(error => {
            if (error.includes('email')) {
              errorObj.email = error
            } else if (error.includes('password')) {
              errorObj.password = error
            }
          })
          setErrors(errorObj)
        } else {
          setErrors({ general: data.message })
        }
      }
    } catch (error) {
      console.error("Admin login error:", error)
      setErrors({ general: "Login failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white p-4 rounded-lg mb-4">
            <h1 className="text-xl font-bold">IBM SkillsBuild</h1>
            <p className="text-blue-100 text-sm">Admin Portal</p>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Administrator Login</h2>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder=""
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
              required
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <strong>Demo Credentials:</strong>
            <br />
            Email: admin@gmail.com
            <br />
            Password: admin123
          </p>
          <p className="text-xs text-gray-500 text-center mt-2">
          </p>
        </div> */}

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Need to create the admin account?{" "}
            <button
              onClick={async () => {
                try {
                  const response = await fetch("/api/admin/seed", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                  })
                  const data = await response.json()
                  alert(data.message)
                } catch (error) {
                  alert("Failed to create admin account")
                }
              }}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Click here to seed admin
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}