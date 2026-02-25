import { useState, ImgHTMLAttributes } from 'react';

interface ResponsiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    src: string;
    srcSet?: string;
    sizes?: string;
    alt: string;
    className?: string;
    lazy?: boolean;
    fallback?: string;
}

export default function ResponsiveImage({
    src,
    srcSet,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    alt,
    className = '',
    lazy = true,
    fallback = '/images/placeholder.png',
    ...props
}: ResponsiveImageProps) {
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const handleError = () => {
        setError(true);
    };

    const handleLoad = () => {
        setLoaded(true);
    };

    return (
        <div className={`relative ${className}`}>
            {!loaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
            )}
            <img
                src={error ? fallback : src}
                srcSet={!error && srcSet ? srcSet : undefined}
                sizes={!error && srcSet ? sizes : undefined}
                alt={alt}
                loading={lazy ? 'lazy' : undefined}
                onError={handleError}
                onLoad={handleLoad}
                className={`${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ${className}`}
                {...props}
            />
        </div>
    );
}
