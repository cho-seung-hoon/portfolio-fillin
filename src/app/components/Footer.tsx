export function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="mb-4">SHOP</h3>
            <p className="text-sm text-gray-600">
              최고의 쇼핑 경험을 제공하는
              <br />
              온라인 스토어입니다.
            </p>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="mb-4">고객센터</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-black">
                  공지사항
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  자주 묻는 질문
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  1:1 문의
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  배송조회
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="mb-4">회사소개</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-black">
                  회사소개
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  이용약관
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  개인정보처리방침
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-black">
                  제휴문의
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4">연락처</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>고객센터: 1588-0000</li>
              <li>평일 10:00 - 18:00</li>
              <li>주말 및 공휴일 휴무</li>
              <li>Email: support@shop.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© 2026 SHOP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
