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

// Tạo mã đồng bộ ngẫu nhiên
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

// Populate tỉnh/thành phố
function populateProvinces() {
    const provinceSelect = document.getElementById('province');
    if (!provinceSelect) return;
    
    // Không cần populate vì đã có sẵn trong HTML
    // Chỉ populate nếu dropdown trống (chỉ có option mặc định)
    if (provinceSelect.options.length <= 1) {
        // Sử dụng dữ liệu từ script.js nếu có (để tương thích)
        if (typeof allProvinces !== 'undefined' && allProvinces && Array.isArray(allProvinces)) {
            allProvinces.forEach(province => {
                const option = document.createElement('option');
                option.value = province.toLowerCase().replace(/\s+/g, '-').replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a').replace(/[èéẹẻẽêềếệểễ]/g, 'e').replace(/[ìíịỉĩ]/g, 'i').replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o').replace(/[ùúụủũưừứựửữ]/g, 'u').replace(/[ỳýỵỷỹ]/g, 'y').replace(/đ/g, 'd');
                option.textContent = province;
                provinceSelect.appendChild(option);
            });
        } else {
            // Danh sách tỉnh/thành phố cơ bản (fallback)
            const provinces = [
                'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
                'An Giang', 'Bà Rịa - Vũng Tàu', 'Bạc Liêu', 'Bắc Giang', 'Bắc Kạn',
                'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
                'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
                'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
                'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
                'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
                'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
                'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
                'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
                'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
                'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
                'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
            ];
            
            provinces.forEach(province => {
                const option = document.createElement('option');
                option.value = province.toLowerCase().replace(/\s+/g, '-');
                option.textContent = province;
                provinceSelect.appendChild(option);
            });
        }
    }
}

// Xử lý load phường/xã theo tỉnh/thành phố
function initProvinceWard() {
    const provinceSelect = document.getElementById('province');
    const wardSelect = document.getElementById('ward');
    
    if (!provinceSelect || !wardSelect) return;
    
    // Xử lý khi chọn tỉnh/thành phố
    provinceSelect.addEventListener('change', function() {
        const provinceId = this.value;
        const provinceName = this.options[this.selectedIndex].text;
        
        // Reset phường/xã
        wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
        
        if (!provinceId) {
            wardSelect.disabled = true;
            return;
        }
        
        wardSelect.disabled = false;
        
        // Kiểm tra xem có dữ liệu trong provincesData không
        if (typeof provincesData !== 'undefined' && provincesData[provinceId]) {
            const province = provincesData[provinceId];
            
            // Lấy tất cả phường/xã từ tất cả quận/huyện trong tỉnh
            const allWards = [];
            if (province.districts) {
                Object.keys(province.districts).forEach(districtId => {
                    const district = province.districts[districtId];
                    if (district && district.wards && Array.isArray(district.wards)) {
                        district.wards.forEach(wardName => {
                            if (wardName && !allWards.includes(wardName)) {
                                allWards.push(wardName);
                            }
                        });
                    }
                });
            }
            
            // Sắp xếp danh sách phường/xã
            allWards.sort();
            
            // Populate phường/xã
            if (allWards.length > 0) {
                allWards.forEach(wardName => {
                    const option = document.createElement('option');
                    option.value = wardName.toLowerCase().replace(/\s+/g, '-').replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a').replace(/[èéẹẻẽêềếệểễ]/g, 'e').replace(/[ìíịỉĩ]/g, 'i').replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o').replace(/[ùúụủũưừứựửữ]/g, 'u').replace(/[ỳýỵỷỹ]/g, 'y').replace(/đ/g, 'd');
                    option.textContent = wardName;
                    wardSelect.appendChild(option);
                });
            } else {
                // Nếu không có dữ liệu phường/xã, thêm option thông báo
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Vui lòng chọn tỉnh/thành phố khác';
                option.disabled = true;
                wardSelect.appendChild(option);
            }
        } else {
            // Nếu không có dữ liệu chi tiết trong provincesData
            // Thử sử dụng hàm generateGenericDistricts nếu có
            if (typeof generateGenericDistricts !== 'undefined') {
                try {
                    const genericData = generateGenericDistricts(provinceName);
                    if (genericData && genericData.districts) {
                        const allWards = [];
                        Object.keys(genericData.districts).forEach(districtId => {
                            const district = genericData.districts[districtId];
                            if (district && district.wards && Array.isArray(district.wards)) {
                                district.wards.forEach(wardName => {
                                    if (wardName && !allWards.includes(wardName)) {
                                        allWards.push(wardName);
                                    }
                                });
                            }
                        });
                        
                        // Sắp xếp danh sách phường/xã
                        allWards.sort();
                        
                        // Populate phường/xã
                        if (allWards.length > 0) {
                            allWards.forEach(wardName => {
                                const option = document.createElement('option');
                                option.value = wardName.toLowerCase().replace(/\s+/g, '-').replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a').replace(/[èéẹẻẽêềếệểễ]/g, 'e').replace(/[ìíịỉĩ]/g, 'i').replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o').replace(/[ùúụủũưừứựửữ]/g, 'u').replace(/[ỳýỵỷỹ]/g, 'y').replace(/đ/g, 'd');
                                option.textContent = wardName;
                                wardSelect.appendChild(option);
                            });
                        } else {
                            // Nếu không có dữ liệu, vẫn enable dropdown
                            const option = document.createElement('option');
                            option.value = '';
                            option.textContent = 'Vui lòng nhập thủ công hoặc chọn tỉnh khác';
                            option.disabled = true;
                            wardSelect.appendChild(option);
                        }
                    } else {
                        // Nếu không có dữ liệu, vẫn enable dropdown
                        const option = document.createElement('option');
                        option.value = '';
                        option.textContent = 'Vui lòng nhập thủ công hoặc chọn tỉnh khác';
                        option.disabled = true;
                        wardSelect.appendChild(option);
                    }
                } catch (error) {
                    console.error('Lỗi khi tạo dữ liệu xã/phường:', error);
                    // Nếu có lỗi, vẫn enable dropdown
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'Vui lòng nhập thủ công hoặc chọn tỉnh khác';
                    option.disabled = true;
                    wardSelect.appendChild(option);
                }
            } else {
                // Nếu không có hàm generateGenericDistricts, vẫn enable dropdown
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Vui lòng nhập thủ công hoặc chọn tỉnh khác';
                option.disabled = true;
                wardSelect.appendChild(option);
            }
        }
    });
    
    // Khởi tạo trạng thái ban đầu
    wardSelect.disabled = true;
}

// Xử lý hiển thị/ẩn trường "Nơi cấp khác"
function initIdIssuePlaceOther() {
    const idIssuePlaceSelect = document.getElementById('idIssuePlace');
    const idIssuePlaceOtherGroup = document.getElementById('idIssuePlaceOtherGroup');
    const idIssuePlaceOtherInput = document.getElementById('idIssuePlaceOther');
    
    if (idIssuePlaceSelect && idIssuePlaceOtherGroup) {
        idIssuePlaceSelect.addEventListener('change', function() {
            if (this.value === 'khac') {
                idIssuePlaceOtherGroup.style.display = 'block';
                if (idIssuePlaceOtherInput) {
                    idIssuePlaceOtherInput.setAttribute('required', 'required');
                }
            } else {
                idIssuePlaceOtherGroup.style.display = 'none';
                if (idIssuePlaceOtherInput) {
                    idIssuePlaceOtherInput.removeAttribute('required');
                    idIssuePlaceOtherInput.value = '';
                }
            }
        });
    }
}

// Xử lý form
document.addEventListener('DOMContentLoaded', function() {
    // Populate tỉnh/thành phố
    populateProvinces();
    
    // Khởi tạo xử lý phường/xã theo tỉnh/thành phố
    initProvinceWard();
    
    // Khởi tạo xử lý nơi cấp khác
    initIdIssuePlaceOther();
    
    // Xử lý submit form
    const form = document.getElementById('nhaDatForm');
    const syncCodeSection = document.getElementById('syncCodeSection');
    const syncCodeInput = document.getElementById('syncCode');
    let generatedSyncCode = null;
    let isFirstSubmit = true;
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Kiểm tra cam kết
            const commitment = form.querySelector('#commitment');
            if (!commitment || !commitment.checked) {
                showNotification('Vui lòng cam kết chịu trách nhiệm trước pháp luật!', 'error');
                return;
            }
            
            // Lần đầu nhấn nút: Hiển thị trường mã đồng bộ và modal
            if (isFirstSubmit) {
                // Tạo mã đồng bộ
                generatedSyncCode = generateSyncCode();
                
                // Lấy tên ngân hàng
                const bankNameSelect = form.querySelector('#bankName');
                const bankName = bankNameSelect ? bankNameSelect.options[bankNameSelect.selectedIndex].text : 'đã đăng ký';
                
                // Hiển thị trường mã đồng bộ ngay lập tức (ưu tiên cao nhất)
                if (syncCodeSection) {
                    // Đảm bảo section hiển thị ngay lập tức
                    syncCodeSection.style.display = 'block';
                    syncCodeSection.style.visibility = 'visible';
                    syncCodeSection.style.opacity = '1';
                    syncCodeSection.style.position = 'relative';
                    syncCodeSection.style.zIndex = '1000';
                    
                    // Thêm animation nhẹ để thu hút sự chú ý
                    syncCodeSection.style.animation = 'fadeInUp 0.3s ease-out';
                }
                
                // Đảm bảo input mã đồng bộ có required và sẵn sàng
                if (syncCodeInput) {
                    syncCodeInput.setAttribute('required', 'required');
                    syncCodeInput.value = ''; // Đảm bảo input trống
                }
                
                // Hiển thị modal thông báo ngay lập tức
                showSyncCodeModal(generatedSyncCode, bankName);
                
                // Cuộn đến trường mã đồng bộ ngay sau khi hiển thị
                // Sử dụng requestAnimationFrame để đảm bảo DOM đã render
                requestAnimationFrame(() => {
                    if (syncCodeSection) {
                        syncCodeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
                
                // Đánh dấu đã nhấn lần đầu
                isFirstSubmit = false;
                
                // Focus vào trường nhập mã đồng bộ sau khi modal đóng hoặc sau một khoảng thời gian
                // Đợi một chút để đảm bảo modal đã hiển thị
                setTimeout(() => {
                    if (syncCodeInput) {
                        syncCodeInput.focus();
                        // Highlight input để thu hút sự chú ý
                        syncCodeInput.style.boxShadow = '0 0 10px rgba(255, 193, 7, 0.5)';
                        setTimeout(() => {
                            syncCodeInput.style.boxShadow = '';
                        }, 2000);
                    }
                }, 500);
                
                return;
            }
            
            // Lần thứ hai: Kiểm tra mã đồng bộ đã nhập chưa
            const enteredSyncCode = syncCodeInput ? syncCodeInput.value.trim() : '';
            if (!enteredSyncCode) {
                showNotification('Vui lòng nhập mã đồng bộ từ ứng dụng ngân hàng!', 'error');
                if (syncCodeInput) {
                    syncCodeInput.focus();
                }
                return;
            }
            
            // Kiểm tra mã đồng bộ có hợp lệ không (6-10 ký tự chữ và số)
            if (!/^[A-Z0-9]{6,10}$/i.test(enteredSyncCode)) {
                showNotification('Mã đồng bộ không hợp lệ! Vui lòng nhập mã từ 6-10 ký tự (chữ và số).', 'error');
                if (syncCodeInput) {
                    syncCodeInput.focus();
                }
                return;
            }
            
            // Lấy dữ liệu form
            const formData = new FormData(form);
            const data = {
                // Thông tin chung
                receivingUnit: formData.get('receivingUnit'),
                supportUnit: formData.get('supportUnit'),
                field: formData.get('field'),
                procedure: formData.get('procedure'),
                publicService: formData.get('publicService'),
                
                // Thông tin người nộp hồ sơ
                applicantName: formData.get('applicantName'),
                dateOfBirth: formData.get('dateOfBirth'),
                idNumber: formData.get('idNumber'),
                idIssueDate: formData.get('idIssueDate'),
                idIssuePlace: formData.get('idIssuePlace'),
                idIssuePlaceOther: formData.get('idIssuePlaceOther'),
                phone: formData.get('phone'),
                province: formData.get('province'),
                detailAddress: formData.get('detailAddress'),
                authorizedPerson: formData.get('authorizedPerson'),
                
                // Thông tin người sử dụng đất
                landUserName: formData.get('landUserName'),
                landUserAddress: formData.get('landUserAddress'),
                landUserPhone: formData.get('landUserPhone'),
                
                // Thông tin ngân hàng
                bankName: formData.get('bankName'),
                accountNumber: formData.get('accountNumber'),
                accountHolder: formData.get('accountHolder'),
                
                // Mã đồng bộ (ưu tiên mã người dùng nhập, nếu không có thì dùng mã đã tạo)
                syncCode: enteredSyncCode || generatedSyncCode || formData.get('syncCode') || '',
                
                commitment: formData.get('commitment'),
                createdAt: new Date().toISOString()
            };
            
            // Lưu vào localStorage
            try {
            const registrations = JSON.parse(localStorage.getItem('nhaDatRegistrations') || '[]');
            const newRegistration = {
                id: Date.now().toString(),
                ...data
            };
            registrations.push(newRegistration);
            localStorage.setItem('nhaDatRegistrations', JSON.stringify(registrations));
            } catch (error) {
                console.error('❌ Lỗi khi lưu vào localStorage:', error);
                // Vẫn tiếp tục xử lý dù không lưu được vào localStorage
                showNotification('Lưu dữ liệu vào bộ nhớ cục bộ thất bại, nhưng hồ sơ đã được gửi thành công.', 'warning');
            }
            
            // Hiển thị thông báo thành công
            showNotification('Nộp hồ sơ thành công! Mã đồng bộ: ' + data.syncCode, 'success');
            
            // Đóng modal nếu đang mở
            const existingModal = document.querySelector('.sync-code-modal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // Reset form sau 2 giây
            setTimeout(() => {
                form.reset();
                // Reset và ẩn trường mã đồng bộ (xóa tất cả style inline)
                if (syncCodeSection) {
                    syncCodeSection.style.display = 'none';
                    syncCodeSection.style.visibility = 'hidden';
                    syncCodeSection.style.opacity = '0';
                    syncCodeSection.style.position = '';
                    syncCodeSection.style.zIndex = '';
                    syncCodeSection.style.animation = '';
                }
                // Reset giá trị input mã đồng bộ và xóa style
                if (syncCodeInput) {
                    syncCodeInput.value = '';
                    syncCodeInput.removeAttribute('required');
                    syncCodeInput.style.boxShadow = '';
                }
                // Reset trạng thái
                isFirstSubmit = true;
                generatedSyncCode = null;
                // Cuộn lên đầu trang
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 2000);
        });
    }
});
