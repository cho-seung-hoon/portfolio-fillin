import { useState } from "react";
import { InfLearnHeader } from "./InfLearnHeader";
import { MyPageSidebar } from "./MyPageSidebar";
import { MyPageHome } from "./MyPageHome";
import { ScheduleManagement } from "./ScheduleManagement";
import { ReviewManagement } from "./ReviewManagement";
import { ProfileManagement } from "./ProfileManagement";
import { ProjectFooter } from "./ProjectFooter";

interface MyPageProps {
  user: { email: string; name: string };
  onLoginClick: () => void;
  onLogout: () => void;
  onNavigateToMain: () => void;
  onNavigateToServiceRegistration?: () => void;
}

export function MyPage({ user, onLoginClick, onLogout, onNavigateToMain, onNavigateToServiceRegistration }: MyPageProps) {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <InfLearnHeader
        user={user}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
        onNavigateToMyPage={() => { }}
        onNavigateToMain={onNavigateToMain}
        onNavigateToServiceRegistration={onNavigateToServiceRegistration}
      />

      <div className="flex flex-1">
        <MyPageSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 bg-gray-50">
          {activeTab === "home" && <MyPageHome userName={user.name} onTabChange={setActiveTab} />}
          {activeTab === "coupons" && (
            <div className="p-8">
              <h2 className="text-2xl mb-4">내 쿠폰</h2>
              <div className="bg-white rounded-lg p-8 text-center text-gray-400">
                보유한 쿠폰이 없습니다.
              </div>
            </div>
          )}
          {activeTab === "schedule" && <ScheduleManagement />}
          {activeTab === "payment" && (
            <div className="p-8">
              <h2 className="text-2xl mb-4">결제 내역</h2>
              <div className="bg-white rounded-lg p-8 text-center text-gray-400">
                결제 내역이 없습니다.
              </div>
            </div>
          )}
          {activeTab === "reviews" && <ReviewManagement />}
          {activeTab === "profile" && <ProfileManagement />}
        </main>
      </div>

      <ProjectFooter />
    </div>
  );
}