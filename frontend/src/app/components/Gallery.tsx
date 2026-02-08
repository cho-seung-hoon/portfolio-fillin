import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { getImageUrl } from "../../utils/image";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
}

interface GalleryProps {
  products: Product[];
}

export function Gallery({ products }: GalleryProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card
            key={product.id}
            className="group overflow-hidden border rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              >
                <Heart className="size-5" />
              </Button>
            </div>
            <div className="p-4">
              <h3 className="mb-1 line-clamp-1">{product.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${i < Math.floor(product.rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                        }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  ({product.rating.toFixed(1)})
                </span>
              </div>
              <p className="text-lg">{product.price.toLocaleString()}원</p>
            </div>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}
