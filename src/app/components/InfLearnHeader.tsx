import { Search, User, ShoppingBag, ChevronDown, Menu } from "lucide-react";
import { Button } from "./ui/button";

export function InfLearnHeader() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <h1 className="text-2xl text-[#00C471]">인프런</h1>
            
            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-6">
              <button className="flex items-center gap-1 hover:text-[#00C471] transition-colors">
                강의
                <ChevronDown className="size-4" />
              </button>
              <a href="#" className="hover:text-[#00C471] transition-colors">
                로드맵
              </a>
              <a href="#" className="hover:text-[#00C471] transition-colors">
                멘토링
              </a>
              <a href="#" className="hover:text-[#00C471] transition-colors">
                커뮤니티
              </a>
              <a href="#" className="hover:text-[#00C471] transition-colors">
                인프런
              </a>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="size-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <ShoppingBag className="size-5" />
            </Button>
            <Button variant="outline" className="hidden sm:flex">
              로그인
            </Button>
            <Button className="hidden sm:flex bg-[#00C471] hover:bg-[#00B368]">
              회원가입
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
