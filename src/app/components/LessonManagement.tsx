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
    CheckCircle,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { lessonService, Lesson } from "../../api/lesson";
import { categoryService } from "../../api/category";
import { CategoryResponseDto } from "../../api/types";
import { useAuthStore } from "../../stores/authStore";
import { LessonListSkeleton } from "./LessonListSkeleton";

interface LessonManagementProps {
    onEditLesson?: (lesson: Lesson) => void;
}

export function LessonManagement({ onEditLesson }: LessonManagementProps) {
    const navigate = useNavigate();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtering and Searching State
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("all");

    // Temporary states for filters
    const [tempSearchQuery, setTempSearchQuery] = useState("");
    const [tempFilterType, setTempFilterType] = useState("all");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const user = useAuthStore((state) => state.user);

    const fetchLessons = useCallback(async () => {
        setLoading(true);
        try {
            if (categories.length === 0) {
                const categoryData = await categoryService.getCategories();
                setCategories(categoryData);
            }

            const data = await lessonService.getOwnLessons({
                page: 0,
                size: 100
            });

            setLessons(data);
        } catch (error) {
            console.error("Failed to fetch lesson management data:", error);
        } finally {
            setLoading(false);
        }
    }, [categories.length]);

    useEffect(() => {
        fetchLessons();
    }, [fetchLessons]);

    // Filtering and Sorting logic
    const filteredAndSortedLessons = useMemo(() => {
        let filtered = [...lessons];

        // Search by Title
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((lesson) =>
                lesson.title.toLowerCase().includes(query)
            );
        }

        // Filter by Lesson Type
        if (filterType !== "all") {
            filtered = filtered.filter((lesson) => lesson.serviceType === filterType);
        }

        return filtered;
    }, [lessons, searchQuery, filterType]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedLessons.length / ITEMS_PER_PAGE);
    const paginatedLessons = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredAndSortedLessons.slice(startIndex, endIndex);
    }, [filteredAndSortedLessons, currentPage]);

    const handleSearch = () => {
        setSearchQuery(tempSearchQuery);
        setFilterType(tempFilterType);
        setCurrentPage(1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };


    const goToPage = (page: number) => {
        setCurrentPage(page);
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
                fetchLessons();
            } catch (error) {
                console.error("Failed to delete lesson:", error);
                alert("레슨 삭제에 실패했습니다. 다시 시도해주세요.");
            }
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl mb-6">내 레슨</h2>

            <Card>
                <CardContent className="pt-6">
                    {/* Filters */}
                    <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="레슨 제목으로 검색..."
                                    value={tempSearchQuery}
                                    onChange={(e) => setTempSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="pl-9"
                                />
                            </div>

                            {/* Filter Select */}
                            <Select value={tempFilterType} onValueChange={setTempFilterType}>
                                <SelectTrigger>
                                    <div className="flex items-center gap-2">
                                        <Filter className="size-4" />
                                        <SelectValue placeholder="레슨 유형" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">전체 유형</SelectItem>
                                    <SelectItem value="mentoring">1:1 멘토링</SelectItem>
                                    <SelectItem value="oneday">1:N 원데이</SelectItem>
                                    <SelectItem value="study">1:N 스터디</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                총 <span className="font-medium text-[#00C471]">{filteredAndSortedLessons.length}</span>건의 레슨
                            </div>
                            <Button
                                size="sm"
                                onClick={handleSearch}
                                className="bg-[#00C471] hover:bg-[#00B366]"
                            >
                                적용
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <LessonListSkeleton />
                    ) : (
                        <div className="border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="w-20 text-center">순번</TableHead>
                                        <TableHead className="w-32 text-center">레슨 유형</TableHead>
                                        <TableHead>레슨 제목</TableHead>
                                        <TableHead className="w-32 text-center text-ellipsis overflow-hidden whitespace-nowrap">등록일자</TableHead>
                                        <TableHead className="w-16 text-center">편집</TableHead>
                                        <TableHead className="w-16 text-center">삭제</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedLessons.length > 0 ? (
                                        paginatedLessons.map((lesson, index) => {
                                            const typeInfo = getLessonTypeInfo(lesson.serviceType);
                                            const Icon = typeInfo.icon;

                                            return (
                                                <TableRow key={lesson.id} className="hover:bg-gray-50">
                                                    <TableCell className="text-center font-medium">
                                                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge
                                                            variant="outline"
                                                            className={`${typeInfo.bgColor} ${typeInfo.color} border-none`}
                                                        >
                                                            <Icon className="size-3 mr-1" />
                                                            {typeInfo.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        <div className="line-clamp-1">{lesson.title}</div>
                                                    </TableCell>
                                                    <TableCell className="text-center text-gray-600 text-sm">
                                                        {lesson.createdAt ? format(new Date(lesson.createdAt), "yyyy-MM-dd", { locale: ko }) : "-"}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(lesson.id)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Edit2 className="size-4" />
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(lesson.id)}
                                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-gray-400">
                                                {searchQuery || filterType !== "all"
                                                    ? "검색 결과가 없습니다."
                                                    : "등록된 레슨이 없습니다."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="size-4" />
                            </Button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => goToPage(page)}
                                        className={currentPage === page ? "bg-[#00C471] hover:bg-[#00B366]" : ""}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

}
