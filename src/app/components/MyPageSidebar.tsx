import {
  Home,
  FileText,
  Calendar,
  CreditCard,
  Star,
  User,
  BookOpen,
} from "lucide-react";

interface MyPageSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: "home", label: "마이 홈", icon: Home },
  { id: "lessons", label: "내 레슨", icon: BookOpen },
  // { id: "coupons", label: "내 쿠폰", icon: FileText },
  { id: "schedule", label: "스케줄 관리", icon: Calendar },
  // { id: "payment", label: "결제 내역", icon: CreditCard },
  { id: "reviews", label: "리뷰 및 평점", icon: Star },
  { id: "profile", label: "프로필 정보", icon: User },
];

export function MyPageSidebar({
  activeTab,
  onTabChange,
}: MyPageSidebarProps) {
  return (
    <aside className="w-56 bg-white border-r min-h-screen p-4 shrink-0">
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors
                ${isActive
                  ? "bg-[#00C471] text-white"
                  : "text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              <Icon
                className={`size-5 ${isActive ? "" : "text-gray-400"}`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}