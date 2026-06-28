// Hiển thị thông báo
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Tạo mã đồng bộ ngẫu nhiên (8 ký tự: chữ và số)
function generateSyncCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Hiển thị modal thông báo mã đồng bộ
function showSyncCodeModal(syncCode, bankName) {
    // Xóa modal cũ nếu có
    const existingModal = document.querySelector('.sync-code-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Tạo modal element
    const modal = document.createElement('div');
    modal.className = 'sync-code-modal';
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.zIndex = '10000';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.innerHTML = `
        <div class="sync-code-modal-overlay"></div>
        <div class="sync-code-modal-content">
            <div class="sync-code-modal-header">
                <h3>Mã Đồng Bộ Liên Kết</h3>
                <button class="sync-code-modal-close" onclick="this.closest('.sync-code-modal').remove()">×</button>
            </div>
            <div class="sync-code-modal-body">
                <div class="sync-code-icon">🔐</div>
                <p class="sync-code-message" style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
                    <strong>Mã đồng bộ đã được gửi về ứng dụng ngân hàng liên kết.</strong>
                </p>
                <p class="sync-code-instruction" style="font-size: 14px; line-height: 1.6; color: #666; margin-bottom: 20px;">
                    Vui lòng truy cập vào ứng dụng ngân hàng liên kết để thực hiện lấy mã đồng bộ.
                </p>
                <div class="sync-code-actions">
                    <button class="btn btn-primary" onclick="this.closest('.sync-code-modal').remove();">
                        Đã hiểu
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Đóng modal khi click vào overlay
    const overlay = modal.querySelector('.sync-code-modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', function() {
            modal.remove();
        });
    }
    
    // Đảm bảo modal hiển thị
    setTimeout(function() {
        modal.style.display = 'flex';
    }, 10);
}

// Sao chép mã đồng bộ
function copySyncCode(code) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
            const btn = document.querySelector('.btn-copy-code');
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = 'Đã sao chép!';
                btn.style.background = '#28a745';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                }, 2000);
            }
        }).catch(() => {
            // Fallback: sử dụng phương pháp cũ
            fallbackCopyTextToClipboard(code);
        });
    } else {
        // Fallback cho trình duyệt không hỗ trợ clipboard API
        fallbackCopyTextToClipboard(code);
    }
}

// Phương pháp sao chép dự phòng
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            const btn = document.querySelector('.btn-copy-code');
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = 'Đã sao chép!';
                btn.style.background = '#28a745';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                }, 2000);
            }
        } else {
            showNotification('Không thể sao chép mã. Vui lòng ghi lại mã thủ công.', 'error');
        }
    } catch (err) {
        showNotification('Không thể sao chép mã. Vui lòng ghi lại mã thủ công.', 'error');
    }
    document.body.removeChild(textArea);
}

// Đặt hàm vào window để có thể gọi từ onclick
window.copySyncCode = copySyncCode;

// Lưu thông tin đăng ký liên kết vào localStorage
function saveBankSyncRegistration(data, syncCode) {
    const registrations = getBankSyncRegistrations();
    const newRegistration = {
        id: Date.now().toString(),
        ...data,
        syncCode: syncCode,
        createdAt: new Date().toISOString(),
        status: 'pending' // pending, approved, rejected
    };
    registrations.push(newRegistration);
    localStorage.setItem('bankSyncRegistrations', JSON.stringify(registrations));
    
    return newRegistration;
}

// Lấy danh sách đăng ký liên kết
function getBankSyncRegistrations() {
    const registrations = localStorage.getItem('bankSyncRegistrations');
    return registrations ? JSON.parse(registrations) : [];
}

// Khởi tạo dropdown địa chỉ
function initAddressDropdowns() {
    const provinceSelect = document.getElementById('syncProvince');
    const districtSelect = document.getElementById('syncDistrict');
    const wardSelect = document.getElementById('syncWard');
    
    if (!provinceSelect || !districtSelect || !wardSelect) return;
    
    // Xử lý khi chọn tỉnh/thành phố
    provinceSelect.addEventListener('change', function() {
        const provinceId = this.value;
        
        // Reset quận/huyện và xã/phường
        districtSelect.innerHTML = '<option value="">-- Chọn Quận/Huyện --</option>';
        wardSelect.innerHTML = '<option value="">-- Chọn Xã/Phường --</option>';
        districtSelect.disabled = true;
        wardSelect.disabled = true;
        
        if (!provinceId) return;
        
        // Kiểm tra xem có dữ liệu trong provincesData không
        if (typeof provincesData !== 'undefined' && provincesData[provinceId]) {
            const province = provincesData[provinceId];
            
            // Populate quận/huyện
            if (province.districts) {
                districtSelect.disabled = false;
                Object.keys(province.districts).forEach(districtId => {
                    const district = province.districts[districtId];
                    const option = document.createElement('option');
                    option.value = districtId;
                    option.textContent = district.name;
                    districtSelect.appendChild(option);
                });
            }
        }
    });
    
    // Xử lý khi chọn quận/huyện
    districtSelect.addEventListener('change', function() {
        const districtId = this.value;
        const provinceId = provinceSelect.value;
        
        // Reset xã/phường
        wardSelect.innerHTML = '<option value="">-- Chọn Xã/Phường --</option>';
        wardSelect.disabled = true;
        
        if (!districtId || !provinceId) return;
        
        // Kiểm tra xem có dữ liệu trong provincesData không
        if (typeof provincesData !== 'undefined' && provincesData[provinceId]) {
            const province = provincesData[provinceId];
            if (province.districts && province.districts[districtId]) {
                const district = province.districts[districtId];
                
                // Populate xã/phường
                if (district.wards && Array.isArray(district.wards) && district.wards.length > 0) {
                    wardSelect.disabled = false;
                    district.wards.forEach(wardName => {
                        if (wardName && wardName.trim()) {
                            const option = document.createElement('option');
                            option.value = wardName.toLowerCase().replace(/\s+/g, '-').replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a').replace(/[èéẹẻẽêềếệểễ]/g, 'e').replace(/[ìíịỉĩ]/g, 'i').replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o').replace(/[ùúụủũưừứựửữ]/g, 'u').replace(/[ỳýỵỷỹ]/g, 'y').replace(/đ/g, 'd');
                            option.textContent = wardName;
                            wardSelect.appendChild(option);
                        }
                    });
                }
            }
        }
    });
    
    // Khởi tạo trạng thái ban đầu
    districtSelect.disabled = true;
    wardSelect.disabled = true;
}

// Xử lý submit form đăng ký liên kết
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo dropdown địa chỉ
    initAddressDropdowns();
    
    const bankSyncForm = document.getElementById('bankSyncForm');
    if (!bankSyncForm) return;
    
    bankSyncForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        const provinceSelect = document.getElementById('syncProvince');
        const districtSelect = document.getElementById('syncDistrict');
        const wardSelect = document.getElementById('syncWard');
        
        const syncData = {
            fullName: formData.get('syncFullName').trim(),
            idNumber: formData.get('syncIdNumber').trim(),
            phone: formData.get('syncPhone').trim(),
            email: formData.get('syncEmail').trim(),
            province: provinceSelect ? provinceSelect.options[provinceSelect.selectedIndex].text : '',
            district: districtSelect ? districtSelect.options[districtSelect.selectedIndex].text : '',
            ward: wardSelect ? wardSelect.options[wardSelect.selectedIndex].text : '',
            bankName: formData.get('bankName'),
            bankBranch: formData.get('bankBranch').trim(),
            accountNumber: formData.get('accountNumber').trim(),
            accountHolderName: formData.get('accountHolderName').trim(),
            notes: formData.get('syncNotes').trim()
        };
        
        // Kiểm tra checkbox đồng ý
        if (!formData.get('syncAgreement')) {
            showNotification('Vui lòng đồng ý với các điều khoản và điều kiện!', 'error');
            return;
        }
        
        // Tạo mã đồng bộ
        const syncCode = generateSyncCode();
        
        // Lưu thông tin đăng ký kèm mã đồng bộ
        const newRegistration = saveBankSyncRegistration(syncData, syncCode);
        
        // Lấy tên ngân hàng để hiển thị
        const bankSelect = document.getElementById('bankName');
        const bankName = bankSelect ? bankSelect.options[bankSelect.selectedIndex].text : syncData.bankName;
        
        // Hiển thị modal với mã đồng bộ
        showSyncCodeModal(syncCode, bankName);
        
        showNotification('Đăng ký liên kết ngân hàng thành công!', 'success');
    });
});

