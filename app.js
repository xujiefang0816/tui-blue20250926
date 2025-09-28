// 主应用逻辑
import { showSuccess, showError, showConfirm, loadFromLocalStorage } from './utils.js';
import { login, logout, getCurrentUser, checkUserLoginStatus } from './auth.js';
import { initFileRegisterPage } from './file-register.js';
import { initFileInfoPage } from './file-info.js';
import { initFileProcessPage } from './file-process.js';
import { initSystemSettingsPage, handleChangePasswordSubmit } from './system-settings.js';

// 页面元素
const loginPage = document.getElementById('login-page');
const mainApp = document.getElementById('main-app');
const fileRegisterPage = document.getElementById('file-register-page');
const fileInfoPage = document.getElementById('file-info-page');
const fileProcessPage = document.getElementById('file-process-page');
const systemSettingsPage = document.getElementById('system-settings-page');
const changePasswordModal = document.getElementById('change-password-modal');
const userInfo = document.getElementById('user-info');

// 导航按钮
const fileRegisterBtn = document.getElementById('file-register-btn');
const fileInfoBtn = document.getElementById('file-info-btn');
const fileProcessBtn = document.getElementById('file-process-btn');
const systemSettingsBtn = document.getElementById('system-settings-btn');
const logoutBtn = document.getElementById('logout-btn');
const changePasswordLink = document.getElementById('change-password-link');
const closeChangePasswordModal = document.getElementById('close-change-password-modal');
const loginForm = document.getElementById('login-form');
const loginChangePasswordBtn = document.getElementById('login-change-password-btn');

// 初始化应用
export function initApp() {
    // 检查用户登录状态
    const isLoggedIn = checkUserLoginStatus();
    
    if (isLoggedIn) {
        showMainApp();
    } else {
        showLoginPage();
    }
    
    // 绑定登录表单事件
    loginForm.addEventListener('submit', handleLogin);
    
    // 绑定导航按钮事件
    fileRegisterBtn.addEventListener('click', () => navigateTo('file-register'));
    fileInfoBtn.addEventListener('click', () => navigateTo('file-info'));
    fileProcessBtn.addEventListener('click', () => navigateTo('file-process'));
    systemSettingsBtn.addEventListener('click', () => navigateTo('system-settings'));
    
    // 绑定退出登录按钮事件
    logoutBtn.addEventListener('click', handleLogout);
    
    // 绑定修改密码相关事件
    changePasswordLink.addEventListener('click', showChangePasswordModal);
    closeChangePasswordModal.addEventListener('click', hideChangePasswordModal);
    loginChangePasswordBtn.addEventListener('click', showChangePasswordModal);
    
    // 处理修改密码表单提交
    handleChangePasswordSubmit();
}

// 显示登录页面
function showLoginPage() {
    loginPage.classList.remove('hidden');
    mainApp.classList.add('hidden');
}

// 显示主应用
function showMainApp() {
    loginPage.classList.add('hidden');
    mainApp.classList.remove('hidden');
    
    // 显示当前用户信息
    updateUserInfo();
    
    // 根据用户权限显示导航按钮
    updateNavigationButtons();
    
    // 默认显示文件登记页面
    navigateTo('file-register');
}

// 更新用户信息
function updateUserInfo() {
    const user = getCurrentUser();
    if (user) {
        let roleText = '';
        switch (user.role) {
            case 'admin': roleText = '总管理员'; break;
            case 'manager': roleText = '普通管理员'; break;
            case 'user': roleText = '普通账号'; break;
        }
        userInfo.textContent = `${user.username} (${roleText})`;
    }
}

// 更新导航按钮
function updateNavigationButtons() {
    const user = getCurrentUser();
    
    if (!user) return;
    
    // 重置所有按钮显示
    fileRegisterBtn.classList.remove('hidden');
    fileInfoBtn.classList.remove('hidden');
    fileProcessBtn.classList.add('hidden');
    systemSettingsBtn.classList.add('hidden');
    
    // 根据用户角色显示相应的按钮
    if (user.role === 'admin') {
        // 总管理员可以看到所有页面
        fileProcessBtn.classList.remove('hidden');
        systemSettingsBtn.classList.remove('hidden');
    } else if (user.role === 'manager') {
        // 普通管理员可以看到前三个页面
        fileProcessBtn.classList.remove('hidden');
    }
    // 普通账号只能看到前两个页面，不需要额外设置
}

// 导航到指定页面
function navigateTo(pageId) {
    const user = getCurrentUser();
    
    // 检查页面权限
    if (!hasPagePermission(pageId)) {
        showError('您没有权限访问该页面');
        return;
    }
    
    // 隐藏所有页面
    fileRegisterPage.classList.add('hidden');
    fileInfoPage.classList.add('hidden');
    fileProcessPage.classList.add('hidden');
    systemSettingsPage.classList.add('hidden');
    
    // 高亮当前导航按钮
    fileRegisterBtn.classList.remove('active');
    fileInfoBtn.classList.remove('active');
    fileProcessBtn.classList.remove('active');
    systemSettingsBtn.classList.remove('active');
    
    // 显示指定页面并高亮对应的导航按钮
    switch (pageId) {
        case 'file-register':
            fileRegisterPage.classList.remove('hidden');
            fileRegisterBtn.classList.add('active');
            initFileRegisterPage();
            break;
        case 'file-info':
            fileInfoPage.classList.remove('hidden');
            fileInfoBtn.classList.add('active');
            initFileInfoPage();
            break;
        case 'file-process':
            fileProcessPage.classList.remove('hidden');
            fileProcessBtn.classList.add('active');
            initFileProcessPage();
            break;
        case 'system-settings':
            systemSettingsPage.classList.remove('hidden');
            systemSettingsBtn.classList.add('active');
            initSystemSettingsPage();
            break;
    }
}

// 检查页面权限
function hasPagePermission(pageId) {
    const user = getCurrentUser();
    
    if (!user) return false;
    
    // 所有登录用户都可以访问文件登记和文件信息页面
    if (pageId === 'file-register' || pageId === 'file-info') {
        return true;
    }
    
    // 文件处理页面需要普通管理员或总管理员权限
    if (pageId === 'file-process' && (user.role === 'manager' || user.role === 'admin')) {
        return true;
    }
    
    // 系统设置页面只允许总管理员访问
    if (pageId === 'system-settings' && user.role === 'admin') {
        return true;
    }
    
    return false;
}

// 处理登录
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const success = login(username, password);
    
    if (success) {
        // 检查用户是否需要修改密码
        const user = getCurrentUser();
        if (user && user.needsPasswordChange) {
            showChangePasswordModal();
        } else {
            showMainApp();
        }
    } else {
        showError('用户名或密码错误');
    }
}

// 处理退出登录
function handleLogout() {
    logout();
    showLoginPage();
    showSuccess('已成功退出登录');
}

// 显示修改密码弹窗
function showChangePasswordModal() {
    changePasswordModal.classList.remove('hidden');
}

// 隐藏修改密码弹窗
function hideChangePasswordModal() {
    changePasswordModal.classList.add('hidden');
}

// 监听页面加载完成事件
document.addEventListener('DOMContentLoaded', initApp);