import '../css/app.css';
import './bootstrap';
import './lib/studentActivityTracker.js';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'next-themes';
import StudentActivityIntegration from './Components/StudentActivityIntegration';
import GlobalApiErrorHandler from './Components/GlobalApiErrorHandler';
import { Toaster } from 'sonner';

createInertiaApp({
    title: (title) => `${title} - ${import.meta.env.VITE_APP_NAME}`,
    resolve: (name) => resolvePageComponent(
        `./Pages/${name}.tsx`,
        import.meta.glob('./Pages/**/*.tsx')
    ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <StudentActivityIntegration>
                    <GlobalApiErrorHandler />
                    <Toaster richColors position="top-right" />
                    <App {...props} />
                </StudentActivityIntegration>
            </ThemeProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
