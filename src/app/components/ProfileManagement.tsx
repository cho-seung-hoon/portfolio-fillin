import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Skeleton } from "./ui/skeleton";
// import { cn } from "./ui/utils"; // Removed if unused, but let's check if used elsewhere. 
// Assuming cn is unused based on replacement.
import { Camera, User as UserIcon } from "lucide-react";
import { profileService } from "../../api/profile";
import { categoryService } from "../../api/category";
import { useAuthStore } from "../../stores/authStore";
import { CategoryResponseDto } from "../../api/types";

export function ProfileManagement() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<"basic" | "introduction">("basic");

  // Local state for edit inputs (Draft state) only
  const [editNickname, setEditNickname] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Other fields state
  const [introduction, setIntroduction] = useState("");
  const [category, setCategory] = useState<CategoryResponseDto | null>(null);
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const [phone, setPhone] = useState("");

  // UI States
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingIntroduction, setIsEditingIntroduction] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);



  // Initialize draft state when editing starts
  const startEditingNickname = () => {
    setEditNickname(user?.name || "");
    setIsEditingNickname(true);
  };

  const startEditingPhone = () => {
    setEditPhone(phone);
    setIsEditingPhone(true);
  };

  // Sync profile data on mount to ensure store is fresh
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const data = await profileService.getMyProfile();
        if (data.nickname !== user.name) {
          useAuthStore.getState().updateName(data.nickname);
        }
        if (data.category && data.category.name.trim() !== "") {
          setCategory(data.category);
        }
        setIntroduction(data.introduction ?? "");
        setPhone(data.phoneNum ?? "");
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        console.log("Fetched categories:", data);
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchProfile();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateNickname = async () => {
    try {
      setLoading(true);
      await profileService.updateNickname(editNickname);
      // Update Global Store
      useAuthStore.getState().updateName(editNickname);
      setIsEditingNickname(false);
      alert("닉네임이 수정되었습니다.");
    } catch (error) {
      console.error("Failed to update nickname:", error);
      alert("닉네임 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIntroduction = async () => {
    if (!category) {
      alert("카테고리를 선택해주세요.");
      return;
    }
    try {
      await profileService.updateIntroduction(introduction, category.categoryId);
      setIsEditingIntroduction(false);
      alert("자기소개와 카테고리가 수정되었습니다.");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("수정에 실패했습니다.");
    }
  };

  if (!user) return null; // Should be handled by parent active/auth check

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl">프로필 정보</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("basic")}
            className={`pb-2 transition-colors relative ${activeTab === "basic"
              ? "text-[#00C471] font-medium"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            기본정보
            {activeTab === "basic" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C471]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("introduction")}
            className={`pb-2 transition-colors relative ${activeTab === "introduction"
              ? "text-[#00C471] font-medium"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            자기소개
            {activeTab === "introduction" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C471]" />
            )}
          </button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          {activeTab === "basic" ? (
            <div className="space-y-8">
              <h3 className="text-xl">기본정보</h3>

              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#00C471] to-[#00B366] flex items-center justify-center">
                    <UserIcon className="size-16 text-white" />
                  </div>
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200 hover:border-[#00C471] transition-colors">
                    <Camera className="size-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Nickname: Use store state */}
              <div className="flex items-center justify-between py-4 border-b">
                <div className="flex items-center gap-8 flex-1">
                  <label className="text-gray-600 w-24">닉네임</label>
                  {isEditingNickname ? (
                    <Input
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      className="max-w-md"
                      autoFocus
                    />
                  ) : (
                    <span>{user.name}</span>
                  )}
                </div>
                {isEditingNickname ? (
                  <Button
                    onClick={handleUpdateNickname}
                    disabled={loading}
                    className="bg-[#00C471] hover:bg-[#00B366]"
                  >
                    {loading ? "저장 중..." : "저장"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={startEditingNickname}
                  >
                    수정
                  </Button>
                )}
              </div>

              {/* Email */}
              <div className="flex items-center py-4 border-b">
                <div className="flex items-center gap-8 flex-1">
                  <label className="text-gray-600 w-24">계정 이메일</label>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">●</span>
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between py-4 border-b">
                <div className="flex items-center gap-8 flex-1">
                  <label className="text-gray-600 w-24">연락처</label>
                  {isEditingPhone ? (
                    <Input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="max-w-md"
                      autoFocus
                    />
                  ) : (
                    isLoadingProfile ? (
                      <Skeleton className="h-6 w-32" />
                    ) : (
                      <span>{phone || "연락처 정보 없음"}</span>
                    )
                  )}
                </div>
                {isEditingPhone ? (
                  <Button
                    onClick={() => setIsEditingPhone(false)}
                    className="bg-[#00C471] hover:bg-[#00B366]"
                  >
                    저장
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={startEditingPhone}
                  >
                    수정
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <h3 className="text-xl">자기소개</h3>

              {/* Category */}
              <div className="space-y-3">
                <label className="text-gray-600">카테고리</label>
                <div className="flex flex-col gap-2">
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={category?.name || ""}
                    onChange={(e) => {
                      const selected = categories.find((c) => c.name === e.target.value);
                      if (selected) {
                        setCategory(selected);
                        console.log("Category selected:", selected);
                      }
                    }}
                  >
                    <option value="" disabled>
                      카테고리를 선택하세요
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.categoryId} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500">
                    * 전문 분야를 선택해주세요.
                  </p>
                </div>
              </div>

              {/* Introduction */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-gray-600">간단한 소개</label>
                  {!isLoadingProfile && (
                    isEditingIntroduction ? (
                      <Button
                        onClick={handleUpdateIntroduction}
                        className="bg-[#00C471] hover:bg-[#00B366]"
                        size="sm"
                      >
                        저장
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setIsEditingIntroduction(true)}
                        size="sm"
                      >
                        수정
                      </Button>
                    )
                  )}
                </div>
                {isLoadingProfile ? (
                  <Skeleton className="w-full h-[300px] rounded-lg" />
                ) : isEditingIntroduction ? (
                  <Textarea
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                    className="min-h-[300px]"
                    placeholder="자신을 간단히 소개해주세요"
                  />
                ) : (
                  <p className="text-gray-700 bg-gray-50 p-6 rounded-lg min-h-[300px] whitespace-pre-wrap">
                    {introduction || "자기소개가 없습니다."}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleUpdateIntroduction}
                  className="bg-[#00C471] hover:bg-[#00B366]"
                  disabled={isLoadingProfile}
                >
                  자기소개 저장
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
