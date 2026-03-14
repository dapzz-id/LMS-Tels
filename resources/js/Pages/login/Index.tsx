"use client"

import { useState, useEffect } from "react"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Sparkles, ArrowRight, AlertCircle, Info, HelpCircle, GraduationCap, Users } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip"
import { Head, Link } from "@inertiajs/react"
import axios from "axios"
import Swal from "sweetalert2"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  // Prevent hydration errors with useEffect
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Connect to the Laravel route
      const response = await axios.post("/login", {
        email,
        password,
      })

      if (response.data?.status === 'success') {
        // Show success message from backend
        Swal.fire({
          title: "Login Berhasil",
          text: response.data?.message || "Selamat datang kembali!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        })

        // Redirect to dashboard or handle the successful login
        
        setIsLoading(false)
        switch (response.data.data.tipe_user) {
          case 'admin':
            window.location.href = "/admin/"
            break
          case 'guru':
            window.location.href = "/teacher/"
            break
          case 'siswa':
            window.location.href = "/"
            break
          default:
            window.location.href = "/"
            break
        }
      } else {
        const message = response.data?.message || "Login gagal. Silakan coba lagi."
        setError(message)
        Swal.fire({
          title: "Login Gagal",
          text: message,
          icon: "error",
          confirmButtonColor: "#3b82f6",
        })
        setIsLoading(false)
      }
    } catch (err) {
      setIsLoading(false)

      if (axios.isAxiosError(err) && err.response && err.response.data) {
        // Handle validation errors
        if (err.response.status === 422 && err.response.data.errors) {
          // Laravel validation errors
          const validationErrors = Object.values(err.response.data.errors).flat().join("\n")
          Swal.fire({
            title: "Validation Error",
            text: validationErrors,
            icon: "error",
            confirmButtonColor: "#3b82f6",
          })
        } else if (err.response.status === 401) {
          // Authentication error
          const message = err.response.data.message || err.response.data.error || "Email atau password salah"
          setError(message)
          Swal.fire({
            title: "Login Gagal",
            text: message,
            icon: "error",
            confirmButtonColor: "#3b82f6",
          })
        } else {
          // Other errors
          setError("Terjadi kesalahan. Silakan coba lagi.")
          Swal.fire({
            title: "Error",
            text: "Terjadi kesalahan. Silakan coba lagi.",
            icon: "error",
            confirmButtonColor: "#3b82f6",
          })
        }
      } else {
        // Network or other errors
        setError("Terjadi kesalahan jaringan. Silakan coba lagi.")
        Swal.fire({
          title: "Network Error",
          text: "Terjadi kesalahan jaringan. Silakan coba lagi.",
          icon: "error",
          confirmButtonColor: "#3b82f6",
        })
      }
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex w-full min-h-screen">
      <Head title="Login" />
      {/* Left side - Decorative */}
      <div className="fixed top-0 bottom-0 left-0 hidden w-1/2 bg-blue-600 lg:block">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-600/90 to-blue-800/90"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-900 to-transparent"></div>
        <div className="absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 h-[500px] w-[500px] rounded-full bg-blue-700/30 blur-3xl"></div>

        {/* Content container with proper z-index */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center p-10 text-xl font-medium text-white">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="ml-3">LMS Tels</span>
          </div>

          {/* Illustration and features - centered in remaining space */}
          <div className="flex flex-col items-center justify-center flex-1 px-10 pb-10">
            <div className="relative h-[300px] w-[300px] overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 hover:scale-105">
              <img
                src="/logotelesandi.png"
                alt="School illustration"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20"></div>
            </div>

            {/* Features */}
            <div className="w-full max-w-md mt-12 space-y-6">
              <h3 className="text-2xl font-bold text-white">Welcome to Your Learning Portal</h3>
              <p className="text-lg text-blue-100">
                Access your courses, assignments, and school resources all in one place.
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center p-5 space-x-4 transition-all duration-300 group rounded-xl bg-white/10 hover:bg-white/15">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm">
                    <GraduationCap className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="text-white">
                    <p className="font-medium">Access all your courses</p>
                    <p className="text-blue-200">View lessons, assignments, and grades</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-blue-50/50 p-6 dark:bg-blue-950/10 lg:ml-[50%] lg:w-1/2 lg:p-12">
        {/* Mobile logo - only visible on small screens */}
        <div className="flex items-center justify-center mb-8 text-xl font-medium lg:hidden">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900/20">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <span className="ml-3">LMS Tels</span>
        </div>

        {/* Form container */}
        <div className="w-full max-w-[450px] space-y-8">
          <div className="p-8 transition-all duration-300 bg-white shadow-lg rounded-2xl hover:shadow-xl dark:bg-background/80 dark:backdrop-blur-sm">
            {/* Heading */}
            <div className="mb-8 space-y-3 text-center">
              <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
              <p className="text-muted-foreground">Enter your school credentials to access your account</p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email" className="text-base">
                      School Email
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 transition-colors text-muted-foreground hover:text-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Use your school-provided email address</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="email"
                    placeholder="student@school.edu"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`h-12 px-4 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${error ? "border-red-500 ring-2 ring-red-500/20" : ""}`}
                    required
                  />
                  {error && (
                    <div className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-base">
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoCapitalize="none"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 px-4 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="h-12 w-full bg-blue-600 text-base font-medium transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:translate-y-0.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 -ml-1 text-white animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Sign in
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                )}
              </Button>
            </form>
          </div>

          {/* Help section */}
          <div className="p-6 transition-all duration-300 border shadow-md rounded-xl bg-white/90 backdrop-blur-sm hover:shadow-lg dark:bg-white/5 dark:backdrop-blur-md">
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900/20">
                <HelpCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-medium">Need help?</h4>
                <p className="mt-2 text-muted-foreground">
                  If you're having trouble logging in, please contact your school's IT support at{" "}
                  <span className="font-medium text-foreground">telesandismk@gmail.com</span> or call{" "}
                  <span className="font-medium text-foreground">+62 813-2525-0554</span>.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.href = "/forgot-password"
                    }}
                    className="transition-all duration-200 h-9 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  >
                    Reset Password
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
