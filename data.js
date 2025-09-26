// 数据管理模块

/**
 * 初始化系统数据
 */
function initSystemData() {
    // 初始化用户数据
    if (!storage.get('users')) {
        const initialUsers = [
            { id: '1', username: 'TYL2025', password: '941314aA', role: 'superadmin', mustChangePassword: false },
            { id: '2', username: '8888', password: '8888', role: 'admin', mustChangePassword: true },
            { id: '3', username: '1001', password: '1001', role: 'user', mustChangePassword: true }
        ];
        storage.set('users', initialUsers);
    }
    
    // 初始化文件类型
    if (!storage.get('fileTypes')) {
        const initialFileTypes = [
            '采购计划审批表', '合同（协议）签订审批表', '付款申请单', '用印审批表', 
            '付款单+用印审批（仅限验收报告）', '工作联系单', '固定资产验收单', 
            '会议议题', '借印审批表', '请假申请表', '差旅申请表', '其他'
        ];
        storage.set('fileTypes', initialFileTypes);
    }
    
    // 初始化部门
    if (!storage.get('departments')) {
        const initialDepartments = [
            '前厅FO', '客房HSKP', '西餐厅', '中餐厅', '大堂吧', '宴会厅', '迷你吧', 
            '餐饮办公室', '管事部', '饼房', '财务FIN', '行政EO', '人事HR', 
            '员工餐厅', '销售S&M', '工程ENG'
        ];
        storage.set('departments', initialDepartments);
    }
    
    // 初始化计量单位
    if (!storage.get('units')) {
        const initialUnits = [
            '/', '批', '个（支）', '件', '套', '份', '只', '台', '桶', '次', 
            '块', '人', '盒', '瓶', '双', '张', '月', '年', '克（g）', '千克（kg）', 
            '箱', '米', '平方米', '包', '袋', '家', 'PCS', 'PAC', '佣金（%）', '其他'
        ];
        storage.set('units', initialUnits);
    }
    
    // 初始化送签状态
    if (!storage.get('statuses')) {
        const initialStatuses = [
            '完毕', '总秘（酒店总经理）', '待送集团', '业主代表', 
            '陆总及彭总（盖章处）', '集团审核', '集团经理待签', '退回', 
            '未盖章', '重签', '作废', '资产管理部', '招采办', '酒店内部走签', 
            '急单', '已签未付'
        ];
        storage.set('statuses', initialStatuses);
    }
    
    // 初始化文件数据
    if (!storage.get('files')) {
        storage.set('files', []);
    }
    
    // 初始化操作日志
    if (!storage.get('logs')) {
        storage.set('logs', []);
    }
}

/**
 * 用户管理
 */
const userManager = {
    // 获取所有用户
    getAllUsers() {
        return storage.get('users', []);
    },
    
    // 根据用户名获取用户
    getUserByUsername(username) {
        const users = this.getAllUsers();
        return users.find(user => user.username === username);
    },
    
    // 验证用户登录
    validateUser(username, password) {
        const user = this.getUserByUsername(username);
        if (!user || user.password !== password) {
            return { valid: false, message: '账号或密码错误' };
        }
        return { valid: true, user };
    },
    
    // 修改密码
    changePassword(username, currentPassword, newPassword) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(user => user.username === username);
        
        if (userIndex === -1) {
            return { success: false, message: '用户不存在' };
        }
        
        if (users[userIndex].password !== currentPassword) {
            return { success: false, message: '当前密码错误' };
        }
        
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return { success: false, message: passwordValidation.message };
        }
        
        users[userIndex].password = newPassword;
        users[userIndex].mustChangePassword = false;
        storage.set('users', users);
        
        return { success: true, message: '密码修改成功' };
    },
    
    // 添加用户
    addUser(username, password, role) {
        const users = this.getAllUsers();
        
        if (users.some(user => user.username === username)) {
            return { success: false, message: '账号已存在' };
        }
        
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return { success: false, message: passwordValidation.message };
        }
        
        const newUser = {
            id: generateId(),
            username,
            password,
            role,
            mustChangePassword: role !== 'superadmin' // 非超级管理员首次登录需要修改密码
        };
        
        users.push(newUser);
        storage.set('users', users);
        
        return { success: true, message: '用户添加成功', user: newUser };
    },
    
    // 更新用户权限
    updateUserRole(username, newRole) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(user => user.username === username);
        
        if (userIndex === -1) {
            return { success: false, message: '用户不存在' };
        }
        
        // 不能修改超级管理员的权限
        if (users[userIndex].role === 'superadmin') {
            return { success: false, message: '不能修改超级管理员的权限' };
        }
        
        users[userIndex].role = newRole;
        storage.set('users', users);
        
        return { success: true, message: '用户权限更新成功' };
    },
    
    // 删除用户
    deleteUser(username) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(user => user.username === username);
        
        if (userIndex === -1) {
            return { success: false, message: '用户不存在' };
        }
        
        // 不能删除超级管理员
        if (users[userIndex].role === 'superadmin') {
            return { success: false, message: '不能删除超级管理员' };
        }
        
        // 确保至少有一个超级管理员
        const superadmins = users.filter(user => user.role === 'superadmin');
        if (superadmins.length <= 1 && users[userIndex].role === 'superadmin') {
            return { success: false, message: '至少需要保留一个超级管理员' };
        }
        
        users.splice(userIndex, 1);
        storage.set('users', users);
        
        return { success: true, message: '用户删除成功' };
    }
};

/**
 * 文件管理
 */
const fileManager = {
    // 获取所有文件
    getAllFiles() {
        return storage.get('files', []);
    },
    
    // 根据ID获取文件
    getFileById(fileId) {
        const files = this.getAllFiles();
        return files.find(file => file.id === fileId);
    },
    
    // 添加文件
    addFile(fileData) {
        const files = this.getAllFiles();
        
        const newFile = {
            id: generateId(),
            ...fileData,
            status: '酒店内部走签', // 默认状态
            statusUpdateTime: new Date().toISOString(),
            createTime: new Date().toISOString(),
            endDate: null,
            rejectReason: null
        };
        
        files.push(newFile);
        storage.set('files', files);
        
        return { success: true, message: '文件提交成功', file: newFile };
    },
    
    // 更新文件
    updateFile(fileId, updatedData) {
        const files = this.getAllFiles();
        const fileIndex = files.findIndex(file => file.id === fileId);
        
        if (fileIndex === -1) {
            return { success: false, message: '文件不存在' };
        }
        
        // 如果状态有变更，更新状态更新时间
        if (updatedData.status && updatedData.status !== files[fileIndex].status) {
            updatedData.statusUpdateTime = new Date().toISOString();
            
            // 如果状态是'完毕'，设置结束日期
            if (updatedData.status === '完毕') {
                updatedData.endDate = new Date().toISOString().split('T')[0];
            } else if (files[fileIndex].status === '完毕' && updatedData.status !== '完毕') {
                // 如果之前是完毕状态，现在改为其他状态，清空结束日期
                updatedData.endDate = null;
            }
        }
        
        files[fileIndex] = { ...files[fileIndex], ...updatedData };
        storage.set('files', files);
        
        return { success: true, message: '文件更新成功', file: files[fileIndex] };
    },
    
    // 删除文件
    deleteFile(fileId) {
        const files = this.getAllFiles();
        const fileIndex = files.findIndex(file => file.id === fileId);
        
        if (fileIndex === -1) {
            return { success: false, message: '文件不存在' };
        }
        
        files.splice(fileIndex, 1);
        storage.set('files', files);
        
        return { success: true, message: '文件删除成功' };
    },
    
    // 批量删除文件
    batchDeleteFiles(fileIds) {
        let successCount = 0;
        let errorCount = 0;
        
        fileIds.forEach(fileId => {
            const result = this.deleteFile(fileId);
            if (result.success) {
                successCount++;
            } else {
                errorCount++;
            }
        });
        
        return {
            success: true,
            message: `成功删除 ${successCount} 个文件，失败 ${errorCount} 个文件`
        };
    },
    
    // 批量更新文件状态
    batchUpdateFileStatus(fileIds, status, rejectReason = null) {
        let successCount = 0;
        let errorCount = 0;
        
        fileIds.forEach(fileId => {
            const updateData = { status };
            if (status === '退回' && rejectReason) {
                updateData.rejectReason = rejectReason;
            } else {
                updateData.rejectReason = null;
            }
            
            const result = this.updateFile(fileId, updateData);
            if (result.success) {
                successCount++;
            } else {
                errorCount++;
            }
        });
        
        return {
            success: true,
            message: `成功更新 ${successCount} 个文件状态，失败 ${errorCount} 个文件`
        };
    },
    
    // 搜索和筛选文件
    searchFiles(filters) {
        let files = this.getAllFiles();
        
        // 关键词搜索
        if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase();
            files = files.filter(file => 
                (file.fileType && file.fileType.toLowerCase().includes(keyword)) ||
                (file.department && file.department.toLowerCase().includes(keyword)) ||
                (file.applicant && file.applicant.toLowerCase().includes(keyword)) ||
                (file.fileContent && file.fileContent.toLowerCase().includes(keyword)) ||
                (file.fileNumber && file.fileNumber.toLowerCase().includes(keyword))
            );
        }
        
        // 文件类型筛选
        if (filters.fileType) {
            files = files.filter(file => file.fileType === filters.fileType);
        }
        
        // 部门筛选
        if (filters.department) {
            files = files.filter(file => file.department === filters.department);
        }
        
        // 申请人筛选
        if (filters.applicant) {
            const applicant = filters.applicant.toLowerCase();
            files = files.filter(file => 
                file.applicant && file.applicant.toLowerCase().includes(applicant)
            );
        }
        
        // 状态筛选
        if (filters.status) {
            files = files.filter(file => file.status === filters.status);
        }
        
        // 日期范围筛选
        if (filters.dateStart) {
            files = files.filter(file => new Date(file.date) >= new Date(filters.dateStart));
        }
        
        if (filters.dateEnd) {
            files = files.filter(file => new Date(file.date) <= new Date(filters.dateEnd));
        }
        
        // 按创建时间倒序排列
        files.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
        
        return files;
    }
};

/**
 * 系统配置管理
 */
const configManager = {
    // 获取文件类型
    getFileTypes() {
        return storage.get('fileTypes', []);
    },
    
    // 添加文件类型
    addFileType(type) {
        const types = this.getFileTypes();
        if (types.includes(type)) {
            return { success: false, message: '文件类型已存在' };
        }
        types.push(type);
        storage.set('fileTypes', types);
        return { success: true, message: '文件类型添加成功' };
    },
    
    // 删除文件类型
    deleteFileType(type) {
        const types = this.getFileTypes();
        const index = types.indexOf(type);
        if (index === -1) {
            return { success: false, message: '文件类型不存在' };
        }
        types.splice(index, 1);
        storage.set('fileTypes', types);
        return { success: true, message: '文件类型删除成功' };
    },
    
    // 获取部门
    getDepartments() {
        return storage.get('departments', []);
    },
    
    // 添加部门
    addDepartment(dept) {
        const depts = this.getDepartments();
        if (depts.includes(dept)) {
            return { success: false, message: '部门已存在' };
        }
        depts.push(dept);
        storage.set('departments', depts);
        return { success: true, message: '部门添加成功' };
    },
    
    // 删除部门
    deleteDepartment(dept) {
        const depts = this.getDepartments();
        const index = depts.indexOf(dept);
        if (index === -1) {
            return { success: false, message: '部门不存在' };
        }
        depts.splice(index, 1);
        storage.set('departments', depts);
        return { success: true, message: '部门删除成功' };
    },
    
    // 获取计量单位
    getUnits() {
        return storage.get('units', []);
    },
    
    // 添加计量单位
    addUnit(unit) {
        const units = this.getUnits();
        if (units.includes(unit)) {
            return { success: false, message: '计量单位已存在' };
        }
        units.push(unit);
        storage.set('units', units);
        return { success: true, message: '计量单位添加成功' };
    },
    
    // 删除计量单位
    deleteUnit(unit) {
        const units = this.getUnits();
        const index = units.indexOf(unit);
        if (index === -1) {
            return { success: false, message: '计量单位不存在' };
        }
        units.splice(index, 1);
        storage.set('units', units);
        return { success: true, message: '计量单位删除成功' };
    },
    
    // 获取送签状态
    getStatuses() {
        return storage.get('statuses', []);
    },
    
    // 添加送签状态
    addStatus(status) {
        const statuses = this.getStatuses();
        if (statuses.includes(status)) {
            return { success: false, message: '送签状态已存在' };
        }
        statuses.push(status);
        storage.set('statuses', statuses);
        return { success: true, message: '送签状态添加成功' };
    },
    
    // 删除送签状态
    deleteStatus(status) {
        const statuses = this.getStatuses();
        const index = statuses.indexOf(status);
        if (index === -1) {
            return { success: false, message: '送签状态不存在' };
        }
        statuses.splice(index, 1);
        storage.set('statuses', statuses);
        return { success: true, message: '送签状态删除成功' };
    }
};

/**
 * 日志管理
 */
const logManager = {
    // 添加操作日志
    addLog(username, action) {
        const logs = storage.get('logs', []);
        const newLog = {
            id: generateId(),
            username,
            action,
            timestamp: new Date().toISOString()
        };
        logs.unshift(newLog); // 添加到开头
        storage.set('logs', logs);
        return newLog;
    },
    
    // 获取操作日志
    getLogs(limit = 100) {
        const logs = storage.get('logs', []);
        return logs.slice(0, limit);
    },
    
    // 清空操作日志
    clearLogs() {
        storage.set('logs', []);
        return { success: true, message: '操作日志已清空' };
    }
};

/**
 * 初始化系统数据
 */
initSystemData();