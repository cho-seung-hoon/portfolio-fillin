import { useNavigate } from "@tanstack/react-router";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectFooter } from "./ProjectFooter";
import { ChevronLeft } from "lucide-react";
import { legalDocsContent } from "../../data/legalDocsData";
import { handleSmartBack } from "../../utils/navigation";

interface LegalDocsProps {
    type: "terms" | "privacy";
}

export function LegalDocs({ type }: LegalDocsProps) {
    const navigate = useNavigate();



    const activeContent = legalDocsContent[type];

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <ProjectHeader
                onLoginClick={() => { }}
                onSignupClick={() => { }}
                onNavigateToMyPage={() => navigate({ to: "/mypage" })}
                onNavigateToMain={() => navigate({ to: "/" })}
            />

            <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
                <button
                    onClick={() => handleSmartBack(navigate)}
                    className="flex items-center gap-1 text-gray-400 hover:text-black transition-colors mb-12 text-sm"
                >
                    <ChevronLeft size={16} />
                    <span>뒤로 가기</span>
                </button>

                <div className="space-y-12">
                    <header className="border-b pb-8">
                        <div className="flex items-center gap-3 mb-2">
                            {activeContent.icon}
                            <h1 className="text-2xl font-bold text-black">{activeContent.title}</h1>
                        </div>
                        <p className="text-gray-500">{activeContent.subtitle}</p>
                    </header>

                    <div className="space-y-12">
                        {activeContent.sections.map((section, index) => (
                            <section key={index} className="space-y-4">
                                <h2 className="text-lg font-bold text-black">
                                    {section.title}
                                </h2>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {section.body}
                                </p>
                            </section>
                        ))}
                    </div>

                    <footer className="mt-20 pt-8 border-t border-gray-100 italic">
                        <p className="text-xs text-gray-400">
                            시행일자: {activeContent.effectiveDate}
                        </p>
                    </footer>
                </div>
            </main>

            <ProjectFooter />
        </div>
    );
}
