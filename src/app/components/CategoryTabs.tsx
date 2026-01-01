interface CategoryTabsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: "all", label: "전체", icon: "📚" },
  { id: "programming", label: "개발·프로그래밍", icon: "💻" },
  { id: "design", label: "디자인", icon: "🎨" },
  { id: "data", label: "데이터 사이언스", icon: "📊" },
  { id: "marketing", label: "마케팅", icon: "📈" },
  { id: "business", label: "비즈니스", icon: "💼" },
  { id: "ai", label: "인공지능", icon: "🤖" },
];

export function CategoryTabs({
  selectedCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <div className="border-b bg-white sticky top-16 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? "bg-[#00C471] text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <span>{category.icon}</span>
              <span className="text-sm">{category.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
