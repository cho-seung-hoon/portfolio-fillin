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
  onLoginClick: () => void;
  onSignupClick: () => void;
  searchQuery?: string;
  page?: number;
  sort?: string;
  categoryId?: number;
}

export default function Home({ onLoginClick, onSignupClick, searchQuery: initialSearchQuery = "", page = 1, sort: initialSort = "popular", categoryId: initialCategoryId }: HomeProps) {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 20;

  // Local state for filters that are NOT in URL yet (can be moved to URL later if needed)
  const [priceFilter, setPriceFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        console.log("Fetching lessons with category:", initialCategoryId);
        // API 호출 시 검색어, 페이지(0-based), 정렬, 카테고리 ID 전달
        const { lessons: data, totalCount } = await lessonService.getLessons(
          initialSearchQuery,
          Math.max(0, page - 1),
          initialSort,
          initialCategoryId || undefined
        );
        setLessons(data);
        setTotalCount(totalCount);
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [initialSearchQuery, page, initialSort, initialCategoryId]);

  const handleLessonClick = (lessonId: string) => {
    navigate({ to: "/service/$id", params: { id: lessonId.toString() } });
  };

  // Client-side filtering/sorting is temporarily applied ONLY to the current page
  // Category filtering is now handled by API, but other filters remain client-side
  const filteredAndSortedLessons = useMemo(() => {
    let filtered = lessons;

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
  }, [lessons, priceFilter, levelFilter, serviceTypeFilter]);

  // Pagination logic using server totalCount
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    navigate({
      to: ".",
      search: {
        search: initialSearchQuery,
        page: newPage,
        sort: initialSort,
        categoryId: initialCategoryId ?? undefined
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (newCategoryId: number | null) => {
    navigate({
      to: ".",
      search: {
        search: initialSearchQuery,
        page: 1, // Reset page on category change
        sort: initialSort,
        categoryId: newCategoryId ?? undefined
      }
    });
  };

  const handleSearchChange = (query: string) => {
    navigate({
      to: ".",
      search: {
        search: query,
        sort: initialSort,
        page: 1,
        categoryId: initialCategoryId ?? undefined
      }
    });
  };

  const handleSortChange = (sort: string) => {
    navigate({
      to: ".",
      search: {
        search: initialSearchQuery,
        page: 1,
        sort: sort,
        categoryId: initialCategoryId ?? undefined
      }
    });
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
        searchQuery={initialSearchQuery}
        onSearchChange={handleSearchChange}
      />
      <CategoryTabs
        selectedCategoryId={initialCategoryId ?? null}
        onCategoryChange={handleCategoryChange}
      />
      <SearchFilters
        sortBy={initialSort}
        onSortChange={handleSortChange}
        serviceTypeFilter={serviceTypeFilter}
        onServiceTypeFilterChange={(type) => {
          setServiceTypeFilter(type);
          handlePageChange(1);
        }}
        resultCount={totalCount}
      />
      <SearchResults
        lessons={filteredAndSortedLessons}
        searchQuery={initialSearchQuery}
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
