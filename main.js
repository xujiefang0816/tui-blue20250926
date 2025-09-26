// 主功能实现

// 初始化系统
function initSystem() {
    // 初始化认证系统
    auth.initAuth();
    
    // 初始化日期选择器
    initDatePicker();
    
    // 初始化文件类型选择器
    initSelectors();
    
    // 初始化文件登记表单
    initFileRegisterForm();
    
    // 初始化搜索筛选功能
    initSearchFilters();
    
    // 初始化文件处理功能
    initFileProcess();
    
    // 初始化系统设置功能
    initSystemSettings();
    
    // 初始化模态框
    initModals();
}

// 初始化日期选择器
function initDatePicker() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('register-date');
    if (dateInput) {
        dateInput.value = today;
        dateInput.max = today;
    }
}

// 初始化选择器
function initSelectors() {
    const data = db.getData();
    
    // 初始化文件类型选择器
    const fileTypeSelect = document.getElementById('file-type');
    const filterTypeSelect = document.getElementById('filter-type');
    if (fileTypeSelect) {
        populateSelect(fileTypeSelect, data.fileTypes);
        populateSelect(filterTypeSelect, data.fileTypes, true);
    }
    
    // 初始化部门选择器
    const departmentSelect = document.getElementById('department');
    const filterDepartmentSelect = document.getElementById('filter-department');
    if (departmentSelect) {
        populateSelect(departmentSelect, data.departments);
        populateSelect(filterDepartmentSelect, data.departments, true);
    }
    
    // 初始化计量单位选择器
    const unitSelect = document.getElementById('unit');
    if (unitSelect) {
        populateSelect(unitSelect, data.units);
    }
    
    // 初始化送签状态选择器
    const filterStatusSelect = document.getElementById('filter-status');
    const batchStatusSelect = document.getElementById('batch-status');
    const updateStatusSelect = document.getElementById('update-status');
    if (filterStatusSelect) {
        populateSelect(filterStatusSelect, data.statuses, true);
        populateSelect(batchStatusSelect, data.statuses);
        populateSelect(updateStatusSelect, data.statuses);
    }
    
    // 初始化付款单位选择器
    const paymentCompanySelect = document.getElementById('payment-company');
    if (paymentCompanySelect) {
        populateSelect(paymentCompanySelect, data.companies);
    }
    
    // 初始化支付类型选择器
    const paymentMethodSelect = document.getElementById('payment-method');
    if (paymentMethodSelect) {
        populateSelect(paymentMethodSelect, data.paymentMethods);
    }
}

// 填充选择器选项
function populateSelect(selectElement, options, addAllOption = false) {
    if (!selectElement) return;
    
    selectElement.innerHTML = '';
    
    if (addAllOption) {
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = '全部';
        selectElement.appendChild(allOption);
    }
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });
}

// 初始化文件登记表单
function initFileRegisterForm() {
    const form = document.getElementById('file-register-form');
    if (!form) return;
    
    // 文件类型变化事件
    const fileTypeSelect = document.getElementById('file-type');
    fileTypeSelect.addEventListener('change', toggleContentSection);
    
    // 添加工计量单位按钮事件
    const addMeasureBtn = document.getElementById('add-measure-btn');
    addMeasureBtn.addEventListener('click', addMeasureItem);
    
    // 表单提交事件
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitFile();
    });
    
    // 初始化内容区域显示
    toggleContentSection();
}

// 切换内容区域显示
function toggleContentSection() {
    const fileTypeSelect = document.getElementById('file-type');
    const contentSection = document.getElementById('content-section');
    const summarySection = document.getElementById('summary-section');
    
    const selectedType = fileTypeSelect.value;
    if (selectedType === '付款申请单' || selectedType === '付款单+用印审批（仅限验收报告）') {
        contentSection.style.display = 'none';
        summarySection.style.display = 'block';
    } else {
        contentSection.style.display = 'block';
        summarySection.style.display = 'none';
    }
}

// 添加工计量单位项
function addMeasureItem() {
    const measureSection = document.querySelector('.measure-section');
    const addButton = document.getElementById('add-measure-btn');
    
    const measureItem = document.createElement('div');
    measureItem.className = 'measure-item';
    
    const data = db.getData();
    
    measureItem.innerHTML = `
        <div class="form-group">
            <label>计量单位</label>
            <select class="dynamic-unit">
                ${data.units.map(unit => `<option value="${unit}">${unit}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>数量</label>
            <input type="number" class="dynamic-quantity" min="0" step="0.01">
        </div>
        <div class="form-group">
            <label>金额</label>
            <input type="number" class="dynamic-amount" min="0" step="0.01">
        </div>
        <button type="button" class="remove-measure-btn" style="align-self: flex-end; background: none; border: none; color: #ff4d4f; cursor: pointer;">×</button>
    `;
    
    // 添加删除按钮事件
    measureItem.querySelector('.remove-measure-btn').addEventListener('click', () => {
        measureItem.remove();
    });
    
    measureSection.insertBefore(measureItem, addButton);
}

// 提交文件
function submitFile() {
    const date = document.getElementById('register-date').value;
    const fileType = document.getElementById('file-type').value;
    const department = document.getElementById('department').value;
    const applicant = document.getElementById('applicant').value;
    
    let fileContent = '';
    const contentSection = document.getElementById('content-section');
    const summarySection = document.getElementById('summary-section');
    
    if (contentSection.style.display !== 'none') {
        fileContent = document.getElementById('file-content').value;
    } else {
        const paymentType = document.getElementById('payment-type').value;
        const paymentItem = document.getElementById('payment-item').value;
        const paymentMethod = document.getElementById('payment-method').value;
        const paymentPeriod = document.getElementById('payment-period').value;
        const paymentCompany = document.getElementById('payment-company').value;
        
        // 构建摘要
        fileContent = `${paymentType}-${paymentItem}-${paymentMethod}(${paymentPeriod}--${paymentCompany})`;
    }
    
    // 收集计量单位、数量、金额
    const measures = [];
    
    // 收集主计量单位
    const mainUnit = document.getElementById('unit').value;
    const mainQuantity = document.getElementById('quantity').value;
    const mainAmount = document.getElementById('amount').value;
    
    if (mainUnit) {
        measures.push({
            unit: mainUnit,
            quantity: mainQuantity || 0,
            amount: mainAmount || 0
        });
    }
    
    // 收集动态添加的计量单位
    const dynamicUnits = document.querySelectorAll('.dynamic-unit');
    const dynamicQuantities = document.querySelectorAll('.dynamic-quantity');
    const dynamicAmounts = document.querySelectorAll('.dynamic-amount');
    
    for (let i = 0; i < dynamicUnits.length; i++) {
        if (dynamicUnits[i].value) {
            measures.push({
                unit: dynamicUnits[i].value,
                quantity: dynamicQuantities[i].value || 0,
                amount: dynamicAmounts[i].value || 0
            });
        }
    }
    
    // 验证数据
    if (!date || !fileType || !department || !applicant || measures.length === 0) {
        alert('请填写所有必填字段');
        return;
    }
    
    // 提交文件数据
    const fileData = {
        date: date,
        fileType: fileType,
        department: department,
        applicant: applicant,
        fileContent: fileContent,
        measures: measures
    };
    
    const fileId = db.addFile(fileData);
    if (fileId) {
        alert('文件提交成功！');
        form.reset();
        initDatePicker();
        toggleContentSection();
    } else {
        alert('文件提交失败，请重试');
    }
}

// 初始化搜索筛选功能
function initSearchFilters() {
    // 文件信息页面搜索筛选
    const searchInput = document.getElementById('search-info');
    const filterType = document.getElementById('filter-type');
    const filterDepartment = document.getElementById('filter-department');
    const filterStatus = document.getElementById('filter-status');
    const refreshInfoBtn = document.getElementById('refresh-info-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', loadFileInfo);
        filterType.addEventListener('change', loadFileInfo);
        filterDepartment.addEventListener('change', loadFileInfo);
        filterStatus.addEventListener('change', loadFileInfo);
        refreshInfoBtn.addEventListener('click', loadFileInfo);
    }
    
    // 文件处理页面刷新按钮
    const refreshProcessBtn = document.getElementById('refresh-process-btn');
    if (refreshProcessBtn) {
        refreshProcessBtn.addEventListener('click', loadFileProcess);
    }
}

// 加载文件信息
function loadFileInfo() {
    const searchInput = document.getElementById('search-info');
    const filterType = document.getElementById('filter-type');
    const filterDepartment = document.getElementById('filter-department');
    const filterStatus = document.getElementById('filter-status');
    const tableBody = document.getElementById('file-info-table').querySelector('tbody');
    
    if (!tableBody) return;
    
    // 获取筛选条件
    const filters = {
        search: searchInput.value,
        type: filterType.value,
        department: filterDepartment.value,
        status: filterStatus.value
    };
    
    // 获取文件数据
    const files = db.getFiles(filters);
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 填充表格
    if (files.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="13" style="text-align: center; padding: 2rem;">暂无文件信息</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    files.forEach(file => {
        const row = document.createElement('tr');
        
        // 格式化数量和金额
        const measureText = file.measures.map(m => {
            const quantity = m.quantity === 0 || m.quantity === '0' ? '/' : m.quantity;
            const amount = m.amount === 0 || m.amount === '0' ? '/' : m.amount;
            return `${m.unit}: ${quantity}/${amount}`;
        }).join('<br>');
        
        // 格式化状态更新时间
        const statusUpdateTime = file.statusUpdateTime ? new Date(file.statusUpdateTime).toLocaleString('zh-CN') : '-';
        
        row.innerHTML = `
            <td>${file.date}</td>
            <td>${file.fileType}</td>
            <td>${file.fileNumber || '-'}</td>
            <td>${file.department}</td>
            <td>${file.applicant}</td>
            <td>${file.fileContent}</td>
            <td>${file.measures.map(m => m.unit).join('<br>')}</td>
            <td>${file.measures.map(m => (m.quantity === 0 || m.quantity === '0') ? '/' : m.quantity).join('<br>')}</td>
            <td>${file.measures.map(m => (m.amount === 0 || m.amount === '0') ? '/' : m.amount).join('<br>')}</td>
            <td>${file.endDate || '-'}</td>
            <td>${file.status}</td>
            <td>${statusUpdateTime}</td>
            <td>${file.rejectReason || '-'}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// 初始化文件处理功能
function initFileProcess() {
    // 全选按钮
    const selectAllBtn = document.getElementById('select-all');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('change', toggleSelectAll);
    }
    
    // 批量更新状态按钮
    const batchUpdateBtn = document.getElementById('batch-update-btn');
    if (batchUpdateBtn) {
        batchUpdateBtn.addEventListener('click', batchUpdateStatus);
    }
    
    // 批量删除按钮
    const batchDeleteBtn = document.getElementById('batch-delete-btn');
    if (batchDeleteBtn) {
        batchDeleteBtn.addEventListener('click', batchDeleteFiles);
    }
    
    // 导出Excel按钮
    const exportExcelBtn = document.getElementById('export-excel-btn');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', exportToExcel);
    }
}

// 加载文件处理数据
function loadFileProcess() {
    const tableBody = document.getElementById('file-process-table').querySelector('tbody');
    
    if (!tableBody) return;
    
    // 获取所有文件数据
    const files = db.getFiles();
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 填充表格
    if (files.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="13" style="text-align: center; padding: 2rem;">暂无文件信息</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    files.forEach(file => {
        const row = document.createElement('tr');
        row.dataset.id = file.id;
        
        // 格式化数量和金额
        const measureText = file.measures.map(m => {
            const quantity = m.quantity === 0 || m.quantity === '0' ? '/' : m.quantity;
            const amount = m.amount === 0 || m.amount === '0' ? '/' : m.amount;
            return `${m.unit}: ${quantity}/${amount}`;
        }).join('<br>');
        
        row.innerHTML = `
            <td><input type="checkbox" class="file-checkbox"></td>
            <td>${file.date}</td>
            <td>${file.fileType}</td>
            <td class="file-number" data-id="${file.id}" ${file.status === '完毕' ? 'contenteditable="true"' : ''}>
                ${file.fileNumber || (file.status === '完毕' ? '[点击编辑]' : '-')}
            </td>
            <td>${file.department}</td>
            <td>${file.applicant}</td>
            <td>${file.fileContent}</td>
            <td>${file.measures.map(m => m.unit).join('<br>')}</td>
            <td>${file.measures.map(m => (m.quantity === 0 || m.quantity === '0') ? '/' : m.quantity).join('<br>')}</td>
            <td>${file.measures.map(m => (m.amount === 0 || m.amount === '0') ? '/' : m.amount).join('<br>')}</td>
            <td>${file.endDate || '-'}</td>
            <td>${file.status}</td>
            <td>
                <button class="edit-file-btn btn-secondary" style="margin-bottom: 0.5rem;">编辑</button>
                <button class="update-status-btn btn-secondary" style="margin-bottom: 0.5rem;">更新状态</button>
                <button class="delete-file-btn btn-danger">删除</button>
            </td>
        `;
        
        // 添加事件监听
        const checkbox = row.querySelector('.file-checkbox');
        checkbox.addEventListener('change', () => {
            document.getElementById('select-all').checked = 
                document.querySelectorAll('.file-checkbox:checked').length === 
                document.querySelectorAll('.file-checkbox').length;
        });
        
        // 文件编号编辑事件
        const fileNumberCell = row.querySelector('.file-number');
        if (fileNumberCell.hasAttribute('contenteditable')) {
            fileNumberCell.addEventListener('blur', () => {
                const newNumber = fileNumberCell.textContent.trim();
                db.updateFile(file.id, { fileNumber: newNumber });
            });
        }
        
        // 编辑按钮事件
        const editBtn = row.querySelector('.edit-file-btn');
        editBtn.addEventListener('click', () => showEditFileModal(file.id));
        
        // 更新状态按钮事件
        const statusBtn = row.querySelector('.update-status-btn');
        statusBtn.addEventListener('click', () => showStatusUpdateModal(file.id));
        
        // 删除按钮事件
        const deleteBtn = row.querySelector('.delete-file-btn');
        deleteBtn.addEventListener('click', () => {
            if (confirm('确定要删除这条文件信息吗？')) {
                db.deleteFile(file.id);
                loadFileProcess();
                loadFileInfo(); // 同时刷新文件信息页面
            }
        });
        
        tableBody.appendChild(row);
    });
}

// 切换全选
function toggleSelectAll() {
    const isChecked = document.getElementById('select-all').checked;
    const checkboxes = document.querySelectorAll('.file-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
}

// 批量更新状态
function batchUpdateStatus() {
    const statusSelect = document.getElementById('batch-status');
    const status = statusSelect.value;
    
    if (!status) {
        alert('请选择要更新的状态');
        return;
    }
    
    const checkboxes = document.querySelectorAll('.file-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('请选择要更新的文件');
        return;
    }
    
    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const fileId = parseInt(row.dataset.id);
        db.updateFileStatus(fileId, status);
    });
    
    alert(`已批量更新 ${checkboxes.length} 条文件的状态为 ${status}`);
    loadFileProcess();
    loadFileInfo(); // 同时刷新文件信息页面
}

// 批量删除文件
function batchDeleteFiles() {
    const checkboxes = document.querySelectorAll('.file-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('请选择要删除的文件');
        return;
    }
    
    if (!confirm(`确定要删除选中的 ${checkboxes.length} 条文件信息吗？`)) {
        return;
    }
    
    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const fileId = parseInt(row.dataset.id);
        db.deleteFile(fileId);
    });
    
    alert(`已批量删除 ${checkboxes.length} 条文件信息`);
    loadFileProcess();
    loadFileInfo(); // 同时刷新文件信息页面
}

// 导出Excel
function exportToExcel() {
    const files = db.getFiles();
    if (files.length === 0) {
        alert('暂无数据可导出');
        return;
    }
    
    // 创建CSV内容
    let csvContent = '日期,文件类型,文件编号,申请部门,申请人,文件内容,计量单位,数量,金额,结束日期,送签状态\n';
    
    files.forEach(file => {
        file.measures.forEach((measure, index) => {
            const quantity = measure.quantity === 0 || measure.quantity === '0' ? '/' : measure.quantity;
            const amount = measure.amount === 0 || measure.amount === '0' ? '/' : measure.amount;
            
            // 只有第一条记录包含完整信息，其他记录只包含计量单位、数量和金额
            if (index === 0) {
                csvContent += `"${file.date}","${file.fileType}","${file.fileNumber || '-"},"${file.department}","${file.applicant}","${file.fileContent}","${measure.unit}","${quantity}","${amount}","${file.endDate || '-"},"${file.status}"\n`;
            } else {
                csvContent += `,,,,,,,"${measure.unit}","${quantity}","${amount}",\n`;
            }
        });
    });
    
    // 创建Blob并下载
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `文件信息_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 初始化系统设置
function initSystemSettings() {
    // 文件类型设置
    document.getElementById('add-file-type-btn').addEventListener('click', () => {
        const value = document.getElementById('new-file-type').value.trim();
        if (value && db.addSetting('fileTypes', value)) {
            loadSystemSettings();
            document.getElementById('new-file-type').value = '';
        }
    });
    
    // 部门设置
    document.getElementById('add-department-btn').addEventListener('click', () => {
        const value = document.getElementById('new-department').value.trim();
        if (value && db.addSetting('departments', value)) {
            loadSystemSettings();
            document.getElementById('new-department').value = '';
        }
    });
    
    // 计量单位设置
    document.getElementById('add-unit-btn').addEventListener('click', () => {
        const value = document.getElementById('new-unit').value.trim();
        if (value && db.addSetting('units', value)) {
            loadSystemSettings();
            document.getElementById('new-unit').value = '';
        }
    });
    
    // 送签状态设置
    document.getElementById('add-status-btn').addEventListener('click', () => {
        const value = document.getElementById('new-status').value.trim();
        if (value && db.addSetting('statuses', value)) {
            loadSystemSettings();
            document.getElementById('new-status').value = '';
        }
    });
    
    // 付款单位设置
    document.getElementById('add-company-btn').addEventListener('click', () => {
        const value = document.getElementById('new-company').value.trim();
        if (value && db.addSetting('companies', value)) {
            loadSystemSettings();
            document.getElementById('new-company').value = '';
        }
    });
    
    // 支付类型设置
    document.getElementById('add-payment-method-btn').addEventListener('click', () => {
        const value = document.getElementById('new-payment-method').value.trim();
        if (value && db.addSetting('paymentMethods', value)) {
            loadSystemSettings();
            document.getElementById('new-payment-method').value = '';
        }
    });
    
    // 账号管理
    document.getElementById('add-account-btn').addEventListener('click', () => {
        const username = document.getElementById('new-username').value.trim();
        const password = document.getElementById('new-password').value.trim();
        const role = document.getElementById('new-role').value;
        
        if (!username || !password) {
            alert('请填写用户名和密码');
            return;
        }
        
        if (db.getAccount(username)) {
            alert('用户名已存在');
            return;
        }
        
        db.addAccount(username, password, role);
        loadSystemSettings();
        
        // 清空表单
        document.getElementById('new-username').value = '';
        document.getElementById('new-password').value = '';
    });
}

// 加载系统设置
function loadSystemSettings() {
    const data = db.getData();
    
    // 加载文件类型列表
    loadSettingList('file-type-list', data.fileTypes, 'fileTypes');
    
    // 加载部门列表
    loadSettingList('department-list', data.departments, 'departments');
    
    // 加载计量单位列表
    loadSettingList('unit-list', data.units, 'units');
    
    // 加载送签状态列表
    loadSettingList('status-list', data.statuses, 'statuses');
    
    // 加载付款单位列表
    loadSettingList('company-list', data.companies, 'companies');
    
    // 加载支付类型列表
    loadSettingList('payment-method-list', data.paymentMethods, 'paymentMethods');
    
    // 加载账号列表
    loadAccountList();
    
    // 加载操作日志
    loadLogList();
    
    // 重新初始化选择器
    initSelectors();
}

// 加载设置列表
function loadSettingList(elementId, items, settingType) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    container.innerHTML = '';
    
    items.forEach(item => {
        const tag = document.createElement('div');
        tag.className = 'setting-item-tag';
        tag.innerHTML = `
            ${item}
            <button class="remove-tag-btn" data-type="${settingType}" data-value="${item}">×</button>
        `;
        
        // 添加删除事件
        const removeBtn = tag.querySelector('.remove-tag-btn');
        removeBtn.addEventListener('click', () => {
            db.removeSetting(settingType, item);
            loadSystemSettings();
        });
        
        container.appendChild(tag);
    });
}

// 加载账号列表
function loadAccountList() {
    const container = document.getElementById('account-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    const accounts = db.getData().accounts;
    accounts.forEach(account => {
        const accountItem = document.createElement('div');
        accountItem.className = 'account-item';
        
        // 不能删除总管理员账号
        const canDelete = !(account.role === 'superadmin' && accounts.filter(a => a.role === 'superadmin').length <= 1);
        
        accountItem.innerHTML = `
            <span>${account.username} (${getRoleName(account.role)})</span>
            <select class="change-role" data-id="${account.id}">
                <option value="normal" ${account.role === 'normal' ? 'selected' : ''}>普通账号</option>
                <option value="admin" ${account.role === 'admin' ? 'selected' : ''}>普通管理员</option>
                <option value="superadmin" ${account.role === 'superadmin' ? 'selected' : ''} ${account.id === 1 ? 'disabled' : ''}>总管理员</option>
            </select>
            <button class="reset-password-btn btn-secondary" data-id="${account.id}">重置密码</button>
            <button class="delete-account-btn btn-danger" data-id="${account.id}" ${!canDelete ? 'disabled title="至少保留一个总管理员账号"' : ''}>删除</button>
        `;
        
        // 更改角色事件
        const roleSelect = accountItem.querySelector('.change-role');
        roleSelect.addEventListener('change', () => {
            const newRole = roleSelect.value;
            db.updateAccount(account.id, { role: newRole });
            loadSystemSettings();
        });
        
        // 重置密码事件
        const resetPasswordBtn = accountItem.querySelector('.reset-password-btn');
        resetPasswordBtn.addEventListener('click', () => {
            if (confirm(`确定要重置账号 ${account.username} 的密码吗？重置后密码将变为用户名。`)) {
                db.updateAccount(account.id, { 
                    password: account.username, 
                    needChangePassword: account.role !== 'superadmin'
                });
                alert(`账号 ${account.username} 的密码已重置为 ${account.username}`);
            }
        });
        
        // 删除账号事件
        const deleteAccountBtn = accountItem.querySelector('.delete-account-btn');
        if (canDelete) {
            deleteAccountBtn.addEventListener('click', () => {
                if (confirm(`确定要删除账号 ${account.username} 吗？`)) {
                    db.deleteAccount(account.id);
                    loadSystemSettings();
                }
            });
        }
        
        container.appendChild(accountItem);
    });
}

// 加载日志列表
function loadLogList() {
    const container = document.getElementById('log-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    const logs = db.getLogs();
    
    if (logs.length === 0) {
        container.innerHTML = '<p>暂无操作日志</p>';
        return;
    }
    
    logs.forEach(log => {
        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        logItem.style.padding = '0.5rem 0';
        logItem.style.borderBottom = '1px solid #f0f0f0';
        
        const time = new Date(log.time).toLocaleString('zh-CN');
        
        logItem.innerHTML = `
            <div style="font-size: 0.9rem; color: #666;">${time} - ${log.user}</div>
            <div style="font-weight: 500; margin: 0.25rem 0;">${log.action}</div>
            <div style="font-size: 0.9rem; color: #999;">${log.details}</div>
        `;
        
        container.appendChild(logItem);
    });
}

// 初始化模态框
function initModals() {
    // 编辑文件模态框
    const editModal = document.getElementById('edit-file-modal');
    if (editModal) {
        editModal.querySelector('.close').addEventListener('click', () => {
            editModal.style.display = 'none';
        });
        
        document.getElementById('edit-file-form').addEventListener('submit', (e) => {
            e.preventDefault();
            submitEditFile();
        });
    }
    
    // 状态更新模态框
    const statusModal = document.getElementById('status-update-modal');
    if (statusModal) {
        statusModal.querySelector('.close').addEventListener('click', () => {
            statusModal.style.display = 'none';
        });
        
        document.getElementById('update-status').addEventListener('change', toggleRejectReason);
        
        document.getElementById('status-update-form').addEventListener('submit', (e) => {
            e.preventDefault();
            submitStatusUpdate();
        });
    }
}

// 显示编辑文件模态框
function showEditFileModal(fileId) {
    const file = db.getFileById(fileId);
    if (!file) return;
    
    const modal = document.getElementById('edit-file-modal');
    const form = document.getElementById('edit-file-form');
    
    // 设置文件ID
    document.getElementById('edit-file-id').value = fileId;
    
    // 动态生成表单内容
    form.innerHTML = `
        <input type="hidden" id="edit-file-id" value="${fileId}">
        <div class="form-group">
            <label>日期</label>
            <input type="date" id="edit-date" value="${file.date}" max="${new Date().toISOString().split('T')[0]}" required>
        </div>
        <div class="form-group">
            <label>文件类型</label>
            <select id="edit-file-type" required>
                ${db.getData().fileTypes.map(type => `<option value="${type}" ${type === file.fileType ? 'selected' : ''}>${type}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>部门</label>
            <select id="edit-department" required>
                ${db.getData().departments.map(dept => `<option value="${dept}" ${dept === file.department ? 'selected' : ''}>${dept}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>申请人</label>
            <input type="text" id="edit-applicant" value="${file.applicant}" required>
        </div>
        <div class="form-group">
            <label>文件内容</label>
            <textarea id="edit-file-content" rows="4" required>${file.fileContent}</textarea>
        </div>
        <div class="form-group">
            <label>文件编号</label>
            <input type="text" id="edit-file-number" value="${file.fileNumber || ''}">
        </div>
        <button type="submit" class="btn-primary">保存修改</button>
    `;
    
    // 显示模态框
    modal.style.display = 'flex';
}

// 提交编辑文件
function submitEditFile() {
    const fileId = parseInt(document.getElementById('edit-file-id').value);
    const date = document.getElementById('edit-date').value;
    const fileType = document.getElementById('edit-file-type').value;
    const department = document.getElementById('edit-department').value;
    const applicant = document.getElementById('edit-applicant').value;
    const fileContent = document.getElementById('edit-file-content').value;
    const fileNumber = document.getElementById('edit-file-number').value;
    
    const fileData = {
        date: date,
        fileType: fileType,
        department: department,
        applicant: applicant,
        fileContent: fileContent,
        fileNumber: fileNumber
    };
    
    if (db.updateFile(fileId, fileData)) {
        alert('文件信息已更新');
        document.getElementById('edit-file-modal').style.display = 'none';
        loadFileProcess();
        loadFileInfo(); // 同时刷新文件信息页面
    } else {
        alert('文件信息更新失败');
    }
}

// 显示状态更新模态框
function showStatusUpdateModal(fileId) {
    const modal = document.getElementById('status-update-modal');
    
    // 设置文件ID
    document.getElementById('status-file-id').value = fileId;
    
    // 清空退回原因
    document.getElementById('reject-reason').value = '';
    
    // 显示模态框
    modal.style.display = 'flex';
    
    // 初始化退回原因显示
    toggleRejectReason();
}

// 切换退回原因显示
function toggleRejectReason() {
    const statusSelect = document.getElementById('update-status');
    const reasonContainer = document.getElementById('reject-reason-container');
    
    if (statusSelect.value === '退回') {
        reasonContainer.style.display = 'block';
    } else {
        reasonContainer.style.display = 'none';
    }
}

// 提交状态更新
function submitStatusUpdate() {
    const fileId = parseInt(document.getElementById('status-file-id').value);
    const status = document.getElementById('update-status').value;
    let reason = '';
    
    if (status === '退回') {
        reason = document.getElementById('reject-reason').value.trim();
        if (!reason) {
            alert('请填写退回原因');
            return;
        }
    }
    
    if (db.updateFileStatus(fileId, status, reason)) {
        alert('文件状态已更新');
        document.getElementById('status-update-modal').style.display = 'none';
        loadFileProcess();
        loadFileInfo(); // 同时刷新文件信息页面
    } else {
        alert('文件状态更新失败');
    }
}

// 页面加载完成后初始化系统
window.addEventListener('load', initSystem);