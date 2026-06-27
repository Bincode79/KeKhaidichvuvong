// ===== CCCD CHIP SCANNER SIMULATION =====

var _cccdData = null;
var _scanTimer = null;

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
    // Format: 3 digits tỉnh + 3 digits giới tính/năm + 6 digits ngẫu nhiên
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
    var hometown = tinh;
    var soNha = rndInt(1, 350);
    var address = soNha + ' ' + rnd(_duong) + ', ' + rnd(_phuong) + ', ' + rnd(_quan) + ', ' + tinh;
    return {
        id: genCCCDNumber(),
        name: fullName,
        dob: dob,
        gender: gender,
        nation: 'Việt Nam',
        hometown: hometown,
        address: address,
        issueDate: issueDate,
        expireDate: expireStr,
        issuePlace: 'CỤC CẢNH SÁT QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI'
    };
}

// ===== OPEN / CLOSE =====
function openCCCDScanner(e) {
    if (e) e.preventDefault();
    document.getElementById('cccdModal').classList.add('open');
    document.body.style.overflow = 'hidden';
    showCCCDStep(1);
}

function closeCCCDScanner() {
    if (_scanTimer) { clearInterval(_scanTimer); _scanTimer = null; }
    document.getElementById('cccdModal').classList.remove('open');
    document.body.style.overflow = '';
}

function showCCCDStep(n) {
    [1,2,3].forEach(function(i) {
        var el = document.getElementById('cccdStep' + i);
        if (el) el.style.display = (i === n ? 'flex' : 'none');
    });
}

// ===== SCAN SIMULATION =====
var _scanMessages = [
    'Đang tìm chip NFC...',
    'Phát hiện chip CCCD...',
    'Đọc dữ liệu cơ bản...',
    'Xác thực chữ ký số...',
    'Giải mã thông tin hộ chiếu...',
    'Đọc dữ liệu sinh trắc học...',
    'Kiểm tra tính toàn vẹn dữ liệu...',
    'Hoàn tất đọc chip...'
];

function startCCCDScan() {
    if (_scanTimer) { clearInterval(_scanTimer); _scanTimer = null; }
    showCCCDStep(2);
    var progress = 0;
    var msgIdx = 0;
    var fill = document.getElementById('cccdProgressFill');
    var status = document.getElementById('cccdScanStatus');
    var title = document.getElementById('cccdScanTitle');
    fill.style.width = '0%';
    status.textContent = _scanMessages[0];
    title.textContent = 'Đang kết nối NFC...';

    _scanTimer = setInterval(function() {
        progress += rndInt(4, 9);
        if (progress > 100) progress = 100;
        fill.style.width = progress + '%';

        var newMsgIdx = Math.floor(progress / (100 / _scanMessages.length));
        if (newMsgIdx >= _scanMessages.length) newMsgIdx = _scanMessages.length - 1;
        if (newMsgIdx !== msgIdx) {
            msgIdx = newMsgIdx;
            status.textContent = _scanMessages[msgIdx];
        }
        if (progress >= 30) title.textContent = 'Đang đọc dữ liệu chip...';
        if (progress >= 70) title.textContent = 'Xác thực dữ liệu...';

        if (progress >= 100) {
            clearInterval(_scanTimer);
            _scanTimer = null;
            setTimeout(showCCCDResult, 500);
        }
    }, 180);
}

function showCCCDResult() {
    _cccdData = genFakeData();
    document.getElementById('rf_id').textContent = _cccdData.id;
    document.getElementById('rf_name').textContent = _cccdData.name;
    document.getElementById('rf_dob').textContent = _cccdData.dob;
    document.getElementById('rf_gender').textContent = _cccdData.gender;
    document.getElementById('rf_nation').textContent = _cccdData.nation;
    document.getElementById('rf_hometown').textContent = _cccdData.hometown;
    document.getElementById('rf_address').textContent = _cccdData.address;
    document.getElementById('rf_issue').textContent = _cccdData.issueDate;
    document.getElementById('rf_expire').textContent = _cccdData.expireDate;
    document.getElementById('rf_issueplace').textContent = _cccdData.issuePlace;
    showCCCDStep(3);
}

function confirmCCCDData() {
    if (!_cccdData) return;
    // Điền vào form đăng ký nếu có
    var fillField = function(name, val) {
        var el = document.querySelector('[name="' + name + '"]');
        if (el) el.value = val;
    };
    fillField('fullName', _cccdData.name.replace(/\b\w/g, function(c){ return c.toUpperCase(); }).replace(/\B\w/g, function(c){ return c.toLowerCase(); }));
    fillField('idNumber', _cccdData.id);
    fillField('permanentAddress', _cccdData.address);
    var genderVal = _cccdData.gender === 'Nam' ? 'nam' : 'nu';
    var genderEl = document.querySelector('[name="gender"]');
    if (genderEl) genderEl.value = genderVal;
    // Chuyển DOB sang format yyyy-mm-dd
    var parts = _cccdData.dob.split('/');
    if (parts.length === 3) {
        var isoDate = parts[2] + '-' + parts[1] + '-' + parts[0];
        fillField('birthDate', isoDate);
    }
    closeCCCDScanner();
    // Hiện thông báo
    var notif = document.getElementById('notification');
    if (notif) {
        notif.textContent = '✅ Đã điền thông tin CCCD vào biểu mẫu!';
        notif.className = 'notification success show';
        setTimeout(function() { notif.classList.remove('show'); }, 3000);
    }
}

// Click overlay để đóng
document.addEventListener('DOMContentLoaded', function() {
    var overlay = document.getElementById('cccdModal');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeCCCDScanner();
        });
    }
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeCCCDScanner();
    });
});
