export const ThreeDotLoader = () => {
  return (
    <div className="flex space-x-2 h-36 justify-center items-center bg-white dark:invert">
      <div className="h-4 w-4 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-4 w-4 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-4 w-4 bg-black rounded-full animate-bounce"></div>
    </div>
  );
};

interface SquareLoaderProps {
  className?: string;
}

export const SquareLoader: React.FC<SquareLoaderProps> = ({ className }) => {
  return (
    <div className={`flex items-center justify-center w-full my-auto ${className}`}>
      <div className="rounded-md h-10 w-10 border-4 border-t-4 border-black animate-spin absolute"></div>
    </div>
  );
};

export const ThreeDotLoaderSM = () => {
  return (
    <div className="space-x-2 ml-12 my-4 flex bg-white dark:invert">
      <div className="h-3 w-3 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-3 w-3 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-3 w-3 bg-gray-400 rounded-full animate-bounce"></div>
    </div>
  );
};

export const CircleLoader = () => {
  return (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
};
