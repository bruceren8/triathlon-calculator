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
    ['swim-minutes', 'swim-seconds', 'bike-pace', 'run-minutes', 'run-seconds'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', validateInput);
            input.addEventListener('focus', highlightInput);
            input.addEventListener('blur', unhighlightInput);
        }
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
    if (isNaN(value) || value < 0) {
        input.style.borderColor = '#ef4444';
        return;
    }
    
    // 根据输入类型设置合理范围
    const id = input.id;
    let isValid = true;
    
    switch(id) {
        case 'swim-minutes':
            isValid = value >= 0 && value <= 10;
            break;
        case 'swim-seconds':
            isValid = value >= 0 && value < 60;
            break;
        case 'bike-pace':
            isValid = value >= 5 && value <= 60;
            break;
        case 'run-minutes':
            isValid = value >= 0 && value <= 15;
            break;
        case 'run-seconds':
            isValid = value >= 0 && value < 60;
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
    const swimMinutes = parseFloat(document.getElementById('swim-minutes').value);
    const swimSeconds = parseFloat(document.getElementById('swim-seconds').value);
    const bikePace = parseFloat(document.getElementById('bike-pace').value);
    const runMinutes = parseFloat(document.getElementById('run-minutes').value);
    const runSeconds = parseFloat(document.getElementById('run-seconds').value);
    
    const swimValid = !isNaN(swimMinutes) && !isNaN(swimSeconds) && swimMinutes >= 0 && swimSeconds >= 0 && swimSeconds < 60;
    const bikeValid = !isNaN(bikePace) && bikePace > 0;
    const runValid = !isNaN(runMinutes) && !isNaN(runSeconds) && runMinutes >= 0 && runSeconds >= 0 && runSeconds < 60;
    
    return swimValid && bikeValid && runValid;
}

// 转换分秒为十进制分钟
function convertToDecimalMinutes(minutes, seconds) {
    return minutes + (seconds / 60);
}

// 设置实时计算
function setupRealTimeCalculation() {
    const inputs = ['swim-minutes', 'swim-seconds', 'bike-pace', 'run-minutes', 'run-seconds'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                if (hasValidInput()) {
                    calculateTime();
                }
            });
        }
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
        
        // 获取游泳配速（分秒转换为十进制）
        const swimMinutes = parseFloat(document.getElementById('swim-minutes').value);
        const swimSeconds = parseFloat(document.getElementById('swim-seconds').value);
        const swimPace = convertToDecimalMinutes(swimMinutes, swimSeconds);
        
        // 获取骑车配速
        const bikePace = parseFloat(document.getElementById('bike-pace').value);
        
        // 获取跑步配速（分秒转换为十进制）
        const runMinutes = parseFloat(document.getElementById('run-minutes').value);
        const runSeconds = parseFloat(document.getElementById('run-seconds').value);
        const runPace = convertToDecimalMinutes(runMinutes, runSeconds);
        
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
        
        // 分析弱项（传入配速数据）
        analyzeWeakness(swimTime, bikeTime, runTime, swimPace, bikePace, runPace);
        
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

// 分析弱项 - 基于配速水平
function analyzeWeakness(swimTime, bikeTime, runTime, swimPace, bikePace, runPace) {
    // 定义各项目的配速等级标准
    const paceStandards = {
        '游泳': {
            excellent: 1.5,    // 1分30秒以内/100m
            good: 2.0,         // 2分00秒以内/100m
            average: 2.5,      // 2分30秒以内/100m
            poor: 3.0          // 3分00秒以上/100m
        },
        '骑车': {
            excellent: 35,     // 35km/h以上
            good: 30,          // 30km/h以上
            average: 25,       // 25km/h以上
            poor: 20           // 20km/h以下
        },
        '跑步': {
            excellent: 4.0,    // 4分00秒以内/km
            good: 5.0,         // 5分00秒以内/km
            average: 6.0,      // 6分00秒以内/km
            poor: 7.0          // 7分00秒以上/km
        }
    };
    
    // 评估每个项目的水平
    const evaluations = [
        {
            sport: '游泳',
            pace: swimPace,
            time: swimTime,
            icon: '🏊',
            level: getPaceLevel('游泳', swimPace, paceStandards),
            displayPace: formatPaceDisplay('游泳', swimPace)
        },
        {
            sport: '骑车',
            pace: bikePace,
            time: bikeTime,
            icon: '🚴',
            level: getPaceLevel('骑车', bikePace, paceStandards),
            displayPace: formatPaceDisplay('骑车', bikePace)
        },
        {
            sport: '跑步',
            pace: runPace,
            time: runTime,
            icon: '🏃',
            level: getPaceLevel('跑步', runPace, paceStandards),
            displayPace: formatPaceDisplay('跑步', runPace)
        }
    ];
    
    // 按水平排序（最差的排在前面）
    const levelOrder = { 'poor': 0, 'average': 1, 'good': 2, 'excellent': 3 };
    evaluations.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
    
    const weakest = evaluations[0];
    const strongest = evaluations[2];
    
    const analysisHtml = `
        <div class="space-y-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <span class="text-2xl mr-3">${weakest.icon}</span>
                    <div>
                        <div class="text-white font-bold">${weakest.sport}</div>
                        <div class="text-red-400 text-sm">配速 ${weakest.displayPace} - 需要重点训练</div>
                    </div>
                </div>
                <div class="weakness-badge">弱项</div>
            </div>
            
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <span class="text-2xl mr-3">${strongest.icon}</span>
                    <div>
                        <div class="text-white font-bold">${strongest.sport}</div>
                        <div class="text-green-400 text-sm">配速 ${strongest.displayPace} - 表现优秀</div>
                    </div>
                </div>
                <div class="strength-badge">强项</div>
            </div>
            
            <div class="bg-slate-700 rounded-lg p-3 mt-4">
                <div class="text-white text-sm font-bold mb-2">综合分析</div>
                <div class="text-gray-300 text-xs space-y-1">
                    <div>游泳配速: ${evaluations[0].displayPace} (${getLevelText(evaluations[0].level)})</div>
                    <div>骑车配速: ${evaluations[1].displayPace} (${getLevelText(evaluations[1].level)})</div>
                    <div>跑步配速: ${evaluations[2].displayPace} (${getLevelText(evaluations[2].level)})</div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('weakness-analysis').innerHTML = analysisHtml;
}

// 获取配速等级
function getPaceLevel(sport, pace, standards) {
    const standard = standards[sport];
    if (sport === '骑车') {
        // 骑车配速越快数值越大
        if (pace >= standard.excellent) return 'excellent';
        if (pace >= standard.good) return 'good';
        if (pace >= standard.average) return 'average';
        return 'poor';
    } else {
        // 游泳和跑步配速越快数值越小
        if (pace <= standard.excellent) return 'excellent';
        if (pace <= standard.good) return 'good';
        if (pace <= standard.average) return 'average';
        return 'poor';
    }
}

// 格式化配速显示
function formatPaceDisplay(sport, pace) {
    if (sport === '游泳') {
        const minutes = Math.floor(pace);
        const seconds = Math.round((pace - minutes) * 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}/100m`;
    } else if (sport === '跑步') {
        const minutes = Math.floor(pace);
        const seconds = Math.round((pace - minutes) * 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
    } else {
        return `${pace} km/h`;
    }
}

// 获取等级文字描述
function getLevelText(level) {
    const levelTexts = {
        'excellent': '优秀',
        'good': '良好',
        'average': '一般',
        'poor': '需改进'
    };
    return levelTexts[level] || '未知';
}

// 生成训练建议 - 基于弱项分析结果
function generateTrainingSuggestions(swimTime, bikeTime, runTime) {
    // 获取配速数据
    const swimPace = convertToDecimalMinutes(
        parseFloat(document.getElementById('swim-minutes').value),
        parseFloat(document.getElementById('swim-seconds').value)
    );
    const bikePace = parseFloat(document.getElementById('bike-pace').value);
    const runPace = convertToDecimalMinutes(
        parseFloat(document.getElementById('run-minutes').value),
        parseFloat(document.getElementById('run-seconds').value)
    );
    
    // 定义配速等级标准
    const paceStandards = {
        '游泳': {
            excellent: 1.5,
            good: 2.0,
            average: 2.5,
            poor: 3.0
        },
        '骑车': {
            excellent: 35,
            good: 30,
            average: 25,
            poor: 20
        },
        '跑步': {
            excellent: 4.0,
            good: 5.0,
            average: 6.0,
            poor: 7.0
        }
    };
    
    // 评估每个项目的水平
    const evaluations = [
        {
            sport: '游泳',
            time: swimTime,
            pace: swimPace,
            level: getPaceLevel('游泳', swimPace, paceStandards),
            icon: '🏊'
        },
        {
            sport: '骑车',
            time: bikeTime,
            pace: bikePace,
            level: getPaceLevel('骑车', bikePace, paceStandards),
            icon: '🚴'
        },
        {
            sport: '跑步',
            time: runTime,
            pace: runPace,
            level: getPaceLevel('跑步', runPace, paceStandards),
            icon: '🏃'
        }
    ];
    
    // 按水平排序，最差的排在前面
    const levelOrder = { 'poor': 0, 'average': 1, 'good': 2, 'excellent': 3 };
    evaluations.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
    
    const weakestSport = evaluations[0];
    const secondWeakSport = evaluations[1];
    const strongestSport = evaluations[2];
    
    // 根据弱项等级生成针对性建议
    const getSpecificSuggestions = (sport, level, pace) => {
        const suggestions = {
            '游泳': {
                'poor': [
                    '基础技术：从蛙泳或自由泳基础动作开始，每周3次技术练习',
                    '水中适应：每次训练前做10分钟水中行走和漂浮练习',
                    '呼吸训练：练习双侧呼吸，每3次划水换一次气',
                    '短距离间歇：8×25m，休息30秒，专注技术动作'
                ],
                'average': [
                    '技术精进：练习高肘划水和身体滚动，每周2次技术课',
                    '耐力提升：从200m连续游逐步增加到500m',
                    '速度训练：6×50m间歇，配速控制在2分/100m以内',
                    '开放水域：每月1次户外游泳，适应真实环境'
                ],
                'good': [
                    '速度突破：练习冲刺训练，6×100m高强度间歇',
                    '技术优化：改善入水角度和划水效率',
                    '耐力强化：长距离游泳，目标1000m连续',
                    '比赛模拟：练习集体出发和转弯技术'
                ],
                'excellent': [
                    '精英训练：专业游泳训练计划，提升竞技水平',
                    '力量训练：增加上肢和核心力量',
                    '战术训练：比赛策略和配速控制',
                    '恢复训练：重视拉伸和按摩，预防过度训练'
                ]
            },
            '骑车': {
                'poor': [
                    '基础骑行：每周2次平地骑行，每次30-45分钟',
                    '车辆调试：学会调整座椅高度和车把位置',
                    '换挡练习：熟练掌握前后变速器使用',
                    '安全训练：学习基本骑行手势和安全规则'
                ],
                'average': [
                    '耐力骑行：周末60-90分钟长距离骑行',
                    '爬坡训练：寻找小坡度路段练习爬坡',
                    '踏频训练：保持80-90rpm的踏频',
                    '力量训练：骑行台训练，提升腿部力量'
                ],
                'good': [
                    '速度训练：间歇骑行，提升平均速度到30km/h',
                    '爬坡强化：挑战更长更陡的坡道',
                    '技术提升：练习下坡和转弯技巧',
                    '装备优化：考虑升级车辆和配件'
                ],
                'excellent': [
                    '竞技训练：参加业余比赛，积累比赛经验',
                    '功率训练：使用功率计进行科学训练',
                    '战术训练：学习集团骑行和突围技巧',
                    '体能维护：平衡训练和恢复，保持状态'
                ]
            },
            '跑步': {
                'poor': [
                    '慢跑起步：从快走开始，逐步过渡到慢跑',
                    '跑姿纠正：学习正确跑步姿势，避免受伤',
                    '循序渐进：每周增加10%跑量，避免过度训练',
                    '装备选择：选择合适的跑鞋和运动服装'
                ],
                'average': [
                    '有氧基础：每周3次30-45分钟慢跑',
                    '间歇训练：开始尝试400m间歇跑',
                    '核心训练：加强腹部和下肢力量',
                    '拉伸放松：每次跑后充分拉伸'
                ],
                'good': [
                    '速度提升：5×1km间歇，配速控制在5分/km',
                    '长跑训练：周末10-15km长距离跑',
                    '坡道训练：找坡道练习上下坡跑',
                    '配速控制：学会在不同距离控制配速'
                ],
                'excellent': [
                    '马拉松训练：准备半马或全马比赛',
                    '高强度间歇：800m或1000m重复跑',
                    '体能监控：使用心率带监控训练强度',
                    '营养补给：学习比赛中的补给策略'
                ]
            }
        };
        
        return suggestions[sport][level] || suggestions[sport]['average'];
    };
    
    // 生成训练建议HTML
    const generateSuggestionHTML = (sport, suggestions) => {
        return `
            <div class="bg-slate-700 rounded-lg p-3 mb-3">
                <div class="text-orange-400 font-bold mb-2">${sport}专项训练</div>
                ${suggestions.map(suggestion => `
                    <div class="text-white text-sm mb-2">• ${suggestion}</div>
                `).join('')}
            </div>
        `;
    };
    
    // 生成训练计划
    const generateTrainingPlan = (weakestSport) => {
        const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        const activities = {
            '游泳': ['轻松游泳', '游泳专项训练', '其他两项训练', '游泳强度训练', '交叉训练', '长距离游泳', '恢复训练'],
            '骑车': ['休息或骑行', '骑车专项训练', '其他两项训练', '骑行强度训练', '交叉训练', '长距离骑行', '恢复训练'],
            '跑步': ['休息或慢跑', '跑步专项训练', '其他两项训练', '跑步强度训练', '交叉训练', '长距离跑步', '恢复训练']
        };
        
        return days.map((day, index) => {
            let activity = activities[weakestSport][index];
            if (index === 1 || index === 3) {
                activity = `${weakestSport}专项训练`;
            }
            return `<div>• ${day}：${activity}</div>`;
        }).join('');
    };
    
    // 构建训练建议HTML
    const suggestionHtml = `
        <div class="space-y-4">
            <div class="training-tip rounded-lg p-4">
                <div class="text-orange-400 font-bold mb-2">🎯 重点训练项目：${weakestSport.sport}</div>
                <div class="text-gray-300 text-sm mb-3">
                    您的${weakestSport.sport}配速为 ${formatPaceDisplay(weakestSport.sport, weakestSport.pace)}，
                    水平为${getLevelText(weakestSport.level)}，建议优先提升此项能力
                </div>
            </div>
            
            <div class="space-y-3">
                <h4 class="text-white font-bold">📋 具体训练建议：</h4>
                ${generateSuggestionHTML(weakestSport.sport, getSpecificSuggestions(weakestSport.sport, weakestSport.level, weakestSport.pace))}
                
                ${weakestSport.level !== 'excellent' ? `
                    <div class="bg-blue-800 rounded-lg p-3">
                        <div class="text-blue-200 font-bold mb-2">💡 ${secondWeakSport.sport}提升建议</div>
                        <div class="text-blue-100 text-sm">
                            ${getSpecificSuggestions(secondWeakSport.sport, secondWeakSport.level, secondWeakSport.pace).slice(0, 2).map(s => `• ${s}`).join('<br>')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="bg-green-800 rounded-lg p-3">
                    <div class="text-green-200 font-bold mb-2">✅ ${strongestSport.sport}保持建议</div>
                    <div class="text-green-100 text-sm">
                        ${getSpecificSuggestions(strongestSport.sport, strongestSport.level, strongestSport.pace).slice(0, 2).map(s => `• ${s}`).join('<br>')}
                    </div>
                </div>
            </div>
            
            <div class="bg-blue-900 rounded-lg p-4 mt-4">
                <div class="text-white font-bold mb-2">📅 每周训练计划</div>
                <div class="text-gray-300 text-sm space-y-1">
                    ${generateTrainingPlan(weakestSport.sport)}
                </div>
            </div>
            
            <div class="bg-purple-800 rounded-lg p-3 mt-4">
                <div class="text-purple-200 font-bold mb-2">🎯 训练重点</div>
                <div class="text-purple-100 text-sm">
                    建议将70%的训练时间分配给${weakestSport.sport}，
                    20%分配给${secondWeakSport.sport}，
                    10%用于维持${strongestSport.sport}的状态
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
    document.getElementById('swim-minutes').value = '2';
    document.getElementById('swim-seconds').value = '0';
    document.getElementById('bike-pace').value = '30.0';
    document.getElementById('run-minutes').value = '5';
    document.getElementById('run-seconds').value = '0';
    
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
    const swimMinInput = document.getElementById('swim-minutes');
    const swimSecInput = document.getElementById('swim-seconds');
    const bikeInput = document.getElementById('bike-pace');
    const runMinInput = document.getElementById('run-minutes');
    const runSecInput = document.getElementById('run-seconds');
    
    const swimMin = parseFloat(swimMinInput.value);
    const swimSec = parseFloat(swimSecInput.value);
    const bikeValue = parseFloat(bikeInput.value);
    const runMin = parseFloat(runMinInput.value);
    const runSec = parseFloat(runSecInput.value);
    
    let errorMessage = '请输入有效的配速数值：\n';
    let hasError = false;
    
    if (isNaN(swimMin) || swimMin < 0 || swimMin > 10 || 
        isNaN(swimSec) || swimSec < 0 || swimSec >= 60) {
        errorMessage += '• 游泳配速应为有效的分秒格式\n';
        swimMinInput.style.borderColor = '#ef4444';
        swimSecInput.style.borderColor = '#ef4444';
        hasError = true;
    }
    
    if (isNaN(bikeValue) || bikeValue <= 0 || bikeValue > 60) {
        errorMessage += '• 骑车配速应为5-60公里/小时\n';
        bikeInput.style.borderColor = '#ef4444';
        hasError = true;
    }
    
    if (isNaN(runMin) || runMin < 0 || runMin > 15 || 
        isNaN(runSec) || runSec < 0 || runSec >= 60) {
        errorMessage += '• 跑步配速应为有效的分秒格式\n';
        runMinInput.style.borderColor = '#ef4444';
        runSecInput.style.borderColor = '#ef4444';
        hasError = true;
    }
    
    // 显示错误提示
    if (hasError) {
        showToast(errorMessage, 'error');
    }
    
    // 3秒后清除错误状态
    setTimeout(() => {
        [swimMinInput, swimSecInput, bikeInput, runMinInput, runSecInput].forEach(input => {
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