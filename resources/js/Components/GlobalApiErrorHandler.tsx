import { useEffect } from 'react';
import { toast } from 'sonner';

type ApiErrorDetail = {
    status: number;
    message: string;
};

export default function GlobalApiErrorHandler() {
    useEffect(() => {
        const onApiError = (event: Event) => {
            const customEvent = event as CustomEvent<ApiErrorDetail>;
            const detail = customEvent.detail;

            if (!detail) {
                return;
            }

            toast.error(detail.message, {
                id: `api-error-${detail.status}`,
            });
        };

        window.addEventListener('api:error', onApiError);

        return () => {
            window.removeEventListener('api:error', onApiError);
        };
    }, []);

    return null;
}

