import axios, { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_APP_URL;

if (baseURL) {
    axios.defaults.baseURL = baseURL;
}

axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common.Accept = 'application/json';

const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content');

if (csrfToken) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

const statusMessages: Record<number, string> = {
    403: 'Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.',
    404: 'Data atau halaman yang diminta tidak ditemukan.',
    500: 'Terjadi gangguan pada server. Silakan coba beberapa saat lagi.',
};

axios.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string }>) => {
        const status = error.response?.status;

        if (status && [403, 404, 500].includes(status)) {
            const message =
                error.response?.data?.message ||
                statusMessages[status] ||
                'Terjadi kesalahan saat memproses permintaan.';

            window.dispatchEvent(
                new CustomEvent('api:error', {
                    detail: { status, message },
                }),
            );
        }

        return Promise.reject(error);
    },
);

window.axios = axios;
