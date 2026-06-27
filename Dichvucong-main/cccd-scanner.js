// ===== CCCD CHIP SCANNER — 3-phase flow =====
// Phase 0: Ready (nút Bắt đầu)
// Phase 1: Scanning 30s (countdown 50s)
// Phase 2: Kết quả → fade out → về trang chủ

var _cccdData   = null;
var _scanTimer  = null;
var _cdTimer    = null;
var _secsLeft   = 50;
var _scanElapsed = 0;

// ── Dữ liệu giả lập ──
var _HO_NAM  = ['Nguyễn','Trần','Lê','Phạm','Hoàng','Phan','Vũ','Đặng','Bùi','Đỗ','Hồ','Ngô'];
var _TEN_NAM = ['Văn An','Hữu Bình','Đức Cường','Minh Dũng','Quốc Hùng','Trung Khoa','Xuân Long','Công Mạnh','Tuấn Nam','Bá Phúc'];
var _HO_NU   = ['Nguyễn','Trần','Lê','Phạm','Hoàng','Phan'];
var _TEN_NU  = ['Thị Anh','Ngọc Chi','Kim Dung','Thu Hằng','Bích Hoa','Lan Huệ','Mai Linh','Hồng Nga','Phương Nhung','Thị Oanh'];
var _TINH    = ['Hà Nội','TP. Hồ Chí Minh','Đà Nẵng','Hải Phòng','Cần Thơ','Nghệ An','Thanh Hóa','Bình Dương','Đồng Nai','Khánh Hòa','Quảng Nam','Thừa Thiên Huế','Lâm Đồng','Kiên Giang','An Giang'];
var _DUONG   = ['Đường Láng','Nguyễn Trãi','Lê Lợi','Trần Hưng Đạo','Hoàng Hoa Thám','Đinh Tiên Hoàng','Nguyễn Huệ','Hai Bà Trưng','Nguyễn Văn Cừ','Tôn Đức Thắng','Cách Mạng Tháng 8','Phan Đình Phùng'];
var _PHUONG  = ['Phường 1','Phường 3','Phường 5','Phường Bến Nghé','Phường Đông Khê','Phường Lê Lợi','Phường Hàng Bạc','Phường Tràng Tiền','Phường Hải Châu'];
var _QUAN    = ['Quận 1','Quận 3','Quận Hoàn Kiếm','Quận Hai Bà Trưng','Quận Đống Đa','Quận Bình Thạnh','Quận Tân Bình','Quận Hải Châu'];
var _MSGS    = [
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

function _rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
function _rndInt(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }
function _pad(n) { return String(n).padStart(2,'0'); }

function _genCCCD() {
    var pre = ['001','002','004','048','079','260','274','292'];
    return _rnd(pre) + _rndInt(0,1) + _rndInt(0,9) + String(_rndInt(100000,999999));
}

function _genData() {
    var male = Math.random() > 0.45;
    var name = male ? (_rnd(_HO_NAM)+' '+_rnd(_TEN_NAM)) : (_rnd(_HO_NU)+' '+_rnd(_TEN_NU));
    var doy  = _rndInt(1960,2005), dom = _rndInt(1,12), dod = _rndInt(1,28);
    var dob  = _pad(dod)+'/'+_pad(dom)+'/'+doy;
    var iy   = _rndInt(Math.max(doy+14,2021),2024);
    var im   = _rndInt(1,12), iday = _rndInt(1,28);
    var idate = _pad(iday)+'/'+_pad(im)+'/'+iy;
    var tinh = _rnd(_TINH);
    var addr = _rndInt(1,350)+' '+_rnd(_DUONG)+', '+_rnd(_PHUONG)+', '+_rnd(_QUAN)+', '+tinh;
    return {
        id: _genCCCD(),
        name: name.toUpperCase(),
        dob: dob,
        gender: male ? 'Nam' : 'Nữ',
        nation: 'Việt Nam',
        hometown: tinh,
        address: addr,
        issueDate: idate,
        expiry: doy <= 1993 ? 'Không thời hạn' : _pad(iday)+'/'+_pad(im)+'/'+(iy+25),
        issueBy: 'Cục Cảnh sát quản lý hành chính về trật tự xã hội'
    };
}

// ── Helpers ──
function _el(id)  { return document.getElementById(id); }
function _show(id, flex) { var e=_el(id); if(e){ e.style.display = flex ? 'flex' : 'block'; } }
function _hide(id) { var e=_el(id); if(e) e.style.display='none'; }

// ── Open / Close ──
function openCCCDScanner(e) {
    if (e) e.preventDefault();
    var m = _el('cccdModal');
    if (!m) return;
    m.classList.add('open');
    document.body.style.overflow = 'hidden';
    _resetAll();
    _showPhase('ready');
}

function closeCCCDScanner() {
    _clearTimers();
    var m = _el('cccdModal');
    if (m) m.classList.remove('open');
    document.body.style.overflow = '';
}

function _clearTimers() {
    if (_scanTimer) { clearInterval(_scanTimer); _scanTimer = null; }
    if (_cdTimer)   { clearInterval(_cdTimer);   _cdTimer   = null; }
}

function _resetAll() {
    _clearTimers();
    _cccdData    = null;
    _secsLeft    = 50;
    _scanElapsed = 0;
}

function _showPhase(phase) {
    _hide('cccdPhaseReady');
    _hide('cccdPhaseScanning');
    _hide('cccdPhaseResult');
    _hide('cccdCountdown');

    if (phase === 'ready') {
        _show('cccdPhaseReady', true);
    } else if (phase === 'scanning') {
        _show('cccdPhaseScanning', true);
        _show('cccdCountdown', true);
    } else if (phase === 'result') {
        _show('cccdPhaseResult', true);
    }
}

// ── Phase 0 → Phase 1: Bắt đầu quét ──
function cccdStartScan() {
    _resetAll();
    _showPhase('scanning');

    var TOTAL = 30;
    var circ  = 150.8;
    var msgIdx = 0;

    // Reset ring
    var ring = _el('cccdRingPath');
    if (ring) { ring.style.strokeDashoffset = circ; ring.style.stroke = '#00e5ff'; }
    var lbl = _el('cccdRingLabel');
    if (lbl) lbl.textContent = '30';

    // Scan timer — mỗi giây
    _scanTimer = setInterval(function() {
        _scanElapsed++;

        // Ring progress
        var ratio  = _scanElapsed / TOTAL;
        var offset = circ * (1 - ratio);
        if (ring) ring.style.strokeDashoffset = offset.toFixed(1);
        if (lbl)  lbl.textContent = Math.max(TOTAL - _scanElapsed, 0);

        // Status messages
        var newIdx = Math.min(Math.floor(ratio * _MSGS.length), _MSGS.length - 1);
        if (newIdx !== msgIdx) {
            msgIdx = newIdx;
            var st = _el('cccdScanStatus');
            if (st) {
                st.textContent = _MSGS[msgIdx];
                st.classList.add('active');
                setTimeout(function(){ if(st) st.classList.remove('active'); }, 700);
            }
        }

        // Guide text updates
        var g = _el('cccdGuideText');
        if (g) {
            if (_scanElapsed === 8)  g.textContent = 'Đang đọc dữ liệu chip — giữ yên thẻ...';
            if (_scanElapsed === 18) g.textContent = 'Đang xác thực thông tin sinh trắc học...';
            if (_scanElapsed === 26) g.textContent = 'Hoàn tất, đang mã hóa dữ liệu...';
        }

        // Hoàn thành sau 30s
        if (_scanElapsed >= TOTAL) {
            clearInterval(_scanTimer); _scanTimer = null;
            _onScanDone();
        }
    }, 1000);

    // Countdown 50s
    _cdTimer = setInterval(function() {
        _secsLeft--;
        var cd = _el('cccdCountdown');
        if (cd) {
            cd.textContent = _secsLeft;
            if (_secsLeft <= 10) cd.classList.add('urgent');
        }
        if (_secsLeft <= 0) {
            clearInterval(_cdTimer); _cdTimer = null;
            _returnHome();
        }
    }, 1000);
}

// ── Phase 1 → Phase 2: Kết quả ──
function _onScanDone() {
    _cccdData = _genData();

    // Dừng countdown
    if (_cdTimer) { clearInterval(_cdTimer); _cdTimer = null; }

    // Chuyển ring sang xanh lá
    var ring = _el('cccdRingPath');
    if (ring) { ring.style.stroke = '#00e676'; ring.style.strokeDashoffset = '0'; }
    var lbl = _el('cccdRingLabel');
    if (lbl) lbl.textContent = '✓';

    // Sang phase kết quả sau 0.8s
    setTimeout(function() {
        _buildResult(_cccdData);
        _showPhase('result');

        // Sau 6s hiển thị thông tin → fade out → về trang chủ
        setTimeout(function() {
            var overlay = _el('cccdModal');
            if (overlay) overlay.classList.add('cccd-fade-out');
            setTimeout(_returnHome, 650);
        }, 6000);
    }, 800);
}

function _buildResult(d) {
    var body = _el('cccdResultBody');
    if (!body) return;
    var fields = [
        { label: 'Họ và tên',    val: d.name,      mono: false },
        { label: 'Số CCCD',      val: d.id,         mono: true  },
        { label: 'Ngày sinh',    val: d.dob,        mono: false },
        { label: 'Giới tính',    val: d.gender,     mono: false },
        { label: 'Quốc tịch',   val: d.nation,     mono: false },
        { label: 'Quê quán',    val: d.hometown,   mono: false },
        { label: 'Địa chỉ',     val: d.address,    mono: false },
        { label: 'Ngày cấp',    val: d.issueDate,  mono: false },
        { label: 'Có giá trị đến', val: d.expiry,  mono: false },
    ];
    body.innerHTML = fields.map(function(f) {
        return '<div class="cccd-rf">'
            + '<span class="cccd-rf-label">'+f.label+'</span>'
            + '<span class="cccd-rf-val'+(f.mono?' mono':'')+'">'+f.val+'</span>'
            + '</div>';
    }).join('');
}

function _returnHome() {
    closeCCCDScanner();
    var m = _el('cccdModal');
    if (m) m.classList.remove('cccd-fade-out');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Keyboard ESC
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeCCCDScanner();
    });
});
