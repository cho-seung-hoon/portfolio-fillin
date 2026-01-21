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
      // 대분류 ID와 같으면 "전체"를 의미하므로 유효함
      if (selectedCategoryId === selectedMainId) return;

      const isValid = subCategories.some((c) => c.categoryId === selectedCategoryId);
      if (!isValid) {
        onCategoryChange(null);
      }
    }
  }, [selectedMainId, selectedCategoryId, subCategories, onCategoryChange]);

  // 선택된 카테고리 ID가 변경되면 대분류도 업데이트
  // 단, selectedCategoryId가 null일 때는 대분류를 null로 리셋하지 않음 (사용자가 대분류를 직접 선택한 경우 유지)
  useEffect(() => {
    if (selectedCategoryId) {
      const category = allCategories.find(c => c.categoryId === selectedCategoryId);
      if (category?.parentCategoryId) {
        setSelectedMainId(category.parentCategoryId);
      } else if (category) {
        setSelectedMainId(category.categoryId);
      }
    }
  }, [selectedCategoryId, allCategories]);


  if (mainCategories.length === 0) return null;

  return (
    <div className="border-b bg-white sticky top-16 z-40">
      <div className="container mx-auto px-4">
        {/* 대분류 탭 영역 - 가로 스크롤 */}
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
                  // 대분류 변경 시 해당 대분류 ID로 필터링 (전체 소분류 선택 효과)
                  onCategoryChange(major.categoryId);
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
        </div>

        {/* 소분류 선택 - 버튼 리스트 (대분류 선택 시에만 노출) */}
        {selectedMainId !== null && (
          <div className="pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 whitespace-nowrap mr-2">소분류</span>

              <button
                onClick={() => onCategoryChange(selectedMainId)}
                className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors border ${selectedCategoryId === selectedMainId
                  ? "bg-[#00C471] text-white border-[#00C471]"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
              >
                전체
              </button>

              {subCategories.map((cat) => (
                <button
                  key={cat.categoryId}
                  onClick={() => onCategoryChange(cat.categoryId)}
                  className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors border ${selectedCategoryId === cat.categoryId
                    ? "bg-[#00C471] text-white border-[#00C471]"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}