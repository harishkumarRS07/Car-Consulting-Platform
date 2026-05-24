import { useEffect, useState } from 'react';

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export const useLazyImage = (src) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageRef, setImageRef] = useState();

  useEffect(() => {
    let observer;
    let img;

    if (imageRef && imageSrc === null) {
      img = new Image();

      const onLoadImage = () => {
        setImageSrc(src);
        observer.unobserve(imageRef);
      };

      img.addEventListener('load', onLoadImage);

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              img.src = src;
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(imageRef);

      return () => {
        img.removeEventListener('load', onLoadImage);
        observer.unobserve(imageRef);
      };
    }
  }, [imageSrc, imageRef, src]);

  return [setImageRef, imageSrc];
};
