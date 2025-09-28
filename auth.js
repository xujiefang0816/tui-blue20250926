// 认证相关功能
import { showSuccess, showError, validatePassword, saveToLocalStorage, loadFromLocalStorage, generateId, formatDateTime } from './utils.js';

// 初始化用户数据
function initUsers() {
    const users = loadFromLocalStorage('users', []);
    if (users.length === 0) {
        // 创建初始用户
        const initialUsers = [
            {
                id: generateId(),
                username: 'TYL2025',
                password: '941314aA',
                role: 'admin', // 总管理员
                needChangePassword: false
            },
            {
                id: generateId(),
                username: '8888',
                password: '8888',
                role: 'manager', // 普通管理员
                needChangePassword: true
            },
            {
                id: generateId(),
                username: '1001',
                password: '1001',
                role: 'user', // 普通账号
                needChangePassword: true
            }
        ];
        saveToLocalStorage('users', initialUsers);
        return initialUsers;
    }
    return users;
}

// 登录功能
export function login(username, password) {
    const users = initUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // 保存登录状态
        saveToLocalStorage('currentUser', {
            id: user.id,
            username: user.username,
            role: user.role
        });
        
        // 记录操作日志
        addLog('登录系统');
        
        return {
            success: true,
            user
        };
    } else {
        return {
            success: false,
            message: '账号或密码错误'
        };
    }
}

// 登出功能
export function logout() {
    // 记录操作日志
    addLog('退出登录');
    
    // 清除登录状态
    localStorage.removeItem('currentUser');
}

// 获取当前登录用户
export function getCurrentUser() {
    return loadFromLocalStorage('currentUser', null);
}

// 修改密码
export function changePassword(currentPassword, newPassword) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return { success: false, message: '用户未登录' };
    }
    
    const users = loadFromLocalStorage('users', []);
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) {
        return { success: false, message: '用户不存在' };
    }
    
    if (users[userIndex].password !== currentPassword) {
        return { success: false, message: '当前密码错误' };
    }
    
    // 验证新密码强度
    if (!validatePassword(newPassword)) {
        return { success: false, message: '新密码必须至少包含6个字符，并包含字母和数字' };
    }
    
    // 更新密码
    users[userIndex].password = newPassword;
    users[userIndex].needChangePassword = false;
    saveToLocalStorage('users', users);
    
    // 记录操作日志
    addLog('修改密码');
    
    return { success: true, message: '密码修改成功' };
}

// 检查用户权限
export function checkPermission(requiredRole) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return false;
    }
    
    // 总管理员拥有所有权限
    if (currentUser.role === 'admin') {
        return true;
    }
    
    // 普通管理员和普通账号的权限判断
    if (requiredRole === 'manager' && currentUser.role === 'manager') {
        return true;
    }
    
    if (requiredRole === 'user' && (currentUser.role === 'manager' || currentUser.role === 'user')) {
        return true;
    }
    
    return false;
}

// 获取用户角色名称
export function getRoleName(role) {
    const roleMap = {
        'admin': '总管理员',
        'manager': '普通管理员',
        'user': '普通账号'
    };
    return roleMap[role] || role;
}

// 添加操作日志
export function addLog(action) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return;
    }
    
    const logs = loadFromLocalStorage('logs', []);
    logs.unshift({
        id: generateId(),
        time: formatDateTime(new Date()),
        username: currentUser.username,
        action: action
    });
    
    // 限制日志数量，只保留最近1000条
    if (logs.length > 1000) {
        logs.splice(1000);
    }
    
    saveToLocalStorage('logs', logs);
}

// 获取操作日志
export function getLogs() {
    return loadFromLocalStorage('logs', []);
}

// 获取所有用户
export function getUsers() {
    return loadFromLocalStorage('users', []);
}

// 添加用户
export function addUser(username, password, role) {
    const users = loadFromLocalStorage('users', []);
    
    // 检查用户名是否已存在
    if (users.some(u => u.username === username)) {
        return { success: false, message: '用户名已存在' };
    }
    
    // 验证密码强度
    if (!validatePassword(password)) {
        return { success: false, message: '密码必须至少包含6个字符，并包含字母和数字' };
    }
    
    // 添加新用户
    const newUser = {
        id: generateId(),
        username: username,
        password: password,
        role: role,
        needChangePassword: true
    };
    users.push(newUser);
    saveToLocalStorage('users', users);
    
    // 记录操作日志
    addLog(`添加用户: ${username}`);
    
    return { success: true, message: '用户添加成功' };
}

// 删除用户
export function deleteUser(userId) {
    const users = loadFromLocalStorage('users', []);
    const currentUser = getCurrentUser();
    
    // 不能删除自己
    if (currentUser && currentUser.id === userId) {
        return { success: false, message: '不能删除当前登录用户' };
    }
    
    // 过滤掉要删除的用户
    const filteredUsers = users.filter(u => u.id !== userId);
    
    // 检查是否删除了用户
    if (filteredUsers.length === users.length) {
        return { success: false, message: '用户不存在' };
    }
    
    saveToLocalStorage('users', filteredUsers);
    
    // 记录操作日志
    addLog(`删除用户`);
    
    return { success: true, message: '用户删除成功' };
}

// 更新用户角色
export function updateUserRole(userId, newRole) {
    const users = loadFromLocalStorage('users', []);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return { success: false, message: '用户不存在' };
    }
    
    users[userIndex].role = newRole;
    saveToLocalStorage('users', users);
    
    // 记录操作日志
    addLog(`更新用户角色`);
    
    return { success: true, message: '用户角色更新成功' };
}