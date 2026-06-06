import React from 'react';
import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

export const PostSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-8 lg:p-10 rounded-[3rem] border border-gray-50 shadow-elegant"
  >
    <div className="flex gap-6">
      <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-20 h-3" />
          </div>
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-64 rounded-2xl" />
        <div className="flex gap-8 pt-6 border-t border-gray-50">
          <Skeleton className="w-16 h-6" />
          <Skeleton className="w-16 h-6" />
          <Skeleton className="w-16 h-6 ml-auto" />
        </div>
      </div>
    </div>
  </motion.div>
);

export const ChatListSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-8 rounded-[2.5rem] bg-white border border-gray-50 shadow-elegant flex items-center gap-6">
        <Skeleton className="w-16 h-16 rounded-[1.5rem] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-40 h-6" />
          <Skeleton className="w-60 h-4" />
        </div>
        <Skeleton className="w-6 h-6" />
      </div>
    ))}
  </div>
);

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizeClasses[size]} border-2 border-gray-200 border-t-gray-900 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};
