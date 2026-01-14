import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function SearchSection({ searchQuery, onSearchChange }: SearchSectionProps) {
  const [inputValue, setInputValue] = useState(searchQuery);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleSearch = () => {
    onSearchChange(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="bg-white border-b py-6">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              type="text"
              placeholder="배우고 싶은 지식을 검색해보세요"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-14 h-14 text-lg rounded-lg border-2 focus:border-[#00C471]"
            />
            <Button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#00C471] hover:bg-[#00B366] rounded-md h-10"
            >
              검색
            </Button>
          </div>

          {/* Quick Tags */}
          {!searchQuery && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-sm text-gray-500">추천 검색어:</span>
              {["React", "Python", "디자인", "AI", "데이터분석", "Node.js", "SQL"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSearchChange(tag)}
                  className="px-3 py-1.5 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
