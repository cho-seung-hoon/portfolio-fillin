import { LessonCard } from "./LessonCard";
import { LessonCardSkeleton } from "./LessonCardSkeleton";
import { Lesson } from "../../types/lesson";
import { Pagination } from "./Pagination";

interface SearchResultsProps {
  lessons: Lesson[];
  searchQuery: string;
  onLessonClick?: (lessonId: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function SearchResults({ lessons, searchQuery, onLessonClick, currentPage, totalPages, onPageChange, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <LessonCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }
  if (lessons.length === 0) {

    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery && (
                <>
                  "<span className="text-[#00C471]">{searchQuery}</span>"에 대한 검색
                  결과를 찾을 수 없습니다.
                  <br />
                </>
              )}
              다른 키워드로 검색해보세요.
            </p>

          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} onClick={() => onLessonClick?.(lesson.id)} />
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </section>
  );
}