// 文件处理相关功能
import { showSuccess, showError, formatDateTime, loadFromLocalStorage, saveToLocalStorage, addLog, exportToExcel } from './utils.js';
import { getCurrentUser } from './auth.js';

// 加载文件数据
export function loadFiles() {
    return loadFromLocalStorage('files', []);
}

// 显示文件处理列表
export function displayFileProcessList(files) {
    const fileListTable = document.getElementById('process-file-list');
    const fileListBody = fileListTable.querySelector('tbody');
    fileListBody.innerHTML = '';
    
    if (files.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="14" class="text-center">暂无文件数据</td>
        `;
        fileListBody.appendChild(emptyRow);
        return;
    }
    
    files.forEach(file => {
        const row = document.createElement('tr');
        
        // 格式化日期
        const date = new Date(file.date).toLocaleDateString('zh-CN');
        const endDate = file.endDate ? new Date(file.endDate).toLocaleDateString('zh-CN') : '';
        
        // 文件编号编辑区域
        let fileNumberHtml = `
            <input type="text" class="form-input small" value="${file.fileNumber || ''}" data-id="${file.id}" data-field="fileNumber">
        `;
        
        // 显示退回原因
        let rejectReasonHtml = '';
        if (file.status === '退回' && file.rejectReason) {
            rejectReasonHtml = `<div class="reject-reason">${file.rejectReason}</div>`;
        }
        
        row.innerHTML = `
            <td><input type="checkbox" class="file-checkbox" data-id="${file.id}"></td>
            <td>${date}</td>
            <td>${file.fileType}</td>
            <td>${fileNumberHtml}</td>
            <td>${file.department}</td>
            <td>${file.applicant}</td>
            <td>${file.content}</td>
            <td>${file.unit}</td>
            <td>${file.quantity}</td>
            <td>${file.amount}</td>
            <td>${endDate}</td>
            <td>
                <select class="form-select small status-select" data-id="${file.id}">
                    <option value="">请选择</option>
                </select>
            </td>
            <td>${file.statusUpdateTime ? formatDateTime(file.statusUpdateTime) : ''}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-btn" data-id="${file.id}">编辑</button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${file.id}">删除</button>
            </td>
        `;
        
        // 添加退回原因单元格
        const rejectReasonCell = document.createElement('td');
        rejectReasonCell.innerHTML = rejectReasonHtml;
        row.appendChild(rejectReasonCell);
        
        fileListBody.appendChild(row);
        
        // 设置当前状态
        const statusSelect = row.querySelector('.status-select');
        initStatusOptions(statusSelect, file.status);
    });
    
    // 绑定各种事件
    bindFileNumberInputs();
    bindStatusSelects();
    bindEditButtons();
    bindDeleteButtons();
    bindCheckboxes();
}

// 初始化状态选项
function initStatusOptions(selectElement, currentStatus) {
    const statuses = loadFromLocalStorage('statuses', [
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
    ]);
    
    statuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        if (status === currentStatus) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
}

// 绑定文件编号输入框事件
function bindFileNumberInputs() {
    const fileNumberInputs = document.querySelectorAll('input[data-field="fileNumber"]');
    
    fileNumberInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const fileId = this.getAttribute('data-id');
            const newFileNumber = this.value;
            
            // 更新文件编号
            updateFileField(fileId, 'fileNumber', newFileNumber);
        });
        
        input.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                this.blur();
            }
        });
    });
}

// 绑定状态选择框事件
function bindStatusSelects() {
    const statusSelects = document.querySelectorAll('.status-select');
    
    statusSelects.forEach(select => {
        select.addEventListener('change', function() {
            const fileId = this.getAttribute('data-id');
            const newStatus = this.value;
            
            // 处理退回状态
            if (newStatus === '退回') {
                const rejectReason = prompt('请输入退回原因：');
                if (rejectReason === null) {
                    // 用户取消输入，恢复原状态
                    this.value = loadFiles().find(f => f.id === fileId)?.status || '';
                    return;
                }
                
                // 更新状态和退回原因
                updateFileStatus(fileId, newStatus, rejectReason);
            } else if (newStatus === '完毕') {
                // 处理完毕状态，设置结束日期
                updateFileStatus(fileId, newStatus, '', new Date().toISOString().split('T')[0]);
            } else {
                // 更新其他状态
                updateFileStatus(fileId, newStatus);
            }
        });
    });
}

// 绑定编辑按钮事件
function bindEditButtons() {
    const editButtons = document.querySelectorAll('.edit-btn');
    
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const fileId = this.getAttribute('data-id');
            showEditFileModal(fileId);
        });
    });
}

// 绑定删除按钮事件
function bindDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const fileId = this.getAttribute('data-id');
            if (confirm('确定要删除这条文件信息吗？此操作不可恢复。')) {
                deleteFile(fileId);
            }
        });
    });
}

// 绑定复选框事件
function bindCheckboxes() {
    const checkboxes = document.querySelectorAll('.file-checkbox');
    const selectAllCheckbox = document.getElementById('select-all');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateBatchButtons);
    });
    
    selectAllCheckbox.addEventListener('change', function() {
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
        updateBatchButtons();
    });
}

// 更新批量操作按钮状态
function updateBatchButtons() {
    const checkboxes = document.querySelectorAll('.file-checkbox:checked');
    const batchDeleteBtn = document.getElementById('batch-delete-btn');
    const batchStatusBtn = document.getElementById('batch-status-btn');
    
    if (checkboxes.length > 0) {
        batchDeleteBtn.disabled = false;
        batchStatusBtn.disabled = false;
    } else {
        batchDeleteBtn.disabled = true;
        batchStatusBtn.disabled = true;
    }
}

// 更新文件字段
function updateFileField(fileId, field, value) {
    const files = loadFiles();
    const file = files.find(f => f.id === fileId);
    
    if (file) {
        file[field] = value;
        
        // 保存更新后的文件数据
        saveToLocalStorage('files', files);
        
        // 记录操作日志
        addLog(`更新文件字段: ${fileId} - ${field}: ${value}`);
    }
}

// 更新文件状态
function updateFileStatus(fileId, status, rejectReason = '', endDate = '') {
    const files = loadFiles();
    const file = files.find(f => f.id === fileId);
    
    if (file) {
        file.status = status;
        file.statusUpdateTime = new Date().toISOString();
        
        if (rejectReason) {
            file.rejectReason = rejectReason;
        } else {
            file.rejectReason = '';
        }
        
        if (endDate) {
            file.endDate = endDate;
        }
        
        // 保存更新后的文件数据
        saveToLocalStorage('files', files);
        
        // 记录操作日志
        addLog(`更新文件状态: ${fileId} - ${status}`);
        
        // 刷新文件列表
        const refreshedFiles = loadFiles();
        displayFileProcessList(refreshedFiles);
        
        showSuccess('文件状态已更新');
    }
}

// 显示编辑文件弹窗
function showEditFileModal(fileId) {
    const files = loadFiles();
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
        showError('文件不存在');
        return;
    }
    
    // 填充编辑表单
    document.getElementById('edit-file-id').value = file.id;
    document.getElementById('edit-date').value = file.date;
    document.getElementById('edit-file-type').value = file.fileType;
    document.getElementById('edit-department').value = file.department;
    document.getElementById('edit-applicant').value = file.applicant;
    document.getElementById('edit-content').value = file.content;
    document.getElementById('edit-unit').value = file.unit;
    document.getElementById('edit-quantity').value = file.quantity === '/' ? '' : file.quantity;
    document.getElementById('edit-amount').value = file.amount;
    document.getElementById('edit-status').value = file.status;
    
    // 显示编辑弹窗
    const editModal = document.getElementById('edit-file-modal');
    editModal.classList.remove('hidden');
}

// 删除文件
function deleteFile(fileId) {
    const files = loadFiles();
    const fileIndex = files.findIndex(f => f.id === fileId);
    
    if (fileIndex !== -1) {
        const deletedFile = files.splice(fileIndex, 1)[0];
        
        // 保存更新后的文件数据
        saveToLocalStorage('files', files);
        
        // 记录操作日志
        addLog(`删除文件: ${fileId} - ${deletedFile.fileType}`);
        
        // 刷新文件列表
        const refreshedFiles = loadFiles();
        displayFileProcessList(refreshedFiles);
        
        showSuccess('文件已删除');
    }
}

// 处理批量删除
function handleBatchDelete() {
    const checkboxes = document.querySelectorAll('.file-checkbox:checked');
    const fileIds = Array.from(checkboxes).map(checkbox => checkbox.getAttribute('data-id'));
    
    if (confirm(`确定要删除选中的 ${fileIds.length} 条文件信息吗？此操作不可恢复。`)) {
        const files = loadFiles();
        const remainingFiles = files.filter(file => !fileIds.includes(file.id));
        
        // 保存更新后的文件数据
        saveToLocalStorage('files', remainingFiles);
        
        // 记录操作日志
        addLog(`批量删除文件: ${fileIds.length} 条`);
        
        // 刷新文件列表
        const refreshedFiles = loadFiles();
        displayFileProcessList(refreshedFiles);
        
        // 重置全选复选框
        document.getElementById('select-all').checked = false;
        
        showSuccess(`已删除 ${fileIds.length} 条文件信息`);
    }
}

// 处理批量更新状态
function handleBatchStatusUpdate() {
    const checkboxes = document.querySelectorAll('.file-checkbox:checked');
    const fileIds = Array.from(checkboxes).map(checkbox => checkbox.getAttribute('data-id'));
    
    // 显示批量更新状态弹窗
    const batchStatusModal = document.getElementById('batch-status-modal');
    batchStatusModal.classList.remove('hidden');
    
    // 绑定确认按钮事件
    document.getElementById('confirm-batch-status').onclick = function() {
        const newStatus = document.getElementById('batch-status').value;
        
        if (!newStatus) {
            showError('请选择送签状态');
            return;
        }
        
        // 处理退回状态
        let rejectReason = '';
        if (newStatus === '退回') {
            rejectReason = prompt('请输入退回原因：');
            if (rejectReason === null) {
                return;
            }
        }
        
        // 更新所有选中文件的状态
        const files = loadFiles();
        let updatedCount = 0;
        
        files.forEach(file => {
            if (fileIds.includes(file.id)) {
                file.status = newStatus;
                file.statusUpdateTime = new Date().toISOString();
                
                if (rejectReason) {
                    file.rejectReason = rejectReason;
                } else {
                    file.rejectReason = '';
                }
                
                if (newStatus === '完毕') {
                    file.endDate = new Date().toISOString().split('T')[0];
                }
                
                updatedCount++;
            }
        });
        
        // 保存更新后的文件数据
        saveToLocalStorage('files', files);
        
        // 记录操作日志
        addLog(`批量更新文件状态: ${fileIds.length} 条 - ${newStatus}`);
        
        // 刷新文件列表
        const refreshedFiles = loadFiles();
        displayFileProcessList(refreshedFiles);
        
        // 关闭弹窗
        batchStatusModal.classList.add('hidden');
        
        // 重置全选复选框
        document.getElementById('select-all').checked = false;
        
        showSuccess(`已更新 ${updatedCount} 条文件状态`);
    };
}

// 处理导出Excel
function handleExportExcel() {
    const files = loadFiles();
    const data = files.map(file => ({
        '日期': new Date(file.date).toLocaleDateString('zh-CN'),
        '文件类型': file.fileType,
        '文件编号': file.fileNumber || '',
        '申请部门': file.department,
        '申请人': file.applicant,
        '文件内容': file.content,
        '计量单位': file.unit,
        '数量': file.quantity,
        '金额': file.amount,
        '结束日期': file.endDate ? new Date(file.endDate).toLocaleDateString('zh-CN') : '',
        '送签状态': file.status,
        '状态更新时间': file.statusUpdateTime ? formatDateTime(file.statusUpdateTime) : '',
        '退回原因': file.rejectReason || '',
        '创建人': file.createdBy,
        '创建时间': file.createdAt ? formatDateTime(file.createdAt) : ''
    }));
    
    exportToExcel(data, `文件信息_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`);
    addLog('导出文件信息为Excel');
}

// 处理筛选和搜索
export function handleFilterAndSearch() {
    const filterBtn = document.getElementById('process-filter-btn');
    const clearFilterBtn = document.getElementById('process-clear-filter-btn');
    const searchBtn = document.getElementById('process-search-btn');
    const searchKeyword = document.getElementById('process-search-keyword');
    
    // 筛选按钮事件
    filterBtn.addEventListener('click', () => {
        const filteredFiles = filterFiles();
        displayFileProcessList(filteredFiles);
        addLog('筛选文件处理列表');
    });
    
    // 清除筛选按钮事件
    clearFilterBtn.addEventListener('click', () => {
        document.getElementById('process-filter-date').value = '';
        document.getElementById('process-filter-file-type').value = '';
        document.getElementById('process-filter-department').value = '';
        document.getElementById('process-filter-status').value = '';
        document.getElementById('process-search-keyword').value = '';
        
        const files = loadFiles();
        displayFileProcessList(files);
        addLog('清除筛选条件');
    });
    
    // 搜索按钮事件
    searchBtn.addEventListener('click', () => {
        const filteredFiles = filterFiles();
        displayFileProcessList(filteredFiles);
        addLog('搜索文件处理列表');
    });
    
    // 回车键搜索
    searchKeyword.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const filteredFiles = filterFiles();
            displayFileProcessList(filteredFiles);
            addLog('搜索文件处理列表');
        }
    });
}

// 筛选文件
function filterFiles() {
    const files = loadFiles();
    const filterDate = document.getElementById('process-filter-date').value;
    const filterFileType = document.getElementById('process-filter-file-type').value;
    const filterDepartment = document.getElementById('process-filter-department').value;
    const filterStatus = document.getElementById('process-filter-status').value;
    const searchKeyword = document.getElementById('process-search-keyword').value.toLowerCase();
    
    let filteredFiles = files;
    
    // 按日期筛选
    if (filterDate) {
        filteredFiles = filteredFiles.filter(file => file.date === filterDate);
    }
    
    // 按文件类型筛选
    if (filterFileType) {
        filteredFiles = filteredFiles.filter(file => file.fileType === filterFileType);
    }
    
    // 按部门筛选
    if (filterDepartment) {
        filteredFiles = filteredFiles.filter(file => file.department === filterDepartment);
    }
    
    // 按状态筛选
    if (filterStatus) {
        filteredFiles = filteredFiles.filter(file => file.status === filterStatus);
    }
    
    // 按关键词模糊搜索
    if (searchKeyword) {
        filteredFiles = filteredFiles.filter(file => 
            file.applicant.toLowerCase().includes(searchKeyword) ||
            file.content.toLowerCase().includes(searchKeyword) ||
            file.fileNumber.toLowerCase().includes(searchKeyword)
        );
    }
    
    return filteredFiles;
}

// 处理编辑文件表单提交
function handleEditFileSubmit() {
    const editFileForm = document.getElementById('edit-file-form');
    
    editFileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fileId = document.getElementById('edit-file-id').value;
        const date = document.getElementById('edit-date').value;
        const fileType = document.getElementById('edit-file-type').value;
        const department = document.getElementById('edit-department').value;
        const applicant = document.getElementById('edit-applicant').value;
        const content = document.getElementById('edit-content').value;
        const unit = document.getElementById('edit-unit').value;
        const quantity = document.getElementById('edit-quantity').value;
        const amount = document.getElementById('edit-amount').value;
        const status = document.getElementById('edit-status').value;
        
        // 验证必填字段
        if (!date || !fileType || !department || !applicant || !content || !unit) {
            showError('请填写必填字段');
            return;
        }
        
        // 更新文件信息
        const files = loadFiles();
        const file = files.find(f => f.id === fileId);
        
        if (file) {
            file.date = date;
            file.fileType = fileType;
            file.department = department;
            file.applicant = applicant;
            file.content = content;
            file.unit = unit;
            file.quantity = quantity || '/';
            file.amount = amount || '0';
            
            // 如果状态发生变化
            if (file.status !== status) {
                file.status = status;
                file.statusUpdateTime = new Date().toISOString();
                
                if (status === '完毕') {
                    file.endDate = new Date().toISOString().split('T')[0];
                }
                
                if (status === '退回') {
                    const rejectReason = prompt('请输入退回原因：');
                    if (rejectReason !== null) {
                        file.rejectReason = rejectReason;
                    }
                } else {
                    file.rejectReason = '';
                }
            }
            
            // 保存更新后的文件数据
            saveToLocalStorage('files', files);
            
            // 记录操作日志
            addLog(`编辑文件: ${fileId} - ${fileType}`);
            
            // 关闭弹窗
            document.getElementById('edit-file-modal').classList.add('hidden');
            
            // 刷新文件列表
            const refreshedFiles = loadFiles();
            displayFileProcessList(refreshedFiles);
            
            showSuccess('文件信息已更新');
        }
    });
}

// 处理刷新按钮
export function handleRefresh() {
    const refreshBtn = document.getElementById('process-refresh-btn');
    
    refreshBtn.addEventListener('click', () => {
        const files = loadFiles();
        displayFileProcessList(files);
        showSuccess('已刷新文件列表');
        addLog('刷新文件处理列表');
    });
}

// 初始化文件处理页面
export function initFileProcessPage() {
    // 加载文件数据并显示
    const files = loadFiles();
    displayFileProcessList(files);
    
    // 处理筛选和搜索
    handleFilterAndSearch();
    
    // 处理刷新按钮
    handleRefresh();
    
    // 处理批量删除
    document.getElementById('batch-delete-btn').addEventListener('click', handleBatchDelete);
    
    // 处理批量更新状态
    document.getElementById('batch-status-btn').addEventListener('click', handleBatchStatusUpdate);
    
    // 处理导出Excel
    document.getElementById('export-excel-btn').addEventListener('click', handleExportExcel);
    
    // 处理编辑文件表单提交
    handleEditFileSubmit();
    
    // 记录访问日志
    addLog('访问文件处理页面');
}