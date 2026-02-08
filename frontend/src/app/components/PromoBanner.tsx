import { Button } from "./ui/button";

export function PromoBanner() {
  return (
    <section className="bg-gradient-to-r from-[#00C471] to-[#00B366] py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div>
            <h3 className="text-3xl mb-2">🎉 새해 맞이 특별 할인</h3>
            <p className="text-lg opacity-90">
              모든 강의 최대 70% 할인! 지금 바로 시작하세요
            </p>
          </div>
          <Button
            size="lg"
            className="bg-white text-[#00C471] hover:bg-gray-100 whitespace-nowrap"
          >
            할인 강의 보러가기
          </Button>
        </div>
      </div>
    </section>
  );
}