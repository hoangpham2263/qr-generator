// QR Generator — link, text, WiFi, VietQR bank transfer and contact card QR codes, in the browser.
(() => {
  qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];

  // NAPAS bank BINs for VietQR
  const BANKS = [
    ["970436", "Vietcombank"], ["970418", "BIDV"], ["970415", "VietinBank"], ["970405", "Agribank"],
    ["970407", "Techcombank"], ["970422", "MB Bank"], ["970416", "ACB"], ["970432", "VPBank"],
    ["970423", "TPBank"], ["970403", "Sacombank"], ["970437", "HDBank"], ["970441", "VIB"],
    ["970443", "SHB"], ["970426", "MSB"], ["970448", "OCB"], ["970431", "Eximbank"],
    ["970440", "SeABank"], ["970454", "Viet Capital Bank"], ["970429", "SCB"], ["970449", "LPBank"],
  ];

  const TEXT = {
    vi: {
      title: "Tạo mã QR",
      subtitle: "Link, văn bản, WiFi, chuyển khoản, danh thiếp — chạy ngay trên trình duyệt, không gửi dữ liệu đi đâu cả.",
      tUrl: "Link", tText: "Văn bản", tWifi: "WiFi", tBank: "Chuyển khoản", tVcard: "Danh thiếp",
      lUrl: "Đường link", lText: "Nội dung", lSsid: "Tên WiFi", lPass: "Mật khẩu", lEnc: "Bảo mật",
      encNone: "Không mật khẩu", lHidden: "WiFi ẩn",
      lBank: "Ngân hàng", lAcc: "Số tài khoản", lAmount: "Số tiền (VND, để trống nếu tùy người gửi)",
      lMemo: "Nội dung chuyển khoản",
      bankNote: "Mã theo chuẩn VietQR (NAPAS) — quét được bằng app của hầu hết ngân hàng Việt Nam.",
      lName: "Họ tên", lOrg: "Công ty / chức danh", lPhone: "Số điện thoại", lEmail: "Email", lWeb: "Website",
      style: "Kiểu dáng", cFg: "Màu mã", cBg: "Màu nền", lLogo: "Chèn logo ở giữa", pickLogo: "Chọn ảnh logo",
      dlPng: "Tải PNG", dlSvg: "Tải SVG",
      empty: "Nhập nội dung để tạo mã.",
      tooLong: "Nội dung quá dài cho 1 mã QR.",
      lowContrast: "Màu mã nên đậm hơn màu nền để dễ quét.",
      needAcc: "Nhập số tài khoản.",
      footer: "Làm bởi", switchTo: "EN", switchTitle: "English",
    },
    en: {
      title: "QR code generator",
      subtitle: "Link, text, WiFi, bank transfer, contact card — runs in your browser, nothing is sent anywhere.",
      tUrl: "Link", tText: "Text", tWifi: "WiFi", tBank: "Bank transfer", tVcard: "Contact card",
      lUrl: "Link", lText: "Text", lSsid: "Network name", lPass: "Password", lEnc: "Security",
      encNone: "No password", lHidden: "Hidden network",
      lBank: "Bank", lAcc: "Account number", lAmount: "Amount (VND, leave empty to let the sender choose)",
      lMemo: "Transfer note",
      bankNote: "VietQR (NAPAS) format — scans with most Vietnamese banking apps.",
      lName: "Full name", lOrg: "Company / title", lPhone: "Phone", lEmail: "Email", lWeb: "Website",
      style: "Style", cFg: "Code color", cBg: "Background", lLogo: "Logo in the middle", pickLogo: "Choose logo image",
      dlPng: "Download PNG", dlSvg: "Download SVG",
      empty: "Type something to make a code.",
      tooLong: "Too much content for one QR code.",
      lowContrast: "Use a code color darker than the background so it scans well.",
      needAcc: "Enter the account number.",
      footer: "Made by", switchTo: "VI", switchTitle: "Tiếng Việt",
    },
  };

  const $ = (id) => document.getElementById(id);
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };
  const state = {
    lang: store.get("qr-lang") || (navigator.language.startsWith("vi") ? "vi" : "en"),
    type: "url",
    logo: null, // HTMLImageElement
    qr: null,
  };
  const t = (k) => TEXT[state.lang][k];
  const val = (id) => $(id).value.trim();

  // ---------- Payloads ----------
  const wifiEscape = (s) => s.replace(/([\\;,:"])/g, "\\$1");
  const vEscape = (s) => s.replace(/([\\;,])/g, "\\$1");

  // EMVCo TLV + CRC16-CCITT (VietQR)
  const tlv = (id, v) => `${id}${String(v.length).padStart(2, "0")}${v}`;
  function crc16(s) {
    let crc = 0xffff;
    for (const b of new TextEncoder().encode(s)) {
      crc ^= b << 8;
      for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }
  // Bank apps expect plain ASCII in the note
  const ascii = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^\x20-\x7E]/g, "");

  function vietqr() {
    const acc = val("acc").replace(/\s/g, "");
    if (!acc) return { error: t("needAcc") };
    const amount = val("amount").replace(/\D/g, "");
    const memo = ascii(val("memo")).slice(0, 50);
    let s =
      tlv("00", "01") +
      tlv("01", amount ? "12" : "11") +
      tlv("38", tlv("00", "A000000727") + tlv("01", tlv("00", $("bank").value) + tlv("01", acc)) + tlv("02", "QRIBFTTA")) +
      tlv("53", "704") +
      (amount ? tlv("54", amount) : "") +
      tlv("58", "VN") +
      (memo ? tlv("62", tlv("08", memo)) : "");
    s += "6304";
    return { data: s + crc16(s) };
  }

  function payload() {
    switch (state.type) {
      case "url": return { data: val("url") };
      case "text": return { data: $("text").value };
      case "wifi": {
        const ssid = val("ssid");
        if (!ssid) return { data: "" };
        const enc = $("wenc").value;
        return { data: `WIFI:T:${enc};S:${wifiEscape(ssid)};${enc === "nopass" ? "" : `P:${wifiEscape($("wpass").value)};`}${$("whidden").checked ? "H:true;" : ""};` };
      }
      case "bank": return vietqr();
      case "vcard": {
        const name = val("vname");
        if (!name && !val("vphone") && !val("vemail")) return { data: "" };
        const lines = ["BEGIN:VCARD", "VERSION:3.0", `N:${vEscape(name)};;;;`, `FN:${vEscape(name)}`];
        if (val("vorg")) lines.push(`ORG:${vEscape(val("vorg"))}`);
        if (val("vphone")) lines.push(`TEL;TYPE=CELL:${val("vphone")}`);
        if (val("vemail")) lines.push(`EMAIL:${val("vemail")}`);
        if (val("vweb")) lines.push(`URL:${val("vweb")}`);
        lines.push("END:VCARD");
        return { data: lines.join("\n") };
      }
    }
  }

  // ---------- Drawing ----------
  const lum = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  function make(data, ecc) {
    const qr = qrcode(0, ecc);
    qr.addData(data);
    qr.make();
    return qr;
  }

  function draw() {
    const { data, error } = payload();
    const canvas = $("qr");
    const ctx = canvas.getContext("2d");
    const fg = $("fg").value;
    const bg = $("bg").value;
    const useLogo = $("useLogo").checked && state.logo;
    state.qr = null;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let warn = error || (!data ? t("empty") : "");
    if (!warn) {
      try {
        state.qr = make(data, useLogo ? "H" : "M");
      } catch {
        warn = t("tooLong");
      }
    }
    if (!warn && lum(fg) > lum(bg)) warn = t("lowContrast");
    $("warn").textContent = warn;
    $("png").disabled = $("svg").disabled = !state.qr;
    if (!state.qr) return;

    const n = state.qr.getModuleCount();
    const quiet = 4;
    const cell = canvas.width / (n + quiet * 2);
    ctx.fillStyle = fg;
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++)
        if (state.qr.isDark(r, c)) ctx.fillRect(Math.floor((c + quiet) * cell), Math.floor((r + quiet) * cell), Math.ceil(cell), Math.ceil(cell));
    if (useLogo) {
      const box = canvas.width * 0.22;
      const x = (canvas.width - box) / 2;
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(x - 12, x - 12, box + 24, box + 24, 24);
      ctx.fill();
      ctx.drawImage(state.logo, x, x, box, box);
    }
  }

  function svgString() {
    const n = state.qr.getModuleCount();
    const quiet = 4;
    const size = n + quiet * 2;
    let path = "";
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) if (state.qr.isDark(r, c)) path += `M${c + quiet} ${r + quiet}h1v1h-1z`;
    let logo = "";
    if ($("useLogo").checked && state.logo) {
      const box = size * 0.22;
      const x = (size - box) / 2;
      const pad = (12 / 1024) * size;
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      c.getContext("2d").drawImage(state.logo, 0, 0, 256, 256);
      logo = `<rect x="${x - pad}" y="${x - pad}" width="${box + pad * 2}" height="${box + pad * 2}" rx="${pad * 2}" fill="${$("bg").value}"/><image href="${c.toDataURL("image/png")}" x="${x}" y="${x}" width="${box}" height="${box}"/>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="${$("bg").value}"/><path d="${path}" fill="${$("fg").value}"/>${logo}</svg>`;
  }

  function saveBlob(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  }

  function loadLogo(src) {
    const img = new Image();
    img.onload = () => {
      state.logo = img;
      draw();
    };
    img.src = src;
  }

  function applyLang() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $("lang").textContent = t("switchTo");
    $("lang").title = t("switchTitle");
    draw();
  }

  // ---------- Events ----------
  $("bank").replaceChildren(...BANKS.map(([bin, name]) => Object.assign(document.createElement("option"), { value: bin, textContent: name })));
  $("type").onclick = (e) => {
    const b = e.target.closest("[data-type]");
    if (!b) return;
    state.type = b.dataset.type;
    [...$("type").children].forEach((x) => x.classList.toggle("active", x === b));
    document.querySelectorAll("[data-form]").forEach((f) => (f.hidden = f.dataset.form !== state.type));
    draw();
  };
  document.querySelector(".qr-grid").addEventListener("input", draw);
  document.querySelector(".qr-grid").addEventListener("change", draw);
  $("useLogo").addEventListener("change", () => {
    $("pickLogo").hidden = !$("useLogo").checked;
    if ($("useLogo").checked && !state.logo) loadLogo("brand/hp-icon.svg");
  });
  $("pickLogo").onclick = () => $("logoFile").click();
  $("logoFile").onchange = (e) => {
    const f = e.target.files[0];
    if (f) loadLogo(URL.createObjectURL(f));
    e.target.value = "";
  };
  $("png").onclick = () => $("qr").toBlob((b) => saveBlob(b, `qr-${state.type}.png`), "image/png");
  $("svg").onclick = () => saveBlob(new Blob([svgString()], { type: "image/svg+xml" }), `qr-${state.type}.svg`);
  $("lang").onclick = () => {
    state.lang = state.lang === "vi" ? "en" : "vi";
    store.set("qr-lang", state.lang);
    applyLang();
  };

  applyLang();
})();
