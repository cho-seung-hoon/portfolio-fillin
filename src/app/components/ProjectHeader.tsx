import {
  Search,
  User,
  ShoppingBag,
  ChevronDown,
  Menu,
  Bell,
  LogOut,
  Settings,
  BookOpen,
  Heart,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";
import { useAuthStore } from "../../stores/authStore";
import { handleLogout } from "../../utils/auth-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import { getImageUrl } from "../../utils/image";

interface ProjectHeaderProps {
  onLoginClick: () => void;
  onSignupClick?: () => void;
  onNavigateToMyPage?: () => void;
  onNavigateToMain?: () => void;
  onNavigateToServiceRegistration?: () => void;
}

export function ProjectHeader({
  onLoginClick,
  onSignupClick,
  onNavigateToMyPage,
  onNavigateToMain,
  onNavigateToServiceRegistration,
}: ProjectHeaderProps) {
  const user = useAuthStore((state) => state.user);
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <img
              src={getImageUrl("logo.png")}
              alt="logo"
              className="h-12 w-auto cursor-pointer"
              onClick={onNavigateToMain}
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button
                  className="bg-[#00C471] hover:bg-[#00B366] gap-2"
                  onClick={onNavigateToServiceRegistration}
                >
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">
                    서비스 등록
                  </span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="gap-2 hidden sm:flex items-center hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 h-9 px-4 py-2 rounded-md text-sm font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    >
                      <Avatar className="size-7">
                        {user.profileImageUrl ? (
                          <AvatarImage
                            src={getImageUrl(user.profileImageUrl)}
                            alt={user.name}
                          />
                        ) : (
                          <AvatarImage src="" />
                        )}
                        <AvatarFallback className="bg-[#00C471] text-white text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                      <ChevronDown className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56"
                  >
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {user.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {user.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onNavigateToMyPage}
                    >
                      <User className="size-4 mr-2" />
                      마이페이지
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
                      <LogOut className="size-4 mr-2" />
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="hidden sm:flex"
                  onClick={onLoginClick}
                >
                  로그인
                </Button>
                <Button
                  className="hidden sm:flex bg-[#00C471] hover:bg-[#00B368]"
                  onClick={onSignupClick}
                >
                  회원가입
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}