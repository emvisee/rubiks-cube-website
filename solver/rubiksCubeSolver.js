////////// COLOR CLASS //////////
function Color(sIn, cIn, fIn, string) {
    this.squareCoords = sIn;
    this.colorCoords = cIn;
    this.faceCoords = fIn;
}

Color.prototype.sCoords = function() {
    return this.squareCoords;
}

Color.prototype.cCoords = function() {
    return this.colorCoords;
}

Color.prototype.fCoords = function() {
    return this.faceCoords;
}

////////// BLOCK CLASS //////////
function Block(cIn, bIn) {
    this.colors = cIn;
    this.blockCoords = bIn;
}

Block.prototype.getColors = function() {
    return this.colors;
}

Block.prototype.bCoords = function () {
    return this.blockCoords;
}

////////// RUBIK'S CUBE CLASS //////////
function RubiksCube(faceMap) {
    const colorCoords = {
        "R": [90, 0],
        "G": [90, 90],
        "O": [90, 180],
        "B": [90, 270],
        "Y": [0, 0],
        "W": [180, 0]
    };

    const colorCoordsStr = {
        "R": "90_0",
        "G": "90_90",
        "O": "90_180",
        "B": "90_270",
        "Y": "0_0",
        "W": "180_0"
    };

    this.moves = [];
    this.blocks = new Map();
    this.faces = new Map();
    for (const key in colorCoordsStr) {
        this.faces.set(colorCoordsStr[key], new Map());
    }

    // console.log(this.faces);
    // console.log(this.faces.has("0_0"));

    let cLetter, sCoords = [], cCoords = [], fCoords = [];
    const faceMapArray = faceMap.split(" ");
    let index = 0;

    // 3 layers
    for (let i = 1; i < 4; ++i) {
        let jValues = [0, 1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 0];
        for (let j = 0; j < 12; ++j) {
            sCoords = [45 * i, mod(315 + 45 * jValues[j], 360)];
            const sCoordsStr = cToStr(sCoords);
            cLetter = faceMapArray[index];
            index++;

            // ignore center squares
            if (sCoords[0] == 90 && sCoords[2] % 90 == 0) continue;

            cCoords = colorCoords[cLetter];
            fCoords = [90, 90 * Math.floor(j / 3)];
            const fCoordsStr = cToStr(fCoords);
            const color = new Color(sCoords, cCoords, fCoords);
            this.faces.get(fCoordsStr).set(sCoordsStr, color);
        }
    }

    // top and bottom
    for (let i = 0; i < 2; ++i) {
        for (let j = 0; j < 8; ++j) {
            cLetter = faceMapArray[index];
            index++;
            sCoords = [45 + 90 * i, 45 * j];
            const sCoordsStr = cToStr(sCoords);
            cCoords = colorCoords[cLetter];
            fCoords = [180 * i, 0];
            const fCoordsStr = cToStr(fCoords);
            const color = new Color(sCoords, cCoords, fCoords);
            this.faces.get(fCoordsStr).set(sCoordsStr, color);
        }
    }

    // console.log("faces: ", this.faces);

    //initialize blocks
    let bCoords = [];
    for (let i = 1; i < 4; ++i) {
        for (let j = 0; j < 8; ++j) {
            bCoords = [45 * i, 45 * j];
            const bCoordsStr = cToStr(bCoords);
            // skip center blocks
            if (bCoords[0] % 90 == 0 && bCoords[1] % 90 == 0) continue;

            let colors = [];
            // corner blocks
            if (bCoords[0] % 90 == 45 && bCoords[1] % 90 == 45) {
                // top corners
                if (bCoords[0] == 45) {
                    colors.push(this.faces.get(cToStr([0, 0])).get(bCoordsStr));
                }
                // bottom corners
                else {
                    colors.push(this.faces.get(cToStr([180, 0])).get(bCoordsStr));
                }
                colors.push(this.faces.get(cToStr([90, mod(bCoords[1] + 45, 360)])).get(bCoordsStr));
                colors.push(this.faces.get(cToStr([90, mod(bCoords[1] - 45, 360)])).get(bCoordsStr));
            }
            // side blocks
            else {
                // second row
                if (bCoords[0] == 90) {
                    colors.push(this.faces.get(cToStr([90, mod(bCoords[1] + 45, 360)])).get(bCoordsStr));
                    colors.push(this.faces.get(cToStr([90, mod(bCoords[1] - 45, 360)])).get(bCoordsStr));
                }
                // top row
                else if (bCoords[0] == 45) {
                    colors.push(this.faces.get(cToStr([bCoords[0] + 45, bCoords[1]])).get(bCoordsStr));
                    colors.push(this.faces.get(cToStr([0, 0])).get(bCoordsStr));
                }
                // bottom row
                else {
                    colors.push(this.faces.get(cToStr([bCoords[0] - 45, bCoords[1]])).get(bCoordsStr));
                    colors.push(this.faces.get(cToStr([180, 0])).get(bCoordsStr));
                }
            }
            let block = new Block(colors, bCoords);
            this.blocks.set(bCoordsStr, block);
        }
    }

    // console.log("blocks: ", this.blocks);
}

RubiksCube.prototype.rotate = function(move) {
    this.moves.push(move);
    const faceConversion = {
        "F": [90, 0],
        "R": [90, 90],
        "B": [90, 180],
        "L": [90, 270],
        "U": [0, 0],
        "D": [180, 0]
    };

    // const faceConversionStr = {
    //     "F": "90_0",
    //     "R": "90_90",
    //     "B": "90_180",
    //     "L": "90_270",
    //     "U": "0_0",
    //     "D": "180_0"
    // };

    const face = faceConversion[move[0]];
    const faceStr = cToStr(face);
    const clockwise = (move.length == 1);
    let faceCoords = [];
    // F, B, L, R
    if (face[0] == 90) {
        // start from top left corner
        faceCoords.push(cToStr([face[0] - 45, mod(face[1] - 45, 360)]));
        faceCoords.push(cToStr([face[0] - 45, face[1]]));
        faceCoords.push(cToStr([face[0] - 45, mod(face[1] + 45, 360)]));
        faceCoords.push(cToStr([face[0], mod(face[1] + 45, 360)]));
        faceCoords.push(cToStr([face[0] + 45, mod(face[1] + 45, 360)]));
        faceCoords.push(cToStr([face[0] + 45, face[1]]));
        faceCoords.push(cToStr([face[0] + 45, mod(face[1] - 45, 360)]));
        faceCoords.push(cToStr([face[0], mod(face[1] - 45, 360)]));
    }
    // U, D
    else {
        // corner starts from {45, 315}
        let theta = 45;
        if (face[0] == 180) theta += 90;
        for (let i = 0; i < 8; ++i) {
            faceCoords.push(cToStr([theta, mod(315 + 45 * i, 360)]));
        }
    }
    // swap side colors
    let swapFaces = [];
    if (face[0] == 90) {
        swapFaces.push(cToStr([0, 0]));
        swapFaces.push(cToStr([90, mod(face[1] + 90, 360)]));
        swapFaces.push(cToStr([180, 0]));
        swapFaces.push(cToStr([90, mod(face[1] - 90, 360)]));
    }
    else {
        for (let i = 0; i < 4; ++i) {
            swapFaces.push(cToStr([90, 90 * i]));
        }
    }

    swapping: while (true) {
        // swap face colors
        if ((clockwise && face[0] != 0) || (!clockwise && face[0] == 0)) {
            const tempColor1 = this.faces.get(faceStr).get(faceCoords[7]);
            const tempColor2 = this.faces.get(faceStr).get(faceCoords[6]);
            for (let i = 7; i > 1; --i) {
                this.faces.get(faceStr).set(faceCoords[i], this.faces.get(faceStr).get(faceCoords[i - 2]));
            }
            this.faces.get(faceStr).set(faceCoords[0], tempColor2);
            this.faces.get(faceStr).set(faceCoords[1], tempColor1);
        }
        else {
            const tempColor1 = this.faces.get(faceStr).get(faceCoords[1]);
            const tempColor2 = this.faces.get(faceStr).get(faceCoords[0]);
            for (let i = 0; i < 6; ++i) {
                this.faces.get(faceStr).set(faceCoords[i], this.faces.get(faceStr).get(faceCoords[i + 2]));
            }
            this.faces.get(faceStr).set(faceCoords[6], tempColor2);
            this.faces.get(faceStr).set(faceCoords[7], tempColor1);
        }
        // update sCoords
        for (let i = 0; i < 8; ++i) {
            this.faces.get(faceStr).get(faceCoords[i]).squareCoords = strToC(faceCoords[i]);
        }

        if ((clockwise && face[0] != 0) || (!clockwise && face[0] == 0)) {
            const tempColor1 = this.faces.get(swapFaces[3]).get(faceCoords[0]);
            const tempColor2 = this.faces.get(swapFaces[3]).get(faceCoords[7]);
            const tempColor3 = this.faces.get(swapFaces[3]).get(faceCoords[6]);
            for (let i = 8; i > 2; i -= 2) {
                this.faces.get(swapFaces[i / 2 - 1]).set(faceCoords[i % 8], this.faces.get(swapFaces[i / 2 - 2]).get(faceCoords[i - 2]));

                this.faces.get(swapFaces[i / 2 - 1]).set(faceCoords[i - 1], this.faces.get(swapFaces[i / 2 - 2]).get(faceCoords[i - 3]));

                this.faces.get(swapFaces[i / 2 - 1]).set(faceCoords[i - 2], this.faces.get(swapFaces[i / 2 - 2]).get(faceCoords[i - 4]));
            }
            this.faces.get(swapFaces[0]).set(faceCoords[2], tempColor1);
            this.faces.get(swapFaces[0]).set(faceCoords[1], tempColor2);
            this.faces.get(swapFaces[0]).set(faceCoords[0], tempColor3);
        }
        else {
            const tempColor1 = this.faces.get(swapFaces[0]).get(faceCoords[2]);
            const tempColor2 = this.faces.get(swapFaces[0]).get(faceCoords[1]);
            const tempColor3 = this.faces.get(swapFaces[0]).get(faceCoords[0]);
            for (let i = 0; i < 6; i += 2) {
                this.faces.get(swapFaces[i / 2]).set(faceCoords[i], this.faces.get(swapFaces[i / 2 + 1]).get(faceCoords[i + 2]));

                this.faces.get(swapFaces[i / 2]).set(faceCoords[i + 1], this.faces.get(swapFaces[i / 2 + 1]).get(faceCoords[i + 3]));

                this.faces.get(swapFaces[i / 2]).set(faceCoords[i + 2], this.faces.get(swapFaces[i / 2 + 1]).get(faceCoords[(i + 4) % 8]));
            }
            this.faces.get(swapFaces[3]).set(faceCoords[0], tempColor1);
            this.faces.get(swapFaces[3]).set(faceCoords[7], tempColor2);
            this.faces.get(swapFaces[3]).set(faceCoords[6], tempColor3);
        }
        // update squareCoords
        for (let i = 0; i < 8; i += 2) {
            for (let j = 0; j < 3; ++j) {
                this.faces.get(swapFaces[i / 2]).get(faceCoords[(i + j) % 8]).squareCoords = strToC(faceCoords[(i + j) % 8]);

                this.faces.get(swapFaces[i / 2]).get(faceCoords[(i + j) % 8]).faceCoords = strToC(swapFaces[i / 2]);
            }
        }
        // update blocks
        for (let i = 0; i < 8; ++i) {
            let newColors = [];
            let bCoords = strToC(faceCoords[i]);
            let bCoordsStr = faceCoords[i];
            // corner blocks
            if (bCoords[0] % 90 == 45 && bCoords[1] % 90 == 45) {
                // top corners
                if (bCoords[0] == 45) {
                    newColors.push(this.faces.get(cToStr([0, 0])).get(bCoordsStr));
                }
                // bottom corners
                else {
                    newColors.push(this.faces.get(cToStr([180, 0])).get(bCoordsStr));
                }
                newColors.push(this.faces.get(cToStr([90, mod(bCoords[1] + 45, 360)])).get(bCoordsStr));
                newColors.push(this.faces.get(cToStr([90, mod(bCoords[1] - 45, 360)])).get(bCoordsStr));
            }
            // side blocks
            else {
                // second row
                if (bCoords[0] == 90) {
                    newColors.push(this.faces.get(cToStr([90, mod(bCoords[1] + 45, 360)])).get(bCoordsStr));
                    newColors.push(this.faces.get(cToStr([90, mod(bCoords[1] - 45, 360)])).get(bCoordsStr));
                }
                // top row
                else if (bCoords[0] == 45) {
                    newColors.push(this.faces.get(cToStr([bCoords[0] + 45, bCoords[1]])).get(bCoordsStr));
                    newColors.push(this.faces.get(cToStr([0, 0])).get(bCoordsStr));
                }
                // bottom row
                else {
                    newColors.push(this.faces.get(cToStr([bCoords[0] - 45, bCoords[1]])).get(bCoordsStr));
                    newColors.push(this.faces.get(cToStr([180, 0])).get(bCoordsStr));
                }
            }
            this.blocks.get(faceCoords[i]).colors = newColors.slice();
        }

        // double rotation
        if (!clockwise) {
            if (move[1] == '2') {
                move = move[0] + '\'';
                continue swapping;
            }
        }
        break;
    }
}

RubiksCube.prototype.findEdge = function(c1, c2) {
    let x = 1, y = 3;
    for (let i = x; i <= y; ++i) {
        for (let j = 0; j < 4; ++j) {
            const block = this.blocks.get(cToStr([45 * i, 90 * j + 45 * mod(i - 1, 2)]));
            if (this.blockContains(block, c1, c2)) {
                return block.blockCoords;
            }
        }
    }
    return [-1, -1];
}

RubiksCube.prototype.findCorner = function(c1, c2, c3) {
    let x = 1, y = 3;
    for (let i = x; i <= y; i += 2) {
        for (let j = 0; j < 4; ++j) {
            const block = this.blocks.get(cToStr([45 * i, 45 + 90 * j]));
            if (this.blockContains(block, c1, c2, c3)) {
                return block.blockCoords;
            }
        }
    }
    return [-1, -1];
}

RubiksCube.prototype.blockContains = function(b, c1, c2, c3 = [-1, -1]) {
    let foundC1 = false, foundC2 = foundC1, foundC3 = foundC1;
    if (arrEqual(c3, [-1, -1])) foundC3 = true;

    b.colors.forEach(function(color) {
        if (arrEqual(color.colorCoords, c1)) foundC1 = true;
        if (arrEqual(color.colorCoords, c2)) foundC2 = true;
        if (!arrEqual(c3, [-1, -1]) && arrEqual(color.colorCoords, c3)) foundC3 = true;
    });

    return foundC1 && foundC2 && foundC3;
}

RubiksCube.prototype.getColor = function(block, c1) {
    let found = null;
    block.colors.forEach(function(color) {
        if (arrEqual(color.colorCoords, c1)) found = color;
    });
    return found;
}

///// SOLVE CROSS /////
RubiksCube.prototype.solveCross = function() {
    const CTF = {
        "90_0": "F",
        "90_90": "R",
        "90_180": "B",
        "90_270": "L",
        "0_0": "U",
        "180_0": "D"
    };
    for (let i = 0; i < 4; ++i) {
        const blockCoord = this.findEdge([180, 0], [90, 90 * i]);
        const block = this.blocks.get(cToStr(blockCoord));
        const colorWhite = this.getColor(block, [180, 0]);       // colorWhite
        const colorOther = this.getColor(block, [90, 90 * i]);  // colorOther
        // if block is in correct place
        if (arrEqual(colorWhite.faceCoords, [180, 0]) && arrEqual(colorOther.faceCoords, [90, 90 * i])) continue;

        // if white is on the sides
        if (colorWhite.faceCoords[0] == 90) {
            const theta = colorWhite.squareCoords[0];
            // white on first layer
            if (theta == 45) {
                let difference = 0;
                while (mod(colorWhite.faceCoords[1] + difference, 360) != colorOther.colorCoords[1]) {
                    difference += 90;
                }
                if (difference == 0) {
                    const oldFace = colorWhite.faceCoords;
                    const newFace = [90, mod(colorWhite.faceCoords[1] - 90, 360)];
                    this.rotate("U");
                    this.rotate(CTF[cToStr(newFace)]);
                    this.rotate(CTF[cToStr(oldFace)] + "'");
                    this.rotate(CTF[cToStr(newFace)] + "'");
                }
                else if (difference == 180) {
                    const newFace = [90, mod(colorWhite.faceCoords[1] - 90, 360)];
                    const newFace2 = [90, mod(colorWhite.faceCoords[1] - 180, 360)];
                    this.rotate("U");
                    this.rotate(CTF[cToStr(newFace)] + "'");
                    this.rotate(CTF[cToStr(newFace2)]);
                    this.rotate(CTF[cToStr(newFace)]);
                }
                else if (difference == 270) {
                    const oldFace = colorWhite.faceCoords;
                    const newFace = [90, mod(colorWhite.faceCoords[1] - 90, 360)];
                    this.rotate(CTF[cToStr(oldFace)] + "'");
                    this.rotate(CTF[cToStr(newFace)]);
                    this.rotate(CTF[cToStr(oldFace)]);
                }
                else {
                    const oldFace = colorWhite.faceCoords;
                    const newFace = [90, mod(colorWhite.faceCoords[1] + 90, 360)];
                    this.rotate(CTF[cToStr(oldFace)]);
                    this.rotate(CTF[cToStr(newFace)] + "'");
                    this.rotate(CTF[cToStr(oldFace)] + "'");
                }
            }
            // white on second layer
            else if (theta == 90) {
                let difference = 0;
                while (mod(colorOther.faceCoords[1] + difference, 360) != colorOther.colorCoords[1]) {
                    difference += 90;
                }
                if (difference == 0) {
                    const face = colorOther.faceCoords;
                    if (colorOther.squareCoords[1] == mod(colorOther.faceCoords[1] - 45, 360)) {
                        this.rotate(CTF[cToStr(face)] + "'");
                    }
                    else {
                        this.rotate(CTF[cToStr(face)]);
                    }
                }
                else if (difference == 180) {
                    this.rotate("D2");
                    const face = colorOther.faceCoords;
                    if (colorOther.squareCoords[1] == mod(colorOther.faceCoords[1] - 45, 360)) {
                        this.rotate(CTF[cToStr(face)] + "'");
                    }
                    else {
                        this.rotate(CTF[cToStr(face)]);
                    }
                    this.rotate("D2");
                }
                else if (difference == 270) {
                    this.rotate("D");
                    const face = colorOther.faceCoords;
                    if (colorOther.squareCoords[1] == mod(colorOther.faceCoords[1] - 45, 360)) {
                        this.rotate(CTF[cToStr(face)] + "'");
                    }
                    else {
                        this.rotate(CTF[cToStr(face)]);
                    }
                    this.rotate("D'");
                }
                else {
                    this.rotate("D'");
                    const face = colorOther.faceCoords;
                    if (colorOther.squareCoords[1] == mod(colorOther.faceCoords[1] - 45, 360)) {
                        this.rotate(CTF[cToStr(face)] + "'");
                    }
                    else {
                        this.rotate(CTF[cToStr(face)]);
                    }
                    this.rotate("D");
                }
            }
            // white on last layer
            else {
                let difference = 0;
                while (mod(colorWhite.faceCoords[1] + difference, 360) != colorOther.colorCoords[1]) {
                    difference += 90;
                }
                if (difference == 0) {
                    const face = colorWhite.faceCoords;
                    const newFace = [90, mod(colorWhite.faceCoords[1] - 90, 360)];
                    this.rotate(CTF[cToStr(face)]);
                    this.rotate("D'");
                    this.rotate(CTF[cToStr(newFace)]);
                    this.rotate("D");
                }
                else if (difference == 180) {
                    const face = colorWhite.faceCoords;
                    const newFace = [90, mod(colorWhite.faceCoords[1] + 90, 360)];
                    this.rotate(CTF[cToStr(face)] + "'");
                    this.rotate("D'");
                    this.rotate(CTF[cToStr(newFace)] + "'");
                    this.rotate("D");
                }
                else if (difference == 90) {
                    const face = colorWhite.faceCoords;
                    const newFace = [90, mod(colorWhite.faceCoords[1] + 90, 360)];
                    this.rotate(CTF[cToStr(face)] + "'");
                    this.rotate(CTF[cToStr(newFace)] + "'");
                }
                else {
                    const face = colorWhite.faceCoords;
                    const newFace = [90, mod(colorWhite.faceCoords[1] - 90, 360)];
                    this.rotate(CTF[cToStr(face)]);
                    this.rotate(CTF[cToStr(newFace)]);
                }
            }
        }
        // white on yellow layer
        else if (colorWhite.faceCoords[0] == 0) {
            let difference = 0;
            while (mod(colorOther.faceCoords[1] + difference, 360) != colorOther.colorCoords[1]) {
                difference += 90;
            }
            if (difference == 0) {
                const face = colorOther.faceCoords;
                this.rotate(CTF[cToStr(face)] + "2");
            }
            else if (difference == 180) {
                const face = [90, mod(colorOther.faceCoords[1] + 180, 360)];
                this.rotate("U2");
                this.rotate(CTF[cToStr(face)] + "2");
            }
            else if (difference == 270) {
                const face = [90, mod(colorOther.faceCoords[1] - 90, 360)];
                this.rotate("U");
                this.rotate(CTF[cToStr(face)] + "2");
            }
            else {
                const face = [90, mod(colorOther.faceCoords[1] + 90, 360)];
                this.rotate("U'");
                this.rotate(CTF[cToStr(face)] + "2");
            }
        }
        else {
            let difference = 0;
            while (mod(colorOther.faceCoords[1] + difference, 360) != colorOther.colorCoords[1]) {
                difference += 90;
            }
            if (Math.abs(difference) == 180) {
                const face = colorOther.faceCoords;
                const newFace = [90, mod(colorOther.faceCoords[1] + 180, 360)];
                this.rotate(CTF[cToStr(face)] + "2");
                this.rotate("U2");
                this.rotate(CTF[cToStr(newFace)] + "2");
            }
            else if (difference == 270) {
                const face = colorOther.faceCoords;
                const newFace = [90, mod(colorOther.faceCoords[1] - 90, 360)];
                this.rotate(CTF[cToStr(face)] + "2");
                this.rotate("U");
                this.rotate(CTF[cToStr(newFace)] + "2");
            }
            else {
                const face = colorOther.faceCoords;
                const newFace = [90, mod(colorOther.faceCoords[1] + 90, 360)];
                this.rotate(CTF[cToStr(face)] + "2");
                this.rotate("U'");
                this.rotate(CTF[cToStr(newFace)] + "2");
            }
        }
    }
    // console.log("Cross complete:", this.blocks);
}

RubiksCube.prototype.preservePairs = function(face, clockwise) {
    let clockwiseR = 0;
    let edge;
    let corner;
    // console.log(face);
    repeat: while (true) {
        if (clockwise) {
            edge = this.blocks.get(cToStr([90, mod(face[1] - 45, 360)]));
            corner = this.blocks.get(cToStr([135, mod(face[1] - 45, 360)]));
        }
        else {
            edge = this.blocks.get(cToStr([90, mod(face[1] + 45, 360)]));
            corner = this.blocks.get(cToStr([135, mod(face[1] + 45, 360)]));
        }
        // console.log(edge, corner);
    
        let isPair = true;
        for (const color of edge.colors) {
            if (!arrEqual(color.colorCoords, color.faceCoords)) isPair = false;
        }
        for (const color of corner.colors) {
            if (!arrEqual(color.colorCoords, color.faceCoords)) isPair = false;
        }
        if (isPair) {
            face[1] = mod(face[1] - 90, 360);
            clockwiseR++;
            continue repeat;
        }
        break;
    }

    if (clockwiseR == 1) this.rotate("U");
    else if (clockwiseR == 2) this.rotate("U2");
    else if (clockwiseR == 3) this.rotate("U'");
}

RubiksCube.prototype.insertPair = function(cornerCoord, edgeCoord) {
    const CTF = {
        "90_0": "F",
        "90_90": "R",
        "90_180": "B",
        "90_270": "L",
        "0_0": "U",
        "180_0": "D"
    };
    const corner = this.blocks.get(cToStr(cornerCoord));
    const edge = this.blocks.get(cToStr(edgeCoord));
    let cornerSide;
    let cornerTop;
    for (const color of corner.colors) {
        if (color.colorCoords[0] != 180 && color.faceCoords[0] == 90) {
            cornerSide = color;
        }
        if (color.faceCoords[0] == 0) {
            cornerTop = color;
        }
    }
    // if corner and edge are next to each other
    if (cornerCoord[1] == mod(edgeCoord[1] + 45, 360) ||
        cornerCoord[1] == mod(edgeCoord[1] - 45, 360)) {
        // console.log("corner and edge next to each other");
        let inc = 0;
        while (mod(cornerSide.faceCoords[1] + inc, 360) != cornerTop.colorCoords[1]) {
            inc += 90;
        }
        if (inc == 90) {
            this.rotate("U'");
            // must update cornerCoord since cornerSide is updated (unlike C++, where neither coords change after rotation)
            cornerCoord[1] = mod(cornerCoord[1] + 90, 360);
        }
        else if (inc == 180) {
            this.rotate("U2");
            cornerCoord[1] = mod(cornerCoord[1] + 180, 360);
        }
        else if (inc == 270) {
            this.rotate("U");
            cornerCoord[1] = mod(cornerCoord[1] - 90, 360);
        }
        // if pair points to the right
        const face = cornerSide.colorCoords;
        // console.log(face);
        // console.log(cornerCoord[1], cornerSide.faceCoords[1]);
        if (cornerCoord[1] == mod(cornerSide.faceCoords[1] + 45, 360)) {
            // console.log("pair points to the right");
            this.rotate(CTF[cToStr(face)] + "'");
            this.rotate("U");
            this.rotate(CTF[cToStr(face)]);
        }
        else {
            // console.log("pair points to the left");
            this.rotate(CTF[cToStr(face)]);
            this.rotate("U'");
            this.rotate(CTF[cToStr(face)] + "'");
        }
    }
    else {
        let inc = 0;
        while (mod(cornerSide.faceCoords[1] + inc, 360) != cornerSide.colorCoords[1]) {
            inc += 90;
        }
        if (inc == 90) {
            this.rotate("U'");
            cornerCoord[1] = mod(cornerCoord[1] + 90, 360);
        }
        else if (inc == 180) {
            this.rotate("U2");
            cornerCoord[1] = mod(cornerCoord[1] + 180, 360);
        }
        else if (inc == 270) {
            this.rotate("U");
            cornerCoord[1] = mod(cornerCoord[1] - 90, 360);
        }
        // if white points to the right
        const face = cornerTop.colorCoords;
        if (cornerCoord[1] == mod(cornerSide.faceCoords[1] + 45, 360)) {
            this.rotate(CTF[cToStr(face)]);
            this.rotate("U");
            this.rotate(CTF[cToStr(face)] + "'");
        }
        else {
            this.rotate(CTF[cToStr(face)] + "'");
            this.rotate("U'");
            this.rotate(CTF[cToStr(face)]);
        }
    }
}

///// SOLVE F2L /////
RubiksCube.prototype.solveF2L = function() {
    // console.log(this.blocks);
    const CTF = {
        "90_0": "F",
        "90_90": "R",
        "90_180": "B",
        "90_270": "L",
        "0_0": "U",
        "180_0": "D"
    };

    const colorConv = {
        "90_0": "R",
        "90_90": "G",
        "90_180": "O",
        "90_270": "B",
        "0_0": "Y",
        "180_0": "W"
    };

    for (let i = 0; i < 4; i++) {
        let cornerCoord;
        let edgeCoord;
        let corner;
        let edge;
        let cornerWhite;
        let cornerC1;
        let cornerC2;
        let edgeC1;
        let edgeC2;
        let numRepeats = 0;
        let alreadyInserted = false;

        // console.log("pair:", i + 1, colorConv[cToStr([90, 90 * i])], colorConv[cToStr([90, mod(90 * (i + 1), 360)])]);

        check: while (true) {
            numRepeats++;
            cornerCoord = structuredClone(this.findCorner([180, 0], [90, 90 * i], [90, mod(90 * (i + 1), 360)]));
            edgeCoord = structuredClone(this.findEdge([90, 90 * i], [90, mod(90 * (i + 1), 360)]));
            if (cornerCoord[0] == -1 || edgeCoord[0] == -1) return;
            corner = this.blocks.get(cToStr(cornerCoord));
            edge = this.blocks.get(cToStr(edgeCoord));
            cornerWhite = this.getColor(corner, [180, 0]);
            cornerC1 = this.getColor(corner, [90, 90 * i]);
            cornerC2 = this.getColor(corner, [90, mod(90 * (i + 1), 360)]);
            edgeC1 = this.getColor(edge, [90, 90 * i]);
            edgeC2 = this.getColor(edge, [90, mod(90 * (i + 1), 360)]);
            // console.log("blocks",this.blocks);
            // console.log("cornerCoord",cornerCoord);
            // console.log("corner",corner);
            if (cornerCoord[0] == 45) {
                // console.log("corner on top");
                // cout << "corner on top, ";
                // white on the side
                if (cornerWhite.faceCoords[0] == 90) {
                    // console.log("white on side");
                    // cout << "white on side, ";
                    if (edgeCoord[0] == 45) {
                        // console.log("edge on top");
                        // cout << "edge on top, ";
                        let distance = 45;
                        while (mod(cornerCoord[1] + distance, 360) != edgeCoord[1]) {
                            distance += 90;
                        }
                        // white to the left of corner
                        if (cornerWhite.faceCoords[1] == mod(cornerCoord[1] - 45, 360)) {
                            let face = cornerWhite.faceCoords;
                            // corner and edge top color is the same
                            if (arrEqual(edgeC1.faceCoords, cornerC1.faceCoords) || arrEqual(edgeC2.faceCoords, cornerC2.faceCoords)) {
                                if (distance == 135) {
                                    this.preservePairs(face, true);
                                    this.rotate(CTF[cToStr(face)]);
                                    this.rotate("U");
                                    this.rotate(CTF[cToStr(face)] + "'");
                                }
                                else if (distance == 225) {
                                    this.preservePairs(face, true);
                                    this.rotate(CTF[cToStr(face)]);
                                    this.rotate("U2");
                                    this.rotate(CTF[cToStr(face)] + "'");
                                }
                                else if (distance == 315) {
                                    this.preservePairs(face, false);
                                    this.rotate(CTF[cToStr(face)] + "'");
                                    this.rotate("U");
                                    this.rotate(CTF[cToStr(face)]);
                                }
                            }
                            else {
                                if (distance == 45) {
                                    this.preservePairs(face, true);
                                    this.rotate(CTF[cToStr(face)]);
                                    this.rotate("U2");
                                    this.rotate(CTF[cToStr(face)] + "'");
                                }
                                else if (distance == 135) {
                                    this.preservePairs(face, true);
                                    this.rotate(CTF[cToStr(face)]);
                                    this.rotate("U'");
                                    this.rotate(CTF[cToStr(face)] + "'");
                                }
                                else if (distance == 315) {
                                    face = [face[0], mod(face[1] + 90, 360)];
                                    this.preservePairs(face, false);
                                    this.rotate(CTF[cToStr(face)] + "'");
                                    this.rotate("U");
                                    this.rotate(CTF[cToStr(face)]);
                                }
                            }
                        }
                        else {
                            let face = cornerWhite.faceCoords;
                            if (arrEqual(edgeC1.faceCoords, cornerC1.faceCoords) || arrEqual(edgeC2.faceCoords, cornerC2.faceCoords)) {
                                if (distance == 45) {
                                    this.preservePairs(face, true);
                                    this.rotate(CTF[cToStr(face)]);
                                    this.rotate("U'");
                                    this.rotate(CTF[cToStr(face)] + "'");
                                }
                                else if (distance == 135) {
                                    this.preservePairs(face, false);
                                    this.rotate(CTF[cToStr(face)] + "'");
                                    this.rotate("U2");
                                    this.rotate(CTF[cToStr(face)]);
                                }
                                else if (distance == 225) {
                                    this.preservePairs(face, false);
                                    this.rotate(CTF[cToStr(face)] + "'");
                                    this.rotate("U'");
                                    this.rotate(CTF[cToStr(face)]);
                                }
                            }
                            else {
                                if (distance == 45) {
                                    face = [face[0], mod(face[1] - 90, 360)];
                                    this.preservePairs(face, true);
                                    this.rotate(CTF[cToStr(face)]);
                                    this.rotate("U'");
                                    this.rotate(CTF[cToStr(face)] + "'");
                                }
                                else if (distance == 225) {
                                    this.preservePairs(face, false);
                                    this.rotate(CTF[cToStr(face)] + "'");
                                    this.rotate("U");
                                    this.rotate(CTF[cToStr(face)]);
                                }
                                else if (distance == 315) {
                                    this.preservePairs(face, false);
                                    this.rotate(CTF[cToStr(face)] + "'");
                                    this.rotate("U2");
                                    this.rotate(CTF[cToStr(face)]);                                
                                }
                            }
                        }
                    }
                    // white on the side, edge not on top
                    else {
                        // cout << "edge on side, ";
                        // console.log("edge on side");
                        let inc = 0;
                        let cornerCopy;
                        let edgeCopy;
                        let edgeCopy2;
                        if (cornerC1.faceCoords[0] != 0) {
                            cornerCopy = cornerC1;
                            edgeCopy = edgeC1;
                            edgeCopy2 = edgeC2;
                        }
                        else {
                            cornerCopy = cornerC2;
                            edgeCopy = edgeC2;
                            edgeCopy2 = edgeC1;
                        }
                        while (mod(cornerCopy.faceCoords[1] + inc, 360) != edgeCopy.faceCoords[1]) inc += 90;
                        // if colors line up when corner placed above edge
                        let face = cornerWhite.faceCoords;
                        if (mod(cornerCoord[1] + inc, 360) == edgeCoord[1]) {
                            let increment = 0;
                            while (mod(cornerWhite.faceCoords[1] + increment, 360) != edgeCopy.faceCoords[1]) increment += 90;
                            if (increment == 90) {
                                this.rotate("U'");
                            }
                            else if (increment == 180) {
                                this.rotate("U2");
                            }
                            else if (increment == 270) {
                                this.rotate("U");
                            }
                            face = [face[0], mod(face[1] + increment, 360)];
                            // white to the left of corner
                            if (face[1] == mod(cornerCoord[1] + increment - 45, 360)) {
                                this.rotate(CTF[cToStr(face)]);
                                this.rotate("U'");
                                this.rotate(CTF[cToStr(face)] + "'");
                            }
                            else {
                                this.rotate(CTF[cToStr(face)] + "'");
                                this.rotate("U");
                                this.rotate(CTF[cToStr(face)]);
                            }
                        }
                        else {
                            let increment = 0;
                            while (mod(cornerWhite.faceCoords[1] + increment, 360) != edgeCopy2.faceCoords[1]) increment += 90;
                            if (increment == 90) {
                                this.rotate("U'");
                            }
                            else if (increment == 180) {
                                this.rotate("U2");
                            }
                            else if (increment == 270) {
                                this.rotate("U");
                            }
                            face = [face[0], mod(face[1] + increment, 360)];
                            // white to the left of corner
                            if (face[1] == mod(cornerCoord[1] + increment - 45, 360)) {
                                this.rotate(CTF[cToStr(face)]);
                                this.rotate("U");
                                this.rotate(CTF[cToStr(face)] + "'");
                            }
                            else {
                                this.rotate(CTF[cToStr(face)] + "'");
                                this.rotate("U'");
                                this.rotate(CTF[cToStr(face)]);
                            }
                        }
                    }
                }
                // white on top
                else {
                    // cout << "white on top, ";
                    // console.log("white on top");
                    // edge on top
                    if (edgeCoord[0] == 45) {
                        // cout << "edge on top, ";
                        // console.log("edge on top");
                        let distance = 45;
                        while (mod(cornerCoord[1] + distance, 360) != edgeCoord[1]) {
                            distance += 90;
                        }
                        let rightCColor;
                        let rightEColor;
                        // if cornerC1 is the right side color of the corner
                        if (cornerC1.squareCoords[1] == mod(cornerC1.faceCoords[1] - 45, 360)) {
                            rightCColor = cornerC1;
                            rightEColor = edgeC1;
                        }
                        else {
                            rightCColor = cornerC2;
                            rightEColor = edgeC2;
                        }
                        // colors match on the side when edge is to the right of the corner
                        if (rightCColor.faceCoords[0] == rightEColor.faceCoords[0]) {
                            if (distance == 45) {
                                const face = [90, mod(rightCColor.faceCoords[1] + 180, 360)];
                                this.preservePairs(face, false);
                                this.rotate(CTF[cToStr(face)] + "'");
                                this.rotate("U");
                                this.rotate(CTF[cToStr(face)]);
                                this.rotate("U");
                                this.rotate(CTF[cToStr(face)] + "'");
                                this.rotate("U");
                                this.rotate(CTF[cToStr(face)]);
                            }
                            else if (distance == 135) {
                                const face = rightEColor.faceCoords;
                                this.preservePairs(face, false);
                                this.rotate(CTF[cToStr(face)] + "'");
                                this.rotate("U'");
                                this.rotate(CTF[cToStr(face)]);
                            }
                            else if (distance == 225) {
                                const face = rightEColor.faceCoords;
                                this.preservePairs(face, false);
                                this.rotate(CTF[cToStr(face)] + "'");
                                this.rotate("U2");
                                this.rotate(CTF[cToStr(face)]);
                            }
                            else {
                                const face = rightEColor.faceCoords;
                                this.preservePairs(face, false);
                                this.rotate(CTF[cToStr(face)] + "'");
                                this.rotate("U2");
                                this.rotate(CTF[cToStr(face)]);
                            }
                        }
                        else {
                            if (distance == 45) {
                                const face = rightCColor.faceCoords;
                                this.preservePairs(face, true);
                                // console.log(face);
                                this.rotate(CTF[cToStr(face)]);
                                this.rotate("U2");
                                this.rotate(CTF[cToStr(face)] + "'");
                            }
                            else if (distance == 135) {
                                const face = [90, mod(rightCColor.faceCoords[1] + 90, 360)];
                                this.preservePairs(face, true);
                                // console.log(face);
                                this.rotate(CTF[cToStr(face)]);
                                this.rotate("U2");
                                this.rotate(CTF[cToStr(face)] + "'");
                            }
                            else if (distance == 225) {
                                const face = [90, mod(rightCColor.faceCoords[1] + 180, 360)];
                                this.preservePairs(face, true);
                                // console.log(face);
                                this.rotate(CTF[cToStr(face)]);
                                this.rotate("U");
                                this.rotate(CTF[cToStr(face)] + "'");
                            }
                            else {
                                let face = [90, mod(rightCColor.faceCoords[1] + 90, 360)];
                                this.preservePairs(face, true);
                                // console.log(face);
                                this.rotate(CTF[cToStr(face)]);
                                this.rotate("U'");
                                this.rotate(CTF[cToStr(face)] + "'");
                                this.rotate("U'");
                                this.rotate(CTF[cToStr(face)]);
                                this.rotate("U'");
                                this.rotate(CTF[cToStr(face)] + "'");
                            }
                        }
                    }
                    else {
                        // cout << "edge on side, ";
                        // console.log("edge on side");
                        let inc = 0;
                        let cornerCopy = cornerC1;
                        let edgeCopy = edgeC1;
                        while (mod(cornerCopy.faceCoords[1] + inc, 360) != edgeCopy.faceCoords[1]) inc += 90;
                        if (inc == 90) {
                            this.rotate("U'");
                        }
                        else if (inc == 180) {
                            this.rotate("U2");
                        }
                        else if (inc == 270) {
                            this.rotate("U");
                        }
                        let face = edgeCopy.faceCoords;
                        cornerCoord = structuredClone(this.findCorner([180, 0], [90, 90 * i], [90, mod(90 * (i + 1), 360)]));
                        edgeCoord = structuredClone(this.findEdge([90, 90 * i], [90, mod(90 * (i + 1), 360)]));

                        corner = this.blocks.get(cToStr(cornerCoord));
                        cornerC1 = this.getColor(corner, [90, 90 * i]);
                        cornerC2 = this.getColor(corner, [90, mod(90 * (i + 1), 360)]);
                        edgeC2 = this.getColor(edge, [90, mod(90 * (i + 1), 360)]);
                        face = cornerC1.faceCoords;
                        // if corner is above edge
                        if (cornerCoord[1] == edgeCoord[1]) {
                            // if color1 is to the left of its face
                            if (cornerCoord[1] == mod(cornerC1.faceCoords[1] - 45, 360)) {
                                face = cornerC2.faceCoords;
                                this.rotate(CTF[cToStr(face)] + "'");
                                this.rotate("U");
                                this.rotate(CTF[cToStr(face)]);
                            }
                            else {
                                this.rotate(CTF[cToStr(face)]);
                                this.rotate("U'");
                                this.rotate(CTF[cToStr(face)] + "'");
                            }
                        }
                        else {
                            face = edgeC2.faceCoords;
                            // if color1 is to the left of its face
                            if (cornerCoord[1] == mod(cornerC1.faceCoords[1] - 45, 360)) {
                                this.rotate(CTF[cToStr(face)]);
                                this.rotate("U'");
                                this.rotate(CTF[cToStr(face)] + "'");
                                this.rotate("U");
                                this.rotate(CTF[cToStr(face)]);
                                this.rotate("U'");
                                this.rotate(CTF[cToStr(face)] + "'");
                            }
                            else {
                                this.rotate(CTF[cToStr(face)] + "'");
                                this.rotate("U");
                                this.rotate(CTF[cToStr(face)]);
                                this.rotate("U'");
                                this.rotate(CTF[cToStr(face)] + "'");
                                this.rotate("U");
                                this.rotate(CTF[cToStr(face)]);
                            }
                        }
                    }
                }
            }
            // corner is on the bottom
            else {
                // cout << "corner on bottom, ";
                // console.log("corner on bottom");
                // edge on top
                if (edgeCoord[0] == 45) {
                    // cout << "edge on top, ";
                    // console.log("edge on top");
                    // white faces down
                    if (cornerWhite.faceCoords[0] == 180) {
                        // cout << "white on bottom, ";
                        // console.log("white on bottom");
                        let edgeSide;
                        let edgeTop;
                        let cornerSide;
                        let cornerTop;
                        if (edgeC1.faceCoords[0] == 90) {
                            edgeSide = edgeC1;
                            edgeTop = edgeC2;
                            cornerSide = cornerC1;
                            cornerTop = cornerC2;
                        }
                        else {
                            edgeSide = edgeC2;
                            edgeTop = edgeC1;
                            cornerSide = cornerC2;
                            cornerTop = cornerC1;
                        }
                        let inc = 0;
                        // if corner side is on the right
                        if (cornerSide.faceCoords[1] == mod(cornerSide.squareCoords[1] + 45, 360)) {
                            while (mod(edgeSide.faceCoords[1] + inc, 360) != mod(cornerSide.faceCoords[1] + 90, 360)) {
                                inc += 90;
                            }
                        }
                        else {
                            while (mod(edgeSide.faceCoords[1] + inc, 360) != mod(cornerSide.faceCoords[1] - 90, 360)) {
                                inc += 90;
                            }
                        }
                        if (inc == 90) {
                            this.rotate("U'");
                        }
                        else if (inc == 180) {
                            this.rotate("U2");
                        }
                        else if (inc == 270) {
                            this.rotate("U");
                        }
                        edgeCoord = this.findEdge([90, 90 * i], [90, mod(90 * (i + 1), 360)]);
                        // edge is left of corner
                        const face = cornerTop.faceCoords;
                        if (edgeCoord[1] == mod(cornerCoord[1] - 135, 360)) {
                            this.rotate(CTF[cToStr(face)]);
                            this.rotate("U'");
                            this.rotate(CTF[cToStr(face)] + "'");
                        }
                        else {
                            this.rotate(CTF[cToStr(face)] + "'");
                            this.rotate("U");
                            this.rotate(CTF[cToStr(face)]);
                        }
                    }
                    // white on right side
                    else if (cornerWhite.squareCoords[1] == mod(cornerWhite.faceCoords[1] - 45, 360)) {
                        // cout << "white on right side, ";
                        // console.log("white on right side");
                        let cornerSide;
                        let edgeSide;
                        if (cornerC1.faceCoords[0] == 90) {
                            cornerSide = cornerC1;
                            edgeSide = edgeC1;
                        }
                        else {
                            cornerSide = cornerC2;
                            edgeSide = edgeC2;
                        }
                        // if edge color is on top
                        let inc = 0;
                        let face;
                        if (edgeSide.faceCoords[0] == 0) {
                            while (mod(edgeCoord[1] + inc, 360) != mod(cornerCoord[1] - 45, 360)) {
                                inc += 90;
                            }
                            face = cornerSide.faceCoords;
                        }
                        else {
                            while (mod(edgeCoord[1] + inc, 360) != mod(cornerCoord[1] + 45, 360)) {
                                inc += 90;
                            }
                            face = cornerWhite.faceCoords;
                        }
                        if (inc == 90) {
                            this.rotate("U'");
                        }
                        else if (inc == 180) {
                            this.rotate("U2");
                        }
                        else if (inc == 270) {
                            this.rotate("U");
                        }
                        if (edgeSide.faceCoords[0] == 0) {
                            this.rotate(CTF[cToStr(face)] + "'");
                            this.rotate("U");
                            this.rotate(CTF[cToStr(face)]);
                        }
                        else {
                            this.rotate(CTF[cToStr(face)]);
                            this.rotate("U");
                            this.rotate(CTF[cToStr(face)] + "'");
                        }
                    }
                    else {
                        // cout << "white on left side, ";
                        // console.log("whtie on left side");
                        let cornerSide;
                        let edgeSide;
                        if (cornerC1.faceCoords[0] == 90) {
                            cornerSide = cornerC1;
                            edgeSide = edgeC1;
                        }
                        else {
                            cornerSide = cornerC2;
                            edgeSide = edgeC2;
                        } 
                        let inc = 0;
                        let face;
                        // if edge side is on top
                        if (edgeSide.faceCoords[0] == 0) {
                            while (mod(edgeCoord[1] + inc, 360) != mod(cornerCoord[1] + 45, 360)) {
                                inc += 90;
                            }
                            face = cornerSide.faceCoords;
                        }
                        else {
                            while (mod(edgeCoord[1] + inc, 360) != mod(cornerCoord[1] - 45, 360)) {
                                inc += 90;
                            }
                            face = cornerWhite.faceCoords;
                        }
                        if (inc == 90) {
                            this.rotate("U'");
                        }
                        else if (inc == 180) {
                            this.rotate("U2");
                        }
                        else if (inc == 270) {
                            this.rotate("U");
                        }
                        if (edgeSide.faceCoords[0] == 0) {
                            this.rotate(CTF[cToStr(face)]);
                            this.rotate("U'");
                            this.rotate(CTF[cToStr(face)] + "'");
                        }
                        else {
                            this.rotate(CTF[cToStr(face)] + "'");
                            this.rotate("U'");
                            this.rotate(CTF[cToStr(face)]);
                        }
                    }
                }
                // edge not on top
                else {
                    // cout << "edge on side, ";
                    // console.log("edge on side");
                    // white on the bottom
                    if (cornerWhite.faceCoords[0] == 180) {
                        if (arrEqual(cornerC1.faceCoords, cornerC1.colorCoords) &&
                        arrEqual(edgeC1.faceCoords, edgeC1.colorCoords)) {
                            alreadyInserted = true;
                            // console.log("already inserted");
                            break;
                        }
                        // console.log("white on bottom");
                        const face = [90, mod(cornerCoord[1] + 45, 360)];
                        this.rotate(CTF[cToStr(face)]);
                        this.rotate("U'");
                        this.rotate(CTF[cToStr(face)] + "'");

                        // cout << "white on bottom, ";
                    }
                    // if white on the right side
                    else if (cornerWhite.squareCoords[1] == mod(cornerWhite.faceCoords[1] - 45, 360)) {
                        // cout << "white on right side, ";
                        // console.log("white on right side");
                        const face = cornerWhite.faceCoords;
                        this.rotate(CTF[cToStr(face)]);
                        this.rotate("U'");
                        this.rotate(CTF[cToStr(face)] + "'");
                    }

                    else {
                        // cout << "white on left side, ";
                        // console.log("white on left side");
                        const face = cornerWhite.faceCoords;
                        this.rotate(CTF[cToStr(face)] + "'");
                        this.rotate("U'");
                        this.rotate(CTF[cToStr(face)]);
                    }
                    if (numRepeats >= 2) return;
                    continue check;
                }
            }
            break;
        }
        cornerCoord = structuredClone(this.findCorner([180, 0], [90, 90 * i], [90, mod(90 * (i + 1), 360)]));
        edgeCoord = structuredClone(this.findEdge([90, 90 * i], [90, mod(90 * (i + 1), 360)]));
        // console.log("newCornerCoord:", cornerCoord);
        // console.log(cornerCoord, edgeCoord);
        if (!alreadyInserted) this.insertPair(cornerCoord, edgeCoord);
        // cout << "pair inserted\n";
    }
}

RubiksCube.prototype.sidesWithYellow = function() {
    let numSides = 0;
    const coords = [];
    for (let i = 0; i < 4; ++i) {
        let hasYellow = false;
        for (const [key, value] of this.faces.get(cToStr([90, 90 * i]))) {
            if (value.colorCoords[0] == 0) {
                hasYellow = true;
                coords.push(value);
            }
        }
        if (hasYellow) numSides++;
    }
    return [numSides, coords];
}

///// SOLVE OLL /////
RubiksCube.prototype.solveOLL = function() {
    // cout << "OLL: ";
    const OLLIShape = ["F", "R", "U", "R'", "U'", "F'"];
    const OLLLShape = ["F", "U", "R", "U'", "R'", "F'"];
    const OLLAntisune = ["R", "U2", "R'", "U'", "R", "U'", "R'"];
    const OLLSune = ["R", "U", "R'", "U", "R", "U2", "R'"];
    let OLLMoves = [];
    const isYellow = [false, false, false, false, false, false, false, false];
    let numRepeats = 0;

    repeat: while (true) {
        numRepeats++;
        for (let i = 0; i < 8; ++i) {
            // if is yellow
            if (this.faces.get("0_0").get(cToStr([45, 45 * i])).colorCoords[0] == 0) {
                isYellow[i] = true;
            }
            else {
                isYellow[i] = false;
            }
        }
        let edgesSolved = true;
        let cornersSolved = true;
        for (let i = 0; i < 4; ++i) {
            if (!isYellow[i * 2]) edgesSolved = false;
            if (!isYellow[i * 2 + 1]) cornersSolved = false;
        }
        // if edges solved, solve corners
        if (edgesSolved) {
            OLLMoves.length = 0;
            let sidesYellow = structuredClone(this.sidesWithYellow());
            let yellowSides = sidesYellow[1];
            let dist = 0;
            // yellow face solved
            if (cornersSolved) {
                // cout << "skip\n";
                return;
            }
            // L (1/5, 3/7)
            else if ((isYellow[1] && isYellow[5]) || (isYellow[3] && isYellow[7])) {
                // cout << "L\n";
                // console.log("L");
                let leftSquare;
                if (yellowSides[0].faceCoords[1] == mod(yellowSides[0].squareCoords[1] + 45, 360)) {
                    leftSquare = yellowSides[0];
                }
                else {
                    leftSquare = yellowSides[1];
                }
                dist = leftSquare.faceCoords[1];
                OLLMoves = OLLSune.concat("U2", OLLAntisune);
            }
            // T or U (1/3, 3/5, 5/7)
            else if ((isYellow[1] && isYellow[3]) || (isYellow[3] && isYellow[5]) ||
                     (isYellow[5] && isYellow[7]) || (isYellow[7] && isYellow[1])) {
                // U
                if (sidesYellow[0] == 1) {
                    // cout << "U\n";
                    // console.log("U");
                    dist = yellowSides[0].faceCoords[1];
                    OLLMoves = ["R2", "D", "R'", "U2", "R", "D'", "R'", "U2", "R'"];
                }
                // T
                else {
                    // cout << "T\n";
                    // console.log("T");
                    let leftSquare;
                    if (yellowSides[0].faceCoords[1] == mod(yellowSides[0].squareCoords[1] + 45, 360)) {
                        leftSquare = yellowSides[0];
                    }
                    else {
                        leftSquare = yellowSides[1];
                    }
                    dist = leftSquare.faceCoords[1];
                    OLLMoves = OLLSune.concat("U'", OLLAntisune);
                }
            }
            // Sune or Antisune (1, 3, 5, 7)
            else if (isYellow[1] || isYellow[3] || isYellow[5] || isYellow[7]) {
                let fishHead;
                for (let i = 1; i <= 7; i += 2) {
                    if (isYellow[i]) fishHead = [45, i * 45];
                }
                let isSune = false;
                for (const color of yellowSides) {
                    if (color.faceCoords[1] == mod(fishHead[1] + 45, 360)) {
                        isSune = true;
                    }
                }
                // Sune
                if (isSune) {
                    // cout << "Sune\n";\
                    // console.log("Sune");
                    dist = mod(fishHead[1] + 45, 360);
                    OLLMoves = structuredClone(OLLSune);
                }
                // Antisune
                else {
                    // cout << "Antisune\n";
                    // console.log("Antisune");
                    dist = mod(fishHead[1] + 45 - 180, 360);
                    OLLMoves = structuredClone(OLLAntisune);
                }
            }
            // H or Pi
            else {
                // H
                if (sidesYellow[0] == 2) {
                    // cout << "H\n";
                    // console.log("H");
                    let square = yellowSides[0];
                    if (mod(square.faceCoords[1], 180) != 90) dist = 90;
                    OLLMoves = ["R", "U", "R'", "U", "R", "U'", "R'", "U", "R", "U2", "R'"];
                }
                // Pi
                else {
                    // cout << "Pi\n";
                    // console.log("Pi");
                    let facePhi = [];
                    let phiNoYellow;
                    for (const color of yellowSides) {
                        facePhi.push(color.faceCoords[1]);
                    }
                    for (let i = 0; i < 4; ++i) {
                        let isInVec = false;
                        for (const face of facePhi) {
                            if (90 * i == face) isInVec = true;
                        }
                        if (!isInVec) {
                            phiNoYellow = 90 * i;
                            break;
                        }
                    }
                    dist = mod(phiNoYellow - 90, 360);
                    // console.log("dist",dist);
                    OLLMoves = ["R", "U2", "R2", "U'", "R2", "U'", "R2", "U2", "R"];
                }
            }
            if (dist == 90) {
                this.rotate("U");
            }
            else if (dist == 180) {
                this.rotate("U2");
            }
            else if (dist == 270) {
                this.rotate("U'");
            }
            // console.log("OLLMoves", OLLMoves);
            for (const move of OLLMoves) {
                this.rotate(move);
            }
        }
        // solve edges first
        else {
            OLLMoves.length = 0;
            let sidesYellow = structuredClone(this.sidesWithYellow());
            let yellowSides = sidesYellow[1];
            let dist = 0;
            // I Shape (0/4, 2/6)
            if ((isYellow[0] && isYellow[4]) || (isYellow[2] && isYellow[6])) {
                // cout << "I shape, ";
                // console.log("I shape");
                if (!isYellow[2] || !isYellow[6]) dist = 90;
                OLLMoves = structuredClone(OLLIShape);
            }
            // Dot Shape (NOT 0, 2, 4, 6)
            else if (!isYellow[0] && !isYellow[2] && !isYellow[4] && !isYellow[6]) {
                // cout << "Dot shape, ";
                // console.log("Dot shape");
                OLLMoves = OLLLShape.concat("U", OLLIShape);
            }
            // L Shape
            else {
                // cout << "L shape, ";
                // console.log("L shape");
                for (let i = 0; i <= 6; i += 2) {
                    if (isYellow[mod(i, 8)] && isYellow[mod(i + 2, 8)]) dist = mod(i * 45 + 180, 360);
                }
                OLLMoves = structuredClone(OLLLShape);
            }
            if (dist == 90) {
                this.rotate("U");
            }
            else if (dist == 180) {
                this.rotate("U2");
            }
            else if (dist == 270) {
                this.rotate("U'");
            }
            for (const move of OLLMoves) {
                this.rotate(move);
            }
            if (numRepeats >= 2) return;
            continue repeat;
        }
        break;
    }
}

///// SOLVE OLL /////
RubiksCube.prototype.solvePLL = function() {
    // cout << "PLL: ";
    const PLLUa = ["R", "U'", "R", "U", "R", "U", "R", "U'", "R'", "U'", "R2"];
    const PLLUb = ["R2", "U", "R", "U", "R'", "U'", "R'", "U'", "R'", "U", "R'"];
    let numRepeats = 0;
    repeat: while (true) {
        numRepeats++;
        let PLLMoves = [];
        let cornersSolved = true;
        let oneCompleteCorner = false;
        let completeCornerCoord;
        let completeSideCoord;
        let completeSide = false;
        let completeSideAll = true;
        for (let i = 0; i < 4; ++i) {
            let corner1 = this.faces.get(cToStr([90, 90 * i])).get(cToStr([45, mod(315 + 90 * i, 360)])).colorCoords;
            let edge = this.faces.get(cToStr([90, 90 * i])).get(cToStr([45, mod(315 + 90 * i + 45, 360)])).colorCoords;
            let corner2 = this.faces.get(cToStr([90, 90 * i])).get(cToStr([45, mod(315 + 90 * (i + 1), 360)])).colorCoords;
            if (!arrEqual(corner1, corner2)) {
                cornersSolved = false;
                completeSideAll = false;
            }
            else {
                if (arrEqual(edge, corner1)) {
                    completeSide = true;
                    completeSideCoord = this.faces.get(cToStr([90, 90 * i])).get(cToStr([45, mod(315 + 90 * i, 360)])).faceCoords;
                }
                else {
                    completeSideAll = false;
                }
                oneCompleteCorner = true;
                completeCornerCoord = this.faces.get(cToStr([90, 90 * i])).get(cToStr([45, mod(315 + 90 * i, 360)])).faceCoords;
            }
        }
        // solve edges
        if (completeSideAll) {
            // cout << "skip\n";
        }
        else if (cornersSolved) {
            PLLMoves.length = 0;
            // Ua or Ub
            if (completeSide) {
                let dist = mod(completeSideCoord[1] - 180, 360);
                if (dist == 90) {
                   this.rotate("U");
                }
                else if (dist == 180) {
                   this.rotate("U2");
                }
                else if (dist == 270) {
                   this.rotate("U'");
                }
                // Ua
                if (arrEqual(this.faces.get(cToStr([90, 0])).get(cToStr([45, 0])).colorCoords, this.faces.get(cToStr([90, 90])).get(cToStr([45, 45])).colorCoords)) {
                    // console.log("Ua");
                    // cout << "Ua\n";
                    PLLMoves = structuredClone(PLLUa);
                }
                // Ub
                else {
                    // cout << "Ub\n";
                    // console.log("Ub");
                    PLLMoves = structuredClone(PLLUb);
                }
            }
            // H or Z
            else {
                // H (Ua, U, Ua)
                if (arrEqual(this.faces.get(cToStr([90, 0])).get(cToStr([45, 0])).colorCoords, this.faces.get(cToStr([90, 180])).get(cToStr([45, 135])).colorCoords)) {
                    // cout << "H\n";
                    // console.log("H");
                    PLLMoves = PLLUa.concat("U", PLLUa);
                    // console.log("PLLMoves",PLLMoves);
                }
                // Z (Ua, U2 Ub)
                else {
                    // cout << "Z\n";
                    // console.log("Z");
                    let square = this.faces.get(cToStr([90, 0])).get(cToStr([45, 0]));
                    // align Z so it goes left to right
                    if (arrEqual(square.colorCoords, this.faces.get(cToStr([90, 90])).get(cToStr([45, 45])).colorCoords)) {
                       this.rotate("U");
                    }
                    PLLMoves = PLLUa.concat("U2", PLLUb);
                }
            }
            // console.log("PLLMoves:", PLLMoves);
            for (const move of PLLMoves) {
               this.rotate(move);
            }
        }
        // solve corners first
        else {
            // Headlights
            if (oneCompleteCorner) {
                // cout << "Headlights, ";
                // console.log("Headlights");
                let dist = mod(completeCornerCoord[1] + 90, 360);
                if (dist == 90) {
                   this.rotate("U");
                }
                else if (dist == 180) {
                   this.rotate("U2");
                }
                else if (dist == 270) {
                   this.rotate("U'");
                }
                PLLMoves = ["R", "U", "R'", "U'", "R'", "F", "R2", "U'", "R'", "U'", "R", "U", "R'", "F'"];
            }
            // Diagonal
            else {
                // cout << "Diagonal, ";
                // console.log("Diagonal");
                PLLMoves = ["F", "R", "U'", "R'", "U'", "R", "U", "R'", "F'", "R", "U", "R'", "U'", "R'", "F", "R", "F'"];
            }
            // console.log("PLLMoves:", PLLMoves);
            for (const move of PLLMoves) {
               this.rotate(move);
            }
            if (numRepeats >= 2) return;
            continue repeat;
        }
        break;
    }
    
    let diff = this.faces.get(cToStr([90, 0])).get(cToStr([45, 0])).colorCoords[1];
    if (diff == 90) {
       this.rotate("U'");
    }
    else if (diff == 180) {
       this.rotate("U2");
    }
    else if (diff == 270) {
       this.rotate("U");
    }   
}

RubiksCube.prototype.debugBlocks = function() {
    const colorCoordsStrRev = {
        "90_0": "R",
        "90_90": "G",
        "90_180": "O",
        "90_270": "B",
        "0_0": "Y",
        "180_0": "W"
    };
    let totalBlocks = 0;
    console.log("debugBlocks:");
    for (let i = 1; i < 4; ++i) {
        for (let j = 0; j < 8; ++j) {
            const bCoord = [45 * i, 45 * j];
            if (bCoord[0] % 90 == 0 && bCoord[1] % 90 == 0) continue;
            let block = this.blocks.get(cToStr(bCoord));
            let colors = this.blocks.get(cToStr(bCoord)).getColors();
            console.log("block:\t\t{", block.blockCoords[0], block.blockCoords[1], "}");
            totalBlocks++;
            console.log("S, C, F:\t");
            colors.forEach(function(color) {
                console.log(colorCoordsStrRev[cToStr(color.cCoords())],
                colorCoordsStrRev[cToStr(color.fCoords())],
                "{", color.sCoords(), color.cCoords(), color.fCoords(), "}\n\t\t");
            })
            console.log("\n");
        }
    }
    console.log("totalBlocks:\t", totalBlocks, "\n");
}

RubiksCube.prototype.debugFaces = function() {
    const colorCoordsStrRev = {
        "90_0": "R",
        "90_90": "G",
        "90_180": "O",
        "90_270": "B",
        "0_0": "Y",
        "180_0": "W"
    };

    let totalFaces = 0;
    console.log("debugFaces:");
    for (const face of this.faces.entries()) {
        console.log("face:\t", face[0]);
        totalFaces++;
        for (const color of face[1]) {
            console.log("\t", "coords:\t", color[0]);
            console.log("\t\t", colorCoordsStrRev[cToStr(color[1].colorCoords)]);
            console.log("\t\t", "S, C, F:\t");
            console.log("\t\t", color[1].squareCoords, color[1].colorCoords, color[1].faceCoords);
        }
    };
    console.log("totalFaces:", totalFaces, "\n\n");
}

RubiksCube.prototype.scramble = function(scramble) {
    const scrambleArr = scramble.split(" ");
    for (const move of scrambleArr) {
        this.rotate(move);
    }
    this.moves.length = 0;
}

RubiksCube.prototype.testScrambles = function(scrambles) {
    let total = scrambles.length;
    let numFail = 0;
    let failed = [];
    for (let i = 0; i < total; ++i) {
        // console.log("scramble", i, ":", scrambles[i]);
        let x = [];
        this.scramble(scrambles[i]);
        this.solveCross();
        x.push(this.moves.length - 1);
        this.solveF2L();
        x.push(this.moves.length - 1);
        this.solveOLL();
        x.push(this.moves.length - 1);
        this.solvePLL();
        // console.log(...this.moves);
        if (!this.isSolved()) {
            numFail++;
            this.printMovesDetailed(x);
            this.debugFaces();
            failed.push([i, scrambles[i]]);
        }
        this.reset();
    }
    // console.log("success rate:", (total - numFail) * 100 / total, "%");
    // console.log("failed:", ...failed);
}

RubiksCube.prototype.reset = function() {
    return new RubiksCube("R R R G G G O O O B B B R R R G G G O O O B B B R R R G G G O O O B B B Y Y Y Y Y Y Y Y W W W W W W W W");
}

RubiksCube.prototype.isSolved = function() {
    for (const [key, value] of this.faces) {
        for (const [key1, value1] of value) {
            if (!arrEqual(value1.colorCoords, value1.faceCoords)) {
                return false;
            }
        }
    }
    return true;
}

RubiksCube.prototype.printMovesDetailed = function(x) {
    console.log("Cross:");
    for (let i = 0; i < this.moves.length; ++i) {
        console.log(this.moves[i]);
        if (i == x[0]) {
            console.log("F2L:");
        }
        else if (i == x[1]) {
            console.log("OLL:");
        }
        else if (i == x[2]) {
            console.log("PLL:");
        }
    }
}

////////// HELPERS //////////
// returns positive mod
function mod(x, y) {
    return (x % y + y) % y;
}

// converts coordinates to string for map keys
function cToStr(arr) {
    return arr[0] + "_" + arr[1];
}

// converts string key to numerical coordinates
function strToC(str) {
    const strArr = str.split("_");
    return [Number(strArr[0]), Number(strArr[1])];
}

function arrEqual(arr1, arr2) {
    return arr1.length === arr2.length && arr1.every(function(value, index) { return value === arr2[index]});
}

// let cube = new RubiksCube("R R R G G G O O O B B B R R R G G G O O O B B B R R R G G G O O O B B B Y Y Y Y Y Y Y Y W W W W W W W W");

// let cube = new RubiksCube("R B Y O G Y B Y W B G Y Y R O W G W G O O B B O G R G Y R R G W W B B W Y B O R G O R G W O Y W B R R O");

// let cube = new RubiksCube("G B R W O B R Y W O B R R R G O G O W O R B B G G W W B Y W O G Y B R O O G Y Y B G W Y R R G B W O Y Y");

// let cube = new RubiksCube("Y G W B G W G R G Y O O B R Y O G G R O R Y B O W Y Y R O Y B B O W B R Y O W R W R W G B B G O W G R B");

let testRotate = [
    "F",
    "F'",
    "F2",
    "B",
    "B'",
    "B2",
    "L",
    "L'",
    "L2",
    "R",
    "R'",
    "R2",
    "U",
    "U'",
    "U2",
    "D",
    "D'",
    "D2",
    "F2",
    "B2",
    "L2",
    "R2",
    "U2",
    "D2"
]

const set1 = [
    "F2 L' B2 L2 F' D B2 F D' L D' R2 L' B2 L2 R D B D' U2 R2 L' B L2 F'",
    "F L B2 R B' D2 F' B2 U B D' U' B' L2 D' U L D F R2 L' D' F2 R D2",
    "F' R' F R D' L D' L F2 R' U2 D' R2 U' D2 B2 L' F L D L2 R' B L2 B2",
    "R D B' D U' R2 L F U2 F' D' R' B' L' U R2 B2 D' L2 U2 R' L D F L2",
    "R2 L2 F' D' L' F2 D' U2 R2 D2 B2 U' R D2 U2 L U2 R L' F L2 F D L2 F",
    "D2 L' U R' B F' L D' U' F2 D2 L R' F2 L' B2 R2 D2 U B D' B2 L2 U' F",
    "F2 B L' U' D2 B' D R2 B2 L R2 U' B' D2 B2 R F' B2 U L' D' R2 U R L'",
    "R F' U2 F2 L' D F2 B' U R B' F' U2 L F D B F' D' U' R' F' L2 U F'",
    "U R' F2 U' L2 B' R2 U L F2 D R2 B' D F' L U B F U' D L D L U",
    "U2 R2 D F' L B' U' F' D' R B D2 U' F R' F' U2 F' U' D' F D2 R' F2 R'",
    "F2 D' R2 F U2 F U D L' R2 D2 L2 F R F2 L' U R' D' U' R' B' D2 F' B2",
    "R F' U2 R2 F L2 D' F R' D F R2 U' D' B2 R' U L' R2 U2 R' B U2 L U2",
    "B U2 F D' B2 L2 U' F B R2 U2 L R' U2 B2 U2 B2 L B' R2 U2 R' U2 L' B2",
    "F' U' D' R U2 L2 D R' F2 R' U F' B' D L2 B2 D2 R' L D F2 D' B F D'",
    "D2 L U' D2 L2 U' F' B' U' L' F' B' R2 F' D U' B F' R L U L D U' L",
    "B' R2 B2 R F' B U' F' U' L D R' U2 F2 B' U' R' L' B2 D' L2 R2 D2 F R2",
    "F U D' R B' F2 L2 U2 B2 U' L' R' U2 B' D2 F L2 R' U' B F U' R2 F B'",
    "U2 L2 F D' B2 U' D2 R' L D' L' U2 R' U' L U2 L2 D2 U2 F' R' L' D' L D2",
    "R2 U2 L2 B R' B2 U' L' R2 D' B D U B2 L2 R2 U2 D B2 L2 U B2 U L2 D2",
    "L' D F R' B2 F' U2 L2 U L2 U' B2 U R' U2 D L2 D2 F L R' D L B2 R'",
    "D2 R L' F' L2 U' R2 D L2 U L2 U B U F2 U2 D' L2 U' F R2 F2 U' B' L",
    "D R' D2 R' D F2 L R' F' U D2 F L2 B2 U2 B R' F2 R D' L R U L2 F",
    "L' R F R2 F U' L2 D R' B R2 B' U2 F' L F L U2 D R' U' B' F R2 D",
    "U2 F2 U' L2 U F2 L' B R' F' L2 D2 B U' F2 D' U' B2 F D2 L2 D' F B2 R",
    "R' F' R' L2 F2 B' D U2 R' U B' F D' R' D' B' R F2 R' B2 F2 D' R' L' D2",
    "L' F U R F2 B2 L' R2 F' B' U2 R L' B' D' F2 D2 R' F2 L' B F' U D2 R'",
    "L' U' D B2 L B U L B R' F2 D R' F R2 D2 U F2 B' R F L2 R' F' U",
    "U2 L B L' U2 F U' D L2 R2 D' L2 F B' R2 F D F2 D R2 L B L B2 D2",
    "B2 L B L F' B D L2 B2 L R F B2 U' L2 U' F' L2 B' D' F' D2 F' U2 L2",
    "L R2 D2 F2 L' D2 F2 L D R2 L' B2 L2 B L' D U R U2 R L U2 B L B'",
    "B2 L' D2 U2 B2 F' U2 L' B D2 F' U' F D F2 L F' R2 L' U' R' U L2 R' U",
    "D' B L2 B2 D' L2 U L U' L B' L' R U2 B F D' U' R B' U2 R2 L F' U2",
    "F2 U R2 B2 R2 L' F L' B2 F' L' B' U' F R B2 L2 D2 B2 F2 L D2 R' D F'",
    "L2 B2 D2 B' F2 D' U2 B F' L2 U2 L2 B L2 R U R U' L2 D' B' R2 U' D2 L'",
    "B D2 L D2 B2 L D B U2 B L2 D' L D2 B2 U2 B' L B F D' F2 L' R' B2",
    "L2 U2 D2 L' D2 F' U F2 L U' R L B2 U2 L2 D' B' D' F' R' D' F' D2 F R",
    "D2 U F' B R' L2 D F B U' F2 B2 L2 D' F L B D2 U' B D2 F D' L F2",
    "L F2 D B2 F L' F D U' L2 U2 L' B' R F' L2 U L' D' R2 U2 R2 B' R L'",
    "L F' D' B U2 R2 B' F2 L U L F2 U D F2 B2 R2 U D2 L' D2 F' L F D'",
    "F2 B2 U F R B2 U' B' R' F B L' D U2 L R D' R' D F' D' L' D R F2",
    "R2 L' U D2 F' L' D' L R' F R D' U2 L B R B' D U' F' R F U' B U",
    "U B' F U2 B2 D' L2 R U D' L' U2 R2 F2 U2 L2 B2 L B2 U' B2 R' F2 U' B'",
    "D' L2 U B2 U B' R' D B' U2 F D2 U' F2 L D2 U2 L' F U' D2 L' U2 R D2",
    "R B D2 B' F' R' L F' U R' U' B2 U' F' R2 B2 F L2 D2 R2 B2 D' R2 D' B",
    "D B U D2 F2 B2 R' F2 B' R D2 R L2 U' R2 B' F2 U2 R L D2 U2 B' F' L2",
    "B' U B2 U L R' D' B' U2 D' L2 F' U D2 R D R2 L U' F2 R' F U' B2 R'",
    "B' R L2 F R2 L2 U B L' R F D' U' R L2 U2 D F B U R F' U L2 B2",
    "F2 R D2 L' D B2 U' R2 U F' U2 F' L2 R' B2 L' D L2 F B' R L2 D F L2",
    "R2 F' U' D2 R2 F R L' F U' R' F2 B2 U B' U R2 U B2 F2 D' L D L' D2",
    "U' B' L2 R' D2 U F U' D2 F D L' F L' U' R2 F2 D' U' R2 L' D F U2 L",
    "B R' L' B2 L' D2 R' B R2 L' F2 U2 L2 R2 B R2 U2 D B D F2 D' F U D'",
    "D2 R2 D2 B' R' D F B2 D R2 D2 L2 D' B2 R2 D' L' U B D F U B2 L R2",
    "D' L2 D2 U2 F L2 R' F2 B' D U F D' U' B2 L2 D' U' B U B R2 U L D'",
    "L2 D2 F' B' L' F D' B2 L2 B R U' D2 R' D R U F L2 U D' L F2 L D2",
    "U' L' F2 R F' B' R2 L' F' D R2 L' U' R B2 U2 B2 U2 L' D' B' F' U R F'",
    "R U' B' F' R2 U' L2 B2 F2 R L2 U' F' R2 B2 U2 B F2 L D U2 B2 U' D F'",
    "F' L B' L R D R' B' D2 B U B' L' U L F L' F U' L F' D2 R2 F U",
    "F' L D B D2 F D U L2 U2 R' F L2 R2 F2 R L' U' F2 L' F' L2 U R' B'",
    "R' D2 L F2 U' D' F2 U2 R' D B2 L2 F' B L D' F' L2 D' U2 F' R2 L2 U' D2",
    "L U2 D2 R2 U2 B' F U' D2 R2 F R2 L' U2 D' R2 U2 B F R' D L D2 U2 B'",
    "L R2 D L2 R2 U' D' R2 B L2 F2 U2 R L B2 L R U' D2 F L' D2 L' U2 F2",
    "B2 U' D' R' L B L' B L2 D2 R L2 U' B U2 B2 F' R U' L' R' U2 B2 D2 U",
    "U B' U L' R' U' B2 L B U2 L B2 D U L2 U' B2 U2 R2 U F2 B' L' F D2",
    "B2 U2 B F' U F2 L U D2 R2 U' D' R2 F L U' B2 R L' F2 U2 L F2 B' D",
    "B U' R' F2 R D U R' F2 B2 D F' L B' F' U L2 D2 R L2 F D2 B' L F'",
    "D' B2 R2 F D' R F2 U' L' U R D' U2 R' F' B2 R2 D' U R' F2 D' F2 L2 R'",
    "U B' R D B' D' L' D2 F R2 B' R' L D U' F' B' D U L R' F B D R2",
    "L2 B' L' B R' L2 F' R L' U F2 B U2 D' R' U' R2 L2 U' R' L2 U2 L' R' U'",
    "L B R' U B2 L D2 L' D2 U2 F2 R' F U' R' F2 L' U2 L B L2 D' B D F'",
    "D2 L U' F2 B' L D2 B2 R' F' B2 U2 B' R L F2 B U D R2 U2 D2 R D2 B",
    "R U' R2 D' U B2 F2 U2 B D U F D L' R2 B' R F U' L R' D' R' B F",
    "R' F' D B L R' B U' D2 B2 F2 R' D' L2 F L' D B' R2 U' L' F' B2 D2 L'",
    "L R2 U' D' L2 R2 D' L' D' L2 U2 L B' R D' B' D L' R' F' B' D B2 L2 F'",
    "B' R2 B' D' U' L B2 F U' L U R' U D L2 F' U' D2 B' D L' R U' B L2",
    "D U F B2 D L U2 R F' B L2 U2 B2 R2 D2 F2 U' B' L' R2 B L2 R F L'",
    "F2 R2 B' F L2 B F' D2 B2 R B2 L F2 R F B2 D' R' F' R2 D B' F D' R",
    "U F2 L' D R D U2 R' U2 L R' F2 U' D' R' B R D2 R D R D B' F D",
    "F D B' L F2 L U F2 L F L' F2 R2 B2 D' L B2 D2 L R D L F2 D' R'",
    "U2 F' U' L' B R L U F2 R' D B' R L D R D U L D R2 D2 F' U2 D2",
    "U2 L2 R2 D L F2 D B' R U2 B' D L2 D2 L' U F U' D' R F2 L F2 U D",
    "U R2 L2 B' R' B R' U' F2 L2 F2 B2 U2 B U' B' D F D U' F U2 L' R2 U",
    "R U2 B D' L F2 U' B2 R2 D' R2 L2 D2 L' D U F2 R L' F' L2 F2 R2 F' U2",
    "U' B L' R' D' U F' U' F' B2 L2 F2 U' L2 D2 B R' L' D U L' D2 U R2 L'",
    "L' U2 F U' F2 B R D' U F L F' L F B U F R D F D R' D' L R'",
    "R' F' R2 L' F2 B L U D F' D2 F' D' U2 B R2 D2 U B D' L U D B' R",
    "B' L2 U2 R2 L' B' U L' U' F' R F' U2 D L2 B2 D R2 B' D' F R2 B' R' U2",
    "D2 B D F R2 L U L R' U D2 B D2 F' D2 F D L U' R' B2 U R' F2 D'",
    "D R D' U' R U F' U' F2 D2 R2 L' U2 F R2 L' F' D2 U2 L2 D2 R' U2 L2 R2",
    "U R F D2 L B R2 U2 F2 L2 R B2 U' D' L D L2 R' U2 B2 D' F D U2 F'",
    "B' R D2 R' L2 B' F2 L D B F U2 F2 B' R F' L2 D' R L' B' U R' L F",
    "D2 B' D2 U' F2 R' D' L2 U D2 F D2 B R2 D2 L R2 F B2 U B2 U2 R B R2",
    "B' R U B' F' L' U B2 D L2 F' L' F L' D U R L U D B' F' U F2 U2",
    "U2 B' F' R B R' D' R' D2 R' U F2 R' D2 F' L' U D2 L2 D' F2 D B2 L U",
    "R D L B F2 R' D2 R U2 R' B2 F' U F' L' U2 L U2 D F' B' L D L U",
    "B2 L2 F2 L D2 R U2 F B2 R' F' B L' B' L' F' B' R2 F' D R L U2 L D2",
    "D' B' U2 R' D' U2 R B' L' B L2 F B L2 F2 B L F2 B2 U F2 D2 U2 R2 U'",
    "F2 U' B2 U2 D F' L' R D2 U B2 F2 R D2 B L D' U B2 U2 D' B2 R' B2 L",
    "R' D U F L' F U2 F2 R D' F L2 F2 D' F2 U' B' R F' R' F' R' D L2 F2",
    "L U2 R2 B' R' B2 U' R B' R2 D R' U2 B F2 D L' B U R2 L F' L' B U",
    "D2 L F2 B2 L2 U B' R B2 L2 U' B' D B' L2 R' F L R' D2 U' F U B F2"
];

const set2 = [
    "B' F D2 F B' U D2 B2 F L2 F2 R F' L' F' R U L D2 F' L2 F L2 B' F",
    "D' L2 F2 D2 R2 F B' L F' U' L F2 D L F' D2 L2 U' B2 L D' F D U' F'",
    "B R D' R2 B U F' L U2 D2 B D F B2 U2 D' B2 D2 R L' F2 D R U2 B",
    "U B2 F U' F' L R' D B F' U L U' D' L' F' L2 B' U' D' R2 U' R' U' D'",
    "F B' U2 D' F B' L' U F2 U' D2 F' R D R' F2 L D2 U' F' D2 L U' B' U",
    "F' L U B R2 U2 F2 U' D2 R2 B D2 L B2 D2 U2 R' B2 D' R B' L2 B D2 R'",
    "R F L' D' F' L' F' L' B R2 D2 U2 B2 D' U R' F' R2 U2 D2 R2 U L U2 R2",
    "B' R U' B U L2 B D B2 R2 F' L' D2 U2 F2 B D2 L U B2 D2 R2 D2 L2 B",
    "U D2 B2 L2 F R2 F2 D' U2 L2 U' F U' F B L U D2 R' B' F R' D2 R' U2",
    "F U2 D' B2 D' B R' U' B' F D U2 L2 B R' D F U' R' B2 D2 R' L' D R",
    "L' R B U' F2 D L2 B' F2 R2 F L' B' L2 U2 F' B2 D2 F2 R2 B' R' F D' F'",
    "R2 L2 B2 F R L' F' R2 B U L B' U D' L U' R' B2 R' L2 D F D F' D",
    "D' U2 L U2 B2 L2 U2 B' R D2 L' B' F' L2 D' U F2 L' F B' D F' U2 B2 L'",
    "B' D' R B R L U' B U' D2 R U' R D R' L' U' D B L2 R B2 L F' B",
    "D' R D2 R2 U2 F2 L2 F2 D2 U2 L D B' L' U B2 L' U2 D F' R D R F U'",
    "R2 D B' L' R2 B R' B U2 R' U' D' B' U' F R B D2 B2 U2 F2 B' D F D'",
    "R D2 R' F' R2 B' D' F L2 F2 U' D L R F' B' U L2 R U R2 F2 L U2 R",
    "D' U' L' U2 F2 D' R2 F2 L' B' R2 D U F L' B' U' R2 U R' D U R2 L D'",
    "F2 R D R U2 D' B2 L' B' U2 R D' L U' L F B2 R D2 F' U2 B L2 R2 D'",
    "R2 F' B' R D U' L U D' B2 F' R' L F2 L F L' B F' L' U' D' L R' F'",
    "L' D' L' R' F R' B2 U2 R' F' U B' F L' D F U D2 L2 R2 D' B' F2 L2 F2",
    "L' U L U L2 B U2 F U' B' U F2 R2 F2 D' R2 U2 L2 D F L2 F2 L' B R'",
    "B R2 U2 D2 B2 F' R L2 U2 B2 D2 F2 L' U2 D R' D R F' R2 U' D2 B' U F",
    "R F' B' L' F' U D' B D L' R' U L' R F' R' B2 D' U' B' F2 D' L2 R' F",
    "R2 U2 D R L' B2 R2 U' F R' U' D2 L2 R F U2 R' B' L2 U2 R' U2 L U2 B'",
    "F L' R' F2 B' U B2 F' L2 R U2 F2 L R F2 B2 L2 U B' D2 U F' R' B' L'",
    "U D' L2 D2 U B L' B2 F2 D B2 L' F' D' U' R2 L B D2 U R F2 L' R D2",
    "U2 L F B D2 F' D2 U' R U' F' B' L R' F U' L2 F' R' B' R' B L' F' D'",
    "D R' U' R2 L2 F' L2 D U2 B2 D2 B' R2 U' L2 D' L D2 U' B U L D' B' F2",
    "R D U' R2 U F' D' L' F L' R D2 B' R' D2 F2 B2 R L2 F B R F B' D'",
    "R' D L U B2 U D L' U' B F2 L B R2 U' D F L D' F' L' B L F2 U2",
    "D F R2 U2 F' U D2 B F2 U B R U' R U2 B' F' D2 R2 F R U' D R F",
    "L D' L F' L' R F' D2 L2 B U L2 D' B R2 F D' B' D B' D2 R2 F' L F'",
    "F B2 R' F' R' F L D L F' R' B L' R' B' F' U D' F' U R' L' B2 U L",
    "L2 F B' R D' L2 F L2 D' U' R L2 U D2 B U D B R B U B2 F2 L' B2",
    "L' R2 F R B2 F U' R2 D' U B2 U2 L U B' U' L D2 F B2 R' B F2 U' B2",
    "B2 F2 D U2 F B' R L2 U2 D2 B2 R' D R2 F2 L' B' F2 D F' L R' U2 R U",
    "D U' R2 D2 R L2 F' R' B' U' D R D2 R U L2 D' L D' F R' B2 F' D2 L2",
    "D R' F2 D' R2 D U B R U R2 B D' U2 B2 L' D2 U' R L U2 L U' F2 D2",
    "L' D L R' B' L' U' R L D' F' R' F R' B L2 B' F U2 R2 U2 L U2 R2 B'",
    "L U' R B' D' F2 B R2 D B R' L2 F2 B D2 R' L' U' B' D' R' B' F2 R' F2",
    "U L B' F L2 F' L2 F R2 F' U2 B' F' D' R L F L D U2 R2 U2 F' B' D",
    "L D B' D2 F2 R' D' U' B2 F' D' B' R' F D2 U L2 B U2 F' D R D2 L F",
    "F R F' D' B' L F' D' U R2 B2 F R2 F R' L U2 F D2 L R2 D2 F R' D",
    "R' D B F2 L U L D' R2 U' B2 L R F2 L2 U' F U' D L2 F R L2 B F2",
    "U B' U2 B2 R' F D2 F' R' U' D R2 F2 B2 D2 L' U B' F R2 B2 U' R' D2 F'",
    "R' B' R' F2 R' F' B D2 L D' L D2 U F B2 R2 D F U F' D U2 F' D' B'",
    "F U' L' U L' D' F B2 D' B' F2 L U R L2 F' L2 R2 B' L' D2 B' F D' F2",
    "B2 D B' F' D' U L2 R' D2 U' B2 U' D2 B D L2 D' U R D2 B2 R U D2 B2",
    "D' B L2 D' R L2 F2 D2 B F R2 B U2 B L U' F D' F' U' R U2 R2 B D2",
    "D' L2 D B' D2 R F L' U' D' R F2 D B D' B D2 L2 B D R D' F' B R'",
    "L' B D R D' L' B U R U' D2 R F D2 L' R2 B' R B F D F' D L F'",
    "B2 F L D2 B' U' F U' D' F2 B D2 U2 L' R B2 D2 F' U' R L' F D' U R",
    "D2 R2 D F' L D' F U R2 U F2 R D2 B' U R' L D R2 U D2 B2 U2 R L'",
    "F2 R U2 B R D2 R' B F' U' D' L2 U' D2 L R' D' B2 D' R' U2 L D B2 D2",
    "F' R2 D R B L2 U2 D R' F2 D' U R L' B2 L2 F L' B D L2 F U2 B2 U'",
    "D' L' F' D2 U2 F R D R2 B L2 U L F2 R2 B D2 B2 F2 L B' F U2 D R2",
    "R' F' D U' L B' R B' U D L2 U B2 L2 F' U2 F2 B U F U' R' B' U R'",
    "B' U' L2 R2 F D' F2 L R2 U2 B D B F2 D2 F' D2 F' B2 U' R' U F' U2 F2",
    "F B L U R2 F' D2 U L2 U' L' D L' B2 D2 F2 U2 F' U' D2 F' B L D2 F",
    "R U D R' L' U L U' R' F R' L' U' L' B' R F2 U L2 R2 U2 R2 U2 R' D",
    "R D' F D R U' R F2 R L F B2 R' F2 B U2 R2 D R F' U R2 L2 U R",
    "F' B' R2 D' B2 U L2 F' L' F R2 U D F L' B' R' D F B' D2 F' D' R2 B'",
    "B' R' D2 R' L' D L U' F2 D R L2 F' B' D U' B2 D R' L D F' D2 U L",
    "B R2 F2 L2 F2 U' D2 R L2 U2 D2 F R D F2 R U' L2 U2 R2 F D2 F' D L'",
    "B F R L B' F2 U2 B' L' F2 U F B' D2 U' B' F L R2 D2 L R2 B2 D' U'",
    "F' L2 U' L F L' D2 R L' D2 L' F B2 U' R2 D' B' U2 D' B2 R2 B' U' F D",
    "F R' U2 R2 B' L R2 D B F' L2 U' L D2 F2 U' R' D2 U B U F' R B' R",
    "L2 B' L' R D2 R' B' U' D L' B L R F' U' B L U2 L' U2 L U D2 F' R'",
    "F U F' U' D F B' U2 L2 F' U2 F' D L' R' F' L' B' R2 D R U' L' D L2",
    "L2 B2 R F D2 F' U R2 B R' D R L2 U2 R F' L' F' R F2 U R' U' F' L2",
    "U B U' L D2 F2 U L U L2 B' L' R F' D' R U2 D R' F2 D U F' D' L'",
    "U R L U' L D2 R2 B' F' L' B2 R2 F2 B2 L' R' F R2 F2 B' R' F' D2 B' U'",
    "B2 L U2 D' F' R U2 B2 U L D' U' B R' F' L' R2 B D' R U2 R U F U",
    "R' B U L2 U2 R' B U B2 F2 D2 R2 F' R F' D' L' B' F2 L2 F L' U' R2 D",
    "D U B L2 D L2 F U D' F R D U L2 D' B' D2 R D R B' D' U2 R2 D2",
    "L' U F' D2 U F' B D2 F U2 D L' D2 R' D2 L2 U2 D2 F' U' L' B D R D'",
    "D2 F B2 D2 F2 B U R' D2 L D' L2 F' R' U B F' R L' F L' B L' R2 B'",
    "U' L2 D R2 F D L B2 R' B F R2 D2 F L2 R U' R L D' U2 F' U D F2",
    "D' U2 B2 D' U2 F' R2 L2 F2 D' U2 B' L2 F2 R2 B' L F2 B' R2 D F R' B2 U'",
    "U2 B2 D' U' L2 U2 L B' U' L R U' B U' L2 D2 R2 F L F' B2 D B2 D' B2",
    "B' L2 D U2 R2 F' L' R U2 L2 R U2 L2 D2 R' L' B F R D2 U2 F' U2 B' R2",
    "R2 D2 U R' L2 D B2 F2 R B' U R' B' L F' U2 F' L R2 B U D' F2 U' D'",
    "F2 R2 B2 F2 R L F2 B' R' D2 U' R2 F' B' R F U' F' D' L' D2 L' F2 L2 F'",
    "R' L2 B2 F D U B R' B' F' D' R' F' D' B' R' F' U L' R' U' R2 U2 D' F2",
    "B' L2 B' D' U L2 B D2 R2 D' U2 F' U' L2 F2 R2 U' B' D2 R' B' D B2 R' F'",
    "U' R' L F' U L2 B2 F2 D' R B' L' B2 L' U2 B' D' B2 U' L' U2 B2 D B' D'",
    "R B2 R2 D R' L' D2 F2 B U2 B U R2 L' U2 F B' D2 L D R F D F' B2",
    "F' L' F' B D U L' D2 F L U2 B2 L' B2 R' L2 U2 L' B2 R2 L' D2 R L2 F",
    "L B2 F L2 U F U' D2 L' F2 D' F D2 R2 F B L F B' D' R2 L' U F2 B",
    "F' B2 D2 F2 R' D2 U2 L2 R2 U2 R2 D' F' D2 L B' F2 L' B2 R F U2 F L U'",
    "U D' R D2 L2 U' F D2 R2 L' F' L D F L2 U2 L D' F D F' L' U' R F2",
    "U2 F' B L' D2 R2 U2 D2 L R B' R2 B2 U2 B2 R2 B D2 F' U' R2 B U' R2 U",
    "F' U2 B' U' R' U D' B' D' B' U' D' B2 U' R' B2 U D' R F2 R B' F2 U2 L",
    "D L B L' R U2 B L' F R2 L2 U L2 F L' R' F2 B2 D' U' F' U' F2 B' U'",
    "B' F2 U B' F D F' U' F' B2 R2 D2 F2 R B' F' L2 B R B2 D' B D F2 D",
    "U' B' D R2 U2 B2 F' R2 L B' F2 D L F L2 R' D2 U L D' R2 L F D' L",
    "B L2 D2 R F2 B U' L D2 U' F D' U L2 B' D2 B2 D2 R D' U2 R2 L2 D R",
    "B2 U D' F2 D2 B2 U2 D2 L' F' L' B2 R2 D B F' R' U' L' U' B2 D' L D2 F'",
    "U2 R L B2 R' B L' R2 U2 F' R U2 L U D2 L' B' U2 R U' L2 U' F L2 R2"
];
// for (let i = 0; i < testRotate.length; ++i) {
//     cube.rotate(testRotate[i]);
// }

// cube.prletDebugBlocks();

// const failed = ["R F L' D' F' L' F' L' B R2 D2 U2 B2 D' U R' F' R2 U2 D2 R2 U L U2 R2"];
// cube.testScrambles(set2);

// cube.testScrambles(set2);
// cube.solveCross();
// cube.solveF2L();
// cube.solveOLL();
// cube.solvePLL();
// cube.debugFaces();
// cube.debugBlocks();
// console.log(...cube.moves);
// cube = cube.reset();
// cube.debugFaces();

// D R D' U B' R B D L D' D2 R' D2 F U R U' R' F' U F R U R' U' F' U F U R U' R' F' R U R' U' R' F R2 U' R' U' R U R' F' R U R' U' R' F R2 U' R' U' R U R' F'

