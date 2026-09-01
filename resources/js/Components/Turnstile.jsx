// resources/js/Components/Turnstile.jsx
import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

export default function Turnstile({ onVerify }) {
    const ref = useRef(null);
    const { turnstileSiteKey } = usePage().props;

    useEffect(() => {
        const renderWidget = () => {
            if (window.turnstile && ref.current) {
                window.turnstile.render(ref.current, {
                    sitekey: turnstileSiteKey,
                    callback: (token) => onVerify(token),
                    'error-callback': () => onVerify(''),
                    'expired-callback': () => onVerify(''),
                });
            }
        };

        if (window.turnstile) {
            renderWidget();
        } else {
            window.addEventListener('turnstile-loaded', renderWidget);
        }

        return () => window.removeEventListener('turnstile-loaded', renderWidget);
    }, []);

    return <div ref={ref} />;
}