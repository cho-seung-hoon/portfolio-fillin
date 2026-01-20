import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import { Skeleton } from "./ui/skeleton";

export function LessonListSkeleton() {
    return (
        <div className="border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead className="w-20 text-center">순번</TableHead>
                        <TableHead className="w-32 text-center">레슨 유형</TableHead>
                        <TableHead className="text-center">레슨 제목</TableHead>
                        <TableHead className="w-32 text-center">등록일</TableHead>
                        <TableHead className="w-16 text-center">편집</TableHead>
                        <TableHead className="w-16 text-center">삭제</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell className="text-center">
                                <Skeleton className="h-4 w-8 mx-auto" />
                            </TableCell>
                            <TableCell className="text-center">
                                <Skeleton className="h-6 w-20 mx-auto rounded-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-3/4 mx-auto" />
                            </TableCell>
                            <TableCell className="text-center text-gray-600">
                                <Skeleton className="h-4 w-24 mx-auto" />
                            </TableCell>
                            <TableCell className="text-center">
                                <Skeleton className="h-8 w-8 mx-auto rounded-md" />
                            </TableCell>
                            <TableCell className="text-center">
                                <Skeleton className="h-8 w-8 mx-auto rounded-md" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
