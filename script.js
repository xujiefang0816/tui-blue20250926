// 登录页面脚本
import { showNotification, validateForm, formatDate } from './utils.js';
import { 
    initMockData, 
    getUsers, 
    setUsers, 
    getCurrentUser, 
    setCurrentUser, 
    addOperationLog 
} from './mock_data.js';

// DOM元素
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const rememberCheckbox = document.getElementById('remember');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const changePasswordModal = document.getElementById('changePasswordModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const changePasswordForm = document.getElementById('changePasswordForm');

// 初始化
function init() {
    // 初始化模拟数据
    initMockData();
    
    // 检查是否有记住的用户名
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
        usernameInput.value = savedUsername;
        rememberCheckbox.checked = true;
    }
    
    // 添加事件监听
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    }
    
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', openChangePasswordModal);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeChangePasswordModal);
    }
    
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }
    
    // 点击模态框外部关闭模态框
    if (changePasswordModal) {
        changePasswordModal.addEventListener('click', (e) => {
            if (e.target === changePasswordModal) {
                closeChangePasswordModal();
            }
        });
    }
}

// 处理登录
function handleLogin(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const remember = rememberCheckbox.checked;
    
    // 表单验证
    const validation = validateForm(
        { username, password },
        {
            username: {
                required: true,
                message: '请输入用户名'
            },
            password: {
                required: true,
                message: '请输入密码'
            }
        }
    );
    
    if (!validation.isValid) {
        showNotification(Object.values(validation.errors)[0], 'error');
        return;
    }
    
    // 验证用户
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        showNotification('用户名或密码错误', 'error');
        return;
    }
    
    // 记住用户名
    if (remember) {
        localStorage.setItem('rememberedUsername', username);
    } else {
        localStorage.removeItem('rememberedUsername');
    }
    
    // 更新用户登录信息
    const updatedUsers = users.map(u => 
        u.id === user.id 
            ? { ...u, lastLogin: new Date().toISOString() }
            : u
    );
    setUsers(updatedUsers);
    
    // 设置当前用户
    setCurrentUser(user);
    
    // 添加操作日志
    addOperationLog(user.id, user.username, '用户登录', `用户${user.username}成功登录系统`);
    
    // 跳转到主页面
    window.location.href = 'main.html';
}

// 切换密码可见性
function togglePasswordVisibility() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // 切换图标
    const icon = togglePasswordBtn.querySelector('i');
    if (type === 'password') {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// 打开修改密码弹窗
function openChangePasswordModal() {
    changePasswordModal.classList.remove('hidden');
    // 清空表单
    changePasswordForm.reset();
}

// 关闭修改密码弹窗
function closeChangePasswordModal() {
    changePasswordModal.classList.add('hidden');
}

// 处理修改密码
function handleChangePassword(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 表单验证
    const validation = validateForm(
        { username, currentPassword, newPassword, confirmPassword },
        {
            username: {
                required: true,
                message: '请先输入用户名'
            },
            currentPassword: {
                required: true,
                message: '请输入当前密码'
            },
            newPassword: {
                required: true,
                minLength: 6,
                message: '新密码长度不能小于6个字符',
                validate: (value) => {
                    // 密码复杂度验证：包含大小写字母和数字
                    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
                    if (!passwordRegex.test(value)) {
                        return '密码必须包含大小写字母和数字';
                    }
                    return true;
                }
            },
            confirmPassword: {
                required: true,
                message: '请确认新密码',
                validate: (value) => {
                    if (value !== newPassword) {
                        return '两次输入的密码不一致';
                    }
                    return true;
                }
            }
        }
    );
    
    if (!validation.isValid) {
        showNotification(Object.values(validation.errors)[0], 'error');
        return;
    }
    
    // 验证用户和当前密码
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username === username && u.password === currentPassword);
    
    if (userIndex === -1) {
        showNotification('当前密码错误', 'error');
        return;
    }
    
    // 更新密码
    users[userIndex].password = newPassword;
    users[userIndex].needChangePassword = false;
    setUsers(users);
    
    // 添加操作日志
    addOperationLog(users[userIndex].id, users[userIndex].username, '修改密码', '用户成功修改密码');
    
    // 显示成功信息
    showNotification('密码修改成功，请重新登录', 'success');
    
    // 关闭弹窗并清空密码输入框
    closeChangePasswordModal();
    passwordInput.value = '';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);