const canvas = document.getElementById("screen");
canvas.width = 500;
canvas.height = 500;
const c = canvas.getContext("2d");

// CONSTANTS
const W = canvas.width;
const H = canvas.height;
const centerX = W/2;
const centerY = H/2;

const drawVerticalLine = (xIntercept) => {
    c.beginPath();
    c.moveTo(xIntercept, H);
    c.lineTo(xIntercept, 0);
    c.stroke();
}

const drawHorizontalLine = (yIntercept, from, to) => {
    c.beginPath();
    c.moveTo(from, yIntercept);
    c.lineTo(to, yIntercept);
    c.stroke();
}

class Grid {
    constructor(nV, spacingV, spacingH, speedY) {
        this.speedY = speedY;
        this.nV = nV;
        this.spaceV = spacingV*W;
        this.spaceH = spacingH*H;
        this.nH = Math.round(H/this.spaceH);
        this.verticalLinesInfo = {};
        this.horizontalLinesInfo = {};
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
            drawVerticalLine(line.xIntercept);
        }
        for(let i=0; i<this.nH; i++) {
            const line = this.horizontalLinesInfo[i];
            drawHorizontalLine(line.yIntercept, line.from, line.to);
        }
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
    }
}

class Player {
    constructor(width, height) {

    }
}



let grid = new Grid(8, 0.1, 0.1, 1);
grid.init();

let lastTime = 0;
const animate = (timeStamp) => {
    const dt = timeStamp - lastTime;
    lastTime = timeStamp;

    c.clearRect(0,0,canvas.width,canvas.height);

    grid.draw();
    grid.update(dt);

    requestAnimationFrame(animate);

}

animate();