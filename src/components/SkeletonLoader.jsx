import React from 'react';

const SkeletonLoader = ({ type = 'product', count = 3 }) => {
  const renderSkeletons = () => {
    const items = [];
    for (let i = 0; i < count; i++) {
      if (type === 'product') {
        items.push(
          <div key={i} className="rounded-[20px] border border-gray-150 dark:border-gray-800 p-4 space-y-4 animate-pulse">
            <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4 pt-2"></div>
            </div>
          </div>
        );
      } else if (type === 'list') {
        items.push(
          <div key={i} className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-800 animate-pulse">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
            </div>
          </div>
        );
      }
    }
    return items;
  };

  return <>{renderSkeletons()}</>;
};

export default SkeletonLoader;
