const canvas = document.getElementById("screen");
const gameArea = document.getElementById("gameArea");
const gameAreaWidth = gameArea.getBoundingClientRect().width;
canvas.style.width = gameAreaWidth;
canvas.style.height = 16/9*gameAreaWidth;
canvas.width = gameAreaWidth;
canvas.height = 16/9*gameAreaWidth;
const c = canvas.getContext("2d");

// CONSTANTS
const W = canvas.width;
const H = canvas.height;
const centerX = W/2;
const centerY = H/2;

// INPUT HANDLER

const canvasPos = canvas.getBoundingClientRect();

const controller = {
    direction: 0,
    side: undefined
}

const canvasCenterX = canvasPos.x + centerX;

const leftButton = document.getElementById("btn-left");
const leftButtonInfo = leftButton.getBoundingClientRect()
const detectLeftButtonClick = (x,y) => {
    if (x >= leftButtonInfo.x &&
        x <= leftButtonInfo.x + leftButtonInfo.width &&
        y >= leftButtonInfo.y &&
        y <= leftButtonInfo.y + leftButtonInfo.height) {
            return true;
        }
    return false;
}

const rightButton = document.getElementById("btn-right");
const rightButtonInfo = rightButton.getBoundingClientRect()
const detectRightButtonClick = (x,y) => {
    if (x >= rightButtonInfo.x &&
        x <= rightButtonInfo.x + rightButtonInfo.width &&
        y >= rightButtonInfo.y &&
        y <= rightButtonInfo.y + rightButtonInfo.height) {
            return true;
        }
    return false;
}

document.addEventListener("mousedown", event => {
    const x = event.x;
    const y = event.y;
    if(detectLeftButtonClick(x,y)) {
        controller.direction = -1;
        controller.side = "left";
    } else if (detectRightButtonClick(x,y)) {
        controller.direction = 1;
        controller.side = "right";
    }
});

document.addEventListener("mouseup", () => {
    switch (controller.side) {
        case "left":
            if (controller.direction = -1) {
                controller.direction = 0;
            }
            break;
        case "right":
            if (controller.direction = 1) {
                controller.direction = 0;
            }
            break;
        default:
            break;
    }
});

document.addEventListener("touchstart", event => {
    const posX = event.x - canvasCenterX
    if (posX < 0) {
        controller.direction = -1;
    } else {
        controller.direction = 1;
    }
});

document.addEventListener("touchend", event => {
    const posX = event.x - canvasCenterX
    if (posX < 0) {
        if (controller.direction == -1) controller.direction = 0;
    } else {
        if (controller.direction == 1) controller.direction = 0;
    }
});

document.addEventListener("keydown", event => {
    switch (event.key) {
        case "ArrowLeft":
            controller.direction = -1;
            break;
        case "ArrowRight":
            controller.direction = 1;
            break;
        default:
            break;
    }
});

document.addEventListener("keyup", event => {
    switch (event.key) {
        case "ArrowLeft":
            if (controller.direction == -1) controller.direction = 0;
            break;
        case "ArrowRight":
            if (controller.direction == 1) controller.direction = 0;
            break;
        default:
            break;
    }
});



const drawVerticalLine = (xIntercept, color) => {
    c.beginPath();
    c.moveTo(xIntercept, H);
    c.lineTo(xIntercept, 0);
    c.strokeStyle = color;
    c.stroke();
}

const drawHorizontalLine = (yIntercept, from, to, color) => {
    c.beginPath();
    c.moveTo(from, yIntercept);
    c.lineTo(to, yIntercept);
    c.strokeStyle = color;
    c.stroke();
}

class Grid {
    constructor(nV, spacingV, spacingH, speedY, speedX, color) {
        this.speedY = speedY;
        this.speedX = 0;
        this.maxSpeedX = speedX;
        this.nV = nV;
        this.spaceV = spacingV*W;
        this.spaceH = spacingH*H;
        this.nH = Math.round(H/this.spaceH);
        this.verticalLinesInfo = {};
        this.horizontalLinesInfo = {};
        this.color = color;
    }

    init() {
        this.fillVertical();
        this.fillHorizontal();
    }

    fillVertical() {
        const xOffset = (W - this.spaceV*(this.nV-1))/2;
        for (let i=0; i<this.nV; i++) {
            this.verticalLinesInfo[i] = {xIntercept: xOffset + this.spaceV*i};
        }
    }

    fillHorizontal() {
        const xOffset = (W - this.spaceV*(this.nV-1))/2;
        const endOffset = xOffset + this.spaceV*(this.nV-1);
        for (let i=0; i<this.nH; i++) {
            this.horizontalLinesInfo[i] = {yIntercept: H-this.spaceH*i-this.spaceH, from: xOffset, to: endOffset}
        }
    }

    draw() {
        for (let i=0; i<this.nV; i++) {
            const line = this.verticalLinesInfo[i];
            line.xIntercept += this.speedX;
            drawVerticalLine(line.xIntercept, this.color);
        }
        for(let i=0; i<this.nH; i++) {
            const line = this.horizontalLinesInfo[i];
            line.from += this.speedX;
            line.to += this.speedX;
            drawHorizontalLine(line.yIntercept, line.from, line.to, this.color);
        }
    }

    drawTiles() {

    }

    makeTile() {

    }

    update(dt) {
        if(!dt) return;
        for (let i=0; i<this.nH; i++) {
            const line = this.horizontalLinesInfo[i];
            if (this.horizontalLinesInfo[0].yIntercept >= H) {
                // reset for infinite loop illusion
                line.yIntercept -= this.spaceH;
            } else {
                line.yIntercept += this.speedY/dt;
            }
        }
        this.speedX = this.maxSpeedX/dt * -controller.direction;
    }
}

class Player {
    constructor(width, height, color) {
        this.width = width;
        this.height = height;
        this.bottomPosition = H-5;
        this.color = color;
    }

    draw() {
        c.beginPath();
        c.moveTo(centerX, this.bottomPosition-this.height);
        c.lineTo(centerX-this.width/2, this.bottomPosition);
        c.lineTo(centerX+this.width/2, this.bottomPosition);
        c.fillStyle = this.color;
        c.fill();
    }
}



let grid = new Grid(8, 0.1, 0.1, 1, 5, "grey");
grid.init();

let player = new Player(grid.spaceV*0.6, grid.spaceH*0.3, "red");

let lastTime = 0;
const animate = (timeStamp) => {
    const dt = timeStamp - lastTime;
    lastTime = timeStamp;

    c.clearRect(0,0,canvas.width,canvas.height);

    grid.draw();
    grid.update(dt);

    player.draw();

    requestAnimationFrame(animate);

}

animate();