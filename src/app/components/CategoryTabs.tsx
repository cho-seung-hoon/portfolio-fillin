import React, { useState, useEffect } from "react";
import {
  Layers,
  Code,
  Bot,
  Database,
  Palette,
  TrendingUp,
  Briefcase,
  MonitorPlay,
  ShoppingCart,
  Coffee,
  BookOpen,
  Camera,
  GraduationCap,
  Award,
} from "lucide-react";
import { categoryService } from "../../api/category";
import { CategoryResponseDto } from "../../api/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface CategoryTabsProps {
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

// 아이콘 풀: 대분류 개수에 따라 순환 배치
const iconPool = [
  Layers,
  Code,
  Bot,
  Database,
  Palette,
  TrendingUp,
  Briefcase,
  MonitorPlay,
  ShoppingCart,
  Coffee,
  BookOpen,
  Camera,
  GraduationCap,
  Award,
];

export function CategoryTabs({
  selectedCategoryId,
  onCategoryChange,
}: CategoryTabsProps) {
  const [allCategories, setAllCategories] = useState<CategoryResponseDto[]>([]);
  // 선택된 대분류 ID 상태
  const [selectedMainId, setSelectedMainId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        // Filter out blank category (ID 1000)
        const filtered = data.filter(cat => cat.categoryId !== 1000);
        setAllCategories(filtered);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // 1) 대분류만 따로 추출 (부모가 없는 것)
  const mainCategories = allCategories
    .filter((c) => c.parentCategoryId === null)
    .sort((a, b) => a.categoryId - b.categoryId);

  // 2) 선택된 대분류에 속한 소분류 필터링 (부모 ID가 선택된 대분류 ID와 같은 것)
  const subCategories = selectedMainId == null
    ? []
    : allCategories.filter((c) => c.parentCategoryId === selectedMainId);

  // 선택된 대분류가 바뀌면, 현재 선택된 소분류가 해당 대분류에 속하지 않으면 초기화
  useEffect(() => {
    if (selectedMainId == null) {
      // 대분류가 선택되지 않았으면 소분류도 초기화
      if (selectedCategoryId != null) {
        onCategoryChange(null);
      }
      return;
    }

    // 대분류가 선택되었는데 소분류가 선택되어 있다면 유효성 검사
    if (selectedCategoryId != null) {
      const isValid = subCategories.some((c) => c.categoryId === selectedCategoryId);
      if (!isValid) {
        onCategoryChange(null);
      }
    }
  }, [selectedMainId, selectedCategoryId, subCategories, onCategoryChange]);

  // 선택된 카테고리 ID가 변경되면 대분류도 업데이트
  useEffect(() => {
    if (selectedCategoryId) {
      const category = allCategories.find(c => c.categoryId === selectedCategoryId);
      if (category?.parentCategoryId) {
        setSelectedMainId(category.parentCategoryId);
      } else if (category) {
        setSelectedMainId(category.categoryId);
      }
    } else {
      setSelectedMainId(null);
    }
  }, [selectedCategoryId, allCategories]);

  const handleMinorChange = (value: string) => {
    if (value === "none") {
      onCategoryChange(null);
    } else {
      onCategoryChange(Number(value));
    }
  };

  return (
    <div className="border-b bg-white sticky top-16 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
          {/* 전체 */}
          <button
            onClick={() => {
              setSelectedMainId(null);
              onCategoryChange(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`relative flex flex-col items-center gap-1.5 px-4 py-2.5 min-w-[80px] whitespace-nowrap transition-colors ${selectedMainId === null && selectedCategoryId === null
              ? "text-[#00C471]"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            <Layers className="size-6" strokeWidth={1.5} />
            <span className="text-xs">전체</span>
            {selectedMainId === null && selectedCategoryId === null && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C471]"></div>
            )}
          </button>

          {/* 백엔드 대분류 + 아이콘 매핑 (아이콘 풀 순환) */}
          {mainCategories.map((major, idx) => {
            const Icon = iconPool[idx % iconPool.length] || Layers;
            const isSelected = selectedMainId === major.categoryId;

            return (
              <button
                key={major.categoryId}
                onClick={() => {
                  setSelectedMainId(major.categoryId);
                  // 대분류 변경 시 소분류 선택 초기화
                  onCategoryChange(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`relative flex flex-col items-center gap-1.5 px-4 py-2.5 min-w-[80px] whitespace-nowrap transition-colors ${isSelected
                  ? "text-[#00C471]"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <Icon className="size-6" strokeWidth={1.5} />
                <span className="text-xs">{major.name}</span>
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C471]"></div>
                )}
              </button>
            );
          })}

          {/* 소분류 선택 (대분류가 선택된 경우에만 표시) */}
          {selectedMainId != null && (
            <div className="ml-3 flex items-center gap-2">
              <Select
                value={selectedCategoryId?.toString() || "none"}
                onValueChange={handleMinorChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="소분류 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">소분류 선택</SelectItem>
                  {subCategories.map((cat) => (
                    <SelectItem key={cat.categoryId} value={cat.categoryId.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}