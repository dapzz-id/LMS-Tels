import { Head } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Award, DownloadIcon, Calendar, Menu } from "lucide-react";
import { router } from "@inertiajs/react";
import { useState } from "react";
import StudentSidebar from "@/Components/StudentSidebar";
import ClientPagination from "@/Components/ui/client-pagination";

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

  const paginatedCertificates = certificates.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <StudentSidebar
        active="certificates"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 lg:pl-64">
        <Head title="My Certificates" />

        <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-white/80 px-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">My Certificates</h1>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
                <Award className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">My Certificates</h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                View and download your course completion certificates. These certificates verify your achievements and can be shared with employers or added to your professional profiles.
              </p>
            </div>

            {certificates.length === 0 ? (
              <Card className="max-w-2xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-100 dark:border-gray-700">
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
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
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
