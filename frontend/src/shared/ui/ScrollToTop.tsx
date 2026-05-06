import { useEffect } from 'react';
import { useLocation, useNavigationType, NavigationType } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    const navType = useNavigationType();

    useEffect(() => {
        // Skip scroll to top for home page - let scroll restoration handle it
        if (pathname === '/' || pathname === '/home') {
            return;
        }

        // Only scroll to top on normal navigation, not browser back/forward.
        if (navType !== NavigationType.Pop) {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'auto'
            });
        }
    }, [pathname, navType]);

    return null;
};

export default ScrollToTop;

