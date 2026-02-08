import { Search, User, Heart, ShoppingBag, Menu } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="size-5" />
            </Button>
            <h1 className="text-xl">SHOP</h1>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#" className="hover:text-gray-600 transition-colors">
              신상품
            </a>
            <a href="#" className="hover:text-gray-600 transition-colors">
              베스트
            </a>
            <a href="#" className="hover:text-gray-600 transition-colors">
              세일
            </a>
            <a href="#" className="hover:text-gray-600 transition-colors">
              브랜드
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="size-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="size-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Heart className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="size-5" />
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full size-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
