var c = document.getElementById("mainCanvas");
var ctx = c.getContext("2d");

const canvasWidth = c.getBoundingClientRect().width;
const canvasHeight = c.getBoundingClientRect().height;

var keys = [];

document.addEventListener("keydown", function (event) {
    keys[event.key] = true;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab", " "].indexOf(event.key) > -1) {
        event.preventDefault();
    }
});

document.addEventListener("keyup", function (event) {
    keys[event.key] = false;
});

var mouseX, mouseY;

c.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

window.addEventListener("mousemove", function(event) {
    mouseX = event.clientX - c.getBoundingClientRect().left;
    mouseY = event.clientY - c.getBoundingClientRect().top;
});

var mouseDown, mouseButton;

window.addEventListener("mousedown", function(event) {
    mouseDown = true;
    mouseButton = event.buttons;
});

window.addEventListener("mouseup", function(event) {
    mouseDown = false;
});

String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

function getLines(ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

function removeDuplicate(s) {
    // Used as index in the modified string
    let result = '';
    let seen = new Set();

    // Traverse through all characters
    for (let i = 0; i < s.length; i++) {
        let char = s[i];

        // Check if s[i] is present before it  
        if (!seen.has(char)) {
            result += char;
            seen.add(char);
        }
    }

    return result;
}

var quoteList;
var nounList;

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

readTextFile("quotes.json", function(text){
    quoteList = JSON.parse(text);
});

readTextFile("nouns.json", function(text){
    nounList = JSON.parse(text);
});

function renderText(text, x, y, size) {
    ctx.font = size + "px Courier New";
    ctx.fillText(text, x - (ctx.measureText(text).width / 2), y);
}

const GAMESCREENTYPE = {
    NULL_TO_TITLE: 0.1,
    TITLE: 1,
    TITLE_TO_CODE: 1.2,
    TITLE_TO_OPTIONS: 1.3,
    CODE: 2,
    CODE_TO_TITLE: 2.1,
    OPTIONS: 3,
    OPTIONS_TO_TITLE: 3.1,
    OPTIONS_TO_CUSTOMCODE: 3.4,
    CUSTOMCODE: 4,
    CUSTOMCODE_TO_OPTIONS: 4.3
}

var gameScreen = GAMESCREENTYPE.NULL_TO_TITLE;

const symbolRegex = /\.|,|;|:|\'|\"|\!|\?| |\-|\&|0|1|2|3|4|5|6|7|8|9|—/g

const LETTER = {
    "A": 0,
    "B": 1,
    "C": 2,
    "D": 3,
    "E": 4,
    "F": 5,
    "G": 6,
    "H": 7,
    "I": 8,
    "J": 9,
    "K": 10,
    "L": 11,
    "M": 12,
    "N": 13,
    "O": 14,
    "P": 15,
    "Q": 16,
    "R": 17,
    "S": 18,
    "T": 19,
    "U": 20,
    "V": 21,
    "W": 22,
    "X": 23,
    "Y": 24,
    "Z": 25
}

const MORSE = {
    ".-":"A",
    "-...":"B",
    "-.-.":"C",
    "-..":"D",
    ".":"E",
    "..-.":"F",
    "--.":"G",
    "....":"H",
    "..":"I",
    ".---":"J",
    "-.-":"K",
    ".-..":"L",
    "--":"M",
    "-.":"N",
    "---":"O",
    ".--.":"P",
    "--.-":"Q",
    ".-.":"R",
    "...":"S",
    "-":"T",
    "..-":"U",
    "...-":"V",
    ".--":"W",
    "-..-":"X",
    "-.--":"Y",
    "--..":"Z"
}

const LETTERTOBACONIAN = {
    "A":"AAAAA",
    "B":"AAAAB",
    "C":"AAABA",
    "D":"AAABB",
    "E":"AABAA",
    "F":"AABAB",
    "G":"AABBA",
    "H":"AABBB",
    "I":"ABAAA",
    "J":"ABAAA",
    "K":"ABAAB",
    "L":"ABABA",
    "M":"ABABB",
    "N":"ABBAA",
    "O":"ABBAB",
    "P":"ABBBA",
    "Q":"ABBBB",
    "R":"BAAAA",
    "S":"BAAAB",
    "T":"BAABA",
    "U":"BAABB",
    "V":"BAABB",
    "W":"BABAA",
    "X":"BABAB",
    "Y":"BABBA",
    "Z":"BABBB"
}

const CIPHERTYPE = {
    ARISTOCRAT: 1,
    ARISTOCRATK1: 1.1,
    ARISTOCRATK2: 1.2,
    ARISTOCRATK3: 1.3,
    ARISTOCRATK4: 1.4,
    PATRISTOCRAT: 2,
    VIGENÈRE: 3,
    CRYPTARITHM: 4,
    BACONIAN: 5,
    COLUMNAR: 6,
    NIHILIST: 7,
}

var cipher;
var quote;
var quoteLines;
var encryptedQuote;
var encryptedLines;
var valueQuote;
var valueLines;
var correctLines;
var selectedChar;
var clickTimer = 0;
var clickDelay = 20;
var selectTimer;
var typeTimer;
var typeDelay = 10;
var customCode;
var moveToNextChar;
var moveToPrevChar;
var replacementList;
var key;
var words;
var cryptarithmGuideTable;

function main() {
    switch (gameScreen) {
        case GAMESCREENTYPE.TITLE:
        case GAMESCREENTYPE.CODE:
        case GAMESCREENTYPE.OPTIONS:
        case GAMESCREENTYPE.CUSTOMCODE:
        {
            clickTimer += deltaTime;

            // border
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            ctx.fillRect(0, 0, 1000, 625);
            // background
            ctx.beginPath();
            ctx.fillStyle = "#000000ff";
            ctx.fillRect(10, 10, 980, 605);
            break;
        }
    }

    switch (gameScreen) {
        case GAMESCREENTYPE.NULL_TO_TITLE: {
            customCode = "";
            gameScreen = GAMESCREENTYPE.TITLE;
            break;
        }
        case GAMESCREENTYPE.TITLE: {
            // title
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            renderText("Codebusters 2", 500, 60, 40);

            // options button
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 1;
            if (mouseX > 865 && mouseX < 970 && mouseY > 20 && mouseY < 55) {
                ctx.strokeRect(865, 20, 105, 30);
                if (mouseDown) {
                    gameScreen = GAMESCREENTYPE.TITLE_TO_OPTIONS;
                }
            }
            ctx.font = "20px Courier New";
            ctx.fillText("Options", 875, 40);

            // monoalphabetic label
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            renderText("Monoalphabetic", 130, 100, 25);
            ctx.moveTo(20, 110);
            ctx.lineTo(240, 110);
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 4;
            ctx.stroke();

            // polyalphabetic label
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            renderText("Polyalphabetic", 380, 100, 25);
            ctx.moveTo(270, 110);
            ctx.lineTo(490, 110);
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 4;
            ctx.stroke();

            // morse label
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            renderText("Morse", 630, 100, 25);
            ctx.moveTo(520, 110);
            ctx.lineTo(740, 110);
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 4;
            ctx.stroke();

            // misc label
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            renderText("Miscellaneous", 870, 100, 25);
            ctx.moveTo(765, 110);
            ctx.lineTo(975, 110);
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 4;
            ctx.stroke();

            // aristocrat
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 1;
            if (mouseX > 20 && mouseX < 160 && mouseY > 120 && mouseY < 155) {
                ctx.strokeRect(20, 120, 140, 30);
                if (mouseDown) {
                    cipher = CIPHERTYPE.ARISTOCRAT;
                    gameScreen = GAMESCREENTYPE.TITLE_TO_CODE;
                }
            }
            ctx.font = "20px Courier New";
            ctx.fillText("Aristocrat", 30, 140);

            // aristocrat k1
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 1;
            if (mouseX > 20 && mouseX < 195 && mouseY > 160 && mouseY < 195) {
                ctx.strokeRect(20, 160, 175, 30);
                if (mouseDown) {
                    cipher = CIPHERTYPE.ARISTOCRATK1;
                    gameScreen = GAMESCREENTYPE.TITLE_TO_CODE;
                }
            }
            ctx.font = "20px Courier New";
            ctx.fillText("Aristocrat K1", 30, 180);

            // aristocrat k2
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 1;
            if (mouseX > 20 && mouseX < 195 && mouseY > 200 && mouseY < 235) {
                ctx.strokeRect(20, 200, 175, 30);
                if (mouseDown) {
                    cipher = CIPHERTYPE.ARISTOCRATK2;
                    gameScreen = GAMESCREENTYPE.TITLE_TO_CODE;
                }
            }
            ctx.font = "20px Courier New";
            ctx.fillText("Aristocrat K2", 30, 220);

            // aristocrat k3
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 1;
            if (mouseX > 20 && mouseX < 195 && mouseY > 240 && mouseY < 275) {
                ctx.strokeRect(20, 240, 175, 30);
                if (mouseDown) {
                    cipher = CIPHERTYPE.ARISTOCRATK3;
                    gameScreen = GAMESCREENTYPE.TITLE_TO_CODE;
                }
            }
            ctx.font = "20px Courier New";
            ctx.fillText("Aristocrat K3", 30, 260);

            // aristocrat k4
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 1;
            if (mouseX > 20 && mouseX < 195 && mouseY > 280 && mouseY < 315) {
                ctx.strokeRect(20, 280, 175, 30);
                if (mouseDown) {
                    cipher = CIPHERTYPE.ARISTOCRATK4;
                    gameScreen = GAMESCREENTYPE.TITLE_TO_CODE;
                }
            }
            ctx.font = "20px Courier New";
            ctx.fillText("Aristocrat K4", 30, 300);

            // patristocrat
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 1;
            if (mouseX > 20 && mouseX < 195 && mouseY > 320 && mouseY < 355) {
                ctx.strokeRect(20, 320, 165, 30);
                if (mouseDown) {
                    cipher = CIPHERTYPE.PATRISTOCRAT;
                    gameScreen = GAMESCREENTYPE.TITLE_TO_CODE;
                }
            }
            ctx.font = "20px Courier New";
            ctx.fillText("Patristocrat", 30, 340);

            // vigenère
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 1;
            if (mouseX > 270 && mouseX < 385 && mouseY > 120 && mouseY < 155) {
                ctx.strokeRect(270, 120, 115, 30);
                if (mouseDown) {
                    cipher = CIPHERTYPE.VIGENÈRE;
                    gameScreen = GAMESCREENTYPE.TITLE_TO_CODE;
                }
            }
            ctx.font = "20px Courier New";
            ctx.fillText("Vigenère", 280, 140);

            // baconian
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 1;
            if (mouseX > 270 && mouseX < 385 && mouseY > 160 && mouseY < 195) {
                ctx.strokeRect(270, 160, 115, 30);
                if (mouseDown) {
                    cipher = CIPHERTYPE.BACONIAN;
                    gameScreen = GAMESCREENTYPE.TITLE_TO_CODE;
                }
            }
            ctx.font = "20px Courier New";
            ctx.fillText("Baconian", 280, 180);

            // cryptarithm
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 1;
            if (mouseX > 765 && mouseX < 920 && mouseY > 120 && mouseY < 155) {
                ctx.strokeRect(765, 120, 155, 30);
                if (mouseDown) {
                    cipher = CIPHERTYPE.CRYPTARITHM;
                    gameScreen = GAMESCREENTYPE.TITLE_TO_CODE;
                }
            }
            ctx.font = "20px Courier New";
            ctx.fillText("Cryptarithm", 775, 140);

            // complete columnar
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 1;
            if (mouseX > 270 && mouseX < 495 && mouseY > 200 && mouseY < 235) {
                ctx.strokeRect(270, 200, 225, 30);
                if (mouseDown) {
                    cipher = CIPHERTYPE.COLUMNAR;
                    gameScreen = GAMESCREENTYPE.TITLE_TO_CODE;
                }
            }
            ctx.font = "20px Courier New";
            ctx.fillText("Complete Columnar", 280, 220);

            // nihilist
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 1;
            if (mouseX > 270 && mouseX < 390 && mouseY > 240 && mouseY < 275) {
                ctx.strokeRect(270, 240, 120, 30);
                if (mouseDown) {
                    cipher = CIPHERTYPE.NIHILIST;
                    gameScreen = GAMESCREENTYPE.TITLE_TO_CODE;
                }
            }
            ctx.font = "20px Courier New";
            ctx.fillText("Nihilist", 280, 260);

            break;
        }
        case GAMESCREENTYPE.TITLE_TO_OPTIONS: {
            gameScreen = GAMESCREENTYPE.OPTIONS;
            break;
        }
        case GAMESCREENTYPE.OPTIONS: {
            // title
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            renderText("Options", 500, 60, 40);

            // back button
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 1;
            if (mouseX > 20 && mouseX < 90 && mouseY > 20 && mouseY < 55) {
                ctx.strokeRect(20, 20, 70, 30);
                if (mouseDown && clickTimer > clickDelay) {
                    gameScreen = GAMESCREENTYPE.OPTIONS_TO_TITLE;
                    clickTimer = 0;
                }
            }
            ctx.font = "20px Courier New";
            ctx.fillText("Back", 30, 40);

            // custom code button
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 1;
            if (mouseX > 20 && mouseX < 170 && mouseY > 120 && mouseY < 155) {
                ctx.strokeRect(20, 120, 150, 30);
                if (mouseDown && clickTimer > clickDelay) {
                    gameScreen = GAMESCREENTYPE.OPTIONS_TO_CUSTOMCODE;
                    clickTimer = 0;
                }
            }
            ctx.font = "20px Courier New";
            ctx.fillText("Custom Code", 30, 140);
            break;
        }
        case GAMESCREENTYPE.OPTIONS_TO_TITLE: {
            gameScreen = GAMESCREENTYPE.TITLE;
            break;
        }
        case GAMESCREENTYPE.OPTIONS_TO_CUSTOMCODE: {
            typeTimer = 0;
            gameScreen = GAMESCREENTYPE.CUSTOMCODE;
            break;
        }
        case GAMESCREENTYPE.CUSTOMCODE: {
            typeTimer += deltaTime;

            // title
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            renderText("Custom Code", 500, 60, 40);

            // back button
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 1;
            if (mouseX > 20 && mouseX < 90 && mouseY > 20 && mouseY < 55) {
                ctx.strokeRect(20, 20, 70, 30);
                if (mouseDown && clickTimer > clickDelay) {
                    customCode.replace(/\n/g," ");
                    gameScreen = GAMESCREENTYPE.CUSTOMCODE_TO_OPTIONS;
                    clickTimer = 0;
                }
            }
            if (keys["Enter"] && clickTimer > clickDelay) {
                customCode.replace(/\n/g," ");
                gameScreen = GAMESCREENTYPE.CUSTOMCODE_TO_OPTIONS;
                clickTimer = 0;
            }
            ctx.font = "20px Courier New";
            ctx.fillText("Back", 30, 40);

            // code
            ctx.fillStyle = "#12590a80";
            for (var i = 0; i < customCode.split("\n").length; i++) {
                ctx.fillRect(25, 162 + (40 * i), ctx.measureText(customCode.split("\n")[i] + " ").width, 25);
            }
            ctx.fillStyle = "#20c20eff";
            ctx.fillText("Plaintext:", 30, 140);
            for (var i = 0; i < customCode.split("\n").length; i++) {
                ctx.fillText(customCode.split("\n")[i], 30, 180 + (40 * i));
            }

            // letter pressed
            for (var i = 0; i < 26; i++) {
                if (typeTimer > typeDelay && keys[Object.keys(LETTER).find(key => LETTER[key] == i).toLowerCase()]) {
                    customCode += Object.keys(LETTER).find(key => LETTER[key] == i);
                    typeTimer = 0;
                }
            }
            if (typeTimer > typeDelay && keys[" "]) {
                customCode += " ";
                typeTimer = 0;
            }
            if (typeTimer > typeDelay && keys["."]) {
                customCode += ".";
                typeTimer = 0;
            }
            if (typeTimer > typeDelay && keys[","]) {
                customCode += ",";
                typeTimer = 0;
            }
            if (typeTimer > typeDelay && keys["?"]) {
                customCode += "?";
                typeTimer = 0;
            }
            if (typeTimer > typeDelay && keys["!"]) {
                customCode += "!";
                typeTimer = 0;
            }
            if (typeTimer > typeDelay && keys[":"]) {
                customCode += ":";
                typeTimer = 0;
            }
            if (typeTimer > typeDelay && keys["?"]) {
                customCode += "?";
                typeTimer = 0;
            }
            if (typeTimer > typeDelay && keys["-"]) {
                customCode += "-";
                typeTimer = 0;
            }
            if (typeTimer > typeDelay && keys["Backspace"]) {
                if (customCode[customCode.length - 1] == "\n") {
                    customCode = customCode.slice(0, customCode.length - 2);
                } else {
                    customCode = customCode.slice(0, customCode.length - 1);
                }
                typeTimer = 0;
            }
            if (ctx.measureText(customCode.split("\n")[customCode.split("\n").length - 1] + " ").width > 900) {
                customCode += "\n";
            }
            break;
        }
        case GAMESCREENTYPE.CUSTOMCODE_TO_OPTIONS: {
            typeTimer = 0;
            gameScreen = GAMESCREENTYPE.OPTIONS;
            break;
        }
        case GAMESCREENTYPE.TITLE_TO_CODE: {
            if (customCode.length > 0) {
                quote = customCode;
            } else {
                while (quoteList == null) {
                    // wait
                }
                quote = quoteList[Math.floor(Math.random() * quoteList.length)].text.toUpperCase();
            }

            switch (cipher) {
                case CIPHERTYPE.ARISTOCRAT: {
                    var encryptArray = [];
                    var goodArrayCheck = false;
                    while (!goodArrayCheck) {
                        encryptArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].sort((a, b) => 0.5 - Math.random());
                        goodArrayCheck = true;
                        for (var m = 0; m < encryptArray.length; m++) {
                            if (encryptArray[m] == m) {
                                goodArrayCheck = false;
                            }
                        }
                    }
                    encryptedQuote = "";
                    for (var i = 0; i < quote.length; i++) {
                        if (!((quote[i].match(symbolRegex) || []).length > 0)) {
                            encryptedQuote += Object.keys(LETTER).find(key => LETTER[key] == encryptArray[LETTER[quote[i]]]);
                        } else {
                            encryptedQuote += quote[i];
                        }
                    }
                    encryptedLines = getLines(ctx, encryptedQuote, 930);

                    valueQuote = encryptedQuote;
                    quoteLines = getLines(ctx, quote, 930);
                    valueLines = getLines(ctx, encryptedQuote, 930);
                    correctLines = getLines(ctx, encryptedQuote, 930);
                    for (var i = 0; i < valueLines.length; i++) {
                        valueLines[i] = valueLines[i].replaceAll(/[A-Z]/g, "_");
                        correctLines[i] = correctLines[i].replaceAll(/[A-Z]/g, "_")
                    }
                    selectedChar = [0, 0, 0]; // replacementtextbool, line, char
                    selectTimer = 0;
                    typeTimer = 0;
                    moveToNextChar = false;
                    moveToPrevChar = false;
                    replacementList = ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"];

                    break;
                }
                case CIPHERTYPE.ARISTOCRATK1: {
                    while (nounList == null) {
                        // wait
                    }
                    var noun;
                    var offset;
                    var encryptArray = [];
                    var goodArrayCheck = false;
                    while (!goodArrayCheck) {
                        // generate noun
                        noun = nounList[Math.floor(Math.random() * nounList.length)].toUpperCase();
                        noun = removeDuplicate(noun);
                        // random offset
                        offset = Math.floor(Math.random() * 26);
                        // init encrypt array
                        encryptArray = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
                        // put in noun into encrypt array
                        for (var i = 0; i < noun.length; i++) {
                            if (offset + i < 26) {
                                encryptArray[offset + i] = LETTER[noun[i]];
                            } else if (offset + i >= 26) {
                                encryptArray[offset + i - 26] = LETTER[noun[i]];
                            }
                        }
                        if (noun.length + offset >= 26) {
                            offset -= 26;
                        }
                        // offset++;
                        var pos = (noun.length + offset);
                        var i = 0;
                        var j = 0;
                        while (i < (26 - noun.length)) {
                            while (encryptArray.includes(j)) {
                                j++;
                            }
                            encryptArray[pos] = j;
                            pos++;
                            if (pos >= 26) {
                                pos -= 26;
                            }
                            i++;
                            j++;
                        }
                        // check good array
                        goodArrayCheck = true;
                        for (var m = 0; m < encryptArray.length; m++) {
                            if (encryptArray[m] == m) {
                                goodArrayCheck = false;
                            }
                        }
                    }
                    encryptedQuote = "";
                    for (var i = 0; i < quote.length; i++) {
                        if (!((quote[i].match(symbolRegex) || []).length > 0)) {
                            encryptedQuote += Object.keys(LETTER).find(key => LETTER[key] == encryptArray.indexOf(LETTER[quote[i]]));
                        } else {
                            encryptedQuote += quote[i];
                        }
                    }
                    encryptedLines = getLines(ctx, encryptedQuote, 930);

                    valueQuote = encryptedQuote;
                    quoteLines = getLines(ctx, quote, 930);
                    valueLines = getLines(ctx, encryptedQuote, 930);
                    correctLines = getLines(ctx, encryptedQuote, 930);
                    for (var i = 0; i < valueLines.length; i++) {
                        valueLines[i] = valueLines[i].replaceAll(/[A-Z]/g, "_");
                        correctLines[i] = correctLines[i].replaceAll(/[A-Z]/g, "_")
                    }
                    selectedChar = [0, 0, 0]; // replacementtextbool, line, char
                    selectTimer = 0;
                    typeTimer = 0;
                    moveToNextChar = false;
                    moveToPrevChar = false;
                    replacementList = ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"];

                    break;
                }
                case CIPHERTYPE.ARISTOCRATK2: {
                    while (nounList == null) {
                        // wait
                    }
                    var noun;
                    var offset;
                    var encryptArray = [];
                    var goodArrayCheck = false;
                    while (!goodArrayCheck) {
                        // generate noun
                        noun = nounList[Math.floor(Math.random() * nounList.length)].toUpperCase();
                        noun = removeDuplicate(noun);
                        // random offset
                        offset = Math.floor(Math.random() * 26);
                        // init encrypt array
                        encryptArray = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
                        // put in noun into encrypt array
                        for (var i = 0; i < noun.length; i++) {
                            if (offset + i < 26) {
                                encryptArray[offset + i] = LETTER[noun[i]];
                            } else if (offset + i >= 26) {
                                encryptArray[offset + i - 26] = LETTER[noun[i]];
                            }
                        }
                        if (noun.length + offset >= 26) {
                            offset -= 26;
                        }
                        var pos = (noun.length + offset);
                        var i = 0;
                        var j = 0;
                        while (i < (26 - noun.length)) {
                            while (encryptArray.includes(j)) {
                                j++;
                            }
                            encryptArray[pos] = j;
                            pos++;
                            if (pos >= 26) {
                                pos -= 26;
                            }
                            i++;
                            j++;
                        }
                        // check good array
                        goodArrayCheck = true;
                        for (var m = 0; m < encryptArray.length; m++) {
                            if (encryptArray[m] == m) {
                                goodArrayCheck = false;
                            }
                        }
                    }
                    encryptedQuote = "";
                    for (var i = 0; i < quote.length; i++) {
                        if (!((quote[i].match(symbolRegex) || []).length > 0)) {
                            encryptedQuote += Object.keys(LETTER).find(key => LETTER[key] == encryptArray[LETTER[quote[i]]]);
                        } else {
                            encryptedQuote += quote[i];
                        }
                    }
                    encryptedLines = getLines(ctx, encryptedQuote, 930);

                    valueQuote = encryptedQuote;
                    quoteLines = getLines(ctx, quote, 930);
                    valueLines = getLines(ctx, encryptedQuote, 930);
                    correctLines = getLines(ctx, encryptedQuote, 930);
                    for (var i = 0; i < valueLines.length; i++) {
                        valueLines[i] = valueLines[i].replaceAll(/[A-Z]/g, "_");
                        correctLines[i] = correctLines[i].replaceAll(/[A-Z]/g, "_")
                    }
                    selectedChar = [0, 0, 0]; // replacementtextbool, line, char
                    selectTimer = 0;
                    typeTimer = 0;
                    moveToNextChar = false;
                    moveToPrevChar = false;
                    replacementList = ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"];

                    break;
                }
                case CIPHERTYPE.ARISTOCRATK3: {
                    while (nounList == null) {
                        // wait
                    }
                    var noun;
                    var offset;
                    var encryptArray = [];
                    var goodArrayCheck = false;
                    while (!goodArrayCheck) {
                        // generate noun
                        noun = nounList[Math.floor(Math.random() * nounList.length)].toUpperCase();
                        noun = removeDuplicate(noun);
                        // random offset
                        offset = Math.floor(Math.random() * 26);
                        // init encrypt array
                        encryptArray = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
                        // put in noun into encrypt array
                        for (var i = 0; i < noun.length; i++) {
                            if (offset + i < 26) {
                                encryptArray[offset + i] = LETTER[noun[i]];
                            } else if (offset + i >= 26) {
                                encryptArray[offset + i - 26] = LETTER[noun[i]];
                            }
                        }
                        if (noun.length + offset >= 26) {
                            offset -= 26;
                        }
                        var pos = (noun.length + offset);
                        var i = 0;
                        var j = 0;
                        while (i < (26 - noun.length)) {
                            while (encryptArray.includes(j)) {
                                j++;
                            }
                            encryptArray[pos] = j;
                            pos++;
                            if (pos >= 26) {
                                pos -= 26;
                            }
                            i++;
                            j++;
                        }
                        // check good array
                        goodArrayCheck = true;
                        for (var m = 0; m < encryptArray.length; m++) {
                            if (encryptArray[m] == m) {
                                goodArrayCheck = false;
                            }
                        }
                    }
                    
                    var encryptArray2 = [];
                    var offset = Math.floor(Math.random() * 26);
                    for (var i = 0; i < encryptArray.length; i++) {
                        if (i + offset >= 26) {
                            offset -= 26;
                        }
                        encryptArray2.push(encryptArray[i + offset]);
                    }

                    encryptedQuote = "";
                    for (var i = 0; i < quote.length; i++) {
                        if (!((quote[i].match(symbolRegex) || []).length > 0)) {
                            encryptedQuote += Object.keys(LETTER).find(key => LETTER[key] == encryptArray2[encryptArray.indexOf(LETTER[quote[i]])]);
                        } else {
                            encryptedQuote += quote[i];
                        }
                    }
                    encryptedLines = getLines(ctx, encryptedQuote, 930);

                    valueQuote = encryptedQuote;
                    quoteLines = getLines(ctx, quote, 930);
                    valueLines = getLines(ctx, encryptedQuote, 930);
                    correctLines = getLines(ctx, encryptedQuote, 930);
                    for (var i = 0; i < valueLines.length; i++) {
                        valueLines[i] = valueLines[i].replaceAll(/[A-Z]/g, "_");
                        correctLines[i] = correctLines[i].replaceAll(/[A-Z]/g, "_")
                    }
                    selectedChar = [0, 0, 0]; // replacementtextbool, line, char
                    selectTimer = 0;
                    typeTimer = 0;
                    moveToNextChar = false;
                    moveToPrevChar = false;
                    replacementList = ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"];

                    break;
                }
                case CIPHERTYPE.ARISTOCRATK4: {
                    while (nounList == null) {
                        // wait
                    }
                    var noun1;
                    var noun2;
                    var offset1;
                    var offset2;
                    var encryptArray1 = [];
                    var encryptArray2 = [];
                    var goodArrayCheck = false;
                    while (!goodArrayCheck) {
                        // generate noun
                        noun1 = nounList[Math.floor(Math.random() * nounList.length)].toUpperCase();
                        noun1 = removeDuplicate(noun1);
                        noun2 = nounList[Math.floor(Math.random() * nounList.length)].toUpperCase();
                        noun2 = removeDuplicate(noun2);
                        // random offset
                        offset1 = Math.floor(Math.random() * 26);
                        offset2 = Math.floor(Math.random() * 26);
                        // init encrypt array
                        encryptArray1 = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
                        encryptArray2 = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
                        // put in noun into encrypt array
                        for (var i = 0; i < noun1.length; i++) {
                            if (offset1 + i < 26) {
                                encryptArray1[offset1 + i] = LETTER[noun1[i]];
                            } else if (offset1 + i >= 26) {
                                encryptArray1[offset1 + i - 26] = LETTER[noun1[i]];
                            }
                        }
                        for (var i = 0; i < noun2.length; i++) {
                            if (offset2 + i < 26) {
                                encryptArray2[offset2 + i] = LETTER[noun2[i]];
                            } else if (offset2 + i >= 26) {
                                encryptArray2[offset2 + i - 26] = LETTER[noun2[i]];
                            }
                        }
                        if (noun1.length + offset1 >= 26) {
                            offset1 -= 26;
                        }
                        if (noun2.length + offset2 >= 26) {
                            offset2 -= 26;
                        }
                        var pos1 = (noun1.length + offset1);
                        var pos2 = (noun2.length + offset2);
                        var i = 0;
                        var j = 0;
                        while (i < (26 - noun1.length)) {
                            while (encryptArray1.includes(j)) {
                                j++;
                            }
                            encryptArray1[pos1] = j;
                            pos1++;
                            if (pos1 >= 26) {
                                pos1 -= 26;
                            }
                            i++;
                            j++;
                        }
                        i = 0;
                        j = 0;
                        while (i < (26 - noun2.length)) {
                            while (encryptArray2.includes(j)) {
                                j++;
                            }
                            encryptArray2[pos2] = j;
                            pos2++;
                            if (pos2 >= 26) {
                                pos2 -= 26;
                            }
                            i++;
                            j++;
                        }
                        // check good array
                        goodArrayCheck = true;
                        for (var m = 0; m < encryptArray1.length; m++) {
                            if (encryptArray1[m] == m) {
                                goodArrayCheck = false;
                            }
                        }
                        for (var m = 0; m < encryptArray2.length; m++) {
                            if (encryptArray2[m] == m) {
                                goodArrayCheck = false;
                            }
                        }
                    }

                    encryptedQuote = "";
                    for (var i = 0; i < quote.length; i++) {
                        if (!((quote[i].match(symbolRegex) || []).length > 0)) {
                            encryptedQuote += Object.keys(LETTER).find(key => LETTER[key] == encryptArray2[encryptArray1.indexOf(LETTER[quote[i]])]);
                        } else {
                            encryptedQuote += quote[i];
                        }
                    }
                    encryptedLines = getLines(ctx, encryptedQuote, 930);

                    valueQuote = encryptedQuote;
                    quoteLines = getLines(ctx, quote, 930);
                    valueLines = getLines(ctx, encryptedQuote, 930);
                    correctLines = getLines(ctx, encryptedQuote, 930);
                    for (var i = 0; i < valueLines.length; i++) {
                        valueLines[i] = valueLines[i].replaceAll(/[A-Z]/g, "_");
                        correctLines[i] = correctLines[i].replaceAll(/[A-Z]/g, "_")
                    }
                    selectedChar = [0, 0, 0]; // replacementtextbool, line, char
                    selectTimer = 0;
                    typeTimer = 0;
                    moveToNextChar = false;
                    moveToPrevChar = false;
                    replacementList = ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"];

                    break;
                }
                case CIPHERTYPE.PATRISTOCRAT: {
                    var encryptArray = [];
                    var goodArrayCheck = false;
                    while (!goodArrayCheck) {
                        encryptArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].sort((a, b) => 0.5 - Math.random());
                        goodArrayCheck = true;
                        for (var m = 0; m < encryptArray.length; m++) {
                            if (encryptArray[m] == m) {
                                goodArrayCheck = false;
                            }
                        }
                    }

                    var tempq = "";
                    var j = 0;
                    for (var i = 0; i < quote.length; i++) {
                        if (!((quote[i].match(symbolRegex) || []).length > 0)) {
                            if (j > 0 && j % 5 == 0) {
                                tempq += " ";
                            }
                            tempq += quote[i];
                            j++
                        }
                    }
                    quote = tempq;

                    encryptedQuote = "";
                    var j = 0;
                    for (var i = 0; i < quote.length; i++) {
                        if (!((quote[i].match(symbolRegex) || []).length > 0)) {
                            encryptedQuote += Object.keys(LETTER).find(key => LETTER[key] == encryptArray[LETTER[quote[i]]]);
                        } else {
                            encryptedQuote += quote[i];
                        }
                    }
                    encryptedLines = getLines(ctx, encryptedQuote, 930);

                    valueQuote = encryptedQuote;
                    quoteLines = getLines(ctx, quote, 930);
                    valueLines = getLines(ctx, encryptedQuote, 930);
                    correctLines = getLines(ctx, encryptedQuote, 930);
                    for (var i = 0; i < valueLines.length; i++) {
                        valueLines[i] = valueLines[i].replaceAll(/[A-Z]/g, "_");
                        correctLines[i] = correctLines[i].replaceAll(/[A-Z]/g, "_")
                    }
                    selectedChar = [0, 0, 0]; // replacementtextbool, line, char
                    selectTimer = 0;
                    typeTimer = 0;
                    moveToNextChar = false;
                    moveToPrevChar = false;
                    replacementList = ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"];

                    break;
                }
                case CIPHERTYPE.VIGENÈRE: {
                    while (nounList == null) {
                        // wait
                    }
                    // generate noun
                    var noun = nounList[Math.floor(Math.random() * nounList.length)].toUpperCase();
                    key = noun;
                    encryptedQuote = "";
                    var j = 0;
                    for (var i = 0; i < quote.length; i++) {
                        if (!((quote[i].match(symbolRegex) || []).length > 0)) {
                            encryptedQuote += Object.keys(LETTER).find(key => LETTER[key] == (((LETTER[quote[i]]) + (LETTER[noun[j % noun.length]])) % 26));
                            j++;
                        } else {
                            encryptedQuote += quote[i];
                        }
                    }
                    encryptedLines = getLines(ctx, encryptedQuote, 930);

                    valueQuote = encryptedQuote;
                    quoteLines = getLines(ctx, quote, 930);
                    valueLines = getLines(ctx, encryptedQuote, 930);
                    correctLines = getLines(ctx, encryptedQuote, 930);
                    for (var i = 0; i < valueLines.length; i++) {
                        valueLines[i] = valueLines[i].replaceAll(/[A-Z]/g, "_");
                        correctLines[i] = correctLines[i].replaceAll(/[A-Z]/g, "_")
                    }
                    selectedChar = [0, 0, 0]; // replacementtextbool, line, char
                    selectTimer = 0;
                    typeTimer = 0;
                    moveToNextChar = false;
                    moveToPrevChar = false;
                    replacementList = ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"];
                    break;
                }
                case CIPHERTYPE.CRYPTARITHM: {
                    cryptarithmGuideTable = [[], [], [], [], [], [], [], [], [], []];
                    for (var i = 0; i < cryptarithmGuideTable.length; i++) {
                        for (var j = 0; j < 10; j++) {
                            cryptarithmGuideTable[i].push(0);
                        }
                    }

                    while (nounList == null) {
                        // wait
                    }
                    // generate nouns
                    var work = false;
                    while (!work) {
                        work = true;

                        var noun1 = nounList[Math.floor(Math.random() * nounList.length)].toUpperCase();
                        var noun2 = nounList[Math.floor(Math.random() * nounList.length)].toUpperCase();
                        var letterNumberList = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
                        
                        // noun 1
                        for (var i = 0; i < noun1.length; i++) {
                            // if letter not yet defined, define it
                            if (letterNumberList[LETTER[noun1[i]]] == -1) {
                                var a = -1;
                                while (letterNumberList.includes(a)) {
                                    if (letterNumberList.includes(0) && letterNumberList.includes(1) && letterNumberList.includes(2) && letterNumberList.includes(3) && letterNumberList.includes(4) && letterNumberList.includes(5) && letterNumberList.includes(6) && letterNumberList.includes(7) && letterNumberList.includes(8) && letterNumberList.includes(9)) {
                                        work = false;
                                        break;
                                    }
                                    a = Math.floor(Math.random() * 10);
                                }
                                letterNumberList[LETTER[noun1[i]]] = a;
                            }
                        }
                        // noun 2
                        for (var i = 0; i < noun2.length; i++) {
                            // if letter not yet defined, define it
                            if (letterNumberList[LETTER[noun2[i]]] == -1) {
                                var a = -1;
                                while (letterNumberList.includes(a)) {
                                    if (letterNumberList.includes(0) && letterNumberList.includes(1) && letterNumberList.includes(2) && letterNumberList.includes(3) && letterNumberList.includes(4) && letterNumberList.includes(5) && letterNumberList.includes(6) && letterNumberList.includes(7) && letterNumberList.includes(8) && letterNumberList.includes(9)) {
                                        work = false;
                                        break;
                                    }
                                    a = Math.floor(Math.random() * 10);

                                }
                                letterNumberList[LETTER[noun2[i]]] = a;
                            }
                        }
                    }
                    for (var i = 0; i < 10; i++) {
                        if (!letterNumberList.includes(i)) {
                            var randi = Math.floor(Math.random() * 26);
                            while(letterNumberList[randi] != -1) {
                                randi = Math.floor(Math.random() * 26);
                            }
                            letterNumberList[randi] = i;
                        }
                    }
                    var word3 = "";
                    var carry = 0;
                    for (var i = 0; i < Math.max(noun1.length, noun2.length); i++) {
                        var sum = 0;
                        if (i >= noun1.length) {
                            sum = letterNumberList[LETTER[noun2[noun2.length - 1 - i]]];
                        } else if (i >= noun2.length) {
                            sum = letterNumberList[LETTER[noun1[noun1.length - i - 1]]];
                        } else {
                            sum = letterNumberList[LETTER[noun1[noun1.length - i - 1]]] + letterNumberList[LETTER[noun2[noun2.length - 1 - i]]];
                        }
                        word3 = Object.keys(LETTER).find(key => LETTER[key] == letterNumberList.indexOf((sum + carry) % 10)) + word3;
                        carry = Math.floor((sum + carry) / 10);
                    }

                    words = [noun1, noun2, word3];
                    key = letterNumberList;

                    quote = "";
                    encryptedQuote = "";
                    for (var i = 0; i < letterNumberList.length; i++) {
                        if (letterNumberList[i] != -1) {
                            quote += letterNumberList[i];
                            encryptedQuote += Object.keys(LETTER).find(key => LETTER[key] == i);
                        }
                    }
                    encryptedLines = [encryptedQuote];

                    valueQuote = encryptedQuote;
                    quoteLines = [quote];
                    valueLines = [encryptedQuote];
                    correctLines = [encryptedQuote];
                    for (var i = 0; i < valueLines.length; i++) {
                        valueLines[i] = valueLines[i].replaceAll(/[A-Z]/g, "_");
                        correctLines[i] = correctLines[i].replaceAll(/[A-Z]/g, "_")
                    }
                    selectedChar = [0, 0, 0]; // replacementtextbool, line, char
                    selectTimer = 0;
                    typeTimer = 0;
                    moveToNextChar = false;
                    moveToPrevChar = false;
                    break;
                }
                case CIPHERTYPE.BACONIAN: {
                    encryptedQuote = "";
                    for (var i = 0; i < quote.length; i++) {
                        if (!((quote[i].match(symbolRegex) || []).length > 0)) {
                            encryptedQuote += LETTERTOBACONIAN[quote[i]];
                        } else {
                            encryptedQuote += quote[i];
                        }
                    }
                    var encryptArray = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
                    for (var i = 0; i < encryptArray.length; i++) {
                        if (Math.floor(Math.random() * 2) == 0) {
                            encryptArray[i] = "A"
                        } else {
                            encryptArray[i] = "B"
                        }
                    }
                    for (var i = 0; i < encryptedQuote.length; i++) {
                        if (!((encryptedQuote[i].match(symbolRegex) || []).length > 0)) {
                            var a = Math.floor(Math.random() * 26);
                            while (encryptArray[a] != encryptedQuote[i]) {
                                a = Math.floor(Math.random() * 26);
                            }
                            encryptedQuote = encryptedQuote.replaceAt(i, Object.keys(LETTER).find(key => LETTER[key] == a));
                        }
                    }
                    encryptedLines = getLines(ctx, encryptedQuote, 930);

                    valueQuote = encryptedQuote;
                    quoteLines = getLines(ctx, quote, 930);
                    valueLines = getLines(ctx, encryptedQuote, 930);
                    correctLines = getLines(ctx, encryptedQuote, 930);
                    for (var i = 0; i < valueLines.length; i++) {
                        valueLines[i] = valueLines[i].replaceAll(/[A-Z]/g, "_");
                        correctLines[i] = correctLines[i].replaceAll(/[A-Z]/g, "_")
                    }
                    selectedChar = [0, 0, 0]; // replacementtextbool, line, char
                    selectTimer = 0;
                    typeTimer = 0;
                    moveToNextChar = false;
                    moveToPrevChar = false;
                    replacementList = ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"];

                    break;
                }
                case CIPHERTYPE.COLUMNAR: {
                    while (nounList == null) {
                        // wait
                    }
                    // ensure there are no dup chars
                    var noun = "aa";
                    while (/(.).*\1/.test(noun)) {
                        noun = nounList[Math.floor(Math.random() * nounList.length)].toUpperCase();
                    }
                    key = noun;
                    encryptedQuote = [];
                    for (var i = 0; i < noun.length; i++) {
                        encryptedQuote.push("");
                        for (var j = 0; j < Math.ceil((quote.replace(symbolRegex, "").length) / (noun.length)); j++) {
                            if (typeof quote.replace(symbolRegex, "")[(j * noun.length) + i] != 'undefined') {
                                encryptedQuote[i] += quote.replace(symbolRegex, "")[(j * noun.length) + i];
                            } else {
                                // encryptedQuote[i] += " ";
                            }
                        }
                    }
                    var sortedNoun = noun.split('').sort().join('');
                    var temp = [];
                    for (var i = 0; i < sortedNoun.length; i++) {
                        temp.push(encryptedQuote[noun.indexOf(sortedNoun[i])]);
                    }
                    temp = temp.join('');
                    encryptedQuote = "";
                    for (var i = 0; i < temp.length; i++) {
                        if (i > 0 && i % 5 == 0) {
                            encryptedQuote += " ";
                        }
                        encryptedQuote += temp[i];
                    }
                    quote = quote.replace(symbolRegex, "");
                    temp = quote;
                    quote = "";
                    for (var i = 0; i < temp.length; i++) {
                        if (i > 0 && i % 5 == 0) {
                            quote += " ";
                        }
                        quote += temp[i];
                    }
                    encryptedLines = getLines(ctx, encryptedQuote, 930);

                    valueQuote = encryptedQuote;
                    quoteLines = getLines(ctx, quote, 930);
                    valueLines = getLines(ctx, encryptedQuote, 930);
                    correctLines = getLines(ctx, encryptedQuote, 930);
                    for (var i = 0; i < valueLines.length; i++) {
                        valueLines[i] = valueLines[i].replaceAll(/[A-Z]/g, "_");
                        correctLines[i] = correctLines[i].replaceAll(/[A-Z]/g, "_")
                    }
                    selectedChar = [0, 0, 0]; // replacementtextbool, line, char
                    selectTimer = 0;
                    typeTimer = 0;
                    moveToNextChar = false;
                    moveToPrevChar = false;
                    replacementList = ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"];
                    break;
                }
                case CIPHERTYPE.NIHILIST: {
                    while (nounList == null) {
                        // wait
                    }
                    // ensure there are no dup chars
                    var noun1 = "aa";
                    while (/(.).*\1/.test(noun1) || noun1.length > 25) {
                        noun1 = nounList[Math.floor(Math.random() * nounList.length)].toUpperCase();
                    }
                    var noun2 = "aa";
                    while (/(.).*\1/.test(noun2) || noun2.length > 25) {
                        noun2 = nounList[Math.floor(Math.random() * nounList.length)].toUpperCase();
                    }

                    key = [noun1, noun2];

                    polybiussquare = "";
                    for (var i = 0; i < noun1.length; i++) {
                        polybiussquare += noun1[i];
                    }
                    var j = 0;
                    for (var i = noun1.length; i < 25; i++) {
                        while (noun1.includes("ABCDEFGHIJKLMNOPQRSTUVWXYZ"[j]) || ("ABCDEFGHIJKLMNOPQRSTUVWXYZ"[j] == "I" && noun1.includes("J")) || ("ABCDEFGHIJKLMNOPQRSTUVWXYZ"[j] == "J" && noun1.includes("I")) || ("ABCDEFGHIJKLMNOPQRSTUVWXYZ"[j] == "J" && polybiussquare.includes("I")) || ("ABCDEFGHIJKLMNOPQRSTUVWXYZ"[j] == "I" && polybiussquare.includes("J"))) {
                            j++;
                        }
                        polybiussquare += Object.keys(LETTER).find(key => LETTER[key] == j);
                        j++;
                    }

                    encryptedQuote = "";
                    var j = 0;
                    for (var i = 0; i < quote.length; i++) {
                        if (!((quote[i].match(symbolRegex) || []).length > 0)) {
                            var num = polybiussquare.indexOf(noun2[j % noun2.length]);
                            var value = Number(String(Math.floor(num / 5) + 1) + String((num % 5) + 1));
                            var num2 = polybiussquare.indexOf(quote[i]);
                            var value2 = Number(String(Math.floor(num2 / 5) + 1) + String((num2 % 5) + 1));
                            var end = value + value2;
                            if (j == 0) {
                                encryptedQuote += String(end);
                            } else {
                                encryptedQuote += " " + String(end);
                            }
                            j++;
                        }
                    }

                    encryptedLines = getLines(ctx, encryptedQuote, 930);

                    valueQuote = encryptedQuote;
                    var temp = "";
                    for (var i = 0; i < quote.length; i++) {
                        if (!quote[i].match(symbolRegex)) {
                            temp += quote[i];
                        }
                    }
                    var temp2 = "";
                    for (var i = 0; i < encryptedQuote.split(" ").length; i++) {
                        for (var j = 0; j < encryptedQuote.split(" ")[i].length; j++) {
                            temp2 += temp[i];
                        }
                        temp2 += " ";
                    }
                    temp2 = temp2.slice(0, temp2.length - 1);
                    temp = temp.split("").join(" ");
                    quoteLines = getLines(ctx, temp2, 930);
                    valueLines = getLines(ctx, encryptedQuote, 930);
                    correctLines = getLines(ctx, encryptedQuote, 930);
                    for (var i = 0; i < valueLines.length; i++) {
                        valueLines[i] = valueLines[i].replaceAll(/[0-9]/g, "_");
                        correctLines[i] = correctLines[i].replaceAll(/[0-9]/g, "_")
                    }
                    selectedChar = [0, 0, 0]; // replacementtextbool, line, char
                    selectTimer = 0;
                    typeTimer = 0;
                    moveToNextChar = false;
                    moveToPrevChar = false;
                    replacementList = ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"];
                    break;
                }
                default: {
                    break;
                }
            }

            gameScreen = GAMESCREENTYPE.CODE;
            break;
        }
        case GAMESCREENTYPE.CODE_TO_TITLE: {
            gameScreen = GAMESCREENTYPE.TITLE
            break;
        }
        case GAMESCREENTYPE.CODE: {
            selectTimer += deltaTime;
            typeTimer += deltaTime;

            // back button
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 1;
            if (mouseX > 20 && mouseX < 90 && mouseY > 20 && mouseY < 55) {
                ctx.strokeRect(20, 20, 70, 30);
                if (mouseDown && clickTimer > clickDelay) {
                    gameScreen = GAMESCREENTYPE.CODE_TO_TITLE;
                    clickTimer = 0;
                }
            }
            ctx.font = "20px Courier New";
            ctx.fillText("Back", 30, 40);

            // next button
            ctx.beginPath();
            ctx.fillStyle = "#20c20eff";
            ctx.strokeStyle = "#20c20eff";
            ctx.lineWidth = 1;
            if (mouseX > 910 && mouseX < 980 && mouseY > 570 && mouseY < 605) {
                ctx.strokeRect(910, 570, 70, 30);
                if (mouseDown && clickTimer > clickDelay) {
                    gameScreen = GAMESCREENTYPE.TITLE_TO_CODE;
                    clickTimer = 0;
                }
            }
            ctx.font = "20px Courier New";
            ctx.fillText("Next", 920, 590);

            switch (cipher) {
                case CIPHERTYPE.ARISTOCRAT:
                case CIPHERTYPE.ARISTOCRATK1:
                case CIPHERTYPE.ARISTOCRATK2:
                case CIPHERTYPE.ARISTOCRATK3:
                case CIPHERTYPE.ARISTOCRATK4:
                case CIPHERTYPE.PATRISTOCRAT:
                {
                    ctx.beginPath();
                    ctx.fillStyle = "#20c20eff";
                    ctx.font = "20px Courier New";

                    // title
                    if (cipher == CIPHERTYPE.ARISTOCRAT) {
                        ctx.fillText("Aristocrat", 125, 40);
                    } else if (cipher == CIPHERTYPE.ARISTOCRATK1) {
                        ctx.fillText("Aristocrat K1", 125, 40);
                    } else if (cipher == CIPHERTYPE.ARISTOCRATK2) {
                        ctx.fillText("Aristocrat K2", 125, 40);
                    } else if (cipher == CIPHERTYPE.ARISTOCRATK3) {
                        ctx.fillText("Aristocrat K3", 125, 40);
                    } else if (cipher == CIPHERTYPE.ARISTOCRATK4) {
                        ctx.fillText("Aristocrat K4", 125, 40);
                    } else if (cipher == CIPHERTYPE.PATRISTOCRAT) {
                        ctx.fillText("Patristocrat", 125, 40);
                    }

                    // frequencies
                    ctx.fillText("Frequencies:", 30, 110);
                    ctx.fillText("Replacement:", 30, 130);
                    for (var i = 0; i < 26; i++) {
                        // text
                        ctx.fillText(Object.keys(LETTER)[i], 200 + (30 * i), 90);
                        // freq
                        ctx.fillText((encryptedQuote.split(Object.keys(LETTER)[i]).length - 1), 200 + (30 * i), 110);
                        // replacement
                        ctx.fillText(replacementList[i], 200 + (30 * i), 130);
                        if (mouseDown && mouseX > 200 + (30 * i) && mouseX < 230 + (30 * i) && mouseY > 80 && mouseY < 140) {
                            selectedChar = [1, i, 0];
                        }
                    }
                    
                    drawCiphertextAndValues(0, 12, "letter");

                    // render check button
                    drawCheckButton();
                    break;
                }
                case CIPHERTYPE.VIGENÈRE: {
                    ctx.fillStyle = "#20c20eff";
                    ctx.font = "20px Courier New";
                    ctx.fillText("Vigenère", 125, 40);

                    if (keys["Tab"]) {
                        // draw vigenère table
                        ctx.font = "25px Courier New";
                        for (var i = 0; i < 26; i++) {
                            ctx.fillText(Object.keys(LETTER).find(key => LETTER[key] == i), 229 + (22 * i), 35);
                            ctx.fillText(Object.keys(LETTER).find(key => LETTER[key] == i), 204, 60 + (22 * i));
                        }
                        for (var i = 0; i < 26; i++) {
                            for (var j = 0; j < 26; j++) {
                                ctx.fillText(Object.keys(LETTER).find(key => LETTER[key] == ((i + j) % 26)), 229 + (22 * i), 60 + (22 * j));
                            }
                        }
                        // lines
                        ctx.fillRect(225, 40, 570, 3);
                        ctx.fillRect(225, 40, 3, 575);
                    } else {
                        ctx.fillText("Key: " + key, 30, 80);
                        drawCiphertextAndValues(-60, 12, "letter");

                        drawCheckButton();
                    }

                    break;
                }
                case CIPHERTYPE.CRYPTARITHM: {
                    ctx.fillStyle = "#20c20eff";
                    ctx.font = "20px Courier New";
                    ctx.fillText("Cryptarithm", 125, 40);

                    ctx.font = "30px Courier New";
                    for (var i = 0; i < words[0].length; i++) {
                        ctx.fillText(words[0][i], 140 + (30 * (Math.max(words[0].length, words[1].length, words[2].length))) - (30 * words[0].length) + (30 * i), 120);
                    }
                    for (var i = 0; i < words[1].length; i++) {
                        ctx.fillText(words[1][i], 140 + (30 * (Math.max(words[0].length, words[1].length, words[2].length))) - (30 * words[1].length) + (30 * i), 160);
                    }
                    for (var i = 0; i < words[2].length; i++) {
                        ctx.fillText(words[2][i], 140 + (30 * (Math.max(words[0].length, words[1].length, words[2].length))) - (30 * words[2].length) + (30 * i), 200);
                    }
                    ctx.fillText("+", 30, 160);
                    ctx.moveTo(20, 170);
                    ctx.lineTo(140 + (30 * (Math.max(words[0].length, words[1].length, words[2].length))), 170);
                    ctx.lineWidth = 5;
                    ctx.stroke();

                    ctx.font = "30px Courier New";
                    drawCiphertextAndValues(100, 30, "number");

                    // guide table
                    ctx.fillStyle = "#20c20eff";
                    ctx.fillText(encryptedQuote, 750, 100);
                    for (var i = 0; i < 10; i++) {
                        ctx.fillText(String(i), 730, 130 + (25 * i));
                    }
                    for (var i = 0; i < 10; i++) {
                        for (var j = 0; j < 10; j++) {
                            if (cryptarithmGuideTable[j][i] == 0) {
                                ctx.fillStyle = "#000000ff";
                                ctx.fillRect(768 + (18 * (i - 1)), 133 + (25 * (j - 1)), 18, 25);
                            } else if (cryptarithmGuideTable[j][i] == 1) {
                                ctx.fillStyle = "#20c20eff";
                                ctx.fillText("X", 732 + (18 * (i + 1)), 129 + (25 * j));
                            } else if (cryptarithmGuideTable[j][i] == 2) {
                                ctx.fillStyle = "#20c20eff";
                                ctx.fillRect(768 + (18 * (i - 1)), 133 + (25 * (j - 1)), 18, 25);
                            }
                            if (mouseX > 768 + (18 * (i - 1)) && mouseX < 768 + (18 * i) && mouseY > 133 + (25 * (j - 1)) && mouseY < 133 + (25 * j)) {
                                ctx.fillStyle = "#ffffff80";
                                if (mouseDown && clickTimer > clickDelay) {
                                    ctx.fillStyle = "#20c20eff";
                                    cryptarithmGuideTable[j][i]++;
                                    cryptarithmGuideTable[j][i] %= 3;
                                    clickTimer = 0;
                                }
                                ctx.fillRect(768 + (18 * (i - 1)), 133 + (25 * (j - 1)), 18, 25);
                            }
                        }
                    }

                    drawCheckButton();
                    break;
                }
                case CIPHERTYPE.BACONIAN: {
                    ctx.beginPath();
                    ctx.fillStyle = "#20c20eff";
                    ctx.font = "20px Courier New";

                    // title
                    ctx.fillText("Baconian", 125, 40);

                    if (keys["Tab"]) {
                        // draw baconian table
                        ctx.font = "25px Courier New";
                        for (var i = 0; i < 26; i++) {
                            ctx.fillText(Object.keys(LETTER).find(key => LETTER[key] == i) + ": " + LETTERTOBACONIAN[Object.keys(LETTER).find(key => LETTER[key] == i)], 430, 45 + (22 * i));
                        }
                    } else {
                        for (var i = 0; i < encryptedLines.length; i++) {
                            for (var j = 0; j < encryptedLines[i].length; j++) {
                                // draw cipherchar
                                ctx.fillText(encryptedLines[i][j], 30 + (12 * j), -120 + 200 + (80 * i));
                                // draw values
                                if (correctLines[i][j] != "_") {
                                    ctx.fillStyle = "#00ffffff";
                                    ctx.fillText(correctLines[i][j], 30 + (12 * j), -120 + 220 + (80 * i));
                                } else {
                                    ctx.fillStyle = "#20c20eff";
                                    ctx.fillText(valueLines[i][j], 30 + (12 * j), -120 + 220 + (80 * i));
                                }
                                ctx.fillStyle = "#20c20eff";
                    
                                // set selected char if clicked on
                                if (!encryptedLines[i][j].match(symbolRegex) && mouseDown && mouseX > 30 + (12 * j) && mouseX < 45 + (12 * j) && mouseY > -120 + 180 + (80 * i) && mouseY < -120 + 240 + (80 * i)) {
                                    selectedChar = [0, i, j];
                                }
                    
                                // draw selected char
                                if (selectedChar[0] == 0) {
                                    if (selectedChar[1] == i && selectedChar[2] == j) {
                                        ctx.fillText("^", 30 + (12 * j), -120 + 245 + (80 * i))
                                    }
                                }
                            }
                        }
                    
                        // type letter
                        if (typeTimer > typeDelay) {
                            for (const [key, value] of Object.entries(LETTER)) {
                                if (keys[key.toString().toLowerCase()]) {
                                    valueLines[selectedChar[1]] = valueLines[selectedChar[1]].replaceAt(selectedChar[2], key.toString());
                                    moveToNextChar = true;
                                    typeTimer = 0;
                                }
                            }
                            if (keys["Backspace"]) {
                                valueLines[selectedChar[1]] = valueLines[selectedChar[1]].replaceAt(selectedChar[2], "_");
                                moveToPrevChar = true;
                                typeTimer = 0;
                            }
                        }
                    
                        // update selected char
                        if ((keys["ArrowRight"] || moveToNextChar) && selectTimer > 5) {
                            var prevChar = [selectedChar[0], selectedChar[1], selectedChar[2]];
                
                            // increase char
                            selectedChar[2]++;
                
                            // increase char if on symbol
                            while (selectedChar[2] < encryptedLines[selectedChar[1]].length && encryptedLines[selectedChar[1]][selectedChar[2]].match(symbolRegex)) {
                                selectedChar[2]++;
                            }
                
                            // if char > line width, increase line
                            if (selectedChar[2] >= encryptedLines[selectedChar[1]].length) {
                                if (selectedChar[1] + 1 < encryptedLines.length) {
                                    selectedChar[1]++;
                                    selectedChar[2] = 0;
                                } else {
                                    selectedChar = prevChar;
                                }
                            }
                
                            selectTimer = 0;
                        }
                        if ((keys["ArrowLeft"] || moveToPrevChar) && selectTimer > 5) {
                            var prevChar = [selectedChar[0], selectedChar[1], selectedChar[2]];
                
                            // increase char
                            selectedChar[2]--;
                
                            // if char > line width, increase line
                            if (selectedChar[2] < 0) {
                                if (selectedChar[1] - 1 >= 0) {
                                    selectedChar[1]--;
                                    selectedChar[2] = encryptedLines[selectedChar[1]].length - 1;
                                } else {
                                    selectedChar = prevChar;
                                }
                            }
                
                            // increase char if on symbol
                            while (selectedChar[2] >= 0 && encryptedLines[selectedChar[1]][selectedChar[2]].match(symbolRegex)) {
                                selectedChar[2]--;
                            }
                
                            selectTimer = 0;
                        }
                
                        moveToNextChar = false;
                        moveToPrevChar = false;
                    
                        // render check button
                        // fix this later
                        ctx.strokeStyle = "#20c20eff";
                        ctx.lineWidth = 3;
                        ctx.strokeRect(25, 560, 100, 40);
                        ctx.stroke();
                        ctx.fillStyle = "#20c20eff";
                        ctx.font = "20px Courier New";
                        ctx.fillText("Check", 42, 585);
                        if (mouseX > 25 && mouseX < 125 && mouseY > 560 && mouseY < 600 && mouseDown) {
                            var k = 0;
                            for (var i = 0; i < valueLines.length; i++) {
                                for (var j = 0; j < valueLines[i].replace(symbolRegex, "").length; j++) {
                                    if (j % 5 == 0) {
                                        if (valueLines[i].replace(symbolRegex, "")[j] == quote.replace(symbolRegex, "")[k]) {
                                            for (var l = 0; l < valueLines[i].length; l++) {
                                                if (l - (valueLines[i].substring(0, l + 1).match(symbolRegex) || []).length == j) {
                                                    correctLines[i] = correctLines[i].replaceAt(l, quote.replace(symbolRegex, "")[k]);
                                                }
                                            }
                                        }
                                        k++;
                                    }
                                }
                            }
                        }
                    }
                    break;
                }
                case CIPHERTYPE.COLUMNAR: {
                    ctx.beginPath();
                    ctx.fillStyle = "#20c20eff";
                    ctx.font = "20px Courier New";

                    // title
                    ctx.fillText("Complete Columnar", 125, 40);

                    ctx.fillText("Key: " + key, 30, 80);
                    drawCiphertextAndValues(-60, 12, "letter");

                    // render check button
                    drawCheckButton();
                    break;
                }
                case CIPHERTYPE.NIHILIST: {
                    ctx.beginPath();
                    ctx.fillStyle = "#20c20eff";
                    ctx.font = "20px Courier New";

                    // title
                    ctx.fillText("Nihilist", 125, 40);

                    ctx.fillText("Polybius Key: " + key[0], 30, 80);
                    ctx.fillText("Key: " + key[1], 30, 110);

                    for (var i = 0; i < encryptedLines.length; i++) {
                        for (var j = 0; j < encryptedLines[i].length; j++) {
                            // draw cipherchar
                            ctx.fillText(encryptedLines[i][j], 30 + ((12) * j), (-30) + 200 + (80 * i));
                            // draw values
                            if (correctLines[i][j] != "_") {
                                ctx.fillStyle = "#00ffffff";
                                ctx.fillText(correctLines[i][j], 30 + ((12) * j), (-30) + 220 + ((12) - 12) + (80 * i));
                            } else {
                                ctx.fillStyle = "#20c20eff";
                                ctx.fillText(valueLines[i][j], 30 + ((12) * j), (-30) + 220 + ((12) - 12) + (80 * i));
                            }
                            ctx.fillStyle = "#20c20eff";
                            
                            // set selected char if clicked on
                            if (!valueLines[i][j].match(/ /g) && mouseDown && mouseX > 30 + ((12) * j) && mouseX < 45 + ((12) * j) && mouseY > (-30) + 180 + (80 * i) && mouseY < (-30) + 240 + (80 * i)) {
                                selectedChar = [0, i, j];
                            }

                            // draw selected char
                            if (selectedChar[1] == i && selectedChar[2] == j) {
                                ctx.fillText("^", 30 + ((12) * j), (-30) + 245 + (80 * i) + 2 * ((12) - 12))
                            }
                        }
                    }

                    // type letter
                    if (typeTimer > typeDelay) {
                            for (const [key, value] of Object.entries(LETTER)) {
                                if (keys[key.toString().toLowerCase()]) {
                                    valueLines[selectedChar[1]] = valueLines[selectedChar[1]].replaceAt(selectedChar[2], key.toString());
                                    moveToNextChar = true;
                                    typeTimer = 0;
                                }
                            }
                        if (keys["Backspace"]) {
                            valueLines[selectedChar[1]] = valueLines[selectedChar[1]].replaceAt(selectedChar[2], "_");
                            moveToPrevChar = true;
                            typeTimer = 0;
                        }
                    }

                    // update selected char
                    if ((keys["ArrowRight"] || moveToNextChar) && selectTimer > 5) {
                        var prevChar = [selectedChar[0], selectedChar[1], selectedChar[2]];

                        // increase char
                        selectedChar[2]++;

                        // increase char if on symbol
                        while (selectedChar[2] < encryptedLines[selectedChar[1]].length && encryptedLines[selectedChar[1]][selectedChar[2]].match(/ /g)) {
                            selectedChar[2]++;
                        }

                        // if char > line width, increase line
                        if (selectedChar[2] >= encryptedLines[selectedChar[1]].length) {
                            if (selectedChar[1] + 1 < encryptedLines.length) {
                                selectedChar[1]++;
                                selectedChar[2] = 0;
                            } else {
                                selectedChar = prevChar;
                            }
                        }

                        selectTimer = 0;
                    }
                    if ((keys["ArrowLeft"] || moveToPrevChar) && selectTimer > 5) {
                        var prevChar = [selectedChar[0], selectedChar[1], selectedChar[2]];

                        // increase char
                        selectedChar[2]--;

                        // if char > line width, increase line
                        if (selectedChar[2] < 0) {
                            if (selectedChar[1] - 1 >= 0) {
                                selectedChar[1]--;
                                selectedChar[2] = encryptedLines[selectedChar[1]].length - 1;
                            } else {
                                selectedChar = prevChar;
                            }
                        }

                        // increase char if on symbol
                        while (selectedChar[2] >= 0 && encryptedLines[selectedChar[1]][selectedChar[2]].match(/ /g)) {
                            selectedChar[2]--;
                        }

                        selectTimer = 0;
                    }

                    moveToNextChar = false;
                    moveToPrevChar = false;

                    // render check button
                    drawCheckButton();
                    break;
                }
                default: {
                    break;
                }
            }

            break;
        }
    }
}

function drawCheckButton() {
    ctx.beginPath();
    ctx.strokeStyle = "#20c20eff";
    ctx.lineWidth = 3;
    ctx.strokeRect(25, 560, 100, 40);
    ctx.stroke();
    ctx.fillStyle = "#20c20eff";
    ctx.font = "20px Courier New";
    ctx.fillText("Check", 42, 585);
    if (mouseX > 25 && mouseX < 125 && mouseY > 560 && mouseY < 600 && mouseDown) {
        checkCorrect();
    }
}

function drawCiphertextAndValues(ypos, spacing, typeOfEntries) {
    for (var i = 0; i < encryptedLines.length; i++) {
        for (var j = 0; j < encryptedLines[i].length; j++) {
            // draw cipherchar
            ctx.fillText(encryptedLines[i][j], 30 + (spacing * j), ypos + 200 + (80 * i));
            // draw values
            if (correctLines[i][j] != "_") {
                ctx.fillStyle = "#00ffffff";
                ctx.fillText(correctLines[i][j], 30 + (spacing * j), ypos + 220 + (spacing - 12) + (80 * i));
            } else {
                ctx.fillStyle = "#20c20eff";
                ctx.fillText(valueLines[i][j], 30 + (spacing * j), ypos + 220 + (spacing - 12) + (80 * i));
            }
            ctx.fillStyle = "#20c20eff";

            // set selected char if clicked on
            if (!encryptedLines[i][j].match(symbolRegex) && mouseDown && mouseX > 30 + (spacing * j) && mouseX < 45 + (spacing * j) && mouseY > ypos + 180 + (80 * i) && mouseY < ypos + 240 + (80 * i)) {
                selectedChar = [0, i, j];
            }

            // draw selected char
            if (selectedChar[0] == 0) {
                if (selectedChar[1] == i && selectedChar[2] == j) {
                    ctx.fillText("^", 30 + (spacing * j), ypos + 245 + (80 * i) + 2 * (spacing - 12))
                }
            }
        }
    }

    if (selectedChar[0] == 1) {
        ctx.fillText("^", 200 + (30 * selectedChar[1]), 155);
    }

    // type letter
    if (typeTimer > typeDelay) {
        if (typeOfEntries == "letter") {
            for (const [key, value] of Object.entries(LETTER)) {
                if (keys[key.toString().toLowerCase()]) {
                    if (selectedChar[0] == 0) {
                        valueLines[selectedChar[1]] = valueLines[selectedChar[1]].replaceAt(selectedChar[2], key.toString());
                        moveToNextChar = true;
                    } else if (selectedChar[0] == 1) {
                        replacementList[selectedChar[1]] = key.toString();
                    }
                    typeTimer = 0;
                }
            }
        } else if (typeOfEntries == "number") {
            for (var i = 0; i < 10; i++) {
                if (keys[i.toString()]) {
                    valueLines[selectedChar[1]] = valueLines[selectedChar[1]].replaceAt(selectedChar[2], i.toString());
                    moveToNextChar = true;
                    typeTimer = 0;
                }
            }
        }
        if (keys["Backspace"]) {
            if (selectedChar[0] == 0) {
                valueLines[selectedChar[1]] = valueLines[selectedChar[1]].replaceAt(selectedChar[2], "_");
                moveToPrevChar = true;
            } else if (selectedChar[0] == 1) {
                replacementList[selectedChar[1]] = "_";
            }
            typeTimer = 0;
        }
    }

    // update selected char
    if (selectedChar[0] == 0) {
        if ((keys["ArrowRight"] || moveToNextChar) && selectTimer > 5) {
            var prevChar = [selectedChar[0], selectedChar[1], selectedChar[2]];

            // increase char
            selectedChar[2]++;

            // increase char if on symbol
            while (selectedChar[2] < encryptedLines[selectedChar[1]].length && encryptedLines[selectedChar[1]][selectedChar[2]].match(symbolRegex)) {
                selectedChar[2]++;
            }

            // if char > line width, increase line
            if (selectedChar[2] >= encryptedLines[selectedChar[1]].length) {
                if (selectedChar[1] + 1 < encryptedLines.length) {
                    selectedChar[1]++;
                    selectedChar[2] = 0;
                } else {
                    selectedChar = prevChar;
                }
            }

            selectTimer = 0;
        }
        if ((keys["ArrowLeft"] || moveToPrevChar) && selectTimer > 5) {
            var prevChar = [selectedChar[0], selectedChar[1], selectedChar[2]];

            // increase char
            selectedChar[2]--;

            // if char > line width, increase line
            if (selectedChar[2] < 0) {
                if (selectedChar[1] - 1 >= 0) {
                    selectedChar[1]--;
                    selectedChar[2] = encryptedLines[selectedChar[1]].length - 1;
                } else {
                    selectedChar = prevChar;
                }
            }

            // increase char if on symbol
            while (selectedChar[2] >= 0 && encryptedLines[selectedChar[1]][selectedChar[2]].match(symbolRegex)) {
                selectedChar[2]--;
            }

            selectTimer = 0;
        }

        moveToNextChar = false;
        moveToPrevChar = false;
    }
}

function checkCorrect() {
    for (var i = 0; i < valueLines.length; i++) {
        for (var j = 0; j < valueLines[i].length; j++) {
            if (valueLines[i][j] == quoteLines[i][j]) {
                correctLines[i] = correctLines[i].replaceAt(j, quoteLines[i][j]);
            }
        }
    }
}

function init() {
    window.requestAnimationFrame(loop);
}

var deltaTime = 0;
var deltaCorrect = (1 / 16);
var prevTime = Date.now();
function loop() {
    deltaTime = (Date.now() - prevTime) * deltaCorrect;
    prevTime = Date.now();

    main();
    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(init);
