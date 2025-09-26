// 模拟数据
import { storage } from './utils.js';

// 初始化默认数据
export function initMockData() {
    // 检查是否已经初始化
    if (storage.get('initialized')) {
        return;
    }
    
    // 初始化用户账号
    const users = [
        {
            id: '1',
            username: 'TYL2025',
            password: '941314aA', // 初始密码
            role: 'admin', // 总管理员
            name: '总管理员',
            department: '系统管理',
            lastLogin: null,
            needChangePassword: false
        },
        {
            id: '2',
            username: '8888',
            password: '8888',
            role: 'manager', // 普通管理员
            name: '普通管理员',
            department: '行政',
            lastLogin: null,
            needChangePassword: true
        },
        {
            id: '3',
            username: '1001',
            password: '1001',
            role: 'user', // 普通账号
            name: '普通用户',
            department: '前厅FO',
            lastLogin: null,
            needChangePassword: true
        }
    ];
    
    // 初始化文件类型
    const fileTypes = [
        '采购计划审批表',
        '合同（协议）签订审批表',
        '付款申请单',
        '用印审批表',
        '付款单+用印审批（仅限验收报告）',
        '工作联系单',
        '固定资产验收单',
        '会议议题',
        '借印审批表',
        '请假申请表',
        '差旅申请表',
        '其他'
    ];
    
    // 初始化部门
    const departments = [
        '前厅FO',
        '客房HSKP',
        '西餐厅',
        '中餐厅',
        '大堂吧',
        '宴会厅',
        '迷你吧',
        '餐饮办公室',
        '管事部',
        '饼房',
        '财务FIN',
        '行政EO',
        '人事HR',
        '员工餐厅',
        '销售S&M',
        '工程ENG'
    ];
    
    // 初始化计量单位
    const units = [
        '/',
        '批',
        '个（支）',
        '件',
        '套',
        '份',
        '只',
        '台',
        '桶',
        '次',
        '块',
        '人',
        '盒',
        '瓶',
        '双',
        '张',
        '月',
        '年',
        '克（g）',
        '千克（kg）',
        '箱',
        '米',
        '平方米',
        '包',
        '袋',
        '家',
        'PCS',
        'PAC',
        '佣金（%）',
        '其他'
    ];
    
    // 初始化送签状态
    const statuses = [
        '完毕',
        '总秘（酒店总经理）',
        '待送集团',
        '业主代表',
        '陆总及彭总（盖章处）',
        '集团审核',
        '集团经理待签',
        '退回',
        '未盖章',
        '重签',
        '作废',
        '资产管理部',
        '招采办',
        '酒店内部走签',
        '急单',
        '已签未付'
    ];
    
    // 初始化付款单位简称
    const paymentUnits = [
        '一泽',
        '鼎舒盛',
        '卉好',
        '晓逸',
        '其他'
    ];
    
    // 初始化支付类型
    const paymentTypes = [
        '货款',
        '费用',
        '全款',
        '预付款',
        '验收款',
        '尾款',
        '其他'
    ];
    
    // 初始化示例文件数据
    const documents = [
        {
            id: 'doc-1',
            date: new Date().toISOString().split('T')[0],
            fileType: '采购计划审批表',
            documentNumber: 'TBTC-2025001',
            department: '前厅FO',
            applicant: '张三',
            content: '采购前台办公用品一批',
            unit: '批',
            quantity: 1,
            amount: 2500,
            endDate: null,
            status: '酒店内部走签',
            statusUpdateTime: new Date().toISOString(),
            rejectReason: null,
            createdBy: '1001',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'doc-2',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            fileType: '付款申请单',
            documentNumber: '2025001',
            department: '财务FIN',
            applicant: '李四',
            content: '支付-办公用品采购-费用-(2025年09月--一泽)',
            unit: '/',
            quantity: 0,
            amount: 5000,
            endDate: null,
            status: '集团审核',
            statusUpdateTime: new Date().toISOString(),
            rejectReason: null,
            createdBy: '8888',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'doc-3',
            date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
            fileType: '工作联系单',
            documentNumber: '',
            department: '工程ENG',
            applicant: '王五',
            content: '维修客房空调系统',
            unit: '次',
            quantity: 1,
            amount: 0,
            endDate: new Date().toISOString().split('T')[0],
            status: '完毕',
            statusUpdateTime: new Date().toISOString(),
            rejectReason: null,
            createdBy: '1001',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    
    // 初始化操作日志
    const operationLogs = [
        {
            id: 'log-1',
            userId: '1',
            username: 'TYL2025',
            operation: '系统初始化',
            details: '系统首次启动，初始化基础数据',
            timestamp: new Date().toISOString()
        }
    ];
    
    // 保存到本地存储
    storage.set('users', users);
    storage.set('fileTypes', fileTypes);
    storage.set('departments', departments);
    storage.set('units', units);
    storage.set('statuses', statuses);
    storage.set('paymentUnits', paymentUnits);
    storage.set('paymentTypes', paymentTypes);
    storage.set('documents', documents);
    storage.set('operationLogs', operationLogs);
    
    // 标记为已初始化
    storage.set('initialized', true);
}

// 获取用户数据
export function getUsers() {
    return storage.get('users', []);
}

// 设置用户数据
export function setUsers(users) {
    return storage.set('users', users);
}

// 获取文件类型数据
export function getFileTypes() {
    return storage.get('fileTypes', []);
}

// 设置文件类型数据
export function setFileTypes(fileTypes) {
    return storage.set('fileTypes', fileTypes);
}

// 获取部门数据
export function getDepartments() {
    return storage.get('departments', []);
}

// 设置部门数据
export function setDepartments(departments) {
    return storage.set('departments', departments);
}

// 获取计量单位数据
export function getUnits() {
    return storage.get('units', []);
}

// 设置计量单位数据
export function setUnits(units) {
    return storage.set('units', units);
}

// 获取送签状态数据
export function getStatuses() {
    return storage.get('statuses', []);
}

// 设置送签状态数据
export function setStatuses(statuses) {
    return storage.set('statuses', statuses);
}

// 获取付款单位简称数据
export function getPaymentUnits() {
    return storage.get('paymentUnits', []);
}

// 设置付款单位简称数据
export function setPaymentUnits(paymentUnits) {
    return storage.set('paymentUnits', paymentUnits);
}

// 获取支付类型数据
export function getPaymentTypes() {
    return storage.get('paymentTypes', []);
}

// 设置支付类型数据
export function setPaymentTypes(paymentTypes) {
    return storage.set('paymentTypes', paymentTypes);
}

// 获取文件数据
export function getDocuments() {
    return storage.get('documents', []);
}

// 设置文件数据
export function setDocuments(documents) {
    return storage.set('documents', documents);
}

// 获取操作日志
export function getOperationLogs() {
    return storage.get('operationLogs', []);
}

// 添加操作日志
export function addOperationLog(userId, username, operation, details) {
    const logs = getOperationLogs();
    const newLog = {
        id: `log-${Date.now()}`,
        userId,
        username,
        operation,
        details,
        timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    // 只保留最近1000条日志
    if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
    }
    return storage.set('operationLogs', logs);
}

// 获取当前登录用户
export function getCurrentUser() {
    return storage.get('currentUser', null);
}

// 设置当前登录用户
export function setCurrentUser(user) {
    return storage.set('currentUser', user);
}

// 清除当前登录用户
export function clearCurrentUser() {
    return storage.remove('currentUser');
}