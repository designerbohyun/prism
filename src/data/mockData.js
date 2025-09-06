// CCTV 목업 데이터
export const mockCctvList = [
  {
    id: 1,
    locationName: "본사 1층 로비",
    ipAddress: "192.168.1.101",
    status: "ACTIVE",
    hlsAddress:
      "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    groupId: 1,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보
    device_name: "본사 1층 로비",
    device_id: "CCTV-001-LOBBY-01",
    location_name: "본사 1층 로비",
    group_name: "본사 건물",
    ip_address: "192.168.1.101",
    last_heartbeat_at: new Date(Date.now() - 30 * 1000).toISOString(), // 30초 전
    uptime_seconds: 2847364, // 약 33일
    cpu_usage_pct: 23.5,
    mem_usage_pct: 67.2,
    mem_used_mb: 512,
    mem_total_mb: 762,
    disk_usage_pct: 45.8,
    disk_free_gb: 12.4,
    disk_total_gb: 22.9,
    device_temp_c: 42.3,
    rtt_ms: 12.4,
  },
  {
    id: 2,
    locationName: "본사 2층 회의실",
    ipAddress: "192.168.1.102",
    status: "ACTIVE",
    hlsAddress:
      "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
    groupId: 1,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보
    device_name: "본사 2층 회의실",
    device_id: "CCTV-002-MEETING-02",
    location_name: "본사 2층 회의실",
    group_name: "본사 건물",
    ip_address: "192.168.1.102",
    last_heartbeat_at: new Date(Date.now() - 15 * 1000).toISOString(), // 15초 전
    uptime_seconds: 1895432, // 약 22일
    cpu_usage_pct: 31.2,
    mem_usage_pct: 54.8,
    mem_used_mb: 418,
    mem_total_mb: 762,
    disk_usage_pct: 32.1,
    disk_free_gb: 15.5,
    disk_total_gb: 22.9,
    device_temp_c: 38.7,
    rtt_ms: 8.7,
  },
  {
    id: 3,
    locationName: "지하주차장 A구역",
    ipAddress: "192.168.1.103",
    status: "ACTIVE",
    hlsAddress:
      "https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.f4v.csmil/master.m3u8",
    groupId: 2,
    locationAddress: "서울시 강남구 테헤란로 123 지하",
    // 디바이스 상세 정보
    device_name: "지하주차장 A구역",
    device_id: "CCTV-003-PARKING-A",
    location_name: "지하주차장 A구역",
    group_name: "주차장",
    ip_address: "192.168.1.103",
    last_heartbeat_at: new Date(Date.now() - 45 * 1000).toISOString(), // 45초 전
    uptime_seconds: 2156789, // 약 25일
    cpu_usage_pct: 19.6,
    mem_usage_pct: 43.2,
    mem_used_mb: 329,
    mem_total_mb: 762,
    disk_usage_pct: 28.7,
    disk_free_gb: 16.3,
    disk_total_gb: 22.9,
    device_temp_c: 36.1,
    rtt_ms: 9.8,
  },
  {
    id: 4,
    locationName: "지하주차장 B구역",
    ipAddress: "192.168.1.104",
    status: "WARNING",
    hlsAddress:
      "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
    groupId: 2,
    locationAddress: "서울시 강남구 테헤란로 123 지하",
    // 디바이스 상세 정보 - WARNING 상태
    device_name: "지하주차장 B구역",
    device_id: "CCTV-004-PARKING-B",
    location_name: "지하주차장 B구역",
    group_name: "주차장",
    ip_address: "192.168.1.104",
    last_heartbeat_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2분 전
    uptime_seconds: 3024567, // 약 35일
    cpu_usage_pct: 78.9, // 높은 CPU 사용률
    mem_usage_pct: 89.3, // 높은 메모리 사용률
    mem_used_mb: 681,
    mem_total_mb: 762,
    disk_usage_pct: 92.5, // 높은 디스크 사용률
    disk_free_gb: 1.7,
    disk_total_gb: 22.9,
    device_temp_c: 67.8, // 높은 온도
    rtt_ms: 45.2, // 높은 지연
  },
  {
    id: 5,
    locationName: "정문 출입구",
    ipAddress: "192.168.1.105",
    status: "ACTIVE",
    hlsAddress:
      "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    groupId: 3,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보
    device_name: "정문 출입구",
    device_id: "CCTV-005-ENTRANCE-MAIN",
    location_name: "정문 출입구",
    group_name: "출입구",
    ip_address: "192.168.1.105",
    last_heartbeat_at: new Date(Date.now() - 20 * 1000).toISOString(), // 20초 전
    uptime_seconds: 4125674, // 약 48일
    cpu_usage_pct: 27.3,
    mem_usage_pct: 58.9,
    mem_used_mb: 449,
    mem_total_mb: 762,
    disk_usage_pct: 51.4,
    disk_free_gb: 11.1,
    disk_total_gb: 22.9,
    device_temp_c: 41.8,
    rtt_ms: 10.2,
  },
  {
    id: 6,
    locationName: "후문 출입구",
    ipAddress: "192.168.1.106",
    status: "OFFLINE",
    hlsAddress: "",
    groupId: 3,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보 - OFFLINE 상태
    device_name: "후문 출입구",
    device_id: "CCTV-006-EXIT-REAR",
    location_name: "후문 출입구",
    group_name: "출입구",
    ip_address: "192.168.1.106",
    last_heartbeat_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15분 전
    uptime_seconds: 0, // 오프라인
    cpu_usage_pct: 0,
    mem_usage_pct: 0,
    mem_used_mb: 0,
    mem_total_mb: 762,
    disk_usage_pct: 0,
    disk_free_gb: 0,
    disk_total_gb: 22.9,
    device_temp_c: 0,
    rtt_ms: 0, // 응답 없음
  },
  {
    id: 7,
    locationName: "3층 복도",
    ipAddress: "192.168.1.107",
    status: "ACTIVE",
    hlsAddress:
      "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    groupId: 1,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보
    device_name: "3층 복도",
    device_id: "CCTV-007-CORRIDOR-03",
    location_name: "3층 복도",
    group_name: "본사 건물",
    ip_address: "192.168.1.107",
    last_heartbeat_at: new Date(Date.now() - 5 * 1000).toISOString(), // 5초 전
    uptime_seconds: 3456789, // 약 40일
    cpu_usage_pct: 22.1,
    mem_usage_pct: 49.7,
    mem_used_mb: 379,
    mem_total_mb: 762,
    disk_usage_pct: 37.2,
    disk_free_gb: 14.4,
    disk_total_gb: 22.9,
    device_temp_c: 39.5,
    rtt_ms: 7.3,
  },
  {
    id: 8,
    locationName: "옥상",
    ipAddress: "192.168.1.108",
    status: "ACTIVE",
    hlsAddress:
      "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    groupId: 4,
    locationAddress: "서울시 강남구 테헤란로 123 옥상",
    // 디바이스 상세 정보
    device_name: "옥상",
    device_id: "CCTV-008-ROOFTOP-01",
    location_name: "옥상",
    group_name: "기타",
    ip_address: "192.168.1.108",
    last_heartbeat_at: new Date(Date.now() - 12 * 1000).toISOString(), // 12초 전
    uptime_seconds: 5234567, // 약 61일
    cpu_usage_pct: 18.9,
    mem_usage_pct: 41.3,
    mem_used_mb: 315,
    mem_total_mb: 762,
    disk_usage_pct: 23.6,
    disk_free_gb: 17.5,
    disk_total_gb: 22.9,
    device_temp_c: 48.7, // 옥상이라 온도 높음
    rtt_ms: 14.1,
  },
  {
    id: 9,
    locationName: "창고",
    ipAddress: "192.168.1.109",
    status: "WARNING",
    hlsAddress:
      "https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.f4v.csmil/master.m3u8",
    groupId: 4,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보 - WARNING 상태
    device_name: "창고",
    device_id: "CCTV-009-WAREHOUSE-01",
    location_name: "창고",
    group_name: "기타",
    ip_address: "192.168.1.109",
    last_heartbeat_at: new Date(Date.now() - 90 * 1000).toISOString(), // 90초 전
    uptime_seconds: 2847123, // 약 33일
    cpu_usage_pct: 65.7, // 높은 CPU 사용률
    mem_usage_pct: 78.4,
    mem_used_mb: 597,
    mem_total_mb: 762,
    disk_usage_pct: 68.3,
    disk_free_gb: 7.3,
    disk_total_gb: 22.9,
    device_temp_c: 52.1, // 높은 온도
    rtt_ms: 28.6,
  },
  {
    id: 10,
    locationName: "카페테리아",
    ipAddress: "192.168.1.110",
    status: "ACTIVE",
    hlsAddress:
      "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
    groupId: 1,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보
    device_name: "카페테리아",
    device_id: "CCTV-010-CAFETERIA-01",
    location_name: "카페테리아",
    group_name: "본사 건물",
    ip_address: "192.168.1.110",
    last_heartbeat_at: new Date(Date.now() - 8 * 1000).toISOString(), // 8초 전
    uptime_seconds: 1923456, // 약 22일
    cpu_usage_pct: 25.8,
    mem_usage_pct: 52.3,
    mem_used_mb: 398,
    mem_total_mb: 762,
    disk_usage_pct: 41.7,
    disk_free_gb: 13.3,
    disk_total_gb: 22.9,
    device_temp_c: 40.2,
    rtt_ms: 11.5,
  },
  {
    id: 11,
    locationName: "엘리베이터 홀",
    ipAddress: "192.168.1.111",
    status: "ACTIVE",
    hlsAddress:
      "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
    groupId: 1,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보
    device_name: "엘리베이터 홀",
    device_id: "CCTV-011-ELEVATOR-HALL",
    location_name: "엘리베이터 홀",
    group_name: "본사 건물",
    ip_address: "192.168.1.111",
    last_heartbeat_at: new Date(Date.now() - 3 * 1000).toISOString(), // 3초 전
    uptime_seconds: 4567890, // 약 53일
    cpu_usage_pct: 16.4,
    mem_usage_pct: 38.9,
    mem_used_mb: 296,
    mem_total_mb: 762,
    disk_usage_pct: 19.8,
    disk_free_gb: 18.4,
    disk_total_gb: 22.9,
    device_temp_c: 35.6,
    rtt_ms: 6.2,
  },
  {
    id: 12,
    locationName: "비상계단",
    ipAddress: "192.168.1.112",
    status: "ACTIVE",
    hlsAddress:
      "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    groupId: 1,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보
    device_name: "비상계단",
    device_id: "CCTV-012-EMERGENCY-STAIR",
    location_name: "비상계단",
    group_name: "본사 건물",
    ip_address: "192.168.1.112",
    last_heartbeat_at: new Date(Date.now() - 18 * 1000).toISOString(), // 18초 전
    uptime_seconds: 3678901, // 약 43일
    cpu_usage_pct: 21.7,
    mem_usage_pct: 45.6,
    mem_used_mb: 347,
    mem_total_mb: 762,
    disk_usage_pct: 33.4,
    disk_free_gb: 15.3,
    disk_total_gb: 22.9,
    device_temp_c: 37.9,
    rtt_ms: 9.1,
  },
  {
    id: 13,
    locationName: "4층 사무실",
    ipAddress: "192.168.1.113",
    status: "ACTIVE",
    hlsAddress:
      "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
    groupId: 1,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보
    device_name: "4층 사무실",
    device_id: "CCTV-013-OFFICE-04",
    location_name: "4층 사무실",
    group_name: "본사 건물",
    ip_address: "192.168.1.113",
    last_heartbeat_at: new Date(Date.now() - 7 * 1000).toISOString(), // 7초 전
    uptime_seconds: 2345678, // 약 27일
    cpu_usage_pct: 29.3,
    mem_usage_pct: 61.2,
    mem_used_mb: 467,
    mem_total_mb: 762,
    disk_usage_pct: 48.9,
    disk_free_gb: 11.7,
    disk_total_gb: 22.9,
    device_temp_c: 43.1,
    rtt_ms: 13.8,
  },
  {
    id: 14,
    locationName: "5층 회의실 A",
    ipAddress: "192.168.1.114",
    status: "WARNING",
    hlsAddress:
      "https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.f4v.csmil/master.m3u8",
    groupId: 1,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보 - WARNING 상태
    device_name: "5층 회의실 A",
    device_id: "CCTV-014-MEETING-A-05",
    location_name: "5층 회의실 A",
    group_name: "본사 건물",
    ip_address: "192.168.1.114",
    last_heartbeat_at: new Date(Date.now() - 75 * 1000).toISOString(), // 75초 전
    uptime_seconds: 1789234, // 약 21일
    cpu_usage_pct: 72.4, // 높은 CPU 사용률
    mem_usage_pct: 81.7,
    mem_used_mb: 622,
    mem_total_mb: 762,
    disk_usage_pct: 74.2,
    disk_free_gb: 5.9,
    disk_total_gb: 22.9,
    device_temp_c: 58.3, // 높은 온도
    rtt_ms: 32.7,
  },
  {
    id: 15,
    locationName: "5층 회의실 B",
    ipAddress: "192.168.1.115",
    status: "ACTIVE",
    hlsAddress:
      "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    groupId: 1,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보
    device_name: "5층 회의실 B",
    device_id: "CCTV-015-MEETING-B-05",
    location_name: "5층 회의실 B",
    group_name: "본사 건물",
    ip_address: "192.168.1.115",
    last_heartbeat_at: new Date(Date.now() - 11 * 1000).toISOString(), // 11초 전
    uptime_seconds: 3987654, // 약 46일
    cpu_usage_pct: 24.6,
    mem_usage_pct: 56.4,
    mem_used_mb: 430,
    mem_total_mb: 762,
    disk_usage_pct: 42.8,
    disk_free_gb: 13.1,
    disk_total_gb: 22.9,
    device_temp_c: 41.5,
    rtt_ms: 12.3,
  },
  {
    id: 16,
    locationName: "지하주차장 C구역",
    ipAddress: "192.168.1.116",
    status: "OFFLINE",
    hlsAddress: "",
    groupId: 2,
    locationAddress: "서울시 강남구 테헤란로 123 지하",
    // 디바이스 상세 정보 - OFFLINE 상태
    device_name: "지하주차장 C구역",
    device_id: "CCTV-016-PARKING-C",
    location_name: "지하주차장 C구역",
    group_name: "주차장",
    ip_address: "192.168.1.116",
    last_heartbeat_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25분 전
    uptime_seconds: 0, // 오프라인
    cpu_usage_pct: 0,
    mem_usage_pct: 0,
    mem_used_mb: 0,
    mem_total_mb: 762,
    disk_usage_pct: 0,
    disk_free_gb: 0,
    disk_total_gb: 22.9,
    device_temp_c: 0,
    rtt_ms: 0, // 응답 없음
  },
  {
    id: 17,
    locationName: "지하주차장 D구역",
    ipAddress: "192.168.1.117",
    status: "ACTIVE",
    hlsAddress:
      "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
    groupId: 2,
    locationAddress: "서울시 강남구 테헤란로 123 지하",
    // 디바이스 상세 정보
    device_name: "지하주차장 D구역",
    device_id: "CCTV-017-PARKING-D",
    location_name: "지하주차장 D구역",
    group_name: "주차장",
    ip_address: "192.168.1.117",
    last_heartbeat_at: new Date(Date.now() - 35 * 1000).toISOString(), // 35초 전
    uptime_seconds: 2674531, // 약 31일
    cpu_usage_pct: 17.8,
    mem_usage_pct: 42.9,
    mem_used_mb: 327,
    mem_total_mb: 762,
    disk_usage_pct: 29.3,
    disk_free_gb: 16.2,
    disk_total_gb: 22.9,
    device_temp_c: 37.4,
    rtt_ms: 8.9,
  },
  {
    id: 18,
    locationName: "서문 출입구",
    ipAddress: "192.168.1.118",
    status: "ACTIVE",
    hlsAddress:
      "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    groupId: 3,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보
    device_name: "서문 출입구",
    device_id: "CCTV-018-ENTRANCE-WEST",
    location_name: "서문 출입구",
    group_name: "출입구",
    ip_address: "192.168.1.118",
    last_heartbeat_at: new Date(Date.now() - 22 * 1000).toISOString(), // 22초 전
    uptime_seconds: 3456791, // 약 40일
    cpu_usage_pct: 26.1,
    mem_usage_pct: 55.7,
    mem_used_mb: 425,
    mem_total_mb: 762,
    disk_usage_pct: 38.9,
    disk_free_gb: 14.0,
    disk_total_gb: 22.9,
    device_temp_c: 40.8,
    rtt_ms: 11.7,
  },
  {
    id: 19,
    locationName: "동문 출입구",
    ipAddress: "192.168.1.119",
    status: "WARNING",
    hlsAddress:
      "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    groupId: 3,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보 - WARNING 상태
    device_name: "동문 출입구",
    device_id: "CCTV-019-ENTRANCE-EAST",
    location_name: "동문 출입구",
    group_name: "출입구",
    ip_address: "192.168.1.119",
    last_heartbeat_at: new Date(Date.now() - 105 * 1000).toISOString(), // 105초 전
    uptime_seconds: 1934567, // 약 22일
    cpu_usage_pct: 69.8, // 높은 CPU 사용률
    mem_usage_pct: 84.3,
    mem_used_mb: 642,
    mem_total_mb: 762,
    disk_usage_pct: 79.6,
    disk_free_gb: 4.7,
    disk_total_gb: 22.9,
    device_temp_c: 61.2, // 높은 온도
    rtt_ms: 38.4,
  },
  {
    id: 20,
    locationName: "기계실",
    ipAddress: "192.168.1.120",
    status: "ACTIVE",
    hlsAddress:
      "https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.f4v.csmil/master.m3u8",
    groupId: 4,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보
    device_name: "기계실",
    device_id: "CCTV-020-MACHINE-ROOM",
    location_name: "기계실",
    group_name: "기타",
    ip_address: "192.168.1.120",
    last_heartbeat_at: new Date(Date.now() - 28 * 1000).toISOString(), // 28초 전
    uptime_seconds: 4876543, // 약 56일
    cpu_usage_pct: 33.7,
    mem_usage_pct: 68.1,
    mem_used_mb: 519,
    mem_total_mb: 762,
    disk_usage_pct: 56.4,
    disk_free_gb: 10.0,
    disk_total_gb: 22.9,
    device_temp_c: 46.9, // 기계실이라 온도 높음
    rtt_ms: 15.6,
  },
  {
    id: 21,
    locationName: "전기실",
    ipAddress: "192.168.1.121",
    status: "ACTIVE",
    hlsAddress:
      "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
    groupId: 4,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보
    device_name: "전기실",
    device_id: "CCTV-021-ELECTRICAL-ROOM",
    location_name: "전기실",
    group_name: "기타",
    ip_address: "192.168.1.121",
    last_heartbeat_at: new Date(Date.now() - 16 * 1000).toISOString(), // 16초 전
    uptime_seconds: 3789456, // 약 44일
    cpu_usage_pct: 20.4,
    mem_usage_pct: 46.8,
    mem_used_mb: 357,
    mem_total_mb: 762,
    disk_usage_pct: 31.7,
    disk_free_gb: 15.6,
    disk_total_gb: 22.9,
    device_temp_c: 44.3,
    rtt_ms: 9.4,
  },
  {
    id: 22,
    locationName: "6층 임원실",
    ipAddress: "192.168.1.122",
    status: "ACTIVE",
    hlsAddress:
      "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6eba.m3u8",
    groupId: 1,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보
    device_name: "6층 임원실",
    device_id: "CCTV-022-EXECUTIVE-06",
    location_name: "6층 임원실",
    group_name: "본사 건물",
    ip_address: "192.168.1.122",
    last_heartbeat_at: new Date(Date.now() - 9 * 1000).toISOString(), // 9초 전
    uptime_seconds: 5123456, // 약 59일
    cpu_usage_pct: 15.7,
    mem_usage_pct: 39.2,
    mem_used_mb: 299,
    mem_total_mb: 762,
    disk_usage_pct: 22.8,
    disk_free_gb: 17.7,
    disk_total_gb: 22.9,
    device_temp_c: 36.4,
    rtt_ms: 6.8,
  },
  {
    id: 23,
    locationName: "보안실",
    ipAddress: "192.168.1.123",
    status: "ACTIVE",
    hlsAddress:
      "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    groupId: 4,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보
    device_name: "보안실",
    device_id: "CCTV-023-SECURITY-ROOM",
    location_name: "보안실",
    group_name: "기타",
    ip_address: "192.168.1.123",
    last_heartbeat_at: new Date(Date.now() - 4 * 1000).toISOString(), // 4초 전
    uptime_seconds: 6234567, // 약 72일
    cpu_usage_pct: 28.9,
    mem_usage_pct: 62.5,
    mem_used_mb: 476,
    mem_total_mb: 762,
    disk_usage_pct: 47.3,
    disk_free_gb: 12.1,
    disk_total_gb: 22.9,
    device_temp_c: 42.7,
    rtt_ms: 10.8,
  },
  {
    id: 24,
    locationName: "휴게실",
    ipAddress: "192.168.1.124",
    status: "WARNING",
    hlsAddress:
      "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    groupId: 1,
    locationAddress: "서울시 강남구 테헤란로 123",
    // 디바이스 상세 정보 - WARNING 상태
    device_name: "휴게실",
    device_id: "CCTV-024-REST-ROOM",
    location_name: "휴게실",
    group_name: "본사 건물",
    ip_address: "192.168.1.124",
    last_heartbeat_at: new Date(Date.now() - 120 * 1000).toISOString(), // 2분 전
    uptime_seconds: 1654321, // 약 19일
    cpu_usage_pct: 74.2, // 높은 CPU 사용률
    mem_usage_pct: 87.6,
    mem_used_mb: 668,
    mem_total_mb: 762,
    disk_usage_pct: 85.3,
    disk_free_gb: 3.4,
    disk_total_gb: 22.9,
    device_temp_c: 63.5, // 높은 온도
    rtt_ms: 41.8,
  },
  {
    id: 25,
    locationName: "외부 주차장",
    ipAddress: "192.168.1.125",
    status: "ACTIVE",
    hlsAddress:
      "https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.f4v.csmil/master.m3u8",
    groupId: 2,
    locationAddress: "서울시 강남구 테헤란로 123 외부",
    // 디바이스 상세 정보
    device_name: "외부 주차장",
    device_id: "CCTV-025-OUTDOOR-PARKING",
    location_name: "외부 주차장",
    group_name: "주차장",
    ip_address: "192.168.1.125",
    last_heartbeat_at: new Date(Date.now() - 42 * 1000).toISOString(), // 42초 전
    uptime_seconds: 4321098, // 약 50일
    cpu_usage_pct: 19.3,
    mem_usage_pct: 44.7,
    mem_used_mb: 341,
    mem_total_mb: 762,
    disk_usage_pct: 26.1,
    disk_free_gb: 16.9,
    disk_total_gb: 22.9,
    device_temp_c: 50.2, // 외부이라 온도 높음
    rtt_ms: 13.2,
  },
];

// CCTV 그룹 목업 데이터
export const mockCctvGroups = [
  { id: 1, name: "본사 건물", description: "본사 메인 건물 내부" },
  { id: 2, name: "주차장", description: "지하 주차장 구역" },
  { id: 3, name: "출입구", description: "정문/후문 출입구" },
  { id: 4, name: "기타", description: "기타 시설" },
];

// 알림 이력 목업 데이터
export const mockAlertHistory = [
  {
    id: 1,
    cctvName: "BETA 강의실",
    cctvGroupName: "강의실",
    failureCriteria: "응답없음",
    severity: "위험",
    occurrenceTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30분 전
    managerName: "강민석, 최현제",
  },
  {
    id: 2,
    cctvName: "ALPHA 강의실",
    cctvGroupName: "강의실",
    failureCriteria: "지연",
    severity: "주의",
    occurrenceTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
    managerName: "강민석",
  },
  {
    id: 3,
    cctvName: "BETA 강의실",
    cctvGroupName: "강의실",
    failureCriteria: "패킷 손실",
    severity: "주의",
    occurrenceTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4시간 전
    managerName: "최현제",
  },
];

// 사용자 목업 데이터
export const mockUsers = [
  {
    id: 1,
    name: "관리자",
    email: "admin@prism.com",
    role: "admin",
    department: "IT부서",
    lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: "강민석",
    email: "kang@prism.com",
    role: "operator",
    department: "장치관리팀",
    lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    name: "김시현",
    email: "kim@prism.com",
    role: "operator",
    department: "장치관리팀",
    lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    name: "이승표",
    email: "leek@prism.com",
    role: "operator",
    department: "장치관리팀",
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    name: "이상은",
    email: "sang@prism.com",
    role: "network_admin",
    department: "네트워크팀",
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    name: "최현제",
    email: "choi@prism.com",
    role: "network_admin",
    department: "네트워크팀",
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 7,
    name: "한선영",
    email: "han@prism.com",
    role: "network_admin",
    department: "네트워크팀",
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
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
  },
};
