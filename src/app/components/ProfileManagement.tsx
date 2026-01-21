import React, { useState, useEffect } from "react";
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
import { getImageUrl } from "../../utils/image";

export function ProfileManagement() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<"basic" | "introduction">("basic");

  // Local state for edit inputs (Draft state) only
  const [editNickname, setEditNickname] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editIntroduction, setEditIntroduction] = useState("");

  // Other fields state
  const [introduction, setIntroduction] = useState("");
  const [category, setCategory] = useState<CategoryResponseDto | null>(null);
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [phone, setPhone] = useState("");

  // UI States
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingIntroduction, setIsEditingIntroduction] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);



  // Initialize draft state when editing starts
  const startEditingNickname = () => {
    setEditNickname(user?.name || "");
    setIsEditingNickname(true);
  };

  const startEditingPhone = () => {
    setEditPhone(phone);
    setIsEditingPhone(true);
  };

  const startEditingIntroduction = () => {
    setEditIntroduction(introduction);
    setIsEditingIntroduction(true);
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
        if (data.category) {
          const categoryName = data.category.name?.trim() === "" ? "태그 없음" : data.category.name;
          setCategory({ ...data.category, name: categoryName });
        }
        if (data.phoneNum) {
          setPhone(data.phoneNum);
        }
        if (data.imageUrl) {
          const fullImageUrl = getImageUrl(data.imageUrl);
          setProfileImage(fullImageUrl);
          // Sync with global store
          useAuthStore.getState().updateProfileImage(data.imageUrl);
        } else {
          setProfileImage(null);
          useAuthStore.getState().updateProfileImage(null);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    const syncCategorySelection = (categoryList: CategoryResponseDto[], selected?: CategoryResponseDto | null) => {
      const target = selected ?? category;
      if (!target) return;
      const found = categoryList.find((c) => c.categoryId === target.categoryId);
      if (!found) return;
      if (found.parentCategoryId) {
        setSelectedParentId(found.parentCategoryId);
        setSelectedChildId(found.categoryId);
      } else {
        setSelectedParentId(found.categoryId);
        setSelectedChildId(null);
      }
    };

    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        if (!data) return;

        const normalized = data
          .map((cat: CategoryResponseDto) => ({
            ...cat,
            name: (!cat.name || cat.name.trim() === "") ? "태그 없음" : cat.name,
          }))
          .sort((a, b) => {
            if (a.name === "태그 없음") return -1;
            if (b.name === "태그 없음") return 1;
            return (a.name || "").localeCompare(b.name || "");
          });

        setCategories(normalized);
        syncCategorySelection(normalized, category);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchProfile();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!categories.length || !category) return;
    const found = categories.find((c) => c.categoryId === category.categoryId);
    if (!found) return;
    if (found.parentCategoryId) {
      setSelectedParentId(found.parentCategoryId);
      setSelectedChildId(found.categoryId);
    } else {
      setSelectedParentId(found.categoryId);
      setSelectedChildId(null);
    }
  }, [categories, category]);

  const majorCategories = categories.filter(
    (cat) => cat.parentCategoryId === null && cat.name.trim() !== ""
  );

  const minorCategories = categories.filter(
    (cat) => selectedParentId !== null && cat.parentCategoryId === selectedParentId
  );

  const handleParentChange = (value: string) => {
    const parentId = Number(value);
    setSelectedParentId(parentId);
    const firstChild = categories.find((cat) => cat.parentCategoryId === parentId);
    if (firstChild) {
      setSelectedChildId(firstChild.categoryId);
      setCategory(firstChild);
    } else {
      const parent = categories.find((cat) => cat.categoryId === parentId);
      if (parent) setCategory(parent);
      setSelectedChildId(null);
    }
  };

  const handleChildChange = (value: string) => {
    const childId = Number(value);
    setSelectedChildId(childId);
    const child = categories.find((cat) => cat.categoryId === childId);
    if (child) setCategory(child);
  };

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

  const handleUpdatePhone = async () => {
    const phoneRegex = /^[0-9-]+$/;
    if (!phoneRegex.test(editPhone)) {
      alert("전화번호는 숫자와 하이픈만 입력 가능합니다.");
      return;
    }

    try {
      setLoading(true);
      await profileService.updatePhoneNum(editPhone);
      setPhone(editPhone);
      setIsEditingPhone(false);
      alert("연락처가 수정되었습니다.");
    } catch (error) {
      console.error("Failed to update phone number:", error);
      alert("연락처 수정에 실패했습니다.");
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
      setLoading(true);
      await profileService.updateIntroduction(editIntroduction, category.categoryId);
      setIntroduction(editIntroduction);
      setIsEditingIntroduction(false);
      alert("자기소개와 카테고리가 수정되었습니다.");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      await profileService.updateProfileImage(file);

      // Fetch latest profile to get the new image URL and sync with store
      const data = await profileService.getMyProfile();
      if (data.imageUrl) {
        const fullImageUrl = getImageUrl(data.imageUrl);
        setProfileImage(fullImageUrl);
        useAuthStore.getState().updateProfileImage(data.imageUrl);
      }

      alert("프로필 이미지가 수정되었습니다.");
    } catch (error) {
      console.error("Failed to update profile image:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

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
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#00C471] to-[#00B366] flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="size-16 text-white" />
                    )}
                  </div>
                  <input
                    type="file"
                    id="profile-image-input"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <button
                    onClick={() => document.getElementById("profile-image-input")?.click()}
                    disabled={loading}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200 hover:border-[#00C471] transition-colors"
                  >
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
                    <span className="text-gray-400">●</span>
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
                    onClick={handleUpdatePhone}
                    disabled={loading}
                    className="bg-[#00C471] hover:bg-[#00B366]"
                  >
                    {loading ? "저장 중..." : "저장"}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm text-gray-600">대분류</label>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedParentId ?? ""}
                      onChange={(e) => handleParentChange(e.target.value)}
                    >
                      <option value="" disabled>
                        대분류를 선택하세요
                      </option>
                      {majorCategories.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-gray-600">소분류</label>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedChildId ?? ""}
                      onChange={(e) => handleChildChange(e.target.value)}
                      disabled={!minorCategories.length}
                    >
                      <option value="" disabled>
                        {minorCategories.length ? "소분류를 선택하세요" : "대분류를 먼저 선택"}
                      </option>
                      {minorCategories.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  * 전문 분야를 선택해주세요.
                </p>
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
                        onClick={startEditingIntroduction}
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
                    value={editIntroduction}
                    onChange={(e) => setEditIntroduction(e.target.value)}
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
