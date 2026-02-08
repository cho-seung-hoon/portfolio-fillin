
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ChevronLeft } from "lucide-react";

export function LessonApplicationSkeleton({ onBack }: { onBack: () => void }) {
    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            {/* 헤더 */}
            <div className="bg-white border-b border-[#E5E7EB]">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ChevronLeft className="size-5" />
                        돌아가기
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 메인 컨텐츠 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 레슨 정보 스켈레톤 */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="h-7 w-24 bg-gray-200 rounded mb-4 animate-pulse" />
                                <div className="flex items-start gap-4">
                                    <div className="size-16 bg-gray-200 rounded-full animate-pulse" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 일정 선택 스켈레톤 */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="h-7 w-24 bg-gray-200 rounded mb-4 animate-pulse" />
                                <div className="space-y-4">
                                    {/* 옵션 버튼 흉내 */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                                        <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                                    </div>
                                    {/* 캘린더 영역 흉내 */}
                                    <div className="h-64 bg-gray-100 rounded-lg animate-pulse mt-4" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* 요청사항 스켈레톤 */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="h-7 w-24 bg-gray-200 rounded mb-4 animate-pulse" />
                                <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* 오른쪽 사이드바 (결제 정보) 스켈레톤 */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="h-6 w-24 bg-gray-200 rounded mb-4 animate-pulse" />

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between">
                                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 mb-6">
                                        <div className="flex justify-between items-center">
                                            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    </div>

                                    <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
                                </CardContent>
                            </Card>

                            <div className="h-4 w-48 mx-auto bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
