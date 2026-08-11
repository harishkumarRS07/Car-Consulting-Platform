const LoadingSpinner = ({ fullScreen = true, size = 'default', message = 'Loading...' }) => {
  const sizeMap = {
    small: 'h-5 w-5',
    default: 'h-10 w-10',
    large: 'h-16 w-16',
  };

  const loaderSizeClass = sizeMap[size] || sizeMap.default;

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <svg
          className={`animate-spin ${loaderSizeClass} ${
            size === 'small' ? 'text-white' : 'text-purple-600'
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {size !== 'small' && (
          <div className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-purple-500 blur-[2px] animate-pulse" />
        )}
      </div>
      
      {size !== 'small' && message && (
        <p className="text-sm font-bold text-purple-700/85 tracking-wide animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/20 backdrop-blur-md">
        <div className="bg-white/90 dark:bg-slate-900/90 p-8 rounded-3xl shadow-2xl border border-white/40 dark:border-slate-800/80 backdrop-blur-xl">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-2">
      {spinnerContent}
    </div>
  );
};

export default LoadingSpinner;

