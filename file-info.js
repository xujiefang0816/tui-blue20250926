// 文件信息相关功能
import { showSuccess, showError, formatDateTime, loadFromLocalStorage, addLog } from './utils.js';
import { getCurrentUser } from './auth.js';

// 加载文件数据
export function loadFiles() {
    return loadFromLocalStorage('files', []);
}

// 显示文件列表
export function displayFileList(files) {
    const fileListTable = document.getElementById('file-list');
    const fileListBody = fileListTable.querySelector('tbody');
    fileListBody.innerHTML = '';
    
    if (files.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="12" class="text-center">暂无文件数据</td>
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
        let fileNumberHtml = `<span>${file.fileNumber || ''}</span>`;
        
        // 只有当文件状态为完毕时，才显示文件编号编辑框
        if (file.status === '完毕') {
            fileNumberHtml = `
                <div class="file-number-edit">
                    <input type="text" class="form-input small" value="${file.fileNumber || ''}" data-id="${file.id}">
                </div>
            `;
        }
        
        // 显示退回原因
        let rejectReasonHtml = '';
        if (file.status === '退回' && file.rejectReason) {
            rejectReasonHtml = `<div class="reject-reason">${file.rejectReason}</div>`;
        }
        
        row.innerHTML = `
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
            <td>${file.status}</td>
            <td>${file.statusUpdateTime ? formatDateTime(file.statusUpdateTime) : ''}</td>
        `;
        
        // 添加退回原因单元格
        const rejectReasonCell = document.createElement('td');
        rejectReasonCell.innerHTML = rejectReasonHtml;
        row.appendChild(rejectReasonCell);
        
        fileListBody.appendChild(row);
    });
    
    // 绑定文件编号输入框事件
    bindFileNumberInputs();
}

// 绑定文件编号输入框事件
function bindFileNumberInputs() {
    const fileNumberInputs = document.querySelectorAll('.file-number-edit input');
    
    fileNumberInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const fileId = this.getAttribute('data-id');
            const newFileNumber = this.value;
            
            // 更新文件编号
            updateFileNumber(fileId, newFileNumber);
        });
        
        input.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                this.blur();
            }
        });
    });
}

// 更新文件编号
function updateFileNumber(fileId, fileNumber) {
    const files = loadFiles();
    const file = files.find(f => f.id === fileId);
    
    if (file) {
        file.fileNumber = fileNumber;
        
        // 保存更新后的文件数据
        localStorage.setItem('files', JSON.stringify(files));
        
        // 记录操作日志
        addLog(`更新文件编号: ${fileId} - ${fileNumber}`);
        
        showSuccess('文件编号已更新');
    }
}

// 筛选文件
export function filterFiles() {
    const files = loadFiles();
    const filterDate = document.getElementById('filter-date').value;
    const filterFileType = document.getElementById('filter-file-type').value;
    const filterDepartment = document.getElementById('filter-department').value;
    const filterStatus = document.getElementById('filter-status').value;
    const searchKeyword = document.getElementById('search-keyword').value.toLowerCase();
    
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

// 处理筛选和搜索
export function handleFilterAndSearch() {
    const filterBtn = document.getElementById('filter-btn');
    const clearFilterBtn = document.getElementById('clear-filter-btn');
    const searchBtn = document.getElementById('search-btn');
    const searchKeyword = document.getElementById('search-keyword');
    
    // 筛选按钮事件
    filterBtn.addEventListener('click', () => {
        const filteredFiles = filterFiles();
        displayFileList(filteredFiles);
        addLog('筛选文件列表');
    });
    
    // 清除筛选按钮事件
    clearFilterBtn.addEventListener('click', () => {
        document.getElementById('filter-date').value = '';
        document.getElementById('filter-file-type').value = '';
        document.getElementById('filter-department').value = '';
        document.getElementById('filter-status').value = '';
        document.getElementById('search-keyword').value = '';
        
        const files = loadFiles();
        displayFileList(files);
        addLog('清除筛选条件');
    });
    
    // 搜索按钮事件
    searchBtn.addEventListener('click', () => {
        const filteredFiles = filterFiles();
        displayFileList(filteredFiles);
        addLog('搜索文件列表');
    });
    
    // 回车键搜索
    searchKeyword.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const filteredFiles = filterFiles();
            displayFileList(filteredFiles);
            addLog('搜索文件列表');
        }
    });
}

// 处理刷新按钮
export function handleRefresh() {
    const refreshBtn = document.getElementById('refresh-btn');
    
    refreshBtn.addEventListener('click', () => {
        const files = loadFiles();
        displayFileList(files);
        showSuccess('已刷新文件列表');
        addLog('刷新文件列表');
    });
}

// 初始化文件信息页面
export function initFileInfoPage() {
    // 加载文件数据并显示
    const files = loadFiles();
    displayFileList(files);
    
    // 处理筛选和搜索
    handleFilterAndSearch();
    
    // 处理刷新按钮
    handleRefresh();
    
    // 记录访问日志
    addLog('访问文件信息页面');
}