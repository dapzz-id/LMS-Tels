import { Head, Link, usePage } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Award, DownloadIcon, Calendar, Menu, ChevronDown, Settings, LogOut } from "lucide-react";
import { router } from "@inertiajs/react";
import { useState } from "react";
import StudentSidebar from "@/Components/StudentSidebar";
import ClientPagination from "@/Components/ui/client-pagination";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/Components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/Components/ui/avatar";

interface Certificate {
  id: number;
  certificate_number: string;
  title: string;
  description: string;
  issued_at: string;
  course: {
    judul_kursus: string;
  };
}

export default function CertificatesPage({ certificates }: { certificates: Certificate[] }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(6);
  const { auth } = usePage().props as any
  const user = auth.user

  const paginatedCertificates = certificates.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  return (
    <div className="flex min-h-screen">
      <StudentSidebar
        active="certificates"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 lg:pl-64">
        <Head title="My Certificates" />

        <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-white px-4 dark:border-slate-800 dark:bg-slate-950 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <img src="/logotelesandi.png" alt="Logo" className="h-8 w-8 rounded-full" />
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-lg font-bold text-transparent">
              LMS Tels
            </span>
            <span className="rounded-md bg-blue-100 px-2 ml-1 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400">
              Student
            </span>
          </Link>
          <div className="flex items-center gap-4 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                  <Avatar className="h-8 w-8 border-2 border-blue-100 dark:border-blue-800">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Student" />
                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                      ST
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-flex font-medium">{user?.nama_lengkap || 'Student'}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link href="/profile" className="flex w-full items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link href={route("logout")} method="post" as="button" className="flex w-full items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-6">
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text">
                  My Certificates
                </h1>
                <p className="text-slate-500 dark:text-slate-400">View and download your course completion certificates</p>
              </div>
            </div>

            {certificates.length === 0 ? (
              <Card className="border-0 shadow-sm rounded-xl">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <Award className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-2xl">No Certificates Yet</CardTitle>
                  <CardDescription className="text-center text-lg">
                    You haven't earned any certificates. Complete courses to earn certificates.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    onClick={() => router.visit(route('student.courses'))}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg"
                  >
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedCertificates.map((certificate) => (
                  <Card
                    key={certificate.id}
                    className="overflow-hidden transition-shadow hover:shadow-lg bg-white dark:bg-slate-900"
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-bold">{certificate.title}</CardTitle>
                          <CardDescription className="mt-1 text-blue-100">
                            {certificate.course?.judul_kursus || 'Course'}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          Completed
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <Award className="h-5 w-5 mr-2 text-blue-500" />
                          <span className="font-mono text-sm">#{certificate.certificate_number}</span>
                        </div>

                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                          <span>
                            Issued: {format(new Date(certificate.issued_at), 'dd MMM yyyy', { locale: id })}
                          </span>
                        </div>

                        <Button
                          asChild
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white mt-4 py-6 text-lg"
                        >
                          <a href={route('student.certificates.download', certificate.id)}>
                            <DownloadIcon className="mr-2 h-5 w-5" />
                            Download Certificate
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {certificates.length > 0 && (
              <div className="mt-6">
                <ClientPagination
                  totalItems={certificates.length}
                  currentPage={currentPage}
                  perPage={perPage}
                  onPageChange={setCurrentPage}
                  onPerPageChange={(value) => {
                    setPerPage(value);
                    setCurrentPage(1);
                  }}
                  itemLabel="certificates"
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
