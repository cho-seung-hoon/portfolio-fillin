import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Label } from "./label";

interface TimePickerProps {
  value: string; // Format: "HH:mm"
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function TimePicker({
  value,
  onChange,
  label,
  className = "",
  disabled = false,
}: TimePickerProps) {
  const parseTime = (timeStr: string) => {
    if (!timeStr || timeStr.trim() === "") return { hour: "09", minute: "00" };
    const [h, m] = timeStr.split(":");
    return {
      hour: h || "09",
      minute: m || "00",
    };
  };

  const initialTime = parseTime(value);
  const [hour, setHour] = useState<string>(initialTime.hour);
  const [minute, setMinute] = useState<string>(initialTime.minute);

  // Initialize with default value if empty
  useEffect(() => {
    if (!value || value.trim() === "") {
      const defaultTime = "09:00";
      setHour("09");
      setMinute("00");
      // Notify parent of default value
      onChange(defaultTime);
    }
  }, []); // Only run on mount

  // Sync with external value changes
  useEffect(() => {
    const parsed = parseTime(value);
    const currentTime = `${hour}:${minute}`;
    if (value && value.trim() !== "" && value !== currentTime) {
      setHour(parsed.hour);
      setMinute(parsed.minute);
    } else if ((!value || value.trim() === "") && (hour !== "09" || minute !== "00")) {
      // Reset to default when value is cleared
      setHour("09");
      setMinute("00");
      onChange("09:00");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleHourChange = (newHour: string) => {
    setHour(newHour);
    onChange(`${newHour}:${minute}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    onChange(`${hour}:${newMinute}`);
  };

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const minutes = ["00", "15", "30", "45"];

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label className="text-sm">{label}</Label>}
      <div className="flex gap-2">
        <Select
          value={hour}
          onValueChange={handleHourChange}
          disabled={disabled}
        >
          <SelectTrigger className="bg-white flex-1">
            <SelectValue placeholder="시" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {hours.map((h) => (
              <SelectItem key={h} value={h}>
                {h}시
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={minute}
          onValueChange={handleMinuteChange}
          disabled={disabled}
        >
          <SelectTrigger className="bg-white flex-1">
            <SelectValue placeholder="분" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {minutes.map((m) => (
              <SelectItem key={m} value={m}>
                {m}분
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
