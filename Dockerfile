# 1단계: Node 환경에서 React 앱 빌드 (이미 빌드했으면 생략 가능)
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# 2단계: Nginx에 build 파일 배포
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]