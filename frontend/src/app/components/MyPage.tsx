
import { useNavigate } from "@tanstack/react-router"; // Import useNavigate
import { useAuthStore } from "../../stores/authStore"; // Import useAuthStore
import { ProjectHeader } from "./ProjectHeader";
import { MyPageSidebar } from "./MyPageSidebar";
import { MyPageHome } from "./MyPageHome";
import { ScheduleManagement } from "./ScheduleManagement";
import { ReviewManagement } from "./ReviewManagement";
import { ProfileManagement } from "./ProfileManagement";
import { LessonManagement } from "./LessonManagement";
import { ProjectFooter } from "./ProjectFooter";

interface MyPageProps {
  currentTab: string;
}

export function MyPage({ currentTab = "home" }: MyPageProps) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  // RequiredAuth wrapper guarantees user is present, but for TS correctness we can handle it or assume it.
  // Since we are inside RequiredAuth, user should not be null.
  if (!user) return null;

  const handleTabChange = (tab: string) => {
    navigate({ to: "/mypage", search: { tab } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ProjectHeader
        onLoginClick={() => { }} // User is logged in, so this is no-op or we can hide logic inside header
        onSignupClick={() => { }}
        onNavigateToMyPage={() => { }}
        onNavigateToMain={() => navigate({ to: "/" })}
        onNavigateToServiceRegistration={() => navigate({ to: "/service/register" })}
      />

      <div className="flex flex-1">
        <MyPageSidebar activeTab={currentTab} onTabChange={handleTabChange} />

        <main className="flex-1 bg-gray-50 min-w-0">
          {currentTab === "home" && <MyPageHome userName={user.name} onTabChange={handleTabChange} />}
          {currentTab === "lessons" && <LessonManagement />}
          {currentTab === "coupons" && (
            <div className="p-8">
              <h2 className="text-2xl mb-4">내 쿠폰</h2>
              <div className="bg-white rounded-lg p-8 text-center text-gray-400">
                보유한 쿠폰이 없습니다.
              </div>
            </div>
          )}
          {currentTab === "schedule" && <ScheduleManagement />}
          {currentTab === "payment" && (
            <div className="p-8">
              <h2 className="text-2xl mb-4">결제 내역</h2>
              <div className="bg-white rounded-lg p-8 text-center text-gray-400">
                결제 내역이 없습니다.
              </div>
            </div>
          )}
          {currentTab === "reviews" && <ReviewManagement />}
          {currentTab === "profile" && <ProfileManagement />}
        </main>
      </div>

      <ProjectFooter />
    </div>
  );
}
