import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function LessonCardSkeleton() {
    return (
        <Card className="group overflow-hidden border">
            {/* Thumbnail Skeleton */}
            <div className="relative aspect-video bg-gray-100">
                <Skeleton className="size-full" />
            </div>

            {/* Content Skeleton */}
            <div className="p-4 space-y-4">
                {/* Tags */}
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-16" />
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                </div>

                {/* Instructor */}
                <Skeleton className="h-4 w-20" />

                {/* Rating & Students */}
                <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-10" />
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="h-6 w-24" />
                </div>
            </div>
        </Card>
    );
}
