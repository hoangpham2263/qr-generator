# QR Generator

Create QR codes right in your browser. No data is sent anywhere.

**Try it:** https://hoangpham.is-a.dev/qr-generator/


## Features

- **Link**, **Text**
- **WiFi**: scan to connect (WPA/WEP/no password, hidden WiFi)
- **Bank transfer (VietQR)**: choose the bank, account number, amount and message; scan with a Vietnamese banking app
- **Contact card (vCard)**: scan to save the contact
- Change the code and background colors, with a warning when colors are hard to scan
- Add a logo in the center (the default HP logo or your own image), which automatically uses the highest error correction level (H)
- Download **PNG 1024×1024** or **SVG**
- Vietnamese / English interface, with dark mode

## How it works

- QR codes are created with [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator), then drawn on canvas or exported as SVG.
- Bank transfer codes follow the NAPAS EMVCo standard (VietQR), with a CRC16 checksum.

No build step: just HTML, CSS and JavaScript. Run locally:

```bash
python3 -m http.server 8000
```

## License

MIT © Phạm Quốc Hoàng
