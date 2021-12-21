const canvas = document.getElementById("screen");
const gameArea = document.getElementById("gameArea");
const gameAreaWidth = gameArea.getBoundingClientRect().width;
canvas.width = gameAreaWidth;
canvas.height = 16/9*gameAreaWidth;
const c = canvas.getContext("2d");

const text = document.getElementById("text");
text.textContent = "coord";

const text2 = document.getElementById("text2");
text2.textContent = "0";

// CONSTANTS
const W = canvas.width;
const H = canvas.height - canvas.height*0.1;
const centerX = W/2;
const centerY = H/2;

// INPUT HANDLER

const canvasCenterX = canvas.getBoundingClientRect().x + centerX;

class GamePad {
    constructor() {

        this.controller = {
            direction: 0
        };

        canvas.addEventListener("touchstart", event => {
            const posX = event.x - canvasCenterX
            text.textContent = posX.toString();
            if (posX < 0) {
                this.controller.direction = -1;
            } else {
                this.controller.direction = 1;
            }
        }, false);

        canvas.addEventListener("touchend", event => {
            const posX = event.x - canvasCenterX
            text.textContent = posX.toString();
            if (posX < 0) {
                if (this.controller.direction == -1) this.controller.direction = 0;
            } else {
                if (this.controller.direction == 1) this.controller.direction = 0;
            }
        }, false);

        document.addEventListener("keydown", event => {
            switch (event.key) {
                case "ArrowLeft":
                    this.controller.direction = -1;
                    break;
                case "ArrowRight":
                    this.controller.direction = 1;
                    break;
                default:
                    break;
            }
        });

        document.addEventListener("keyup", event => {
            switch (event.key) {
                case "ArrowLeft":
                    if (this.controller.direction == -1) this.controller.direction = 0;
                    break;
                case "ArrowRight":
                    if (this.controller.direction == 1) this.controller.direction = 0;
                    break;
                default:
                    break;
            }
        });

    }
    draw() {
        c.beginPath();
        c.rect(0, H, W, canvas.height*0.1);
        c.fillStyle = "white";
        c.fill();
        c.strokeStyle = "black";
        c.stroke();

        c.beginPath();
        c.moveTo(centerX, canvas.height);
        c.lineTo(centerX, H);
        c.strokeStyle = "black";
        c.stroke();
    }
}

// GAME


const GameState = 1;

c.beginPath();
c.moveTo(0, H);
c.lineTo(W, H);
c.strokeStyle = "black";
c.stroke();

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

const tilesPath = [
    [3,0]
];

class Grid {
    constructor(nV, spacingV, spacingH, speedY, speedX, color, gamePad) {
        this.speedY = speedY * H;
        this.speedX = 0;
        this.maxSpeedX = speedX * W;
        this.nV = nV;
        this.spaceV = spacingV*W;
        this.spaceH = spacingH*H;
        this.nH = Math.round(H/this.spaceH);
        this.verticalLinesInfo = {};
        this.horizontalLinesInfo = {};
        this.color = color;
        this.tileStep = 0;

        this.gamePad = gamePad;
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
        this.drawTiles();
    }

    drawTiles() {
        tilesPath.forEach(coord => this.makeTile(coord[0], coord[1]));
    }

    makeTile(xPos, yPos) {
        const x = this.verticalLinesInfo[xPos].xIntercept;
        const y = this.horizontalLinesInfo[yPos].yIntercept + this.tileStep*this.spaceH;
        c.beginPath();
        c.rect(x, y, this.spaceV, this.spaceH)
        c.fillStyle = "grey";
        c.fill();
        c.strokeStyle = "grey";
        c.stroke();
    }

    update(dt) {
        if(!dt) return;
        for (let i=0; i<this.nH; i++) {
            const line = this.horizontalLinesInfo[i];
            if (this.horizontalLinesInfo[0].yIntercept >= H) {
                // reset for infinite loop illusion
                line.yIntercept -= this.spaceH;
            } else {
                line.yIntercept += this.speedY*dt*60;
            }
        }
        this.speedX = this.maxSpeedX*dt*60 * -this.gamePad.controller.direction;
        if (this.horizontalLinesInfo[0].yIntercept > H) this.tileStep += 1;
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


let gamePad = new GamePad();
let grid = new Grid(8, 0.1, 0.1, 0.005, 0.01, "grey", gamePad);
grid.init();
let player = new Player(grid.spaceV*0.6, grid.spaceH*0.3, "red");

let lastTime = 0;
const animate = (timeStamp) => {
    const dt = timeStamp - lastTime;
    lastTime = timeStamp;

    if (GameState == 1) {
        c.clearRect(0,0,W,H);

        grid.draw();
        grid.update(dt/1000);
        player.draw();

        gamePad.draw();        
    }
    
    text2.textContent = "controller: " + gamePad.controller.direction.toString();

    requestAnimationFrame(animate);

}

animate();
