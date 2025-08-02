import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400"></div>
    </div>
  );
};

export default LoadingSpinner;
