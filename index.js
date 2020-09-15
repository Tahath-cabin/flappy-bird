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

    // 初始化函数
    init: function () {
        this.initData();
        this.animate();
        this.handle();
    },

    initData: function () {
        this.el = document.getElementById('game');
        // dom元素变量约定以'o'做前缀，在父级中找bird元素，确保知道其排序
        this.oBird = this.el.getElementsByClassName('bird')[0];
        this.oStart = this.el.getElementsByClassName('start')[0];
        this.oScore = this.el.getElementsByClassName('score')[0];
        this.oMask = this.el.getElementsByClassName('mask')[0];
        this.oEnd = this.el.getElementsByClassName('end')[0];
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
    judegPipe: function(){},

    // handle 管理事件处理函数
    handle: function () {
        this.handleStart();
    },
    handleStart: function () {
        var self = this;
        this.oStart.onclick = function () {
            self.startFlag = true;
            self.oBird.style.left = '80px';
            self.oStart.style.display = 'none';
            self.oScore.style.display = 'block';
            self.skyStep = 5;
        }
    },

    failGame: function(){
        clearInterval(this.timer);
        this.oMask.style.display = 'block';
        this.oEnd.style.display = 'block';
        this.oBird.style.display = 'none';
        this.oScore.style.display = 'none';
    }
};