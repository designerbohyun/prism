import React, { useState } from "react";
import { Link } from "react-router-dom";

function PrismLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  console.log("PrismLogin props:", onLoginSuccess);

  const handleSubmit = () => {
    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    setTimeout(() => {
      if (email === "admin@prism.com" && password === "password123") {
        console.log("로그인 성공!");
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-center text-black mb-6">
            로그인
          </h1>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
          <p className="font-semibold mb-1">테스트 계정:</p>
          <p>이메일: admin@prism.com</p>
          <p>비밀번호: password123</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
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

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-3 mt-6 text-white text-sm font-medium rounded transition-colors hover:cursor-pointer ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>

          <div className="text-center mt-4">
            <Link
              to="/password-reset"
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrismLogin;
