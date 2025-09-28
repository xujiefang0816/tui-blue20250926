// 文件登记相关功能
import { showSuccess, showError, getToday, saveToLocalStorage, loadFromLocalStorage, generateId, addLog } from './utils.js';
import { getCurrentUser } from './auth.js';

// 初始化文件类型选项
export function initFileTypes() {
    const fileTypes = loadFromLocalStorage('fileTypes', [
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
    ]);
    
    const fileTypeSelect = document.getElementById('file-type');
    fileTypeSelect.innerHTML = '<option value="">请选择文件类型</option>';
    
    fileTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        fileTypeSelect.appendChild(option);
    });
    
    // 编辑页面的文件类型选项
    const editFileTypeSelect = document.getElementById('edit-file-type');
    if (editFileTypeSelect) {
        editFileTypeSelect.innerHTML = '<option value="">请选择文件类型</option>';
        fileTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            editFileTypeSelect.appendChild(option);
        });
    }
    
    // 文件信息页面的文件类型筛选
    const filterFileTypeSelect = document.getElementById('filter-file-type');
    if (filterFileTypeSelect) {
        filterFileTypeSelect.innerHTML = '<option value="">全部</option>';
        fileTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            filterFileTypeSelect.appendChild(option);
        });
    }
}

// 初始化部门选项
export function initDepartments() {
    const departments = loadFromLocalStorage('departments', [
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
        '工程ENG',
        '其他'
    ]);
    
    const departmentSelect = document.getElementById('department');
    departmentSelect.innerHTML = '<option value="">请选择部门</option>';
    
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        departmentSelect.appendChild(option);
    });
    
    // 编辑页面的部门选项
    const editDepartmentSelect = document.getElementById('edit-department');
    if (editDepartmentSelect) {
        editDepartmentSelect.innerHTML = '<option value="">请选择部门</option>';
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            editDepartmentSelect.appendChild(option);
        });
    }
    
    // 文件信息页面的部门筛选
    const filterDepartmentSelect = document.getElementById('filter-department');
    if (filterDepartmentSelect) {
        filterDepartmentSelect.innerHTML = '<option value="">全部</option>';
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            filterDepartmentSelect.appendChild(option);
        });
    }
}

// 初始化计量单位选项
export function initUnits() {
    const units = loadFromLocalStorage('units', [
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
    ]);
    
    const unitSelect = document.getElementById('unit');
    unitSelect.innerHTML = '<option value="">请选择计量单位</option>';
    
    units.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        unitSelect.appendChild(option);
    });
    
    // 编辑页面的计量单位选项
    const editUnitSelect = document.getElementById('edit-unit');
    if (editUnitSelect) {
        editUnitSelect.innerHTML = '<option value="">请选择计量单位</option>';
        units.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit;
            option.textContent = unit;
            editUnitSelect.appendChild(option);
        });
    }
}

// 初始化付款单位选项
export function initPaymentUnits() {
    const paymentUnits = loadFromLocalStorage('paymentUnits', [
        '一泽',
        '鼎舒盛',
        '卉好',
        '晓逸',
        '其他'
    ]);
    
    const paymentUnitSelect = document.getElementById('payment-unit');
    if (paymentUnitSelect) {
        paymentUnitSelect.innerHTML = '<option value="">请选择付款单位</option>';
        paymentUnits.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit;
            option.textContent = unit;
            paymentUnitSelect.appendChild(option);
        });
    }
}

// 初始化支付类型选项
export function initPaymentCategories() {
    const paymentCategories = loadFromLocalStorage('paymentCategories', [
        '货款',
        '费用',
        '全款',
        '预付款',
        '验收款',
        '尾款',
        '其他'
    ]);
    
    const paymentCategorySelect = document.getElementById('payment-category');
    if (paymentCategorySelect) {
        paymentCategorySelect.innerHTML = '<option value="">请选择支付类型</option>';
        paymentCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            paymentCategorySelect.appendChild(option);
        });
    }
}

// 初始化送签状态选项
export function initStatuses() {
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
    
    // 编辑页面的送签状态选项
    const editStatusSelect = document.getElementById('edit-status');
    if (editStatusSelect) {
        editStatusSelect.innerHTML = '<option value="">请选择送签状态</option>';
        statuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            editStatusSelect.appendChild(option);
        });
    }
    
    // 文件信息页面的状态筛选
    const filterStatusSelect = document.getElementById('filter-status');
    if (filterStatusSelect) {
        filterStatusSelect.innerHTML = '<option value="">全部</option>';
        statuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            filterStatusSelect.appendChild(option);
        });
    }
    
    // 批量更新状态弹窗的状态选项
    const batchStatusSelect = document.getElementById('batch-status');
    if (batchStatusSelect) {
        batchStatusSelect.innerHTML = '<option value="">请选择送签状态</option>';
        statuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            batchStatusSelect.appendChild(option);
        });
    }
}

// 初始化日期为今天
export function initDate() {
    const registerDate = document.getElementById('register-date');
    if (registerDate) {
        registerDate.value = getToday();
    }
}

// 处理文件类型变化
export function handleFileTypeChange() {
    const fileTypeSelect = document.getElementById('file-type');
    const normalContentContainer = document.getElementById('normal-content-container');
    const summaryContentContainer = document.getElementById('summary-content-container');
    const otherFileTypeContainer = document.getElementById('other-file-type-container');
    
    fileTypeSelect.addEventListener('change', () => {
        const selectedType = fileTypeSelect.value;
        
        // 显示/隐藏其他文件类型输入框
        if (selectedType === '其他') {
            otherFileTypeContainer.classList.remove('hidden');
        } else {
            otherFileTypeContainer.classList.add('hidden');
        }
        
        // 显示/隐藏普通文件内容或摘要内容
        if (selectedType === '付款申请单' || selectedType === '付款单+用印审批（仅限验收报告）') {
            normalContentContainer.classList.add('hidden');
            summaryContentContainer.classList.remove('hidden');
        } else {
            normalContentContainer.classList.remove('hidden');
            summaryContentContainer.classList.add('hidden');
        }
    });
}

// 处理部门变化
export function handleDepartmentChange() {
    const departmentSelect = document.getElementById('department');
    const otherDepartmentContainer = document.getElementById('other-department-container');
    
    departmentSelect.addEventListener('change', () => {
        if (departmentSelect.value === '其他') {
            otherDepartmentContainer.classList.remove('hidden');
        } else {
            otherDepartmentContainer.classList.add('hidden');
        }
    });
}

// 处理计量单位变化
export function handleUnitChange() {
    const unitSelect = document.getElementById('unit');
    const otherUnitContainer = document.getElementById('other-unit-container');
    
    unitSelect.addEventListener('change', () => {
        if (unitSelect.value === '其他') {
            otherUnitContainer.classList.remove('hidden');
        } else {
            otherUnitContainer.classList.add('hidden');
        }
    });
}

// 处理支付类型变化
export function handlePaymentCategoryChange() {
    const paymentCategorySelect = document.getElementById('payment-category');
    const percentageContainer = document.getElementById('percentage-container');
    const otherPaymentContainer = document.getElementById('other-payment-container');
    
    paymentCategorySelect.addEventListener('change', () => {
        const selectedCategory = paymentCategorySelect.value;
        
        // 显示/隐藏百分比输入框
        if (selectedCategory === '预付款' || selectedCategory === '验收款' || selectedCategory === '尾款') {
            percentageContainer.classList.remove('hidden');
        } else {
            percentageContainer.classList.add('hidden');
        }
        
        // 显示/隐藏其他支付类型输入框
        if (selectedCategory === '其他') {
            otherPaymentContainer.classList.remove('hidden');
        } else {
            otherPaymentContainer.classList.add('hidden');
        }
    });
}

// 处理付款单位变化
export function handlePaymentUnitChange() {
    const paymentUnitSelect = document.getElementById('payment-unit');
    const otherPaymentUnitContainer = document.getElementById('other-payment-unit-container');
    
    paymentUnitSelect.addEventListener('change', () => {
        if (paymentUnitSelect.value === '其他') {
            otherPaymentUnitContainer.classList.remove('hidden');
        } else {
            otherPaymentUnitContainer.classList.add('hidden');
        }
    });
}

// 处理期间类型变化
export function handlePeriodTypeChange() {
    const periodTypeRadios = document.querySelectorAll('input[name="period-type"]');
    const singlePeriodContainer = document.getElementById('single-period-container');
    const rangePeriodStartContainer = document.getElementById('range-period-start-container');
    const rangePeriodEndContainer = document.getElementById('range-period-end-container');
    
    periodTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'single') {
                singlePeriodContainer.classList.remove('hidden');
                rangePeriodStartContainer.classList.add('hidden');
                rangePeriodEndContainer.classList.add('hidden');
            } else {
                singlePeriodContainer.classList.add('hidden');
                rangePeriodStartContainer.classList.remove('hidden');
                rangePeriodEndContainer.classList.remove('hidden');
            }
        });
    });
}

// 提交文件登记表单
export function handleFileRegisterSubmit() {
    const fileRegisterForm = document.getElementById('file-register-form');
    
    fileRegisterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 获取表单数据
        const date = document.getElementById('register-date').value;
        const fileType = document.getElementById('file-type').value;
        const otherFileType = document.getElementById('other-file-type').value;
        const department = document.getElementById('department').value;
        const otherDepartment = document.getElementById('other-department').value;
        const applicant = document.getElementById('applicant').value;
        const fileContent = document.getElementById('file-content').value;
        const unit = document.getElementById('unit').value;
        const otherUnit = document.getElementById('other-unit').value;
        const quantity = document.getElementById('quantity').value;
        const amount = document.getElementById('amount').value;
        
        // 验证必填字段
        if (!date || !fileType || !department || !applicant) {
            showError('请填写必填字段');
            return;
        }
        
        // 处理文件类型
        let finalFileType = fileType;
        if (fileType === '其他' && otherFileType) {
            finalFileType = otherFileType;
        }
        
        // 处理部门
        let finalDepartment = department;
        if (department === '其他' && otherDepartment) {
            finalDepartment = otherDepartment;
        }
        
        // 处理计量单位
        let finalUnit = unit;
        if (unit === '其他' && otherUnit) {
            finalUnit = otherUnit;
        }
        
        // 处理文件内容
        let finalFileContent = fileContent;
        
        // 如果是付款申请单或付款单+用印审批，处理摘要
        if (fileType === '付款申请单' || fileType === '付款单+用印审批（仅限验收报告）') {
            const summaryType = document.querySelector('input[name="summary-type"]:checked').value;
            const paymentItem = document.getElementById('payment-item').value;
            const paymentCategory = document.getElementById('payment-category').value;
            const paymentPercentage = document.getElementById('payment-percentage').value;
            const otherPayment = document.getElementById('other-payment').value;
            const periodType = document.querySelector('input[name="period-type"]:checked').value;
            const singlePeriod = document.getElementById('single-period').value;
            const rangePeriodStart = document.getElementById('range-period-start').value;
            const rangePeriodEnd = document.getElementById('range-period-end').value;
            const paymentUnit = document.getElementById('payment-unit').value;
            const otherPaymentUnit = document.getElementById('other-payment-unit').value;
            
            // 验证摘要必填字段
            if (!paymentItem || !paymentCategory || !paymentUnit) {
                showError('请填写摘要必填字段');
                return;
            }
            
            if (periodType === 'single' && !singlePeriod) {
                showError('请选择单期间');
                return;
            }
            
            if (periodType === 'range' && (!rangePeriodStart || !rangePeriodEnd)) {
                showError('请选择期间区间');
                return;
            }
            
            // 处理支付类别
            let finalPaymentCategory = paymentCategory;
            if (paymentCategory === '其他' && otherPayment) {
                finalPaymentCategory = otherPayment;
            }
            
            // 处理百分比
            let categoryWithPercentage = finalPaymentCategory;
            if ((paymentCategory === '预付款' || paymentCategory === '验收款' || paymentCategory === '尾款') && paymentPercentage) {
                categoryWithPercentage = `${finalPaymentCategory}（${paymentPercentage}%）`;
            }
            
            // 处理期间
            let periodText = '';
            if (periodType === 'single') {
                const [year, month] = singlePeriod.split('-');
                periodText = `${year}年${month}月`;
            } else {
                const [startYear, startMonth] = rangePeriodStart.split('-');
                const [endYear, endMonth] = rangePeriodEnd.split('-');
                periodText = `${startYear}年${startMonth}月-${endYear}年${endMonth}月`;
            }
            
            // 处理付款单位
            let finalPaymentUnit = paymentUnit;
            if (paymentUnit === '其他' && otherPaymentUnit) {
                finalPaymentUnit = otherPaymentUnit;
            }
            
            // 生成摘要
            finalFileContent = `${summaryType}${paymentItem}${categoryWithPercentage}(${periodText}--${finalPaymentUnit})`;
        }
        
        // 获取当前用户
        const currentUser = getCurrentUser();
        
        // 创建文件数据
        const fileData = {
            id: generateId(),
            date: date,
            fileType: finalFileType,
            fileNumber: '',
            department: finalDepartment,
            applicant: applicant,
            content: finalFileContent,
            unit: finalUnit,
            quantity: quantity || '/',
            amount: amount || '0',
            endDate: '',
            status: '',
            statusUpdateTime: '',
            rejectReason: '',
            createdBy: currentUser ? currentUser.username : '系统',
            createdAt: new Date().toISOString()
        };
        
        // 保存文件数据
        const files = loadFromLocalStorage('files', []);
        files.unshift(fileData); // 添加到数组开头
        saveToLocalStorage('files', files);
        
        // 记录操作日志
        addLog(`提交文件: ${finalFileType}`);
        
        // 显示成功提示
        showSuccess('文件登记成功');
        
        // 重置表单
        fileRegisterForm.reset();
        initDate(); // 重新设置日期为今天
    });
}

// 处理添加内容功能
export function handleAddContent() {
    const addContentBtn = document.getElementById('add-content-btn');
    const measurementContainer = document.getElementById('measurement-container');
    
    addContentBtn.addEventListener('click', () => {
        // 这里可以实现添加更多内容行的功能
        showSuccess('添加内容功能待实现');
    });
}

// 初始化文件登记页面
export function initFileRegisterPage() {
    initFileTypes();
    initDepartments();
    initUnits();
    initPaymentUnits();
    initPaymentCategories();
    initDate();
    handleFileTypeChange();
    handleDepartmentChange();
    handleUnitChange();
    handlePaymentCategoryChange();
    handlePaymentUnitChange();
    handlePeriodTypeChange();
    handleFileRegisterSubmit();
    handleAddContent();
}