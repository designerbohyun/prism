import React, { useState } from "react";

function PrismLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    console.log("로그인 시도:", { email, password });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* 제목 */}
        <div>
          <h1 className="text-3xl font-bold text-black mb-4">Prism</h1>
          <h2 className="text-xl font-semibold text-black mb-6">로그인</h2>
        </div>

        {/* 폼 영역 */}
        <div className="space-y-4">
          {/* 이메일 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-400"
              placeholder="이메일을 입력해 주세요."
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-400"
              placeholder="비밀번호를 입력해 주세요."
            />
          </div>

          {/* 로그인 버튼 */}
          <button
            onClick={handleSubmit}
            className="w-full py-3 mt-6 text-white text-sm font-medium bg-green-600 rounded hover:bg-green-700 transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrismLogin;
