export interface User {
    id: number;
    nama_lengkap: string;
    username: string;
    name: string;
    email: string;
    tipe_user?: 'admin' | 'guru' | 'siswa';
    class?: string | null;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
