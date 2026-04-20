# 뽑기 🎲

학급 모둠 & 학생 뽑기 웹 애플리케이션

> Created by 임제민 | CSS Power by Claude.ai

---

## 기능

### 🎯 개인 뽑기
- **비복원 추출(풀 방식)** — 풀에 있는 번호가 모두 소진될 때까지 같은 번호가 나오지 않음
- 풀이 비면 자동으로 재충전, 순환 횟수 표시
- 남은 풀 현황 실시간 표시 (`남은 풀 X / Y명`)

### 👥 모둠 뽑기
- **페어링 히스토리 기반 최적화** — 이전에 같은 모둠이었던 학생 쌍을 기록하고, 다음 뽑기 시 반복 페어를 최소화
- 그리디 스왑 알고리즘(300회 반복)으로 가능한 한 새로운 조합 생성
- 기록 초기화 버튼 제공 (새 학기 시작 등)

#### ⚠️ 모둠 뽑기 한계
페어링 히스토리 방식은 학생 수와 모둠 크기에 따라 수학적 한계가 있음

| 전체 학생 | 모둠 수 | 모둠당 인원 | 한 번에 생기는 페어 | 전체 가능 페어 | 완전 소진까지 |
|:---------:|:-------:|:-----------:|:------------------:|:-------------:|:------------:|
| 16명 | 4모둠 | 4명 | 24쌍 | 120쌍 | **5회** |
| 20명 | 4모둠 | 5명 | 24쌍 | 190쌍 | **~8회** |
| 30명 | 5모둠 | 6명 | 50쌍 | 435쌍 | **~9회** |

N회 이후부터는 어떻게 해도 이전에 같은 모둠이었던 쌍이 반드시 생김. 알고리즘은 그 안에서 반복을 최대한 분산시킴.

### 📋 순서 뽑기
- Fisher-Yates 셔플로 전체 발표 순서를 무작위 배정
- 1~3위 메달 표시

### ⚙️ 설정
- 전체 학생 수 조정
- 모둠 수 조정
- 결석 번호 입력 (쉼표·공백 구분)

---

## 업데이트 내역

### 2026.03.10
- 프로젝트 초기 세팅
- 모둠 뽑기 / 개인 뽑기 / 순서 뽑기 기본 구현
- 모둠 결과 페이지, 내보내기 기능 추가

### 2026.04.20
- **개인 뽑기** 비복원 추출(풀 방식)로 로직 재구성 — 같은 번호 연속 출현 방지
- **모둠 뽑기** 페어링 히스토리 기반 최적화 — 반복 모둠 구성 최소화
- Docker 배포 환경 구성 (nginx:alpine + Cloudflare Tunnel)

---

## 기술 스택

- **Frontend** — React + Vite
- **배포** — Docker (nginx:alpine) + Cloudflare Tunnel

---

## 개발 환경 실행

```bash
npm install
npm run dev
```

---

## 배포 (Docker + Cloudflare Tunnel)

### 서버 구조
```
~/Website2/jemindraw/
├── docker-compose.yml
├── Dockerfile.nginx
├── nginx/conf.d/sites.conf
└── jemindraw/          ← git clone
```

### Cloudflare Tunnel 설정
```bash
cloudflared tunnel create <이름>
cloudflared tunnel route dns --overwrite-dns <이름> <도메인>

# config.yml 생성
cat > ~/.cloudflared/config.yml << EOF
tunnel: <터널 ID>
credentials-file: /etc/cloudflared/<터널 ID>.json

ingress:
  - hostname: <도메인>
    service: http://nginx:80
  - service: http_status:404
EOF

chmod 755 ~/.cloudflared
chmod 644 ~/.cloudflared/config.yml
chmod 644 ~/.cloudflared/<터널 ID>.json
```

### 실행
```bash
docker compose up -d --build
```

### 업데이트
```bash
cd jemindraw && git pull && cd ..
docker compose up -d --build nginx
```
