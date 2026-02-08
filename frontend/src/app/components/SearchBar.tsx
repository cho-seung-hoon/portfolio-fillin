import { Search } from "lucide-react";
import { Input } from "./ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
        <Input
          type="text"
          placeholder="상품을 검색해보세요..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-12 h-12 rounded-full"
        />
      </div>
    </div>
  );
}
