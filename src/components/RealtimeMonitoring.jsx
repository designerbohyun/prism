import React, { useState, useEffect } from "react";
import CctvPlayer from "./CctvPlayer";
import { API_BASE } from "../apiBase";

function RealtimeMonitoring({ isDarkMode }) {
  const [cctvList, setCctvList] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState("2x2");
  const [selectedCctvs, setSelectedCctvs] = useState([]);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    // CCTV 목록 가져오기
    const sampleCctvs = [
      {
        id: 1,
        locationName: "1층 로비 CCTV-01",
        locationAddress: "본사 1층 정문 로비",
        status: "ACTIVE",
        hlsAddress: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
        ipAddress: "192.168.1.101",
        zone: "건물 내부",
        bandwidth: "10 Mbps",
        uptime: "99.2%"
      },
      {
        id: 2,
        locationName: "1층 복도 CCTV-02",
        locationAddress: "본사 1층 중앙 복도",
        status: "ACTIVE",
        hlsAddress: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
        ipAddress: "192.168.1.102",
        zone: "건물 내부",
        bandwidth: "8 Mbps",
        uptime: "99.8%"
      },
      {
        id: 3,
        locationName: "1층 카페 CCTV-03",
        locationAddress: "본사 1층 직원 카페",
        status: "OFFLINE",
        hlsAddress: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
        ipAddress: "192.168.1.103",
        zone: "건물 내부",
        bandwidth: "0 Mbps",
        uptime: "87.3%"
      },
      {
        id: 4,
        locationName: "1층 비상구 CCTV-04",
        locationAddress: "본사 1층 동쪽 비상구",
        status: "ACTIVE",
        hlsAddress: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
        ipAddress: "192.168.1.104",
        zone: "건물 내부",
        bandwidth: "12 Mbps",
        uptime: "98.7%"
      },
      {
        id: 5,
        locationName: "2층 사무실 CCTV-05",
        locationAddress: "본사 2층 개발팀 사무실",
        status: "ACTIVE",
        hlsAddress: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
        ipAddress: "192.168.1.105",
        zone: "건물 내부",
        bandwidth: "15 Mbps",
        uptime: "99.1%"
      },
      {
        id: 6,
        locationName: "2층 회의실 CCTV-06",
        locationAddress: "본사 2층 대회의실",
        status: "WARNING",
        hlsAddress: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
        ipAddress: "192.168.1.106",
        zone: "건물 내부",
        bandwidth: "6 Mbps",
        uptime: "96.4%"
      },
      {
        id: 7,
        locationName: "지하주차장 A구역 CCTV-07",
        locationAddress: "지하 1층 주차장 A구역",
        status: "ACTIVE",
        hlsAddress: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
        ipAddress: "192.168.1.107",
        zone: "지하주차장",
        bandwidth: "8 Mbps",
        uptime: "98.9%"
      },
      {
        id: 8,
        locationName: "지하주차장 B구역 CCTV-08",
        locationAddress: "지하 1층 주차장 B구역",
        status: "ACTIVE",
        hlsAddress: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
        ipAddress: "192.168.1.108",
        zone: "지하주차장",
        bandwidth: "7 Mbps",
        uptime: "97.8%"
      },
      {
        id: 9,
        locationName: "옥상 CCTV-09",
        locationAddress: "건물 옥상 중앙",
        status: "WARNING",
        hlsAddress: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
        ipAddress: "192.168.1.109",
        zone: "건물 외부",
        bandwidth: "4 Mbps",
        uptime: "94.2%"
      },
      {
        id: 10,
        locationName: "정문 CCTV-10",
        locationAddress: "건물 정문 출입구",
        status: "ACTIVE",
        hlsAddress: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
        ipAddress: "192.168.1.110",
        zone: "건물 외부",
        bandwidth: "12 Mbps",
        uptime: "99.5%"
      },
      {
        id: 11,
        locationName: "후문 CCTV-11",
        locationAddress: "건물 후문 출입구",
        status: "ACTIVE",
        hlsAddress: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
        ipAddress: "192.168.1.111",
        zone: "건물 외부",
        bandwidth: "10 Mbps",
        uptime: "98.6%"
      },
      {
        id: 12,
        locationName: "주차장 입구 CCTV-12",
        locationAddress: "지하주차장 진입로",
        status: "OFFLINE",
        hlsAddress: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
        ipAddress: "192.168.1.112",
        zone: "지하주차장",
        bandwidth: "0 Mbps",
        uptime: "82.1%"
      },
      {
        id: 13,
        locationName: "3층 복도 CCTV-13",
        locationAddress: "본사 3층 중앙 복도",
        status: "ACTIVE",
        hlsAddress: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
        ipAddress: "192.168.1.113",
        zone: "건물 내부",
        bandwidth: "9 Mbps",
        uptime: "98.3%"
      },
      {
        id: 14,
        locationName: "엘리베이터 CCTV-14",
        locationAddress: "본사 1층 엘리베이터",
        status: "ACTIVE",
        hlsAddress: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
        ipAddress: "192.168.1.114",
        zone: "건물 내부",
        bandwidth: "11 Mbps",
        uptime: "99.7%"
      },
      {
        id: 15,
        locationName: "서버룸 CCTV-15",
        locationAddress: "지하 1층 서버룸",
        status: "ACTIVE",
        hlsAddress: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
        ipAddress: "192.168.1.115",
        zone: "기술구역",
        bandwidth: "20 Mbps",
        uptime: "99.9%"
      }
    ];
    
    setCctvList(sampleCctvs);
    // 기본 선택 CCTV (다양한 상태의 CCTV 선택)
    setSelectedCctvs([1, 2, 6, 10]); // 정상, 정상, 경고, 정상 상태로 구성
  }, []);

  const getLayoutGrid = () => {
    switch(selectedLayout) {
      case "1x1": return { cols: 1, rows: 1 };
      case "2x2": return { cols: 2, rows: 2 };
      case "3x3": return { cols: 3, rows: 3 };
      case "4x4": return { cols: 4, rows: 4 };
      default: return { cols: 2, rows: 2 };
    }
  };

  const toggleCctvSelection = (cctvId) => {
    const layout = getLayoutGrid();
    const maxCctvs = layout.cols * layout.rows;
    
    if (selectedCctvs.includes(cctvId)) {
      setSelectedCctvs(selectedCctvs.filter(id => id !== cctvId));
    } else if (selectedCctvs.length < maxCctvs) {
      setSelectedCctvs([...selectedCctvs, cctvId]);
    }
  };

  const layout = getLayoutGrid();
  const maxCctvs = layout.cols * layout.rows;

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* 상단 컨트롤 */}
      <div className={`rounded-lg p-4 ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>
              실시간 CCTV 모니터링
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                레이아웃:
              </span>
              <select
                value={selectedLayout}
                onChange={(e) => setSelectedLayout(e.target.value)}
                className={`px-3 py-1 rounded-lg border text-sm ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="1x1">1x1</option>
                <option value="2x2">2x2</option>
                <option value="3x3">3x3</option>
                <option value="4x4">4x4</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                실시간 스트리밍
              </span>
            </div>
            {alertCount > 0 && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-red-500 bg-opacity-20 rounded-lg">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-500 font-medium">
                  {alertCount}건 이상 징후
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 메인 모니터링 그리드 */}
      <div className="flex-1 flex space-x-4">
        {/* CCTV 그리드 */}
        <div className={`flex-1 rounded-lg p-4 ${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border`}>
          <div 
            className={`grid gap-2 h-full`}
            style={{
              gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
              gridTemplateRows: `repeat(${layout.rows}, 1fr)`
            }}
          >
            {Array.from({ length: maxCctvs }).map((_, index) => {
              const cctvId = selectedCctvs[index];
              const cctv = cctvList.find(c => c.id === cctvId);
              
              return (
                <div key={index} className="relative bg-black rounded-lg overflow-hidden">
                  {cctv ? (
                    <>
                      <CctvPlayer src={cctv.hlsAddress} />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-white text-xs font-medium">{cctv.locationName}</p>
                        <p className="text-gray-300 text-xs">{cctv.locationAddress}</p>
                      </div>
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs text-gray-500">빈 슬롯</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CCTV 선택 패널 */}
        <div className={`w-80 rounded-lg p-4 ${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border`}>
          <h4 className={`text-sm font-semibold mb-3 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            CCTV 선택 ({selectedCctvs.length}/{maxCctvs})
          </h4>
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {cctvList.map(cctv => (
              <button
                key={cctv.id}
                onClick={() => toggleCctvSelection(cctv.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedCctvs.includes(cctv.id)
                    ? isDarkMode
                      ? "bg-teal-600 bg-opacity-20 border-teal-600 text-teal-400"
                      : "bg-teal-50 border-teal-500 text-teal-700"
                    : isDarkMode
                    ? "bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{cctv.locationName}</p>
                    <p className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                      {cctv.locationAddress}
                    </p>
                  </div>
                  {cctv.status === "ACTIVE" && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RealtimeMonitoring;