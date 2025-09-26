// 数据存储
let db = {
    // 账号数据
    accounts: [
        { id: 1, username: 'TYL2025', password: '941314aA', role: 'superadmin', needChangePassword: false },
        { id: 2, username: '8888', password: '8888', role: 'admin', needChangePassword: true },
        { id: 3, username: '1001', password: '1001', role: 'normal', needChangePassword: true }
    ],
    
    // 文件类型数据
    fileTypes: [
        '采购计划审批表', '合同（协议）签订审批表', '付款申请单', '用印审批表', 
        '付款单+用印审批（仅限验收报告）', '工作联系单', '固定资产验收单', 
        '会议议题', '借印审批表', '请假申请表', '差旅申请表', '其他'
    ],
    
    // 部门数据
    departments: [
        '前厅FO', '客房HSKP', '西餐厅', '中餐厅', '大堂吧', '宴会厅', '迷你吧', 
        '餐饮办公室', '管事部', '饼房', '财务FIN', '行政EO', '人事HR', '员工餐厅', 
        '销售S&M', '工程ENG'
    ],
    
    // 计量单位数据
    units: [
        '/', '批', '个（支）', '件', '套', '份', '只', '台', '桶', '次', '块', '人', 
        '盒', '瓶', '双', '张', '月', '年', '克（g）', '千克（kg）', '箱', '米', 
        '平方米', '包', '袋', '家', 'PCS', 'PAC', '佣金（%）', '其他'
    ],
    
    // 送签状态数据
    statuses: [
        '完毕', '总秘（酒店总经理）', '待送集团', '业主代表', '陆总及彭总（盖章处）', 
        '集团审核', '集团经理待签', '退回', '未盖章', '重签', '作废', '资产管理部', 
        '招采办', '酒店内部走签', '急单', '已签未付'
    ],
    
    // 付款单位简称数据
    companies: [
        '一泽', '鼎舒盛', '卉好', '晓逸', '其他'
    ],
    
    // 支付类型数据
    paymentMethods: [
        '货款', '费用', '全款', '预付款', '验收款', '尾款', '其他'
    ],
    
    // 文件数据
    files: [],
    
    // 操作日志
    logs: []
};

// 初始化本地存储
function initLocalStorage() {
    const savedDb = localStorage.getItem('documentApprovalSystem');
    if (savedDb) {
        db = JSON.parse(savedDb);
    } else {
        saveToLocalStorage();
    }
}

// 保存数据到本地存储
function saveToLocalStorage() {
    localStorage.setItem('documentApprovalSystem', JSON.stringify(db));
}

// 账号相关函数
function getAccount(username) {
    return db.accounts.find(account => account.username === username);
}

function addAccount(username, password, role) {
    const id = db.accounts.length > 0 ? Math.max(...db.accounts.map(a => a.id)) + 1 : 1;
    db.accounts.push({
        id: id,
        username: username,
        password: password,
        role: role,
        needChangePassword: role !== 'superadmin'
    });
    saveToLocalStorage();
    logAction('添加账号', `添加了账号 ${username}，角色：${role}`);
    return id;
}

function updateAccount(id, data) {
    const index = db.accounts.findIndex(account => account.id === id);
    if (index !== -1) {
        db.accounts[index] = { ...db.accounts[index], ...data };
        saveToLocalStorage();
        logAction('更新账号', `更新了账号 ID: ${id}`);
        return true;
    }
    return false;
}

function deleteAccount(id) {
    const index = db.accounts.findIndex(account => account.id === id);
    if (index !== -1) {
        const username = db.accounts[index].username;
        db.accounts.splice(index, 1);
        saveToLocalStorage();
        logAction('删除账号', `删除了账号 ${username}`);
        return true;
    }
    return false;
}

function changePassword(username, currentPassword, newPassword) {
    const account = getAccount(username);
    if (account && account.password === currentPassword) {
        account.password = newPassword;
        account.needChangePassword = false;
        saveToLocalStorage();
        logAction('修改密码', `用户 ${username} 修改了密码`);
        return true;
    }
    return false;
}

// 文件相关函数
function addFile(fileData) {
    const id = db.files.length > 0 ? Math.max(...db.files.map(f => f.id)) + 1 : 1;
    const now = new Date();
    const file = {
        id: id,
        ...fileData,
        status: '未处理',
        statusUpdateTime: now.toISOString(),
        createTime: now.toISOString()
    };
    db.files.push(file);
    saveToLocalStorage();
    logAction('提交文件', `提交了文件 ID: ${id}，类型：${fileData.fileType}`);
    return id;
}

function getFiles(filters = {}) {
    let result = [...db.files];
    
    // 应用筛选条件
    if (filters.type && filters.type !== 'all') {
        result = result.filter(file => file.fileType === filters.type);
    }
    
    if (filters.department && filters.department !== 'all') {
        result = result.filter(file => file.department === filters.department);
    }
    
    if (filters.status && filters.status !== 'all') {
        result = result.filter(file => file.status === filters.status);
    }
    
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(file => 
            file.applicant.toLowerCase().includes(searchLower) ||
            file.fileContent.toLowerCase().includes(searchLower) ||
            (file.fileNumber && file.fileNumber.toLowerCase().includes(searchLower))
        );
    }
    
    // 按创建时间倒序排序
    result.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    
    return result;
}

function getFileById(id) {
    return db.files.find(file => file.id === id);
}

function updateFile(id, data) {
    const index = db.files.findIndex(file => file.id === id);
    if (index !== -1) {
        db.files[index] = { ...db.files[index], ...data };
        saveToLocalStorage();
        logAction('更新文件', `更新了文件 ID: ${id}`);
        return true;
    }
    return false;
}

function deleteFile(id) {
    const index = db.files.findIndex(file => file.id === id);
    if (index !== -1) {
        const fileType = db.files[index].fileType;
        db.files.splice(index, 1);
        saveToLocalStorage();
        logAction('删除文件', `删除了文件 ID: ${id}，类型：${fileType}`);
        return true;
    }
    return false;
}

function updateFileStatus(id, status, reason = '') {
    const file = getFileById(id);
    if (file) {
        const now = new Date();
        file.status = status;
        file.statusUpdateTime = now.toISOString();
        
        if (status === '退回') {
            file.rejectReason = reason;
        } else {
            delete file.rejectReason;
        }
        
        if (status === '完毕') {
            file.endDate = now.toISOString().split('T')[0];
        } else if (file.endDate) {
            delete file.endDate;
        }
        
        saveToLocalStorage();
        logAction('更新文件状态', `文件 ID: ${id} 状态更新为: ${status}`);
        return true;
    }
    return false;
}

// 设置相关函数
function addSetting(type, value) {
    if (db[type] && !db[type].includes(value)) {
        db[type].push(value);
        saveToLocalStorage();
        logAction('添加设置', `添加了 ${type} 设置: ${value}`);
        return true;
    }
    return false;
}

function removeSetting(type, value) {
    if (db[type]) {
        const index = db[type].indexOf(value);
        if (index !== -1) {
            db[type].splice(index, 1);
            saveToLocalStorage();
            logAction('删除设置', `删除了 ${type} 设置: ${value}`);
            return true;
        }
    }
    return false;
}

// 日志相关函数
function logAction(action, details) {
    const now = new Date();
    const log = {
        id: db.logs.length + 1,
        time: now.toISOString(),
        action: action,
        details: details,
        user: currentUser ? currentUser.username : '系统'
    };
    db.logs.unshift(log);
    
    // 限制日志数量，只保留最近1000条
    if (db.logs.length > 1000) {
        db.logs.pop();
    }
    
    saveToLocalStorage();
}

function getLogs() {
    return [...db.logs];
}

// 当前登录用户
let currentUser = null;

// 初始化数据
initLocalStorage();

// 导出函数供其他文件使用
window.db = {
    // 账号函数
    getAccount,
    addAccount,
    updateAccount,
    deleteAccount,
    changePassword,
    
    // 文件函数
    addFile,
    getFiles,
    getFileById,
    updateFile,
    deleteFile,
    updateFileStatus,
    
    // 设置函数
    addSetting,
    removeSetting,
    
    // 日志函数
    getLogs,
    
    // 数据访问
    getData: () => ({ ...db }),
    
    // 用户状态
    getCurrentUser: () => currentUser,
    setCurrentUser: (user) => { currentUser = user; }
};