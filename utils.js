// 工具函数集合

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @param {string} format - 格式化字符串
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, format = 'yyyy-MM-dd') {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('yyyy', year)
        .replace('MM', month)
        .replace('dd', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * 格式化金额
 * @param {number} amount - 金额
 * @returns {string} 格式化后的金额字符串
 */
function formatAmount(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '0.00';
    return Number(amount).toFixed(2);
}

/**
 * 显示提示消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 ('success', 'error', 'warning', 'info')
 * @param {number} duration - 显示时长(毫秒)
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast-message');
    const toastText = document.getElementById('toast-text');
    const toastIcon = document.getElementById('toast-icon');
    
    toastText.textContent = message;
    
    // 设置图标和颜色
    toast.classList.remove('border-primary', 'border-success', 'border-danger', 'border-warning');
    toastIcon.className = '';
    
    switch (type) {
        case 'success':
            toast.classList.add('border-success');
            toastIcon.className = 'fa fa-check-circle text-success mr-2';
            break;
        case 'error':
            toast.classList.add('border-danger');
            toastIcon.className = 'fa fa-exclamation-circle text-danger mr-2';
            break;
        case 'warning':
            toast.classList.add('border-warning');
            toastIcon.className = 'fa fa-exclamation-triangle text-warning mr-2';
            break;
        default:
            toast.classList.add('border-primary');
            toastIcon.className = 'fa fa-info-circle text-primary mr-2';
    }
    
    // 显示提示
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    
    // 自动隐藏
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0');
    }, duration);
}

/**
 * 显示确认对话框
 * @param {string} message - 确认消息
 * @param {Function} confirmCallback - 确认回调
 * @param {Function} cancelCallback - 取消回调
 */
function showConfirm(message, confirmCallback, cancelCallback) {
    if (window.confirm(message)) {
        if (typeof confirmCallback === 'function') {
            confirmCallback();
        }
    } else if (typeof cancelCallback === 'function') {
        cancelCallback();
    }
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {object} 验证结果 { valid: boolean, message: string }
 */
function validatePassword(password) {
    if (!password) {
        return { valid: false, message: '密码不能为空' };
    }
    
    if (password.length < 6) {
        return { valid: false, message: '密码长度不能少于6位' };
    }
    
    // 检查是否包含大小写字母和数字
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        return { valid: false, message: '密码必须包含大小写字母和数字' };
    }
    
    return { valid: true, message: '密码强度符合要求' };
}

/**
 * 导出表格为Excel
 * @param {HTMLElement} tableElement - 表格元素
 * @param {string} filename - 文件名
 */
function exportToExcel(tableElement, filename = 'export.xlsx') {
    try {
        // 创建工作簿
        const wb = XLSX.utils.book_new();
        
        // 将表格转换为工作表
        const ws = XLSX.utils.table_to_sheet(tableElement);
        
        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        
        // 导出文件
        XLSX.writeFile(wb, filename);
        
        return true;
    } catch (error) {
        console.error('导出Excel失败:', error);
        return false;
    }
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间(毫秒)
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
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

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 时间限制(毫秒)
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 获取URL参数
 * @param {string} name - 参数名
 * @returns {string|null} 参数值
 */
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * 本地存储操作
 */
const storage = {
    // 设置存储
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('设置localStorage失败:', error);
            return false;
        }
    },
    
    // 获取存储
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('获取localStorage失败:', error);
            return defaultValue;
        }
    },
    
    // 删除存储
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('删除localStorage失败:', error);
            return false;
        }
    },
    
    // 清空所有存储
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('清空localStorage失败:', error);
            return false;
        }
    }
};

/**
 * 深度克隆对象
 * @param {any} obj - 要克隆的对象
 * @returns {any} 克隆后的对象
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    
    const clonedObj = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }
    
    return clonedObj;
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 判断对象是否为空
 * @param {object} obj - 要判断的对象
 * @returns {boolean} 是否为空
 */
function isEmpty(obj) {
    return obj === null || obj === undefined || 
           (typeof obj === 'object' && Object.keys(obj).length === 0) ||
           (typeof obj === 'string' && obj.trim().length === 0);
}

/**
 * 合并两个对象
 * @param {object} target - 目标对象
 * @param {object} source - 源对象
 * @returns {object} 合并后的对象
 */
function mergeObjects(target, source) {
    const result = { ...target };
    
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && 
                typeof result[key] === 'object' && result[key] !== null) {
                result[key] = mergeObjects(result[key], source[key]);
            } else {
                result[key] = source[key];
            }
        }
    }
    
    return result;
}

/**
 * 过滤数组
 * @param {Array} array - 要过滤的数组
 * @param {Function} predicate - 过滤条件
 * @returns {Array} 过滤后的数组
 */
function filterArray(array, predicate) {
    if (!Array.isArray(array)) return [];
    return array.filter(predicate);
}

/**
 * 排序数组
 * @param {Array} array - 要排序的数组
 * @param {string} key - 排序键
 * @param {boolean} ascending - 是否升序
 * @returns {Array} 排序后的数组
 */
function sortArray(array, key, ascending = true) {
    if (!Array.isArray(array)) return [];
    
    return [...array].sort((a, b) => {
        const valueA = a[key] || '';
        const valueB = b[key] || '';
        
        if (typeof valueA === 'string' && typeof valueB === 'string') {
            return ascending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        } else if (typeof valueA === 'number' && typeof valueB === 'number') {
            return ascending ? valueA - valueB : valueB - valueA;
        }
        
        return 0;
    });
}

/**
 * 格式化数量
 * @param {number} quantity - 数量
 * @returns {string} 格式化后的数量字符串
 */
function formatQuantity(quantity) {
    if (quantity === null || quantity === undefined || quantity === 0 || isNaN(quantity)) {
        return '/';
    }
    return Number(quantity).toString();
}