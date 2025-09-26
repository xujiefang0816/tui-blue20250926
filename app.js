// 主应用逻辑

// 当前登录用户
let currentUser = null;

// 当前页码
let currentPage = 1;
let processingCurrentPage = 1;
const pageSize = 10;

// 初始化应用
function initApp() {
    // 初始化日期控件默认值为今天
    const today = formatDate(new Date(), 'yyyy-MM-dd');
    document.getElementById('registration-date').value = today;
    
    // 初始化下拉框数据
    loadDropdownData();
    
    // 绑定事件处理函数
    bindEventListeners();
    
    // 检查是否有用户已登录
    checkLoginStatus();
}

// 加载下拉框数据
function loadDropdownData() {
    // 加载文件类型
    const fileTypes = configManager.getFileTypes();
    populateDropdown('file-type', fileTypes);
    populateDropdown('filter-file-type', fileTypes, true);
    populateDropdown('process-filter-file-type', fileTypes, true);
    populateDropdown('edit-file-type', fileTypes);
    
    // 加载部门
    const departments = configManager.getDepartments();
    populateDropdown('department', departments);
    populateDropdown('filter-department', departments, true);
    populateDropdown('process-filter-department', departments, true);
    populateDropdown('edit-department', departments);
    
    // 加载计量单位
    const units = configManager.getUnits();
    populateDropdown('unit', units);
    populateDropdown('edit-unit', units);
    
    // 加载送签状态
    const statuses = configManager.getStatuses();
    populateDropdown('filter-status', statuses, true);
    populateDropdown('process-filter-status', statuses, true);
    populateDropdown('edit-status', statuses);
    populateDropdown('batch-status', statuses);
}

// 填充下拉框
function populateDropdown(selectId, items, includeEmpty = false) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // 清空下拉框
    select.innerHTML = '';
    
    // 添加空选项
    if (includeEmpty) {
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '全部';
        select.appendChild(emptyOption);
    }
    
    // 添加选项
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

// 绑定事件监听器
function bindEventListeners() {
    // 登录表单提交
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // 修改密码按钮
    document.getElementById('change-password-btn').addEventListener('click', showChangePasswordModal);
    document.getElementById('cancel-change-password').addEventListener('click', hideChangePasswordModal);
    document.getElementById('change-password-form').addEventListener('submit', handleChangePassword);
    
    // 退出登录
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // 底部菜单点击
    document.getElementById('menu-file-registration').addEventListener('click', () => showPage('file-registration-page'));
    document.getElementById('menu-file-info').addEventListener('click', () => {
        showPage('file-info-page');
        loadFileInfoList();
    });
    document.getElementById('menu-file-processing').addEventListener('click', () => {
        showPage('file-processing-page');
        loadFileProcessingList();
    });
    document.getElementById('menu-system-settings').addEventListener('click', () => {
        showPage('system-settings-page');
        loadSystemSettings();
    });
    
    // 文件登记表单
    document.getElementById('file-registration-form').addEventListener('submit', handleFileRegistration);
    document.getElementById('file-type').addEventListener('change', handleFileTypeChange);
    document.getElementById('period-single').addEventListener('change', handlePeriodTypeChange);
    document.getElementById('period-range').addEventListener('change', handlePeriodTypeChange);
    
    // 文件信息页面
    document.getElementById('refresh-file-info').addEventListener('click', loadFileInfoList);
    document.getElementById('apply-filters').addEventListener('click', loadFileInfoList);
    document.getElementById('reset-filters').addEventListener('click', resetFileInfoFilters);
    document.getElementById('prev-page').addEventListener('click', () => { if (currentPage > 1) { currentPage--; loadFileInfoList(); } });
    document.getElementById('next-page').addEventListener('click', () => { currentPage++; loadFileInfoList(); });
    
    // 文件处理页面
    document.getElementById('refresh-file-processing').addEventListener('click', loadFileProcessingList);
    document.getElementById('export-excel').addEventListener('click', handleExportExcel);
    document.getElementById('batch-delete').addEventListener('click', handleBatchDelete);
    document.getElementById('batch-update-status').addEventListener('click', showBatchStatusModal);
    document.getElementById('process-apply-filters').addEventListener('click', loadFileProcessingList);
    document.getElementById('process-reset-filters').addEventListener('click', resetFileProcessingFilters);
    document.getElementById('process-prev-page').addEventListener('click', () => { if (processingCurrentPage > 1) { processingCurrentPage--; loadFileProcessingList(); } });
    document.getElementById('process-next-page').addEventListener('click', () => { processingCurrentPage++; loadFileProcessingList(); });
    document.getElementById('select-all').addEventListener('change', handleSelectAll);
    
    // 批量修改状态模态框
    document.getElementById('cancel-batch-status').addEventListener('click', hideBatchStatusModal);
    document.getElementById('batch-status-form').addEventListener('submit', handleBatchStatusUpdate);
    document.getElementById('batch-status').addEventListener('change', handleBatchStatusChange);
    
    // 编辑文件模态框
    document.getElementById('cancel-edit-file').addEventListener('click', hideEditFileModal);
    document.getElementById('edit-file-form').addEventListener('submit', handleEditFile);
    document.getElementById('edit-status').addEventListener('change', handleEditStatusChange);
    
    // 系统设置页面
    document.getElementById('add-file-type').addEventListener('click', () => showAddTypeModal('fileType', '添加文件类型'));
    document.getElementById('add-department').addEventListener('click', () => showAddTypeModal('department', '添加部门'));
    document.getElementById('add-unit').addEventListener('click', () => showAddTypeModal('unit', '添加计量单位'));
    document.getElementById('add-status').addEventListener('click', () => showAddTypeModal('status', '添加送签状态'));
    document.getElementById('add-account').addEventListener('click', showAddAccountModal);
    document.getElementById('cancel-add-type').addEventListener('click', hideAddTypeModal);
    document.getElementById('add-type-form').addEventListener('submit', handleAddType);
    document.getElementById('cancel-add-account').addEventListener('click', hideAddAccountModal);
    document.getElementById('add-account-form').addEventListener('submit', handleAddAccount);
    document.getElementById('cancel-edit-account').addEventListener('click', hideEditAccountModal);
    document.getElementById('edit-account-form').addEventListener('submit', handleEditAccount);
    
    // 关闭提示消息
    document.getElementById('toast-close').addEventListener('click', hideToast);
}

// 检查登录状态
function checkLoginStatus() {
    const savedUser = storage.get('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        showApp();
    } else {
        showLoginPage();
    }
}

// 显示登录页面
function showLoginPage() {
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

// 显示应用
function showApp() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    document.getElementById('current-username').textContent = currentUser.username;
    
    // 根据用户权限显示菜单
    updateMenuByRole(currentUser.role);
    
    // 显示默认页面
    showPage('file-registration-page');
    
    // 记录登录日志
    logManager.addLog(currentUser.username, '用户登录');
    
    // 检查是否需要修改密码
    if (currentUser.mustChangePassword) {
        showToast('首次登录，请修改密码', 'warning', 5000);
        setTimeout(() => showChangePasswordModal(), 1000);
    }
}

// 根据用户角色更新菜单
function updateMenuByRole(role) {
    const fileProcessingBtn = document.getElementById('menu-file-processing');
    const systemSettingsBtn = document.getElementById('menu-system-settings');
    
    switch (role) {
        case 'superadmin':
            fileProcessingBtn.classList.remove('hidden');
            systemSettingsBtn.classList.remove('hidden');
            break;
        case 'admin':
            fileProcessingBtn.classList.remove('hidden');
            systemSettingsBtn.classList.add('hidden');
            break;
        case 'user':
        default:
            fileProcessingBtn.classList.add('hidden');
            systemSettingsBtn.classList.add('hidden');
            break;
    }
}

// 显示指定页面
function showPage(pageId) {
    // 隐藏所有页面
    const pages = [
        'file-registration-page',
        'file-info-page',
        'file-processing-page',
        'system-settings-page'
    ];
    
    pages.forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    
    // 显示指定页面
    document.getElementById(pageId).classList.remove('hidden');
    
    // 高亮当前菜单
    const menuButtons = [
        'menu-file-registration',
        'menu-file-info',
        'menu-file-processing',
        'menu-system-settings'
    ];
    
    menuButtons.forEach(id => {
        const button = document.getElementById(id);
        if (button) {
            button.classList.remove('text-primary');
            button.classList.add('text-gray-600');
        }
    });
    
    // 找到对应的菜单按钮并高亮
    const menuMap = {
        'file-registration-page': 'menu-file-registration',
        'file-info-page': 'menu-file-info',
        'file-processing-page': 'menu-file-processing',
        'system-settings-page': 'menu-system-settings'
    };
    
    const menuId = menuMap[pageId];
    if (menuId) {
        const menuButton = document.getElementById(menuId);
        if (menuButton) {
            menuButton.classList.remove('text-gray-600');
            menuButton.classList.add('text-primary');
        }
    }
}

// 处理登录
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const result = userManager.validateUser(username, password);
    
    if (result.valid) {
        currentUser = result.user;
        storage.set('currentUser', currentUser);
        showApp();
        showToast('登录成功', 'success');
    } else {
        showToast(result.message, 'error');
    }
}

// 处理退出登录
function handleLogout() {
    storage.remove('currentUser');
    currentUser = null;
    showLoginPage();
    showToast('已退出登录', 'info');
}

// 显示修改密码模态框
function showChangePasswordModal() {
    document.getElementById('change-password-modal').classList.remove('hidden');
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
}

// 隐藏修改密码模态框
function hideChangePasswordModal() {
    document.getElementById('change-password-modal').classList.add('hidden');
}

// 处理修改密码
function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // 验证两次输入的密码是否一致
    if (newPassword !== confirmPassword) {
        showToast('两次输入的新密码不一致', 'error');
        return;
    }
    
    // 当前用户可能是登录页面的用户或已登录用户
    const username = currentUser ? currentUser.username : document.getElementById('username').value;
    
    const result = userManager.changePassword(username, currentPassword, newPassword);
    
    if (result.success) {
        hideChangePasswordModal();
        showToast(result.message, 'success');
        
        // 更新当前用户信息
        if (currentUser) {
            currentUser.password = newPassword;
            currentUser.mustChangePassword = false;
            storage.set('currentUser', currentUser);
        }
        
        // 记录日志
        logManager.addLog(username, '修改密码');
    } else {
        showToast(result.message, 'error');
    }
}

// 处理文件类型变化
function handleFileTypeChange() {
    const fileType = document.getElementById('file-type').value;
    const summarySection = document.getElementById('summary-section');
    const fileContent = document.getElementById('file-content');
    
    // 检查是否需要显示摘要部分
    if (fileType === '付款申请单' || fileType === '付款单+用印审批（仅限验收报告）') {
        summarySection.classList.remove('hidden');
        fileContent.placeholder = '摘要将自动生成到此处';
        fileContent.disabled = true;
    } else {
        summarySection.classList.add('hidden');
        fileContent.placeholder = '请输入文件内容';
        fileContent.disabled = false;
    }
}

// 处理期间类型变化
function handlePeriodTypeChange() {
    const singlePeriod = document.getElementById('period-single').checked;
    document.getElementById('period-single-container').classList.toggle('hidden', !singlePeriod);
    document.getElementById('period-range-container').classList.toggle('hidden', singlePeriod);
}

// 处理文件登记
function handleFileRegistration(e) {
    e.preventDefault();
    
    const date = document.getElementById('registration-date').value;
    const fileType = document.getElementById('file-type').value;
    const department = document.getElementById('department').value;
    const applicant = document.getElementById('applicant').value;
    const unit = document.getElementById('unit').value;
    const quantity = document.getElementById('quantity').value;
    const amount = document.getElementById('amount').value;
    
    // 验证必填字段
    if (!date || !fileType || !department || !applicant) {
        showToast('请填写必填字段', 'error');
        return;
    }
    
    // 处理摘要情况
    let fileContent = document.getElementById('file-content').value;
    
    if (fileType === '付款申请单' || fileType === '付款单+用印审批（仅限验收报告）') {
        const summaryType = document.getElementById('summary-type').value;
        const summaryContent = document.getElementById('summary-content').value;
        
        let periodText = '';
        if (document.getElementById('period-single').checked) {
            // 如果是单期间，尝试获取值（考虑到HTML中可能有问题，这里做个健壮性处理）
            let periodSingle = '';
            try {
                periodSingle = document.getElementById('period-single-value').value;
            } catch (e) {
                // 如果获取失败，尝试其他可能的字段
                try {
                    periodSingle = document.getElementById('period-start').value;
                } catch (e) {
                    console.warn('无法获取期间值');
                }
            }
            
            if (periodSingle) {
                const [year, month] = periodSingle.split('-');
                periodText = `${year}年${month}月`;
            }
        } else {
            // 期间区间
            let periodStart = '';
            let periodEnd = '';
            
            try {
                periodStart = document.getElementById('period-start').value;
                periodEnd = document.getElementById('period-end').value;
            } catch (e) {
                console.warn('无法获取期间区间值');
            }
            
            if (periodStart && periodEnd) {
                const [startYear, startMonth] = periodStart.split('-');
                const [endYear, endMonth] = periodEnd.split('-');
                periodText = `${startYear}年${startMonth}月-${endYear}年${endMonth}月`;
            }
        }
        
        const paymentUnit = document.getElementById('payment-unit').value;
        
        // 生成摘要 - 根据要求的格式
        const parts = [];
        if (summaryType) parts.push(summaryType);
        if (summaryContent) parts.push(summaryContent);
        
        // 期间和单位简称用--连接，并外加括号
        const periodUnitPart = [];
        if (periodText) periodUnitPart.push(periodText);
        if (paymentUnit) periodUnitPart.push(paymentUnit);
        
        if (periodUnitPart.length > 0) {
            parts.push(`(${periodUnitPart.join('--')})`);
        }
        
        fileContent = parts.join(' ');
    }
    
    // 准备文件数据
    const fileData = {
        date,
        fileType,
        department,
        applicant,
        fileContent,
        unit: unit || '/',
        quantity: quantity ? Number(quantity) : 0,
        amount: amount ? Number(amount) : 0
    };
    
    // 提交文件
    const result = fileManager.addFile(fileData);
    
    if (result.success) {
        // 清空表单
        document.getElementById('file-registration-form').reset();
        document.getElementById('registration-date').value = formatDate(new Date(), 'yyyy-MM-dd');
        
        showToast(result.message, 'success');
        
        // 记录日志
        logManager.addLog(currentUser.username, `提交文件: ${fileType}`);
    } else {
        showToast(result.message, 'error');
    }
}

// 加载文件信息列表
function loadFileInfoList() {
    // 获取筛选条件
    const filters = getFileInfoFilters();
    
    // 搜索文件
    const files = fileManager.searchFiles(filters);
    
    // 分页
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedFiles = files.slice(startIndex, endIndex);
    
    // 更新表格
    updateFileInfoTable(paginatedFiles);
    
    // 更新分页信息
    updateFileInfoPagination(files.length);
}

// 获取文件信息筛选条件
function getFileInfoFilters() {
    return {
        keyword: document.getElementById('search-keyword').value,
        fileType: document.getElementById('filter-file-type').value,
        department: document.getElementById('filter-department').value,
        applicant: document.getElementById('filter-applicant').value,
        status: document.getElementById('filter-status').value,
        dateStart: document.getElementById('filter-date-start').value,
        dateEnd: document.getElementById('filter-date-end').value
    };
}

// 重置文件信息筛选条件
function resetFileInfoFilters() {
    document.getElementById('search-keyword').value = '';
    document.getElementById('filter-file-type').value = '';
    document.getElementById('filter-department').value = '';
    document.getElementById('filter-applicant').value = '';
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-date-start').value = '';
    document.getElementById('filter-date-end').value = '';
    
    currentPage = 1;
    loadFileInfoList();
}

// 更新文件信息表格
function updateFileInfoTable(files) {
    const tableBody = document.getElementById('file-info-table-body');
    tableBody.innerHTML = '';
    
    if (files.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="13" class="px-6 py-4 text-center text-gray-500">暂无数据</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    files.forEach(file => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-smooth';
        
        // 格式化数量显示
        const quantityDisplay = file.quantity === 0 ? '/' : file.quantity;
        
        // 格式化状态显示
        let statusClass = '';
        switch (file.status) {
            case '完毕':
                statusClass = 'status-completed';
                break;
            case '退回':
                statusClass = 'status-rejected';
                break;
            case '酒店内部走签':
            case '待送集团':
                statusClass = 'status-pending';
                break;
            default:
                statusClass = 'status-processing';
        }
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${file.date}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${file.fileType}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${file.fileNumber || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${file.department}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${file.applicant}</td>
            <td class="px-6 py-4 text-sm text-gray-800 max-w-xs truncate" title="${file.fileContent}">${file.fileContent}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${file.unit}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${quantityDisplay}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${formatAmount(file.amount)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${file.endDate || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="status-badge ${statusClass}">${file.status}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${file.statusUpdateTime ? formatDate(new Date(file.statusUpdateTime), 'yyyy-MM-dd HH:mm:ss') : '-'}</td>
            <td class="px-6 py-4 text-sm text-gray-800 max-w-xs truncate" title="${file.rejectReason || ''}">${file.rejectReason || '-'}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// 更新文件信息分页
function updateFileInfoPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    
    document.getElementById('showing-start').textContent = startItem;
    document.getElementById('showing-end').textContent = endItem;
    document.getElementById('total-items').textContent = totalItems;
    
    document.getElementById('prev-page').disabled = currentPage <= 1;
    document.getElementById('next-page').disabled = currentPage >= totalPages;
}

// 加载文件处理列表
function loadFileProcessingList() {
    // 获取筛选条件
    const filters = getFileProcessingFilters();
    
    // 搜索文件
    const files = fileManager.searchFiles(filters);
    
    // 分页
    const startIndex = (processingCurrentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedFiles = files.slice(startIndex, endIndex);
    
    // 更新表格
    updateFileProcessingTable(paginatedFiles);
    
    // 更新分页信息
    updateFileProcessingPagination(files.length);
}

// 获取文件处理筛选条件
function getFileProcessingFilters() {
    return {
        keyword: document.getElementById('process-search-keyword').value,
        fileType: document.getElementById('process-filter-file-type').value,
        department: document.getElementById('process-filter-department').value,
        applicant: document.getElementById('process-filter-applicant').value,
        status: document.getElementById('process-filter-status').value,
        dateStart: document.getElementById('process-filter-date-start').value,
        dateEnd: document.getElementById('process-filter-date-end').value
    };
}

// 重置文件处理筛选条件
function resetFileProcessingFilters() {
    document.getElementById('process-search-keyword').value = '';
    document.getElementById('process-filter-file-type').value = '';
    document.getElementById('process-filter-department').value = '';
    document.getElementById('process-filter-applicant').value = '';
    document.getElementById('process-filter-status').value = '';
    document.getElementById('process-filter-date-start').value = '';
    document.getElementById('process-filter-date-end').value = '';
    
    processingCurrentPage = 1;
    loadFileProcessingList();
}

// 更新文件处理表格
function updateFileProcessingTable(files) {
    const tableBody = document.getElementById('file-processing-table-body');
    tableBody.innerHTML = '';
    
    if (files.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="14" class="px-6 py-4 text-center text-gray-500">暂无数据</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    files.forEach(file => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-smooth';
        
        // 格式化数量显示
        const quantityDisplay = file.quantity === 0 ? '/' : file.quantity;
        
        // 格式化状态显示
        let statusClass = '';
        switch (file.status) {
            case '完毕':
                statusClass = 'status-completed';
                break;
            case '退回':
                statusClass = 'status-rejected';
                break;
            case '酒店内部走签':
            case '待送集团':
                statusClass = 'status-pending';
                break;
            default:
                statusClass = 'status-processing';
        }
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <input type="checkbox" class="file-checkbox rounded text-primary focus:ring-primary" data-id="${file.id}">
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${file.date}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${file.fileType}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${file.fileNumber || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${file.department}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${file.applicant}</td>
            <td class="px-6 py-4 text-sm text-gray-800 max-w-xs truncate" title="${file.fileContent}">${file.fileContent}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${file.unit}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${quantityDisplay}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${formatAmount(file.amount)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${file.endDate || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="status-badge ${statusClass}">${file.status}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-primary hover:text-primary/80 mr-3 edit-file-btn" data-id="${file.id}">编辑</button>
                <button class="text-red-600 hover:text-red-800 delete-file-btn" data-id="${file.id}">删除</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 绑定编辑和删除按钮事件
    document.querySelectorAll('.edit-file-btn').forEach(btn => {
        btn.addEventListener('click', () => editFile(btn.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.delete-file-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteFile(btn.getAttribute('data-id')));
    });
    
    // 绑定复选框事件
    document.querySelectorAll('.file-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleFileCheckboxChange);
    });
}

// 更新文件处理分页
function updateFileProcessingPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = totalItems > 0 ? (processingCurrentPage - 1) * pageSize + 1 : 0;
    const endItem = Math.min(processingCurrentPage * pageSize, totalItems);
    
    document.getElementById('process-showing-start').textContent = startItem;
    document.getElementById('process-showing-end').textContent = endItem;
    document.getElementById('process-total-items').textContent = totalItems;
    
    document.getElementById('process-prev-page').disabled = processingCurrentPage <= 1;
    document.getElementById('process-next-page').disabled = processingCurrentPage >= totalPages;
}

// 处理文件复选框变化
function handleFileCheckboxChange() {
    updateSelectAllCheckbox();
}

// 处理全选
function handleSelectAll() {
    const selectAllCheckbox = document.getElementById('select-all');
    const fileCheckboxes = document.querySelectorAll('.file-checkbox');
    
    fileCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

// 更新全选复选框状态
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('select-all');
    const fileCheckboxes = document.querySelectorAll('.file-checkbox');
    const checkedCheckboxes = document.querySelectorAll('.file-checkbox:checked');
    
    selectAllCheckbox.checked = fileCheckboxes.length > 0 && fileCheckboxes.length === checkedCheckboxes.length;
}

// 获取选中的文件ID
function getSelectedFileIds() {
    const checkedCheckboxes = document.querySelectorAll('.file-checkbox:checked');
    return Array.from(checkedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));
}

// 编辑文件
function editFile(fileId) {
    const file = fileManager.getFileById(fileId);
    if (!file) {
        showToast('文件不存在', 'error');
        return;
    }
    
    // 填充表单
    document.getElementById('edit-file-id').value = file.id;
    document.getElementById('edit-date').value = file.date;
    document.getElementById('edit-file-type').value = file.fileType || '';
    document.getElementById('edit-file-number').value = file.fileNumber || '';
    document.getElementById('edit-department').value = file.department || '';
    document.getElementById('edit-applicant').value = file.applicant || '';
    document.getElementById('edit-file-content').value = file.fileContent || '';
    document.getElementById('edit-unit').value = file.unit || '';
    document.getElementById('edit-quantity').value = file.quantity || '';
    document.getElementById('edit-amount').value = file.amount || '';
    document.getElementById('edit-status').value = file.status || '';
    document.getElementById('edit-end-date').value = file.endDate || '';
    document.getElementById('edit-reject-reason').value = file.rejectReason || '';
    
    // 处理退回原因显示
    handleEditStatusChange();
    
    // 显示模态框
    document.getElementById('edit-file-modal').classList.remove('hidden');
}

// 处理编辑状态变化
function handleEditStatusChange() {
    const status = document.getElementById('edit-status').value;
    const rejectReasonContainer = document.getElementById('edit-reject-reason-container');
    
    if (status === '退回') {
        rejectReasonContainer.classList.remove('hidden');
    } else {
        rejectReasonContainer.classList.add('hidden');
    }
}

// 隐藏编辑文件模态框
function hideEditFileModal() {
    document.getElementById('edit-file-modal').classList.add('hidden');
}

// 处理编辑文件
function handleEditFile(e) {
    e.preventDefault();
    
    const fileId = document.getElementById('edit-file-id').value;
    const date = document.getElementById('edit-date').value;
    const fileType = document.getElementById('edit-file-type').value;
    const fileNumber = document.getElementById('edit-file-number').value;
    const department = document.getElementById('edit-department').value;
    const applicant = document.getElementById('edit-applicant').value;
    const fileContent = document.getElementById('edit-file-content').value;
    const unit = document.getElementById('edit-unit').value;
    const quantity = document.getElementById('edit-quantity').value;
    const amount = document.getElementById('edit-amount').value;
    const status = document.getElementById('edit-status').value;
    const endDate = document.getElementById('edit-end-date').value;
    const rejectReason = document.getElementById('edit-reject-reason').value;
    
    // 验证必填字段
    if (!date || !fileType || !department || !applicant || !fileContent) {
        showToast('请填写必填字段', 'error');
        return;
    }
    
    // 准备更新数据
    const updateData = {
        date,
        fileType,
        fileNumber,
        department,
        applicant,
        fileContent,
        unit: unit || '/',
        quantity: quantity ? Number(quantity) : 0,
        amount: amount ? Number(amount) : 0,
        status
    };
    
    // 如果状态是退回，添加退回原因
    if (status === '退回' && rejectReason) {
        updateData.rejectReason = rejectReason;
    } else {
        updateData.rejectReason = null;
    }
    
    // 提交更新
    const result = fileManager.updateFile(fileId, updateData);
    
    if (result.success) {
        hideEditFileModal();
        loadFileProcessingList();
        showToast(result.message, 'success');
        
        // 记录日志
        logManager.addLog(currentUser.username, `编辑文件: ${fileType}`);
    } else {
        showToast(result.message, 'error');
    }
}

// 删除文件
function deleteFile(fileId) {
    showConfirm('确定要删除这条文件信息吗？此操作不可恢复。', () => {
        const result = fileManager.deleteFile(fileId);
        
        if (result.success) {
            loadFileProcessingList();
            showToast(result.message, 'success');
            
            // 记录日志
            logManager.addLog(currentUser.username, '删除文件');
        } else {
            showToast(result.message, 'error');
        }
    });
}

// 处理批量删除
function handleBatchDelete() {
    const selectedIds = getSelectedFileIds();
    
    if (selectedIds.length === 0) {
        showToast('请选择要删除的文件', 'warning');
        return;
    }
    
    showConfirm(`确定要删除选中的 ${selectedIds.length} 条文件信息吗？此操作不可恢复。`, () => {
        const result = fileManager.batchDeleteFiles(selectedIds);
        
        if (result.success) {
            loadFileProcessingList();
            showToast(result.message, 'success');
            
            // 记录日志
            logManager.addLog(currentUser.username, `批量删除文件，共 ${selectedIds.length} 条`);
        } else {
            showToast(result.message, 'error');
        }
    });
}

// 显示批量修改状态模态框
function showBatchStatusModal() {
    const selectedIds = getSelectedFileIds();
    
    if (selectedIds.length === 0) {
        showToast('请选择要修改状态的文件', 'warning');
        return;
    }
    
    // 重置表单
    document.getElementById('batch-status').value = '';
    document.getElementById('batch-reject-reason').value = '';
    document.getElementById('batch-reject-reason-container').classList.add('hidden');
    
    // 显示模态框
    document.getElementById('batch-status-modal').classList.remove('hidden');
}

// 隐藏批量修改状态模态框
function hideBatchStatusModal() {
    document.getElementById('batch-status-modal').classList.add('hidden');
}

// 处理批量状态变化
function handleBatchStatusChange() {
    const status = document.getElementById('batch-status').value;
    const rejectReasonContainer = document.getElementById('batch-reject-reason-container');
    
    if (status === '退回') {
        rejectReasonContainer.classList.remove('hidden');
    } else {
        rejectReasonContainer.classList.add('hidden');
    }
}

// 处理批量更新状态
function handleBatchStatusUpdate(e) {
    e.preventDefault();
    
    const selectedIds = getSelectedFileIds();
    const status = document.getElementById('batch-status').value;
    const rejectReason = document.getElementById('batch-reject-reason').value;
    
    // 验证必填字段
    if (!status) {
        showToast('请选择送签状态', 'error');
        return;
    }
    
    // 如果状态是退回，验证退回原因
    if (status === '退回' && !rejectReason) {
        showToast('请填写退回原因', 'error');
        return;
    }
    
    // 提交更新
    const result = fileManager.batchUpdateFileStatus(selectedIds, status, rejectReason);
    
    if (result.success) {
        hideBatchStatusModal();
        loadFileProcessingList();
        showToast(result.message, 'success');
        
        // 记录日志
        logManager.addLog(currentUser.username, `批量更新文件状态为: ${status}`);
    } else {
        showToast(result.message, 'error');
    }
}

// 处理导出Excel
function handleExportExcel() {
    // 创建临时表格用于导出
    const tempTable = document.createElement('table');
    
    // 复制当前表格的内容
    const originalTable = document.querySelector('#file-processing-page table');
    if (originalTable) {
        tempTable.innerHTML = originalTable.innerHTML;
        
        // 移除操作列和复选框列
        const rows = tempTable.querySelectorAll('tr');
        rows.forEach(row => {
            // 移除复选框列
            if (row.firstElementChild && row.firstElementChild.querySelector('input[type="checkbox"]')) {
                row.removeChild(row.firstElementChild);
            }
            
            // 移除操作列
            if (row.lastElementChild && row.lastElementChild.querySelector('button')) {
                row.removeChild(row.lastElementChild);
            }
        });
        
        // 将表格添加到页面
        document.body.appendChild(tempTable);
        
        // 导出Excel
        try {
            // 这里使用SheetJS库来导出Excel
            // 由于SheetJS库可能没有在utils.js中正确引入，这里使用简单的CSV导出作为备用
            const ws = XLSX.utils.table_to_sheet(tempTable);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            XLSX.writeFile(wb, `文件信息_${formatDate(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
            
            showToast('导出成功', 'success');
            
            // 记录日志
            logManager.addLog(currentUser.username, '导出Excel文件');
        } catch (error) {
            console.error('导出Excel失败:', error);
            // 降级为CSV导出
            exportToCSV(tempTable);
        }
        
        // 移除临时表格
        document.body.removeChild(tempTable);
    } else {
        showToast('没有找到表格数据', 'error');
    }
}

// 导出为CSV文件
function exportToCSV(table) {
    const rows = Array.from(table.querySelectorAll('tr'));
    const csvContent = rows
        .map(row => {
            const cells = Array.from(row.querySelectorAll('td, th'));
            return cells
                .map(cell => {
                    const text = cell.textContent.trim();
                    // 处理包含逗号或引号的内容
                    return text.includes(',') || text.includes('"') || text.includes('\n')
                        ? `"${text.replace(/"/g, '""')}"`
                        : text;
                })
                .join(',');
        })
        .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `文件信息_${formatDate(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('导出CSV成功', 'success');
    } else {
        showToast('浏览器不支持导出功能', 'error');
    }
}

// 加载系统设置
function loadSystemSettings() {
    // 加载文件类型
    loadConfigItems('fileTypes', 'file-types-container', 'fileType');
    
    // 加载部门
    loadConfigItems('departments', 'departments-container', 'department');
    
    // 加载计量单位
    loadConfigItems('units', 'units-container', 'unit');
    
    // 加载送签状态
    loadConfigItems('statuses', 'statuses-container', 'status');
    
    // 加载账号列表
    loadAccountsList();
    
    // 加载操作日志
    loadLogsList();
}

// 加载配置项
function loadConfigItems(configType, containerId, itemType) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    let items = [];
    switch (configType) {
        case 'fileTypes':
            items = configManager.getFileTypes();
            break;
        case 'departments':
            items = configManager.getDepartments();
            break;
        case 'units':
            items = configManager.getUnits();
            break;
        case 'statuses':
            items = configManager.getStatuses();
            break;
    }
    
    if (items.length === 0) {
        container.innerHTML = '<p class="text-gray-500 col-span-full text-center py-4">暂无数据</p>';
        return;
    }
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'flex items-center justify-between p-2 border rounded-lg';
        
        itemElement.innerHTML = `
            <span class="text-sm text-gray-800">${item}</span>
            <button class="text-red-500 hover:text-red-700 delete-config-item" data-type="${itemType}" data-value="${item}">
                <i class="fa fa-trash"></i>
            </button>
        `;
        
        container.appendChild(itemElement);
    });
    
    // 绑定删除按钮事件
    document.querySelectorAll('.delete-config-item').forEach(btn => {
        btn.addEventListener('click', deleteConfigItem);
    });
}

// 删除配置项
function deleteConfigItem() {
    const type = this.getAttribute('data-type');
    const value = this.getAttribute('data-value');
    
    showConfirm(`确定要删除 "${value}" 吗？`, () => {
        let result;
        
        switch (type) {
            case 'fileType':
                result = configManager.deleteFileType(value);
                break;
            case 'department':
                result = configManager.deleteDepartment(value);
                break;
            case 'unit':
                result = configManager.deleteUnit(value);
                break;
            case 'status':
                result = configManager.deleteStatus(value);
                break;
        }
        
        if (result.success) {
            loadSystemSettings();
            loadDropdownData(); // 重新加载所有下拉框数据
            showToast(result.message, 'success');
            
            // 记录日志
            logManager.addLog(currentUser.username, `删除${getConfigTypeLabel(type)}: ${value}`);
        } else {
            showToast(result.message, 'error');
        }
    });
}

// 获取配置类型标签
function getConfigTypeLabel(type) {
    const labels = {
        'fileType': '文件类型',
        'department': '部门',
        'unit': '计量单位',
        'status': '送签状态'
    };
    
    return labels[type] || type;
}

// 显示添加类型模态框
function showAddTypeModal(type, title) {
    document.getElementById('add-type-modal-title').textContent = title;
    document.getElementById('add-type-modal-type').value = type;
    document.getElementById('add-type-value').value = '';
    
    document.getElementById('add-type-modal').classList.remove('hidden');
}

// 隐藏添加类型模态框
function hideAddTypeModal() {
    document.getElementById('add-type-modal').classList.add('hidden');
}

// 处理添加类型
function handleAddType(e) {
    e.preventDefault();
    
    const type = document.getElementById('add-type-modal-type').value;
    const value = document.getElementById('add-type-value').value.trim();
    
    if (!value) {
        showToast('请输入名称', 'error');
        return;
    }
    
    let result;
    
    switch (type) {
        case 'fileType':
            result = configManager.addFileType(value);
            break;
        case 'department':
            result = configManager.addDepartment(value);
            break;
        case 'unit':
            result = configManager.addUnit(value);
            break;
        case 'status':
            result = configManager.addStatus(value);
            break;
    }
    
    if (result.success) {
        hideAddTypeModal();
        loadSystemSettings();
        loadDropdownData(); // 重新加载所有下拉框数据
        showToast(result.message, 'success');
        
        // 记录日志
        logManager.addLog(currentUser.username, `添加${getConfigTypeLabel(type)}: ${value}`);
    } else {
        showToast(result.message, 'error');
    }
}

// 加载账号列表
function loadAccountsList() {
    const accounts = userManager.getAllUsers();
    const tableBody = document.getElementById('accounts-table-body');
    
    tableBody.innerHTML = '';
    
    if (accounts.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="3" class="px-6 py-4 text-center text-gray-500">暂无账号</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    accounts.forEach(account => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-smooth';
        
        // 获取角色标签
        let roleLabel = '';
        switch (account.role) {
            case 'superadmin':
                roleLabel = '总管理员';
                break;
            case 'admin':
                roleLabel = '普通管理员';
                break;
            case 'user':
                roleLabel = '普通账号';
                break;
        }
        
        // 是否可以编辑和删除
        const canEdit = currentUser.role === 'superadmin' && account.role !== 'superadmin';
        const canDelete = currentUser.role === 'superadmin' && account.role !== 'superadmin';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${account.username}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${roleLabel}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                ${canEdit ? `<button class="text-primary hover:text-primary/80 mr-3 edit-account-btn" data-username="${account.username}">编辑</button>` : ''}
                ${canDelete ? `<button class="text-red-600 hover:text-red-800 delete-account-btn" data-username="${account.username}">删除</button>` : ''}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 绑定编辑和删除按钮事件
    document.querySelectorAll('.edit-account-btn').forEach(btn => {
        btn.addEventListener('click', () => editAccount(btn.getAttribute('data-username')));
    });
    
    document.querySelectorAll('.delete-account-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteAccount(btn.getAttribute('data-username')));
    });
}

// 显示添加账号模态框
function showAddAccountModal() {
    document.getElementById('add-account-username').value = '';
    document.getElementById('add-account-password').value = '';
    document.getElementById('add-account-confirm-password').value = '';
    document.getElementById('add-account-role').value = 'user';
    
    document.getElementById('add-account-modal').classList.remove('hidden');
}

// 隐藏添加账号模态框
function hideAddAccountModal() {
    document.getElementById('add-account-modal').classList.add('hidden');
}

// 处理添加账号
function handleAddAccount(e) {
    e.preventDefault();
    
    const username = document.getElementById('add-account-username').value.trim();
    const password = document.getElementById('add-account-password').value;
    const confirmPassword = document.getElementById('add-account-confirm-password').value;
    const role = document.getElementById('add-account-role').value;
    
    // 验证必填字段
    if (!username || !password || !confirmPassword) {
        showToast('请填写所有必填字段', 'error');
        return;
    }
    
    // 验证两次输入的密码是否一致
    if (password !== confirmPassword) {
        showToast('两次输入的密码不一致', 'error');
        return;
    }
    
    // 验证用户权限
    if (currentUser.role !== 'superadmin') {
        showToast('只有总管理员可以添加账号', 'error');
        return;
    }
    
    // 添加账号
    const result = userManager.addUser(username, password, role);
    
    if (result.success) {
        hideAddAccountModal();
        loadAccountsList();
        showToast(result.message, 'success');
        
        // 记录日志
        logManager.addLog(currentUser.username, `添加账号: ${username}，权限: ${role}`);
    } else {
        showToast(result.message, 'error');
    }
}

// 编辑账号
function editAccount(username) {
    const account = userManager.getUserByUsername(username);
    if (!account) {
        showToast('账号不存在', 'error');
        return;
    }
    
    // 填充表单
    document.getElementById('edit-account-id').value = account.id;
    document.getElementById('edit-account-username').value = account.username;
    document.getElementById('edit-account-role').value = account.role;
    
    // 显示模态框
    document.getElementById('edit-account-modal').classList.remove('hidden');
}

// 隐藏编辑账号模态框
function hideEditAccountModal() {
    document.getElementById('edit-account-modal').classList.add('hidden');
}

// 处理编辑账号
function handleEditAccount(e) {
    e.preventDefault();
    
    const username = document.getElementById('edit-account-username').value;
    const role = document.getElementById('edit-account-role').value;
    
    // 验证用户权限
    if (currentUser.role !== 'superadmin') {
        showToast('只有总管理员可以编辑账号', 'error');
        return;
    }
    
    // 更新账号
    const result = userManager.updateUserRole(username, role);
    
    if (result.success) {
        hideEditAccountModal();
        loadAccountsList();
        showToast(result.message, 'success');
        
        // 记录日志
        logManager.addLog(currentUser.username, `更新账号权限: ${username}，新权限: ${role}`);
    } else {
        showToast(result.message, 'error');
    }
}

// 删除账号
function deleteAccount(username) {
    // 验证用户权限
    if (currentUser.role !== 'superadmin') {
        showToast('只有总管理员可以删除账号', 'error');
        return;
    }
    
    showConfirm(`确定要删除账号 "${username}" 吗？`, () => {
        const result = userManager.deleteUser(username);
        
        if (result.success) {
            loadAccountsList();
            showToast(result.message, 'success');
            
            // 记录日志
            logManager.addLog(currentUser.username, `删除账号: ${username}`);
        } else {
            showToast(result.message, 'error');
        }
    });
}

// 加载操作日志
function loadLogsList() {
    const logs = logManager.getLogs();
    const tableBody = document.getElementById('logs-table-body');
    
    tableBody.innerHTML = '';
    
    if (logs.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="3" class="px-6 py-4 text-center text-gray-500">暂无日志</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    logs.forEach(log => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-smooth';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${log.username}</td>
            <td class="px-6 py-4 text-sm text-gray-800">${log.action}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// 隐藏提示消息
function hideToast() {
    const toast = document.getElementById('toast-message');
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0');
}

// 在页面加载完成后初始化应用
window.addEventListener('DOMContentLoaded', initApp);