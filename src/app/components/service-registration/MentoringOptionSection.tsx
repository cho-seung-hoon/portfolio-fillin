
import { Plus, Trash2 } from "lucide-react";
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
import { PriceOption, ServiceOption } from "../ServiceRegistration";

interface MentoringOptionSectionProps {
    options: ServiceOption[];
    addOption: () => void;
    removeOption: (id: string) => void;
    updateOptionName: (id: string, name: string) => void;
    addPriceOption: (optionId: string) => void;
    removePriceOption: (optionId: string, priceOptionId: string) => void;
    updatePriceOption: (
        optionId: string,
        priceOptionId: string,
        field: keyof PriceOption,
        value: string,
    ) => void;
}

export function MentoringOptionSection({
    options,
    addOption,
    removeOption,
    updateOptionName,
    addPriceOption,
    removePriceOption,
    updatePriceOption,
}: MentoringOptionSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>멘토링 옵션</span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        className="gap-2"
                    >
                        <Plus className="size-4" />
                        옵션 추가
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <p className="text-sm text-gray-500 mb-4">
                        제공할 멘토링 옵션과 각 옵션별 시간/가격을 설정해주세요
                    </p>

                    <div className="space-y-3">
                        {options.map((option, index) => (
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
                                            updateOptionName(option.id, e.target.value)
                                        }
                                        placeholder={`옵션 ${index + 1} (예: 기본 상담)`}
                                        className="flex-1 bg-white"
                                    />
                                    {options.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeOption(option.id)}
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
            </CardContent>
        </Card>
    );
}
