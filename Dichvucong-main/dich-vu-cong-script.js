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

// Xử lý hiển thị/ẩn trường "Dịch vụ khác"
document.addEventListener('DOMContentLoaded', function() {
    const serviceTypeSelect = document.getElementById('serviceType');
    const otherServiceGroup = document.getElementById('otherServiceGroup');
    const otherServiceInput = document.getElementById('otherService');
    
    if (serviceTypeSelect && otherServiceGroup) {
        serviceTypeSelect.addEventListener('change', function() {
            if (this.value === 'khac') {
                otherServiceGroup.style.display = 'block';
                if (otherServiceInput) {
                    otherServiceInput.setAttribute('required', 'required');
                }
            } else {
                otherServiceGroup.style.display = 'none';
                if (otherServiceInput) {
                    otherServiceInput.removeAttribute('required');
                    otherServiceInput.value = '';
                }
            }
        });
    }
    
    // Xử lý submit form
    const form = document.getElementById('dichVuCongForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Lấy dữ liệu form
            const formData = new FormData(form);
            const data = {
                fullName: formData.get('fullName'),
                idNumber: formData.get('idNumber'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                address: formData.get('address'),
                serviceType: formData.get('serviceType'),
                otherService: formData.get('otherService'),
                purpose: formData.get('purpose'),
                notes: formData.get('notes'),
                agreeTerms: formData.get('agreeTerms'),
                createdAt: new Date().toISOString()
            };
            
            // Kiểm tra checkbox đồng ý
            if (!data.agreeTerms) {
                showNotification('Vui lòng đồng ý với điều khoản sử dụng!', 'error');
                return;
            }
            
            // Lưu vào localStorage
            const registrations = JSON.parse(localStorage.getItem('dichVuCongRegistrations') || '[]');
            const newRegistration = {
                id: Date.now().toString(),
                ...data
            };
            registrations.push(newRegistration);
            localStorage.setItem('dichVuCongRegistrations', JSON.stringify(registrations));
            
            // Hiển thị thông báo thành công
            showNotification('Đăng ký dịch vụ công trực tuyến thành công!', 'success');
            
            // Reset form sau 2 giây
            setTimeout(() => {
                form.reset();
                if (otherServiceGroup) {
                    otherServiceGroup.style.display = 'none';
                }
                // Cuộn lên đầu trang
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 2000);
        });
    }
});

