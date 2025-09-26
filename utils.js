// 工具函数库

// 显示通知
export function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationIcon = document.getElementById('notificationIcon');
    const notificationMessage = document.getElementById('notificationMessage');
    
    if (!notification || !notificationIcon || !notificationMessage) {
        // 如果没有通知元素，就使用alert
        alert(message);
        return;
    }
    
    // 设置消息内容
    notificationMessage.textContent = message;
    
    // 设置图标和样式
    notification.classList.remove('bg-green-100', 'bg-red-100', 'bg-yellow-100', 'bg-blue-100');
    notificationIcon.className = '';
    
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-100', 'text-green-800');
            notificationIcon.className = 'fa fa-check-circle text-green-500';
            break;
        case 'error':
            notification.classList.add('bg-red-100', 'text-red-800');
            notificationIcon.className = 'fa fa-exclamation-circle text-red-500';
            break;
        case 'warning':
            notification.classList.add('bg-yellow-100', 'text-yellow-800');
            notificationIcon.className = 'fa fa-exclamation-triangle text-yellow-500';
            break;
        case 'info':
        default:
            notification.classList.add('bg-blue-100', 'text-blue-800');
            notificationIcon.className = 'fa fa-info-circle text-blue-500';
            break;
    }
    
    // 显示通知
    notification.classList.remove('hidden', 'notification-hide');
    notification.classList.add('notification-show');
    
    // 3秒后隐藏
    setTimeout(() => {
        notification.classList.remove('notification-show');
        notification.classList.add('notification-hide');
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 300);
    }, 3000);
}

// 日期格式化
export function formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

// 生成唯一ID
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 验证表单
export function validateForm(formData, rules) {
    const errors = {};
    
    for (const field in rules) {
        const value = formData[field];
        const fieldRules = rules[field];
        
        // 必填验证
        if (fieldRules.required && (!value || value.trim() === '')) {
            errors[field] = fieldRules.message || `${field}不能为空`;
            continue;
        }
        
        // 最小长度验证
        if (fieldRules.minLength && value.length < fieldRules.minLength) {
            errors[field] = fieldRules.message || `${field}长度不能小于${fieldRules.minLength}个字符`;
            continue;
        }
        
        // 最大长度验证
        if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
            errors[field] = fieldRules.message || `${field}长度不能大于${fieldRules.maxLength}个字符`;
            continue;
        }
        
        // 正则表达式验证
        if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
            errors[field] = fieldRules.message || `${field}格式不正确`;
            continue;
        }
        
        // 自定义验证函数
        if (typeof fieldRules.validate === 'function') {
            const result = fieldRules.validate(value);
            if (result !== true) {
                errors[field] = result || `${field}验证失败`;
            }
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// 本地存储操作
export const storage = {
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('获取本地存储失败:', error);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('设置本地存储失败:', error);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('删除本地存储失败:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('清空本地存储失败:', error);
            return false;
        }
    }
};

// 防抖函数
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 深拷贝
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

// 数字格式化
export function formatNumber(num, decimals = 2) {
    if (typeof num !== 'number' || isNaN(num)) return '--';
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 过滤空值属性
export function filterEmpty(obj) {
    const filtered = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            if (value !== null && value !== undefined && value !== '') {
                filtered[key] = value;
            }
        }
    }
    return filtered;
}

// 休眠函数
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 随机颜色生成
export function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// 检查是否为空对象
export function isEmptyObject(obj) {
    return obj && typeof obj === 'object' && Object.keys(obj).length === 0;
}

// 从数组中根据ID查找对象
export function findById(array, id) {
    return array.find(item => item.id === id) || null;
}

// 从数组中根据ID删除对象
export function removeById(array, id) {
    const index = array.findIndex(item => item.id === id);
    if (index !== -1) {
        array.splice(index, 1);
        return true;
    }
    return false;
}

// 导出数据为Excel
export function exportToExcel(data, filename = 'data.xlsx') {
    try {
        // 这里使用简单的CSV导出
        const headers = Object.keys(data[0] || {});
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const cell = row[header];
                    // 处理包含逗号或换行的数据
                    if (typeof cell === 'string' && (cell.includes(',') || cell.includes('\n'))) {
                        return `"${cell.replace(/"/g, '""')}"`;
                    }
                    return cell || '';
                }).join(',')
            )
        ].join('\n');
        
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        return true;
    } catch (error) {
        console.error('导出Excel失败:', error);
        return false;
    }
}