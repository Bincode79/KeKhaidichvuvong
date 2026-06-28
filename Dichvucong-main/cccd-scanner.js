// ===== CCCD CHIP SCANNER — 3-phase realistic flow =====
// Phase 0: Ready (nút Bắt đầu đọc chip)
// Phase 1: Scanning — NFC detect → connect → read → verify → CSDLQG (30s)
// Phase 2: Kết quả → countdown 8s → fade out → đóng

var _cccdData    = null;
var _scanTimer   = null;
var _cdTimer     = null;
var _resCdTimer  = null;
var _secsLeft    = 50;
var _scanElapsed = 0;
var _resSecsLeft = 8;

// ── Dữ liệu giả lập ──
var _HO_NAM  = ['Nguyễn','Trần','Lê','Phạm','Hoàng','Phan','Vũ','Đặng','Bùi','Đỗ','Hồ','Ngô','Dương','Lý'];
var _TEN_NAM = ['Văn An','Hữu Bình','Đức Cường','Minh Dũng','Quốc Hùng','Trung Khoa','Xuân Long','Công Mạnh','Tuấn Nam','Bá Phúc','Chí Thanh','Tiến Đạt','Quang Vinh','Hải Phong'];
var _HO_NU   = ['Nguyễn','Trần','Lê','Phạm','Hoàng','Phan','Bùi','Đỗ'];
var _TEN_NU  = ['Thị Anh','Ngọc Chi','Kim Dung','Thu Hằng','Bích Hoa','Lan Huệ','Mai Linh','Hồng Nga','Phương Nhung','Thị Oanh','Thanh Tuyền','Khánh Linh','Minh Châu','Diệu Linh'];
var _TINH    = ['Hà Nội','TP. Hồ Chí Minh','Đà Nẵng','Hải Phòng','Cần Thơ','Nghệ An','Thanh Hóa','Bình Dương','Đồng Nai','Khánh Hòa','Quảng Nam','Thừa Thiên Huế','Lâm Đồng','Kiên Giang','An Giang','Bắc Ninh','Vĩnh Phúc','Hưng Yên'];
var _DUONG   = ['Đường Láng','Nguyễn Trãi','Lê Lợi','Trần Hưng Đạo','Hoàng Hoa Thám','Đinh Tiên Hoàng','Nguyễn Huệ','Hai Bà Trưng','Nguyễn Văn Cừ','Tôn Đức Thắng','Cách Mạng Tháng 8','Phan Đình Phùng','Lý Thường Kiệt','Trường Chinh','Giải Phóng'];
var _PHUONG  = ['Phường 1','Phường 3','Phường 5','Phường Bến Nghé','Phường Đông Khê','Phường Lê Lợi','Phường Hàng Bạc','Phường Tràng Tiền','Phường Hải Châu 1','Phường Cầu Ông Lãnh','Phường Bến Thành'];
var _QUAN    = ['Quận 1','Quận 3','Quận Hoàn Kiếm','Quận Hai Bà Trưng','Quận Đống Đa','Quận Bình Thạnh','Quận Tân Bình','Quận Hải Châu','Quận Sơn Trà','Quận Ngô Quyền'];

// ── Timeline các bước giả lập (elapsed giây → hành động) ──
var _STEPS_DEF = [
    // [step_id, elapsed_trigger, msg, signal_level(0-4)]
    { step: 0, at: 2,  msg: 'Phát hiện tín hiệu chip NFC...', sig: 1 },
    { step: 0, at: 5,  msg: 'Chip CCCD được phát hiện!',      sig: 2, chipDetected: true },
    { step: 1, at: 7,  msg: 'Đang kết nối chip CCCD...',      sig: 2 },
    { step: 1, at: 10, msg: 'Kết nối chip thành công (13.56 MHz)', sig: 3 },
    { step: 2, at: 12, msg: 'Đang đọc dữ liệu hộ chiếu số...', sig: 3 },
    { step: 2, at: 16, msg: 'Đọc cấu trúc DG1, DG2, DG5...', sig: 3 },
    { step: 3, at: 18, msg: 'Đang xác thực chữ ký số (BAC)...', sig: 3 },
    { step: 3, at: 21, msg: 'Xác thực AA/PA hoàn tất...',    sig: 4 },
    { step: 4, at: 23, msg: 'Đọc dữ liệu sinh trắc học...', sig: 4 },
    { step: 4, at: 26, msg: 'Giải mã face template & dữ liệu vân tay...', sig: 4 },
    { step: 5, at: 27, msg: 'Kiểm tra CSDL Quốc gia về dân cư...', sig: 4 },
    { step: 5, at: 29, msg: 'Hoàn tất xác thực — đang mã hóa dữ liệu...', sig: 4 },
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
        id:       _genCCCD(),
        name:     name.toUpperCase(),
        dob:      dob,
        gender:   male ? 'Nam' : 'Nữ',
        nation:   'Việt Nam',
        hometown: tinh,
        address:  addr,
        issueDate: idate,
        expiry:   doy <= 1993 ? 'Không thời hạn' : _pad(iday)+'/'+_pad(im)+'/'+(iy+25),
        issueBy:  'Cục Cảnh sát quản lý hành chính về trật tự xã hội'
    };
}

// ── DOM helpers ──
function _el(id)  { return document.getElementById(id); }
function _show(id, flex) { var e=_el(id); if(e){ e.style.display = flex ? 'flex' : 'block'; } }
function _hide(id) { var e=_el(id); if(e) e.style.display='none'; }

// ── Signal bars ──
function _setSignal(level, done) {
    for (var i=1; i<=4; i++) {
        var bar = _el('cccdSig'+i);
        if (!bar) continue;
        bar.className = 'cccd-signal-bar b'+i;
        if (done)        bar.classList.add('full');
        else if (i <= level) bar.classList.add('active');
    }
}

// ── Steps ──
function _stepDone(idx) {
    var s = _el('cccdStep'+idx);
    if (!s) return;
    s.className = 'cccd-step done';
    s.querySelector('.cccd-step-icon').textContent = '✓';
}
function _stepActive(idx) {
    // First mark all previous as done (if not already)
    for (var i=0; i<idx; i++) _stepDone(i);
    var s = _el('cccdStep'+idx);
    if (!s) return;
    s.className = 'cccd-step active-step';
    s.querySelector('.cccd-step-icon').textContent = '›';
}
function _allStepsDone() {
    for (var i=0; i<6; i++) _stepDone(i);
    _setSignal(4, true);
}

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
    if (_resCdTimer){ clearInterval(_resCdTimer); _resCdTimer = null; }
}

function _resetAll() {
    _clearTimers();
    _cccdData    = null;
    _secsLeft    = 50;
    _scanElapsed = 0;
    _resSecsLeft = 8;

    // Reset steps
    for (var i=0; i<6; i++) {
        var s = _el('cccdStep'+i);
        if (s) {
            s.className = 'cccd-step';
            var icon = s.querySelector('.cccd-step-icon');
            if (icon) icon.textContent = '◌';
        }
    }
    // Reset signal
    _setSignal(0, false);

    // Reset chip banner
    var ban = _el('cccdChipBanner');
    if (ban) { ban.className = 'cccd-chip-banner'; ban.textContent = ''; }

    // Reset guide
    var g = _el('cccdGuideText');
    if (g) { g.className = 'cccd-fs-guide'; }
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

    var TOTAL   = 30;
    var circ    = 150.8;
    var lastStepIdx = -1;

    // Reset ring
    var ring = _el('cccdRingPath');
    if (ring) { ring.style.strokeDashoffset = circ; ring.style.stroke = '#CE7A58'; }
    var lbl = _el('cccdRingLabel');
    if (lbl) lbl.textContent = '30';

    // Main scan timer — mỗi giây
    _scanTimer = setInterval(function() {
        _scanElapsed++;

        // Ring progress
        var ratio  = _scanElapsed / TOTAL;
        var offset = circ * (1 - ratio);
        if (ring) ring.style.strokeDashoffset = offset.toFixed(1);
        if (lbl)  lbl.textContent = Math.max(TOTAL - _scanElapsed, 0);

        // Process timeline events
        for (var i=0; i<_STEPS_DEF.length; i++) {
            var ev = _STEPS_DEF[i];
            if (_scanElapsed === ev.at) {
                // Update status
                var st = _el('cccdScanStatus');
                if (st) {
                    st.textContent = ev.msg;
                    st.classList.add('active');
                    setTimeout(function(){ if(st) st.classList.remove('active'); }, 900);
                }

                // Update signal
                _setSignal(ev.sig, false);

                // Chip detected animation
                if (ev.chipDetected) {
                    var ban = _el('cccdChipBanner');
                    if (ban) {
                        ban.textContent = '📡 Chip CCCD đã kết nối — đang đọc dữ liệu...';
                        ban.className = 'cccd-chip-banner show';
                    }
                    var g = _el('cccdGuideText');
                    if (g) {
                        g.textContent = 'Chip đã được phát hiện — tiếp tục giữ yên thẻ...';
                        g.className = 'cccd-fs-guide highlight';
                    }
                    // Ripple effect
                    _addRipple();
                }

                // Activate current step
                if (ev.step !== lastStepIdx) {
                    lastStepIdx = ev.step;
                    _stepActive(ev.step);
                }
            }
        }

        // Guide text mid-phase updates
        var g2 = _el('cccdGuideText');
        if (g2) {
            if (_scanElapsed === 12) { g2.textContent = 'Đang đọc cấu trúc hộ chiếu số...'; g2.className = 'cccd-fs-guide'; }
            if (_scanElapsed === 18) { g2.textContent = 'Đang xác thực chữ ký số (BAC/PA)...'; }
            if (_scanElapsed === 24) { g2.textContent = 'Đang đọc dữ liệu sinh trắc học...'; }
            if (_scanElapsed === 27) { g2.textContent = 'Đang kết nối Cơ sở dữ liệu Quốc gia...'; }
        }

        // Hoàn thành sau 30s
        if (_scanElapsed >= TOTAL) {
            clearInterval(_scanTimer); _scanTimer = null;
            _onScanDone();
        }
    }, 1000);

    // Countdown 50s (timeout bảo vệ)
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

// ── Ripple effect khi phát hiện chip ──
function _addRipple() {
    var frame = _el('cccdFrame');
    if (!frame) return;
    var r = document.createElement('div');
    r.className = 'cccd-chip-ripple';
    frame.appendChild(r);
    setTimeout(function(){ if(r.parentNode) r.parentNode.removeChild(r); }, 1300);
}

// ── Phase 1 → Phase 2: Kết quả ──
function _onScanDone() {
    _cccdData = _genData();

    // Dừng countdown
    if (_cdTimer) { clearInterval(_cdTimer); _cdTimer = null; }

    // All steps done, signal full green
    _allStepsDone();

    // Ring sang xanh lá
    var ring = _el('cccdRingPath');
    if (ring) { ring.style.stroke = '#4cde80'; ring.style.strokeDashoffset = '0'; }
    var lbl = _el('cccdRingLabel');
    if (lbl) lbl.textContent = '✓';

    // Guide text
    var g = _el('cccdGuideText');
    if (g) { g.textContent = 'Hoàn tất — xác thực dữ liệu thành công!'; g.className = 'cccd-fs-guide highlight'; }

    // Status text
    var st = _el('cccdScanStatus');
    if (st) { st.textContent = 'Xác thực chip hoàn tất!'; st.classList.add('active'); }

    // Update chip banner
    var ban = _el('cccdChipBanner');
    if (ban) {
        ban.textContent = '✅ Xác thực CSDL Quốc gia thành công';
        ban.style.borderColor = 'rgba(76,222,128,0.4)';
        ban.style.background  = 'rgba(76,222,128,0.1)';
        ban.style.color       = '#4cde80';
    }

    // Sang phase kết quả sau 0.8s
    setTimeout(function() {
        _buildResult(_cccdData);
        _showPhase('result');
        _startResultCountdown();
    }, 900);
}

// ── Countdown trong màn kết quả ──
function _startResultCountdown() {
    _resSecsLeft = 8;
    var cd = _el('cccdResultCountdown');
    if (cd) cd.textContent = _resSecsLeft + 's';

    _resCdTimer = setInterval(function() {
        _resSecsLeft--;
        if (cd) cd.textContent = _resSecsLeft + 's';
        if (_resSecsLeft <= 0) {
            clearInterval(_resCdTimer); _resCdTimer = null;
            var overlay = _el('cccdModal');
            if (overlay) overlay.classList.add('cccd-fade-out');
            setTimeout(_returnHome, 700);
        }
    }, 1000);
}

function _buildResult(d) {
    var body = _el('cccdResultBody');
    if (!body) return;
    var fields = [
        { label: 'Họ và tên',        val: d.name,      mono: false },
        { label: 'Số CCCD',          val: d.id,         mono: true  },
        { label: 'Ngày sinh',        val: d.dob,        mono: false },
        { label: 'Giới tính',        val: d.gender,     mono: false },
        { label: 'Quốc tịch',        val: d.nation,     mono: false },
        { label: 'Quê quán',         val: d.hometown,   mono: false },
        { label: 'Địa chỉ TT',       val: d.address,    mono: false },
        { label: 'Ngày cấp',         val: d.issueDate,  mono: false },
        { label: 'Có giá trị đến',   val: d.expiry,     mono: false },
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
