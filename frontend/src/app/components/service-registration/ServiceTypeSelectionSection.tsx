import { Users, Calendar, BookOpen, LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export interface ServiceType {
    value: string;
    label: string;
    icon: LucideIcon;
    description: string;
}

const SERVICE_TYPES: ServiceType[] = [
    {
        value: "1-1-mentoring",
        label: "1:1 멘토링",
        icon: Users,
        description: "멘토와 1대1로 진행하는 맞춤형 멘토링",
    },
    {
        value: "1-n-oneday",
        label: "1:N 원데이",
        icon: Calendar,
        description: "하루 완성 그룹 클래스",
    },
    {
        value: "1-n-study",
        label: "1:N 스터디",
        icon: BookOpen,
        description: "장기간 진행하는 그룹 스터디",
    },
];

interface ServiceTypeSelectionSectionProps {
    serviceType: string;
    setServiceType: (type: string) => void;
}

export function ServiceTypeSelectionSection({
    serviceType,
    setServiceType,
}: ServiceTypeSelectionSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>서비스 종류</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {SERVICE_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => setServiceType(type.value)}
                                className={`
                  p-4 rounded-md border-2 transition-all text-left
                  ${serviceType === type.value
                                        ? "border-[#00C471] bg-[#E6F9F2]"
                                        : "border-gray-200 hover:border-gray-300"
                                    }
                `}
                            >
                                <Icon
                                    className={`size-6 mb-2 ${serviceType === type.value
                                            ? "text-[#00C471]"
                                            : "text-gray-400"
                                        }`}
                                />
                                <h3
                                    className={`font-medium mb-1 ${serviceType === type.value
                                            ? "text-[#00C471]"
                                            : "text-gray-900"
                                        }`}
                                >
                                    {type.label}
                                </h3>
                                <p className="text-sm text-gray-600">{type.description}</p>
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
