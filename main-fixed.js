// 铁人三项时间估算器 - 主要JavaScript文件

// 比赛距离数据
const DISTANCES = {
    'sprint': {
        name: '半程标铁',
        swim: 0.75, // km
        bike: 20,   // km
        run: 5      // km
    },
    'olympic': {
        name: '标铁',
        swim: 1.5,  // km
        bike: 40,   // km
        run: 10     // km
    },
    'half-iron': {
        name: '半程大铁',
        swim: 1.9,  // km
        bike: 90,   // km
        run: 21.1   // km
    },
    'iron': {
        name: '大铁',
        swim: 3.8,  // km
        bike: 180,  // km
        run: 42.2   // km
    }
};

// 当前选中的距离
let selectedDistance = 'olympic';

// 图表实例
let radarChart = null;
let pieChart = null;

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    createParticleBackground();
    setupEventListeners();
});

// 初始化应用
function initializeApp() {
    // 设置默认选中的距离
    document.querySelector(`[data-distance="${selectedDistance}"]`).classList.add('selected');
    
    // 初始化图表
    initCharts();
    
    // 添加输入框实时计算功能
    setupRealTimeCalculation();
}

// 设置事件监听器
function setupEventListeners() {
    // 距离选择事件
    document.querySelectorAll('.distance-card').forEach(card => {
        card.addEventListener('click', function() {
            selectDistance(this.dataset.distance);
        });
    });
    
    // 输入框事件
    ['swim-pace', 'bike-pace', 'run-pace'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', validateInput);
        input.addEventListener('focus', highlightInput);
        input.addEventListener('blur', unhighlightInput);
    });
}

// 选择比赛距离
function selectDistance(distance) {
    selectedDistance = distance;
    
    // 更新UI
    document.querySelectorAll('.distance-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-distance="${distance}"]`).classList.add('selected');
    
    // 添加选中动画
    anime({
        targets: `[data-distance="${distance}"]`,
        scale: [1, 1.05, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
    
    // 实时计算
    if (hasValidInput()) {
        calculateTime();
    }
}

// 验证输入
function validateInput(event) {
    const input = event.target;
    const value = parseFloat(input.value);
    
    // 清除非数字字符
    if (isNaN(value) || value <= 0) {
        input.style.borderColor = '#ef4444';
        return;
    }
    
    // 根据输入类型设置合理范围
    const id = input.id;
    let isValid = true;
    
    switch(id) {
        case 'swim-pace':
            isValid = value >= 0.5 && value <= 10;
            break;
        case 'bike-pace':
            isValid = value >= 5 && value <= 60;
            break;
        case 'run-pace':
            isValid = value >= 2 && value <= 15;
            break;
    }
    
    input.style.borderColor = isValid ? 'rgba(255, 255, 255, 0.2)' : '#ef4444';
    
    // 实时计算
    if (isValid && hasValidInput()) {
        calculateTime();
    }
}

// 高亮输入框
function highlightInput(event) {
    anime({
        targets: event.target,
        scale: [1, 1.02],
        duration: 200,
        easing: 'easeOutQuad'
    });
}

// 取消高亮输入框
function unhighlightInput(event) {
    anime({
        targets: event.target,
        scale: [1.02, 1],
        duration: 200,
        easing: 'easeOutQuad'
    });
}

// 检查是否有有效输入
function hasValidInput() {
    const swimPace = parseFloat(document.getElementById('swim-pace').value);
    const bikePace = parseFloat(document.getElementById('bike-pace').value);
    const runPace = parseFloat(document.getElementById('run-pace').value);
    
    return !isNaN(swimPace) && !isNaN(bikePace) && !isNaN(runPace) &&
           swimPace > 0 && bikePace > 0 && runPace > 0;
}

// 设置实时计算
function setupRealTimeCalculation() {
    const inputs = ['swim-pace', 'bike-pace', 'run-pace'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', function() {
            if (hasValidInput()) {
                calculateTime();
            }
        });
    });
}

// 计算完赛时间
function calculateTime() {
    console.log('开始计算时间...');
    
    try {
        if (!hasValidInput()) {
            console.log('输入验证失败');
            showInputError();
            return;
        }
        
        const swimPace = parseFloat(document.getElementById('swim-pace').value);
        const bikePace = parseFloat(document.getElementById('bike-pace').value);
        const runPace = parseFloat(document.getElementById('run-pace').value);
        
        console.log('配速数据:', { swimPace, bikePace, runPace });
        
        const distance = DISTANCES[selectedDistance];
        
        // 计算各项时间（分钟）
        const swimTime = (distance.swim * 1000 / 100) * swimPace; // 转换为100m单位
        const bikeTime = distance.bike / bikePace * 60; // 转换为分钟
        const runTime = distance.run * runPace; // 直接计算
        
        const totalTime = swimTime + bikeTime + runTime;
        
        console.log('计算结果:', { swimTime, bikeTime, runTime, totalTime });
        
        // 显示结果
        displayResults(swimTime, bikeTime, runTime, totalTime);
        
        // 分析弱项
        analyzeWeakness(swimTime, bikeTime, runTime);
        
        // 生成训练建议
        generateTrainingSuggestions(swimTime, bikeTime, runTime);
        
        // 显示结果区域
        showResultsSection();
        
        // 更新图表 - 延迟执行确保容器已显示
        setTimeout(() => {
            updateCharts(swimTime, bikeTime, runTime, totalTime);
        }, 800);
        
        console.log('计算完成');
        
    } catch (error) {
        console.error('计算过程中出现错误:', error);
        showToast('计算过程中出现错误，请检查输入数据', 'error');
    }
}

// 显示计算结果
function displayResults(swimTime, bikeTime, runTime, totalTime) {
    // 格式化时间显示
    document.getElementById('total-time').textContent = formatTime(totalTime);
    document.getElementById('swim-time').textContent = formatTime(swimTime, false);
    document.getElementById('bike-time').textContent = formatTime(bikeTime, false);
    document.getElementById('run-time').textContent = formatTime(runTime, false);
    
    // 添加数字动画
    anime({
        targets: '.time-display',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutElastic(1, .8)'
    });
}

// 格式化时间
function formatTime(minutes, includeHours = true) {
    const totalMinutes = Math.floor(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const secs = Math.floor((minutes - totalMinutes) * 60);
    
    if (includeHours) {
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// 分析弱项
function analyzeWeakness(swimTime, bikeTime, runTime) {
    const times = [
        { sport: '游泳', time: swimTime, icon: '🏊' },
        { sport: '骑车', time: bikeTime, icon: '🚴' },
        { sport: '跑步', time: runTime, icon: '🏃' }
    ];
    
    times.sort((a, b) => b.time - a.time);
    
    const analysisHtml = `
        <div class="space-y-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <span class="text-2xl mr-3">${times[0].icon}</span>
                    <div>
                        <div class="text-white font-bold">${times[0].sport}</div>
                        <div class="text-red-400 text-sm">需要重点训练</div>
                    </div>
                </div>
                <div class="weakness-badge">弱项</div>
            </div>
            
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <span class="text-2xl mr-3">${times[2].icon}</span>
                    <div>
                        <div class="text-white font-bold">${times[2].sport}</div>
                        <div class="text-green-400 text-sm">表现良好</div>
                    </div>
                </div>
                <div class="strength-badge">强项</div>
            </div>
            
            <div class="bg-slate-700 rounded-lg p-3 mt-4">
                <div class="text-white text-sm font-bold mb-2">时间分配分析</div>
                <div class="text-gray-300 text-xs">
                    ${times[0].sport}占总时间的 <span class="text-orange-400">${((times[0].time / (swimTime + bikeTime + runTime)) * 100).toFixed(1)}%</span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('weakness-analysis').innerHTML = analysisHtml;
}

// 生成训练建议
function generateTrainingSuggestions(swimTime, bikeTime, runTime) {
    const times = [
        { sport: '游泳', time: swimTime, pace: parseFloat(document.getElementById('swim-pace').value) },
        { sport: '骑车', time: bikeTime, pace: parseFloat(document.getElementById('bike-pace').value) },
        { sport: '跑步', time: runTime, pace: parseFloat(document.getElementById('run-pace').value) }
    ];
    
    times.sort((a, b) => b.time - a.time);
    const weakestSport = times[0];
    
    const suggestions = {
        '游泳': [
            '技术训练：每周2-3次游泳技术练习，重点改善划水效率',
            '耐力训练：增加连续游泳距离，从1000m逐步提升到2000m',
            '速度训练：进行间歇训练，如8x100m高强度游泳',
            '开放水域：每月至少2次开放水域训练，适应比赛环境'
        ],
        '骑车': [
            '力量训练：每周2次骑行台训练，提升腿部力量',
            '耐力骑行：周末进行长距离骑行，逐步增加里程',
            '爬坡训练：选择有坡度的路线，提升爬坡能力',
            '技术提升：练习换挡时机和转弯技巧'
        ],
        '跑步': [
            '间歇训练：每周1-2次间歇跑，提升速度和耐力',
            '长距离跑：周末进行LSD训练，增强有氧基础',
            '力量训练：加强核心和下肢力量训练',
            '恢复训练：重视拉伸和放松，预防伤病'
        ]
    };
    
    const suggestionHtml = `
        <div class="space-y-4">
            <div class="training-tip rounded-lg p-4">
                <div class="text-orange-400 font-bold mb-2">重点训练项目：${weakestSport.sport}</div>
                <div class="text-gray-300 text-sm mb-3">
                    您的${weakestSport.sport}配速为 ${weakestSport.pace}，建议优先提升此项能力
                </div>
            </div>
            
            <div class="space-y-3">
                <h4 class="text-white font-bold">具体训练建议：</h4>
                ${suggestions[weakestSport.sport].map(suggestion => `
                    <div class="bg-slate-700 rounded-lg p-3">
                        <div class="text-white text-sm">${suggestion}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="bg-blue-900 rounded-lg p-4 mt-4">
                <div class="text-white font-bold mb-2">每周训练计划</div>
                <div class="text-gray-300 text-sm space-y-1">
                    <div>• 周一：休息或轻松游泳</div>
                    <div>• 周二：${weakestSport.sport}专项训练</div>
                    <div>• 周三：其他两项训练</div>
                    <div>• 周四：${weakestSport.sport}强度训练</div>
                    <div>• 周五：交叉训练</div>
                    <div>• 周六：长距离训练</div>
                    <div>• 周日：恢复训练</div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('training-suggestions').innerHTML = suggestionHtml;
}

// 初始化图表
function initCharts() {
    console.log('初始化图表...');
    // 确保DOM元素存在后再初始化
    setTimeout(() => {
        const radarDom = document.getElementById('radar-chart');
        const pieDom = document.getElementById('pie-chart');
        
        if (radarDom && pieDom) {
            try {
                radarChart = echarts.init(radarDom);
                pieChart = echarts.init(pieDom);
                console.log('图表初始化成功');
                
                // 设置响应式
                window.addEventListener('resize', function() {
                    if (radarChart) radarChart.resize();
                    if (pieChart) pieChart.resize();
                });
            } catch (error) {
                console.error('图表初始化失败:', error);
            }
        } else {
            console.error('图表DOM元素未找到');
        }
    }, 500);
}

// 更新图表
function updateCharts(swimTime, bikeTime, runTime, totalTime) {
    console.log('更新图表数据...');
    
    // 确保图表已经初始化
    if (!radarChart || !pieChart) {
        console.log('图表未初始化，延迟重试...');
        setTimeout(() => {
            updateCharts(swimTime, bikeTime, runTime, totalTime);
        }, 500);
        return;
    }
    
    try {
        // 雷达图配置
        const radarOption = {
            backgroundColor: 'transparent',
            radar: {
                indicator: [
                    { name: '游泳', max: 100 },
                    { name: '骑车', max: 100 },
                    { name: '跑步', max: 100 }
                ],
                axisLine: { lineStyle: { color: '#374151' } },
                splitLine: { lineStyle: { color: '#374151' } },
                axisLabel: { 
                    color: '#9CA3AF', 
                    fontSize: 10,
                    margin: 5
                },
                name: { 
                    color: '#F9FAFB', 
                    fontSize: 12,
                    margin: 8
                },
                radius: '60%'
            },
            series: [{
                type: 'radar',
                data: [{
                    value: [
                        Math.max(10, 100 - (swimTime / totalTime * 100)),
                        Math.max(10, 100 - (bikeTime / totalTime * 100)),
                        Math.max(10, 100 - (runTime / totalTime * 100))
                    ],
                    areaStyle: {
                        color: 'rgba(249, 115, 22, 0.3)'
                    },
                    lineStyle: {
                        color: '#f97316',
                        width: 2
                    },
                    itemStyle: {
                        color: '#f97316'
                    }
                }]
            }]
        };
        
        // 饼图配置
        const pieOption = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c}分钟 ({d}%)',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                textStyle: { color: '#fff' }
            },
            legend: {
                orient: 'horizontal',
                bottom: '5%',
                textStyle: { color: '#F9FAFB', fontSize: 11 }
            },
            series: [{
                name: '时间分配',
                type: 'pie',
                radius: ['25%', '60%'],
                center: ['50%', '45%'],
                data: [
                    { value: Math.round(swimTime), name: '游泳', itemStyle: { color: '#3b82f6' } },
                    { value: Math.round(bikeTime), name: '骑车', itemStyle: { color: '#f97316' } },
                    { value: Math.round(runTime), name: '跑步', itemStyle: { color: '#10b981' } }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    color: '#F9FAFB',
                    fontSize: 11,
                    formatter: '{b}\n{c}分钟'
                }
            }]
        };
        
        radarChart.setOption(radarOption);
        pieChart.setOption(pieOption);
        
        // 添加图表显示动画
        anime({
            targets: '.chart-container',
            opacity: [0, 1],
            scale: [0.9, 1],
            duration: 600,
            delay: 200,
            easing: 'easeOutQuad'
        });
        
    } catch (error) {
        console.error('图表更新失败:', error);
    }
}

// 显示结果区域
function showResultsSection() {
    try {
        const resultsSection = document.getElementById('results-section');
        if (!resultsSection) {
            console.error('结果区域元素未找到');
            return;
        }
        
        resultsSection.style.display = 'block';
        
        // 添加显示动画
        anime({
            targets: resultsSection,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
            easing: 'easeOutQuad'
        });
        
        // 显示图表容器并初始化图表
        setTimeout(() => {
            const chartContainers = document.querySelectorAll('.chart-container');
            console.log('找到图表容器数量:', chartContainers.length);
            
            chartContainers.forEach(container => {
                container.style.opacity = '1';
                container.style.height = '280px';
            });
            
            // 确保图表容器有正确的尺寸
            if (radarChart) {
                radarChart.resize();
            }
            if (pieChart) {
                pieChart.resize();
            }
        }, 400);
        
        // 滚动到结果区域
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        console.error('显示结果区域时出错:', error);
    }
}

// 重置表单
function resetForm() {
    // 重置输入框
    document.getElementById('swim-pace').value = '2.00';
    document.getElementById('bike-pace').value = '30.0';
    document.getElementById('run-pace').value = '5.00';
    
    // 隐藏结果区域
    const resultsSection = document.getElementById('results-section');
    anime({
        targets: resultsSection,
        opacity: [1, 0],
        translateY: [0, -20],
        duration: 400,
        easing: 'easeInQuad',
        complete: function() {
            resultsSection.style.display = 'none';
        }
    });
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 显示输入错误信息
function showInputError() {
    const swimInput = document.getElementById('swim-pace');
    const bikeInput = document.getElementById('bike-pace');
    const runInput = document.getElementById('run-pace');
    
    const swimValue = parseFloat(swimInput.value);
    const bikeValue = parseFloat(bikeInput.value);
    const runValue = parseFloat(runInput.value);
    
    let errorMessage = '请输入有效的配速数值：\n';
    
    if (isNaN(swimValue) || swimValue <= 0) {
        errorMessage += '• 游泳配速应为0.1-10.0分钟/100米\n';
        swimInput.style.borderColor = '#ef4444';
    }
    
    if (isNaN(bikeValue) || bikeValue <= 0) {
        errorMessage += '• 骑车配速应为5-60公里/小时\n';
        bikeInput.style.borderColor = '#ef4444';
    }
    
    if (isNaN(runValue) || runValue <= 0) {
        errorMessage += '• 跑步配速应为2-15分钟/公里\n';
        runInput.style.borderColor = '#ef4444';
    }
    
    // 显示错误提示
    showToast(errorMessage, 'error');
    
    // 3秒后清除错误状态
    setTimeout(() => {
        [swimInput, bikeInput, runInput].forEach(input => {
            input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        });
    }, 3000);
}

// Toast提示函数
function showToast(message, type = 'info') {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg text-white text-sm font-medium max-w-xs text-center`;
    
    // 根据类型设置样式
    switch(type) {
        case 'error':
            toast.className += ' bg-red-600';
            break;
        case 'success':
            toast.className += ' bg-green-600';
            break;
        case 'warning':
            toast.className += ' bg-yellow-600';
            break;
        default:
            toast.className += ' bg-blue-600';
    }
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 显示动画
    anime({
        targets: toast,
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 300,
        easing: 'easeOutQuad'
    });
    
    // 3秒后自动消失
    setTimeout(() => {
        anime({
            targets: toast,
            opacity: [1, 0],
            translateY: [0, -20],
            duration: 300,
            easing: 'easeInQuad',
            complete: () => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }
        });
    }, 3000);
}

// 创建粒子背景
function createParticleBackground() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const particles = document.getElementById('particles');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles.appendChild(canvas);
    
    const particleArray = [];
    const numberOfParticles = 50;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.fillStyle = `rgba(249, 115, 22, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    function init() {
        for (let i = 0; i < numberOfParticles; i++) {
            particleArray.push(new Particle());
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particleArray.length; i++) {
            particleArray[i].update();
            particleArray[i].draw();
        }
        
        requestAnimationFrame(animate);
    }
    
    init();
    animate();
    
    // 窗口大小改变时重新调整
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// 导航功能
function showHome() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showAnalysis() {
    const resultsSection = document.getElementById('results-section');
    if (resultsSection && resultsSection.style.display !== 'none') {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        showToast('请先计算完赛时间', 'warning');
    }
}

function showTraining() {
    const trainingSection = document.querySelector('#training-suggestions');
    if (trainingSection && trainingSection.parentElement) {
        trainingSection.parentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        showToast('请先计算完赛时间', 'warning');
    }
}

// 测试函数
function testFunction() {
    console.log('测试函数被调用');
    showToast('测试成功！JavaScript正常工作', 'success');
}