
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Plus, Trash2, Calendar, DollarSign, Users } from "lucide-react";
import { CalendarModule } from "./CalendarModule";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export interface StudySession {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
}

export interface StudySessionData {
    price: number;
    seats: number;
    sessions: StudySession[];
}

interface StudySessionSectionProps {
    onChange: (data: StudySessionData) => void;
}

export function StudySessionSection({ onChange }: StudySessionSectionProps) {
    const [price, setPrice] = useState("");
    const [seats, setSeats] = useState("");
    const [sessions, setSessions] = useState<StudySession[]>([]);

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [newSessionStartTime, setNewSessionStartTime] = useState("");
    const [newSessionEndTime, setNewSessionEndTime] = useState("");

    useEffect(() => {
        const numericPrice = Number(price) || 0;
        const numericSeats = Number(seats) || 0;

        onChange({
            price: numericPrice,
            seats: numericSeats,
            sessions
        });
    }, [price, seats, sessions, onChange]);

    const addSession = () => {
        if (!selectedDate || !newSessionStartTime || !newSessionEndTime) {
            alert("날짜와 시작/종료 시간을 모두 입력해주세요.");
            return;
        }

        const newSession: StudySession = {
            id: Date.now().toString(),
            date: format(selectedDate, "yyyy-MM-dd"),
            startTime: newSessionStartTime,
            endTime: newSessionEndTime,
        };

        setSessions((prev) => [...prev, newSession]);
        setNewSessionStartTime("");
        setNewSessionEndTime("");
    };

    const removeSession = (id: string) => {
        setSessions((prev) => prev.filter((s) => s.id !== id));
    };

    const getSessionsForDate = (dateKey: string) => {
        return sessions.filter((s) => s.date === dateKey);
    };

    const getSessionNumber = (id: string) => {
        const sorted = [...sessions].sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.startTime.localeCompare(b.startTime);
        });
        return sorted.findIndex(s => s.id === id) + 1;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="size-5" />
                    상세 설정 (스터디)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* 가격 및 모집 인원 (Top-Level) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <DollarSign className="size-4" />
                                참가비 (원)
                            </Label>
                            <Input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="50000"
                                min="0"
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Users className="size-4" />
                                모집 인원 (명)
                            </Label>
                            <Input
                                type="number"
                                value={seats}
                                onChange={(e) => setSeats(e.target.value)}
                                placeholder="10"
                                min="1"
                                className="bg-white"
                            />
                        </div>
                    </div>

                    <div className="border-t my-4" />

                    <h4 className="font-medium">일정 선택</h4>

                    <CalendarModule
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        renderDateContent={(date) => {
                            const dateKey = format(date, "yyyy-MM-dd");
                            const dateSessions = getSessionsForDate(dateKey);
                            if (dateSessions.length === 0) return null;
                            return (
                                <div className="space-y-1">
                                    {dateSessions.slice(0, 2).map((session) => (
                                        <div
                                            key={session.id}
                                            className="text-xs px-2 py-1 bg-[#E6F9F2] text-[#00C471] rounded truncate"
                                        >
                                            {session.startTime}-{session.endTime}
                                        </div>
                                    ))}
                                    {dateSessions.length > 2 && (
                                        <div className="text-xs text-gray-500 px-2">
                                            +{dateSessions.length - 2}회
                                        </div>
                                    )}
                                </div>
                            );
                        }}
                    />

                    {selectedDate && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-md">
                                <h4 className="font-medium mb-3">
                                    {format(selectedDate, "yyyy년 M월 d일 (EEE)", { locale: ko })} 회차 추가
                                </h4>

                                <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
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

                    {sessions.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                            <h5 className="font-medium text-blue-900 mb-2">전체 회차 요약</h5>
                            <p className="text-sm text-blue-700 mb-3">
                                총 {sessions.length}개의 회차가 등록되었습니다
                            </p>
                            <div className="space-y-3">
                                {(() => {
                                    const groupedByDate: { [date: string]: StudySession[] } = {};
                                    sessions.forEach(session => {
                                        if (!groupedByDate[session.date]) {
                                            groupedByDate[session.date] = [];
                                        }
                                        groupedByDate[session.date].push(session);
                                    });

                                    const sortedDates = Object.keys(groupedByDate).sort();

                                    return sortedDates.map(dateKey => {
                                        const dateSessions = groupedByDate[dateKey];
                                        const [year, month, day] = dateKey.split('-').map(Number);
                                        const dateObj = new Date(year, month - 1, day);

                                        return (
                                            <div key={dateKey} className="bg-white p-3 rounded border border-blue-100">
                                                <div className="font-medium text-blue-900 mb-2">
                                                    {format(dateObj, "M월 d일 (EEE)", { locale: ko })}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {dateSessions.map((session) => (
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
