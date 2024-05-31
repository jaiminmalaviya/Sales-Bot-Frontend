import { useState, useEffect } from "react";

function useIntersectionObserver<T extends HTMLElement>(
  ref: React.RefObject<T>,
  {
    root = null,
    rootMargin = "0px",
    threshold = 0.5,
  }: {
    root?: Element | Document | null;
    rootMargin?: string;
    threshold?: number | number[];
  }
) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    const current = ref.current;

    if (current) {
      observer.observe(current);
    }

    // Cleanup observer on unmount
    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [ref, root, rootMargin, threshold]);

  return isVisible;
}

export default useIntersectionObserver;
