// 引入SheetJS库以支持Excel导出功能
// 由于这是一个本地项目，我们使用CDN链接
const xlsxScript = document.createElement('script');
xlsxScript.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
xlsxScript.onload = function() {
    console.log('SheetJS库加载成功');
};
document.head.appendChild(xlsxScript);

// 引入Font Awesome图标库
const fontAwesomeScript = document.createElement('link');
fontAwesomeScript.rel = 'stylesheet';
fontAwesomeScript.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
document.head.appendChild(fontAwesomeScript);

// 确保所有外部资源加载完成后再初始化应用
window.addEventListener('DOMContentLoaded', function() {
    // 等待SheetJS库加载完成
    const checkXlsxLoaded = setInterval(function() {
        if (typeof XLSX !== 'undefined') {
            clearInterval(checkXlsxLoaded);
            console.log('应用开始初始化...');
            
            // 检查是否需要初始化数据
            if (!localStorage.getItem('files')) {
                console.log('首次运行，初始化数据...');
                // 初始化系统数据
                initSystemData();
            }
        }
    }, 100);
});

// 初始化系统数据
function initSystemData() {
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
    localStorage.setItem('fileTypes', JSON.stringify(fileTypes));
    
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
    localStorage.setItem('departments', JSON.stringify(departments));
    
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
    localStorage.setItem('units', JSON.stringify(units));
    
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
    localStorage.setItem('statuses', JSON.stringify(statuses));
    
    // 初始化用户
    const users = [
        {
            id: '1',
            username: 'TYL2025',
            password: '941314aA',
            role: 'superadmin',
            mustChangePassword: false
        },
        {
            id: '2',
            username: '8888',
            password: '8888',
            role: 'admin',
            mustChangePassword: true
        },
        {
            id: '3',
            username: '1001',
            password: '1001',
            role: 'user',
            mustChangePassword: true
        }
    ];
    localStorage.setItem('users', JSON.stringify(users));
    
    // 初始化文件数据为空数组
    localStorage.setItem('files', JSON.stringify([]));
    
    // 初始化日志数据为空数组
    localStorage.setItem('logs', JSON.stringify([]));
    
    console.log('系统数据初始化完成');
}