import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
    Users,
    Calendar,
    BookOpen,
    Edit2,
    Trash2,
    Plus,
    Clock,
    DollarSign,
    Search,
    Filter,
    MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { lessonService, Lesson } from "../../api/lesson";
import { categoryService } from "../../api/category";
import { CategoryResponseDto } from "../../api/types";
import { useAuthStore } from "../../stores/authStore";

interface LessonManagementProps {
    onEditLesson?: (lesson: Lesson) => void;
}

export function LessonManagement({ onEditLesson }: LessonManagementProps) {
    const navigate = useNavigate();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const user = useAuthStore((state) => state.user);

    const fetchLessons = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch Categories if not loaded
            if (categories.length === 0) {
                const categoryData = await categoryService.getCategories();
                setCategories(categoryData);
            }

            // Map UI filter to API Enum
            const apiLessonTypeMap: Record<string, string> = {
                "mentoring": "MENTORING",
                "oneday": "ONEDAY",
                "study": "STUDY"
            };

            // Fetch lessons with server-side conditions
            const data = await lessonService.getOwnLessons({
                keyword: searchQuery || undefined,
                lessonType: filterType !== "all" ? (apiLessonTypeMap[filterType] as any) : undefined,
                page: 0,
                size: 100
            });

            setLessons(data);
        } catch (error) {
            console.error("Failed to fetch lesson management data:", error);
        } finally {
            setLoading(false);
        }
    }, [user, searchQuery, filterType, categories.length]);

    useEffect(() => {
        fetchLessons();
    }, [fetchLessons]);

    const handleSearch = () => {
        setSearchQuery(searchInput);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const getLessonTypeInfo = (type: string | undefined) => {
        switch (type) {
            case "mentoring":
                return {
                    label: "1:1 멘토링",
                    icon: Users,
                    color: "text-blue-600",
                    bgColor: "bg-blue-50",
                };
            case "oneday":
                return {
                    label: "1:N 원데이",
                    icon: Calendar,
                    color: "text-purple-600",
                    bgColor: "bg-purple-50",
                };
            case "study":
                return {
                    label: "1:N 스터디",
                    icon: BookOpen,
                    color: "text-green-600",
                    bgColor: "bg-green-50",
                };
            default:
                return {
                    label: "기타",
                    icon: BookOpen,
                    color: "text-gray-600",
                    bgColor: "bg-gray-50",
                };
        }
    };

    const handleEdit = (lessonId: string) => {
        navigate({ to: `/service/${lessonId}/edit` });
    };

    const handleDelete = async (lessonId: string) => {
        if (confirm("정말 이 레슨을 삭제하시겠습니까?")) {
            try {
                await lessonService.deleteLesson(lessonId);
                alert("레슨이 삭제되었습니다.");
                fetchLessons(); // Refresh list after deletion
            } catch (error) {
                console.error("Failed to delete lesson:", error);
                alert("레슨 삭제에 실패했습니다. 다시 시도해주세요.");
            }
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">데이터를 불러오는 중입니다...</div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">내 레슨</h1>
                <p className="text-gray-600">등록한 레슨을 관리하고 확인하세요</p>
            </div>

            {/* Search and Filter Bar */}
            <Card className="mb-8 p-0 border-gray-200 shadow-sm overflow-hidden">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="레슨 제목으로 검색..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="pl-9 h-11 border-gray-200 focus:border-[#00C471] focus:ring-[#00C471]"
                                />
                            </div>

                            {/* Filter Select */}
                            <div className="flex gap-2">
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger className="w-full h-11 bg-white border-gray-200 focus:ring-[#00C471]">
                                        <div className="flex items-center gap-2">
                                            <Filter className="size-4" />
                                            <SelectValue placeholder="전체" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">전체</SelectItem>
                                        <SelectItem value="mentoring">1:1 멘토링</SelectItem>
                                        <SelectItem value="oneday">1:N 원데이</SelectItem>
                                        <SelectItem value="study">1:N 스터디</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="text-sm text-gray-600">
                                총 <span className="font-medium text-[#00C471]">{lessons.length}</span>건의 레슨
                            </div>
                            <Button
                                onClick={handleSearch}
                                className="h-10 bg-[#00C471] hover:bg-[#00B366] text-white px-8 font-medium"
                            >
                                검색
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>



            {/* Lessons List */}
            {lessons.length === 0 ? (
                <Card className="shadow-sm">
                    <CardContent className="p-12 text-center">
                        <BookOpen className="size-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-semibold mb-2 text-gray-600">
                            {searchQuery || filterType !== "all"
                                ? "검색 결과가 없습니다"
                                : "등록된 레슨이 없습니다"}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery || filterType !== "all"
                                ? "다른 검색어나 필터를 시도해보세요"
                                : "첫 번째 레슨을 등록하고 멘티들과 연결되세요"}
                        </p>
                        {!searchQuery && filterType === "all" && (
                            <Button
                                className="bg-[#00C471] hover:bg-[#00B366] h-11 px-8"
                                onClick={() => navigate({ to: "/service/register" })}
                            >
                                <Plus className="size-4 mr-2" />
                                레슨 등록하기
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {lessons.map((lesson: Lesson) => {
                        const typeInfo = getLessonTypeInfo(lesson.serviceType);
                        const Icon = typeInfo.icon;
                        const categoryName = categories.find(c => c.categoryId === lesson.categoryId)?.name || lesson.category;

                        return (
                            <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                        {/* Left Section */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                {/* Type Badge */}
                                                <div
                                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${typeInfo.bgColor}`}
                                                >
                                                    <Icon className={`size-4 ${typeInfo.color}`} />
                                                    <span className={`text-sm font-medium ${typeInfo.color}`}>
                                                        {typeInfo.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Title and Description */}
                                            <h3 className="text-xl font-bold mb-2 group-hover:text-[#00C471] transition-colors">
                                                {lesson.title}
                                            </h3>
                                            <p className="text-gray-600 mb-4 line-clamp-1">{categoryName}</p>

                                            {/* Meta Information */}
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="size-4" />
                                                    <span>{lesson.level}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="size-4" />
                                                    <span>{lesson.location || "미지정"}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 border-l pl-4">
                                                    <Calendar className="size-4" />
                                                    <span>마감일: {lesson.closeAt ? format(new Date(lesson.closeAt), "yyyy-MM-dd", { locale: ko }) : "미지정"}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 border-l pl-4">
                                                    <DollarSign className="size-4" />
                                                    <span className="font-semibold text-gray-900">
                                                        {lesson.price.toLocaleString()}원
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 border-l pl-4">
                                                    <Users className="size-4" />
                                                    <span>수강생 <span className="font-semibold text-[#00C471]">{lesson.studentCount}</span>명</span>
                                                </div>
                                                <div className="text-gray-400 border-l pl-4">
                                                    평점 {lesson.rating || "0.0"}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Section - Actions */}
                                        <div className="flex flex-row md:flex-col gap-2 w-full md:w-28">
                                            <Button
                                                variant="outline"
                                                onClick={() => handleEdit(lesson.id)}
                                                className="flex-1 h-10 gap-2 hover:bg-[#00C471] hover:text-white hover:border-[#00C471] transition-all"
                                            >
                                                <Edit2 className="size-4" />
                                                편집
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleDelete(lesson.id)}
                                                className="flex-1 h-10 gap-2 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all"
                                            >
                                                <Trash2 className="size-4" />
                                                삭제
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
