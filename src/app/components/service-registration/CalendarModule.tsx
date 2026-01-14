import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "../ui/button";

interface CalendarModuleProps {
    /** Currently selected date value */
    selectedDate: Date | undefined;
    /** Function called when a date is selected */
    onDateSelect: (date: Date) => void;
    /**
     * Optional render prop to customize content within each date cell.
     * Useful for showing badges (e.g., schedule count or specific time slots).
     */
    renderDateContent?: (date: Date) => React.ReactNode;
}

export function CalendarModule({
    selectedDate,
    onDateSelect,
    renderDateContent,
}: CalendarModuleProps) {
    // Navigation: We use the selectedDate as the anchor for the displayed month.
    // If no date is selected, we default to today.
    const currentMonth = selectedDate || new Date();

    // Handle month navigation by updating the selectedDate to the same day in the prev/next month.
    // This matches the original implementation's behavior.
    const handlePrevMonth = () => {
        const prevMonth = new Date(currentMonth);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        onDateSelect(prevMonth);
    };

    const handleNextMonth = () => {
        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        onDateSelect(nextMonth);
    };

    return (
        <div className="space-y-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                    {format(currentMonth, "yyyy년 M월", { locale: ko })}
                </h3>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handlePrevMonth}
                    >
                        이전
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleNextMonth}
                    >
                        다음
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="border rounded-lg overflow-hidden">
                {/* Day Headers (Sun ~ Sat) */}
                <div className="grid grid-cols-7 bg-gray-50 border-b">
                    {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
                        <div
                            key={day}
                            className={`py-3 text-center text-sm font-medium ${idx === 0
                                    ? "text-red-500"
                                    : idx === 6
                                        ? "text-blue-500"
                                        : "text-gray-700"
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Date Cells */}
                <div className="grid grid-cols-7">
                    {(() => {
                        const year = currentMonth.getFullYear();
                        const month = currentMonth.getMonth();

                        const firstDay = new Date(year, month, 1);
                        // Derive start date (Sunday of the first week)
                        const startDate = new Date(firstDay);
                        startDate.setDate(startDate.getDate() - firstDay.getDay());

                        const days = [];
                        const current = new Date(startDate);

                        // Generate 42 days (6 weeks) to fill the grid
                        for (let i = 0; i < 42; i++) {
                            days.push(new Date(current));
                            current.setDate(current.getDate() + 1);
                        }

                        return days.map((date, idx) => {
                            const isCurrentMonth = date.getMonth() === month;
                            const isPast =
                                date < new Date(new Date().setHours(0, 0, 0, 0));
                            const dateKey = format(date, "yyyy-MM-dd");
                            const isSelected =
                                selectedDate &&
                                format(selectedDate, "yyyy-MM-dd") === dateKey;

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => !isPast && onDateSelect(date)}
                                    disabled={isPast}
                                    className={`
                      min-h-[100px] p-2 border-r border-b text-left transition-colors
                      ${!isCurrentMonth
                                            ? "bg-gray-50 text-gray-400"
                                            : "bg-white"
                                        }
                      ${isPast
                                            ? "cursor-not-allowed opacity-50"
                                            : "hover:bg-gray-50"
                                        }
                      ${isSelected
                                            ? "ring-2 ring-[#00C471] ring-inset"
                                            : ""
                                        }
                    `}
                                >
                                    <div className="font-medium text-sm mb-1">
                                        {date.getDate()}
                                    </div>

                                    {/* Render Custom Content (Badges, etc.) */}
                                    {renderDateContent && renderDateContent(date)}
                                </button>
                            );
                        });
                    })()}
                </div>
            </div>
        </div>
    );
}
