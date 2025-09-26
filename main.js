// 主页面脚本
import { 
    showNotification, 
    validateForm, 
    formatDate, 
    generateId, 
    storage, 
    debounce, 
    exportToExcel 
} from './utils.js';
import { 
    getCurrentUser, 
    clearCurrentUser, 
    getUsers, 
    setUsers, 
    getFileTypes, 
    setFileTypes, 
    getDepartments, 
    setDepartments, 
    getUnits, 
    setUnits, 
    getStatuses, 
    setStatuses, 
    getPaymentUnits, 
    setPaymentUnits, 
    getPaymentTypes, 
    setPaymentTypes, 
    getDocuments, 
    setDocuments, 
    getOperationLogs, 
    addOperationLog 
} from './mock_data.js';

// 全局变量
let currentUser = null;
let currentPage = 'dashboard';
let selectedDocumentIds = [];
let documents = [];
let filteredDocuments = [];
let currentPageNum = 1;
let itemsPerPage = 10;

// DOM元素
const menuItems = {
    dashboard: document.getElementById('menu-dashboard'),
    register: document.getElementById('menu-register'),
    info: document.getElementById('menu-info'),
    process: document.getElementById('menu-process'),
    settings: document.getElementById('menu-settings')
};

const pages = {
    dashboard: document.getElementById('page-dashboard'),
    register: document.getElementById('page-register'),
    info: document.getElementById('page-info'),
    process: document.getElementById('page-process'),
    settings: document.getElementById('page-settings')
};

const userInfo = {
    container: document.getElementById('userInfo'),
    username: document.getElementById('usernameDisplay'),
    role: document.getElementById('roleDisplay')
};

const logoutBtn = document.getElementById('logoutBtn');

// 初始化
function init() {
    // 检查登录状态
    checkLoginStatus();
    
    // 加载数据
    loadData();
    
    // 设置导航事件
    setupNavigation();
    
    // 设置各个页面的功能
    setupDashboardPage();
    setupRegisterPage();
    setupInfoPage();
    setupProcessPage();
    setupSettingsPage();
    
    // 设置通用功能
    setupCommonFunctions();
}

// 检查登录状态
function checkLoginStatus() {
    currentUser = getCurrentUser();
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // 显示用户信息
    showUserInfo();
    
    // 根据权限显示菜单
    showMenuByRole();
    
    // 检查是否需要修改密码
    if (currentUser.needChangePassword) {
        showNotification('首次登录请修改密码', 'warning');
    }
}

// 显示用户信息
function showUserInfo() {
    if (userInfo.container && userInfo.username && userInfo.role) {
        userInfo.container.classList.remove('hidden');
        userInfo.username.textContent = currentUser.name;
        
        let roleText = '';
        switch (currentUser.role) {
            case 'admin':
                roleText = '总管理员';
                break;
            case 'manager':
                roleText = '普通管理员';
                break;
            case 'user':
                roleText = '普通账号';
                break;
        }
        userInfo.role.textContent = roleText;
    }
}

// 根据权限显示菜单
function showMenuByRole() {
    // 默认隐藏所有菜单
    Object.values(menuItems).forEach(item => {
        if (item) item.classList.add('hidden');
    });
    
    // 根据权限显示菜单
    if (menuItems.dashboard) menuItems.dashboard.classList.remove('hidden');
    if (menuItems.register) menuItems.register.classList.remove('hidden');
    if (menuItems.info) menuItems.info.classList.remove('hidden');
    
    if (currentUser.role === 'admin' || currentUser.role === 'manager') {
        if (menuItems.process) menuItems.process.classList.remove('hidden');
    }
    
    if (currentUser.role === 'admin') {
        if (menuItems.settings) menuItems.settings.classList.remove('hidden');
    }
}

// 加载数据
function loadData() {
    documents = getDocuments() || [];
    filteredDocuments = [...documents];
}

// 设置导航
function setupNavigation() {
    // 菜单点击事件
    Object.keys(menuItems).forEach(key => {
        const menuItem = menuItems[key];
        if (menuItem) {
            menuItem.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage(key);
            });
        }
    });
    
    // 退出登录
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// 切换页面
function switchPage(pageName) {
    if (!pages[pageName]) return;
    
    // 更新当前页面
    currentPage = pageName;
    
    // 隐藏所有页面
    Object.values(pages).forEach(page => {
        if (page) page.classList.add('hidden');
    });
    
    // 显示选中页面
    pages[pageName].classList.remove('hidden');
    
    // 更新菜单高亮
    Object.keys(menuItems).forEach(key => {
        const menuItem = menuItems[key];
        if (menuItem) {
            if (key === pageName) {
                menuItem.classList.add('bg-primary/10', 'text-primary');
            } else {
                menuItem.classList.remove('bg-primary/10', 'text-primary');
            }
        }
    });
    
    // 重新加载页面数据
    if (pageName === 'dashboard') {
        loadDashboardData();
    } else if (pageName === 'register') {
        resetRegisterForm();
    } else if (pageName === 'info') {
        searchAndFilterDocuments('info');
    } else if (pageName === 'process') {
        searchAndFilterDocuments('process');
    } else if (pageName === 'settings') {
        loadSettingsData();
    }
}

// 处理退出登录
function handleLogout() {
    // 添加操作日志
    addOperationLog(currentUser.id, currentUser.username, '用户退出', `用户${currentUser.username}退出登录`);
    
    // 清除当前用户
    clearCurrentUser();
    
    // 跳转到登录页面
    window.location.href = 'index.html';
}

// 设置通用功能
function setupCommonFunctions() {
    // 关闭模态框按钮
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('[id$="Modal"]');
            if (modal) {
                modal.classList.add('hidden');
            }
        });
    });
    
    // 点击模态框外部关闭模态框
    document.querySelectorAll('[id$="Modal"]').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
}

// 设置控制台页面
function setupDashboardPage() {
    // 加载控制台数据
    loadDashboardData();
}

// 加载控制台数据
function loadDashboardData() {
    // 计算今日登记文件数量
    const today = new Date().toISOString().split('T')[0];
    const todayDocs = documents.filter(doc => doc.date === today);
    
    // 计算待处理文件数量
    const pendingStatuses = ['酒店内部走签', '待送集团', '集团审核', '集团经理待签', '急单'];
    const pendingDocs = documents.filter(doc => pendingStatuses.includes(doc.status));
    
    // 计算本月登记文件数量
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthDocs = documents.filter(doc => {
        const docDate = new Date(doc.date);
        return docDate.getMonth() === currentMonth && docDate.getFullYear() === currentYear;
    });
    
    // 更新统计数据
    const todayDocsCount = document.getElementById('todayDocsCount');
    const pendingDocsCount = document.getElementById('pendingDocsCount');
    const monthDocsCount = document.getElementById('monthDocsCount');
    const recentDocsTable = document.getElementById('recentDocsTable');
    
    if (todayDocsCount) todayDocsCount.textContent = todayDocs.length;
    if (pendingDocsCount) pendingDocsCount.textContent = pendingDocs.length;
    if (monthDocsCount) monthDocsCount.textContent = monthDocs.length;
    
    // 显示最近文件记录
    if (recentDocsTable) {
        // 按日期排序，取最近5条
        const recentDocs = [...documents]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        recentDocsTable.innerHTML = '';
        
        if (recentDocs.length === 0) {
            recentDocsTable.innerHTML = `
                <tr>
                    <td colspan="4" class="py-4 text-center text-gray-500">暂无文件记录</td>
                </tr>
            `;
        } else {
            recentDocs.forEach(doc => {
                const row = document.createElement('tr');
                row.className = 'border-b border-gray-200 hover:bg-gray-50';
                
                let statusClass = '';
                let statusText = doc.status;
                
                switch (statusText) {
                    case '完毕':
                        statusClass = 'bg-green-100 text-green-800';
                        break;
                    case '退回':
                        statusClass = 'bg-red-100 text-red-800';
                        break;
                    case '作废':
                        statusClass = 'bg-gray-100 text-gray-800';
                        break;
                    default:
                        statusClass = 'bg-blue-100 text-blue-800';
                }
                
                row.innerHTML = `
                    <td class="py-3 px-4">${doc.date}</td>
                    <td class="py-3 px-4">${doc.fileType}</td>
                    <td class="py-3 px-4">${doc.department}</td>
                    <td class="py-3 px-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                `;
                
                recentDocsTable.appendChild(row);
            });
        }
    }
}

// 设置文件登记页面
function setupRegisterPage() {
    const registerForm = document.getElementById('registerForm');
    const registerDate = document.getElementById('registerDate');
    const registerFileType = document.getElementById('registerFileType');
    const registerDepartment = document.getElementById('registerDepartment');
    const normalContentGroup = document.getElementById('normalContentGroup');
    const paymentSummaryGroup = document.getElementById('paymentSummaryGroup');
    const addQuantityRowBtn = document.getElementById('addQuantityRow');
    const quantityRows = document.getElementById('quantityRows');
    const paymentCategory = document.getElementById('paymentCategory');
    const paymentCategoryOther = document.getElementById('paymentCategoryOther');
    const paymentUnit = document.getElementById('paymentUnit');
    const paymentUnitOther = document.getElementById('paymentUnitOther');
    
    // 设置当前日期
    if (registerDate) {
        const today = new Date().toISOString().split('T')[0];
        registerDate.value = today;
        // 设置最大日期为今天
        registerDate.max = today;
    }
    
    // 加载文件类型
    if (registerFileType) {
        const fileTypes = getFileTypes();
        fileTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            registerFileType.appendChild(option);
        });
        
        // 文件类型变化事件
        registerFileType.addEventListener('change', handleFileTypeChange);
    }
    
    // 加载部门
    if (registerDepartment) {
        const departments = getDepartments();
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            registerDepartment.appendChild(option);
        });
    }
    
    // 加载支付类型
    if (paymentCategory) {
        const paymentTypes = getPaymentTypes();
        paymentTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            paymentCategory.appendChild(option);
        });
        
        // 支付类型变化事件
        paymentCategory.addEventListener('change', () => {
            if (paymentCategory.value === '其他') {
                paymentCategoryOther.classList.remove('hidden');
                paymentCategoryOther.required = true;
            } else {
                paymentCategoryOther.classList.add('hidden');
                paymentCategoryOther.required = false;
            }
        });
    }
    
    // 加载付款单位简称
    if (paymentUnit) {
        const paymentUnits = getPaymentUnits();
        paymentUnits.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit;
            option.textContent = unit;
            paymentUnit.appendChild(option);
        });
        
        // 付款单位变化事件
        paymentUnit.addEventListener('change', () => {
            if (paymentUnit.value === '其他') {
                paymentUnitOther.classList.remove('hidden');
                paymentUnitOther.required = true;
            } else {
                paymentUnitOther.classList.add('hidden');
                paymentUnitOther.required = false;
            }
        });
    }
    
    // 添加数量行
    if (addQuantityRowBtn) {
        addQuantityRowBtn.addEventListener('click', addQuantityRow);
    }
    
    // 表单提交事件
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
    
    // 初始化数量行
    initQuantityRows();
}

// 处理文件类型变化
function handleFileTypeChange() {
    const registerFileType = document.getElementById('registerFileType');
    const normalContentGroup = document.getElementById('normalContentGroup');
    const paymentSummaryGroup = document.getElementById('paymentSummaryGroup');
    
    if (registerFileType && normalContentGroup && paymentSummaryGroup) {
        const fileType = registerFileType.value;
        
        if (fileType === '付款申请单' || fileType === '付款单+用印审批（仅限验收报告）') {
            normalContentGroup.classList.add('hidden');
            paymentSummaryGroup.classList.remove('hidden');
        } else {
            normalContentGroup.classList.remove('hidden');
            paymentSummaryGroup.classList.add('hidden');
        }
    }
}

// 初始化数量行
function initQuantityRows() {
    const quantityRows = document.getElementById('quantityRows');
    if (!quantityRows) return;
    
    // 清空现有行
    quantityRows.innerHTML = '';
    
    // 添加第一行
    addQuantityRow(true);
}

// 添加数量行
function addQuantityRow(isFirstRow = false) {
    const quantityRows = document.getElementById('quantityRows');
    if (!quantityRows) return;
    
    const rowCount = quantityRows.querySelectorAll('.quantity-row').length;
    
    const row = document.createElement('div');
    row.className = 'flex items-end space-x-3 quantity-row';
    
    row.innerHTML = `
        <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">计量单位</label>
            <select class="unit-select block w-full px-3 py-2 border border-gray-200 rounded-md">
                <!-- 计量单位选项将动态添加 -->
            </select>
        </div>
        <div class="w-1/4">
            <label class="block text-xs text-gray-500 mb-1">数量</label>
            <input type="number" class="quantity-input block w-full px-3 py-2 border border-gray-200 rounded-md" placeholder="0" min="0" step="0.01">
        </div>
        <div class="w-1/4">
            <label class="block text-xs text-gray-500 mb-1">金额</label>
            <input type="number" class="amount-input block w-full px-3 py-2 border border-gray-200 rounded-md" placeholder="0.00" min="0" step="0.01">
        </div>
        <div class="pb-2">
            <button type="button" class="remove-quantity-row text-danger hover:text-danger/80" ${isFirstRow ? 'disabled' : ''}>
                <i class="fa fa-trash"></i>
            </button>
        </div>
    `;
    
    // 加载计量单位
    const unitSelect = row.querySelector('.unit-select');
    const units = getUnits();
    units.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        unitSelect.appendChild(option);
    });
    
    // 添加删除行事件
    const removeBtn = row.querySelector('.remove-quantity-row');
    if (removeBtn && !isFirstRow) {
        removeBtn.addEventListener('click', () => {
            row.remove();
            updateRemoveButtons();
        });
    }
    
    quantityRows.appendChild(row);
    
    // 更新删除按钮状态
    updateRemoveButtons();
}

// 更新删除按钮状态
function updateRemoveButtons() {
    const rows = document.querySelectorAll('.quantity-row');
    const removeButtons = document.querySelectorAll('.remove-quantity-row');
    
    removeButtons.forEach((btn, index) => {
        if (rows.length <= 1) {
            btn.disabled = true;
        } else {
            btn.disabled = index === 0;
        }
    });
}

// 重置登记表单
function resetRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    const registerDate = document.getElementById('registerDate');
    
    if (registerForm) {
        registerForm.reset();
    }
    
    if (registerDate) {
        const today = new Date().toISOString().split('T')[0];
        registerDate.value = today;
    }
    
    // 重置文件类型相关显示
    handleFileTypeChange();
    
    // 重置数量行
    initQuantityRows();
}

// 处理文件登记提交
function handleRegisterSubmit(e) {
    e.preventDefault();
    
    const registerForm = document.getElementById('registerForm');
    const registerDate = document.getElementById('registerDate');
    const registerFileType = document.getElementById('registerFileType');
    const registerDepartment = document.getElementById('registerDepartment');
    const registerApplicant = document.getElementById('registerApplicant');
    const registerContent = document.getElementById('registerContent');
    const normalContentGroup = document.getElementById('normalContentGroup');
    const paymentSummaryGroup = document.getElementById('paymentSummaryGroup');
    const quantityRows = document.querySelectorAll('.quantity-row');
    
    // 表单验证
    const formData = {
        date: registerDate.value,
        fileType: registerFileType.value,
        department: registerDepartment.value,
        applicant: registerApplicant.value
    };
    
    const rules = {
        date: { required: true, message: '请选择日期' },
        fileType: { required: true, message: '请选择文件类型' },
        department: { required: true, message: '请选择申请部门' },
        applicant: { required: true, message: '请输入申请人' }
    };
    
    // 内容验证
    if (normalContentGroup && !normalContentGroup.classList.contains('hidden')) {
        formData.content = registerContent.value;
        rules.content = { required: true, message: '请输入文件内容' };
    } else if (paymentSummaryGroup && !paymentSummaryGroup.classList.contains('hidden')) {
        // 验证付款申请单相关字段
        const paymentTypeRadios = document.querySelectorAll('.payment-type-radio');
        const paymentItem = document.getElementById('paymentItem');
        const paymentCategory = document.getElementById('paymentCategory');
        const paymentCategoryOther = document.getElementById('paymentCategoryOther');
        const paymentPeriod = document.getElementById('paymentPeriod');
        const paymentUnit = document.getElementById('paymentUnit');
        const paymentUnitOther = document.getElementById('paymentUnitOther');
        
        let selectedPaymentType = '';
        paymentTypeRadios.forEach(radio => {
            if (radio.checked) {
                selectedPaymentType = radio.value;
            }
        });
        
        formData.paymentType = selectedPaymentType;
        formData.paymentItem = paymentItem.value;
        formData.paymentCategory = paymentCategory.value;
        formData.paymentCategoryOther = paymentCategoryOther.value;
        formData.paymentPeriod = paymentPeriod.value;
        formData.paymentUnit = paymentUnit.value;
        formData.paymentUnitOther = paymentUnitOther.value;
        
        rules.paymentType = { required: true, message: '请选择支付类型' };
        rules.paymentItem = { required: true, message: '请输入支付项目' };
        rules.paymentCategory = { required: true, message: '请选择支付类别' };
        rules.paymentPeriod = { required: true, message: '请选择期间' };
        rules.paymentUnit = { required: true, message: '请选择付款单位' };
        
        if (paymentCategory.value === '其他' && !paymentCategoryOther.value) {
            rules.paymentCategoryOther = { required: true, message: '请输入其他支付类别' };
        }
        
        if (paymentUnit.value === '其他' && !paymentUnitOther.value) {
            rules.paymentUnitOther = { required: true, message: '请输入其他付款单位' };
        }
    }
    
    // 验证数量和金额
    if (quantityRows.length > 0) {
        let hasValidQuantityAmount = false;
        quantityRows.forEach((row, index) => {
            const unitSelect = row.querySelector('.unit-select');
            const quantityInput = row.querySelector('.quantity-input');
            const amountInput = row.querySelector('.amount-input');
            
            if (unitSelect.value || quantityInput.value || amountInput.value) {
                hasValidQuantityAmount = true;
            }
        });
        
        if (!hasValidQuantityAmount) {
            showNotification('请至少填写一项数量和金额信息', 'error');
            return;
        }
    }
    
    const validation = validateForm(formData, rules);
    
    if (!validation.isValid) {
        showNotification(Object.values(validation.errors)[0], 'error');
        return;
    }
    
    // 构建文件数据
    const documentData = {
        id: `doc-${generateId()}`,
        date: formData.date,
        fileType: formData.fileType,
        documentNumber: '',
        department: formData.department,
        applicant: formData.applicant,
        endDate: null,
        status: '酒店内部走签',
        statusUpdateTime: new Date().toISOString(),
        rejectReason: null,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // 处理文件内容
    if (normalContentGroup && !normalContentGroup.classList.contains('hidden')) {
        documentData.content = formData.content;
    } else if (paymentSummaryGroup && !paymentSummaryGroup.classList.contains('hidden')) {
        // 构建摘要内容
        let paymentCategoryText = formData.paymentCategory;
        if (paymentCategoryText === '其他' && formData.paymentCategoryOther) {
            paymentCategoryText = formData.paymentCategoryOther;
        }
        
        let paymentUnitText = formData.paymentUnit;
        if (paymentUnitText === '其他' && formData.paymentUnitOther) {
            paymentUnitText = formData.paymentUnitOther;
        }
        
        // 格式化期间
        const periodDate = new Date(formData.paymentPeriod);
        const formattedPeriod = `${periodDate.getFullYear()}年${String(periodDate.getMonth() + 1).padStart(2, '0')}月`;
        
        documentData.content = `${formData.paymentType}-${formData.paymentItem}-${paymentCategoryText}-(${formattedPeriod}--${paymentUnitText})`;
    }
    
    // 处理数量和金额（简化处理，只取第一行数据）
    if (quantityRows.length > 0) {
        const firstRow = quantityRows[0];
        const unitSelect = firstRow.querySelector('.unit-select');
        const quantityInput = firstRow.querySelector('.quantity-input');
        const amountInput = firstRow.querySelector('.amount-input');
        
        documentData.unit = unitSelect.value || '/';
        documentData.quantity = parseFloat(quantityInput.value) || 0;
        documentData.amount = parseFloat(amountInput.value) || 0;
    } else {
        documentData.unit = '/';
        documentData.quantity = 0;
        documentData.amount = 0;
    }
    
    // 保存文件数据
    documents.push(documentData);
    setDocuments(documents);
    
    // 添加操作日志
    addOperationLog(currentUser.id, currentUser.username, '文件登记', `登记了${documentData.fileType}`);
    
    // 显示成功信息
    showNotification('文件登记成功', 'success');
    
    // 重置表单
    resetRegisterForm();
}

// 设置文件信息页面
function setupInfoPage() {
    const refreshInfoBtn = document.getElementById('refreshInfoBtn');
    const searchBtn = document.getElementById('searchBtn');
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    const searchKeyword = document.getElementById('searchKeyword');
    const filterFileType = document.getElementById('filterFileType');
    const filterDepartment = document.getElementById('filterDepartment');
    const filterStatus = document.getElementById('filterStatus');
    const filterStartDate = document.getElementById('filterStartDate');
    const filterEndDate = document.getElementById('filterEndDate');
    
    // 加载筛选选项
    loadFilterOptions('info');
    
    // 刷新按钮事件
    if (refreshInfoBtn) {
        refreshInfoBtn.addEventListener('click', () => {
            loadData();
            searchAndFilterDocuments('info');
            showNotification('数据已刷新', 'success');
        });
    }
    
    // 搜索按钮事件
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchAndFilterDocuments('info');
        });
    }
    
    // 重置筛选按钮事件
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', () => {
            resetFilters('info');
            searchAndFilterDocuments('info');
        });
    }
    
    // 搜索关键词输入事件（防抖）
    if (searchKeyword) {
        searchKeyword.addEventListener('input', debounce(() => {
            searchAndFilterDocuments('info');
        }, 500));
    }
    
    // 筛选选项变化事件
    const filterElements = [
        filterFileType,
        filterDepartment,
        filterStatus,
        filterStartDate,
        filterEndDate
    ];
    
    filterElements.forEach(element => {
        if (element) {
            element.addEventListener('change', () => {
                searchAndFilterDocuments('info');
            });
        }
    });
}

// 设置文件处理页面
function setupProcessPage() {
    const refreshProcessBtn = document.getElementById('refreshProcessBtn');
    const searchBtn = document.getElementById('processSearchBtn');
    const resetFilterBtn = document.getElementById('processResetFilterBtn');
    const searchKeyword = document.getElementById('processSearchKeyword');
    const filterFileType = document.getElementById('processFilterFileType');
    const filterDepartment = document.getElementById('processFilterDepartment');
    const filterStatus = document.getElementById('processFilterStatus');
    const filterStartDate = document.getElementById('processFilterStartDate');
    const filterEndDate = document.getElementById('processFilterEndDate');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const batchUpdateStatusBtn = document.getElementById('batchUpdateStatusBtn');
    const batchDeleteBtn = document.getElementById('batchDeleteBtn');
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    const batchUpdateStatusModal = document.getElementById('batchUpdateStatusModal');
    const batchUpdateStatusForm = document.getElementById('batchUpdateStatusForm');
    const batchStatus = document.getElementById('batchStatus');
    const batchRejectReasonGroup = document.getElementById('batchRejectReasonGroup');
    
    // 加载筛选选项
    loadFilterOptions('process');
    
    // 刷新按钮事件
    if (refreshProcessBtn) {
        refreshProcessBtn.addEventListener('click', () => {
            loadData();
            searchAndFilterDocuments('process');
            showNotification('数据已刷新', 'success');
        });
    }
    
    // 搜索按钮事件
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchAndFilterDocuments('process');
        });
    }
    
    // 重置筛选按钮事件
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', () => {
            resetFilters('process');
            searchAndFilterDocuments('process');
        });
    }
    
    // 搜索关键词输入事件（防抖）
    if (searchKeyword) {
        searchKeyword.addEventListener('input', debounce(() => {
            searchAndFilterDocuments('process');
        }, 500));
    }
    
    // 筛选选项变化事件
    const filterElements = [
        filterFileType,
        filterDepartment,
        filterStatus,
        filterStartDate,
        filterEndDate
    ];
    
    filterElements.forEach(element => {
        if (element) {
            element.addEventListener('change', () => {
                searchAndFilterDocuments('process');
            });
        }
    });
    
    // 全选复选框事件
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }
    
    // 批量更新状态按钮事件
    if (batchUpdateStatusBtn) {
        batchUpdateStatusBtn.addEventListener('click', () => {
            if (selectedDocumentIds.length === 0) {
                showNotification('请至少选择一项文件', 'error');
                return;
            }
            
            // 加载状态选项
            if (batchStatus) {
                batchStatus.innerHTML = '';
                const statuses = getStatuses();
                statuses.forEach(status => {
                    const option = document.createElement('option');
                    option.value = status;
                    option.textContent = status;
                    batchStatus.appendChild(option);
                });
                
                // 状态变化事件
                batchStatus.addEventListener('change', () => {
                    if (batchStatus.value === '退回') {
                        batchRejectReasonGroup.classList.remove('hidden');
                    } else {
                        batchRejectReasonGroup.classList.add('hidden');
                    }
                });
            }
            
            // 设置选中的文件ID
            if (document.getElementById('batchDocumentIds')) {
                document.getElementById('batchDocumentIds').value = selectedDocumentIds.join(',');
            }
            
            // 显示弹窗
            if (batchUpdateStatusModal) {
                batchUpdateStatusModal.classList.remove('hidden');
            }
        });
    }
    
    // 批量删除按钮事件
    if (batchDeleteBtn) {
        batchDeleteBtn.addEventListener('click', () => {
            if (selectedDocumentIds.length === 0) {
                showNotification('请至少选择一项文件', 'error');
                return;
            }
            
            if (confirm(`确定要删除选中的 ${selectedDocumentIds.length} 项文件吗？此操作不可恢复。`)) {
                handleBatchDelete();
            }
        });
    }
    
    // 导出Excel按钮事件
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', () => {
            handleExportExcel();
        });
    }
    
    // 批量更新状态表单提交
    if (batchUpdateStatusForm) {
        batchUpdateStatusForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleBatchUpdateStatus();
        });
    }
}

// 加载筛选选项
function loadFilterOptions(pageType) {
    // 文件类型
    const fileTypeElement = pageType === 'info' 
        ? document.getElementById('filterFileType') 
        : document.getElementById('processFilterFileType');
    
    if (fileTypeElement) {
        const fileTypes = getFileTypes();
        fileTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            fileTypeElement.appendChild(option);
        });
    }
    
    // 部门
    const departmentElement = pageType === 'info' 
        ? document.getElementById('filterDepartment') 
        : document.getElementById('processFilterDepartment');
    
    if (departmentElement) {
        const departments = getDepartments();
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            departmentElement.appendChild(option);
        });
    }
    
    // 状态
    const statusElement = pageType === 'info' 
        ? document.getElementById('filterStatus') 
        : document.getElementById('processFilterStatus');
    
    if (statusElement) {
        const statuses = getStatuses();
        statuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            statusElement.appendChild(option);
        });
    }
}

// 重置筛选条件
function resetFilters(pageType) {
    if (pageType === 'info') {
        if (document.getElementById('searchKeyword')) document.getElementById('searchKeyword').value = '';
        if (document.getElementById('filterFileType')) document.getElementById('filterFileType').value = '';
        if (document.getElementById('filterDepartment')) document.getElementById('filterDepartment').value = '';
        if (document.getElementById('filterStatus')) document.getElementById('filterStatus').value = '';
        if (document.getElementById('filterStartDate')) document.getElementById('filterStartDate').value = '';
        if (document.getElementById('filterEndDate')) document.getElementById('filterEndDate').value = '';
    } else if (pageType === 'process') {
        if (document.getElementById('processSearchKeyword')) document.getElementById('processSearchKeyword').value = '';
        if (document.getElementById('processFilterFileType')) document.getElementById('processFilterFileType').value = '';
        if (document.getElementById('processFilterDepartment')) document.getElementById('processFilterDepartment').value = '';
        if (document.getElementById('processFilterStatus')) document.getElementById('processFilterStatus').value = '';
        if (document.getElementById('processFilterStartDate')) document.getElementById('processFilterStartDate').value = '';
        if (document.getElementById('processFilterEndDate')) document.getElementById('processFilterEndDate').value = '';
        if (document.getElementById('selectAllCheckbox')) document.getElementById('selectAllCheckbox').checked = false;
        selectedDocumentIds = [];
        updateBatchButtons();
    }
}

// 搜索和筛选文件
function searchAndFilterDocuments(pageType) {
    let keyword = '';
    let fileType = '';
    let department = '';
    let status = '';
    let startDate = '';
    let endDate = '';
    
    // 获取筛选条件
    if (pageType === 'info') {
        keyword = document.getElementById('searchKeyword')?.value || '';
        fileType = document.getElementById('filterFileType')?.value || '';
        department = document.getElementById('filterDepartment')?.value || '';
        status = document.getElementById('filterStatus')?.value || '';
        startDate = document.getElementById('filterStartDate')?.value || '';
        endDate = document.getElementById('filterEndDate')?.value || '';
    } else if (pageType === 'process') {
        keyword = document.getElementById('processSearchKeyword')?.value || '';
        fileType = document.getElementById('processFilterFileType')?.value || '';
        department = document.getElementById('processFilterDepartment')?.value || '';
        status = document.getElementById('processFilterStatus')?.value || '';
        startDate = document.getElementById('processFilterStartDate')?.value || '';
        endDate = document.getElementById('processFilterEndDate')?.value || '';
    }
    
    // 筛选文件
    filteredDocuments = documents.filter(doc => {
        // 关键词搜索
        if (keyword && !(
            doc.fileType.includes(keyword) ||
            doc.documentNumber.includes(keyword) ||
            doc.department.includes(keyword) ||
            doc.applicant.includes(keyword) ||
            doc.content.includes(keyword)
        )) {
            return false;
        }
        
        // 文件类型筛选
        if (fileType && doc.fileType !== fileType) {
            return false;
        }
        
        // 部门筛选
        if (department && doc.department !== department) {
            return false;
        }
        
        // 状态筛选
        if (status && doc.status !== status) {
            return false;
        }
        
        // 日期范围筛选
        if (startDate && new Date(doc.date) < new Date(startDate)) {
            return false;
        }
        
        if (endDate && new Date(doc.date) > new Date(endDate)) {
            return false;
        }
        
        return true;
    });
    
    // 按日期倒序排序
    filteredDocuments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 显示结果
    displayDocuments(pageType);
}

// 显示文件列表
function displayDocuments(pageType) {
    let tableElement = null;
    let totalCountElement = null;
    let paginationElement = null;
    
    if (pageType === 'info') {
        tableElement = document.getElementById('documentsTable');
        totalCountElement = document.getElementById('totalDocsCount');
        paginationElement = document.getElementById('infoPagination');
    } else if (pageType === 'process') {
        tableElement = document.getElementById('processDocumentsTable');
        totalCountElement = document.getElementById('processTotalDocsCount');
        paginationElement = document.getElementById('processPagination');
    }
    
    if (!tableElement || !totalCountElement || !paginationElement) return;
    
    // 更新总数
    totalCountElement.textContent = filteredDocuments.length;
    
    // 计算分页
    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
    const startIndex = (currentPageNum - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);
    
    // 清空表格
    tableElement.innerHTML = '';
    
    // 显示文件列表
    if (paginatedDocuments.length === 0) {
        tableElement.innerHTML = `
            <tr>
                <td colspan="${pageType === 'info' ? '13' : '13'}" class="py-6 text-center text-gray-500">暂无匹配的文件记录</td>
            </tr>
        `;
    } else {
        paginatedDocuments.forEach(doc => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            // 获取状态样式
            let statusClass = '';
            switch (doc.status) {
                case '完毕':
                    statusClass = 'badge-success';
                    break;
                case '退回':
                case '作废':
                    statusClass = 'badge-danger';
                    break;
                case '酒店内部走签':
                case '待送集团':
                case '集团审核':
                case '集团经理待签':
                case '急单':
                    statusClass = 'badge-primary';
                    break;
                default:
                    statusClass = 'badge-warning';
            }
            
            // 格式化数量和金额
            const quantityDisplay = doc.quantity === 0 ? '/' : doc.quantity;
            const amountDisplay = doc.amount === 0 ? '/' : doc.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            
            // 格式化更新时间
            const updateTime = doc.statusUpdateTime ? formatDate(doc.statusUpdateTime, 'YYYY-MM-DD HH:mm:ss') : '';
            
            if (pageType === 'info') {
                row.innerHTML = `
                    <td>${doc.date}</td>
                    <td>${doc.fileType}</td>
                    <td>${doc.documentNumber || '-'}</td>
                    <td>${doc.department}</td>
                    <td>${doc.applicant}</td>
                    <td class="max-w-xs truncate" title="${doc.content}">${doc.content}</td>
                    <td>${doc.unit}</td>
                    <td>${quantityDisplay}</td>
                    <td>${amountDisplay}</td>
                    <td>${doc.endDate || '-'}</td>
                    <td>
                        <span class="badge ${statusClass}">${doc.status}</span>
                    </td>
                    <td>${updateTime}</td>
                    <td>${doc.rejectReason || '-'}</td>
                `;
            } else if (pageType === 'process') {
                row.innerHTML = `
                    <td>
                        <input type="checkbox" class="document-checkbox" data-id="${doc.id}">
                    </td>
                    <td>${doc.date}</td>
                    <td>${doc.fileType}</td>
                    <td>
                        <input type="text" class="document-number-input text-sm border border-gray-200 rounded px-2 py-1 w-full" 
                            data-id="${doc.id}" value="${doc.documentNumber || ''}"
                            ${(doc.status === '完毕' && (doc.fileType === '采购计划审批表' || doc.fileType === '合同（协议）签订审批表' || doc.fileType === '付款申请单' || doc.fileType === '付款单+用印审批（仅限验收报告）')) ? '' : 'disabled'}
                        >
                    </td>
                    <td>${doc.department}</td>
                    <td>${doc.applicant}</td>
                    <td class="max-w-xs truncate" title="${doc.content}">${doc.content}</td>
                    <td>${doc.unit}</td>
                    <td>${quantityDisplay}</td>
                    <td>${amountDisplay}</td>
                    <td>${doc.endDate || '-'}</td>
                    <td>
                        <select class="document-status-select text-sm border border-gray-200 rounded px-2 py-1" data-id="${doc.id}">
                            <!-- 状态选项将动态添加 -->
                        </select>
                    </td>
                    <td>
                        <button class="edit-document-btn text-primary hover:text-primary/80 mr-2" data-id="${doc.id}">
                            <i class="fa fa-pencil"></i>
                        </button>
                        <button class="delete-document-btn text-danger hover:text-danger/80" data-id="${doc.id}">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                `;
                
                // 添加状态选项
                const statusSelect = row.querySelector('.document-status-select');
                if (statusSelect) {
                    const statuses = getStatuses();
                    statuses.forEach(status => {
                        const option = document.createElement('option');
                        option.value = status;
                        option.textContent = status;
                        if (status === doc.status) {
                            option.selected = true;
                        }
                        statusSelect.appendChild(option);
                    });
                    
                    // 状态变化事件
                    statusSelect.addEventListener('change', (e) => {
                        handleStatusChange(doc.id, e.target.value);
                    });
                }
                
                // 文件编号输入事件
                const numberInput = row.querySelector('.document-number-input');
                if (numberInput && !numberInput.disabled) {
                    numberInput.addEventListener('blur', (e) => {
                        handleDocumentNumberChange(doc.id, e.target.value);
                    });
                }
                
                // 文档复选框事件
                const checkbox = row.querySelector('.document-checkbox');
                if (checkbox) {
                    checkbox.addEventListener('change', (e) => {
                        handleDocumentCheckboxChange(doc.id, e.target.checked);
                    });
                }
                
                // 编辑按钮事件
                const editBtn = row.querySelector('.edit-document-btn');
                if (editBtn) {
                    editBtn.addEventListener('click', () => {
                        openEditDocumentModal(doc.id);
                    });
                }
                
                // 删除按钮事件
                const deleteBtn = row.querySelector('.delete-document-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => {
                        if (confirm('确定要删除此文件记录吗？此操作不可恢复。')) {
                            handleDeleteDocument(doc.id);
                        }
                    });
                }
            }
            
            tableElement.appendChild(row);
        });
    }
    
    // 生成分页
    generatePagination(pageType, totalPages);
    
    // 如果是处理页面，更新批量按钮状态
    if (pageType === 'process') {
        updateBatchButtons();
    }
}

// 生成分页
function generatePagination(pageType, totalPages) {
    let paginationElement = null;
    
    if (pageType === 'info') {
        paginationElement = document.getElementById('infoPagination');
    } else if (pageType === 'process') {
        paginationElement = document.getElementById('processPagination');
    }
    
    if (!paginationElement) return;
    
    // 清空分页
    paginationElement.innerHTML = '';
    
    // 如果只有一页，不显示分页
    if (totalPages <= 1) {
        return;
    }
    
    // 首页按钮
    const firstPageBtn = document.createElement('button');
    firstPageBtn.textContent = '首页';
    firstPageBtn.disabled = currentPageNum === 1;
    firstPageBtn.addEventListener('click', () => {
        currentPageNum = 1;
        searchAndFilterDocuments(pageType);
    });
    paginationElement.appendChild(firstPageBtn);
    
    // 上一页按钮
    const prevPageBtn = document.createElement('button');
    prevPageBtn.textContent = '上一页';
    prevPageBtn.disabled = currentPageNum === 1;
    prevPageBtn.addEventListener('click', () => {
        if (currentPageNum > 1) {
            currentPageNum--;
            searchAndFilterDocuments(pageType);
        }
    });
    paginationElement.appendChild(prevPageBtn);
    
    // 页码按钮
    const startPage = Math.max(1, currentPageNum - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        if (i === currentPageNum) {
            pageBtn.classList.add('active');
        }
        pageBtn.addEventListener('click', () => {
            currentPageNum = i;
            searchAndFilterDocuments(pageType);
        });
        paginationElement.appendChild(pageBtn);
    }
    
    // 下一页按钮
    const nextPageBtn = document.createElement('button');
    nextPageBtn.textContent = '下一页';
    nextPageBtn.disabled = currentPageNum === totalPages;
    nextPageBtn.addEventListener('click', () => {
        if (currentPageNum < totalPages) {
            currentPageNum++;
            searchAndFilterDocuments(pageType);
        }
    });
    paginationElement.appendChild(nextPageBtn);
    
    // 末页按钮
    const lastPageBtn = document.createElement('button');
    lastPageBtn.textContent = '末页';
    lastPageBtn.disabled = currentPageNum === totalPages;
    lastPageBtn.addEventListener('click', () => {
        currentPageNum = totalPages;
        searchAndFilterDocuments(pageType);
    });
    paginationElement.appendChild(lastPageBtn);
}

// 处理全选
function handleSelectAll(e) {
    const isChecked = e.target.checked;
    const checkboxes = document.querySelectorAll('.document-checkbox');
    
    selectedDocumentIds = [];
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
        const docId = checkbox.getAttribute('data-id');
        if (isChecked) {
            selectedDocumentIds.push(docId);
        }
    });
    
    updateBatchButtons();
}

// 处理文档复选框变化
function handleDocumentCheckboxChange(docId, isChecked) {
    if (isChecked) {
        selectedDocumentIds.push(docId);
    } else {
        selectedDocumentIds = selectedDocumentIds.filter(id => id !== docId);
    }
    
    // 更新全选复选框状态
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const checkboxes = document.querySelectorAll('.document-checkbox');
    const checkedCheckboxes = document.querySelectorAll('.document-checkbox:checked');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = checkboxes.length > 0 && checkboxes.length === checkedCheckboxes.length;
    }
    
    updateBatchButtons();
}

// 更新批量按钮状态
function updateBatchButtons() {
    const batchUpdateStatusBtn = document.getElementById('batchUpdateStatusBtn');
    const batchDeleteBtn = document.getElementById('batchDeleteBtn');
    
    if (batchUpdateStatusBtn) {
        batchUpdateStatusBtn.disabled = selectedDocumentIds.length === 0;
    }
    
    if (batchDeleteBtn) {
        batchDeleteBtn.disabled = selectedDocumentIds.length === 0;
    }
}

// 处理状态变化
function handleStatusChange(docId, newStatus) {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    
    const oldStatus = doc.status;
    doc.status = newStatus;
    doc.statusUpdateTime = new Date().toISOString();
    
    // 如果状态为完毕，设置结束日期
    if (newStatus === '完毕' && !doc.endDate) {
        doc.endDate = new Date().toISOString().split('T')[0];
    }
    
    // 如果状态不是退回，清空退回原因
    if (newStatus !== '退回') {
        doc.rejectReason = null;
    }
    
    // 保存更新
    setDocuments(documents);
    
    // 添加操作日志
    addOperationLog(currentUser.id, currentUser.username, '更新状态', `将文件${doc.fileType}的状态从${oldStatus}更新为${newStatus}`);
    
    // 如果状态为退回，提示输入退回原因
    if (newStatus === '退回') {
        const rejectReason = prompt('请输入退回原因：');
        if (rejectReason !== null) {
            doc.rejectReason = rejectReason;
            setDocuments(documents);
        }
    }
    
    // 刷新列表
    searchAndFilterDocuments('process');
}

// 处理文件编号变化
function handleDocumentNumberChange(docId, newNumber) {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    
    const oldNumber = doc.documentNumber;
    doc.documentNumber = newNumber;
    doc.updatedAt = new Date().toISOString();
    
    // 保存更新
    setDocuments(documents);
    
    // 添加操作日志
    addOperationLog(currentUser.id, currentUser.username, '更新文件编号', `将文件${doc.fileType}的编号从${oldNumber || '空'}更新为${newNumber || '空'}`);
}

// 打开编辑文件弹窗
function openEditDocumentModal(docId) {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    
    const editDocumentModal = document.getElementById('editDocumentModal');
    const editDocumentForm = document.getElementById('editDocumentForm');
    
    if (!editDocumentModal || !editDocumentForm) return;
    
    // 清空表单
    editDocumentForm.innerHTML = '';
    
    // 添加隐藏的ID字段
    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.id = 'editDocumentId';
    idInput.value = doc.id;
    editDocumentForm.appendChild(idInput);
    
    // 构建表单字段
    const formFields = [
        { name: 'date', label: '日期', type: 'date', value: doc.date, required: true },
        { name: 'fileType', label: '文件类型', type: 'select', value: doc.fileType, options: getFileTypes(), required: true },
        { name: 'documentNumber', label: '文件编号', type: 'text', value: doc.documentNumber },
        { name: 'department', label: '申请部门', type: 'select', value: doc.department, options: getDepartments(), required: true },
        { name: 'applicant', label: '申请人', type: 'text', value: doc.applicant, required: true },
        { name: 'content', label: '文件内容', type: 'textarea', value: doc.content, required: true },
        { name: 'unit', label: '计量单位', type: 'select', value: doc.unit, options: getUnits() },
        { name: 'quantity', label: '数量', type: 'number', value: doc.quantity, min: 0, step: 0.01 },
        { name: 'amount', label: '金额', type: 'number', value: doc.amount, min: 0, step: 0.01 },
        { name: 'status', label: '送签状态', type: 'select', value: doc.status, options: getStatuses(), required: true }
    ];
    
    formFields.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        const label = document.createElement('label');
        label.htmlFor = `edit${field.name.charAt(0).toUpperCase() + field.name.slice(1)}`;
        label.className = 'block text-sm font-medium text-gray-500 mb-1';
        label.textContent = field.label + (field.required ? ' <span class="text-danger">*</span>' : '');
        formGroup.appendChild(label);
        
        let input;
        
        if (field.type === 'select') {
            input = document.createElement('select');
            input.id = `edit${field.name.charAt(0).toUpperCase() + field.name.slice(1)}`;
            input.name = field.name;
            input.className = 'block w-full px-3 py-2 border border-gray-200 rounded-md';
            if (field.required) input.required = true;
            
            field.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                if (option === field.value) {
                    optionElement.selected = true;
                }
                input.appendChild(optionElement);
            });
        } else if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.id = `edit${field.name.charAt(0).toUpperCase() + field.name.slice(1)}`;
            input.name = field.name;
            input.rows = 3;
            input.className = 'block w-full px-3 py-2 border border-gray-200 rounded-md';
            input.value = field.value || '';
            if (field.required) input.required = true;
        } else {
            input = document.createElement('input');
            input.id = `edit${field.name.charAt(0).toUpperCase() + field.name.slice(1)}`;
            input.name = field.name;
            input.type = field.type;
            input.className = 'block w-full px-3 py-2 border border-gray-200 rounded-md';
            input.value = field.value || '';
            if (field.required) input.required = true;
            if (field.min !== undefined) input.min = field.min;
            if (field.step !== undefined) input.step = field.step;
            if (field.type === 'date') input.max = new Date().toISOString().split('T')[0];
        }
        
        formGroup.appendChild(input);
        editDocumentForm.appendChild(formGroup);
    });
    
    // 添加退回原因字段
    const rejectReasonGroup = document.createElement('div');
    rejectReasonGroup.className = 'form-group';
    rejectReasonGroup.id = 'editRejectReasonGroup';
    
    const rejectReasonLabel = document.createElement('label');
    rejectReasonLabel.htmlFor = 'editRejectReason';
    rejectReasonLabel.className = 'block text-sm font-medium text-gray-500 mb-1';
    rejectReasonLabel.textContent = '退回原因';
    rejectReasonGroup.appendChild(rejectReasonLabel);
    
    const rejectReasonTextarea = document.createElement('textarea');
    rejectReasonTextarea.id = 'editRejectReason';
    rejectReasonTextarea.name = 'rejectReason';
    rejectReasonTextarea.rows = 3;
    rejectReasonTextarea.className = 'block w-full px-3 py-2 border border-gray-200 rounded-md';
    rejectReasonTextarea.value = doc.rejectReason || '';
    rejectReasonGroup.appendChild(rejectReasonTextarea);
    
    editDocumentForm.appendChild(rejectReasonGroup);
    
    // 添加操作按钮
    const actionButtons = document.createElement('div');
    actionButtons.className = 'pt-2 flex justify-end space-x-4';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'px-6 py-2 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300 transition-colors';
    cancelBtn.textContent = '取消';
    cancelBtn.addEventListener('click', () => {
        editDocumentModal.classList.add('hidden');
    });
    actionButtons.appendChild(cancelBtn);
    
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors';
    submitBtn.textContent = '保存';
    actionButtons.appendChild(submitBtn);
    
    editDocumentForm.appendChild(actionButtons);
    
    // 状态变化事件
    const statusSelect = editDocumentForm.querySelector('select[name="status"]');
    if (statusSelect) {
        statusSelect.addEventListener('change', () => {
            const rejectReasonGroup = document.getElementById('editRejectReasonGroup');
            if (rejectReasonGroup) {
                rejectReasonGroup.style.display = statusSelect.value === '退回' ? 'block' : 'none';
            }
        });
        
        // 初始状态
        const rejectReasonGroup = document.getElementById('editRejectReasonGroup');
        if (rejectReasonGroup) {
            rejectReasonGroup.style.display = statusSelect.value === '退回' ? 'block' : 'none';
        }
    }
    
    // 表单提交事件
    editDocumentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleEditDocumentSubmit();
    });
    
    // 显示弹窗
    editDocumentModal.classList.remove('hidden');
}

// 处理编辑文件提交
function handleEditDocumentSubmit() {
    const editDocumentForm = document.getElementById('editDocumentForm');
    const editDocumentId = document.getElementById('editDocumentId').value;
    
    if (!editDocumentForm || !editDocumentId) return;
    
    const doc = documents.find(d => d.id === editDocumentId);
    if (!doc) return;
    
    // 获取表单数据
    const formData = {
        date: editDocumentForm.querySelector('input[name="date"]').value,
        fileType: editDocumentForm.querySelector('select[name="fileType"]').value,
        documentNumber: editDocumentForm.querySelector('input[name="documentNumber"]').value,
        department: editDocumentForm.querySelector('select[name="department"]').value,
        applicant: editDocumentForm.querySelector('input[name="applicant"]').value,
        content: editDocumentForm.querySelector('textarea[name="content"]').value,
        unit: editDocumentForm.querySelector('select[name="unit"]').value,
        quantity: parseFloat(editDocumentForm.querySelector('input[name="quantity"]').value) || 0,
        amount: parseFloat(editDocumentForm.querySelector('input[name="amount"]').value) || 0,
        status: editDocumentForm.querySelector('select[name="status"]').value,
        rejectReason: editDocumentForm.querySelector('textarea[name="rejectReason"]').value
    };
    
    // 表单验证
    const validation = validateForm(formData, {
        date: { required: true, message: '请选择日期' },
        fileType: { required: true, message: '请选择文件类型' },
        department: { required: true, message: '请选择申请部门' },
        applicant: { required: true, message: '请输入申请人' },
        content: { required: true, message: '请输入文件内容' },
        status: { required: true, message: '请选择送签状态' }
    });
    
    if (!validation.isValid) {
        showNotification(Object.values(validation.errors)[0], 'error');
        return;
    }
    
    // 更新文件数据
    const oldStatus = doc.status;
    
    Object.assign(doc, {
        ...formData,
        statusUpdateTime: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    // 如果状态为完毕，设置结束日期
    if (formData.status === '完毕' && !doc.endDate) {
        doc.endDate = new Date().toISOString().split('T')[0];
    }
    
    // 如果状态不是退回，清空退回原因
    if (formData.status !== '退回') {
        doc.rejectReason = null;
    }
    
    // 保存更新
    setDocuments(documents);
    
    // 添加操作日志
    addOperationLog(currentUser.id, currentUser.username, '编辑文件', `编辑了文件${doc.fileType}`);
    
    // 显示成功信息
    showNotification('文件信息更新成功', 'success');
    
    // 关闭弹窗
    const editDocumentModal = document.getElementById('editDocumentModal');
    if (editDocumentModal) {
        editDocumentModal.classList.add('hidden');
    }
    
    // 刷新列表
    searchAndFilterDocuments('process');
}

// 处理删除文件
function handleDeleteDocument(docId) {
    const docIndex = documents.findIndex(d => d.id === docId);
    if (docIndex === -1) return;
    
    const doc = documents[docIndex];
    
    // 删除文件
    documents.splice(docIndex, 1);
    setDocuments(documents);
    
    // 添加操作日志
    addOperationLog(currentUser.id, currentUser.username, '删除文件', `删除了文件${doc.fileType}`);
    
    // 显示成功信息
    showNotification('文件删除成功', 'success');
    
    // 刷新列表
    searchAndFilterDocuments('process');
}

// 处理批量更新状态
function handleBatchUpdateStatus() {
    const batchDocumentIds = document.getElementById('batchDocumentIds').value.split(',');
    const batchStatus = document.getElementById('batchStatus').value;
    const batchRejectReason = document.getElementById('batchRejectReason').value;
    const batchUpdateStatusModal = document.getElementById('batchUpdateStatusModal');
    
    if (!batchDocumentIds || batchDocumentIds.length === 0) return;
    
    let updatedCount = 0;
    
    // 更新选中的文件状态
    documents = documents.map(doc => {
        if (batchDocumentIds.includes(doc.id)) {
            const oldStatus = doc.status;
            
            const updatedDoc = {
                ...doc,
                status: batchStatus,
                statusUpdateTime: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // 如果状态为完毕，设置结束日期
            if (batchStatus === '完毕' && !doc.endDate) {
                updatedDoc.endDate = new Date().toISOString().split('T')[0];
            }
            
            // 如果状态为退回，设置退回原因
            if (batchStatus === '退回') {
                updatedDoc.rejectReason = batchRejectReason || null;
            } else {
                // 如果状态不是退回，清空退回原因
                updatedDoc.rejectReason = null;
            }
            
            updatedCount++;
            return updatedDoc;
        }
        return doc;
    });
    
    // 保存更新
    setDocuments(documents);
    
    // 添加操作日志
    addOperationLog(currentUser.id, currentUser.username, '批量更新状态', `将${updatedCount}个文件的状态更新为${batchStatus}`);
    
    // 显示成功信息
    showNotification(`成功更新${updatedCount}个文件的状态`, 'success');
    
    // 关闭弹窗
    if (batchUpdateStatusModal) {
        batchUpdateStatusModal.classList.add('hidden');
    }
    
    // 刷新列表
    searchAndFilterDocuments('process');
}

// 处理批量删除
function handleBatchDelete() {
    let deletedCount = 0;
    const deletedFileTypes = [];
    
    // 删除选中的文件
    documents = documents.filter(doc => {
        if (selectedDocumentIds.includes(doc.id)) {
            deletedCount++;
            deletedFileTypes.push(doc.fileType);
            return false;
        }
        return true;
    });
    
    // 保存更新
    setDocuments(documents);
    
    // 添加操作日志
    addOperationLog(currentUser.id, currentUser.username, '批量删除', `删除了${deletedCount}个文件`);
    
    // 显示成功信息
    showNotification(`成功删除${deletedCount}个文件`, 'success');
    
    // 清空选中的ID
    selectedDocumentIds = [];
    
    // 重置全选复选框
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
    }
    
    // 更新批量按钮状态
    updateBatchButtons();
    
    // 刷新列表
    searchAndFilterDocuments('process');
}

// 处理导出Excel
function handleExportExcel() {
    // 准备导出数据
    const exportData = filteredDocuments.map(doc => ({
        '日期': doc.date,
        '文件类型': doc.fileType,
        '文件编号': doc.documentNumber || '-',
        '申请部门': doc.department,
        '申请人': doc.applicant,
        '文件内容': doc.content,
        '计量单位': doc.unit,
        '数量': doc.quantity === 0 ? '/' : doc.quantity,
        '金额': doc.amount === 0 ? '/' : doc.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        '结束日期': doc.endDate || '-',
        '送签状态': doc.status,
        '状态更新时间': doc.statusUpdateTime ? formatDate(doc.statusUpdateTime, 'YYYY-MM-DD HH:mm:ss') : '',
        '退回原因': doc.rejectReason || '-'
    }));
    
    // 导出Excel
    exportToExcel(exportData, `文件走签记录_${formatDate(new Date(), 'YYYY-MM-DD')}.xlsx`);
    
    // 添加操作日志
    addOperationLog(currentUser.id, currentUser.username, '导出Excel', `导出了${exportData.length}条文件记录`);
}

// 设置系统设置页面
function setupSettingsPage() {
    // 加载设置数据
    loadSettingsData();
    
    // 设置文件类型管理
    setupSettingSection('fileTypes', '文件类型', '新增文件类型', '删除选中的文件类型');
    
    // 设置申请部门管理
    setupSettingSection('departments', '申请部门', '新增申请部门', '删除选中的申请部门');
    
    // 设置计量单位管理
    setupSettingSection('units', '计量单位', '新增计量单位', '删除选中的计量单位');
    
    // 设置送签状态管理
    setupSettingSection('statuses', '送签状态', '新增送签状态', '删除选中的送签状态');
    
    // 设置付款单位简称管理
    setupSettingSection('paymentUnits', '付款单位简称', '新增付款单位简称', '删除选中的付款单位简称');
    
    // 设置支付类型管理
    setupSettingSection('paymentTypes', '支付类型', '新增支付类型', '删除选中的支付类型');
    
    // 设置账号管理
    setupAccountManagement();
    
    // 设置操作日志
    setupOperationLogs();
}

// 加载设置数据
function loadSettingsData() {
    // 加载文件类型
    loadSettingData('fileTypes', getFileTypes());
    
    // 加载申请部门
    loadSettingData('departments', getDepartments());
    
    // 加载计量单位
    loadSettingData('units', getUnits());
    
    // 加载送签状态
    loadSettingData('statuses', getStatuses());
    
    // 加载付款单位简称
    loadSettingData('paymentUnits', getPaymentUnits());
    
    // 加载支付类型
    loadSettingData('paymentTypes', getPaymentTypes());
}

// 加载设置项数据
function loadSettingData(type, data) {
    const listContainer = document.getElementById(`${type}List`);
    const totalCountElement = document.getElementById(`${type}TotalCount`);
    
    if (!listContainer || !totalCountElement) return;
    
    // 更新总数
    totalCountElement.textContent = data.length;
    
    // 清空列表
    listContainer.innerHTML = '';
    
    // 显示列表
    if (data.length === 0) {
        listContainer.innerHTML = `
            <tr>
                <td colspan="3" class="py-6 text-center text-gray-500">暂无数据</td>
            </tr>
        `;
    } else {
        data.forEach((item, index) => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item}</td>
                <td>
                    <button class="delete-${type}-item text-danger hover:text-danger/80" data-value="${item}">
                        <i class="fa fa-trash"></i>
                    </button>
                </td>
            `;
            
            // 添加删除事件
            const deleteBtn = row.querySelector(`.delete-${type}-item`);
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    if (confirm(`确定要删除"${item}"吗？`)) {
                        handleDeleteSettingItem(type, item);
                    }
                });
            }
            
            listContainer.appendChild(row);
        });
    }
}

// 设置设置项管理
function setupSettingSection(type, title, addButtonText, deleteButtonText) {
    const addButton = document.getElementById(`add${type.charAt(0).toUpperCase() + type.slice(1)}Btn`);
    const batchDeleteButton = document.getElementById(`batchDelete${type.charAt(0).toUpperCase() + type.slice(1)}Btn`);
    const addModal = document.getElementById(`${type}AddModal`);
    const addForm = document.getElementById(`${type}AddForm`);
    
    if (!addButton || !batchDeleteButton || !addModal || !addForm) return;
    
    // 新增按钮事件
    addButton.addEventListener('click', () => {
        // 清空表单
        addForm.reset();
        
        // 显示弹窗
        addModal.classList.remove('hidden');
    });
    
    // 表单提交事件
    addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAddSettingItem(type);
    });
}

// 处理添加设置项
function handleAddSettingItem(type) {
    const addForm = document.getElementById(`${type}AddForm`);
    const addModal = document.getElementById(`${type}AddModal`);
    
    if (!addForm || !addModal) return;
    
    const inputElement = addForm.querySelector('input, textarea, select');
    const value = inputElement ? inputElement.value.trim() : '';
    
    if (!value) {
        showNotification('请输入内容', 'error');
        return;
    }
    
    // 获取现有数据
    let existingData = [];
    switch (type) {
        case 'fileTypes':
            existingData = getFileTypes();
            break;
        case 'departments':
            existingData = getDepartments();
            break;
        case 'units':
            existingData = getUnits();
            break;
        case 'statuses':
            existingData = getStatuses();
            break;
        case 'paymentUnits':
            existingData = getPaymentUnits();
            break;
        case 'paymentTypes':
            existingData = getPaymentTypes();
            break;
    }
    
    // 检查重复
    if (existingData.includes(value)) {
        showNotification('该内容已存在', 'error');
        return;
    }
    
    // 添加新数据
    existingData.push(value);
    
    // 保存数据
    switch (type) {
        case 'fileTypes':
            setFileTypes(existingData);
            break;
        case 'departments':
            setDepartments(existingData);
            break;
        case 'units':
            setUnits(existingData);
            break;
        case 'statuses':
            setStatuses(existingData);
            break;
        case 'paymentUnits':
            setPaymentUnits(existingData);
            break;
        case 'paymentTypes':
            setPaymentTypes(existingData);
            break;
    }
    
    // 添加操作日志
    addOperationLog(currentUser.id, currentUser.username, '添加设置项', `添加了${type === 'fileTypes' ? '文件类型' : type === 'departments' ? '申请部门' : type === 'units' ? '计量单位' : type === 'statuses' ? '送签状态' : type === 'paymentUnits' ? '付款单位简称' : '支付类型'}: ${value}`);
    
    // 显示成功信息
    showNotification('添加成功', 'success');
    
    // 关闭弹窗
    addModal.classList.add('hidden');
    
    // 刷新列表
    loadSettingData(type, existingData);
}

// 处理删除设置项
function handleDeleteSettingItem(type, value) {
    // 获取现有数据
    let existingData = [];
    switch (type) {
        case 'fileTypes':
            existingData = getFileTypes();
            break;
        case 'departments':
            existingData = getDepartments();
            break;
        case 'units':
            existingData = getUnits();
            break;
        case 'statuses':
            existingData = getStatuses();
            break;
        case 'paymentUnits':
            existingData = getPaymentUnits();
            break;
        case 'paymentTypes':
            existingData = getPaymentTypes();
            break;
    }
    
    // 删除数据
    existingData = existingData.filter(item => item !== value);
    
    // 保存数据
    switch (type) {
        case 'fileTypes':
            setFileTypes(existingData);
            break;
        case 'departments':
            setDepartments(existingData);
            break;
        case 'units':
            setUnits(existingData);
            break;
        case 'statuses':
            setStatuses(existingData);
            break;
        case 'paymentUnits':
            setPaymentUnits(existingData);
            break;
        case 'paymentTypes':
            setPaymentTypes(existingData);
            break;
    }
    
    // 添加操作日志
    addOperationLog(currentUser.id, currentUser.username, '删除设置项', `删除了${type === 'fileTypes' ? '文件类型' : type === 'departments' ? '申请部门' : type === 'units' ? '计量单位' : type === 'statuses' ? '送签状态' : type === 'paymentUnits' ? '付款单位简称' : '支付类型'}: ${value}`);
    
    // 显示成功信息
    showNotification('删除成功', 'success');
    
    // 刷新列表
    loadSettingData(type, existingData);
}

// 设置账号管理
function setupAccountManagement() {
    const addAccountBtn = document.getElementById('addAccountBtn');
    const accountsTable = document.getElementById('accountsTable');
    const addAccountModal = document.getElementById('addAccountModal');
    const addAccountForm = document.getElementById('addAccountForm');
    
    if (!addAccountBtn || !accountsTable || !addAccountModal || !addAccountForm) return;
    
    // 加载账号列表
    loadAccountsList();
    
    // 新增账号按钮事件
    addAccountBtn.addEventListener('click', () => {
        // 清空表单
        addAccountForm.reset();
        
        // 显示弹窗
        addAccountModal.classList.remove('hidden');
    });
    
    // 表单提交事件
    addAccountForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAddAccount();
    });
}

// 加载账号列表
function loadAccountsList() {
    const accountsTable = document.getElementById('accountsTable');
    const totalAccountsCount = document.getElementById('totalAccountsCount');
    
    if (!accountsTable || !totalAccountsCount) return;
    
    // 获取账号数据
    const accounts = getUsers();
    
    // 更新总数
    totalAccountsCount.textContent = accounts.length;
    
    // 清空表格
    accountsTable.innerHTML = '';
    
    // 显示列表
    if (accounts.length === 0) {
        accountsTable.innerHTML = `
            <tr>
                <td colspan="6" class="py-6 text-center text-gray-500">暂无账号</td>
            </tr>
        `;
    } else {
        accounts.forEach((account, index) => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            // 获取角色文本
            let roleText = '';
            switch (account.role) {
                case 'admin':
                    roleText = '总管理员';
                    break;
                case 'manager':
                    roleText = '普通管理员';
                    break;
                case 'user':
                    roleText = '普通账号';
                    break;
            }
            
            // 总管理员不能被编辑或删除
            const isAdmin = account.role === 'admin';
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${account.id}</td>
                <td>${account.username}</td>
                <td>${roleText}</td>
                <td>${account.needChangePassword ? '是' : '否'}</td>
                <td>
                    <select class="change-account-role text-sm border border-gray-200 rounded px-2 py-1" data-id="${account.id}" ${isAdmin ? 'disabled' : ''}>
                        <option value="admin" ${account.role === 'admin' ? 'selected' : ''}>总管理员</option>
                        <option value="manager" ${account.role === 'manager' ? 'selected' : ''}>普通管理员</option>
                        <option value="user" ${account.role === 'user' ? 'selected' : ''}>普通账号</option>
                    </select>
                </td>
                <td>
                    ${!isAdmin ? `
                        <button class="reset-account-password text-warning hover:text-warning/80 mr-2" data-id="${account.id}">
                            <i class="fa fa-key"></i>
                        </button>
                        <button class="delete-account text-danger hover:text-danger/80" data-id="${account.id}">
                            <i class="fa fa-trash"></i>
                        </button>
                    ` : '-'}
                </td>
            `;
            
            // 添加角色变更事件
            const roleSelect = row.querySelector('.change-account-role');
            if (roleSelect && !isAdmin) {
                roleSelect.addEventListener('change', (e) => {
                    handleChangeAccountRole(account.id, e.target.value);
                });
            }
            
            // 添加重置密码事件
            const resetPasswordBtn = row.querySelector('.reset-account-password');
            if (resetPasswordBtn) {
                resetPasswordBtn.addEventListener('click', () => {
                    handleResetAccountPassword(account.id);
                });
            }
            
            // 添加删除账号事件
            const deleteAccountBtn = row.querySelector('.delete-account');
            if (deleteAccountBtn) {
                deleteAccountBtn.addEventListener('click', () => {
                    handleDeleteAccount(account.id);
                });
            }
            
            accountsTable.appendChild(row);
        });
    }
}

// 处理添加账号
function handleAddAccount() {
    const addAccountForm = document.getElementById('addAccountForm');
    const addAccountModal = document.getElementById('addAccountModal');
    
    if (!addAccountForm || !addAccountModal) return;
    
    const accountId = addAccountForm.querySelector('input[name="accountId"]').value.trim();
    const username = addAccountForm.querySelector('input[name="username"]').value.trim();
    const password = addAccountForm.querySelector('input[name="password"]').value;
    const role = addAccountForm.querySelector('select[name="role"]').value;
    
    // 表单验证
    const validation = validateForm(
        { accountId, username, password, role },
        {
            accountId: { required: true, message: '请输入账号ID' },
            username: { required: true, message: '请输入用户名' },
            password: { required: true, message: '请输入密码' },
            role: { required: true, message: '请选择角色' }
        }
    );
    
    if (!validation.isValid) {
        showNotification(Object.values(validation.errors)[0], 'error');
        return;
    }
    
    // 获取现有账号
    const accounts = getUsers();
    
    // 检查账号ID是否已存在
    if (accounts.some(account => account.id === accountId)) {
        showNotification('账号ID已存在', 'error');
        return;
    }
    
    // 添加新账号
    const newAccount = {
        id: accountId,
        username,
        password,
        role,
        needChangePassword: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    accounts.push(newAccount);
    setUsers(accounts);
    
    // 添加操作日志
    addOperationLog(currentUser.id, currentUser.username, '添加账号', `添加了账号：${accountId}（${username}）`);
    
    // 显示成功信息
    showNotification('账号添加成功', 'success');
    
    // 关闭弹窗
    addAccountModal.classList.add('hidden');
    
    // 刷新列表
    loadAccountsList();
}

// 处理变更账号角色
function handleChangeAccountRole(accountId, newRole) {
    // 获取现有账号
    const accounts = getUsers();
    
    // 查找账号
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;
    
    const oldRole = account.role;
    
    // 更新角色
    account.role = newRole;
    account.updatedAt = new Date().toISOString();
    
    // 保存更新
    setUsers(accounts);
    
    // 添加操作日志
    addOperationLog(currentUser.id, currentUser.username, '变更账号角色', `将账号${accountId}（${account.username}）的角色从${oldRole === 'admin' ? '总管理员' : oldRole === 'manager' ? '普通管理员' : '普通账号'}更改为${newRole === 'admin' ? '总管理员' : newRole === 'manager' ? '普通管理员' : '普通账号'}`);
    
    // 显示成功信息
    showNotification('角色更新成功', 'success');
    
    // 刷新列表
    loadAccountsList();
}

// 处理重置账号密码
function handleResetAccountPassword(accountId) {
    const newPassword = prompt('请输入新密码：');
    
    if (newPassword === null) return;
    
    if (!newPassword.trim()) {
        showNotification('密码不能为空', 'error');
        return;
    }
    
    // 获取现有账号
    const accounts = getUsers();
    
    // 查找账号
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;
    
    // 更新密码
    account.password = newPassword;
    account.needChangePassword = false;
    account.updatedAt = new Date().toISOString();
    
    // 保存更新
    setUsers(accounts);
    
    // 添加操作日志
    addOperationLog(currentUser.id, currentUser.username, '重置密码', `重置了账号${accountId}（${account.username}）的密码`);
    
    // 显示成功信息
    showNotification('密码重置成功', 'success');
}

// 处理删除账号
function handleDeleteAccount(accountId) {
    if (confirm('确定要删除此账号吗？')) {
        // 获取现有账号
        const accounts = getUsers();
        
        // 查找账号
        const account = accounts.find(acc => acc.id === accountId);
        if (!account) return;
        
        // 删除账号
        const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
        setUsers(updatedAccounts);
        
        // 添加操作日志
        addOperationLog(currentUser.id, currentUser.username, '删除账号', `删除了账号${accountId}（${account.username}）`);
        
        // 显示成功信息
        showNotification('账号删除成功', 'success');
        
        // 刷新列表
        loadAccountsList();
    }
}

// 设置操作日志
function setupOperationLogs() {
    const refreshLogsBtn = document.getElementById('refreshLogsBtn');
    
    // 加载操作日志
    loadOperationLogs();
    
    // 刷新按钮事件
    if (refreshLogsBtn) {
        refreshLogsBtn.addEventListener('click', loadOperationLogs);
    }
}

// 加载操作日志
function loadOperationLogs() {
    const logsTable = document.getElementById('logsTable');
    const totalLogsCount = document.getElementById('totalLogsCount');
    
    if (!logsTable || !totalLogsCount) return;
    
    // 获取操作日志
    const logs = getOperationLogs();
    
    // 更新总数
    totalLogsCount.textContent = logs.length;
    
    // 清空表格
    logsTable.innerHTML = '';
    
    // 显示列表（按时间倒序）
    if (logs.length === 0) {
        logsTable.innerHTML = `
            <tr>
                <td colspan="4" class="py-6 text-center text-gray-500">暂无操作日志</td>
            </tr>
        `;
    } else {
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .forEach((log, index) => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50';
                
                // 获取操作类型样式
                let operationClass = '';
                switch (log.operation) {
                    case '登录':
                    case '退出':
                        operationClass = 'badge-info';
                        break;
                    case '文件登记':
                        operationClass = 'badge-success';
                        break;
                    case '更新状态':
                    case '批量更新状态':
                    case '编辑文件':
                        operationClass = 'badge-warning';
                        break;
                    case '删除文件':
                    case '批量删除':
                        operationClass = 'badge-danger';
                        break;
                    default:
                        operationClass = 'badge-primary';
                }
                
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${formatDate(log.timestamp, 'YYYY-MM-DD HH:mm:ss')}</td>
                    <td>${log.username}</td>
                    <td>
                        <span class="badge ${operationClass}">${log.operation}</span>
                    </td>
                    <td>${log.details}</td>
                `;
                
                logsTable.appendChild(row);
            });
    }
}

// 初始化系统
init();