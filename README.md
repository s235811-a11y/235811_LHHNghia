# Hệ thống quản lý thiết bị phòng học

## Mô tả đề tài

Ứng dụng web quản lý thiết bị phòng học gồm frontend, backend API và cơ sở dữ liệu MongoDB Atlas. Hệ thống hỗ trợ xem danh sách, xem chi tiết, thêm, cập nhật, xóa, tìm kiếm thiết bị và theo dõi tình trạng sử dụng (Đang sử dụng, Hư hỏng, Đang sửa chữa, Ngừng sử dụng).

- Sinh viên: Lê Huỳnh Hiếu Nghĩa
- MSSV: 235811

## Công nghệ sử dụng

- Frontend: React (Vite)
- Backend: Node.js, Express, Mongoose
- Cơ sở dữ liệu: MongoDB Atlas
- Đóng gói: Docker, Docker Hub
- Triển khai: Render
- Quản lý mã nguồn: Git, GitHub

## Cấu trúc dự án

```
235811_LHHNghia/
├── backend/
│   ├── models/Device.js
│   ├── routes/devices.js
│   ├── server.js
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   └── sample-data.json
├── frontend/
│   ├── src/App.jsx
│   ├── src/App.css
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .dockerignore
│   └── .env.example
└── README.md
```

## Cơ sở dữ liệu

- Database: `235811_LHHNghia`
- Collection: `devices`
- Các trường: deviceId, name, deviceType, room, brand, model, quantity, status, purchaseDate, description
- Dữ liệu mẫu nằm trong `backend/sample-data.json`

## API

| Phương thức | Endpoint | Chức năng |
|---|---|---|
| GET | /health | Kiểm tra trạng thái backend |
| GET | /api/devices | Lấy danh sách thiết bị |
| GET | /api/devices?search=từ-khóa | Tìm kiếm theo mã, tên, loại, phòng |
| GET | /api/devices/:id | Xem một thiết bị |
| POST | /api/devices | Thêm thiết bị |
| PUT | /api/devices/:id | Cập nhật thiết bị |
| DELETE | /api/devices/:id | Xóa thiết bị |

## Hướng dẫn cài đặt và chạy local

### Backend

```bash
cd backend
cp .env.example .env     # điền MONGODB_URI thật vào file .env
npm install
npm start
```

Các biến môi trường của backend (xem `backend/.env.example`):

- `PORT`: cổng chạy (mặc định 5000)
- `MONGODB_URI`: chuỗi kết nối MongoDB Atlas
- `CORS_ORIGIN`: địa chỉ frontend được phép gọi API

### Frontend

```bash
cd frontend
cp .env.example .env     # VITE_API_URL trỏ đến backend
npm install
npm run dev
```

Mở trình duyệt tại http://localhost:5173

## Chạy backend bằng Docker

```bash
docker pull lhhnghia1908/backend:latest
docker run -p 5000:5000 -e MONGODB_URI="<chuoi-ket-noi>" -e CORS_ORIGIN="*" lhhnghia1908/backend:latest
```

Tự build image:

```bash
cd backend
docker build -t lhhnghia1908/backend:latest .
```

Docker Hub: https://hub.docker.com/r/lhhnghia1908/backend

## Chạy frontend bằng Docker

Địa chỉ backend được nhúng vào lúc build thông qua `VITE_API_URL`.

```bash
docker build --build-arg VITE_API_URL=https://api-235811.onrender.com -t lhhnghia1908/frontend:latest ./frontend
docker run -p 8080:80 lhhnghia1908/frontend:latest
```

Hoặc dùng image có sẵn:

```bash
docker pull lhhnghia1908/frontend:latest
docker run -p 8080:80 lhhnghia1908/frontend:latest
```

Docker Hub: https://hub.docker.com/r/lhhnghia1908/frontend

## Triển khai trên Render

- Frontend: https://web-235811.onrender.com
- Backend API: https://api-235811.onrender.com
- Kiểm tra trạng thái: https://api-235811.onrender.com/health

Cả hai dịch vụ được triển khai từ image trên Docker Hub. Biến môi trường `MONGODB_URI` và `CORS_ORIGIN` được cấu hình trực tiếp trên Render, không lưu trong mã nguồn. Gói miễn phí của Render sẽ ngủ khi không có truy cập, nên lần mở đầu có thể chậm khoảng 30 đến 60 giây.

## Thông tin nộp bài

| Trường | Nội dung |
|---|---|
| Link_GitHub | https://github.com/s235811-a11y/235811_LHHNghia |
| Link_Docker_Backend | https://hub.docker.com/r/lhhnghia1908/backend |
| Link_Docker_Frontend | https://hub.docker.com/r/lhhnghia1908/frontend |
| Link_Render_App | https://web-235811.onrender.com |
| Link_Render_API | https://api-235811.onrender.com |
| Link_Data_MongoDB |mongodb+srv://lhhnghia1908:Lhhnghia19082005@235811lhhnghia.9jsafkw.mongodb.net/235811_LHHNghia?retryWrites=true&w=majority | Cluster 235811lhhnghia, database 235811_LHHNghia, collection devices |
