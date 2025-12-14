import { Button } from "@/Components/ui/button"
import { Head, Link } from "@inertiajs/react"
import { BookOpen, BarChart3, Users, ArrowRight, Sparkles, GraduationCap, Calendar, FileText } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Head title="Belajar & Tugas Jadi Lebih Praktis" />
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center h-16 space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative w-8 h-8 overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-blue-400">
                <Sparkles className="absolute inset-0 w-5 h-5 m-auto text-white" />
              </div>
              <span className="inline-block font-bold">LMS Tels</span>
            </Link>
            <nav className="hidden gap-6 md:flex">
              <Link
                href="#features"
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                How It Works
              </Link>
              <Link
                href="#about"
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                About
              </Link>
              <Link
                href="#contact"
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Contact
              </Link>
            </nav>
          </div>
          <div className="flex items-center justify-end flex-1 space-x-4">
            <nav className="flex items-center space-x-2">
              <Link href="/login" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-blue-700 h-9">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-blue-50 via-white to-white dark:from-blue-950/30 dark:via-background dark:to-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Your School's Learning Platform
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    LMS Tels connects students, teachers, and parents in one intuitive platform designed for modern
                    education.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/login" className="flex flex-row items-center">
                      Login to Platform
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline">Contact Admin</Button>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl border bg-gradient-to-br from-blue-100 to-blue-50 p-2 dark:from-blue-900/20 dark:to-blue-900/10">
                  <div className="absolute inset-0 bg-grid-black/5 [mask-image:linear-gradient(to_bottom,white,transparent)] dark:bg-grid-white/5"></div>
                  <img
                    src="/placeholder.svg?height=600&width=800"
                    alt="LMS Tels Dashboard"
                    className="object-cover w-full h-full mx-auto rounded-lg shadow-lg"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-100 to-transparent dark:from-background"></div>
                </div>
                <div className="absolute w-64 h-64 rounded-full -bottom-6 -right-6 bg-blue-600/20 blur-3xl"></div>
                <div className="absolute w-64 h-64 rounded-full -left-6 -top-6 bg-blue-400/20 blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 bg-white md:py-24 lg:py-32 dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 text-sm bg-blue-100 rounded-lg dark:bg-blue-900/30">
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Tools for Modern Education</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  LMS Tels provides everything your school needs to create an engaging learning environment.
                </p>
              </div>
            </div>
            <div className="grid items-center max-w-5xl gap-6 py-12 mx-auto lg:grid-cols-2 lg:gap-10">
              <div className="grid gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Interactive Lessons</h3>
                    <p className="text-muted-foreground">
                      Engage students with multimedia content, interactive assignments, and collaborative activities.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Progress Tracking</h3>
                    <p className="text-muted-foreground">
                      Monitor student achievement with detailed analytics and customizable grade reports.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Assignment Calendar</h3>
                    <p className="text-muted-foreground">
                      Keep track of due dates, exams, and school events in one centralized calendar.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Classroom Collaboration</h3>
                    <p className="text-muted-foreground">
                      Foster teamwork with discussion forums, group projects, and peer feedback tools.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Digital Assignments</h3>
                    <p className="text-muted-foreground">
                      Create, distribute, and grade assignments digitally with automatic feedback.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Academic Planning</h3>
                    <p className="text-muted-foreground">
                      Help students plan their academic journey with course selection and graduation tracking.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-blue-50 dark:bg-blue-950/10">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 text-sm bg-blue-100 rounded-lg dark:bg-blue-900/30">
                  How It Works
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple for Everyone</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform is designed to be intuitive for students, teachers, and parents.
                </p>
              </div>
            </div>
            <div className="grid max-w-5xl gap-6 py-12 mx-auto lg:grid-cols-3">
              <div className="relative flex flex-col items-center p-6 space-y-4 bg-white border rounded-lg shadow-sm dark:bg-background">
                <div className="flex items-center justify-center w-12 h-12 text-blue-900 bg-blue-100 rounded-full dark:bg-blue-900/20 dark:text-blue-50">
                  1
                </div>
                <h3 className="text-xl font-bold">For Teachers</h3>
                <p className="text-center text-muted-foreground">
                  Create and manage courses, assignments, and assessments with our intuitive tools.
                </p>
              </div>
              <div className="relative flex flex-col items-center p-6 space-y-4 bg-white border rounded-lg shadow-sm dark:bg-background">
                <div className="flex items-center justify-center w-12 h-12 text-blue-900 bg-blue-100 rounded-full dark:bg-blue-900/20 dark:text-blue-50">
                  2
                </div>
                <h3 className="text-xl font-bold">For Students</h3>
                <p className="text-center text-muted-foreground">
                  Access course materials, submit assignments, and track your progress all in one place.
                </p>
              </div>
              <div className="relative flex flex-col items-center p-6 space-y-4 bg-white border rounded-lg shadow-sm dark:bg-background">
                <div className="flex items-center justify-center w-12 h-12 text-blue-900 bg-blue-100 rounded-full dark:bg-blue-900/20 dark:text-blue-50">
                  3
                </div>
                <h3 className="text-xl font-bold">For Parents</h3>
                <p className="text-center text-muted-foreground">
                  Stay informed about your child's academic progress, assignments, and school announcements.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="w-full py-12 bg-white md:py-24 lg:py-32 dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 text-sm bg-blue-100 rounded-lg dark:bg-blue-900/30">About</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Our School's Digital Learning Initiative
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  LMS Tels is part of our commitment to providing modern, accessible education for all students.
                </p>
              </div>
            </div>
            <div className="grid max-w-5xl gap-6 py-12 mx-auto lg:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <h3 className="text-2xl font-bold">Our Mission</h3>
                <p className="text-muted-foreground">
                  We believe that technology should enhance learning, not complicate it. Our LMS is designed to create a
                  seamless connection between classroom learning and digital resources, making education more
                  accessible, engaging, and effective for all students.
                </p>
                <h3 className="text-2xl font-bold">School Support</h3>
                <p className="text-muted-foreground">
                  Our dedicated support team is available to help teachers, students, and parents make the most of the
                  LMS. We provide training, resources, and ongoing assistance to ensure everyone can use the platform
                  effectively.
                </p>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl border bg-gradient-to-br from-blue-100 to-blue-50 p-2 dark:from-blue-900/20 dark:to-blue-900/10">
                  <img
                    src="/placeholder.svg?height=600&width=800"
                    alt="School campus"
                    className="object-cover w-full h-full mx-auto rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="w-full py-12 text-white bg-blue-600 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Need Help?</h2>
                <p className="max-w-[900px] text-blue-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our support team is here to help you with any questions about the LMS.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button className="text-blue-600 bg-white hover:bg-blue-50">
                  <Link href="/login" className="flex flex-row items-center">
                    Login to Platform
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" className="text-white border-white hover:bg-blue-700">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 bg-white border-t dark:bg-background">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-blue-400">
              <Sparkles className="absolute inset-0 w-5 h-5 m-auto text-white" />
            </div>
            <p className="text-sm font-medium">LMS Tels &copy; {new Date().getFullYear()}</p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm font-medium hover:underline">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline">
              Terms of Use
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline">
              Accessibility
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

