// ===== CCCD CHIP SCANNER SIMULATION =====

var _cccdData = null;
var _scanTimer = null;
var _countdownTimer = null;
var _secondsLeft = 50;

// Dữ liệu giả lập
var _hoNam = ['Nguyễn','Trần','Lê','Phạm','Hoàng','Phan','Vũ','Đặng','Bùi','Đỗ','Hồ','Ngô','Dương','Lý'];
var _tenDemNam = ['Văn','Hữu','Đức','Minh','Thanh','Quốc','Trung','Bá','Công','Xuân','Tuấn'];
var _tenNam = ['An','Bình','Cường','Dũng','Hùng','Khoa','Long','Mạnh','Nam','Phúc','Quân','Sơn','Thắng','Tú','Vinh'];
var _hoNu = ['Nguyễn','Trần','Lê','Phạm','Hoàng','Phan'];
var _tenDemNu = ['Thị','Ngọc','Kim','Thu','Bích','Hồng','Lan','Mai','Hà','Phương'];
var _tenNu = ['Anh','Chi','Dung','Hằng','Hoa','Huệ','Linh','Liên','Mai','Nga','Nhung','Oanh','Thanh','Thảo','Trang','Trinh','Vân','Yến'];
var _tinh = [
    'Hà Nội','TP. Hồ Chí Minh','Đà Nẵng','Hải Phòng','Cần Thơ',
    'An Giang','Bà Rịa - Vũng Tàu','Bắc Giang','Bắc Kạn','Bạc Liêu',
    'Bắc Ninh','Bến Tre','Bình Định','Bình Dương','Bình Phước',
    'Bình Thuận','Cà Mau','Cao Bằng','Đắk Lắk','Đắk Nông',
    'Điện Biên','Đồng Nai','Đồng Tháp','Gia Lai','Hà Giang',
    'Hà Nam','Hà Tĩnh','Hải Dương','Hậu Giang','Hòa Bình',
    'Hưng Yên','Khánh Hòa','Kiên Giang','Kon Tum','Lai Châu',
    'Lâm Đồng','Lạng Sơn','Lào Cai','Long An','Nam Định',
    'Nghệ An','Ninh Bình','Ninh Thuận','Phú Thọ','Phú Yên',
    'Quảng Bình','Quảng Nam','Quảng Ngãi','Quảng Ninh','Quảng Trị',
    'Sóc Trăng','Sơn La','Tây Ninh','Thái Bình','Thái Nguyên',
    'Thanh Hóa','Thừa Thiên Huế','Tiền Giang','Trà Vinh','Tuyên Quang',
    'Vĩnh Long','Vĩnh Phúc','Yên Bái'
];
var _duong = ['Đường Láng','Nguyễn Trãi','Lê Lợi','Trần Hưng Đạo','Hoàng Hoa Thám','Đinh Tiên Hoàng','Nguyễn Huệ','Hai Bà Trưng','Phan Đình Phùng','Ngô Quyền','Cách Mạng Tháng 8','Nguyễn Văn Cừ','Tôn Đức Thắng','Lý Thường Kiệt'];
var _phuong = ['Phường 1','Phường 3','Phường 5','Phường 7','Phường Bến Nghé','Phường Đông Khê','Phường Lê Lợi','Phường Trần Hưng Đạo','Phường Hàng Bạc','Phường Tràng Tiền'];
var _quan = ['Quận 1','Quận 3','Quận Hoàn Kiếm','Quận Hai Bà Trưng','Quận Đống Đa','Quận Bình Thạnh','Quận Tân Bình','Quận Hải Châu'];

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rndInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pad(n) { return String(n).padStart(2, '0'); }

function genCCCDNumber() {
    var prefix = ['001','002','004','048','079','260','274','292'];
    return rnd(prefix) + String(rndInt(0,1)) + String(rndInt(0,9)) + String(rndInt(100000,999999));
}

function genDOB() {
    var year = rndInt(1960, 2004);
    var month = rndInt(1, 12);
    var day = rndInt(1, 28);
    return pad(day) + '/' + pad(month) + '/' + year;
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
    var dob = genDOB();
    var dobYear = parseInt(dob.split('/')[2]);
    var issueYear = rndInt(Math.max(dobYear + 14, 2021), 2024);
    var issueMonth = rndInt(1, 12);
    var issueDay = rndInt(1, 28);
    var issueDate = pad(issueDay) + '/' + pad(issueMonth) + '/' + issueYear;
    var expireYear = issueYear + (dobYear <= 1993 ? 'KHH' : (dobYear <= 2003 ? 25 : 0));
    var expireStr;
    if (expireYear === 'KHH') {
        expireStr = 'Không thời hạn';
    } else {
        expireStr = pad(issueDay) + '/' + pad(issueMonth) + '/' + (issueYear + 25);
    }
    var tinh = rnd(_tinh);
    var soNha = rndInt(1, 350);
    var address = soNha + ' ' + rnd(_duong) + ', ' + rnd(_phuong) + ', ' + rnd(_quan) + ', ' + tinh;
    return {
        id: genCCCDNumber(),
        name: fullName,
        dob: dob,
        gender: gender,
        nation: 'Việt Nam',
        hometown: tinh,
        address: address,
        issueDate: issueDate,
        expireDate: expireStr,
        issuePlace: 'CỤC CẢNH SÁT QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI'
    };
}

// ===== SCAN MESSAGES =====
var _scanMessages = [
    'Đang tìm chip NFC trên thẻ...',
    'Phát hiện tín hiệu NFC...',
    'Kết nối chip CCCD thành công...',
    'Đọc dữ liệu cơ bản...',
    'Xác thực chữ ký số...',
    'Giải mã thông tin hộ chiếu...',
    'Đọc dữ liệu sinh trắc học...',
    'Kiểm tra tính toàn vẹn dữ liệu...',
    'Đang hoàn tất xác thực...'
];

// ===== OPEN / CLOSE =====
function openCCCDScanner(e) {
    if (e) e.preventDefault();
    var overlay = document.getElementById('cccdModal');
    if (!overlay) return;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    _startFullscreenScan();
}

function closeCCCDScanner() {
    _clearAllTimers();
    var overlay = document.getElementById('cccdModal');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
    _resetScanUI();
}

function _clearAllTimers() {
    if (_scanTimer) { clearInterval(_scanTimer); _scanTimer = null; }
    if (_countdownTimer) { clearInterval(_countdownTimer); _countdownTimer = null; }
}

function _resetScanUI() {
    _secondsLeft = 50;
    _cccdData = null;
    var countdown = document.getElementById('cccdCountdown');
    if (countdown) { countdown.textContent = '50'; countdown.classList.remove('urgent'); }
    var guide = document.getElementById('cccdGuideText');
    if (guide) guide.textContent = 'Đặt thẻ CCCD vào trong khung để bắt đầu quét';
    var status = document.getElementById('cccdScanStatus');
    if (status) { status.textContent = 'Đang tìm chip NFC trên thẻ...'; status.classList.remove('active'); }
    var ghost = document.getElementById('cccdCardGhost');
    if (ghost) ghost.classList.remove('hidden');
    var success = document.getElementById('cccdSuccessOverlay');
    if (success) success.classList.remove('show');
    var frame = document.getElementById('cccdFrame');
    if (frame) {
        frame.style.borderColor = '';
        var corners = frame.querySelectorAll('.cccd-corner');
        corners.forEach(function(c) { c.style.borderColor = ''; });
    }
    var scanLine = document.getElementById('cccdScanLine');
    if (scanLine) { scanLine.style.display = ''; scanLine.style.animationPlayState = 'running'; }
}

// ===== MAIN SCAN FLOW =====
function _startFullscreenScan() {
    _resetScanUI();
    _secondsLeft = 50;

    // Scan complete happens at a random time between 8s and 38s
    var scanCompleteAt = rndInt(8, 38);
    var elapsed = 0;
    var msgIdx = 0;

    var status = document.getElementById('cccdScanStatus');
    var countdown = document.getElementById('cccdCountdown');
    var guide = document.getElementById('cccdGuideText');

    // Start status cycling
    _scanTimer = setInterval(function() {
        elapsed++;
        var progress = elapsed / scanCompleteAt;
        var newMsgIdx = Math.min(Math.floor(progress * _scanMessages.length), _scanMessages.length - 1);
        if (newMsgIdx !== msgIdx) {
            msgIdx = newMsgIdx;
            if (status) {
                status.textContent = _scanMessages[msgIdx];
                status.classList.add('active');
                setTimeout(function() { if (status) status.classList.remove('active'); }, 600);
            }
        }
        if (elapsed === 3 && guide) guide.textContent = 'Giữ yên thẻ, đang đọc dữ liệu chip...';
        if (elapsed >= scanCompleteAt) {
            clearInterval(_scanTimer);
            _scanTimer = null;
            _showSuccess();
        }
    }, 1000);

    // Countdown timer (50s)
    _countdownTimer = setInterval(function() {
        _secondsLeft--;
        if (countdown) {
            countdown.textContent = _secondsLeft;
            if (_secondsLeft <= 10) countdown.classList.add('urgent');
        }
        if (_secondsLeft <= 0) {
            clearInterval(_countdownTimer);
            _countdownTimer = null;
            // Timeout — if scan didn't finish, force return home
            _returnHome();
        }
    }, 1000);
}

function _showSuccess() {
    _clearAllTimers();
    _cccdData = genFakeData();

    // Green corners
    var frame = document.getElementById('cccdFrame');
    if (frame) {
        var corners = frame.querySelectorAll('.cccd-corner');
        corners.forEach(function(c) {
            c.style.borderColor = '#00e676';
        });
    }

    // Stop scan line
    var scanLine = document.getElementById('cccdScanLine');
    if (scanLine) {
        scanLine.style.animationPlayState = 'paused';
        scanLine.style.background = 'linear-gradient(90deg, transparent 0%, #00e676 20%, #fff 50%, #00e676 80%, transparent 100%)';
        scanLine.style.boxShadow = '0 0 12px 4px rgba(0,230,118,0.6)';
    }

    // Hide ghost
    var ghost = document.getElementById('cccdCardGhost');
    if (ghost) ghost.classList.add('hidden');

    // Show success overlay
    var successName = document.getElementById('cccdSuccessName');
    if (successName) successName.textContent = _cccdData.name;
    var successOverlay = document.getElementById('cccdSuccessOverlay');
    if (successOverlay) successOverlay.classList.add('show');

    // Auto return home after 2.5s
    setTimeout(_returnHome, 2500);
}

function _returnHome() {
    closeCCCDScanner();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeCCCDScanner();
    });
});
