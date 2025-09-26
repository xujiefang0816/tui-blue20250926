// 认证相关功能

// 登录功能
function login(username, password) {
    const account = db.getAccount(username);
    if (account && account.password === password) {
        db.setCurrentUser(account);
        // 保存登录状态到本地存储
        localStorage.setItem('currentUser', JSON.stringify({
            username: account.username,
            role: account.role
        }));
        return { success: true, account };
    } else {
        return { success: false, message: '用户名或密码错误' };
    }
}

// 登出功能
function logout() {
    db.setCurrentUser(null);
    localStorage.removeItem('currentUser');
    showLoginPage();
}

// 检查登录状态
function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        const account = db.getAccount(user.username);
        if (account) {
            db.setCurrentUser(account);
            return true;
        }
    }
    return false;
}

// 获取用户权限
function getUserRole() {
    const user = db.getCurrentUser();
    return user ? user.role : null;
}

// 检查是否有权限访问页面
function hasPermission(page) {
    const role = getUserRole();
    if (!role) return false;
    
    switch (page) {
        case 'register':
            return true; // 所有用户都可以访问文件登记
        case 'info':
            return true; // 所有用户都可以访问文件信息
        case 'process':
            return role === 'superadmin' || role === 'admin'; // 总管理员和普通管理员可以访问文件处理
        case 'setting':
            return role === 'superadmin'; // 只有总管理员可以访问系统设置
        default:
            return false;
    }
}

// 显示登录页面
function showLoginPage() {
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('main-container').style.display = 'none';
    
    // 清空表单
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// 显示主页面
function showMainPage() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('main-container').style.display = 'flex';
    
    // 显示当前用户信息
    const user = db.getCurrentUser();
    document.getElementById('current-user').textContent = `用户: ${user.username} (${getRoleName(user.role)})`;
    
    // 根据权限显示导航按钮
    updateNavigationButtons();
    
    // 默认显示文件登记页面
    showPage('register');
    
    // 如果需要修改密码，强制显示修改密码弹窗
    if (user.needChangePassword) {
        showChangePasswordModal(true);
    }
}

// 获取角色名称
function getRoleName(role) {
    switch (role) {
        case 'superadmin':
            return '总管理员';
        case 'admin':
            return '普通管理员';
        case 'normal':
            return '普通账号';
        default:
            return '未知角色';
    }
}

// 更新导航按钮
function updateNavigationButtons() {
    const navButtons = {
        'nav-register': hasPermission('register'),
        'nav-info': hasPermission('info'),
        'nav-process': hasPermission('process'),
        'nav-setting': hasPermission('setting')
    };
    
    Object.keys(navButtons).forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            if (navButtons[id]) {
                button.classList.remove('hidden');
            } else {
                button.classList.add('hidden');
            }
        }
    });
}

// 显示指定页面
function showPage(pageId) {
    // 隐藏所有页面
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.display = 'none';
    });
    
    // 显示指定页面
    const pageMap = {
        'register': 'file-register-page',
        'info': 'file-info-page',
        'process': 'file-process-page',
        'setting': 'system-setting-page'
    };
    
    const page = document.getElementById(pageMap[pageId]);
    if (page && hasPermission(pageId)) {
        page.style.display = 'block';
        
        // 更新导航按钮状态
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        const navButton = document.getElementById(`nav-${pageId}`);
        if (navButton) {
            navButton.classList.add('active');
        }
        
        // 加载页面数据
        loadPageData(pageId);
    }
}

// 加载页面数据
function loadPageData(pageId) {
    switch (pageId) {
        case 'info':
            loadFileInfo();
            break;
        case 'process':
            loadFileProcess();
            break;
        case 'setting':
            loadSystemSettings();
            break;
    }
}

// 显示修改密码弹窗
function showChangePasswordModal(force = false) {
    const modal = document.getElementById('change-password-modal');
    modal.style.display = 'flex';
    
    // 如果是强制修改密码，隐藏关闭按钮
    const closeButton = modal.querySelector('.close');
    if (force) {
        closeButton.style.display = 'none';
    } else {
        closeButton.style.display = 'block';
    }
    
    // 清空表单
    document.getElementById('change-password-form').reset();
}

// 关闭修改密码弹窗
function closeChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    modal.style.display = 'none';
}

// 初始化认证事件监听
function initAuthEvents() {
    // 登录按钮事件
    document.getElementById('login-btn').addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const result = login(username, password);
        if (result.success) {
            showMainPage();
        } else {
            alert(result.message);
        }
    });
    
    // 登出按钮事件
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // 修改密码按钮事件
    document.getElementById('change-password-btn').addEventListener('click', () => {
        showChangePasswordModal();
    });
    
    // 关闭修改密码弹窗
    document.getElementById('change-password-modal').querySelector('.close').addEventListener('click', closeChangePasswordModal);
    
    // 修改密码表单提交
    document.getElementById('change-password-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // 验证密码
        if (newPassword !== confirmPassword) {
            alert('两次输入的新密码不一致');
            return;
        }
        
        const user = db.getCurrentUser();
        if (db.changePassword(user.username, currentPassword, newPassword)) {
            alert('密码修改成功');
            closeChangePasswordModal();
        } else {
            alert('当前密码错误');
        }
    });
    
    // 导航按钮事件
    document.getElementById('nav-register').addEventListener('click', () => showPage('register'));
    document.getElementById('nav-info').addEventListener('click', () => showPage('info'));
    document.getElementById('nav-process').addEventListener('click', () => showPage('process'));
    document.getElementById('nav-setting').addEventListener('click', () => showPage('setting'));
    
    // 按Enter键登录
    document.getElementById('password').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('login-btn').click();
        }
    });
}

// 初始化认证系统
function initAuth() {
    initAuthEvents();
    
    // 检查登录状态
    if (checkLoginStatus()) {
        showMainPage();
    } else {
        showLoginPage();
    }
}

// 导出函数供其他文件使用
window.auth = {
    login,
    logout,
    checkLoginStatus,
    getUserRole,
    hasPermission,
    showPage,
    initAuth
};