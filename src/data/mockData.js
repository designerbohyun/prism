// CCTV 목업 데이터
export const mockCctvList = [
  {
    id: 1,
    locationName: "본사 1층 로비",
    ipAddress: "192.168.1.101",
    status: "ACTIVE",
    hlsAddress: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    groupId: 1,
    locationAddress: "서울시 강남구 테헤란로 123"
  },
  {
    id: 2,
    locationName: "본사 2층 회의실",
    ipAddress: "192.168.1.102",
    status: "ACTIVE",
    hlsAddress: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
    groupId: 1,
    locationAddress: "서울시 강남구 테헤란로 123"
  },
  {
    id: 3,
    locationName: "지하주차장 A구역",
    ipAddress: "192.168.1.103",
    status: "ACTIVE",
    hlsAddress: "https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.f4v.csmil/master.m3u8",
    groupId: 2,
    locationAddress: "서울시 강남구 테헤란로 123 지하"
  },
  {
    id: 4,
    locationName: "지하주차장 B구역",
    ipAddress: "192.168.1.104",
    status: "WARNING",
    hlsAddress: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
    groupId: 2,
    locationAddress: "서울시 강남구 테헤란로 123 지하"
  },
  {
    id: 5,
    locationName: "정문 출입구",
    ipAddress: "192.168.1.105",
    status: "ACTIVE",
    hlsAddress: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    groupId: 3,
    locationAddress: "서울시 강남구 테헤란로 123"
  },
  {
    id: 6,
    locationName: "후문 출입구",
    ipAddress: "192.168.1.106",
    status: "OFFLINE",
    hlsAddress: "",
    groupId: 3,
    locationAddress: "서울시 강남구 테헤란로 123"
  },
  {
    id: 7,
    locationName: "3층 복도",
    ipAddress: "192.168.1.107",
    status: "ACTIVE",
    hlsAddress: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    groupId: 1,
    locationAddress: "서울시 강남구 테헤란로 123"
  },
  {
    id: 8,
    locationName: "옥상",
    ipAddress: "192.168.1.108",
    status: "ACTIVE",
    hlsAddress: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    groupId: 4,
    locationAddress: "서울시 강남구 테헤란로 123 옥상"
  },
  {
    id: 9,
    locationName: "창고",
    ipAddress: "192.168.1.109",
    status: "WARNING",
    hlsAddress: "https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.f4v.csmil/master.m3u8",
    groupId: 4,
    locationAddress: "서울시 강남구 테헤란로 123"
  },
  {
    id: 10,
    locationName: "카페테리아",
    ipAddress: "192.168.1.110",
    status: "ACTIVE",
    hlsAddress: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
    groupId: 1,
    locationAddress: "서울시 강남구 테헤란로 123"
  },
  {
    id: 11,
    locationName: "엘리베이터 홀",
    ipAddress: "192.168.1.111",
    status: "ACTIVE",
    hlsAddress: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
    groupId: 1,
    locationAddress: "서울시 강남구 테헤란로 123"
  },
  {
    id: 12,
    locationName: "비상계단",
    ipAddress: "192.168.1.112",
    status: "ACTIVE",
    hlsAddress: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    groupId: 1,
    locationAddress: "서울시 강남구 테헤란로 123"
  }
];

// CCTV 그룹 목업 데이터
export const mockCctvGroups = [
  { id: 1, name: "본사 건물", description: "본사 메인 건물 내부" },
  { id: 2, name: "주차장", description: "지하 주차장 구역" },
  { id: 3, name: "출입구", description: "정문/후문 출입구" },
  { id: 4, name: "기타", description: "기타 시설" }
];

// 알림 이력 목업 데이터
export const mockAlertHistory = [
  {
    id: 1,
    cctvName: "후문 출입구",
    cctvGroupName: "출입구",
    failureCriteria: "응답없음",
    severity: "위험",
    occurrenceTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30분 전
    managerName: "김철수",
  },
  {
    id: 2,
    cctvName: "지하주차장 B구역",
    cctvGroupName: "주차장",
    failureCriteria: "지연",
    severity: "주의",
    occurrenceTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
    managerName: "이영희",
  },
  {
    id: 3,
    cctvName: "창고",
    cctvGroupName: "기타",
    failureCriteria: "패킷 손실",
    severity: "주의",
    occurrenceTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4시간 전
    managerName: "박민수",
  }
];

// 사용자 목업 데이터
export const mockUsers = [
  {
    id: 1,
    name: "관리자",
    email: "admin@prism.com",
    role: "admin",
    department: "IT부서",
    lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    name: "김철수",
    email: "kim@prism.com",
    role: "operator",
    department: "보안팀",
    lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    name: "이영희",
    email: "lee@prism.com",
    role: "operator",
    department: "시설팀",
    lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    name: "박민수",
    email: "park@prism.com",
    role: "network_admin",
    department: "네트워크팀",
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

// 목업 API 함수들
export const mockApi = {
  // CCTV 목록 조회
  getCctvList: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockCctvList);
      }, 300); // 네트워크 지연 시뮬레이션
    });
  },

  // 일일 카운트 조회
  getDailyCounts: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const today = mockCctvList.length;
        const yesterday = today - Math.floor(Math.random() * 3);
        resolve({ today, yesterday });
      }, 200);
    });
  },

  // 알림 이력 조회
  getAlertHistory: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockAlertHistory);
      }, 250);
    });
  },

  // 사용자 목록 조회
  getUsers: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockUsers);
      }, 200);
    });
  }
};