📋 HƯỚNG DẪN TỔNG QUAN CHO JULES (SYSTEM CONTEXT)
Role: Senior Full-stack Developer (Node.js/TS, Python, DevOps)
Project: YouTube Music Library Tracker (Personal Tool)
Goal: Create a 3-container Docker application to sync, snapshot, and detect deleted/private videos from a personal YouTube Music account.
Tech Stack: Node.js (TypeScript), MongoDB (Mongoose), Docker Compose, Next.js or Vite (React + Tailwind + shadcn/ui), Python (for ytmusicapi).

PHASE 1: SCAFFOLDING & DOCKER ENVIRONMENT SETUP
🎯 Mục tiêu:
Thiết lập cấu trúc thư mục Monorepo và khởi chạy thành công môi trường Docker Compose gồm 3 services: mongodb, backend, frontend.

📝 Chỉ thị cho Jules:
Tạo cấu trúc thư mục dự án như sau:

├── backend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── .env.example

2. Viết file `docker-compose.yml` định nghĩa 3 services:
   * **`mongodb`**: Dùng image `mongo:latest`, cấu hình volume persistent lưu dữ liệu tại `./data/db`.
   * **`backend`**: Node.js + TypeScript environment, expose port `5000`. Cài đặt sẵn môi trường chạy được cả Node và lệnh Python cơ bản.
   * **`frontend`**: React/Next.js environment, expose port `3000`.
3. Thiết lập file `.env.example` chứa các biến: `MONGO_URI`, `YTM_COOKIE`, `PORT`.

> **Cách nghiệm thu (Verification):** Chạy lệnh `docker compose up --build` và đảm bảo cả 3 container đều "Alive", DB kết nối thành công không bị crash.

---

## PHASE 2: YOUTUBE MUSIC API BRIDGE (PYTHON-NODE)

### 🎯 Mục tiêu: 
Xây dựng module Core để Backend Node.js có thể lấy được danh sách bài hát từ YouTube Music thông qua cookie cá nhân.

### 📝 Chỉ thị cho Jules:
1. Viết một script Python nhỏ (`backend/src/scripts/ytm_fetch.py`) sử dụng thư viện `ytmusicapi`. 
   * Script này nhận vào chuỗi `YTM_COOKIE` từ biến môi trường.
   * Gọi hàm `ytmusic.get_liked_songs(limit=None)` hoặc quét các playlist.
   * Output: In ra chuỗi **JSON thuần** chứa mảng các bài hát với các trường: `videoId`, `title`, `artists`, `album`, `thumbnail`.
2. Trong Backend Node.js (`backend/src/services/ytmBridge.ts`), viết một hàm sử dụng `child_process.exec` hoặc `execa` để thực thi file Python trên, bắt lấy JSON output và parse thành mảng Object trong TypeScript.

> **Cách nghiệm thu (Verification):** Viết một script test nhanh (`test-bridge.ts`) để gọi hàm này. Nếu nó log ra được danh sách 10 bài hát gần nhất từ tài khoản YouTube Music của bạn dưới dạng JSON thành công là Đạt.

---

## PHASE 3: DATABASE SCHEMA & SNAPSHOT ENGINE (BACKEND CORE)

### 🎯 Mục tiêu: 
Thiết kế Schema MongoDB bằng Mongoose và viết Logic so sánh dữ liệu (Diffing Engine) để phát hiện nhạc bị xóa.

### 📝 Chỉ thị cho Jules:
1. Tạo `Track` Schema trong Mongoose với các trường:
   * `videoId` (String, Unique, Index)
   * `title` (String), `artists` (Array), `album` (String), `thumbnailUrl` (String)
   * `status` (String: `'ACTIVE'` hoặc `'REMOVED'`)
   * `lastSeen` (Date)
2. Viết hàm `syncLibrary()` thực hiện thuật toán **Snapshot & Diff**:
   * **B1:** Fetch toàn bộ nhạc hiện tại từ Phase 2.
   * **B2:** Với mỗi bài hát lấy được, dùng `findOneAndUpdate` với tùy chọn `{ upsert: true }` để cập nhật dữ liệu và gán `lastSeen = new Date()`, `status = 'ACTIVE'`.
   * **B3:** Sau khi duyệt hết, chạy lệnh `updateMany` đối với các Track có `status: 'ACTIVE'` nhưng `lastSeen` **nhỏ hơn** thời gian bắt đầu lượt quét này -> Chuyển trạng thái các bài này thành `'REMOVED'`.
3. Tích hợp thư viện `node-cron` để tự động chạy hàm `syncLibrary()` vào lúc 02:00 sáng mỗi ngày.

> **Cách nghiệm thu (Verification):** Giả lập dữ liệu trong DB, chạy hàm sync với một danh sách thiếu đi 1 bài hát, kiểm tra xem bài hát thiếu đó có tự động chuyển sang trạng thái `REMOVED` trong Compass/Atlas hay không.

---

## PHASE 4: BACKEND REST API ENDPOINTS

### 🎯 Mục tiêu: 
Tạo các API Endpoints bằng Express.js để cung cấp dữ liệu cho Frontend hiển thị.

### 📝 Chỉ thị cho Jules:
Tạo các Router và Controller xử lý các endpoint sau (đều trả về JSON):
* `GET /api/tracks/active`: Lấy danh sách nhạc hiện tại (hỗ trợ phân trang, tìm kiếm theo tên/ca sĩ).
* `GET /api/tracks/removed`: Lấy danh sách **các bài hát đã bị xóa hoặc mất tích** (Đây là tính năng cốt lõi của App).
* `POST /api/sync/trigger`: Endpoint cho phép người dùng bấm nút trên UI để kích hoạt lượt đồng bộ thủ công ngay lập tức thay vì đợi Cron Job.

---

## PHASE 5: FRONTEND UI WITH SHADCN/UI & TAILWIND

### 🎯 Mục tiêu: 
Xây dựng giao diện Dashboard trực quan, sạch sẽ để quản lý kho nhạc và tìm kiếm lại các bài đã mất.

### 📝 Chỉ thị cho Jules:
1. Setup Tailwind CSS và Shadcn UI vào dự án Frontend.
2. Thiết kế giao diện chính chia làm 2 Tabs (sử dụng Shadcn `Tabs` Component):
   * **Tab 1: Thư viện hiện tại (`ACTIVE`):** Dùng `Data Table` hiển thị danh sách nhạc gọn gàng.
   * **Tab 2: Nhạc đã mất (`REMOVED`):** Hiển thị danh sách các bài hát đã bị xóa với **Badge màu đỏ**. 
3. Ở mỗi hàng của bài hát đã mất, thêm một nút bấm hành động (Action Button): **"Tìm bản thay thế"**. Khi bấm vào, ứng dụng sẽ mở một tab trình duyệt mới (`window.open`) dẫn thẳng đến link tìm kiếm của YouTube với từ khóa được tự động điền: `[https://www.youtube.com/results?search_query=Ten_Bai_Hat+Ten_Ca_Si](https://www.youtube.com/results?search_query=Ten_Bai_Hat+Ten_Ca_Si)`.
4. Thêm một nút **"Đồng bộ ngay"** ở góc màn hình kết nối với endpoint `POST /api/sync/trigger`, hiển thị hiệu ứng Loading trong lúc đợi backend quét dữ liệu.

---
