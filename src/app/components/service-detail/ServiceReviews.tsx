import { MessageSquare, Star } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { LessonDetail } from "../../../types/lesson";
import { getImageUrl } from "../../../utils/image";

interface ServiceReviewsProps {
    service: LessonDetail;
}

export function ServiceReviews({ service }: ServiceReviewsProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <MessageSquare className="size-5" />
                        수강생 리뷰
                    </h3>
                    <div className="flex items-center gap-2">
                        <Star className="size-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-2xl font-bold">{service.rating ? service.rating.toFixed(1) : "신규"}</span>
                        <span className="text-gray-500">({service.reviewCount}개)</span>
                    </div>
                </div>

                <div className="space-y-6">
                    {service.reviews.map((review) => (
                        <div
                            key={review.id}
                            className="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
                        >
                            <div className="flex items-start gap-3">
                                <img
                                    src={getImageUrl(review.avatar)}
                                    alt={review.userName}
                                    className="size-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <div className="font-medium">{review.userName}</div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    {Array.from({ length: 5 }).map((_, idx) => (
                                                        <Star
                                                            key={idx}
                                                            className={`size-3 ${idx < review.rating
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-gray-300"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span>•</span>
                                                <span>{review.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mb-3">{review.content}</p>
                                    <button className="text-sm text-gray-500 hover:text-gray-700">
                                        도움이 돼요 ({review.helpful})
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
