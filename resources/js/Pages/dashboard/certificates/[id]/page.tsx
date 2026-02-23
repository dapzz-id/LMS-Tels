import { Head } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Award, DownloadIcon, Calendar, User, Book, Menu } from "lucide-react";
import { router } from "@inertiajs/react";
import { useState } from "react";
import StudentSidebar from "@/Components/StudentSidebar";

interface Certificate {
  id: number;
  certificate_number: string;
  title: string;
  description: string;
  issued_at: string;
  course: {
    judul_kursus: string;
  };
  metadata: {
    user_name: string;
    course_title: string;
    completion_date: string;
    instructor: string;
  };
}

export default function CertificateDetailsPage({ certificate }: { certificate: Certificate }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <StudentSidebar
        active="certificates"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 lg:pl-64">
        <Head title="Certificate Details" />

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
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Certificate Details</h1>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.visit(route('student.certificates'))}
            className="mb-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ← Back to Certificates
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Certificate Details</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            View your certificate information and download the official PDF document.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white/20 rounded-full mb-6">
              <Award className="h-16 w-16 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold mb-2">{certificate.title}</CardTitle>
            <CardDescription className="text-xl text-blue-100 max-w-2xl mx-auto">
              {certificate.course?.judul_kursus || certificate.metadata?.course_title || 'Course'}
            </CardDescription>
          </div>

          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">Certificate Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
                      <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Certificate Number</p>
                      <p className="font-bold text-lg">{certificate.certificate_number}</p>
                    </div>
                  </div>

                  <div className="flex items-start p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
                      <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Issue Date</p>
                      <p className="font-bold text-lg">
                        {format(new Date(certificate.issued_at), 'dd MMMM yyyy', { locale: id })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
                      <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Recipient</p>
                      <p className="font-bold text-lg">{certificate.metadata?.user_name || 'Student'}</p>
                    </div>
                  </div>

                  <div className="flex items-start p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
                      <Book className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Instructor</p>
                      <p className="font-bold text-lg">{certificate.metadata?.instructor || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">About This Certificate</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                  {certificate.description || `This certificate is awarded for successfully completing the course requirements and demonstrating proficiency in the subject matter.`}
                </p>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 mb-8 border border-blue-100 dark:border-gray-600">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Verification
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    This certificate is verified and can be validated using the certificate number above. It is digitally signed and can be authenticated through our verification system.
                  </p>
                  <div className="text-sm font-mono bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                    Verify at: https://lms-tels.com/verify/{certificate.certificate_number}
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <a href={route('student.certificates.download', certificate.id)}>
                    <DownloadIcon className="mr-3 h-6 w-6" />
                    Download Official Certificate
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
</div>
  );
}
