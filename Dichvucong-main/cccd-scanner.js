// ===== CCCD CHIP SCANNER SIMULATION =====
// Quét dọc 30s, đếm ngược 50s, tự về trang chủ

var _cccdData = null;
var _scanTimer = null;
var _countdownTimer = null;
var _secondsLeft = 50;
var _scanSeconds = 30;
var _scanElapsed = 0;

// Dữ liệu giả lập
var _hoNam = ['Nguyễn','Trần','Lê','Phạm','Hoàng','Phan','Vũ','Đặng','Bùi','Đỗ','Hồ','Ngô','Dương','Lý'];
var _tenDemNam = ['Văn','Hữu','Đức','Minh','Thanh','Quốc','Trung','Bá','Công','Xuân','Tuấn'];
var _tenNam = ['An','Bình','Cường','Dũng','Hùng','Khoa','Long','Mạnh','Nam','Phúc','Quân','Sơn','Thắng','Tú','Vinh'];
var _hoNu = ['Nguyễn','Trần','Lê','Phạm','Hoàng','Phan'];
var _tenDemNu = ['Thị','Ngọc','Kim','Thu','Bích','Hồng','Lan','Mai','Hà','Phương'];
var _tenNu = ['Anh','Chi','Dung','Hằng','Hoa','Huệ','Linh','Liên','Mai','Nga','Nhung','Oanh','Thanh','Thảo','Trang','Trinh','Vân','Yến'];
var _tinh = ['Hà Nội','TP. Hồ Chí Minh','Đà Nẵng','Hải Phòng','Cần Thơ','An Giang','Bà Rịa - Vũng Tàu','Bắc Giang','Bắc Ninh','Bến Tre','Bình Định','Bình Dương','Đắk Lắk','Đồng Nai','Gia Lai','Hà Tĩnh','Hải Dương','Hưng Yên','Khánh Hòa','Kiên Giang','Lâm Đồng','Lạng Sơn','Lào Cai','Long An','Nam Định','Nghệ An','Ninh Bình','Phú Thọ','Quảng Bình','Quảng Nam','Quảng Ngãi','Quảng Ninh','Thanh Hóa','Thừa Thiên Huế','Tiền Giang','Vĩnh Long','Vĩnh Phúc','Yên Bái'];
var _duong = ['Đường Láng','Nguyễn Trãi','Lê Lợi','Trần Hưng Đạo','Hoàng Hoa Thám','Đinh Tiên Hoàng','Nguyễn Huệ','Hai Bà Trưng','Phan Đình Phùng','Ngô Quyền','Cách Mạng Tháng 8','Nguyễn Văn Cừ','Tôn Đức Thắng'];
var _phuong = ['Phường 1','Phường 3','Phường 5','Phường 7','Phường Bến Nghé','Phường Đông Khê','Phường Lê Lợi','Phường Trần Hưng Đạo','Phường Hàng Bạc','Phường Tràng Tiền'];
var _quan = ['Quận 1','Quận 3','Quận Hoàn Kiếm','Quận Hai Bà Trưng','Quận Đống Đa','Quận Bình Thạnh','Quận Tân Bình','Quận Hải Châu'];

var _scanMessages = [
    'Đang tìm chip NFC trên thẻ...',
    'Phát hiện tín hiệu chip...',
    'Kết nối chip CCCD...',
    'Đọc dữ liệu cơ bản...',
    'Xác thực chữ ký số...',
    'Giải mã thông tin hộ chiếu...',
    'Đọc dữ liệu sinh trắc học...',
    'Kiểm tra tính toàn vẹn...',
    'Hoàn tất xác thực chip...'
];

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rndInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function pad(n) { return String(n).padStart(2, '0'); }

function genCCCDNumber() {
    var prefix = ['001','002','004','048','079','260','274','292'];
    return rnd(prefix) + String(rndInt(0,1)) + String(rndInt(0,9)) + String(rndInt(100000,999999));
}

function genFakeData() {
    var isMale = Math.random() > 0.45;
    var ho, tenDem, ten, gender;
    if (isMale) {
        ho = rnd(_hoNam); tenDem = rnd(_tenDemNam); ten = rnd(_tenNam); gender = 'Nam';
    } else {
        ho = rnd(_hoNu); tenDem = rnd(_tenDemNu); ten = rnd(_tenNu); gender = 'Nữ';
    }
    var fullName = (ho + ' ' + tenDem + ' ' + ten).toUpperCase();
    var dobYear = rndInt(1960, 2005);
    var dobMonth = rndInt(1, 12);
    var dobDay = rndInt(1, 28);
    var dob = pad(dobDay) + '/' + pad(dobMonth) + '/' + dobYear;
    var issueYear = rndInt(Math.max(dobYear + 14, 2021), 2024);
    var issueMonth = rndInt(1, 12);
    var issueDay = rndInt(1, 28);
    var issueDate = pad(issueDay) + '/' + pad(issueMonth) + '/' + issueYear;
    var tinh = rnd(_tinh);
    var address = rndInt(1, 350) + ' ' + rnd(_duong) + ', ' + rnd(_phuong) + ', ' + rnd(_quan) + ', ' + tinh;
    return {
        id: genCCCDNumber(),
        name: fullName,
        dob: dob,
        gender: gender,
        nation: 'Việt Nam',
        hometown: tinh,
        address: address,
        issueDate: issueDate,
        expireDate: dobYear <= 1993 ? 'Không thời hạn' : pad(issueDay) + '/' + pad(issueMonth) + '/' + (issueYear + 25),
        issuePlace: 'CỤC CẢNH SÁT QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI'
    };
}

// ===== OPEN / CLOSE =====
function openCCCDScanner(e) {
    if (e) e.preventDefault();
    var overlay = document.getElementById('cccdModal');
    if (!overlay) return;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    _startScan();
}

function closeCCCDScanner() {
    _clearAll();
    var overlay = document.getElementById('cccdModal');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
    _resetUI();
}

function _clearAll() {
    if (_scanTimer) { clearInterval(_scanTimer); _scanTimer = null; }
    if (_countdownTimer) { clearInterval(_countdownTimer); _countdownTimer = null; }
}

function _resetUI() {
    _secondsLeft = 50;
    _scanElapsed = 0;
    _cccdData = null;

    var el = function(id) { return document.getElementById(id); };

    if (el('cccdCountdown')) { el('cccdCountdown').textContent = '50'; el('cccdCountdown').classList.remove('urgent'); }
    if (el('cccdGuideText')) el('cccdGuideText').textContent = 'Đặt thẻ CCCD dọc vào khung và giữ yên 30 giây';
    if (el('cccdScanStatus')) { el('cccdScanStatus').textContent = 'Đang tìm chip NFC trên thẻ...'; el('cccdScanStatus').classList.remove('active'); }
    if (el('cccdCardGhost')) el('cccdCardGhost').classList.remove('hidden');
    if (el('cccdSuccessOverlay')) el('cccdSuccessOverlay').classList.remove('show');
    if (el('cccdProgRing')) el('cccdProgRing').classList.remove('hidden');
    if (el('cccdRingPath')) { el('cccdRingPath').style.strokeDashoffset = '150.8'; el('cccdRingPath').style.stroke = '#00e5ff'; }
    if (el('cccdRingLabel')) el('cccdRingLabel').textContent = '30';
    if (el('cccdScanLine')) {
        el('cccdScanLine').style.animationPlayState = 'running';
        el('cccdScanLine').style.background = 'linear-gradient(90deg, transparent 0%, #00e5ff 25%, #ffffff 50%, #00e5ff 75%, transparent 100%)';
        el('cccdScanLine').style.boxShadow = '0 0 14px 4px rgba(0,229,255,0.5)';
    }
    // Reset corner colors
    ['tl','tr','bl','br'].forEach(function(c) {
        var el2 = document.querySelector('.cccd-corner.' + c);
        if (el2) el2.style.borderColor = '';
    });
}

// ===== MAIN SCAN =====
function _startScan() {
    _resetUI();
    _secondsLeft = 50;
    _scanElapsed = 0;

    var SCAN_TOTAL = 30; // 30 giây thu thập dữ liệu
    var circumference = 150.8; // 2 * π * 24 ≈ 150.8
    var msgIdx = 0;

    var el = function(id) { return document.getElementById(id); };

    // --- Scan progress timer (mỗi 1 giây) ---
    _scanTimer = setInterval(function() {
        _scanElapsed++;

        // Cập nhật vòng tròn tiến trình
        var ratio = _scanElapsed / SCAN_TOTAL;
        var offset = circumference * (1 - ratio);
        if (el('cccdRingPath')) {
            el('cccdRingPath').style.strokeDashoffset = offset.toFixed(1);
        }
        var remaining = SCAN_TOTAL - _scanElapsed;
        if (el('cccdRingLabel')) el('cccdRingLabel').textContent = remaining > 0 ? remaining : 0;

        // Cập nhật thông báo trạng thái
        var newMsgIdx = Math.min(Math.floor(ratio * _scanMessages.length), _scanMessages.length - 1);
        if (newMsgIdx !== msgIdx) {
            msgIdx = newMsgIdx;
            var statusEl = el('cccdScanStatus');
            if (statusEl) {
                statusEl.textContent = _scanMessages[msgIdx];
                statusEl.classList.add('active');
                setTimeout(function() { if (statusEl) statusEl.classList.remove('active'); }, 700);
            }
        }

        // Cập nhật guide text
        if (_scanElapsed === 5 && el('cccdGuideText')) {
            el('cccdGuideText').textContent = 'Giữ yên thẻ, đang đọc dữ liệu chip...';
        }
        if (_scanElapsed === 18 && el('cccdGuideText')) {
            el('cccdGuideText').textContent = 'Đang xác thực thông tin trên chip...';
        }

        // Hoàn thành sau 30 giây
        if (_scanElapsed >= SCAN_TOTAL) {
            clearInterval(_scanTimer);
            _scanTimer = null;
            _onScanComplete();
        }
    }, 1000);

    // --- Countdown 50 giây ---
    _countdownTimer = setInterval(function() {
        _secondsLeft--;
        if (el('cccdCountdown')) {
            el('cccdCountdown').textContent = _secondsLeft;
            if (_secondsLeft <= 10) el('cccdCountdown').classList.add('urgent');
        }
        if (_secondsLeft <= 0) {
            clearInterval(_countdownTimer);
            _countdownTimer = null;
            _returnHome();
        }
    }, 1000);
}

function _onScanComplete() {
    _cccdData = genFakeData();

    // Chuyển màu góc sang xanh lá
    var cornerColor = '#00e676';
    ['tl','tr','bl','br'].forEach(function(c) {
        var el2 = document.querySelector('.cccd-corner.' + c);
        if (el2) el2.style.borderColor = cornerColor;
    });

    // Hoàn thành ring (xanh lá, offset = 0)
    var ringPath = document.getElementById('cccdRingPath');
    if (ringPath) {
        ringPath.style.stroke = '#00e676';
        ringPath.style.strokeDashoffset = '0';
    }
    var ringLabel = document.getElementById('cccdRingLabel');
    if (ringLabel) ringLabel.textContent = '✓';

    // Dừng scan line
    var scanLine = document.getElementById('cccdScanLine');
    if (scanLine) {
        scanLine.style.animationPlayState = 'paused';
        scanLine.style.background = 'linear-gradient(90deg, transparent 0%, #00e676 25%, #fff 50%, #00e676 75%, transparent 100%)';
        scanLine.style.boxShadow = '0 0 14px 5px rgba(0,230,118,0.55)';
    }

    // Ẩn ghost
    var ghost = document.getElementById('cccdCardGhost');
    if (ghost) ghost.classList.add('hidden');

    // Hiện success overlay sau 0.5s
    setTimeout(function() {
        var nameEl = document.getElementById('cccdSuccessName');
        if (nameEl) nameEl.textContent = _cccdData.name;
        var idEl = document.getElementById('cccdSuccessId');
        if (idEl) idEl.textContent = 'CCCD: ' + _cccdData.id;
        var overlay = document.getElementById('cccdSuccessOverlay');
        if (overlay) overlay.classList.add('show');
    }, 500);

    // Tự về trang chủ sau 20 giây (hoặc khi hết countdown 50s)
    setTimeout(_returnHome, 20000);
}

function _returnHome() {
    closeCCCDScanner();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== KEYBOARD =====
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeCCCDScanner();
    });
});
