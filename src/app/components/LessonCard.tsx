import { Heart, Star, Users } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

import { Lesson } from "../../types/lesson";
import { getImageUrl } from "../../utils/image";


interface LessonCardProps {
  lesson: Lesson;
  onClick?: () => void;
}

export function LessonCard({ lesson, onClick }: LessonCardProps) {
  const discount = lesson.originalPrice
    ? Math.round(((lesson.originalPrice - lesson.price) / lesson.originalPrice) * 100)
    : 0;


  return (
    <Card
      className="group overflow-hidden border hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img
          src={
            getImageUrl(lesson.thumbnail.includes("picsum.photos")
              ? `${lesson.thumbnail}${lesson.thumbnail.includes("?") ? "&" : "?"}random=${lesson.id}`
              : lesson.thumbnail)
          }
          alt={lesson.title}
          className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
          {/* Service Type Badge */}
          {lesson.serviceType === "mentoring" && (
            <Badge className="bg-[#00C471] hover:bg-[#00B366] text-white border-0">
              1:1 멘토링
            </Badge>
          )}
          {lesson.serviceType === "oneday" && (
            <Badge className="bg-[#FF9500] hover:bg-[#E68600] text-white border-0">
              원데이
            </Badge>
          )}
          {lesson.serviceType === "study" && (
            <Badge className="bg-[#0091FF] hover:bg-[#0081E6] text-white border-0">
              스터디
            </Badge>
          )}

          {/* Status Badges */}
          <div className="flex gap-1">
            {lesson.isNew && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">
                NEW
              </Badge>
            )}
            {lesson.isBest && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0">
                BEST
              </Badge>
            )}
          </div>
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
          {lesson.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 min-h-[3rem]">{lesson.title}</h3>

        {/* Instructor */}
        <p className="text-sm text-gray-600 mb-3">{lesson.instructor}</p>

        {/* Rating & Students */}
        <div className="flex items-center gap-3 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <Star className={`size-4 ${lesson.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
            <span className={`font-medium ${!lesson.rating ? "text-gray-400" : ""}`}>
              {lesson.rating ? lesson.rating.toFixed(1) : "신규"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Users className="size-4" />
            <span>{Number(lesson.studentCount ?? 0).toLocaleString()}</span>
          </div>
          <span className="text-gray-400">·</span>
          <span className="text-gray-500">{lesson.level}</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          {lesson.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ₩{Number(lesson.originalPrice ?? 0).toLocaleString()}
            </span>
          )}
          <span className="text-xl text-[#00C471]">
            {lesson.price === 0 ? "무료" : `₩${Number(lesson.price ?? 0).toLocaleString()}`}
          </span>
        </div>
      </div>
    </Card>
  );
}