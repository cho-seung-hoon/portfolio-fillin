import { useState, useMemo } from "react";
import { InfLearnHeader } from "./components/InfLearnHeader";
import { HeroSection } from "./components/HeroSection";
import { CategoryTabs } from "./components/CategoryTabs";
import { CourseGrid } from "./components/CourseGrid";
import { PromoBanner } from "./components/PromoBanner";
import { InfLearnFooter } from "./components/InfLearnFooter";
import type { Course } from "./components/CourseCard";

// Mock course data
const allCourses: Course[] = [
  {
    id: 1,
    title: "처음 만난 React - 리액트 완벽 가이드 with Redux, Next.js, TypeScript",
    instructor: "김개발",
    price: 49500,
    originalPrice: 99000,
    rating: 4.9,
    studentCount: 2854,
    thumbnail: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudHxlbnwxfHx8fDE3NjcxODA4MDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "programming",
    level: "입문",
    tags: ["React", "JavaScript", "Web"],
    isNew: true,
    isBest: true,
  },
  {
    id: 2,
    title: "Python 데이터 분석 완벽 가이드 - Pandas, NumPy, Matplotlib",
    instructor: "박데이터",
    price: 39000,
    originalPrice: 78000,
    rating: 4.8,
    studentCount: 3241,
    thumbnail: "https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwYW5hbHl0aWNzfGVufDF8fHx8MTc2NzI0NjAwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "data",
    level: "초급",
    tags: ["Python", "데이터분석"],
    isBest: true,
  },
  {
    id: 3,
    title: "UI/UX 디자인 입문 - Figma로 시작하는 디자인",
    instructor: "이디자인",
    price: 35000,
    originalPrice: 70000,
    rating: 4.7,
    studentCount: 1892,
    thumbnail: "https://images.unsplash.com/photo-1716703435551-4326ab111ae2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzY3MTU0NjI2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "design",
    level: "입문",
    tags: ["Figma", "UI", "UX"],
    isNew: true,
  },
  {
    id: 4,
    title: "실전! 디지털 마케팅 A to Z - 구글 애널리틱스부터 광고 운영까지",
    instructor: "최마케터",
    price: 59000,
    originalPrice: 118000,
    rating: 4.6,
    studentCount: 1567,
    thumbnail: "https://images.unsplash.com/photo-1557838923-2985c318be48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nfGVufDF8fHx8MTc2NzE2MDQzNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "marketing",
    level: "중급",
    tags: ["마케팅", "광고", "분석"],
  },
  {
    id: 5,
    title: "머신러닝과 딥러닝 기초 - AI 개발자로 가는 첫 걸음",
    instructor: "정인공지능",
    price: 69000,
    originalPrice: 138000,
    rating: 4.8,
    studentCount: 2134,
    thumbnail: "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlfGVufDF8fHx8MTc2NzI0NjAwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "ai",
    level: "초급",
    tags: ["AI", "ML", "Python"],
    isBest: true,
  },
  {
    id: 6,
    title: "앱 개발 입문 - React Native로 크로스 플랫폼 앱 만들기",
    instructor: "강모바일",
    price: 54000,
    originalPrice: 108000,
    rating: 4.7,
    studentCount: 1789,
    thumbnail: "https://images.unsplash.com/photo-1633250391894-397930e3f5f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXZlbG9wbWVudHxlbnwxfHx8fDE3NjcyMzcxMDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "programming",
    level: "중급",
    tags: ["ReactNative", "앱개발"],
    isNew: true,
  },
  {
    id: 7,
    title: "스타트업 비즈니스 전략 - 린 스타트업으로 성공하기",
    instructor: "윤비즈니스",
    price: 44000,
    originalPrice: 88000,
    rating: 4.5,
    studentCount: 987,
    thumbnail: "https://images.unsplash.com/photo-1709715357520-5e1047a2b691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmd8ZW58MXx8fHwxNzY3MTQxNDA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "business",
    level: "중급",
    tags: ["스타트업", "비즈니스"],
  },
  {
    id: 8,
    title: "풀스택 웹 개발 - Node.js, Express, MongoDB로 완성하는 웹 서비스",
    instructor: "송풀스택",
    price: 64000,
    originalPrice: 128000,
    rating: 4.9,
    studentCount: 3456,
    thumbnail: "https://images.unsplash.com/photo-1565229284535-2cbbe3049123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBwcm9ncmFtbWluZ3xlbnwxfHx8fDE3NjcxOTUwNjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "programming",
    level: "고급",
    tags: ["Node.js", "MongoDB"],
    isBest: true,
  },
  {
    id: 9,
    title: "브랜드 디자인 실무 - 아이덴티티 디자인부터 가이드라인까지",
    instructor: "한브랜드",
    price: 47000,
    originalPrice: 94000,
    rating: 4.6,
    studentCount: 1234,
    thumbnail: "https://images.unsplash.com/photo-1716703435551-4326ab111ae2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzY3MTU0NjI2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "design",
    level: "중급",
    tags: ["브랜딩", "디자인"],
  },
  {
    id: 10,
    title: "SQL 기초부터 실무까지 - 데이터베이스 마스터하기",
    instructor: "오데이터베이스",
    price: 0,
    rating: 4.8,
    studentCount: 5678,
    thumbnail: "https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwYW5hbHl0aWNzfGVufDF8fHx8MTc2NzI0NjAwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "data",
    level: "입문",
    tags: ["SQL", "Database"],
    isNew: true,
    isBest: true,
  },
  {
    id: 11,
    title: "SNS 마케팅 실전 - 인스타그램, 페이스북 광고 마스터",
    instructor: "조SNS",
    price: 39000,
    originalPrice: 78000,
    rating: 4.5,
    studentCount: 2341,
    thumbnail: "https://images.unsplash.com/photo-1557838923-2985c318be48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nfGVufDF8fHx8MTc2NzE2MDQzNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "marketing",
    level: "초급",
    tags: ["SNS", "마케팅"],
  },
  {
    id: 12,
    title: "챗GPT 활용 AI 프롬프트 엔지니어링 - 업무 생산성 10배 높이기",
    instructor: "임AI활용",
    price: 29000,
    originalPrice: 58000,
    rating: 4.7,
    studentCount: 4567,
    thumbnail: "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlfGVufDF8fHx8MTc2NzI0NjAwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "ai",
    level: "입문",
    tags: ["ChatGPT", "AI", "생산성"],
    isNew: true,
    isBest: true,
  },
];

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter courses by category
  const filteredCourses = useMemo(() => {
    if (selectedCategory === "all") {
      return allCourses;
    }
    return allCourses.filter((course) => course.category === selectedCategory);
  }, [selectedCategory]);

  // Get best courses (top rated with isBest flag)
  const bestCourses = useMemo(() => {
    return allCourses.filter((course) => course.isBest).slice(0, 4);
  }, []);

  // Get new courses
  const newCourses = useMemo(() => {
    return allCourses.filter((course) => course.isNew).slice(0, 4);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <InfLearnHeader />
      <HeroSection />
      <CategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      {selectedCategory === "all" ? (
        <>
          <CourseGrid courses={bestCourses} title="🏆 베스트 강의" />
          <PromoBanner />
          <CourseGrid courses={newCourses} title="🆕 신규 강의" />
          <CourseGrid courses={allCourses.slice(0, 8)} title="📚 전체 강의" />
        </>
      ) : (
        <CourseGrid courses={filteredCourses} />
      )}
      
      <InfLearnFooter />
    </div>
  );
}