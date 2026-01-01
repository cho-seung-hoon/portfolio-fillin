import { CourseCard, type Course } from "./CourseCard";

interface CourseGridProps {
  courses: Course[];
  title?: string;
}

export function CourseGrid({ courses, title }: CourseGridProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {title && (
          <div className="mb-8">
            <h2 className="text-3xl mb-2">{title}</h2>
            <div className="h-1 w-12 bg-[#00C471] rounded"></div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            해당 카테고리의 강의가 없습니다.
          </div>
        )}
      </div>
    </section>
  );
}
