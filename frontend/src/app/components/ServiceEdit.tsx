import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
    ArrowLeft,
    Save,
    MapPin,
    Calendar as CalendarIcon,
    Tag,
    Image,
    Upload,
    Users
} from "lucide-react";
import { getImageUrl } from "../../utils/image";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "./ui/dialog";

import { ServiceTypeSelectionSection } from "./service-registration/ServiceTypeSelectionSection";
import { OneDayClassSection } from "./service-registration/OneDayClassSection";
import { StudySessionSection } from "./service-registration/StudySessionSection";
import { MentoringSection } from "./service-registration/MentoringSection";

// Stores
import { useStudyRegistrationStore } from "../../store/useStudyRegistrationStore";
import { useMentoringRegistrationStore } from "../../store/useMentoringRegistrationStore";
import { useOneDayRegistrationStore } from "../../store/useOneDayRegistrationStore";
import { useLessonFormStore } from "../../store/useLessonFormStore";

// API
import { categoryService } from "../../api/category";
import { lessonService } from "../../api/lesson";
import { serviceDetailService } from "../../api/serviceDetail";
import { CategoryResponseDto } from "../../api/types";
import { LessonDetail } from "../../types/lesson";

interface ServiceEditProps {
    lessonId: string;
    onBack: () => void;
}

export function ServiceEdit({
    lessonId,
    onBack,
}: ServiceEditProps) {
    // Basic Info Store
    const {
        title, setTitle,
        description, setDescription,
        location, setLocation,
        closeAt, setCloseAt,
        lessonType, setLessonType,
        categoryId, setCategoryId,
        thumbnailImage, thumbnailPreview, setThumbnail, setThumbnailPreview,
        reset: resetLessonForm
    } = useLessonFormStore();

    // Specific Stores
    const {
        mentoringOptions,
        availableTimeList: mentoringTimeList,
        setMentoringOptions,
        setAvailableTimeList: setMentoringTimeList,
        reset: resetMentoring
    } = useMentoringRegistrationStore();

    const {
        availableTimeList: oneDayTimeList,
        setAvailableTimeList: setOneDayTimeList,
        reset: resetOneDay
    } = useOneDayRegistrationStore();

    const {
        price, seats,
        availableTimeList: studyTimeList,
        setPrice, setSeats,
        setAvailableTimeList: setStudyTimeList,
        reset: resetStudy
    } = useStudyRegistrationStore();

    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setThumbnail(e.target.files[0]);
        }
    };

    // Fetch Categories and Lesson Detail
    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                // Fetch Categories
                const categoryData = await categoryService.getCategories();
                setCategories(categoryData);

                // Fetch Lesson Detail
                const detail = await serviceDetailService.getServiceDetail(lessonId);
                if (detail) {
                    populateStores(detail);
                } else {
                    alert("레슨 정보를 불러오는데 실패했습니다.");
                    onBack();
                }
            } catch (error) {
                console.error("Failed to initialize edit page:", error);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [lessonId]);

    const populateStores = (detail: LessonDetail) => {
        // Basic Form Store
        setTitle(detail.title);
        setDescription(detail.description);
        setLocation(detail.location || "");
        setCategoryId(detail.categoryId);
        setCloseAt(detail.closeAt || null); // Assuming closeAt is in domain model or adapted

        // Map serviceType
        const typeMap: Record<string, string> = {
            "mentoring": "1-1-mentoring",
            "oneday": "1-n-oneday",
            "study": "1-n-study"
        };
        const st = detail.serviceType || "mentoring";
        setLessonType(typeMap[st] || "1-1-mentoring");

        // Set thumbnail preview
        if (detail.thumbnail) {
            setThumbnailPreview(detail.thumbnail);
        }

        if (detail.serviceType === "mentoring") {
            // Options: De-flattening isn't strictly necessary if we just want it to work,
            // but for a good UX, we should try.
            // For now, let's just map each option to one ServiceOption.
            const options = detail.options.map(opt => ({
                id: opt.id,
                name: opt.name,
                priceOptions: [{
                    id: opt.id + "_price",
                    duration: opt.minute.toString(),
                    price: opt.price.toString()
                }]
            }));
            setMentoringOptions(options);

            if (detail.schedules["1-1"]?.rawAvailableTimes) {
                setMentoringTimeList(detail.schedules["1-1"].rawAvailableTimes.map(at => ({
                    startTime: at.startTime,
                    endTime: at.endTime,
                    price: at.price,
                    seats: 1
                })));
            }
        } else if (detail.serviceType === "oneday") {
            if (detail.schedules["1-n-oneday"]?.sessions) {
                setOneDayTimeList(detail.schedules["1-n-oneday"].sessions.map(s => ({
                    startTime: s.startTime,
                    endTime: s.startTime, // Need end time from somewhere or mock
                    price: s.price || detail.price,
                    seats: s.maxSeats
                })));
            }
        } else if (detail.serviceType === "study") {
            setPrice(detail.price);
            if (detail.schedules["1-n-study"]) {
                setSeats(detail.schedules["1-n-study"].maxSeats);
                // Sessions for study normally don't have individual prices in DTO
                setStudyTimeList(detail.schedules["1-n-study"].sessions.map(s => ({
                    startTime: s.date + "T" + s.time.split("-")[0] + ":00Z", // Simplified mockup
                    endTime: s.date + "T" + s.time.split("-")[1] + ":00Z",
                    price: 0,
                    seats: 0
                })));
            }
        }
    };

    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showOneDayModal, setShowOneDayModal] = useState(false);
    const [showStudyModal, setShowStudyModal] = useState(false);

    const toLocalISOString = (dateStr: string, timeStr: string) => {
        const localDate = new Date(`${dateStr}T${timeStr}`);
        return localDate.toISOString();
    };

    const resetAllStores = () => {
        resetLessonForm();
        resetMentoring();
        resetOneDay();
        resetStudy();
    };

    const handleCancel = () => {
        if (window.confirm("수정 중인 내용이 삭제됩니다. 정말 취소하시겠습니까?")) {
            resetAllStores();
            onBack();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const requestDTO = {
                title,
                description,
                location,
                categoryId,
                closeAt: closeAt || null,
            };

            await lessonService.updateLesson(lessonId, requestDTO, thumbnailImage || undefined);
            alert("서비스가 성공적으로 수정되었습니다.");
            onBack();
        } catch (error) {
            console.error("Failed to update lesson:", error);
            alert("서비스 수정에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = () => {
        return !!(title && description && categoryId && closeAt);
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="rounded-md"
                        >
                            <ArrowLeft className="size-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl">서비스 수정</h1>
                            <p className="text-gray-600 mt-1">
                                등록한 정보를 수정하여 최신 상태로 유지하세요
                            </p>
                        </div>
                    </div>

                    <form className="space-y-6">
                        {/* 기본 정보 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>기본 정보</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* 서비스 제목 */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">서비스 제목</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="예: React 완벽 가이드 1:1 멘토링"
                                        required
                                    />
                                </div>

                                {/* 서비스 내용 */}
                                <div className="space-y-2">
                                    <Label htmlFor="content">서비스 내용</Label>
                                    <Textarea
                                        id="content"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="서비스 상세 설명..."
                                        className="min-h-[200px]"
                                        required
                                    />
                                </div>

                                {/* 위치 (Location) */}
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="flex items-center gap-2">
                                        <MapPin className="size-4" />
                                        진행 장소
                                    </Label>
                                    <Input
                                        id="location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="예: 강남역 인근 카페 / 온라인 (Zoom)"
                                    />
                                </div>

                                {/* 카테고리 (Category) */}
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="flex items-center gap-2">
                                        <Tag className="size-4" />
                                        카테고리
                                    </Label>
                                    <Select
                                        value={categoryId.toString()}
                                        onValueChange={(val) => setCategoryId(Number(val))}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="카테고리 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.categoryId} value={cat.categoryId.toString()}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 마감일 (Deadline) */}
                                <div className="space-y-2">
                                    <Label htmlFor="closeAt" className="flex items-center gap-2">
                                        <CalendarIcon className="size-4" />
                                        모집 마감일
                                    </Label>
                                    <Input
                                        id="closeAt"
                                        type="date"
                                        value={closeAt ? new Date(closeAt).toLocaleDateString('en-CA') : ''}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setCloseAt(toLocalISOString(e.target.value, "23:59:59"));
                                            } else {
                                                setCloseAt(null);
                                            }
                                        }}
                                    />
                                </div>

                                {/* 썸네일 이미지 (Thumbnail) */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Image className="size-4" />
                                        썸네일 이미지
                                    </Label>
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`relative w-40 h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors ${thumbnailPreview ? 'border-transparent' : 'border-gray-300'}`}
                                            onClick={() => document.getElementById('thumbnail-upload')?.click()}
                                        >
                                            {thumbnailPreview ? (
                                                <img
                                                    src={getImageUrl(thumbnailPreview)}
                                                    alt="Thumbnail Preview"
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="text-center text-gray-400">
                                                    <Upload className="size-6 mx-auto mb-1" />
                                                    <span className="text-xs">이미지 업로드</span>
                                                </div>
                                            )}
                                            <input
                                                id="thumbnail-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            <p>새 이미지를 올리면 기존 이미지가 교체됩니다.</p>
                                            <p className="text-xs mt-1 text-gray-400">권장 사이즈: 1200x630px (JPG, PNG)</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 서비스 종류 표시 (수정 불가) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>서비스 종류</CardTitle>
                                <CardDescription>서비스 종류는 등록 후 수정할 수 없습니다.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {(() => {
                                    const typeInfoMap: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
                                        "1-1-mentoring": {
                                            label: "1:1 멘토링",
                                            icon: Users,
                                            color: "text-blue-600",
                                            bgColor: "bg-blue-50",
                                        },
                                        "1-n-oneday": {
                                            label: "1:N 원데이",
                                            icon: CalendarIcon,
                                            color: "text-purple-600",
                                            bgColor: "bg-purple-50",
                                        },
                                        "1-n-study": {
                                            label: "1:N 스터디",
                                            icon: Tag,
                                            color: "text-green-600",
                                            bgColor: "bg-green-50",
                                        }
                                    };
                                    const info = typeInfoMap[lessonType] || typeInfoMap["1-1-mentoring"];
                                    const Icon = info.icon;
                                    return (
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${info.bgColor} ${info.color} border border-current font-medium`}>
                                            <Icon className="size-5" />
                                            <span>{info.label}</span>
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>

                        {/* 1:1 멘토링 관리 (옵션/일정 분리) */}
                        {lessonType === "1-1-mentoring" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>멘토링 관리</CardTitle>
                                    <CardDescription>
                                        멘토링 옵션과 가능한 시간 일정은 개별 관리 버튼을 통해 수정할 수 있습니다.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-24 flex flex-col gap-2 hover:border-[#00C471] hover:text-[#00C471] transition-all"
                                        onClick={() => setShowOptionsModal(true)}
                                    >
                                        <Tag className="size-6" />
                                        <div className="text-center">
                                            <div className="font-bold">옵션 관리</div>
                                            <div className="text-xs text-gray-500 font-normal">시간별 가격 및 옵션 설정</div>
                                        </div>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-24 flex flex-col gap-2 hover:border-[#00C471] hover:text-[#00C471] transition-all"
                                        onClick={() => setShowScheduleModal(true)}
                                    >
                                        <CalendarIcon className="size-6" />
                                        <div className="text-center">
                                            <div className="font-bold">일정 관리</div>
                                            <div className="text-xs text-gray-500 font-normal">상담 가능한 시간대 설정</div>
                                        </div>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* 1:N 원데이 관리 */}
                        {lessonType === "1-n-oneday" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>원데이 클래스 일정 관리</CardTitle>
                                    <CardDescription>
                                        원데이 클래스 기간 및 회차별 정보는 개별 관리 버튼을 통해 수정할 수 있습니다.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-24 flex flex-col gap-2 hover:border-[#00C471] hover:text-[#00C471] transition-all"
                                        onClick={() => setShowOneDayModal(true)}
                                    >
                                        <CalendarIcon className="size-6" />
                                        <div className="text-center">
                                            <div className="font-bold">원데이 일정 관리</div>
                                            <div className="text-xs text-gray-500 font-normal">회차별 날짜, 시간 및 가격 설정</div>
                                        </div>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* 1:N 스터디 관리 */}
                        {lessonType === "1-n-study" && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>스터디 일정 관리</CardTitle>
                                    <CardDescription>
                                        스터디 진행 일정도 개별 관리 버튼을 통해 수정할 수 있습니다.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-24 flex flex-col gap-2 hover:border-[#00C471] hover:text-[#00C471] transition-all"
                                        onClick={() => setShowStudyModal(true)}
                                    >
                                        <CalendarIcon className="size-6" />
                                        <div className="text-center">
                                            <div className="font-bold">스터디 일정 관리</div>
                                            <div className="text-xs text-gray-500 font-normal">전체 커리큘럼 및 날짜별 세션 설정</div>
                                        </div>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* 제출 버튼 */}
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                            >
                                취소
                            </Button>
                            <Button
                                type="button"
                                className="bg-[#00C471] hover:bg-[#00B366] gap-2"
                                disabled={!isFormValid() || isSubmitting}
                                onClick={handleSubmit}
                            >
                                {isSubmitting ? (
                                    "수정 중..."
                                ) : (
                                    <>
                                        <Save className="size-4" />
                                        저장하기
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Placeholder Modals for Mentoring Management */}
            <Dialog open={showOptionsModal} onOpenChange={setShowOptionsModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>멘토링 옵션 관리</DialogTitle>
                        <DialogDescription>
                            개별 API 연동을 통해 옵션을 수정하는 고도화된 UI가 여기에 구현될 예정입니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
                        준비 중인 기능입니다 (별도 API 필요)
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>멘토링 일정 관리</DialogTitle>
                        <DialogDescription>
                            개별 API 연동을 통해 상담 가능 시간을 수정하는 고도화된 UI가 여기에 구현될 예정입니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
                        준비 중인 기능입니다 (별도 API 필요)
                    </div>
                </DialogContent>
            </Dialog>

            {/* One-day Modal */}
            <Dialog open={showOneDayModal} onOpenChange={setShowOneDayModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>원데이 클래스 일정 관리</DialogTitle>
                        <DialogDescription>
                            개별 API 연동을 통해 회차별 정보를 수정하는 UI가 여기에 구현될 예정입니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
                        준비 중인 기능입니다 (별도 API 필요)
                    </div>
                </DialogContent>
            </Dialog>

            {/* Study Modal */}
            <Dialog open={showStudyModal} onOpenChange={setShowStudyModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>스터디 일정 관리</DialogTitle>
                        <DialogDescription>
                            개별 API 연동을 통해 스터디 세션을 관리하는 UI가 여기에 구현될 예정입니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
                        준비 중인 기능입니다 (별도 API 필요)
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
