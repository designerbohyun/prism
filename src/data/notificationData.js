// 알림 이력 더미 데이터
export const notificationHistoryData = [
  {
    id: 1,
    groupName: "A지역",
    cctvName: "CCTV-001",
    manager: "홍길동",
    errorType: "연결 끊김",
    occurredAt: "2025-01-15 14:30:25",
    severity: "critical"
  },
  {
    id: 2,
    groupName: "B사업장",
    cctvName: "CCTV-002",
    manager: "김철수",
    errorType: "화질 저하",
    occurredAt: "2025-01-15 13:45:12",
    severity: "warning"
  },
  {
    id: 3,
    groupName: "A지역",
    cctvName: "CCTV-003",
    manager: "이영희",
    errorType: "저장 오류",
    occurredAt: "2025-01-15 12:20:08",
    severity: "error"
  },
  {
    id: 4,
    groupName: "C구역",
    cctvName: "CCTV-004",
    manager: "박민수",
    errorType: "연결 끊김",
    occurredAt: "2025-01-15 11:15:33",
    severity: "critical"
  },
  {
    id: 5,
    groupName: "B사업장",
    cctvName: "CCTV-005",
    manager: "정하나",
    errorType: "네트워크 지연",
    occurredAt: "2025-01-15 10:50:17",
    severity: "warning"
  },
  {
    id: 6,
    groupName: "A지역",
    cctvName: "CCTV-006",
    manager: "홍길동",
    errorType: "화질 저하",
    occurredAt: "2025-01-15 09:35:44",
    severity: "warning"
  },
  {
    id: 7,
    groupName: "C구역",
    cctvName: "CCTV-007",
    manager: "김철수",
    errorType: "저장 오류",
    occurredAt: "2025-01-15 08:20:11",
    severity: "error"
  },
  {
    id: 8,
    groupName: "D건물",
    cctvName: "CCTV-008",
    manager: "이영희",
    errorType: "연결 끊김",
    occurredAt: "2025-01-15 07:45:29",
    severity: "critical"
  },
  {
    id: 9,
    groupName: "B사업장",
    cctvName: "CCTV-009",
    manager: "박민수",
    errorType: "디스크 용량 부족",
    occurredAt: "2025-01-15 06:30:15",
    severity: "error"
  },
  {
    id: 10,
    groupName: "E센터",
    cctvName: "CCTV-010",
    manager: "정하나",
    errorType: "화질 저하",
    occurredAt: "2025-01-15 05:15:02",
    severity: "warning"
  },
  {
    id: 11,
    groupName: "A지역",
    cctvName: "CCTV-011",
    manager: "홍길동",
    errorType: "네트워크 지연",
    occurredAt: "2025-01-14 23:55:38",
    severity: "info"
  },
  {
    id: 12,
    groupName: "C구역",
    cctvName: "CCTV-012",
    manager: "김철수",
    errorType: "저장 오류",
    occurredAt: "2025-01-14 22:40:26",
    severity: "error"
  },
  {
    id: 13,
    groupName: "F시설",
    cctvName: "CCTV-013",
    manager: "최민지",
    errorType: "연결 끊김",
    occurredAt: "2025-01-14 21:35:14",
    severity: "critical"
  },
  {
    id: 14,
    groupName: "B사업장",
    cctvName: "CCTV-014",
    manager: "김철수",
    errorType: "펌웨어 오류",
    occurredAt: "2025-01-14 20:15:47",
    severity: "error"
  },
  {
    id: 15,
    groupName: "G동",
    cctvName: "CCTV-015",
    manager: "장영수",
    errorType: "전원 이상",
    occurredAt: "2025-01-14 19:25:33",
    severity: "critical"
  }
];

// 심각도 레벨 정의
export const severityLevels = {
  critical: { text: '심각', color: 'red' },
  error: { text: '오류', color: 'orange' },
  warning: { text: '경고', color: 'yellow' },
  info: { text: '정보', color: 'blue' }
};

// 오류 유형 목록
export const errorTypes = [
  "연결 끊김",
  "화질 저하", 
  "저장 오류",
  "네트워크 지연",
  "디스크 용량 부족",
  "펌웨어 오류",
  "전원 이상"
];

// 그룹 목록 추출 함수
export const getUniqueGroups = () => {
  return [...new Set(notificationHistoryData.map(n => n.groupName))];
};

// 담당자 목록 추출 함수
export const getUniqueManagers = () => {
  return [...new Set(notificationHistoryData.map(n => n.manager))];
};