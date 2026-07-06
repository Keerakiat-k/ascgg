import { Loader2 } from 'lucide-react';

export default function Button({ 
  children, 
  type = 'button', 
  isLoading = false, 
  disabled = false, 
  onClick,
  className = ''
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
          กำลังตรวจสอบ...
        </>
      ) : (
        children
      )}
    </button>
  );
}