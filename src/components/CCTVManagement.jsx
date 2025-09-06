import React, { useState, useEffect } from "react";
import { API_BASE } from "../apiBase";
import { mockApi } from "../data/mockData";

function CCTVManagement({
  isDarkMode,
  onRegisterDrawerTrigger,
  onRefreshCctvs,
  userRole,
}) {
  const [cctvList, setCctvList] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add");
  const [selectedCctv, setSelectedCctv] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    deviceName: "",
    ipAddress: "",
    location: "",
    hlsUrl: "",
    longitude: "",
    latitude: "",
    roadAddress: "",
  });

  const statusBadgeClass = (s) => {
    switch (s) {
      case "ACTIVE":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "OFFLINE":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "WARNING":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const StatusBadge = ({ status }) => (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadgeClass(
        status
      )}`}
    >
      {status ?? "UNKNOWN"}
    </span>
  );

  // 목록 갱신 함수
  const fetchCctvList = async () => {
    // 관리자 계정일 때만 가데이터 사용
    if (userRole === "admin") {
      try {
        const mockData = await mockApi.getCctvList();
        const mapped = mockData.map((item) => ({
          id: item.id,
          deviceName: item.locationName,
          ipAddress: item.ipAddress,
          location: item.locationAddress,
          hlsUrl: item.hlsAddress,
          longitude: item.longitude || "",
          latitude: item.latitude || "",
          roadAddress: item.locationAddress,
          status: item.status?.toUpperCase() || "OFFLINE",
        }));
        setCctvList(mapped);
        return;
      } catch (err) {
        console.error("Mock CCTV 데이터 로드 실패:", err);
      }
    }

    // 서버 API 호출 (관리자가 아니거나 Mock 데이터 실패시)
    fetch(`${API_BASE}/cctvs`)
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((item) => ({
          id: item.id,
          deviceName: item.locationName,
          ipAddress: item.ipAddress,
          location: item.locationAddress,
          hlsUrl: item.hlsAddress,
          longitude: item.longitude,
          latitude: item.latitude,
          roadAddress: item.locationAddress,
          status: item.status?.toUpperCase() || "OFFLINE",
        }));
        setCctvList(mapped);
      })
      .catch((err) => {
        console.error("CCTV 목록 불러오기 실패:", err);
      });
  };

  useEffect(() => {
    fetchCctvList();
  }, [userRole]);

  useEffect(() => {
    if (onRegisterDrawerTrigger) {
      onRegisterDrawerTrigger(() => handleAddCctv);
    }
  }, [onRegisterDrawerTrigger]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cctvPayload = {
      locationName: formData.deviceName,
      locationAddress: formData.roadAddress,
      ipAddress: formData.ipAddress,
      hlsAddress: formData.hlsUrl,
      longitude: parseFloat(formData.longitude),
      latitude: parseFloat(formData.latitude),
    };

    try {
      let url = `${API_BASE}/cctvs`;
      let method = "POST";

      if (drawerMode === "edit" && selectedCctv) {
        url += `/${selectedCctv.id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cctvPayload),
      });

      if (!response.ok) throw new Error("CCTV 저장 실패");

      // 목록 갱신
      await onRefreshCctvs?.();
      fetchCctvList();

      // 폼 및 상태 초기화
      setSelectedCctv(null);
      setIsDrawerOpen(false);
      setFormData({
        deviceName: "",
        ipAddress: "",
        location: "",
        hlsUrl: "",
        longitude: "",
        latitude: "",
        roadAddress: "",
      });
    } catch (err) {
      console.error(err);
      alert("CCTV 저장 중 오류 발생");
    }
  };

  const handleDeleteCctv = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedCctv) {
      fetch(`${API_BASE}/cctvs/${selectedCctv.id}`, {
        method: "DELETE",
      })
        .then((res) => {
          if (!res.ok) throw new Error("삭제 실패");
          onRefreshCctvs?.();
          fetchCctvList();
          setShowDeleteModal(false);
          setIsDrawerOpen(false);
          setSelectedCctv(null);
        })
        .catch((err) => {
          console.error("삭제 요청 실패:", err);
        });
    }
  };

  const handleAddCctv = () => {
    setSelectedCctv(null);
    setDrawerMode("add");
    setFormData({
      deviceName: "",
      ipAddress: "",
      location: "",
      hlsUrl: "",
      longitude: "",
      latitude: "",
      roadAddress: "",
    });
    setIsDrawerOpen(true);
  };

  const handleViewCctv = (cctv) => {
    setSelectedCctv(cctv);
    setDrawerMode("view");
    setIsDrawerOpen(true);
  };

  const handleEditCctv = () => {
    if (!selectedCctv) return;
    if (selectedCctv) {
      setFormData({
        deviceName: selectedCctv.deviceName || "",
        ipAddress: selectedCctv.ipAddress || "",
        location: selectedCctv.location || "",
        hlsUrl: selectedCctv.hlsUrl || "",
        longitude: selectedCctv.longitude || "",
        latitude: selectedCctv.latitude || "",
        roadAddress: selectedCctv.roadAddress || "",
      });
      setDrawerMode("edit");
    }
  };

  return (
    <div className="space-y-6">
      {/* 목록 화면 */}
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border rounded-lg overflow-hidden`}
      >
        <div className="overflow-x-auto">
          {cctvList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
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
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <h4
                className={`text-lg font-medium ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                } mb-2`}
              >
                등록된 CCTV가 없습니다
              </h4>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                } text-center max-w-md mb-6`}
              >
                상단의 'CCTV 등록' 버튼을 클릭하여 새로운 CCTV를 등록해주세요.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead
                className={`${isDarkMode ? "bg-gray-700" : "bg-gray-50"} `}
              >
                <tr>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    장치명
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    IP 주소
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    설치 위치
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    상태
                  </th>
                </tr>
              </thead>
              <tbody
                className={`${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } divide-y ${
                  isDarkMode ? "divide-gray-700" : "divide-gray-200"
                }`}
              >
                {cctvList.map((cctv) => (
                  <tr key={cctv.id}>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      <button
                        onClick={() => handleViewCctv(cctv)}
                        className={`underline cursor-pointer font-semibold ${
                          isDarkMode
                            ? "text-gray-400 hover:text-gray-300"
                            : "text-gray-600 hover:text-gray-700"
                        }`}
                      >
                        {cctv.deviceName}
                      </button>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {cctv.ipAddress}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {cctv.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          (cctv.status ?? "UNKNOWN") === "ACTIVE"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : (cctv.status ?? "UNKNOWN") === "OFFLINE"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : (cctv.status ?? "UNKNOWN") === "WARNING"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}
                      >
                        {cctv.status ?? "UNKNOWN"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Drawer */}
      {isDrawerOpen && (
        <>
          {/* 오버레이 */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer */}
          <div
            className={`fixed right-0 top-0 h-full w-full max-w-md z-50 transform transition-transform duration-300 ease-in-out ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border-l shadow-xl overflow-y-auto`}
          >
            {/* 헤더 */}
            <div
              className={`px-6 py-4 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              } flex items-center justify-between`}
            >
              <div className="flex items-center space-x-3">
                {drawerMode === "view" && (
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                        : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                    }`}
                    title="뒤로가기"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                )}
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {drawerMode === "add"
                    ? "CCTV 등록"
                    : drawerMode === "edit"
                    ? "CCTV 수정"
                    : "CCTV 상세 정보"}
                </h3>
              </div>
              {drawerMode === "view" ? (
                <button
                  onClick={handleEditCctv}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                      : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  }`}
                  title="수정"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                      : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  }`}
                  title="닫기"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* 내용 */}
            {drawerMode === "add" || drawerMode === "edit" ? (
              /* 등록 폼 */
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    장치명 *
                  </label>
                  <input
                    type="text"
                    name="deviceName"
                    value={formData.deviceName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="장치명을 입력해주세요"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    IP 주소 *
                  </label>
                  <input
                    type="text"
                    name="ipAddress"
                    value={formData.ipAddress}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="192.168.1.100"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    설치 위치 *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="설치 위치를 입력해주세요"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    HLS 스트리밍 URL *
                  </label>
                  <input
                    type="url"
                    name="hlsUrl"
                    value={formData.hlsUrl}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="https://example.com/stream.m3u8"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    경도 *
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="127.0276"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    위도 *
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="37.4979"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    도로명 주소 *
                  </label>
                  <input
                    type="text"
                    name="roadAddress"
                    value={formData.roadAddress}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="서울특별시 강남구 테헤란로 427"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    {drawerMode === "edit" ? "수정" : "등록"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      isDarkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    취소
                  </button>
                </div>
              </form>
            ) : (
              /* 세부 정보 표시 */
              <div className="overflow-y-auto">
                {/* 기본 정보 섹션 */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-4">
                    <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h4 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      기본 정보
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          장치명
                        </label>
                      </div>
                      <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {selectedCctv?.deviceName}
                      </p>
                    </div>

                    <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          IP 주소
                        </label>
                      </div>
                      <p className={`text-sm font-mono ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {selectedCctv?.ipAddress}
                      </p>
                    </div>

                    <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          설치 위치
                        </label>
                      </div>
                      <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {selectedCctv?.location}
                      </p>
                    </div>

                    <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          상태
                        </label>
                      </div>
                      <StatusBadge status={selectedCctv?.status} />
                    </div>
                  </div>

                  {/* 위치 정보 */}
                  <div className="mt-4">
                    <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          도로명 주소
                        </label>
                      </div>
                      <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {selectedCctv?.roadAddress}
                      </p>
                      <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        좌표: {selectedCctv?.longitude}, {selectedCctv?.latitude}
                      </p>
                    </div>
                  </div>

                  {/* 스트리밍 정보 */}
                  <div className="mt-4">
                    <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293L12 11l.707-.707A1 1 0 0113.414 10H15m-6 6h6m2-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          HLS 스트리밍 URL
                        </label>
                      </div>
                      <p className={`text-xs break-all font-mono ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {selectedCctv?.hlsUrl}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 디바이스 상세 정보 섹션 */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-4">
                    <svg className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    <h4 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      디바이스 정보
                    </h4>
                  </div>

                  {/* 기본 디바이스 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          장치 ID
                        </label>
                      </div>
                      <p className={`text-sm font-mono ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {selectedCctv?.device_id || "N/A"}
                      </p>
                    </div>

                    <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          그룹명
                        </label>
                      </div>
                      <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {selectedCctv?.group_name || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* 상태 및 연결 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          마지막 하트비트
                        </label>
                      </div>
                      <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {selectedCctv?.last_heartbeat_at 
                          ? new Date(selectedCctv.last_heartbeat_at).toLocaleString('ko-KR')
                          : "N/A"}
                      </p>
                    </div>

                    <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          업타임
                        </label>
                      </div>
                      <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {selectedCctv?.uptime_seconds 
                          ? `${Math.floor(selectedCctv.uptime_seconds / 86400)}일 ${Math.floor((selectedCctv.uptime_seconds % 86400) / 3600)}시간`
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* 시스템 리소스 모니터링 */}
                  <div className="mb-4">
                    <h5 className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      시스템 리소스 모니터링
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className={`p-4 rounded-lg border ${
                        selectedCctv?.cpu_usage_pct > 80 
                          ? isDarkMode ? "bg-red-900/20 border-red-500" : "bg-red-50 border-red-300"
                          : isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                            <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              CPU 사용률
                            </label>
                          </div>
                          {selectedCctv?.cpu_usage_pct > 80 && (
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <p className={`text-lg font-bold ${
                          selectedCctv?.cpu_usage_pct > 80 
                            ? isDarkMode ? "text-red-400" : "text-red-600"
                            : isDarkMode ? "text-white" : "text-gray-900"
                        }`}>
                          {selectedCctv?.cpu_usage_pct ? `${selectedCctv.cpu_usage_pct}%` : "N/A"}
                        </p>
                      </div>

                      <div className={`p-4 rounded-lg border ${
                        selectedCctv?.mem_usage_pct > 85 
                          ? isDarkMode ? "bg-red-900/20 border-red-500" : "bg-red-50 border-red-300"
                          : isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                            <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              메모리
                            </label>
                          </div>
                          {selectedCctv?.mem_usage_pct > 85 && (
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <p className={`text-lg font-bold ${
                          selectedCctv?.mem_usage_pct > 85 
                            ? isDarkMode ? "text-red-400" : "text-red-600"
                            : isDarkMode ? "text-white" : "text-gray-900"
                        }`}>
                          {selectedCctv?.mem_usage_pct ? `${selectedCctv.mem_usage_pct}%` : "N/A"}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {selectedCctv?.mem_used_mb && selectedCctv?.mem_total_mb 
                            ? `${selectedCctv.mem_used_mb}MB / ${selectedCctv.mem_total_mb}MB`
                            : ""}
                        </p>
                      </div>

                      <div className={`p-4 rounded-lg border ${
                        selectedCctv?.disk_usage_pct > 90 
                          ? isDarkMode ? "bg-red-900/20 border-red-500" : "bg-red-50 border-red-300"
                          : isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              디스크
                            </label>
                          </div>
                          {selectedCctv?.disk_usage_pct > 90 && (
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <p className={`text-lg font-bold ${
                          selectedCctv?.disk_usage_pct > 90 
                            ? isDarkMode ? "text-red-400" : "text-red-600"
                            : isDarkMode ? "text-white" : "text-gray-900"
                        }`}>
                          {selectedCctv?.disk_usage_pct ? `${selectedCctv.disk_usage_pct}%` : "N/A"}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {selectedCctv?.disk_free_gb && selectedCctv?.disk_total_gb 
                            ? `${selectedCctv.disk_free_gb}GB 사용 가능 / ${selectedCctv.disk_total_gb}GB`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 환경 및 네트워크 정보 */}
                  <div>
                    <h5 className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      환경 및 네트워크
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg border ${
                        selectedCctv?.device_temp_c > 60 
                          ? isDarkMode ? "bg-red-900/20 border-red-500" : "bg-red-50 border-red-300"
                          : isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              장치 온도
                            </label>
                          </div>
                          {selectedCctv?.device_temp_c > 60 && (
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <p className={`text-lg font-bold ${
                          selectedCctv?.device_temp_c > 60 
                            ? isDarkMode ? "text-red-400" : "text-red-600"
                            : isDarkMode ? "text-white" : "text-gray-900"
                        }`}>
                          {selectedCctv?.device_temp_c ? `${selectedCctv.device_temp_c}℃` : "N/A"}
                        </p>
                      </div>

                      <div className={`p-4 rounded-lg border ${
                        selectedCctv?.rtt_ms > 30 
                          ? isDarkMode ? "bg-yellow-900/20 border-yellow-500" : "bg-yellow-50 border-yellow-300"
                          : isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                            </svg>
                            <label className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              네트워크 지연
                            </label>
                          </div>
                          {selectedCctv?.rtt_ms > 30 && (
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <p className={`text-lg font-bold ${
                          selectedCctv?.rtt_ms > 30 
                            ? isDarkMode ? "text-yellow-400" : "text-yellow-600"
                            : isDarkMode ? "text-white" : "text-gray-900"
                        }`}>
                          {selectedCctv?.rtt_ms ? `${selectedCctv.rtt_ms}ms` : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 관리 버튼 */}
                <div className="p-6">
                  <button
                    onClick={handleDeleteCctv}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    삭제
                  </button>
                </div>

              </div>
            )}
          </div>
        </>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className={`w-full max-w-md rounded-lg shadow-xl ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } border`}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h3
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    CCTV 삭제 확인
                  </h3>
                </div>
                <p
                  className={`text-sm mb-6 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <span className="font-medium">
                    {selectedCctv?.deviceName}
                  </span>{" "}
                  CCTV를 정말 삭제하시겠습니까?
                  <br />
                  삭제된 데이터는 복구할 수 없습니다.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      isDarkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    취소
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CCTVManagement;
