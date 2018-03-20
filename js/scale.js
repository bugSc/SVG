function svgFn(el) {
    var reqAnimationFrame = (function() {
        return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    })();

    var START_X = Math.round((window.innerWidth - el.getAttribute('width')) / 2);
    var START_Y = Math.round((window.innerHeight - el.getAttribute('height')) / 2);

    var ticking = false;
    var transform; //图像效果
    var initScale = 1; //放大倍数

    var mc = new Hammer.Manager(el); //用管理器  可以同时触发旋转 拖拽  移动
    //var mc = new Hammer(el);        //旋转和移动互斥
    /**
    ev.srcEvent.type  touchstart  touchend touchmove
    ev.deltaX  手势移动位移变量  
    */
    mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
    mc.add(new Hammer.Rotate({ threshold: 0 })).recognizeWith(mc.get('pan'));
    mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith([mc.get('pan'), mc.get('rotate')]);
    //结束时做一些处理
    mc.on("hammer.input", function(ev) {
        if (ev.isFinal) {
            START_X = transform.translate.x;
            START_Y = transform.translate.y;
        }

    });
    mc.on("panstart panmove", onPan);
    // mc.on("rotatestart rotatemove rotateend", onRotate);
    mc.on("pinchstart pinchmove", onPinch);
    /**
    第二次进入拖拽时  delta位移重置
    移动时 初始位置startxy不动。delta增加
    */
    function onPan(ev) {
        if (!ev.isFinal) {
            transform.translate = {
                x: START_X + ev.deltaX,
                y: START_Y + ev.deltaY
            };
            requestElementUpdate();
        }
    }

    function onPinch(ev) {
        if (ev.type == 'pinchstart') {
            initScale = transform.scale || 1;
        }
        transform.scale = initScale * ev.scale;
        requestElementUpdate();
    }

    function updateElementTransform() {
        var value = [
            'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0)',
            'scale(' + transform.scale + ', ' + transform.scale + ')'
            // ,'rotate3d(' + transform.rx + ',' + transform.ry + ',' + transform.rz + ',' + transform.angle + 'deg)'
        ];

        value = value.join(" ");
        el.style.webkitTransform = value; /*为Chrome/Safari*/
        el.style.mozTransform = value; /*为Firefox*/
        el.style.transform = value; /*IE Opera?*/
        ticking = false;
    }

    function requestElementUpdate() {
        if (!ticking) {
            reqAnimationFrame(updateElementTransform);
            ticking = true;
        }
    }

    /**
    初始化设置
    */
    function resetElement() {

        el.className = 'animate';
        transform = {
            translate: { x: START_X, y: START_Y },
            scale: 1,
            angle: 0,
            rx: 0,
            ry: 0,
            rz: 0
        };
        requestElementUpdate();
    }

    resetElement();
}