import React, { useState, useEffect } from "react";
import { API_BASE } from "../apiBase";

function CCTVAlertHistory({ isDarkMode }) {
  const [alertHistory, setAlertHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlertHistory();
  }, []);

  const fetchAlertHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/cctv-alerts`);
      const data = await response.json();
      setAlertHistory(data);
    } catch (err) {
      console.error("장애 이력 불러오기 실패:", err);
      // 샘플 데이터 사용
      const sampleHistory = [
        {
          id: 1,
          cctvName: "1층 로비 CCTV-01",
          cctvGroupName: "본사 1층",
          failureCriteria: "응답없음",
          severity: "위험",
          occurrenceTime: "2025-01-27T10:30:00Z",
          managerName: "김철수",
        },
        {
          id: 2,
          cctvName: "2층 회의실 CCTV-06",
          cctvGroupName: "본사 2층",
          failureCriteria: "지연",
          severity: "주의",
          occurrenceTime: "2025-01-27T09:15:00Z",
          managerName: "이영희",
        },
        {
          id: 3,
          cctvName: "지하주차장 B구역 CCTV-08",
          cctvGroupName: "주차장",
          failureCriteria: "정상",
          severity: "경고",
          occurrenceTime: "2025-01-26T18:45:00Z",
          managerName: "박민수",
        },
        {
          id: 4,
          cctvName: "정문 CCTV-10",
          cctvGroupName: "출입구",
          failureCriteria: "ping 요청 실패",
          severity: "심각",
          occurrenceTime: "2025-01-26T14:20:00Z",
          managerName: "관리자",
        },
        {
          id: 5,
          cctvName: "1층 엘리베이터 CCTV-03",
          cctvGroupName: "본사 1층",
          failureCriteria: "지연",
          severity: "주의",
          occurrenceTime: "2025-01-26T11:10:00Z",
          managerName: "김철수",
        },
        {
          id: 6,
          cctvName: "지상주차장 CCTV-09",
          cctvGroupName: "주차장",
          failureCriteria: "응답없음",
          severity: "심각",
          occurrenceTime: "2025-01-25T16:30:00Z",
          managerName: "박민수",
        },
        {
          id: 7,
          cctvName: "2층 사무실 CCTV-05",
          cctvGroupName: "본사 2층",
          failureCriteria: "정상",
          severity: "경고",
          occurrenceTime: "2025-01-25T13:25:00Z",
          managerName: "이영희",
        },
        {
          id: 8,
          cctvName: "후문 CCTV-11",
          cctvGroupName: "출입구",
          failureCriteria: "ping 요청 실패",
          severity: "위험",
          occurrenceTime: "2025-01-24T08:40:00Z",
          managerName: "관리자",
        },
      ];
      setAlertHistory(sampleHistory);
    }
    setIsLoading(false);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const getSeverityBadge = (severity) => {
    const badgeClasses = {
      "위험": "bg-red-500/20 text-red-600 border border-red-500/30",      // 가장 위험 - 빨간색
      "심각": "bg-orange-500/20 text-orange-600 border border-orange-500/30", // 심각 - 주황색
      "주의": "bg-yellow-500/20 text-yellow-600 border border-yellow-500/30", // 주의 - 노란색
      "경고": "bg-gray-500/20 text-gray-600 border border-gray-500/30",    // 경고 - 회색
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClasses[severity] || badgeClasses["경고"]}`}>
        {severity}
      </span>
    );
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            장애 이력을 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 장애 이력 테이블 */}
      {alertHistory.length === 0 ? (
        <div className={`${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border rounded-lg p-16`}>
          <div className="flex flex-col items-center justify-center">
            <svg
              className={`w-20 h-20 ${
                isDarkMode ? "text-gray-600" : "text-gray-400"
              } mb-4`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h4
              className={`text-lg font-medium ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              } mb-2`}
            >
              장애 이력이 없습니다
            </h4>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-500" : "text-gray-500"
              } text-center max-w-md`}
            >
              아직 등록된 장애 이력이 없습니다.
            </p>
          </div>
        </div>
      ) : (
        <div className={`${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border rounded-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    순번
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    장애 판단 기준
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    장애 심각도
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    CCTV명
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    CCTV 그룹명
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    장애 발생일시
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    담당자
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? "bg-gray-800" : "bg-white"} divide-y ${
                isDarkMode ? "divide-gray-700" : "divide-gray-200"
              }`}>
                {alertHistory.map((alert, index) => (
                  <tr key={alert.id} className={`hover:${isDarkMode ? "bg-gray-750" : "bg-gray-50"} transition-colors`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                      {index + 1}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}>
                      {alert.failureCriteria}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getSeverityBadge(alert.severity)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                      {alert.cctvName}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                      {alert.cctvGroupName}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                      {formatDateTime(alert.occurrenceTime)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                      {alert.managerName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CCTVAlertHistory;