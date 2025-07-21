import React from "react";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          CCTV Management System
        </h1>
        <p className="text-gray-600 mb-6">React + Tailwind CSS 개발 환경</p>
        <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200">
          시작하기
        </button>
      </div>
    </div>
  );
}

export default App;
