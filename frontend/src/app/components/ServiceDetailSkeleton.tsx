import { Skeleton } from "./ui/skeleton";
import { Card, CardContent } from "./ui/card";

export function ServiceDetailSkeleton() {
    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            {/* 헤더 스켈레톤 */}
            <div className="bg-white border-b border-[#E5E7EB]">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Skeleton className="h-6 w-24" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 메인 컨텐츠 영역 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 상단: 멘토 프로필 & 서비스 정보 */}
                        <Card>
                            <CardContent className="p-0 overflow-hidden">
                                {/* 썸네일 이미지 */}
                                <Skeleton className="w-full aspect-video md:aspect-[21/9]" />

                                <div className="p-6">
                                    {/* 프로필 섹션 */}
                                    <div className="flex items-start gap-4 mb-6">
                                        <Skeleton className="size-20 rounded-full flex-shrink-0" />
                                        <div className="flex-1 space-y-2 py-2">
                                            <Skeleton className="h-6 w-32" />
                                            <Skeleton className="h-4 w-full max-w-md" />
                                        </div>
                                    </div>

                                    {/* 제목 및 정보 섹션 */}
                                    <div className="border-t border-gray-200 pt-6 space-y-4">
                                        <Skeleton className="h-8 w-3/4" />
                                        <div className="flex gap-4">
                                            <Skeleton className="h-5 w-24" />
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-6 w-20 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 중반: 탭 메뉴 및 컨텐츠 */}
                        <Card>
                            <CardContent className="p-0">
                                {/* 탭 헤더 */}
                                <div className="border-b border-gray-200">
                                    <div className="flex">
                                        <div className="flex-1 px-6 py-4">
                                            <Skeleton className="h-6 w-24 mx-auto" />
                                        </div>
                                        <div className="flex-1 px-6 py-4">
                                            <Skeleton className="h-6 w-16 mx-auto" />
                                        </div>
                                    </div>
                                </div>

                                {/* 탭 컨텐츠 (설명 영역 시뮬레이션) */}
                                <div className="p-6 space-y-4">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                    <Skeleton className="h-4 w-full" />
                                    <div className="pt-4 space-y-4">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-4/5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 하단: 리뷰 섹션 스켈레톤 */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <Skeleton className="h-7 w-32" />
                                    <Skeleton className="h-7 w-24" />
                                </div>
                                <div className="space-y-6">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="flex items-start gap-3 pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                                            <Skeleton className="size-10 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between">
                                                    <Skeleton className="h-5 w-24" />
                                                    <Skeleton className="h-4 w-20" />
                                                </div>
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-3/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 우측 사이드바 스켈레톤 */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4">
                            <Card>
                                <CardContent className="p-6 space-y-6">
                                    {/* 가격 정보 */}
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <div className="flex items-baseline gap-2">
                                            <Skeleton className="h-9 w-40" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    </div>

                                    {/* 버튼 */}
                                    <Skeleton className="h-14 w-full rounded-md" />

                                    {/* 추가 정보 리스트 */}
                                    <div className="space-y-3 pt-2">
                                        <Skeleton className="h-5 w-full" />
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-5 w-5/6" />
                                    </div>

                                    {/* 장점 리스트 */}
                                    <div className="pt-6 border-t border-gray-200 space-y-3">
                                        <Skeleton className="h-6 w-32 mb-2" />
                                        <Skeleton className="h-5 w-full" />
                                        <Skeleton className="h-5 w-full" />
                                        <Skeleton className="h-5 w-full" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
