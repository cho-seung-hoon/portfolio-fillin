export function InfLearnFooter() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company */}
          <div>
            <h3 className="text-xl text-[#00C471] mb-4">인프런</h3>
            <p className="text-sm text-gray-600">
              지식을 나누고 함께 성장하는
              <br />
              온라인 학습 플랫폼
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4">인프런</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-[#00C471]">
                  인프런 소개
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00C471]">
                  인프런 채용
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00C471]">
                  인프런 블로그
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00C471]">
                  제휴 문의
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4">고객센터</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-[#00C471]">
                  자주 묻는 질문
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00C471]">
                  강의 등록 가이드
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00C471]">
                  수강 가이드
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00C471]">
                  1:1 문의하기
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4">이용약관</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-[#00C471]">
                  이용약관
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00C471]">
                  개인정보처리방침
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00C471]">
                  환불정책
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00C471]">
                  저작권 정책
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© 2026 Inflearn. All rights reserved.</p>
            <div className="flex gap-4">
              <span>사업자등록번호: 123-45-67890</span>
              <span>통신판매업: 제2024-서울강남-12345호</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
