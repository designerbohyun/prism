import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function PasswordReset() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }

    if (!email.includes("@")) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      // API 호출 예시
      // const response = await fetch('/api/password-reset', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('비밀번호 재설정 요청에 실패했습니다.');
      // }

      // 임시로 성공 처리
      setTimeout(() => {
        setMessage("이메일로 비밀번호 재설정 링크가 전송되었습니다.");
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setError("비밀번호 재설정 요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-center text-black mb-2">
            비밀번호 재설정
          </h1>
          <p className="text-sm text-gray-600 text-center">
            가입된 이메일로 비밀번호 재설정 링크를 보내드립니다.
          </p>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-600">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-gray-400"
              placeholder="이메일을 입력해 주세요."
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || message}
            className={`w-full py-3 text-white text-sm font-medium rounded transition-colors ${
              isLoading || message
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLoading ? "전송 중..." : "재설정 링크 보내기"}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={handleBackToLogin}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            이전으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default PasswordReset;
