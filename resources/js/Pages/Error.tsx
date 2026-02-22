import { Button } from '@/Components/ui/button';
import { Head, Link } from '@inertiajs/react';

type ErrorPageProps = {
    status: number;
    title: string;
    message: string;
};

export default function ErrorPage({ status, title, message }: ErrorPageProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
            <Head title={`${status} ${title}`} />

            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Error {status}
                </p>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {title}
                </h1>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    {message}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild>
                        <Link href="/">Kembali ke Dashboard</Link>
                    </Button>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        Kembali ke Halaman Sebelumnya
                    </Button>
                </div>
            </div>
        </div>
    );
}

