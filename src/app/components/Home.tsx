import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ProjectHeader } from "./ProjectHeader";
import { SearchSection } from "./SearchSection";
import { CategoryTabs } from "./CategoryTabs";
import { SearchFilters } from "./SearchFilters";
import { SearchResults } from "./SearchResults";
import { ProjectFooter } from "./ProjectFooter";
import { Lesson } from "../../types/lesson";
import { lessonService } from "../../api/lesson";

interface HomeProps {
  user: { email: string; name: string } | null;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogout: () => void;
  searchQuery?: string;
  page?: number;
  sort?: string;
}

export default function Home({ user, onLoginClick, onSignupClick, onLogout, searchQuery: initialSearchQuery = "", page = 1, sort: initialSort = "popular" }: HomeProps) {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState(initialSort);
  const [priceFilter, setPriceFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    // URL의 라우트 파라미터가 변경되면 로컬 상태도 업데이트
    setSearchQuery(initialSearchQuery);
    setSortBy(initialSort);

    const fetchLessons = async () => {
      setLoading(true);
      try {
        // API 호출 시 검색어와 페이지(0-based), 정렬 전달
        const { lessons: data, totalCount } = await lessonService.getLessons(initialSearchQuery, Math.max(0, page - 1), sortBy);
        setLessons(data);
        setTotalCount(totalCount);
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [initialSearchQuery, page, sortBy]);

  const handleLessonClick = (lessonId: string) => {
    navigate({ to: "/service/$id", params: { id: lessonId.toString() } });
  };

  // Client-side filtering/sorting is temporarily applied ONLY to the current page
  // In a full implementation, these params should also be passed to the API
  const filteredAndSortedLessons = useMemo(() => {
    let filtered = lessons;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (lesson) => lesson.category === selectedCategory
      );
    }

    // Filter by price
    if (priceFilter === "free") {
      filtered = filtered.filter((lesson) => lesson.price === 0);
    } else if (priceFilter === "paid") {
      filtered = filtered.filter((lesson) => lesson.price > 0);
    } else if (priceFilter === "discount") {
      filtered = filtered.filter((lesson) => lesson.originalPrice);
    }

    // Filter by level
    if (levelFilter !== "all") {
      filtered = filtered.filter((lesson) => lesson.level === levelFilter);
    }

    // Filter by service type
    if (serviceTypeFilter !== "all") {
      filtered = filtered.filter((lesson) => lesson.serviceType === serviceTypeFilter);
    }

    // Sorting is now handled by the API, so we just return the filtered list
    return filtered;
  }, [lessons, selectedCategory, priceFilter, levelFilter, serviceTypeFilter]); // Removed sortBy from dep array as it triggers API fetch now

  // Pagination logic using server totalCount
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    // Navigate with new page param
    navigate({
      to: ".",
      search: {
        search: searchQuery,
        page: newPage,
        sort: sortBy
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ProjectHeader
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        onNavigateToMyPage={() => navigate({ to: "/mypage" })}
        onNavigateToMain={() => navigate({ to: "/" })}
        onNavigateToServiceRegistration={() => navigate({ to: "/service/register" })}
      />
      <SearchSection
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          navigate({
            to: ".",
            search: {
              search: query,
              sort: sortBy
            }
          });
        }}
      />
      <CategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={(category) => {
          setSelectedCategory(category);
          handlePageChange(1);
        }}
      />
      <SearchFilters
        sortBy={sortBy}
        onSortChange={(sort) => {
          setSortBy(sort);
          navigate({
            to: ".",
            search: {
              search: searchQuery,
              page: 1, // Reset page on sort change
              sort: sort
            }
          });
        }}
        serviceTypeFilter={serviceTypeFilter}
        onServiceTypeFilterChange={(type) => {
          setServiceTypeFilter(type);
          handlePageChange(1);
        }}
        resultCount={totalCount}
      />
      <SearchResults
        lessons={filteredAndSortedLessons}
        searchQuery={searchQuery}
        onLessonClick={handleLessonClick}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={loading}
      />
      <ProjectFooter />
    </div>
  );
}
