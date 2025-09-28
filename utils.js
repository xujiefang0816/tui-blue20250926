// 工具函数

// 显示成功提示
export function showSuccess(message) {
    const successToast = document.getElementById('success-toast');
    const successMessage = document.getElementById('success-message');
    successMessage.textContent = message;
    successToast.classList.remove('translate-x-full');
    
    setTimeout(() => {
        successToast.classList.add('translate-x-full');
    }, 3000);
}

// 显示错误提示
export function showError(message) {
    const errorToast = document.getElementById('error-toast');
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorToast.classList.remove('translate-x-full');
    
    setTimeout(() => {
        errorToast.classList.add('translate-x-full');
    }, 3000);
}

// 显示确认弹窗
export function showConfirm(message, confirmCallback) {
    const confirmModal = document.getElementById('confirm-modal');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmActionBtn = document.getElementById('confirm-action-btn');
    const cancelConfirmBtn = document.getElementById('cancel-confirm-btn');
    
    confirmMessage.textContent = message;
    confirmModal.classList.remove('hidden');
    
    const handleConfirm = () => {
        confirmCallback();
        confirmModal.classList.add('hidden');
        confirmActionBtn.removeEventListener('click', handleConfirm);
        cancelConfirmBtn.removeEventListener('click', handleCancel);
    };
    
    const handleCancel = () => {
        confirmModal.classList.add('hidden');
        confirmActionBtn.removeEventListener('click', handleConfirm);
        cancelConfirmBtn.removeEventListener('click', handleCancel);
    };
    
    confirmActionBtn.addEventListener('click', handleConfirm);
    cancelConfirmBtn.addEventListener('click', handleCancel);
}

// 格式化日期
export function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 格式化日期时间
export function formatDateTime(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 获取今天的日期
export function getToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 验证密码强度
export function validatePassword(password) {
    // 至少包含6个字符，包含字母和数字
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return regex.test(password);
}

// 存储数据到localStorage
export function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('保存数据失败:', error);
        return false;
    }
}

// 从localStorage读取数据
export function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('读取数据失败:', error);
        return defaultValue;
    }
}

// 生成唯一ID
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 导出Excel功能
export function exportToExcel(data, filename = '文件信息') {
    // 创建表格
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // 导出文件
    XLSX.writeFile(workbook, `${filename}.xlsx`);
}