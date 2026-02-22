import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import { toast } from 'sonner';
import { getFirstMessage } from '@/lib/api-messages';
import { BookOpen, Lock, Menu } from 'lucide-react';
import StudentSidebar from '@/Components/StudentSidebar';
import TeacherLayout from '@/Pages/teacher/layout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const { auth, flash } = usePage().props as any;
    const isStudent = auth?.user?.tipe_user === 'siswa';
    const isTeacher = auth?.user?.tipe_user === 'guru';
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.success, flash?.error]);

    const updatePassword = (e: React.FormEvent) => {
        e.preventDefault();

        passwordForm.put(route('password.update'), {
            onSuccess: () => {
                setIsPasswordModalOpen(false);
                passwordForm.reset();
            },
            onError: (errors) => {
                toast.error(getFirstMessage({ errors }, 'Failed to update password'));
            },
        });
    };

    const profileContent = (
        <div className="mx-auto max-w-5xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Settings & Profile
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Manage your account information and security settings.
                </p>
            </div>
            <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-slate-900">
                <UpdateProfileInformationForm
                    mustVerifyEmail={mustVerifyEmail}
                    status={status}
                    className="max-w-xl"
                />
            </div>

            <Card className="bg-white shadow sm:rounded-lg dark:bg-slate-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-blue-600" />
                        Password Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600 mb-4 dark:text-slate-300">
                        Ensure your account is using a long, random password to stay secure.
                    </p>
                    <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Lock className="h-4 w-4 mr-2" />
                                Change Password
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Change Password</DialogTitle>
                                <DialogDescription>
                                    Enter your current password and choose a new one.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={updatePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current_password">Current Password</Label>
                                    <Input
                                        id="current_password"
                                        type="password"
                                        value={passwordForm.data.current_password}
                                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                        placeholder="Enter current password"
                                        required
                                    />
                                    {passwordForm.errors.current_password && (
                                        <p className="text-sm text-red-600">{passwordForm.errors.current_password}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={passwordForm.data.password}
                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                    />
                                    {passwordForm.errors.password && (
                                        <p className="text-sm text-red-600">{passwordForm.errors.password}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                    />
                                    {passwordForm.errors.password_confirmation && (
                                        <p className="text-sm text-red-600">{passwordForm.errors.password_confirmation}</p>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsPasswordModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700"
                                        disabled={passwordForm.processing}
                                    >
                                        {passwordForm.processing ? 'Updating...' : 'Update Password'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-slate-900">
                <DeleteUserForm className="max-w-xl" />
            </div>
        </div>
    );

    if (isStudent) {
        return (
            <div className="flex min-h-screen">
                <StudentSidebar
                    active="settings"
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                <div className="flex-1 lg:pl-64">
                    <Head title="Profile" />
                    <header className="sticky top-0 z-40 flex items-center h-16 px-4 bg-white border-b dark:border-slate-800 dark:bg-slate-950 lg:px-6">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
                        >
                            <Menu className="w-5 h-5" />
                            <span className="sr-only">Toggle sidebar</span>
                        </button>
                        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                            <span className="text-lg font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text">
                                LMS Tels
                            </span>
                            <span className="rounded-md bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                                Student
                            </span>
                        </Link>
                    </header>
                    <main className="flex-1 p-6 overflow-auto bg-slate-50 dark:bg-slate-950">
                        <div className="mx-auto max-w-7xl space-y-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Profile</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Manage your account information and security settings.
                                </p>
                            </div>
                            {profileContent}
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (isTeacher) {
        return (
            <TeacherLayout>
                <Head title="Teacher Settings" />
                {profileContent}
            </TeacherLayout>
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {profileContent}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
