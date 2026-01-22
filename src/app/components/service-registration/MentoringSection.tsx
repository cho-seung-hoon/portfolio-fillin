
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Plus, Trash2, Clock, CheckCircle2, AlertCircle, ArrowDown, Info, Calendar as CalendarIcon, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CalendarModule } from "./CalendarModule";
import { TimePicker } from "../ui/time-picker";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useMentoringRegistrationStore, AvailableTime } from "../../../store/useMentoringRegistrationStore";

export function MentoringSection() {
    // Store State & Actions
    const {
        mentoringOptions,
        availableTimeList,
        addMentoringOption,
        removeMentoringOption,
        updateMentoringOptionName,
        addPriceOption,
        removePriceOption,
        updatePriceOption,
        addAvailableTime,
        removeAvailableTime,
        selectedDate,
        setSelectedDate
    } = useMentoringRegistrationStore();

    // Local UI State for time input
    const [newStartTime, setNewStartTime] = useState("09:00");
    const [newEndTime, setNewEndTime] = useState("10:00");
    const [selectedDurationOptionId, setSelectedDurationOptionId] = useState<string | null>(null);
    const [selectedPriceOptionId, setSelectedPriceOptionId] = useState<string | null>(null);
    const timeSectionRef = useRef<HTMLDivElement>(null);

    // Map to store option info for each time slot (using startTime as key)
    const [timeSlotOptions, setTimeSlotOptions] = useState<Map<string, { optionId: string; priceOptionId: string }>>(new Map());

    // Check if options are complete
    const isOptionsComplete = mentoringOptions.length > 0 &&
        mentoringOptions.every(opt => opt.name.trim() !== "" && opt.priceOptions.length > 0) &&
        mentoringOptions.some(opt => opt.priceOptions.every(po => po.duration && po.price));

    // Auto-scroll to time section when options are complete
    useEffect(() => {
        if (isOptionsComplete && availableTimeList.length === 0 && timeSectionRef.current) {
            // Small delay to ensure DOM is updated
            setTimeout(() => {
                timeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 300);
        }
    }, [isOptionsComplete, availableTimeList.length]);

    // --- Schedule Logic (Adapted for flat list) ---
    const getDateFromISO = (isoString: string) => {
        return format(new Date(isoString), "yyyy-MM-dd");
    };

    const getDateKey = (date: Date) => {
        return format(date, "yyyy-MM-dd");
    };

    const getSelectedDateSchedule = () => {
        if (!selectedDate) return [];

        // Define range for the selected day in UTC
        const dateKey = getDateKey(selectedDate);
        const dayStart = new Date(`${dateKey}T00:00:00`).getTime();
        const dayEnd = new Date(`${dateKey}T23:59:59.999`).getTime();

        return availableTimeList.filter(slot => {
            // Using local time string construction to match how dateKey is made, 
            // but for comparison we need effective timestamps.
            // Since we store ISO (UTC), let's compare timestamps.

            // Wait, dateKey is local YYYY-MM-DD.
            // effectively we want slots where (start < dayEnd) AND (end > dayStart)
            // But we need to be careful about timezones.
            // Currently everything is local-time based for display logic. A proper way is:

            const slotStart = new Date(slot.startTime).getTime();
            const slotEnd = new Date(slot.endTime).getTime();

            // We need selectedDate in effective local timestamp range
            // selectedDate is a Date object (usually 00:00 local).
            const selectedStart = new Date(selectedDate);
            selectedStart.setHours(0, 0, 0, 0);

            const selectedEnd = new Date(selectedDate);
            selectedEnd.setHours(23, 59, 59, 999);

            return slotStart < selectedEnd.getTime() && slotEnd > selectedStart.getTime();
        });
    };

    // 시작 시간 변경 시 선택된 진행 시간을 기반으로 종료 시간 자동 계산
    const handleStartTimeChange = (startTime: string) => {
        setNewStartTime(startTime);

        // 선택된 옵션과 가격 옵션에서 진행 시간 가져오기
        if (selectedDurationOptionId && selectedPriceOptionId && startTime) {
            const option = mentoringOptions.find(opt => opt.id === selectedDurationOptionId);
            const priceOption = option?.priceOptions.find(po => po.id === selectedPriceOptionId);

            if (priceOption?.duration) {
                const duration = Number(priceOption.duration);
                const [hour, minute] = startTime.split(":").map(Number);
                const startDate = new Date();
                startDate.setHours(hour, minute, 0, 0);

                // 진행 시간(분)을 더함
                const endDate = new Date(startDate.getTime() + duration * 60000);
                const endHour = String(endDate.getHours()).padStart(2, "0");
                const endMinute = String(endDate.getMinutes()).padStart(2, "0");

                setNewEndTime(`${endHour}:${endMinute}`);
            }
        }
    };

    // 옵션 및 진행 시간 선택 시 종료 시간 자동 계산
    const handleOptionAndDurationChange = (optionId: string, priceOptionId: string) => {
        setSelectedDurationOptionId(optionId);
        setSelectedPriceOptionId(priceOptionId);

        // 시작 시간이 이미 선택되어 있으면 종료 시간 자동 계산
        if (newStartTime) {
            const option = mentoringOptions.find(opt => opt.id === optionId);
            const priceOption = option?.priceOptions.find(po => po.id === priceOptionId);

            if (priceOption?.duration) {
                const duration = Number(priceOption.duration);
                const [hour, minute] = newStartTime.split(":").map(Number);
                const startDate = new Date();
                startDate.setHours(hour, minute, 0, 0);

                const endDate = new Date(startDate.getTime() + duration * 60000);
                const endHour = String(endDate.getHours()).padStart(2, "0");
                const endMinute = String(endDate.getMinutes()).padStart(2, "0");

                setNewEndTime(`${endHour}:${endMinute}`);
            }
        }
    };

    const handleAddTimeSlot = () => {
        // TimePicker의 기본값이 "09:00"이므로 빈 문자열이 아닌지 확인
        const hasStartTime = newStartTime && newStartTime.trim() !== "";
        const hasEndTime = newEndTime && newEndTime.trim() !== "";

        if (!selectedDate || !hasStartTime || !hasEndTime) {
            alert("날짜와 시작/종료 시간을 모두 입력해주세요.");
            return;
        }

        if (!selectedDurationOptionId || !selectedPriceOptionId) {
            alert("멘토링 옵션과 진행 시간을 선택해주세요.");
            return;
        }

        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const startTimeISO = new Date(`${dateStr}T${newStartTime}:00`).toISOString();
        const endTimeISO = new Date(`${dateStr}T${newEndTime}:00`).toISOString();

        // Validate that end time is after start time
        if (new Date(endTimeISO) <= new Date(startTimeISO)) {
            alert("종료 시간은 시작 시간보다 늦어야 합니다.");
            return;
        }

        const newTimeSlot: AvailableTime = {
            startTime: startTimeISO,
            endTime: endTimeISO,
            price: 0,
            seats: 1
        };

        addAvailableTime(newTimeSlot);

        // Store option info for this time slot
        if (selectedDurationOptionId && selectedPriceOptionId) {
            setTimeSlotOptions(prev => {
                const newMap = new Map(prev);
                newMap.set(startTimeISO, {
                    optionId: selectedDurationOptionId,
                    priceOptionId: selectedPriceOptionId
                });
                return newMap;
            });
        }

        setNewStartTime("09:00");
        setNewEndTime("10:00");
        setSelectedDurationOptionId(null);
        setSelectedPriceOptionId(null);
    };

    const removeTimeSlot = (slot: AvailableTime) => {
        const index = availableTimeList.indexOf(slot);
        if (index !== -1) {
            removeAvailableTime(index);
            // Remove option info for this time slot
            setTimeSlotOptions(prev => {
                const newMap = new Map(prev);
                newMap.delete(slot.startTime);
                return newMap;
            });
        }
    };

    const getOptionInfoForTimeSlot = (slot: AvailableTime) => {
        const optionInfo = timeSlotOptions.get(slot.startTime);
        if (!optionInfo) return null;

        const option = mentoringOptions.find(opt => opt.id === optionInfo.optionId);
        const priceOption = option?.priceOptions.find(po => po.id === optionInfo.priceOptionId);

        return {
            optionName: option?.name || "",
            duration: priceOption?.duration || ""
        };
    };


    const formatTimeRange = (slot: AvailableTime) => {
        const start = format(new Date(slot.startTime), "HH:mm");
        const end = format(new Date(slot.endTime), "HH:mm");
        return `${start}-${end}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="size-5" />
                    상세 설정 (1:1 멘토링)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* 진행 단계 안내 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Info className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <h4 className="font-medium text-blue-900">등록 단계 안내</h4>
                                <div className="space-y-2 text-sm text-blue-800">
                                    <div className="flex items-center gap-2">
                                        {isOptionsComplete ? (
                                            <CheckCircle2 className="size-4 text-green-600" />
                                        ) : (
                                            <div className="size-4 rounded-full border-2 border-blue-400" />
                                        )}
                                        <span className={isOptionsComplete ? "line-through text-gray-500" : ""}>
                                            1단계: 멘토링 옵션 설정 (진행시간 및 가격)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {availableTimeList.length > 0 ? (
                                            <CheckCircle2 className="size-4 text-green-600" />
                                        ) : (
                                            <div className="size-4 rounded-full border-2 border-blue-400" />
                                        )}
                                        <span className={availableTimeList.length > 0 ? "line-through text-gray-500" : ""}>
                                            2단계: 달력을 클릭해서 가능한 시간대 설정
                                        </span>
                                    </div>
                                </div>
                                {isOptionsComplete && availableTimeList.length === 0 && (
                                    <Alert className="mt-3 bg-white border-blue-300">
                                        <ArrowDown className="size-4 text-blue-600" />
                                        <AlertTitle className="text-blue-900">다음 단계</AlertTitle>
                                        <AlertDescription className="text-blue-700">
                                            옵션 설정이 완료되었습니다! 이제 아래 달력을 클릭해서 가능한 시간대를 설정해주세요.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 멘토링 옵션 부분 */}
                    <div className="bg-gray-50 p-4 rounded-md border-2 border-dashed border-gray-300">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">멘토링 옵션</h4>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addMentoringOption}
                                className="gap-2"
                            >
                                <Plus className="size-4" />
                                옵션 추가
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            제공할 멘토링 옵션과 각 옵션별 시간/가격을 설정해주세요
                        </p>
                        <div className="space-y-3">
                            {mentoringOptions.map((option, index) => (
                                <div
                                    key={option.id}
                                    className="p-4 bg-gray-50 rounded-md space-y-3"
                                >
                                    {/* 옵션 이름 */}
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="text"
                                            value={option.name}
                                            onChange={(e) =>
                                                updateMentoringOptionName(option.id, e.target.value)
                                            }
                                            placeholder={`옵션 ${index + 1} (예: 기본 상담)`}
                                            className="flex-1 bg-white"
                                        />
                                        {mentoringOptions.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeMentoringOption(option.id)}
                                            >
                                                <Trash2 className="size-4 text-gray-400" />
                                            </Button>
                                        )}
                                    </div>

                                    {/* 진행시간 및 가격 추가 */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm text-gray-600">
                                                진행시간 및 가격
                                            </Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addPriceOption(option.id)}
                                                className="gap-1 h-8 text-xs"
                                            >
                                                <Plus className="size-3" />
                                                추가
                                            </Button>
                                        </div>

                                        {option.priceOptions.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-3 bg-white rounded border border-dashed border-gray-300">
                                                시간/가격을 추가해주세요
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {option.priceOptions.map((priceOption) => (
                                                    <div
                                                        key={priceOption.id}
                                                        className="flex items-end gap-2 p-3 bg-white rounded-md border border-gray-200"
                                                    >
                                                        <div className="flex-1 space-y-1">
                                                            <Label className="text-xs text-gray-600">
                                                                진행시간
                                                            </Label>
                                                            <Select
                                                                value={priceOption.duration}
                                                                onValueChange={(value) =>
                                                                    updatePriceOption(
                                                                        option.id,
                                                                        priceOption.id,
                                                                        "duration",
                                                                        value,
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="시간 선택" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="30">30분</SelectItem>
                                                                    <SelectItem value="60">60분</SelectItem>
                                                                    <SelectItem value="90">90분</SelectItem>
                                                                    <SelectItem value="120">120분</SelectItem>
                                                                    <SelectItem value="180">180분</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <Label className="text-xs text-gray-600">
                                                                가격 (원)
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                value={priceOption.price}
                                                                onChange={(e) =>
                                                                    updatePriceOption(
                                                                        option.id,
                                                                        priceOption.id,
                                                                        "price",
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                placeholder="50000"
                                                                className="mb-0.5"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                removePriceOption(option.id, priceOption.id)
                                                            }
                                                            className="mb-0.5"
                                                        >
                                                            <Trash2 className="size-4 text-gray-400" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 가능한 시간 설정 */}
                    <div ref={timeSectionRef} className="mt-6">
                        <h4 className="font-medium mb-2">일정 선택</h4>
                        <p className="text-sm text-gray-600 mb-4">
                            멘토링이 진행될 날짜와 시간을 추가해주세요. 여러 시간대를 등록할 수 있습니다.
                        </p>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 좌측: 달력 */}
                            <div>
                                <CalendarModule
                                    selectedDate={selectedDate}
                                    onDateSelect={setSelectedDate}
                                    renderDateContent={(date) => {
                                        const dateKey = format(date, "yyyy-MM-dd");
                                        // Filter from availableTimeList
                                        const schedules = availableTimeList.filter(s => getDateFromISO(s.startTime) === dateKey);

                                        if (schedules.length === 0) return null;
                                        return (
                                            <div className="space-y-1">
                                                {schedules.slice(0, 2).map((schedule, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="text-xs px-2 py-1 bg-[#E6F9F2] text-[#00C471] rounded truncate"
                                                    >
                                                        {formatTimeRange(schedule)}
                                                    </div>
                                                ))}
                                                {schedules.length > 2 && (
                                                    <div className="text-xs text-gray-500 px-2">
                                                        +{schedules.length - 2}개
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }}
                                />
                            </div>

                            {/* 우측: 시간 입력 폼 */}
                            {selectedDate && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <h4 className="font-medium mb-4">
                                            {format(selectedDate, "yyyy년 M월 d일 (EEE)", { locale: ko })} 시간 추가
                                        </h4>

                                        <div className="space-y-4">
                                            {/* 멘토링 옵션 및 진행 시간 선택 */}
                                            <div className="space-y-2">
                                                <Label className="text-sm">멘토링 옵션 및 진행 시간 선택 <span className="text-red-500">*</span></Label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <Select
                                                        value={selectedDurationOptionId || ""}
                                                        onValueChange={(optionId) => {
                                                            setSelectedDurationOptionId(optionId);
                                                            setSelectedPriceOptionId(null);
                                                        }}
                                                    >
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue placeholder="멘토링 옵션 선택" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {mentoringOptions.map((option) => (
                                                                <SelectItem key={option.id} value={option.id}>
                                                                    {option.name || `옵션 ${mentoringOptions.indexOf(option) + 1}`}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Select
                                                        value={selectedPriceOptionId || ""}
                                                        onValueChange={(priceOptionId) => {
                                                            if (selectedDurationOptionId) {
                                                                handleOptionAndDurationChange(selectedDurationOptionId, priceOptionId);
                                                            }
                                                        }}
                                                        disabled={!selectedDurationOptionId}
                                                    >
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue placeholder="진행 시간 선택" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {selectedDurationOptionId && mentoringOptions
                                                                .find(opt => opt.id === selectedDurationOptionId)
                                                                ?.priceOptions.map((priceOption) => (
                                                                    <SelectItem key={priceOption.id} value={priceOption.id}>
                                                                        {priceOption.duration}분 ({Number(priceOption.price).toLocaleString()}원)
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    멘토링 옵션과 진행 시간을 선택하면 시작 시간 입력 시 종료 시간이 자동으로 계산됩니다
                                                </p>
                                            </div>

                                            <TimePicker
                                                value={newStartTime}
                                                onChange={handleStartTimeChange}
                                                label="시작 시간"
                                            />
                                            <TimePicker
                                                value={newEndTime}
                                                onChange={setNewEndTime}
                                                label="종료 시간"
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleAddTimeSlot}
                                                className="w-full bg-[#00C471] hover:bg-[#00B366] gap-2"
                                            >
                                                <Plus className="size-4" />
                                                시간대 추가
                                            </Button>
                                        </div>
                                    </div>

                                    {getSelectedDateSchedule().length > 0 && (
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className="font-medium">등록된 시간대</h5>
                                                <span className="text-sm text-gray-500">
                                                    총 {getSelectedDateSchedule().length}개
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {getSelectedDateSchedule().map((timeSlot, idx) => {
                                                    const optionInfo = getOptionInfoForTimeSlot(timeSlot);
                                                    const slotDate = format(new Date(timeSlot.startTime), "yyyy년 M월 d일 (EEE)", { locale: ko });

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
                                                        >
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-sm font-medium">
                                                                    {formatTimeRange(timeSlot)}
                                                                </span>
                                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                                    <span>{slotDate}</span>
                                                                    {optionInfo && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span>{optionInfo.optionName} ({optionInfo.duration}분)</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeTimeSlot(timeSlot)}
                                                                className="text-gray-400 hover:text-gray-600"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!selectedDate && (
                                <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-gray-50 rounded-md border-2 border-dashed border-gray-300 p-6">
                                    <CalendarIcon className="size-12 text-gray-400 mb-4" />
                                    <p className="text-gray-600 text-center font-medium mb-2">
                                        날짜를 선택해주세요
                                    </p>
                                    <p className="text-sm text-gray-500 text-center">
                                        좌측 달력에서 가능한 날짜를 클릭하면<br />
                                        우측에서 시간을 추가할 수 있습니다
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
