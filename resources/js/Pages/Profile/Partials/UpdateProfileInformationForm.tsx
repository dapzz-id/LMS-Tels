import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const { auth, flash } = usePage().props as any;
    const user = auth.user;
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            nama_lengkap: user.nama_lengkap ?? user.name ?? '',
            username: user.username ?? '',
            email: user.email,
        });

    const validateField = (field: string, value: string): string => {
        const trimmed = value.trim();

        if (field === 'nama_lengkap' && trimmed.length === 0) {
            return 'Nama lengkap wajib diisi.';
        }

        if (field === 'username') {
            if (trimmed.length === 0) return 'Username wajib diisi.';
            if (trimmed.length < 3) return 'Username minimal 3 karakter.';
        }

        if (field === 'email') {
            if (trimmed.length === 0) return 'Email wajib diisi.';
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(trimmed)) return 'Format email tidak valid.';
        }

        return '';
    };

    const updateProfileField = (field: 'nama_lengkap' | 'username' | 'email', value: string) => {
        setData(field, value);
        setClientErrors((prev) => ({
            ...prev,
            [field]: validateField(field, value),
        }));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const nextClientErrors = {
            nama_lengkap: validateField('nama_lengkap', data.nama_lengkap),
            username: validateField('username', data.username),
            email: validateField('email', data.email),
        };

        setClientErrors(nextClientErrors);

        if (Object.values(nextClientErrors).some((message) => message)) {
            return;
        }

        patch(route('profile.update'), {
            onSuccess: () => {
                setClientErrors({});
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Profile Information
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="nama_lengkap" value="Nama Lengkap" />

                    <TextInput
                        id="nama_lengkap"
                        className="mt-1 block w-full p-2"
                        value={data.nama_lengkap}
                        onChange={(e) => updateProfileField('nama_lengkap', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError
                        className="mt-2"
                        message={clientErrors.nama_lengkap || errors.nama_lengkap}
                    />
                </div>

                <div>
                    <InputLabel htmlFor="username" value="Username" />

                    <TextInput
                        id="username"
                        className="mt-1 block w-full p-2"
                        value={data.username}
                        onChange={(e) => updateProfileField('username', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError
                        className="mt-2"
                        message={clientErrors.username || errors.username}
                    />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full p-2"
                        value={data.email}
                        onChange={(e) => updateProfileField('email', e.target.value)}
                        required
                        autoComplete="email"
                    />

                    <InputError
                        className="mt-2"
                        message={clientErrors.email || errors.email}
                    />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful && !!flash?.success}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            {flash?.success}
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
