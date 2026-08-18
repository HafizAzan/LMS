import { cn } from '../../lib/cn';

type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} />;
}

export function CourseCardSkeleton() {
  return (
    <div className="card">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-sm p-lg">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-sm">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-14" />
        </div>
      </div>
    </div>
  );
}
