import { Heart, Star, Users } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export interface Course {
  id: number;
  title: string;
  instructor: string;
  price: number;
  originalPrice?: number;
  rating: number;
  studentCount: number;
  thumbnail: string;
  category: string;
  level: "입문" | "초급" | "중급" | "고급";
  tags: string[];
  isNew?: boolean;
  isBest?: boolean;
}

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const discount = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden border rounded-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {course.isNew && (
            <Badge className="bg-[#00C471] hover:bg-[#00B368]">NEW</Badge>
          )}
          {course.isBest && (
            <Badge className="bg-orange-500 hover:bg-orange-600">BEST</Badge>
          )}
        </div>

        {/* Like Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/90 hover:bg-white"
        >
          <Heart className="size-4" />
        </Button>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
            {discount}% 할인
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {course.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 min-h-[3rem]">{course.title}</h3>

        {/* Instructor */}
        <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>

        {/* Rating & Students */}
        <div className="flex items-center gap-3 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{course.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Users className="size-4" />
            <span>{course.studentCount.toLocaleString()}</span>
          </div>
          <span className="text-gray-400">·</span>
          <span className="text-gray-500">{course.level}</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          {course.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ₩{course.originalPrice.toLocaleString()}
            </span>
          )}
          <span className="text-xl text-[#00C471]">
            {course.price === 0 ? "무료" : `₩${course.price.toLocaleString()}`}
          </span>
        </div>
      </div>
    </Card>
  );
}
