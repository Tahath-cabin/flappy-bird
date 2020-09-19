//对象收编变量
// var obj = {
//     a: 1,
//     b: 10,
//     test: function(){}
// };

// 动画 animate 去管理所有动画函数
var bird = {
    skyPosition: 0,
    skyStep: 2,
    birdTop: 220,
    birdStepY: 0,
    startColor: 'blue',
    startFlag: false,
    minTop: 0,
    maxTop: 570,
    pipeLength: 7,
    pipeArr: [],
    pipeLastIndex: 6,       //最后一根柱子的索引
    score: 0,

    // 初始化函数
    init: function () {
        this.initData();
        this.animate();
        this.handle();

        // 点重新开始，游戏直接运行
        if(sessionStorage.getItem('played')){
            this.start();
        }
    },

    initData: function () {
        this.el = document.getElementById('game');
        // dom元素变量约定以'o'做前缀，在父级中找bird元素，确保知道其排序
        this.oBird = this.el.getElementsByClassName('bird')[0];
        this.oStart = this.el.getElementsByClassName('start')[0];
        this.oScore = this.el.getElementsByClassName('score')[0];
        this.oMask = this.el.getElementsByClassName('mask')[0];
        this.oEnd = this.el.getElementsByClassName('end')[0];
        this.oFinalScore = this.oEnd.getElementsByClassName('final-score')[0];
        this.oRankList = this.oEnd.getElementsByClassName('rank-list')[0];
        this.oRestart = this.oEnd.getElementsByClassName('restart')[0];

        this.scoreArr = this.getScore();
        // console.log(this.scoreArr);
    },
    getScore: function(){
        var scoreArr = getLocal('score'); //第一次取，键值不存在，值为null
        return scoreArr ? scoreArr : [];
    },

    animate: function () {
        // this === bird
        var self = this;
        var count = 0;

        // 只开一个定时器，防止浏览器变卡
        this.timer = setInterval(function () {
            // this === window
            self.skyMove();
            
            if(self.startFlag){
                self.birdDrop();
                self.pipeMove();
            }

            if (++count % 10 === 0) {
                if (!self.startFlag) {
                    self.birdJump();
                    self.startBound();
                }
                self.birdFly(count);
            }
        }, 30)
    },
    skyMove: function () {
        this.skyPosition -= this.skyStep;
        this.el.style.backgroundPositionX = this.skyPosition + 'px';
    },
    birdJump: function () {
        this.birdTop = this.birdTop === 220 ? 260 : 220;
        this.oBird.style.top = this.birdTop + 'px';
    },
    birdFly: function (count) {
        this.oBird.style.backgroundPositionX = count % 3 * -30 + 'px';
    },
    birdDrop: function(){
        this.birdTop += ++this.birdStepY;
        this.oBird.style.top = this.birdTop + 'px';

        //碰撞检测
        this.judgeKnock();
        // 得分检测
        this.addScore();
    },
    pipeMove: function(){
        for(var i = 0; i < this.pipeLength; i++){
            var oUpPipe = this.pipeArr[i].up;
            var oDownPipe = this.pipeArr[i].down;
            // offsetLeft输出结果是数字，可直接进行相减
            var x = oUpPipe.offsetLeft - this.skyStep;

            //将过去的柱子移到最后一根柱子的后面
            if(x < -52){
                var lastPipeLeft = this.pipeArr[this.pipeLastIndex].up.offsetLeft;
                oUpPipe.style.left = lastPipeLeft + 300 + 'px';
                oDownPipe.style.left = lastPipeLeft + 300 + 'px';
                //更新最后一根柱子的索引
                this.pipeLastIndex = ++ this.pipeLastIndex % this.pipeLength;

                //更新其高度
                var pipeHeight = this.getPipeHeight();
                oUpPipe.style.height = pipeHeight.up + 'px';
                oDownPipe.style.height = pipeHeight.down + 'px';
                
                this.pipeArr[i].y = [pipeHeight.up, pipeHeight.up + 120];
                continue;
            }

            oUpPipe.style.left = x + 'px';
            oDownPipe.style.left = x + 'px';
        }
    },
    getPipeHeight: function(){
        var upHeight = 50 + Math.floor(Math.random() * 175);
        var downHeight = 600 - 150 - upHeight;
        
        return {
            up: upHeight,
            down: downHeight,
        }
    },
    startBound: function () {
        var prevColor = this.startColor;
        this.startColor = prevColor === 'blue' ? 'white' : 'blue';

        this.oStart.classList.remove('start-' + prevColor);
        this.oStart.classList.add('start-' + this.startColor);
        // var color;
        // if(this.startColor === 'blue'){
        //     color = 'white';
        // }else{
        //     color = 'blue';
        // }

        // classList.remove('start-' + this.startColor);
        // classList.add('start-' + color);
        // this.startColor = color;
    },
    judgeKnock: function(){
        this.judgeBoundary();
        this.judegPipe();
    },
    judgeBoundary: function(){
        if(this.birdTop < this.minTop || this.birdTop > this.maxTop){
            this.failGame();
        }
    },
    judegPipe: function(){
        // 相遇pipex = 95 pipex = 13
        var index = this.score % this.pipeLength;
        var pipeX = this.pipeArr[index].up.offsetLeft;
        var pipeY = this.pipeArr[index].y;   //存放上柱子的高度和加上中间空白的高度（120）
        var birdY = this.birdTop;

        if((pipeX <= 95 && pipeX >= 13) && (birdY <= pipeY[0] || birdY >= pipeY[1])){
            this.failGame();
        }
    },
    addScore: function(){
        var index = this.score % this.pipeLength;
        var pipeX = this.pipeArr[index].up.offsetLeft;

        if(pipeX < 13){
            this.oScore.innerText = ++ this.score;
        }
    },

    // handle 管理事件处理函数
    handle: function () {
        this.handleStart();
        this.handleClick();
        this.handRestart();
    },
    handleStart: function () {
        var self = this;
        // 强制转换this值，call和apply只在函数执行时改变this
        this.oStart.onclick = this.start.bind(this);
    },
    start: function(){
        this.startFlag = true;
        this.oBird.style.left = '80px';
        this.oBird.style.transition = 'none';       //取消小鸟的过渡效果，使其能碰到上下边界（无过渡时间）
        this.oStart.style.display = 'none';
        this.oScore.style.display = 'block';
        this.skyStep = 5;

        for(var i = 0; i < this.pipeLength; i ++){
            this.createPipe(300 * (i + 1));
        }
    },
    handleClick: function(){
        var self = this;
        this.el.onclick = function(e){
            // 判断点击的是否是‘开始游戏’,是的话小鸟就不往上飞
            if(!e.target.classList.contains('start')){
                self.birdStepY = -10;
            }
        };
    },
    handRestart: function(){
        this.oRestart.onclick = function(){
            // 屏幕刷新前先储存
            sessionStorage.setItem('played', true);
            window.location.reload();
        }
    },
    createPipe: function(x){
        // var pipeHeight  0 - 1  600-150 = 450  /2 = 225
        // 0 - 225  整数  50 - 275(加50)
        // 50 - 225（最终想要的高度）
        // var upHeight = 50 + Math.floor(Math.random() * 175);
        // var downHeight = 600 - 150 - upHeight;
        var pipeHeight = this.getPipeHeight();

        var oUpPipe = createEle('div', ['pipe','pipe-up'], {
            height: pipeHeight.up + 'px',
            left: x + 'px',
        })
        var oDownPipe = createEle('div', ['pipe','pipe-down'], {
            height: pipeHeight.down + 'px',
            left: x + 'px',
        })

        this.el.appendChild(oUpPipe);
        this.el.appendChild(oDownPipe);

        // 存放生成的一对柱子
        this.pipeArr.push({
            up: oUpPipe,
            down: oDownPipe,
            y: [pipeHeight.up, pipeHeight.up + 120],
        })
    },
    setScore: function(){
        this.scoreArr.push({
            score: this.score,
            time: this.getDate(),
        })

        // 按分数从高到低排行，分数高的在scoreArr数组前面
        this.scoreArr.sort(function(a,b){
            return b.score - a.score;
        })

        setLocal('score', this.scoreArr);
    },
    getDate: function(){
        var d = new Date();
        var year = d.getFullYear();
        var month = formatNum(d.getMonth() + 1);
        var day = formatNum(d.getDate());
        var hour = formatNum(d.getHours());
        var minute = formatNum(d.getMinutes());
        var second = formatNum(d.getSeconds());

        // 模板字符串 反引号``包含 ${}可换成对应变量拼接
        return `${year}.${month}.${day} ${hour}:${minute}:${second}`
    },
    failGame: function(){
        clearInterval(this.timer);
        this.setScore();
        this.oMask.style.display = 'block';
        this.oEnd.style.display = 'block';
        // this.oBird.style.display = 'none';
        this.oScore.style.display = 'none';
        this.oFinalScore.innerText = this.score;
        this.renderRankList();      // 渲染排行榜
    },
    renderRankList: function(){
        //innerHTML = '<div></div>'
        var template = '';
        for(var i = 0; i < 8; i++){
            var degreeClass = '';
            switch(i){
                case 0:
                    degreeClass = 'first';
                    break;
                case 1:
                    degreeClass = 'second';
                    break;
                case 2:
                    degreeClass = 'third';
                    break;
            }

            template += `
                <li class="rank-item">
                    <span class="rank-degree ${degreeClass}">${i + 1}</span>
                    <span class="rank-score">${this.scoreArr[i].score}</span>
                    <span class="rank-time">${this.scoreArr[i].time}</span>
                </li>
            `
        }
        this.oRankList.innerHTML = template;
    },
};