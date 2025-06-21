# ระบบแสดงรูปภาพ

ระบบเว็บแอปพลิเคชันสำหรับค้นหาและแสดงรูปภาพจากรหัส (HN) โดยดึงข้อมูลจาก API และแสดงผลเป็นรูปภาพ base64

## คุณสมบัติ

- 🔍 ค้นหารูปภาพจากรหัส (HN)
- 🖼️ แสดงรูปภาพแบบ responsive grid
- ⚡ โหลดรูปภาพแบบ progressive (placeholder ก่อน แล้วค่อยโหลดจริง)
- 📱 Responsive design รองรับทุกขนาดหน้าจอ
- 🐳 รองรับการ deploy บน Docker

## การติดตั้งและใช้งาน

### การติดตั้ง Dependencies

```bash
npm install
```

### การรันในโหมด Development

```bash
npm start
```

แอปจะเปิดที่ http://localhost:3000

### การ Build สำหรับ Production

```bash
npm run build
```

### การรันด้วย Docker

```bash
# Build และ run ด้วย docker-compose
docker-compose up --build

# หรือใช้ Docker commands
docker build -t font-mcs-img .
docker run -p 3000:80 font-mcs-img
```

## การใช้งาน

1. เปิดเว็บแอปในเบราว์เซอร์
2. กรอกรหัส (HN) ในช่องค้นหา
3. กดปุ่ม "ค้นหารูปภาพ"
4. ระบบจะแสดงจำนวนรูปภาพทั้งหมดและ placeholder
5. รูปภาพจะถูกโหลดทีละรูปและแสดงผลแทน placeholder

## โครงสร้างโปรเจค

```
src/
├── components/
│   ├── SearchForm.tsx      # ฟอร์มค้นหา HN
│   └── ImageGallery.tsx    # แสดงรูปภาพ gallery
├── services/
│   └── api.ts             # API service functions
├── types/
│   └── api.ts             # TypeScript type definitions
├── App.tsx                # Component หลัก
├── index.tsx              # Entry point
└── index.css              # Global styles
```

## API Endpoints

- `GET /get-all-images-by-hn/{hn}` - ดึงข้อมูลรูปภาพทั้งหมดจาก HN
- `POST /get-image-by-path/base64` - ดึงรูปภาพเป็น base64 จาก full_path

## เทคโนโลยีที่ใช้

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Docker** - Containerization
- **Nginx** - Web server (production)

## การพัฒนา

### การเพิ่ม Features ใหม่

1. สร้าง component ใหม่ใน `src/components/`
2. เพิ่ม types ใน `src/types/` (ถ้าจำเป็น)
3. เพิ่ม API functions ใน `src/services/` (ถ้าจำเป็น)
4. Import และใช้ใน `App.tsx`

### การแก้ไข Styling

ใช้ Tailwind CSS classes ใน components หรือเพิ่ม custom CSS ใน `src/index.css` 