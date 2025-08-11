# 1단계: Node 환경에서 React/Vite 빌드
FROM node:20-alpine AS builder
RUN apk --no-cache upgrade
WORKDIR /app

# 캐시 최적화: 의존성 먼저
COPY package*.json ./
RUN npm ci

# 앱 소스 복사
COPY . .

# .env.production → .env (빌드 타임 환경)
RUN cp .env.production .env

# 빌드
RUN npm run build

# 2단계: Nginx로 정적 파일 서빙
FROM nginx:alpine

# 빌드 산출물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# (선택) 헬스체크
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://127.0.0.1/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
