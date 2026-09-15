import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component scrolls the window to the top every time the route changes.
 * This is essential for SPAs to ensure users don't start at the bottom of a new page
 * if they clicked a link in the footer of the previous page.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to the absolute top of the document
    window.scrollTo(0, 0);
    
    // Also try to scroll the document element directly for better cross-browser compatibility
    document.documentElement.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
