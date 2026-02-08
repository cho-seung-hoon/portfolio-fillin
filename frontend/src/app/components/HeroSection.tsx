import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-[#E8F8F3] to-[#F0FBF7] py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl mb-4">
            지식을 나누고 함께 성장하는
            <br />
            <span className="text-[#00C471]">온라인 학습 플랫폼</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            프로그래밍, 디자인, 마케팅 등 원하는 분야를 배우고 성장하세요
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              type="text"
              placeholder="배우고 싶은 지식을 검색해보세요"
              className="pl-14 h-14 text-lg rounded-lg border-2 focus:border-[#00C471]"
            />
            <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#00C471] hover:bg-[#00B366] rounded-md h-10">
              검색
            </Button>
          </div>

          {/* Quick Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="text-sm text-gray-500">인기 검색어:</span>
            {["React", "Python", "디자인", "AI", "데이터분석"].map((tag) => (
              <button
                key={tag}
                className="px-4 py-1.5 text-sm bg-white rounded-md hover:bg-gray-50 border"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}