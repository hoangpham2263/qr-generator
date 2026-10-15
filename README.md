# QR Generator

Tạo mã QR ngay trên trình duyệt — không gửi dữ liệu đi đâu cả.

**Dùng thử:** https://hoangpham.is-a.dev/qr-generator/


## Tính năng

- **Link**, **Văn bản**
- **WiFi**: quét là kết nối (WPA/WEP/không mật khẩu, WiFi ẩn)
- **Chuyển khoản (VietQR)**: chọn ngân hàng, số tài khoản, số tiền, nội dung — quét bằng app ngân hàng Việt Nam
- **Danh thiếp (vCard)**: quét là lưu danh bạ
- Đổi màu mã và màu nền, cảnh báo khi màu khó quét
- Chèn logo ở giữa (logo HP mặc định hoặc ảnh của bạn), tự dùng mức sửa lỗi cao nhất (H)
- Tải **PNG 1024×1024** hoặc **SVG**
- Giao diện tiếng Việt / English, hỗ trợ dark mode

## Cách hoạt động

- Mã QR tạo bằng [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator), vẽ lên canvas hoặc xuất SVG.
- Mã chuyển khoản theo chuẩn EMVCo của NAPAS (VietQR), có mã kiểm tra CRC16.

Không cần build — chỉ là HTML, CSS, JavaScript. Chạy local:

```bash
python3 -m http.server 8000
```

## License

MIT © Phạm Quốc Hoàng
