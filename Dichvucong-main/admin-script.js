// ===== CONSTANTS =====
const ADMIN_USER = 'admin';
const ADMIN_PASS_KEY = 'adminPassword';
const DEFAULT_PASS = 'admin@2024';
const STORAGE_KEY = 'appointments';
const NHA_DAT_KEY = 'nhaDatRegistrations';
const QR_CONFIG_KEY = 'adminQRConfig';
const ADMIN_SESSION_KEY = 'adminLoggedIn';
const PER_PAGE = 15;

let currentPage = 1;
let filteredData = [];
let allProfiles = [];
let currentDetailId = null;
let deleteTargetId = null;

// ===== AUTH =====
function doLogin() {
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    const storedPass = localStorage.getItem(ADMIN_PASS_KEY) || DEFAULT_PASS;
    if (user === ADMIN_USER && pass === storedPass) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminApp').style.display = 'flex';
        document.getElementById('adminName').textContent = user;
        initDashboard();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function doLogout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    document.getElementById('adminApp').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginError').style.display = 'none';
}

function checkSession() {
    if (sessionStorage.getItem(ADMIN_SESSION_KEY) === '1') {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminApp').style.display = 'flex';
        initDashboard();
    }
}

// ===== DATA =====
function loadAllProfiles() {
    const main = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').map(p => ({ ...p, _source: 'main', _type: 'Thủ tục hành chính' }));
    const nhaDat = JSON.parse(localStorage.getItem(NHA_DAT_KEY) || '[]').map(p => ({ ...p, _source: 'nhaDat', _type: 'Thủ tục nhà đất' }));
    allProfiles = [...main, ...nhaDat].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return allProfiles;
}

function saveProfile(profile) {
    const key = profile._source === 'nhaDat' ? NHA_DAT_KEY : STORAGE_KEY;
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    const idx = arr.findIndex(p => p.id === profile.id);
    if (idx !== -1) {
        const { _source, _type, ...clean } = profile;
        arr[idx] = clean;
        localStorage.setItem(key, JSON.stringify(arr));
    }
}

function deleteProfile(id, source) {
    const key = source === 'nhaDat' ? NHA_DAT_KEY : STORAGE_KEY;
    const arr = JSON.parse(localStorage.getItem(key) || '[]').filter(p => p.id !== id);
    localStorage.setItem(key, JSON.stringify(arr));
}

function generateFileCode(profile) {
    if (profile.fileCode) return profile.fileCode;
    const d = new Date(profile.createdAt);
    const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    return `HS${ymd}-${profile.id.slice(-4).toUpperCase()}`;
}

// ===== INIT =====
function initDashboard() {
    loadAllProfiles();
    renderStats();
    renderDashboardTable();
    renderProfilesTable();
    loadQRStatus();
}

// ===== STATS =====
function renderStats() {
    const data = loadAllProfiles();
    document.getElementById('statTotal').textContent = data.length;
    document.getElementById('statPending').textContent = data.filter(p => !p._status || p._status === 'pending').length;
    document.getElementById('statDone').textContent = data.filter(p => p._status === 'done').length;
    document.getElementById('statRejected').textContent = data.filter(p => p._status === 'rejected').length;
}

function statusBadge(status) {
    const map = { pending: ['badge-pending', 'Chờ xử lý'], processing: ['badge-processing', 'Đang xử lý'], done: ['badge-done', 'Hoàn thành'], rejected: ['badge-rejected', 'Từ chối'] };
    const s = status || 'pending';
    const [cls, label] = map[s] || ['badge-pending', 'Chờ xử lý'];
    return `<span class="badge ${cls}">${label}</span>`;
}

function fmtDate(str) {
    if (!str) return '—';
    const d = new Date(str);
    if (isNaN(d)) return str;
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

// ===== DASHBOARD TABLE =====
function renderDashboardTable() {
    const data = allProfiles.slice(0, 8);
    const tbody = document.getElementById('dashboardTable');
    if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-table"><div class="empty-icon">📭</div><p>Chưa có hồ sơ nào</p></td></tr>';
        return;
    }
    tbody.innerHTML = data.map(p => `
        <tr>
            <td><code style="font-size:11px;background:#f5f5f5;padding:2px 6px;border-radius:4px;">${generateFileCode(p)}</code></td>
            <td><strong>${esc(p.fullName || '—')}</strong></td>
            <td>${esc(p.idNumber || '—')}</td>
            <td>${esc(p.phone || '—')}</td>
            <td><span style="font-size:11px;color:#888;">${esc(p._type)}</span></td>
            <td>${fmtDate(p.createdAt)}</td>
            <td>${statusBadge(p._status)}</td>
        </tr>
    `).join('');
}

// ===== PROFILES TABLE =====
function renderProfilesTable() {
    applyFilters();
}

function applyFilters() {
    const search = document.getElementById('filterSearch').value.toLowerCase().trim();
    const status = document.getElementById('filterStatus').value;
    const type = document.getElementById('filterType').value;
    const date = document.getElementById('filterDate').value;

    filteredData = allProfiles.filter(p => {
        const code = generateFileCode(p).toLowerCase();
        const matchSearch = !search || (p.fullName || '').toLowerCase().includes(search) || (p.idNumber || '').toLowerCase().includes(search) || code.includes(search) || (p.phone || '').includes(search);
        const matchStatus = !status || (p._status || 'pending') === status;
        const matchType = !type || p._source === type;
        const matchDate = !date || (p.createdAt && p.createdAt.startsWith(date));
        return matchSearch && matchStatus && matchType && matchDate;
    });

    currentPage = 1;
    renderFilteredTable();
}

function resetFilters() {
    document.getElementById('filterSearch').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterType').value = '';
    document.getElementById('filterDate').value = '';
    applyFilters();
}

function renderFilteredTable() {
    const tbody = document.getElementById('profilesTable');
    const total = filteredData.length;
    const start = (currentPage - 1) * PER_PAGE;
    const page = filteredData.slice(start, start + PER_PAGE);

    if (!page.length) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-table"><div class="empty-icon">🔍</div><p>Không tìm thấy hồ sơ nào</p></td></tr>';
    } else {
        tbody.innerHTML = page.map((p, i) => `
            <tr>
                <td style="color:#aaa;font-size:12px;">${start + i + 1}</td>
                <td><code style="font-size:11px;background:#f5f5f5;padding:2px 6px;border-radius:4px;cursor:pointer;" onclick="openDetail('${p.id}','${p._source}')" title="Xem chi tiết">${generateFileCode(p)}</code></td>
                <td><strong>${esc(p.fullName || '—')}</strong></td>
                <td>${esc(p.idNumber || '—')}</td>
                <td>${esc(p.phone || '—')}</td>
                <td><span style="font-size:11px;background:#f0f0f0;padding:2px 8px;border-radius:10px;">${esc(p._type)}</span></td>
                <td>${fmtDate(p.createdAt)}</td>
                <td>${statusBadge(p._status)}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-secondary btn-xs" onclick="openDetail('${p.id}','${p._source}')">👁 Xem</button>
                        <button class="btn btn-danger btn-xs" onclick="openDelete('${p.id}','${p._source}','${esc(p.fullName || '')}')">🗑</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    renderPagination(total);
}

function renderPagination(total) {
    const pages = Math.ceil(total / PER_PAGE);
    const el = document.getElementById('pagination');
    if (pages <= 1) { el.innerHTML = ''; return; }
    let html = `<span class="page-info">Tổng ${total} hồ sơ</span>`;
    html += `<button class="page-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}>‹</button>`;
    for (let i = 1; i <= pages; i++) {
        if (pages > 7 && i > 2 && i < pages - 1 && Math.abs(i - currentPage) > 1) {
            if (i === 3 || i === pages - 2) html += `<span style="padding:0 4px;color:#aaa;">…</span>`;
            continue;
        }
        html += `<button class="page-btn ${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;
    }
    html += `<button class="page-btn" onclick="goPage(${currentPage+1})" ${currentPage===pages?'disabled':''}>›</button>`;
    el.innerHTML = html;
}

function goPage(p) {
    const pages = Math.ceil(filteredData.length / PER_PAGE);
    if (p < 1 || p > pages) return;
    currentPage = p;
    renderFilteredTable();
}

// ===== DETAIL MODAL =====
function openDetail(id, source) {
    const p = allProfiles.find(x => x.id === id && x._source === source);
    if (!p) return;
    currentDetailId = { id, source };

    const code = generateFileCode(p);
    document.getElementById('modalDetailTitle').textContent = `📄 Hồ sơ: ${code}`;

    const val = (v) => v ? esc(v) : '<span class="detail-value empty">Chưa có</span>';
    const row = (label, value, full = false) => `
        <div class="detail-item ${full ? 'detail-full' : ''}">
            <div class="detail-label">${label}</div>
            <div class="detail-value">${val(value)}</div>
        </div>`;

    let html = `
        <div class="detail-section">
            <div class="detail-section-title">🔑 Thông tin hồ sơ</div>
            <div class="detail-grid">
                ${row('Mã hồ sơ', code)}
                ${row('Loại hồ sơ', p._type)}
                ${row('Ngày nộp', fmtDate(p.createdAt))}
                ${row('Đơn vị tiếp nhận', p.receivingUnit)}
                ${row('Lĩnh vực', p.procedureField)}
                ${row('Tên thủ tục', p.procedureName)}
            </div>
        </div>
        <div class="detail-section">
            <div class="detail-section-title">👤 Thông tin người nộp</div>
            <div class="detail-grid">
                ${row('Họ và tên', p.fullName)}
                ${row('Ngày sinh', p.birthDate ? fmtDate(p.birthDate+'T00:00:00') : '')}
                ${row('Giới tính', p.gender === 'nam' ? 'Nam' : p.gender === 'nu' ? 'Nữ' : p.gender)}
                ${row('CMND/CCCD', p.idNumber)}
                ${row('Ngày cấp', p.issueDate ? fmtDate(p.issueDate+'T00:00:00') : '')}
                ${row('Nơi cấp', p.issuePlace)}
                ${row('Điện thoại', p.phone)}
                ${row('Email', p.email)}
                ${row('Đối tượng', p.registrationType)}
                ${row('Địa chỉ thường trú', p.permanentAddress, true)}
                ${row('Địa chỉ tạm trú', p.temporaryAddress, true)}
            </div>
        </div>`;

    if (p.bankName || p.accountNumber) {
        html += `
        <div class="detail-section">
            <div class="detail-section-title">🏦 Thông tin ngân hàng</div>
            <div class="detail-grid">
                ${row('Ngân hàng', p.bankName)}
                ${row('Chi nhánh', p.bankBranch)}
                ${row('Số tài khoản', p.accountNumber)}
                ${row('Chủ tài khoản', p.accountHolder)}
            </div>
        </div>`;
    }

    if (p.plotNumber || p.plotAddress) {
        html += `
        <div class="detail-section">
            <div class="detail-section-title">🏠 Thông tin thửa đất / tài sản</div>
            <div class="detail-grid">
                ${row('Số thửa đất', p.plotNumber)}
                ${row('Tờ bản đồ số', p.mapSheetNumber)}
                ${row('Diện tích (m²)', p.area)}
                ${row('Loại đất', p.landType)}
                ${row('Số đỏ/hồng', p.redBookNumber)}
                ${row('Địa chỉ thửa đất', p.plotAddress, true)}
                ${row('Mục đích sử dụng', p.usagePurpose, true)}
            </div>
        </div>`;
    }

    if (p.authorizedPersonName) {
        html += `
        <div class="detail-section">
            <div class="detail-section-title">📋 Người được ủy quyền</div>
            <div class="detail-grid">
                ${row('Họ và tên', p.authorizedPersonName)}
                ${row('CMND/CCCD', p.authorizedPersonId)}
                ${row('Quan hệ', p.relationship)}
                ${row('Liên hệ', p.authorizedPersonContact)}
            </div>
        </div>`;
    }

    html += `
        <div class="detail-section">
            <div class="detail-section-title">⚙️ Quản lý hồ sơ (Admin)</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Trạng thái xử lý</div>
                    <select class="status-select" id="editStatus">
                        <option value="pending" ${(p._status||'pending')==='pending'?'selected':''}>⏳ Chờ xử lý</option>
                        <option value="processing" ${p._status==='processing'?'selected':''}>🔄 Đang xử lý</option>
                        <option value="done" ${p._status==='done'?'selected':''}>✅ Hoàn thành</option>
                        <option value="rejected" ${p._status==='rejected'?'selected':''}>❌ Từ chối</option>
                    </select>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Ghi chú của Admin</div>
                    <textarea class="admin-note-input" id="editNote" placeholder="Nhập ghi chú xử lý hồ sơ...">${esc(p._adminNote || '')}</textarea>
                </div>
            </div>
        </div>`;

    document.getElementById('modalDetailBody').innerHTML = html;
    openModal('modalDetail');
}

function saveProfileDetail() {
    if (!currentDetailId) return;
    const { id, source } = currentDetailId;
    const p = allProfiles.find(x => x.id === id && x._source === source);
    if (!p) return;
    p._status = document.getElementById('editStatus').value;
    p._adminNote = document.getElementById('editNote').value;
    saveProfile(p);
    loadAllProfiles();
    renderStats();
    renderFilteredTable();
    renderDashboardTable();
    closeModal('modalDetail');
    toast('✅ Đã lưu thông tin hồ sơ!', 'success');
}

function openQRFromProfile() {
    if (!currentDetailId) return;
    const { id, source } = currentDetailId;
    const p = allProfiles.find(x => x.id === id && x._source === source);
    if (!p) return;
    closeModal('modalDetail');
    showTab('qrmanager', document.querySelector('.sidebar-nav a:nth-child(3)'));
    if (p.bankName) {
        const bankMap = {
            'Vietcombank': 'VCB', 'BIDV': 'BIDV', 'VietinBank': 'ICB', 'Agribank': 'VBAAGRIBANK',
            'Techcombank': 'TCB', 'MBBank': 'MB', 'TPBank': 'TPBANK', 'ACB': 'ACB',
            'VPBank': 'VPB', 'Sacombank': 'STB', 'HDBank': 'HDB', 'SHB': 'SHB',
            'OCB': 'OCB', 'MSB': 'MSB', 'SeABank': 'SEABANK', 'Eximbank': 'EXIMBANK'
        };
        const bid = bankMap[p.bankName] || '';
        if (bid) document.getElementById('qrBank').value = bid;
        if (p.accountNumber) document.getElementById('qrAccount').value = p.accountNumber;
        if (p.accountHolder) document.getElementById('qrAccountName').value = p.accountHolder;
    }
    document.getElementById('qrFileCode').value = generateFileCode(p);
    document.getElementById('qrNote').value = `Phi dich vu ho so ${generateFileCode(p)}`;
    document.getElementById('qrTitle').value = `Thanh toán phí hồ sơ: ${p.fullName || ''}`;
}

// ===== DELETE =====
function openDelete(id, source, name) {
    deleteTargetId = { id, source };
    document.getElementById('deleteProfileName').textContent = name;
    openModal('modalDelete');
}

function confirmDelete() {
    if (!deleteTargetId) return;
    deleteProfile(deleteTargetId.id, deleteTargetId.source);
    loadAllProfiles();
    renderStats();
    renderDashboardTable();
    applyFilters();
    closeModal('modalDelete');
    deleteTargetId = null;
    toast('🗑 Đã xóa hồ sơ!', 'success');
}

function clearAllProfiles() {
    if (!confirm('Bạn có chắc chắn muốn xóa TẤT CẢ hồ sơ? Hành động này không thể hoàn tác!')) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(NHA_DAT_KEY);
    loadAllProfiles();
    renderStats();
    renderDashboardTable();
    applyFilters();
    toast('🗑 Đã xóa tất cả hồ sơ!', 'error');
}

// ===== QR =====
function buildQRUrl() {
    const bank = document.getElementById('qrBank').value;
    const account = document.getElementById('qrAccount').value.trim();
    const name = document.getElementById('qrAccountName').value.trim();
    const amount = document.getElementById('qrAmount').value;
    const note = document.getElementById('qrNote').value.trim();
    if (!bank || !account || !name) return null;
    let url = `https://img.vietqr.io/image/${bank}-${account}-compact2.png?accountName=${encodeURIComponent(name)}`;
    if (amount) url += `&amount=${amount}`;
    if (note) url += `&addInfo=${encodeURIComponent(note)}`;
    return url;
}

function previewQR() {
    const bank = document.getElementById('qrBank').value;
    const account = document.getElementById('qrAccount').value.trim();
    const name = document.getElementById('qrAccountName').value.trim();
    if (!bank || !account || !name) { toast('⚠️ Vui lòng chọn ngân hàng, số tài khoản và tên chủ tài khoản!', 'error'); return; }
    const url = buildQRUrl();
    const previewBox = document.getElementById('qrPreviewBox');
    const img = document.getElementById('qrPreviewImg');
    const info = document.getElementById('qrPreviewInfo');
    previewBox.classList.remove('hidden');
    img.src = url;
    const amount = document.getElementById('qrAmount').value;
    const note = document.getElementById('qrNote').value.trim();
    info.innerHTML = `<strong>Ngân hàng:</strong> ${document.getElementById('qrBank').options[document.getElementById('qrBank').selectedIndex].text}<br><strong>Số TK:</strong> ${account}<br><strong>Chủ TK:</strong> ${name}${amount ? `<br><strong>Số tiền:</strong> ${parseInt(amount).toLocaleString('vi-VN')} VNĐ` : ''}${note ? `<br><strong>Nội dung:</strong> ${note}` : ''}`;
}

function publishQR() {
    const bank = document.getElementById('qrBank').value;
    const account = document.getElementById('qrAccount').value.trim();
    const name = document.getElementById('qrAccountName').value.trim();
    if (!bank || !account || !name) { toast('⚠️ Vui lòng điền đủ thông tin QR!', 'error'); return; }
    const config = {
        bank, account, name,
        amount: document.getElementById('qrAmount').value,
        note: document.getElementById('qrNote').value.trim(),
        title: document.getElementById('qrTitle').value.trim() || 'Thanh toán phí dịch vụ',
        fileCode: document.getElementById('qrFileCode').value.trim(),
        bankLabel: document.getElementById('qrBank').options[document.getElementById('qrBank').selectedIndex].text,
        url: buildQRUrl(),
        publishedAt: new Date().toISOString()
    };
    localStorage.setItem(QR_CONFIG_KEY, JSON.stringify(config));
    loadQRStatus();
    toast('✅ Đã đăng QR lên trang chủ!', 'success');
}

function removeQR() {
    if (!confirm('Bạn có chắc muốn gỡ QR khỏi trang chủ?')) return;
    localStorage.removeItem(QR_CONFIG_KEY);
    loadQRStatus();
    toast('🗑 Đã gỡ QR khỏi trang chủ!', 'success');
}

function loadQRStatus() {
    const config = JSON.parse(localStorage.getItem(QR_CONFIG_KEY) || 'null');
    const el = document.getElementById('currentQRStatus');
    if (!config) {
        el.innerHTML = '<div style="text-align:center;padding:32px 20px;color:#aaa;"><div style="font-size:48px;margin-bottom:12px;">📭</div><p>Chưa có QR nào đang hiển thị trên trang chủ</p></div>';
        return;
    }
    el.innerHTML = `
        <div style="text-align:center;margin-bottom:16px;">
            <img src="${config.url}" alt="QR" style="width:180px;border-radius:10px;border:3px solid #27ae60;box-shadow:0 4px 16px rgba(0,0,0,0.1);">
        </div>
        <div style="background:#d4edda;border:1px solid #c3e6cb;border-radius:8px;padding:12px 16px;margin-bottom:14px;">
            <div style="font-size:13px;font-weight:700;color:#155724;margin-bottom:6px;">✅ QR đang hiển thị trên trang chủ</div>
        </div>
        <div style="font-size:13px;line-height:2;color:#555;">
            <div><b>Tiêu đề:</b> ${esc(config.title)}</div>
            <div><b>Ngân hàng:</b> ${esc(config.bankLabel)}</div>
            <div><b>Số TK:</b> ${esc(config.account)}</div>
            <div><b>Chủ TK:</b> ${esc(config.name)}</div>
            ${config.amount ? `<div><b>Số tiền:</b> ${parseInt(config.amount).toLocaleString('vi-VN')} VNĐ</div>` : ''}
            ${config.note ? `<div><b>Nội dung:</b> ${esc(config.note)}</div>` : ''}
            ${config.fileCode ? `<div><b>Mã hồ sơ:</b> ${esc(config.fileCode)}</div>` : ''}
            <div><b>Đăng lúc:</b> ${fmtDate(config.publishedAt)}</div>
        </div>
        <div style="margin-top:14px;">
            <button class="btn btn-danger btn-sm" onclick="removeQR()">🗑 Gỡ QR khỏi trang chủ</button>
        </div>`;
}

// ===== EXPORT =====
function exportData() {
    const data = filteredData.length ? filteredData : allProfiles;
    if (!data.length) { toast('⚠️ Không có dữ liệu để xuất!', 'error'); return; }
    const headers = ['Mã hồ sơ', 'Loại', 'Họ tên', 'Ngày sinh', 'Giới tính', 'CCCD/CMND', 'Điện thoại', 'Email', 'Địa chỉ', 'Ngân hàng', 'Số TK', 'Chủ TK', 'Trạng thái', 'Ghi chú', 'Ngày nộp'];
    const rows = data.map(p => [
        generateFileCode(p), p._type, p.fullName || '', p.birthDate || '', p.gender || '', p.idNumber || '', p.phone || '', p.email || '', p.permanentAddress || '', p.bankName || '', p.accountNumber || '', p.accountHolder || '', p._status || 'pending', p._adminNote || '', fmtDate(p.createdAt)
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `ho-so-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast('⬇ Đã xuất dữ liệu CSV!', 'success');
}

// ===== TABS =====
function showTab(name, linkEl) {
    ['dashboard', 'profiles', 'qrmanager'].forEach(t => { document.getElementById('tab-' + t).style.display = 'none'; });
    document.getElementById('tab-' + name).style.display = 'block';
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    if (linkEl) linkEl.classList.add('active');
    const titles = { dashboard: 'Tổng quan hệ thống', profiles: 'Danh sách hồ sơ', qrmanager: 'Quản lý QR thanh toán' };
    document.getElementById('pageTitle').textContent = titles[name] || '';
    if (name === 'profiles') { loadAllProfiles(); renderProfilesTable(); }
    if (name === 'qrmanager') loadQRStatus();
}

// ===== MODAL =====
function openModal(id) { document.getElementById(id).classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow = ''; }

// ===== TOAST =====
function toast(msg, type = '') {
    const el = document.getElementById('adminToast');
    el.textContent = msg; el.className = 'admin-toast show ' + type;
    setTimeout(() => { el.classList.remove('show'); }, 3000);
}

// ===== UTILS =====
function esc(str) { return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ===== KEYBOARD =====
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        ['modalDetail', 'modalDelete'].forEach(id => { document.getElementById(id).classList.remove('open'); });
        document.body.style.overflow = '';
    }
});
document.getElementById('loginPass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
document.querySelectorAll('.modal-overlay').forEach(m => { m.addEventListener('click', function(e) { if (e.target === this) { this.classList.remove('open'); document.body.style.overflow = ''; } }); });

// ===== BOOT =====
checkSession();
