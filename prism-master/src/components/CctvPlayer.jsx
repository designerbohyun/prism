import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

function CctvPlayer({ src }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!src) {
      console.warn("HLS src is empty or undefined");
      setError("스트림 주소가 없습니다.");
      setIsLoading(false);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    console.log("[CctvPlayer] mounting with src:", src);

    // 상태 초기화
    setIsLoading(true);
    setError(null);

    // 기존 HLS 인스턴스 정리
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
        enableSoftwareAES: true,
      });

      hlsRef.current = hls;

      // 미디어 연결
      hls.attachMedia(video);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log("✅ Video element attached, loading source");
        hls.loadSource(src);
      });

      // Manifest 파싱 완료 시
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("📋 Manifest parsed, attempting to play");
        setIsLoading(false);
        
        // 자동 재생 시도
        video.play().catch(err => {
          console.log("⚠️ Auto-play failed (this is normal):", err.message);
        });
      });

      // 레벨 로드 시작
      hls.on(Hls.Events.LEVEL_LOADING, () => {
        console.log("Level loading...");
      });

      // 에러 핸들링 (가장 중요한 부분)
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS.js error:", data);
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("네트워크 에러 - 재시도 중...");
              setError("네트워크 연결 오류");
              setIsLoading(false);
              
              // 재시도 로직
              setTimeout(() => {
                if (hlsRef.current) {
                  console.log("🔄 네트워크 에러 복구 시도");
                  hlsRef.current.startLoad();
                }
              }, 1000);
              break;
              
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("미디어 에러 - 복구 시도 중...");
              setError("미디어 재생 오류");
              
              try {
                hls.recoverMediaError();
                console.log("미디어 에러 복구 시도 완료");
              } catch (err) {
                console.error("미디어 에러 복구 실패:", err);
                setIsLoading(false);
              }
              break;
              
            default:
              console.error("치명적 HLS 에러:", data.details);
              setError(`재생 오류: ${data.details || '알 수 없는 오류'}`);
              setIsLoading(false);
              break;
          }
        } else {
          // 치명적이지 않은 에러
          console.warn("⚠️ HLS 경고:", data.details);
        }
      });

    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("Native HLS support, using direct src");
      video.src = src;
      
      const handleLoadStart = () => {
        console.log("네이티브 HLS 로딩 시작");
        setIsLoading(true);
      };
      
      const handleLoadedMetadata = () => {
        console.log("네이티브 HLS 메타데이터 로드 완료");
        setIsLoading(false);
        video.play().catch(err => {
          console.log("Auto-play failed:", err.message);
        });
      };
      
      const handleError = (e) => {
        console.error("네이티브 비디오 에러:", e);
        setError("비디오 재생 오류");
        setIsLoading(false);
      };
      
      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('error', handleError);
      
      // 클린업 함수에서 이벤트 리스너 제거
      return () => {
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('error', handleError);
      };
      
    } else {
      console.warn("HLS not supported in this browser");
      setError("이 브라우저에서는 HLS를 지원하지 않습니다.");
      setIsLoading(false);
    }

    // 클린업
    return () => {
      console.log("Destroying HLS instance");
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  // 수동 재생 함수
  const handleRetry = () => {
    console.log("수동 재시도 실행");
    setError(null);
    setIsLoading(true);
    
    if (hlsRef.current) {
      hlsRef.current.startLoad();
    } else if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error("재생 실패:", err);
        setError("재생할 수 없습니다. 브라우저에서 자동 재생이 차단되었을 수 있습니다.");
      });
    }
  };

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        controls
        muted
        playsInline
        style={{ width: "100%", height: "100%", background: "#000" }}
      />
      
      {/* 로딩 오버레이 */}
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white'
          }}
        >
          <div className="text-center">
            <div 
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                borderTop: '3px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 8px'
              }}
            ></div>
            <p style={{ fontSize: '14px', margin: 0 }}>스트림 로딩 중...</p>
          </div>
        </div>
      )}
      
      {/* 에러 오버레이 */}
      {error && (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white'
          }}
        >
          <div className="text-center" style={{ padding: '16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚠️</div>
            <p style={{ fontSize: '14px', marginBottom: '12px', margin: '0 0 12px 0' }}>
              {error}
            </p>
            <button 
              onClick={handleRetry}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
              다시 시도
            </button>
            <button 
              onClick={handlePlay}
              style={{
                padding: '8px 16px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
            >
              재생
            </button>
          </div>
        </div>
      )}
      
      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default CctvPlayer;