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
        this.#renderHorizon();
        this.#renderHeader();
        this.#renderBody();
    }

    #renderHorizon() {
        this.ctx.save();
        let degHeight = (this.height *0.011538) * this.pitch;


        //background:
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.fillStyle = '#11aed1';
        this.ctx.beginPath();
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fill();

        
        this.ctx.fillStyle = '#488000';
        this.ctx.lineWidth = 0;

        //calculate offset
        let offset = this.#getHorizonPixelLevel(this.width, this.bank);

        if(offset == Infinity) {
            offset = 9999999999999;
        }

        let centerPos = this.height * 0.5 + degHeight;

        this.ctx.beginPath();
        this.ctx.moveTo(0, centerPos - offset);
        this.ctx.lineTo(this.width, centerPos + offset);
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.lineTo(0, this.height * 0.5 - offset)

        this.ctx.stroke();
        this.ctx.fill();

        this.ctx.fillStyle = '#fff';
        //pitch lines:
        let lineDistance = this.height * 0.03;
        let tinyWidth = this.width * 0.1;
        let smallWidth = this.width * 0.2;
        let wideWith = this.width * 0.3;

        let textHOffset = 25;
        let textWOffset = 100;

        //rotate everything by bank:
        this.ctx.translate(this.width * 0.5, centerPos);
        this.ctx.rotate(Math.round(this.bank * Math.PI / 2) * 0.011);

        //0 - 10 deg lines:
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 - lineDistance);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 - lineDistance);
        this.ctx.moveTo(0 - smallWidth * 0.5, 0 - lineDistance * 2);
        this.ctx.lineTo(0 + smallWidth * 0.5, 0 - lineDistance * 2);
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 - lineDistance * 3);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 - lineDistance * 3);
        this.ctx.moveTo(0 - wideWith * 0.5, 0 - lineDistance * 4);
        this.ctx.lineTo(0 + wideWith * 0.5, 0 - lineDistance * 4);
        this.ctx.fillText('10', 0 - wideWith * 0.5 - textWOffset, 0 - lineDistance * 4 + textHOffset);

        //0 - 20 deg lines:
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 - lineDistance * 5);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 - lineDistance* 5);
        this.ctx.moveTo(0 - smallWidth * 0.5, 0 - lineDistance * 6);
        this.ctx.lineTo(0 + smallWidth * 0.5, 0 - lineDistance* 6);
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 - lineDistance * 7);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 - lineDistance* 7);
        this.ctx.moveTo(0 - wideWith * 0.5, 0 - lineDistance * 8);
        this.ctx.lineTo(0 + wideWith * 0.5, 0 - lineDistance* 8);
        this.ctx.fillText('20', 0 - wideWith * 0.5 - textWOffset, 0 - lineDistance * 8 + textHOffset);

        //20 - 25 deg lines:
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 - lineDistance * 9);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 - lineDistance * 9);
        this.ctx.moveTo(this.width * -1, 0 - lineDistance * 10);
        this.ctx.lineTo(this.width, 0  - lineDistance * 10);

        //0 - -10 deg lines:
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 + lineDistance);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 + lineDistance);
        this.ctx.moveTo(0 - smallWidth * 0.5, 0 + lineDistance * 2);
        this.ctx.lineTo(0 + smallWidth * 0.5, 0 + lineDistance * 2);
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 + lineDistance * 3);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 + lineDistance * 3);
        this.ctx.moveTo(0 - wideWith * 0.5, 0 + lineDistance * 4);
        this.ctx.lineTo(0 + wideWith * 0.5, 0 + lineDistance * 4);
        this.ctx.fillText('-10', 0 - wideWith * 0.5 - textWOffset, 0 + lineDistance * 4 + textHOffset);
        

        //-10 to -20 deg lines:
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 + lineDistance * 5);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 + lineDistance* 5);
        this.ctx.moveTo(0 - smallWidth * 0.5, 0 + lineDistance * 6);
        this.ctx.lineTo(0 + smallWidth * 0.5, 0 + lineDistance* 6);
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 + lineDistance * 7);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 + lineDistance* 7);
        this.ctx.moveTo(0 - wideWith * 0.5, 0 + lineDistance * 8);
        this.ctx.lineTo(0 + wideWith * 0.5, 0 + lineDistance* 8);
        this.ctx.fillText('-20', 0 - wideWith * 0.5 - textWOffset, 0 + lineDistance * 8 + textHOffset);

        //-20 to -25:
        this.ctx.moveTo(0 - tinyWidth * 0.5, 0 + lineDistance * 9);
        this.ctx.lineTo(0 + tinyWidth * 0.5, 0 + lineDistance * 9);
        this.ctx.moveTo(this.width * -1, 0 + lineDistance * 10);
        this.ctx.lineTo(this.width, 0  + lineDistance * 10);

        //draw:
        this.ctx.stroke();

        //restore angles:
        this.ctx.restore();

        //black overlay:
        this.ctx.beginPath();
        this.ctx.fillStyle = '#000';
        this.ctx.arc(this.width * 0.5, this.height * 0.5, this.height * 0.3 , 0, 2 * Math.PI);
        this.ctx.rect(this.width, 0, -this.width, this.height);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.width * 0.20, this.height);
        this.ctx.rect(this.width * 0.8, 0, this.width * 0.2, this.height);
        this.ctx.fill();        
    }

    #renderHeader() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = "center";
        this.ctx.font = "60px Calibri"

        //section lines:
        let lineSep = this.width / 5;
        let lineHeight = this.height / 8;

        this.ctx.lineWidth = 4;
        this.ctx.moveTo(lineSep, 0);
        this.ctx.lineTo(lineSep, lineHeight);

        this.ctx.moveTo(lineSep * 2, 0);
        this.ctx.lineTo(lineSep * 2, lineHeight);

        this.ctx.moveTo(lineSep * 3, 0)
        this.ctx.lineTo(lineSep * 3, lineHeight);

        this.ctx.moveTo(lineSep * 4, 0)
        this.ctx.lineTo(lineSep * 4, lineHeight);

        //text:
        let renderHeight = this.height * 0.05;

        this.ctx.fillText("S P E E D", lineSep * 0.5, renderHeight);
        this.ctx.fillText("A L T", lineSep * 1.5, renderHeight);
        this.ctx.fillText("H D G", lineSep * 2.5, renderHeight);
        this.ctx.fillText("B A N K", lineSep * 3.5, renderHeight);
        this.ctx.fillText("A P", lineSep * 4.5, renderHeight);

        //values:
        renderHeight = this.height * 0.1;
        this.ctx.fillStyle = "#5882f3";
        this.ctx.fillText(this.airspeed, lineSep * 0.5, renderHeight);
        this.ctx.fillText(this.altitude, lineSep * 1.5, renderHeight);
        this.ctx.fillText(this.heading, lineSep * 2.5, renderHeight);
        this.ctx.fillText(this.bank, lineSep * 3.5, renderHeight);
        this.ctx.fillText(this.autopilot, lineSep * 4.5, renderHeight);
        this.ctx.stroke();
    }

    #renderBody() {
        this.#renderLeftBody();
        this.#renderRightBody();
        this.#renderMiddleBody();
    }

    #renderLeftBody() {
        this.ctx.beginPath();
        this.strokeStyle = '#fff';
        this.ctx.fillStyle = '#808080';
        this.ctx.lineWidth = 6;

        //primary rect:
        this.ctx.fillRect(this.width * 0.02, this.height * 0.20, this.width * 0.10, this.height * 0.6);
        this.ctx.rect(this.width * 0.02, this.height * 0.20, this.width * 0.10, this.height * 0.6);

        //litte markings at top and bottom of primary rect:
        this.ctx.moveTo(this.width * 0.1, this.height * 0.20)
        this.ctx.lineTo(this.width * 0.15, this.height * 0.20);
        this.ctx.moveTo(this.width * 0.10, this.height * 0.80);
        this.ctx.lineTo(this.width * 0.15, this.height * 0.80);
        this.ctx.stroke();

        //speed number box:
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        let boxheight = this.height * 0.08;
        let boxwidth = this.width * 0.15;
        let boxstartWidth = this.width * 0.01;
        let fontSize = this.height * 0.05;

        this.ctx.moveTo(boxstartWidth, this.height * 0.5 - boxheight * 0.5);
        this.ctx.lineTo(boxstartWidth + boxwidth * 0.8, this.height * 0.5 - boxheight * 0.5);
        this.ctx.lineTo(boxstartWidth + boxwidth * 0.8, this.height * 0.5 - boxheight * 0.25);
        this.ctx.lineTo(boxstartWidth + boxwidth, this.height * 0.5);
        this.ctx.lineTo(boxstartWidth + boxwidth * 0.8, this.height * 0.5 + boxheight * 0.25)
        this.ctx.lineTo(boxstartWidth + boxwidth * 0.8, this.height * 0.5 + boxheight * 0.5);
        this.ctx.lineTo(boxstartWidth, this.height * 0.5 + boxheight * 0.5);
        this.ctx.lineTo(boxstartWidth, this.height * 0.5 - boxheight * 0.5);

        this.ctx.fill() 
        this.ctx.stroke();

        //text inside of box:
        this.ctx.fillStyle = '#fff';
        this.ctx.font = fontSize + 'px Calibri';
        this.ctx.fillText(this.airspeed, boxstartWidth + boxwidth * 0.4, this.height * 0.5 + fontSize * 0.3);
    }

    #renderRightBody() {
        this.strokeStyle = '#fff';
        this.ctx.fillStyle = '#808080';
        this.ctx.lineWidth = 6;

        //primary rect:
        this.strokeStyle = '#fff';
        this.ctx.fillStyle = '#808080';
        this.ctx.lineWidth = 6;

        //litte markings at top and bottom of primary rect:
        this.ctx.fillRect(this.width * 0.88, this.height * 0.20, this.width * 0.10, this.height * 0.6);
        this.ctx.rect(this.width * 0.88, this.height * 0.20, this.width * 0.10, this.height * 0.6);

        this.ctx.moveTo(this.width * 0.88, this.height * 0.20);
        this.ctx.lineTo(this.width * 0.85, this.height * 0.20);
        this.ctx.moveTo(this.width * 0.88, this.height * 0.80);
        this.ctx.lineTo(this.width * 0.85, this.height * 0.80);
        this.ctx.stroke();
    }

    #renderMiddleBody() {
        this.ctx.fillStyle = '#000';
        this.ctx.strokeStyle = '#fff700';
        this.ctx.lineWidth = 6;

        let boxheight = this.height * 0.02;
        let boxwidth = this.width * 0.1;

        //left static line:
        this.ctx.beginPath();
        this.ctx.moveTo(this.width * 0.22, this.height * 0.5 - boxheight * 0.5);
        this.ctx.lineTo(this.width * 0.22 + boxwidth, this.height * 0.5 - boxheight * 0.5);
        this.ctx.lineTo(this.width * 0.22 + boxwidth, this.height * 0.5 + boxheight * 2);
        this.ctx.lineTo(this.width * 0.22 + boxwidth - boxheight, this.height * 0.5 + boxheight * 2);
        this.ctx.lineTo(this.width * 0.22 + boxwidth - boxheight, this.height * 0.5 + boxheight * 0.5);
        this.ctx.lineTo(this.width * 0.22, this.height * 0.5 + boxheight * 0.5);
        this.ctx.lineTo(this.width * 0.22, this.height * 0.5 - boxheight * 0.5);

        this.ctx.fill();
        this.ctx.stroke();

        //right static line:
        this.ctx.beginPath();
        this.ctx.moveTo(this.width * 0.78, this.height * 0.5 - boxheight * 0.5);
        this.ctx.lineTo(this.width * 0.78 - boxwidth, this.height * 0.5 - boxheight * 0.5);
        this.ctx.lineTo(this.width * 0.78 - boxwidth, this.height * 0.5 + boxheight * 2);
        this.ctx.lineTo(this.width * 0.78 - boxwidth + boxheight, this.height * 0.5 + boxheight * 2);
        this.ctx.lineTo(this.width * 0.78 - boxwidth + boxheight, this.height * 0.5 + boxheight * 0.5);
        this.ctx.lineTo(this.width * 0.78, this.height * 0.5 + boxheight * 0.5);
        this.ctx.lineTo(this.width * 0.78, this.height * 0.5 - boxheight * 0.5);

        this.ctx.fill();
        this.ctx.stroke();

        //center dot:
        this.ctx.fillRect(this.width * 0.5 - boxheight * 0.5, this.height * 0.5 - boxheight * 0.5, boxheight, boxheight)
        this.ctx.strokeRect(this.width * 0.5 - boxheight * 0.5, this.height * 0.5 - boxheight * 0.5, boxheight, boxheight)
    }

    #getHorizonPixelLevel(width, angle) {
        let alpha = 90 - angle;
        let a = width / 2;
        return a / Math.tan(alpha * Math.PI / 180);
    }
}