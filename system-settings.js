// 系统设置相关功能
import { showSuccess, showError, loadFromLocalStorage, saveToLocalStorage, addLog } from './utils.js';
import { getCurrentUser, updateUser, addUser, deleteUser } from './auth.js';

// 初始化系统设置页面
export function initSystemSettingsPage() {
    // 初始化所有设置项
    initFileTypesSettings();
    initDepartmentsSettings();
    initUnitsSettings();
    initStatusesSettings();
    initPaymentUnitsSettings();
    initPaymentCategoriesSettings();
    initAccountManagement();
    initOperationLogs();
    
    // 记录访问日志
    addLog('访问系统设置页面');
}

// 初始化文件类型设置
function initFileTypesSettings() {
    // 加载并显示文件类型
    loadAndDisplaySettings('fileTypes', 'file-types-list', 'file-type-input');
    
    // 添加文件类型按钮事件
    document.getElementById('add-file-type-btn').addEventListener('click', function() {
        addSettingItem('fileTypes', 'file-type-input', '文件类型');
    });
    
    // 回车键添加文件类型
    document.getElementById('file-type-input').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            addSettingItem('fileTypes', 'file-type-input', '文件类型');
        }
    });
}

// 初始化部门设置
function initDepartmentsSettings() {
    // 加载并显示部门
    loadAndDisplaySettings('departments', 'departments-list', 'department-input');
    
    // 添加部门按钮事件
    document.getElementById('add-department-btn').addEventListener('click', function() {
        addSettingItem('departments', 'department-input', '部门');
    });
    
    // 回车键添加部门
    document.getElementById('department-input').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            addSettingItem('departments', 'department-input', '部门');
        }
    });
}

// 初始化计量单位设置
function initUnitsSettings() {
    // 加载并显示计量单位
    loadAndDisplaySettings('units', 'units-list', 'unit-input');
    
    // 添加计量单位按钮事件
    document.getElementById('add-unit-btn').addEventListener('click', function() {
        addSettingItem('units', 'unit-input', '计量单位');
    });
    
    // 回车键添加计量单位
    document.getElementById('unit-input').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            addSettingItem('units', 'unit-input', '计量单位');
        }
    });
}

// 初始化送签状态设置
function initStatusesSettings() {
    // 加载并显示送签状态
    loadAndDisplaySettings('statuses', 'statuses-list', 'status-input');
    
    // 添加送签状态按钮事件
    document.getElementById('add-status-btn').addEventListener('click', function() {
        addSettingItem('statuses', 'status-input', '送签状态');
    });
    
    // 回车键添加送签状态
    document.getElementById('status-input').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            addSettingItem('statuses', 'status-input', '送签状态');
        }
    });
}

// 初始化付款单位设置
function initPaymentUnitsSettings() {
    // 加载并显示付款单位
    loadAndDisplaySettings('paymentUnits', 'payment-units-list', 'payment-unit-input');
    
    // 添加付款单位按钮事件
    document.getElementById('add-payment-unit-btn').addEventListener('click', function() {
        addSettingItem('paymentUnits', 'payment-unit-input', '付款单位');
    });
    
    // 回车键添加付款单位
    document.getElementById('payment-unit-input').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            addSettingItem('paymentUnits', 'payment-unit-input', '付款单位');
        }
    });
}

// 初始化支付类型设置
function initPaymentCategoriesSettings() {
    // 加载并显示支付类型
    loadAndDisplaySettings('paymentCategories', 'payment-categories-list', 'payment-category-input');
    
    // 添加支付类型按钮事件
    document.getElementById('add-payment-category-btn').addEventListener('click', function() {
        addSettingItem('paymentCategories', 'payment-category-input', '支付类型');
    });
    
    // 回车键添加支付类型
    document.getElementById('payment-category-input').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            addSettingItem('paymentCategories', 'payment-category-input', '支付类型');
        }
    });
}

// 加载并显示设置项
function loadAndDisplaySettings(storageKey, listElementId, inputElementId) {
    const items = loadFromLocalStorage(storageKey, []);
    const listElement = document.getElementById(listElementId);
    
    listElement.innerHTML = '';
    
    items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'setting-item';
        itemElement.innerHTML = `
            <span>${item}</span>
            <button class="btn btn-sm btn-danger delete-setting-btn" data-index="${index}" data-key="${storageKey}">删除</button>
        `;
        listElement.appendChild(itemElement);
    });
    
    // 绑定删除按钮事件
    bindDeleteSettingButtons();
}

// 绑定删除设置项按钮事件
function bindDeleteSettingButtons() {
    const deleteButtons = document.querySelectorAll('.delete-setting-btn');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            const storageKey = this.getAttribute('data-key');
            
            // 获取设置项名称
            let settingName = '';
            switch (storageKey) {
                case 'fileTypes': settingName = '文件类型'; break;
                case 'departments': settingName = '部门'; break;
                case 'units': settingName = '计量单位'; break;
                case 'statuses': settingName = '送签状态'; break;
                case 'paymentUnits': settingName = '付款单位'; break;
                case 'paymentCategories': settingName = '支付类型'; break;
            }
            
            if (confirm(`确定要删除这个${settingName}吗？`)) {
                deleteSettingItem(storageKey, index);
                
                // 记录操作日志
                addLog(`删除${settingName}`);
            }
        });
    });
}

// 添加设置项
function addSettingItem(storageKey, inputElementId, settingName) {
    const inputElement = document.getElementById(inputElementId);
    const value = inputElement.value.trim();
    
    if (!value) {
        showError(`请输入${settingName}`);
        return;
    }
    
    // 检查是否已存在
    const items = loadFromLocalStorage(storageKey, []);
    if (items.includes(value)) {
        showError(`${settingName}已存在`);
        return;
    }
    
    // 添加新项
    items.push(value);
    saveToLocalStorage(storageKey, items);
    
    // 重新加载并显示
    loadAndDisplaySettings(storageKey, `${storageKey.replace(/([A-Z])/g, '-$1').toLowerCase()}-list`, inputElementId);
    
    // 清空输入框
    inputElement.value = '';
    
    showSuccess(`${settingName}添加成功`);
    
    // 记录操作日志
    addLog(`添加${settingName}: ${value}`);
}

// 删除设置项
function deleteSettingItem(storageKey, index) {
    const items = loadFromLocalStorage(storageKey, []);
    
    // 检查索引是否有效
    if (index >= 0 && index < items.length) {
        items.splice(index, 1);
        saveToLocalStorage(storageKey, items);
        
        // 重新加载并显示
        const listElementId = `${storageKey.replace(/([A-Z])/g, '-$1').toLowerCase()}-list`;
        loadAndDisplaySettings(storageKey, listElementId, `${storageKey.replace(/([A-Z])/g, '-$1').toLowerCase()}-input`);
        
        // 获取设置项名称
        let settingName = '';
        switch (storageKey) {
            case 'fileTypes': settingName = '文件类型'; break;
            case 'departments': settingName = '部门'; break;
            case 'units': settingName = '计量单位'; break;
            case 'statuses': settingName = '送签状态'; break;
            case 'paymentUnits': settingName = '付款单位'; break;
            case 'paymentCategories': settingName = '支付类型'; break;
        }
        
        showSuccess(`${settingName}删除成功`);
    }
}

// 初始化账号管理
function initAccountManagement() {
    // 加载并显示账号列表
    loadAndDisplayAccounts();
    
    // 添加账号按钮事件
    document.getElementById('add-account-btn').addEventListener('click', showAddAccountModal);
    
    // 关闭添加账号弹窗
    document.getElementById('close-add-account-modal').addEventListener('click', function() {
        document.getElementById('add-account-modal').classList.add('hidden');
    });
    
    // 提交添加账号表单
    document.getElementById('add-account-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitAddAccountForm();
    });
}

// 加载并显示账号列表
function loadAndDisplayAccounts() {
    const users = loadFromLocalStorage('users', []);
    const accountsTable = document.getElementById('accounts-table');
    const accountsBody = accountsTable.querySelector('tbody');
    
    accountsBody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        
        // 权限文本
        let roleText = '';
        switch (user.role) {
            case 'admin': roleText = '总管理员'; break;
            case 'manager': roleText = '普通管理员'; break;
            case 'user': roleText = '普通账号'; break;
        }
        
        // 操作按钮
        let actionButtons = '';
        const currentUser = getCurrentUser();
        
        // 总管理员可以操作所有账号，但不能删除自己
        // 普通管理员可以操作普通账号
        if ((currentUser.role === 'admin' && user.username !== currentUser.username) || 
            (currentUser.role === 'manager' && user.role === 'user')) {
            actionButtons = `
                <button class="btn btn-sm btn-primary edit-account-btn" data-username="${user.username}">编辑</button>
                <button class="btn btn-sm btn-danger delete-account-btn" data-username="${user.username}">删除</button>
            `;
        } else if (currentUser.username === user.username) {
            // 自己只能修改自己的密码
            actionButtons = `
                <button class="btn btn-sm btn-primary change-password-btn" data-username="${user.username}">修改密码</button>
            `;
        }
        
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${roleText}</td>
            <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString('zh-CN') : '从未登录'}</td>
            <td>${actionButtons}</td>
        `;
        
        accountsBody.appendChild(row);
    });
    
    // 绑定账号操作按钮事件
    bindAccountActionButtons();
}

// 绑定账号操作按钮事件
function bindAccountActionButtons() {
    // 编辑账号按钮
    const editButtons = document.querySelectorAll('.edit-account-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            showEditAccountModal(username);
        });
    });
    
    // 删除账号按钮
    const deleteButtons = document.querySelectorAll('.delete-account-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            if (confirm(`确定要删除账号 ${username} 吗？`)) {
                deleteUser(username);
                loadAndDisplayAccounts();
                showSuccess(`账号 ${username} 已删除`);
                addLog(`删除账号: ${username}`);
            }
        });
    });
    
    // 修改密码按钮
    const changePasswordButtons = document.querySelectorAll('.change-password-btn');
    changePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            document.getElementById('change-password-username').value = username;
            document.getElementById('change-password-modal').classList.remove('hidden');
        });
    });
}

// 显示添加账号弹窗
function showAddAccountModal() {
    document.getElementById('add-account-modal').classList.remove('hidden');
    document.getElementById('add-account-form').reset();
}

// 提交添加账号表单
function submitAddAccountForm() {
    const username = document.getElementById('new-username').value.trim();
    const password = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const role = document.getElementById('new-role').value;
    
    // 验证输入
    if (!username) {
        showError('请输入用户名');
        return;
    }
    
    if (!password) {
        showError('请输入密码');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('两次输入的密码不一致');
        return;
    }
    
    // 检查用户名是否已存在
    const users = loadFromLocalStorage('users', []);
    if (users.some(user => user.username === username)) {
        showError('用户名已存在');
        return;
    }
    
    // 添加新账号
    addUser(username, password, role);
    
    // 关闭弹窗
    document.getElementById('add-account-modal').classList.add('hidden');
    
    // 重新加载并显示账号列表
    loadAndDisplayAccounts();
    
    showSuccess(`账号 ${username} 添加成功`);
    addLog(`添加账号: ${username}`);
}

// 显示编辑账号弹窗
function showEditAccountModal(username) {
    const users = loadFromLocalStorage('users', []);
    const user = users.find(u => u.username === username);
    
    if (!user) {
        showError('账号不存在');
        return;
    }
    
    // 填充编辑表单
    document.getElementById('edit-username').value = user.username;
    document.getElementById('edit-role').value = user.role;
    
    // 显示编辑弹窗
    document.getElementById('edit-account-modal').classList.remove('hidden');
    
    // 绑定关闭按钮事件
    document.getElementById('close-edit-account-modal').addEventListener('click', function() {
        document.getElementById('edit-account-modal').classList.add('hidden');
    });
    
    // 绑定提交按钮事件
    document.getElementById('edit-account-form').onsubmit = function(e) {
        e.preventDefault();
        submitEditAccountForm();
    };
}

// 提交编辑账号表单
function submitEditAccountForm() {
    const username = document.getElementById('edit-username').value;
    const role = document.getElementById('edit-role').value;
    const changePassword = document.getElementById('change-password-checkbox').checked;
    
    let newPassword = '';
    let confirmNewPassword = '';
    
    if (changePassword) {
        newPassword = document.getElementById('edit-new-password').value;
        confirmNewPassword = document.getElementById('edit-confirm-password').value;
        
        if (!newPassword) {
            showError('请输入新密码');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            showError('两次输入的密码不一致');
            return;
        }
    }
    
    // 更新账号信息
    updateUser(username, role, newPassword);
    
    // 关闭弹窗
    document.getElementById('edit-account-modal').classList.add('hidden');
    
    // 重新加载并显示账号列表
    loadAndDisplayAccounts();
    
    showSuccess(`账号 ${username} 已更新`);
    addLog(`编辑账号: ${username}`);
}

// 初始化操作日志
function initOperationLogs() {
    // 加载并显示操作日志
    loadAndDisplayOperationLogs();
    
    // 清空日志按钮事件
    document.getElementById('clear-logs-btn').addEventListener('click', function() {
        if (confirm('确定要清空所有操作日志吗？')) {
            saveToLocalStorage('logs', []);
            loadAndDisplayOperationLogs();
            showSuccess('操作日志已清空');
            addLog('清空操作日志');
        }
    });
}

// 加载并显示操作日志
function loadAndDisplayOperationLogs() {
    const logs = loadFromLocalStorage('logs', []);
    const logsList = document.getElementById('logs-list');
    
    logsList.innerHTML = '';
    
    if (logs.length === 0) {
        logsList.innerHTML = '<div class="text-center text-gray">暂无操作日志</div>';
        return;
    }
    
    // 按时间倒序排列
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    logs.forEach(log => {
        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        
        const timestamp = new Date(log.timestamp).toLocaleString('zh-CN');
        
        logItem.innerHTML = `
            <div class="log-time">${timestamp}</div>
            <div class="log-content">${log.content}</div>
            <div class="log-user">用户: ${log.user || '系统'}</div>
        `;
        
        logsList.appendChild(logItem);
    });
}

// 处理修改密码表单提交
export function handleChangePasswordSubmit() {
    const changePasswordForm = document.getElementById('change-password-form');
    
    changePasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('change-password-username').value;
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;
        
        // 验证输入
        if (!currentPassword || !newPassword) {
            showError('请输入所有密码字段');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            showError('两次输入的新密码不一致');
            return;
        }
        
        // 验证当前密码
        const users = loadFromLocalStorage('users', []);
        const userIndex = users.findIndex(u => u.username === username);
        
        if (userIndex === -1) {
            showError('用户不存在');
            return;
        }
        
        const user = users[userIndex];
        
        // 简单的密码验证（实际项目中应该使用哈希）
        if (user.password !== currentPassword) {
            showError('当前密码错误');
            return;
        }
        
        // 更新密码
        user.password = newPassword;
        user.needsPasswordChange = false;
        saveToLocalStorage('users', users);
        
        // 关闭弹窗
        document.getElementById('change-password-modal').classList.add('hidden');
        
        showSuccess('密码修改成功');
        addLog(`修改密码: ${username}`);
    });
    
    // 关闭修改密码弹窗
    document.getElementById('close-change-password-modal').addEventListener('click', function() {
        document.getElementById('change-password-modal').classList.add('hidden');
    });
}