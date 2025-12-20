import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        // Disable browser's default scroll restoration
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        const scrollToTop = () => {
            // Try multiple scroll methods
            window.scrollTo(0, 0);
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;

            const topAnchor = document.getElementById('page-top');
            if (topAnchor) {
                topAnchor.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
        };

        // Immediate scroll
        scrollToTop();

        // Use requestAnimationFrame for next paint
        const rafId = requestAnimationFrame(() => {
            scrollToTop();
            setTimeout(scrollToTop, 50); // Increased delay slightly
        });

        return () => cancelAnimationFrame(rafId);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
