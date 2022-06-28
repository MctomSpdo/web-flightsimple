export default class PFD {
    canvas
    ctx

    height
    width

    airspeed = 'ERR'
    altitude = 'ERR'
    heading = 'ERR'
    autopilot = 'N/A'
    bank = "ERR"
    pitch = 'ERR'

    constructor(canvasElement) {
        this.canvas = canvasElement;

        this.canvas.height = this.canvas.getBoundingClientRect().height * 4;
        this.canvas.width = this.canvas.getBoundingClientRect().width * 4;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.ctx = this.canvas.getContext("2d");
    }

    render() {
        this.#clearCanvas();
        this.#renderHorizon();
        this.#renderHeader();
        this.#renderBody();
    }

    blackOut() {
        this.#clearCanvas();
    }

    #renderHorizon() {
        let {height: height, width: width, ctx: ctx} = this;
        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const degHeight = (height * 0.011538) * this.pitch;

        ctx.save();

        //background:
        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = '#11aed1';
        ctx.beginPath();
        ctx.fillRect(0, 0, width, height);
        ctx.fill();

        ctx.fillStyle = '#488000';
        ctx.lineWidth = 0;

        //calculate offset + horizon
        let offset = this.#getHorizonPixelLevel(width, this.bank);
        offset = (offset == Infinity) ? 9999999999999 : offset;

        const centerPos = height * 0.5 + degHeight;

        ctx.beginPath();
        ctx.moveTo(0, centerPos - offset);
        ctx.lineTo(width, centerPos + offset);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.lineTo(0, centerY - offset)

        ctx.stroke();
        ctx.fill();

        //pitch lines:
        const lineDistance = height * 0.03;
        const tinyWidth = width * 0.1;
        const smallWidth = width * 0.2;
        const wideWith = width * 0.3;

        const textHOffset = 25;
        const textWOffset = 100;

        //rotate everything by bank:
        ctx.translate(centerX, centerPos);
        ctx.rotate(Math.round(this.bank * Math.PI / 2) * 0.011);
        ctx.fillStyle = '#fff';

        //0 - 10 deg lines:
        ctx.moveTo(0 - tinyWidth * 0.5, 0 - lineDistance);
        ctx.lineTo(0 + tinyWidth * 0.5, 0 - lineDistance);
        ctx.moveTo(0 - smallWidth * 0.5, 0 - lineDistance * 2);
        ctx.lineTo(0 + smallWidth * 0.5, 0 - lineDistance * 2);
        ctx.moveTo(0 - tinyWidth * 0.5, 0 - lineDistance * 3);
        ctx.lineTo(0 + tinyWidth * 0.5, 0 - lineDistance * 3);
        ctx.moveTo(0 - wideWith * 0.5, 0 - lineDistance * 4);
        ctx.lineTo(0 + wideWith * 0.5, 0 - lineDistance * 4);
        ctx.fillText('10', 0 - wideWith * 0.5 - textWOffset, 0 - lineDistance * 4 + textHOffset);

        //0 - 20 deg lines:
        ctx.moveTo(0 - tinyWidth * 0.5, 0 - lineDistance * 5);
        ctx.lineTo(0 + tinyWidth * 0.5, 0 - lineDistance * 5);
        ctx.moveTo(0 - smallWidth * 0.5, 0 - lineDistance * 6);
        ctx.lineTo(0 + smallWidth * 0.5, 0 - lineDistance * 6);
        ctx.moveTo(0 - tinyWidth * 0.5, 0 - lineDistance * 7);
        ctx.lineTo(0 + tinyWidth * 0.5, 0 - lineDistance * 7);
        ctx.moveTo(0 - wideWith * 0.5, 0 - lineDistance * 8);
        ctx.lineTo(0 + wideWith * 0.5, 0 - lineDistance * 8);
        ctx.fillText('20', 0 - wideWith * 0.5 - textWOffset, 0 - lineDistance * 8 + textHOffset);

        //20 - 25 deg lines:
        ctx.moveTo(0 - tinyWidth * 0.5, 0 - lineDistance * 9);
        ctx.lineTo(0 + tinyWidth * 0.5, 0 - lineDistance * 9);
        ctx.moveTo(width * -1, 0 - lineDistance * 10);
        ctx.lineTo(width, 0 - lineDistance * 10);

        //0 - -10 deg lines:
        ctx.moveTo(0 - tinyWidth * 0.5, 0 + lineDistance);
        ctx.lineTo(0 + tinyWidth * 0.5, 0 + lineDistance);
        ctx.moveTo(0 - smallWidth * 0.5, 0 + lineDistance * 2);
        ctx.lineTo(0 + smallWidth * 0.5, 0 + lineDistance * 2);
        ctx.moveTo(0 - tinyWidth * 0.5, 0 + lineDistance * 3);
        ctx.lineTo(0 + tinyWidth * 0.5, 0 + lineDistance * 3);
        ctx.moveTo(0 - wideWith * 0.5, 0 + lineDistance * 4);
        ctx.lineTo(0 + wideWith * 0.5, 0 + lineDistance * 4);
        ctx.fillText('-10', 0 - wideWith * 0.5 - textWOffset, 0 + lineDistance * 4 + textHOffset);

        //-10 to -20 deg lines:
        ctx.moveTo(0 - tinyWidth * 0.5, 0 + lineDistance * 5);
        ctx.lineTo(0 + tinyWidth * 0.5, 0 + lineDistance * 5);
        ctx.moveTo(0 - smallWidth * 0.5, 0 + lineDistance * 6);
        ctx.lineTo(0 + smallWidth * 0.5, 0 + lineDistance * 6);
        ctx.moveTo(0 - tinyWidth * 0.5, 0 + lineDistance * 7);
        ctx.lineTo(0 + tinyWidth * 0.5, 0 + lineDistance * 7);
        ctx.moveTo(0 - wideWith * 0.5, 0 + lineDistance * 8);
        ctx.lineTo(0 + wideWith * 0.5, 0 + lineDistance * 8);
        ctx.fillText('-20', 0 - wideWith * 0.5 - textWOffset, 0 + lineDistance * 8 + textHOffset);

        //-20 to -25:
        ctx.moveTo(0 - tinyWidth * 0.5, 0 + lineDistance * 9);
        ctx.lineTo(0 + tinyWidth * 0.5, 0 + lineDistance * 9);
        ctx.moveTo(width * -1, 0 + lineDistance * 10);
        ctx.lineTo(width, 0 + lineDistance * 10);

        //draw:
        ctx.stroke();

        //restore angles:
        ctx.restore();

        //black overlay:
        ctx.beginPath();
        ctx.fillStyle = '#000';
        ctx.arc(centerX, centerY, height * 0.3, 0, 2 * Math.PI);
        ctx.rect(width, 0, -width, height);
        ctx.fill();

        ctx.beginPath();
        ctx.rect(0, 0, width * 0.20, height);
        ctx.rect(width * 0.8, 0, width * 0.2, height);
        ctx.fill();
    }

    #renderHeader() {
        let {height: height, width: width, ctx: ctx} = this;
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = "center";
        ctx.font = "60px Calibri";

        //section lines:
        const lineSep = width * 0.2;
        const lineHeight = height * 0.125;

        ctx.lineWidth = 4;
        ctx.moveTo(lineSep, 0);
        ctx.lineTo(lineSep, lineHeight);

        ctx.moveTo(lineSep * 2, 0);
        ctx.lineTo(lineSep * 2, lineHeight);

        ctx.moveTo(lineSep * 3, 0);
        ctx.lineTo(lineSep * 3, lineHeight);

        ctx.moveTo(lineSep * 4, 0);
        ctx.lineTo(lineSep * 4, lineHeight);

        //text:
        let renderHeight = height * 0.05;

        ctx.fillText("S P E E D", lineSep * 0.5, renderHeight);
        ctx.fillText("A L T", lineSep * 1.5, renderHeight);
        ctx.fillText("H D G", lineSep * 2.5, renderHeight);
        ctx.fillText("B A N K", lineSep * 3.5, renderHeight);
        ctx.fillText("A P", lineSep * 4.5, renderHeight);

        //values:
        renderHeight = height * 0.1;
        ctx.fillStyle = "#5882f3";
        ctx.fillText(Math.round(this.airspeed), lineSep * 0.5, renderHeight);
        ctx.fillText(Math.round(this.altitude), lineSep * 1.5, renderHeight);
        ctx.fillText(Math.round(this.heading), lineSep * 2.5, renderHeight);
        ctx.fillText(Math.round(this.bank), lineSep * 3.5, renderHeight);
        ctx.fillText(Math.round(this.autopilot), lineSep * 4.5, renderHeight);
        ctx.stroke();
    }

    #renderBody() {
        this.#renderLeftBody();
        this.#renderRightBody();
        this.#renderMiddleBody();
    }

    #renderLeftBody() {
        let {height: height, width: width, ctx: ctx} = this;
        ctx.beginPath();
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = '#808080';
        ctx.lineWidth = 6;

        //primary rect:
        ctx.fillRect(width * 0.02, height * 0.2, width * 0.10, height * 0.6);
        ctx.rect(width * 0.02, height * 0.2, width * 0.10, height * 0.6);

        //litte markings at top and bottom of primary rect:
        ctx.moveTo(this.width * 0.1, this.height * 0.2)
        ctx.lineTo(this.width * 0.15, this.hseight * 0.2);
        ctx.moveTo(this.width * 0.1, this.height * 0.8);
        ctx.lineTo(this.width * 0.15, this.height * 0.8);
        ctx.stroke();

        //scale:
        const scaleBeginnGraphic = this.height * 0.2;
        const GUI_size = this.height * 0.6;
        const scaleEndGraphic = scaleBeginnGraphic + GUI_size;
        const textHeight = this.height * 0.045;

        ctx.fillStyle = '#fff';
        ctx.font = textHeight + 'px Calibri';

        //put all levels to display into Array:
        const levels = new Array();
        levels.push(Math.ceil(this.airspeed / 10) * 10);
        levels.push(Math.ceil(this.airspeed / 10) * 10 - 5);
        levels.push(Math.ceil(this.airspeed / 10) * 10 + 5);
        levels.push(Math.ceil(this.airspeed / 10) * 10 + 10);
        levels.push(Math.ceil(this.airspeed / 10) * 10 + 15);
        levels.push(Math.floor(this.airspeed / 10) * 10);
        levels.push(Math.floor(this.airspeed / 10) * 10 - 5);
        levels.push(Math.floor(this.airspeed / 10) * 10 - 10);
        levels.push(Math.floor(this.airspeed / 10) * 10 - 15);

        levels.forEach((value) => {
            const difference = this.airspeed - value;
            const differenceGUI = (GUI_size) * (difference / 40);
            const posy = height * 0.5 + differenceGUI;
            ctx.beginPath();

            if (posy >= scaleBeginnGraphic && posy <= scaleEndGraphic) {
                //draw lines:
                if (value % 10 == 0) {
                    ctx.lineWidth = 12;
                    ctx.moveTo(width * 0.1, posy);
                    ctx.lineTo(width * 0.12, posy);
                    if (posy >= scaleBeginnGraphic + textHeight * 0.4 && posy <= scaleEndGraphic - textHeight * 0.4) {
                        ctx.fillText(Math.round(value), this.width * 0.057, posy + textHeight * 0.35);
                    }
                } else {
                    ctx.lineWidth = 8;
                    ctx.moveTo(width * 0.11, posy);
                    ctx.lineTo(width * 0.12, posy);
                }
            }
            ctx.stroke();
        });

        //speed number box:
        ctx.fillStyle = '#000';
        ctx.lineWidth = 6;
        ctx.beginPath();
        const boxheight = height * 0.08;
        const boxwidth = width * 0.15;
        const boxstartWidth = width * 0.01;
        const fontSize = height * 0.05;

        ctx.moveTo(boxstartWidth, height * 0.5 - boxheight * 0.5);
        ctx.lineTo(boxstartWidth + boxwidth * 0.8, height * 0.5 - boxheight * 0.5);
        ctx.lineTo(boxstartWidth + boxwidth * 0.8, height * 0.5 - boxheight * 0.25);
        ctx.lineTo(boxstartWidth + boxwidth, height * 0.5);
        ctx.lineTo(boxstartWidth + boxwidth * 0.8, height * 0.5 + boxheight * 0.25)
        ctx.lineTo(boxstartWidth + boxwidth * 0.8, height * 0.5 + boxheight * 0.5);
        ctx.lineTo(boxstartWidth, height * 0.5 + boxheight * 0.5);
        ctx.lineTo(boxstartWidth, height * 0.5 - boxheight * 0.5);

        ctx.fill()
        ctx.stroke();

        //text inside of box:
        ctx.fillStyle = '#fff';
        ctx.font = fontSize + 'px Calibri';
        ctx.fillText(Math.round(this.airspeed), boxstartWidth + boxwidth * 0.4, height * 0.5 + fontSize * 0.3);
    }

    #renderRightBody() {
        let {height: height, width: width, ctx: ctx} = this;
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = '#808080';
        ctx.lineWidth = 6;

        //primary rect:
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = '#808080';
        ctx.lineWidth = 6;

        //litte markings at top and bottom of primary rect:
        ctx.fillRect(width * 0.88, height * 0.20, width * 0.10, height * 0.6);
        ctx.strokeRect(width * 0.88, height * 0.20, width * 0.10, height * 0.6);

        ctx.moveTo(width * 0.88, height * 0.20);
        ctx.lineTo(width * 0.85, height * 0.20);
        ctx.moveTo(width * 0.88, height * 0.80);
        ctx.lineTo(width * 0.85, height * 0.80);
        ctx.stroke();

        //alt number box:
        const boxheight = height * 0.06;

        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#fff700';
        ctx.lineWidth = 6;

        ctx.moveTo(width * 0.85, height * 0.5 - boxheight * 0.5);
        ctx.lineTo(width * 0.92, height * 0.5 - boxheight * 0.5);
        ctx.lineTo(width * 0.92, height * 0.5 - boxheight * 0.9);
        ctx.lineTo(width * 0.98, height * 0.5 - boxheight * 0.9);
        ctx.lineTo(width * 0.98, height * 0.5 + boxheight * 0.9);
        ctx.lineTo(width * 0.92, height * 0.5 + boxheight * 0.9);
        ctx.lineTo(width * 0.92, height * 0.5 + boxheight * 0.5);
        ctx.lineTo(width * 0.85, height * 0.5 + boxheight * 0.5);

        ctx.fill();
        ctx.stroke();

        const fontSize = this.height * 0.05;
        ctx.font = fontSize + 'px Calibri';
        ctx.fillStyle = '#fff700';
        ctx.textAlign = 'right';

        let alt_num = Math.floor(this.altitude / 1000).toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
        });

        let alt_num1 = Math.floor((this.altitude - Math.floor(this.altitude / 1000) * 1000) / 10 ).toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
        });

        ctx.fillText(alt_num, width * 0.92, height * 0.5 + fontSize * 0.3);
        ctx.fillText(alt_num1, width * 0.975, height * 0.5 + fontSize * 0.3);

        ctx.restore();
    }

    #renderMiddleBody() {
        let {height: height, width: width, ctx: ctx} = this;
        this.ctx.fillStyle = '#000';
        this.ctx.strokeStyle = '#fff700';
        this.ctx.lineWidth = 6;

        const boxheight = height * 0.02;
        const boxwidth = width * 0.1
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        //left static line:
        ctx.beginPath();
        ctx.moveTo(width * 0.22, centerY - boxheight * 0.5);
        ctx.lineTo(width * 0.22 + boxwidth, centerY - boxheight * 0.5);
        ctx.lineTo(width * 0.22 + boxwidth, centerY + boxheight * 2);
        ctx.lineTo(width * 0.22 + boxwidth - boxheight, centerY + boxheight * 2);
        ctx.lineTo(width * 0.22 + boxwidth - boxheight, centerY + boxheight * 0.5);
        ctx.lineTo(width * 0.22, centerY + boxheight * 0.5);
        ctx.lineTo(width * 0.22, centerY - boxheight * 0.5);

        ctx.fill();
        ctx.stroke();

        //right static line:
        ctx.beginPath();
        ctx.moveTo(width * 0.78, centerY - boxheight * 0.5);
        ctx.lineTo(width * 0.78 - boxwidth, centerY - boxheight * 0.5);
        ctx.lineTo(width * 0.78 - boxwidth, centerY + boxheight * 2);
        ctx.lineTo(width * 0.78 - boxwidth + boxheight, centerY + boxheight * 2);
        ctx.lineTo(width * 0.78 - boxwidth + boxheight, centerY + boxheight * 0.5);
        ctx.lineTo(width * 0.78, centerY + boxheight * 0.5);
        ctx.lineTo(width * 0.78, centerY - boxheight * 0.5);

        ctx.fill();
        ctx.stroke();

        //center dot:
        ctx.fillRect(centerX - boxheight * 0.5, centerY - boxheight * 0.5, boxheight, boxheight)
        ctx.strokeRect(centerX - boxheight * 0.5, centerY - boxheight * 0.5, boxheight, boxheight)
    }

    #getHorizonPixelLevel(width, angle) {
        let alpha = 90 - angle;
        let a = width / 2;
        return a / Math.tan(alpha * Math.PI / 180);
    }

    #clearCanvas() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}