import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";

interface SearchFiltersProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  serviceTypeFilter: string;
  onServiceTypeFilterChange: (value: string) => void;
  resultCount: number;
}

export function SearchFilters({
  sortBy,
  onSortChange,
  serviceTypeFilter,
  onServiceTypeFilterChange,
  resultCount,
}: SearchFiltersProps) {
  return (
    <div className="bg-white border-b py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Result Count */}
          <div className="text-gray-600">
            <span className="text-[#00C471]">{resultCount.toLocaleString()}</span>개의 강의
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort */}
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">인기순</SelectItem>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="price-low">가격 낮은순</SelectItem>
                <SelectItem value="price-high">가격 높은순</SelectItem>
              </SelectContent>
            </Select>

            {/* Service Type Filter */}
            <Select value={serviceTypeFilter} onValueChange={onServiceTypeFilterChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="서비스 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="mentoring">1:1 멘토링</SelectItem>
                <SelectItem value="oneday">1:N 원데이</SelectItem>
                <SelectItem value="study">1:N 스터디</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}