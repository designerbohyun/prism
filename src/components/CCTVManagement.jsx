import React, { useState, useEffect } from "react";

function CCTVManagement({ isDarkMode, onRegisterDrawerTrigger }) {
  const [cctvList, setCctvList] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add"); // "add", "view", "edit"
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

  useEffect(() => {
    fetch("http://localhost:8080/cctvs")
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
          status: item.status === "online" ? "ONLINE" : "offline",
        }));
        setCctvList(mapped);
      })
      .catch((err) => {
        console.error("CCTV 목록 불러오기 실패:", err);
      });
  }, []);

  // Dashboard에서 호출할 수 있도록 drawer 열기 함수 등록
  useEffect(() => {
    if (onRegisterDrawerTrigger) {
      onRegisterDrawerTrigger(() => handleAddCctv);
    }
  }, [onRegisterDrawerTrigger]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (drawerMode === "edit" && selectedCctv) {
      // 🔧 수정 모드 - 서버에 PUT 요청 보내기
      const updatedCctv = {
        locationName: formData.deviceName,
        locationAddress: formData.roadAddress,
        ipAddress: formData.ipAddress,
        hlsAddress: formData.hlsUrl,
        longitude: parseFloat(formData.longitude),
        latitude: parseFloat(formData.latitude),
      };

      try {
        const response = await fetch(
          `http://localhost:8080/cctvs/${selectedCctv.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCctv),
          }
        );

        if (!response.ok) throw new Error("CCTV 수정 실패");

        const result = await response.json();

        setCctvList((prev) =>
          prev.map((cctv) =>
            cctv.id === selectedCctv.id
              ? {
                  id: result.id,
                  deviceName: result.locationName,
                  ipAddress: result.ipAddress,
                  location: result.locationAddress,
                  hlsUrl: result.hlsAddress,
                  longitude: result.longitude,
                  latitude: result.latitude,
                  roadAddress: result.locationAddress,
                  status:
                    result.status?.toLowerCase() === "active"
                      ? "ONLINE"
                      : "offline",
                }
              : cctv
          )
        );

        setSelectedCctv(null);
        setIsDrawerOpen(false);
      } catch (err) {
        console.error(err);
        alert("CCTV 수정 중 오류 발생");
      }
    } else {
      // ✅ 등록 모드 - 서버에 POST 요청 보내기
      const newCctv = {
        locationName: formData.deviceName,
        locationAddress: formData.roadAddress,
        ipAddress: formData.ipAddress,
        hlsAddress: formData.hlsUrl,
        longitude: parseFloat(formData.longitude),
        latitude: parseFloat(formData.latitude),
        status: "ONLINE",
      };

      try {
        const response = await fetch("http://localhost:8080/cctvs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCctv),
        });

        if (!response.ok) throw new Error("CCTV 등록 실패");

        const result = await response.json();

        setCctvList((prev) => [
          ...prev,
          {
            id: result.id,
            deviceName: result.locationName,
            ipAddress: result.ipAddress,
            location: result.locationAddress,
            hlsUrl: result.hlsAddress,
            longitude: result.longitude,
            latitude: result.latitude,
            roadAddress: result.locationAddress,
            status: result.status === "active" ? "online" : "offline",
          },
        ]);
        setIsDrawerOpen(false);
      } catch (err) {
        console.error(err);
        alert("CCTV 등록 중 오류 발생");
      }
    }

    // 폼 초기화
    setFormData({
      deviceName: "",
      ipAddress: "",
      location: "",
      hlsUrl: "",
      longitude: "",
      latitude: "",
      roadAddress: "",
    });
  };

  const handleViewCctv = (cctv) => {
    setSelectedCctv(cctv);
    setDrawerMode("view");
    setIsDrawerOpen(true);
  };

  const handleEditCctv = () => {
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

  const handleDeleteCctv = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedCctv) {
      fetch(`http://localhost:8080/cctvs/${selectedCctv.id}`, {
        method: "DELETE",
      })
        .then((res) => {
          if (!res.ok) throw new Error("삭제 실패");
          setCctvList((prev) =>
            prev.filter((cctv) => cctv.id !== selectedCctv.id)
          );
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
          <table className="w-full">
            <thead className={`${isDarkMode ? "bg-gray-700" : "bg-gray-50"} `}>
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
              className={`${isDarkMode ? "bg-gray-800" : "bg-white"} divide-y ${
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
                        cctv.status === "ONLINE"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {cctv.status === "online" ? "ONLINE" : "OFFLINE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      장치명
                    </label>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedCctv?.deviceName}
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      IP 주소
                    </label>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedCctv?.ipAddress}
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      설치 위치
                    </label>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedCctv?.location}
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      상태
                    </label>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedCctv?.status === "ONLINE"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {selectedCctv?.status === "online" ? "ONLINE" : "OFFLINE"}
                    </span>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      HLS 스트리밍 URL
                    </label>
                    <p
                      className={`text-sm break-all ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedCctv?.hlsUrl}
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      좌표 (경도, 위도)
                    </label>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedCctv?.longitude}, {selectedCctv?.latitude}
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      도로명 주소
                    </label>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {selectedCctv?.roadAddress}
                    </p>
                  </div>
                </div>

                <div className="flex pt-4">
                  <button
                    onClick={handleDeleteCctv}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isDarkMode
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
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
