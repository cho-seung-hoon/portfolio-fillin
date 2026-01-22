import { Link } from "@tanstack/react-router";
import { Github, Mail, Clock, Info } from "lucide-react";

export function ProjectFooter() {
    return (
        <footer className="bg-[#F8F9FA] border-t mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-[#00C471]">Fillin</h3>
                        <p className="text-base font-bold text-gray-900 leading-tight">
                            "빈 시간을 '수익'과 '성장'으로 채우는<br />
                            틈새 능력 마켓, Fillin"
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <a
                                href="https://github.com/FillinV"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-[#00C471] transition-colors"
                                aria-label="GitHub"
                            >
                                <Github size={20} />
                            </a>
                            <a
                                href="mailto:fillin.official@gmail.com"
                                className="text-gray-500 hover:text-[#00C471] transition-colors"
                                aria-label="Email"
                            >
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Menu Column */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                            Quick Links
                        </h4>
                        <nav className="flex flex-col gap-2">
                            <Link
                                to="/"
                                className="text-sm text-gray-600 hover:text-[#00C471] transition-colors w-fit"
                            >
                                홈 (강의 목록)
                            </Link>
                            <Link
                                to="/service/register"
                                className="text-sm text-gray-600 hover:text-[#00C471] transition-colors w-fit"
                            >
                                강의 등록
                            </Link>
                            <Link
                                to="/mypage"
                                className="text-sm text-gray-600 hover:text-[#00C471] transition-colors w-fit"
                            >
                                마이페이지
                            </Link>
                        </nav>
                    </div>

                    {/* Contact & Team Column */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                            Support & Team
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                <Mail size={16} className="mt-0.5 shrink-0" />
                                <span>fillin.official@gmail.com</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                <Clock size={16} className="mt-0.5 shrink-0" />
                                <div>
                                    <p>평일 10:00 - 18:00</p>
                                    <p className="text-xs text-gray-400">(주말 및 공휴일 휴무)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-gray-600 pt-2 border-t border-gray-200">
                                <Info size={16} className="mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-800">Fillin 프로젝트 팀</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        본 서비스는 정식 출시를 준비 중인 베타 버전(Beta)이며,<br />
                                        현재는 교육 및 서비스 검증 목적으로 운영되고 있습니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">
                            © 2026 Fillin Team. All rights reserved.
                        </p>
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-full font-medium border border-gray-200">
                            v1.0.0
                        </span>
                    </div>
                    <div className="flex gap-6">
                        <Link
                            to="/terms"
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            이용약관
                        </Link>
                        <Link
                            to="/privacy"
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            개인정보처리방침
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
