# Choco Bliss — Chocolate Store

ชุดโปรเจกต์เว็บไซต์ร้านช็อกโกแลตพร้อมหน้าร้าน ระบบตะกร้า/สั่งซื้อ เชื่อม Google Sheets และหน้า Back Office สำหรับหยิบสินค้า แพ็กสินค้า และพิมพ์ใบจ่าหน้าพัสดุ

## โครงสร้างไฟล์

- `index.html` — Landing page และหน้าสั่งซื้อ
- `styles.css` — รูปแบบเว็บไซต์ Responsive
- `app.js` — สินค้า ตะกร้า และส่งคำสั่งซื้อ
- `config.js` — ตั้งค่า URL ของ Google Apps Script
- `admin.html` — หน้าจัดการออเดอร์ / Picking / Packing / Shipping label
- `google-apps-script/Code.gs` — Backend เชื่อม Google Sheets
- `assets/` — โฟลเดอร์สำหรับเก็บรูปสินค้า (เพิ่มไฟล์ภาพของร้านได้)

## สินค้าเริ่มต้น

| SKU | สินค้า | ราคา |
|---|---|---:|
| CHO-001 | Milk Chocolate | 89 บาท |
| CHO-002 | Dark Chocolate 70% | 109 บาท |

ราคาและชื่อสินค้าแก้ไขได้ใน `app.js` (อาร์เรย์ `PRODUCTS`)

## 1. ตั้งค่า Google Sheets

ใช้ Spreadsheet ID ที่ให้มาแล้ว: `1BZeDjPZ22Y9st8kW3JeEIeMp_8w5BBVQC6S-yvsKqTs`

1. เปิด Google Sheets ของคุณ
2. ไปที่ **Extensions → Apps Script**
3. ลบโค้ดตัวอย่าง แล้วคัดลอกเนื้อหา `google-apps-script/Code.gs` ไปวาง
4. กด Save
5. เลือกฟังก์ชัน `setup` แล้วกด Run และอนุญาตสิทธิ์ครั้งแรก ระบบจะสร้างชีต `Orders` และ `OrderItems` ให้อัตโนมัติ
6. กด **Deploy → New deployment → Select type: Web app**
7. Execute as: **Me**
8. Who has access: **Anyone** (หรือ Anyone with the link ตามตัวเลือกที่บัญชีแสดง)
9. กด Deploy และคัดลอก Web app URL ที่ลงท้ายด้วย `/exec`
10. เปิด `config.js` แล้วแทน `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` ด้วย URL ดังกล่าว

> ข้อควรทราบ: การเลือก Anyone ทำให้ผู้ที่มี URL สามารถเรียก API ได้ อย่าเก็บข้อมูลลับไว้ในชีตนี้ และอย่าใส่ข้อมูลบัตรชำระเงิน ระบบตัวอย่างนี้ยังไม่มีระบบชำระเงินออนไลน์/ยืนยันการชำระเงิน

## 2. ทดสอบในเครื่อง

เปิดโฟลเดอร์ด้วย VS Code แล้วใช้ส่วนขยาย Live Server หรือรัน static server เช่น:

```bash
python -m http.server 8000
```

เปิด `http://localhost:8000` ทดสอบเพิ่มสินค้า ใส่ข้อมูลจัดส่ง และสั่งซื้อ จากนั้นตรวจดูชีต `Orders` และ `OrderItems`

## 3. อัปโหลดขึ้น GitHub

1. สร้าง repository ใหม่ เช่น `choco-bliss-store`
2. อัปโหลดไฟล์และโฟลเดอร์ทั้งหมดในโปรเจกต์นี้
3. ตรวจสอบว่า `config.js` ใส่ Apps Script URL แล้ว
4. เพิ่มรูปสินค้าใน `assets/` และแก้ `index.html`/`styles.css` ตามต้องการ

## 4. Deploy บน Vercel

1. เข้า Vercel แล้วเลือก **Add New → Project**
2. Import Git Repository ที่สร้างไว้
3. Framework Preset เลือก **Other**
4. Build Command เว้นว่าง และ Output Directory ใช้ `.` (root)
5. กด Deploy

หน้าเว็บร้านค้า: `/` หรือ `/index.html`  
หน้าจัดการคำสั่งซื้อ: `/admin.html`

## Workflow การทำงาน

1. ลูกค้าเลือกสินค้าและเพิ่มลงตะกร้า
2. กรอกชื่อ เบอร์โทร ที่อยู่ และรหัสไปรษณีย์
3. ระบบส่งรายการไป Google Apps Script เพื่อบันทึกใน `Orders` และ `OrderItems`
4. พนักงานเปิด `/admin.html` แล้วกดโหลดคำสั่งซื้อ
5. ใช้ตารางเป็น Picking List เช็กจำนวนสินค้า และเช็ก Packing ก่อนปิดกล่อง
6. พิมพ์ใบจ่าหน้าพัสดุจากข้อมูลผู้รับ

## ข้อจำกัด/สิ่งที่ควรพัฒนาก่อนใช้งานจริง

- ตัวอย่างนี้เป็น MVP สำหรับงานเรียน ไม่ใช่ระบบอีคอมเมิร์ซ production
- ฝั่งหน้าเว็บใช้ `fetch` แบบ `no-cors` เพื่อเลี่ยง preflight ของ Apps Script; หน้าเว็บจะแสดงการส่งคำสั่งซื้อหลัง request ถูกส่ง แต่ไม่สามารถอ่านผลตอบกลับเพื่อยืนยันว่าบันทึกสำเร็จจริงได้ ให้ตรวจสอบใน Google Sheets ทุกครั้ง
- หน้า Back Office โหลดรายการด้วย JSONP จาก Apps Script; จำกัดสิทธิ์การเข้าถึงหน้า Admin เพิ่มเติมก่อนใช้กับข้อมูลลูกค้าจริง
- ยังไม่มีระบบสต็อกคงเหลือ, payment gateway, ค่าจัดส่ง, tracking number หรือการเปลี่ยนสถานะกลับไปบันทึกในชีต
- ควรเพิ่ม CAPTCHA/การป้องกัน spam, validation ฝั่ง server, นโยบายความเป็นส่วนตัว และจำกัดการเข้าถึงข้อมูลลูกค้าก่อนใช้งานจริง

## หมายเหตุรูปภาพ

โฟลเดอร์ `assets/` เตรียมไว้แยกเก็บภาพแล้ว ภาพแพ็กเกจในหน้าเว็บปัจจุบันเป็นภาพประกอบ CSS เพื่อให้โปรเจกต์เปิดได้ทันที สามารถใส่ภาพสินค้าจริงใน `assets/` และเปลี่ยนเป็น `<img src="assets/ชื่อไฟล์.jpg">` ได้
