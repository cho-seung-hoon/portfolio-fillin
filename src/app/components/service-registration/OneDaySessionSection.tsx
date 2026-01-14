
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Plus, Trash2, Calendar } from "lucide-react";
import { CalendarModule } from "./CalendarModule";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export interface OneDaySession {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    price: string;
}

interface OneDaySessionSectionProps {
    selectedDate: Date | undefined;
    onDateSelect: (date: Date) => void;
    getSessionsForDate: (dateKey: string) => OneDaySession[];
    oneDaySessions: OneDaySession[];
    newSessionStartTime: string;
    setNewSessionStartTime: (value: string) => void;
    newSessionEndTime: string;
    setNewSessionEndTime: (value: string) => void;
    newSessionPrice: string;
    setNewSessionPrice: (value: string) => void;
    addSession: () => void;
    removeSession: (id: string) => void;
    getSessionNumber: (id: string) => number;
}

export function OneDaySessionSection({
    selectedDate,
    onDateSelect,
    getSessionsForDate,
    oneDaySessions,
    newSessionStartTime,
    setNewSessionStartTime,
    newSessionEndTime,
    setNewSessionEndTime,
    newSessionPrice,
    setNewSessionPrice,
    addSession,
    removeSession,
    getSessionNumber,
}: OneDaySessionSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="size-5" />
                    일정 설정
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <CalendarModule
                        selectedDate={selectedDate}
                        onDateSelect={onDateSelect}
                        renderDateContent={(date) => {
                            const dateKey = format(date, "yyyy-MM-dd");
                            const sessions = getSessionsForDate(dateKey);
                            if (sessions.length === 0) return null;
                            return (
                                <div className="space-y-1">
                                    {sessions.slice(0, 2).map((session) => (
                                        <div
                                            key={session.id}
                                            className="text-xs px-2 py-1 bg-[#E6F9F2] text-[#00C471] rounded truncate"
                                        >
                                            {session.startTime}-{session.endTime}
                                        </div>
                                    ))}
                                    {sessions.length > 2 && (
                                        <div className="text-xs text-gray-500 px-2">
                                            +{sessions.length - 2}회
                                        </div>
                                    )}
                                </div>
                            );
                        }}
                    />

                    {/* 선택된 날짜에 회차 추가 */}
                    {selectedDate && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-md">
                                <h4 className="font-medium mb-3">
                                    {format(selectedDate, "yyyy년 M월 d일 (EEE)", { locale: ko })} 회차 추가
                                </h4>

                                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                                    <div className="space-y-2">
                                        <Label className="text-sm">시작 시간</Label>
                                        <Input
                                            type="time"
                                            value={newSessionStartTime}
                                            onChange={(e) => setNewSessionStartTime(e.target.value)}
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm">종료 시간</Label>
                                        <Input
                                            type="time"
                                            value={newSessionEndTime}
                                            onChange={(e) => setNewSessionEndTime(e.target.value)}
                                            className="bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm">가격 (원)</Label>
                                        <Input
                                            type="number"
                                            value={newSessionPrice}
                                            onChange={(e) => setNewSessionPrice(e.target.value)}
                                            placeholder="50000"
                                            className="bg-white"
                                            min="0"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={addSession}
                                        className="bg-[#00C471] hover:bg-[#00B366] gap-2"
                                    >
                                        <Plus className="size-4" />
                                        추가
                                    </Button>
                                </div>
                            </div>

                            {/* 선택된 날짜의 회차 목록 */}
                            {getSessionsForDate(format(selectedDate, "yyyy-MM-dd")).length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-medium">등록된 회차</h5>
                                        <span className="text-sm text-gray-500">
                                            총 {getSessionsForDate(format(selectedDate, "yyyy-MM-dd")).length}개
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {getSessionsForDate(format(selectedDate, "yyyy-MM-dd")).map((session) => (
                                            <div
                                                key={session.id}
                                                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium text-gray-500">
                                                        {getSessionNumber(session.id)}회차
                                                    </span>
                                                    <span className="text-sm font-medium">
                                                        {session.startTime} - {session.endTime}
                                                    </span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeSession(session.id)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 전체 회차 요약 - 스터디에만 표시 -> But kept here as it was in the block */}
                    {oneDaySessions.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                            <h5 className="font-medium text-blue-900 mb-2">전체 회차 요약</h5>
                            <p className="text-sm text-blue-700 mb-3">
                                총 {oneDaySessions.length}개의 회차가 등록되었습니다
                            </p>

                            {/* 날짜별로 그룹화된 회차 표시 */}
                            <div className="space-y-3">
                                {(() => {
                                    // 날짜별로 그룹화
                                    const groupedByDate: { [date: string]: OneDaySession[] } = {};
                                    oneDaySessions.forEach(session => {
                                        if (!groupedByDate[session.date]) {
                                            groupedByDate[session.date] = [];
                                        }
                                        groupedByDate[session.date].push(session);
                                    });

                                    // 날짜순으로 정렬
                                    const sortedDates = Object.keys(groupedByDate).sort();

                                    return sortedDates.map(dateKey => {
                                        const sessions = groupedByDate[dateKey];
                                        // Parse date safely by splitting the string
                                        const [year, month, day] = dateKey.split('-').map(Number);
                                        const dateObj = new Date(year, month - 1, day);

                                        return (
                                            <div key={dateKey} className="bg-white p-3 rounded border border-blue-100">
                                                <div className="font-medium text-blue-900 mb-2">
                                                    {format(dateObj, "M월 d일 (EEE)", { locale: ko })}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {sessions.map((session) => (
                                                        <div
                                                            key={session.id}
                                                            className="text-xs bg-blue-50 px-3 py-1.5 rounded border border-blue-100"
                                                        >
                                                            <span className="font-medium text-blue-900">{getSessionNumber(session.id)}회차: </span>
                                                            <span className="text-gray-600">
                                                                {session.startTime} - {session.endTime}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
