#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <cstring>
#include <utility>
#include <map>
#include <sstream>
#include <cmath>
using namespace std;

// 2022/05/16

/*
- 6 3x3  matrices, one for each face
    - class Color, which stores string color, int x, int y, Block* ptr
- front is red, right is green, top is yellow
- have a 3x3x3 matrix representing the cubes
    - x, y, z coordinates ranging from [0, 2]
 
*/
// scrambleCube1.txt:
// F2 L' B2 L2 F' D B2 F D' L D' R2 L' B2 L2 R D B D' U2 R2 L' B L2 F'

// F L B2 R B' D2 F' B2 U B D' U' B' L2 D' U L D F R2 L' D' F2 R D2

// F' R' F R D' L D' L F2 R' U2 D' R2 U' D2 B2 L' F L D L2 R' B L2 B2

// R D B' D U' R2 L F U2 F' D' R' B' L' U R2 B2 D' L2 U2 R' L D F L2
// R2 L2 F' D' L' F2 D' U2 R2 D2 B2 U' R D2 U2 L U2 R L' F L2 F D L2 F

class RubiksCube {
private:

public:
    class Color {
    public:
        Color(const pair<int, int> &sIn = {}, const pair<int, int> &cIn = {}, const pair<int, int> &fIn = {}) : 
            squareCoords(sIn), colorCoords(cIn), faceCoords(fIn) {}

        pair<int, int> getSCoords() {
            return squareCoords;
        }

        pair<int, int> getCCoords() {
            return colorCoords;
        }

        pair<int, int> getFCoords() {
            return faceCoords;
        }

    private:
        // spherical coords, should match with parent block
        pair<int, int> squareCoords;
        // color pair represents spherical coords of that face
        pair<int, int> colorCoords;
        pair<int, int> faceCoords;
        
        friend class RubiksCube;
        friend class Block;
    };

    class Block {
    public:
        Block(const vector<Color*> &cIn = {}, const pair<int, int> &bIn = {}) : colors(cIn), blockCoords(bIn) {}

        vector<Color*> getColors() {
            return colors;
        }

    private:
        vector<Color*> colors;
        pair<int, int> blockCoords;

        friend class RubiksCube;
    };
 // RubiksCube(map<string, pair<int, int> > &colorCoords, string &map) : moves({}) {
    RubiksCube(string &faceMap) : moves({}) {
   
        map< string, pair<int, int> > colorCoords = {
            {"R", {90, 0}},
            {"G", {90, 90}},
            {"O", {90, 180}},
            {"B", {90, 270}},
            {"Y", {0, 0}},
            {"W", {180, 0}}
        };

        string cLetter;
        pair<int, int> sCoords;             // coords of square
        pair<int, int> cCoords;             // coords representing color
        pair<int, int> fCoords;             // coords of face

        istringstream is(faceMap);
        // 3 layers
        /**/
        for (int i = 1; i < 4; ++i) {
            // 12 squares / layer
            vector<int> jValues = {0, 1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 0};
            for (int j = 0; j < 12; ++j) {
                sCoords = {45 * i, mod(315 + 45 * jValues[j], 360)};
                is >> cLetter;
                // ignore center squares
                if (sCoords.first == 90 && sCoords.second % 90 == 0) continue;
                cCoords = colorCoords[cLetter];
                fCoords = {90, 90 * (j / 3)};
                Color color(sCoords, cCoords, fCoords);
                faces[fCoords][sCoords] = color;
            }
        }
        
        // top and bottom
        /**/
        for (int i = 0; i < 2; ++i) {
            for (int j = 0; j < 8; ++j) {
                is >> cLetter;
                sCoords = {45 + 90 * i, 45 * j};
                cCoords = colorCoords[cLetter];
                fCoords = {180 * i, 0};
                Color color(sCoords, cCoords, fCoords);
                faces[fCoords][sCoords] = color;
            }
        }
        
        // initialize blocks
        
        pair<int, int> bCoords;
        for (int i = 1; i < 4; ++i) {
            for (int j = 0; j < 8; ++j) {
                bCoords = {45 * i, 45 * j};
                // skip center blocks
                if (bCoords.first % 90 == 0 && bCoords.second % 90 == 0) continue;
                vector<Color*> colors;
                // corner blocks
                if (bCoords.first % 90 == 45 && bCoords.second % 90 == 45) {
                    // top corners
                    if (bCoords.first == 45) {
                        colors.push_back(&faces[{0, 0}][bCoords]);
                    }
                    // bottom corners
                    else {
                        colors.push_back(&faces[{180, 0}][bCoords]);
                    }
                    colors.push_back(&faces[{90, mod(bCoords.second + 45, 360)}][bCoords]);
                    colors.push_back(&faces[{90, mod(bCoords.second - 45, 360)}][bCoords]);
                }
                // side blocks
                else {
                    // second row
                    if (bCoords.first == 90) {
                        colors.push_back(&faces[{90, mod(bCoords.second + 45, 360)}][bCoords]);
                        colors.push_back(&faces[{90, mod(bCoords.second - 45, 360)}][bCoords]);
                    }
                    // top row
                    else if (bCoords.first == 45) {
                        colors.push_back(&faces[{bCoords.first + 45, bCoords.second}][bCoords]);
                        colors.push_back(&faces[{0, 0}][bCoords]);
                    }
                    // bottom row
                    else {
                        colors.push_back(&faces[{bCoords.first - 45, bCoords.second}][bCoords]);
                        colors.push_back(&faces[{180, 0}][bCoords]); 
                    }
                }
                Block block(colors, bCoords);
                blocks[bCoords] = block;
            }
        }
        /**/
    }

    void rotate(string move) {
        moves.push_back(move);
        map< char, pair<int, int> > faceConversion = {
            {'F', {90, 0}},
            {'R', {90, 90}},
            {'B', {90, 180}},
            {'L', {90, 270}},
            {'U', {0, 0}},
            {'D', {180, 0}} 
        };
        pair<int, int> face = faceConversion[move[0]];
        bool clockwise = (strlen(move.c_str()) == 1);
        vector< pair<int, int> > faceCoords;
        // F, B, L, R
        if (face.first == 90) {
            // start from top left corner
            faceCoords.push_back({face.first - 45, mod(face.second - 45, 360)});
            faceCoords.push_back({face.first - 45, face.second});
            faceCoords.push_back({face.first - 45, mod(face.second + 45, 360)});
            faceCoords.push_back({face.first, mod(face.second + 45, 360)});
            faceCoords.push_back({face.first + 45, mod(face.second + 45, 360)});
            faceCoords.push_back({face.first + 45, face.second});
            faceCoords.push_back({face.first + 45, mod(face.second - 45, 360)});
            faceCoords.push_back({face.first, mod(face.second - 45, 360)});
        }
        // U, D
        else {
            // corner starts from {45, 315}
            int theta = 45;
            if (face.first == 180) theta += 90;
            for (int i = 0; i < 8; ++i) {
                faceCoords.push_back({theta, mod(315 + 45 * i, 360)});
            }
        }
        // swap side colors
        vector< pair<int, int> > swapFaces;
        if (face.first == 90) {
            swapFaces.push_back({0, 0});
            swapFaces.push_back({90, mod(face.second + 90, 360)});
            swapFaces.push_back({180, 0});
            swapFaces.push_back({90, mod(face.second - 90, 360)});
        }
        else {
            for (int i = 0; i < 4; ++i) {
                swapFaces.push_back({90, 90 * i});
            }
        }

        swapping:
        // swap face colors
        if ((clockwise && face.first != 0) || (!clockwise && face.first == 0)) {
            Color tempColor1 = faces[face][faceCoords[7]];
            Color tempColor2 = faces[face][faceCoords[6]];
            for (int i = 7; i > 1; --i) {
                faces[face][faceCoords[i]] = faces[face][faceCoords[i - 2]];
            }
            faces[face][faceCoords[0]] = tempColor2;
            faces[face][faceCoords[1]] = tempColor1;
        }
        else {
            Color tempColor1 = faces[face][faceCoords[1]];
            Color tempColor2 = faces[face][faceCoords[0]];
            for (int i = 0; i < 6; ++i) {
                faces[face][faceCoords[i]] = faces[face][faceCoords[i + 2]];
            }
            faces[face][faceCoords[6]] = tempColor2;
            faces[face][faceCoords[7]] = tempColor1;
        }
        // update sCoords
        for (int i = 0; i < 8; ++i) {
            faces[face][faceCoords[i]].squareCoords = faceCoords[i];
        }

        if ((clockwise && face.first != 0) || (!clockwise && face.first == 0)) {
            Color tempColor1 = faces[swapFaces[3]][faceCoords[0]];
            Color tempColor2 = faces[swapFaces[3]][faceCoords[7]];
            Color tempColor3 = faces[swapFaces[3]][faceCoords[6]];
            for (int i = 8; i > 2; i -= 2) {
                faces[swapFaces[i / 2 - 1]][faceCoords[i % 8]] = faces[swapFaces[i / 2 - 2]][faceCoords[i - 2]];
                faces[swapFaces[i / 2 - 1]][faceCoords[i - 1]] = faces[swapFaces[i / 2 - 2]][faceCoords[i - 3]];
                faces[swapFaces[i / 2 - 1]][faceCoords[i - 2]] = faces[swapFaces[i / 2 - 2]][faceCoords[i - 4]];
            }
            faces[swapFaces[0]][faceCoords[2]] = tempColor1;
            faces[swapFaces[0]][faceCoords[1]] = tempColor2;
            faces[swapFaces[0]][faceCoords[0]] = tempColor3;
        }
        else {
            Color tempColor1 = faces[swapFaces[0]][faceCoords[2]];
            Color tempColor2 = faces[swapFaces[0]][faceCoords[1]];
            Color tempColor3 = faces[swapFaces[0]][faceCoords[0]];
            for (int i = 0; i < 6; i += 2) {
                faces[swapFaces[i / 2]][faceCoords[i]] = faces[swapFaces[i / 2 + 1]][faceCoords[i + 2]];
                faces[swapFaces[i / 2]][faceCoords[i + 1]] = faces[swapFaces[i / 2 + 1]][faceCoords[i + 3]];
                faces[swapFaces[i / 2]][faceCoords[i + 2]] = faces[swapFaces[i / 2 + 1]][faceCoords[(i + 4) % 8]];
            }
            faces[swapFaces[3]][faceCoords[0]] = tempColor1;
            faces[swapFaces[3]][faceCoords[7]] = tempColor2;
            faces[swapFaces[3]][faceCoords[6]] = tempColor3;
        }
        for (int i = 0; i < 8; i += 2) {
            for (int j = 0; j < 3; ++j) {
                faces[swapFaces[i / 2]][faceCoords[(i + j) % 8]].squareCoords = faceCoords[(i + j) % 8];
                faces[swapFaces[i / 2]][faceCoords[(i + j) % 8]].faceCoords = swapFaces[i / 2];
            }
        }
        // double rotation
        if (!clockwise) {
            if (move[1] == '2') {
                move = {move[0], '\''};
                goto swapping;
            }
        }
    }

    pair<int, int> findEdge(pair<int, int> c1, pair<int, int> c2 = {-1, -1}, int layer = 0) {
        int x = 1, y = 3;
        if (layer != 0) x = y = layer;
        for (int i = x; i <= y; ++i) {
            for (int j = 0; j < 4; ++j) {
                Block &block = blocks[{45 * i, 90 * j + 45 * mod(i - 1, 2)}];
                if (blockContains(block, c1, c2)) {
                    return block.blockCoords;
                }
            }
        }
        return {-1, -1};
    }

    pair<int, int> findCorner(pair<int, int> c1, pair<int, int> c2 = {-1, -1}, pair<int, int> c3 = {-1, -1}, int layer = 0) {
        int x = 1, y = 3;
        if (layer != 0) x = y = layer;
        for (int i = x; i <= y; i += 2) {
            for (int j = 0; j < 4; ++j) {
                Block &block = blocks[{45 * i, 45 + 90 * j}];
                if (blockContains(block, c1, c2, c3)) {
                    return block.blockCoords;
                }
            }
        }
        return {-1, -1};
    }

    bool blockContains(Block &b, pair<int, int> c1, pair<int, int> c2 = {-1, -1}, pair<int, int> c3 = {-1, -1}) {
        bool foundC1 = false, foundC2 = foundC1, foundC3 = foundC1;
        if (c2 == pair<int, int>{-1, -1}) foundC2 = true;
        if (c3 == pair<int, int>{-1, -1}) foundC3 = true;

        for (auto color : b.getColors()) {
            if (color->colorCoords == c1) foundC1 = true;
            if (c2 != pair<int, int>{-1, -1} && color->colorCoords == c2) foundC2 = true;
            if (c3 != pair<int, int>{-1, -1} && color->colorCoords == c3) foundC3 = true;
        }
        return foundC1 && foundC2 && foundC3;
    }

    void solveCross() {
        map< pair<int, int>, string > coordToFace = {
            {{90, 0}, "F"},
            {{90, 90}, "R"},
            {{90, 180}, "B"},
            {{90, 270}, "L"},
            {{0, 0}, "U"},
            {{180, 0}, "D"}
        };
        for (int i = 0; i < 4; ++i) {
            pair<int, int> blockCoord = findEdge({180, 0}, {90, 90 * i});
            Block &block = blocks[blockCoord];
            Color *colorWhite = getColor(block, {180, 0});
            Color *colorOther = getColor(block, {90, 90 * i});
            // if block is in correct place
            if (colorWhite->faceCoords == pair<int, int>{180, 0} &&
                colorOther->faceCoords == pair<int, int>{90, 90 * i}) continue;
            
            // if white is on the sides
            if (colorWhite->faceCoords.first == 90) {
                int theta = colorWhite->squareCoords.first;
                // white on first layer
                if (theta == 45) {
                    int difference = 0;
                    while (mod(colorWhite->faceCoords.second + difference, 360) != colorOther->colorCoords.second) {
                        difference += 90;
                    }
                    if (difference == 0) {
                        pair<int, int> oldFace = colorWhite->faceCoords;
                        pair<int, int> newFace = {90, mod(colorWhite->faceCoords.second - 90, 360)};
                        rotate("U");
                        rotate(coordToFace[newFace]);
                        rotate(coordToFace[oldFace] + "'");
                        rotate(coordToFace[newFace] + "'");
                    }
                    else if (difference == 180) {
                        pair<int, int> newFace = {90, mod(colorWhite->faceCoords.second - 90, 360)};
                        pair<int, int> newFace2 = {90, mod(colorWhite->faceCoords.second - 180, 360)};
                        rotate("U");
                        rotate(coordToFace[newFace] + "'");
                        rotate(coordToFace[newFace2]);
                        rotate(coordToFace[newFace]);
                    }
                    else if (difference == 270) {
                        pair<int, int> oldFace = colorWhite->faceCoords;
                        pair<int, int> newFace = {90, mod(colorWhite->faceCoords.second - 90, 360)};
                        rotate(coordToFace[oldFace] + "'");
                        rotate(coordToFace[newFace]);
                        rotate(coordToFace[oldFace]);
                    }
                    else {
                        pair<int, int> oldFace = colorWhite->faceCoords;
                        pair<int, int> newFace = {90, mod(colorWhite->faceCoords.second + 90, 360)};
                        rotate(coordToFace[oldFace]);
                        rotate(coordToFace[newFace] + "'");
                        rotate(coordToFace[oldFace] + "'");
                    }
                }
                // white on second layer
                else if (theta == 90) {
                    int difference = 0;
                    while (mod(colorOther->faceCoords.second + difference, 360) != colorOther->colorCoords.second) {
                        difference += 90;
                    }
                    if (difference == 0) {
                        pair<int, int> face = colorOther->faceCoords;
                        if (colorOther->squareCoords.second == mod(colorOther->faceCoords.second - 45, 360)) {
                            rotate(coordToFace[face] + "'");
                        }
                        else {
                            rotate(coordToFace[face]);
                        }
                    }
                    else if (difference == 180) {
                        rotate("D2");
                        pair<int, int> face = colorOther->faceCoords;
                        if (colorOther->squareCoords.second == mod(colorOther->faceCoords.second - 45, 360)) {
                            rotate(coordToFace[face] + "'");
                        }
                        else {
                            rotate(coordToFace[face]);
                        }
                        rotate("D2");
                    }
                    else if (difference == 270) {
                        rotate("D");
                        pair<int, int> face = colorOther->faceCoords;
                        if (colorOther->squareCoords.second == mod(colorOther->faceCoords.second - 45, 360)) {
                            rotate(coordToFace[face] + "'");
                        }
                        else {
                            rotate(coordToFace[face]);
                        }
                        rotate("D'");
                    }
                    else {
                        rotate("D'");
                        pair<int, int> face = colorOther->faceCoords;
                        if (colorOther->squareCoords.second == mod(colorOther->faceCoords.second - 45, 360)) {
                            rotate(coordToFace[face] + "'");
                        }
                        else {
                            rotate(coordToFace[face]);
                        }
                        rotate("D");
                    }
                }
                // white on last layer
                else {
                    int difference = 0;
                    while (mod(colorWhite->faceCoords.second + difference, 360) != colorOther->colorCoords.second) {
                        difference += 90;
                    }
                    if (difference == 0) {
                        pair<int, int> face = colorWhite->faceCoords;
                        pair<int, int> newFace = {90, mod(colorWhite->faceCoords.second - 90, 360)};
                        rotate(coordToFace[face]);
                        rotate("D'");
                        rotate(coordToFace[newFace]);
                        rotate("D");
                    }
                    else if (difference == 180) {
                        pair<int, int> face = colorWhite->faceCoords;
                        pair<int, int> newFace = {90, mod(colorWhite->faceCoords.second + 90, 360)};
                        rotate(coordToFace[face] + "'");
                        rotate("D'");
                        rotate(coordToFace[newFace] + "'");
                        rotate("D");
                    }
                    else if (difference == 90) {
                        pair<int, int> face = colorWhite->faceCoords;
                        pair<int, int> newFace = {90, mod(colorWhite->faceCoords.second + 90, 360)};
                        rotate(coordToFace[face] + "'");
                        rotate(coordToFace[newFace] + "'");
                    }
                    else {
                        pair<int, int> face = colorWhite->faceCoords;
                        pair<int, int> newFace = {90, mod(colorWhite->faceCoords.second - 90, 360)};
                        rotate(coordToFace[face]);
                        rotate(coordToFace[newFace]);
                    }
                }
            }
            // white on yellow layer
            else if (colorWhite->faceCoords.first == 0) {
                int difference = 0;
                while (mod(colorOther->faceCoords.second + difference, 360) != colorOther->colorCoords.second) {
                    difference += 90;
                }
                if (difference == 0) {
                    pair<int, int> face = colorOther->faceCoords;
                    rotate(coordToFace[face] + "2");
                }
                else if (difference == 180) {
                    pair<int, int> face = {90, mod(colorOther->faceCoords.second + 180, 360)};
                    rotate("U2");
                    rotate(coordToFace[face] + "2");
                }
                else if (difference == 270) {
                    pair<int, int> face = {90, mod(colorOther->faceCoords.second - 90, 360)};
                    rotate("U");
                    rotate(coordToFace[face] + "2");
                }
                else {
                    pair<int, int> face = {90, mod(colorOther->faceCoords.second + 90, 360)};
                    rotate("U'");
                    rotate(coordToFace[face] + "2");
                }
            }
            else {
                int difference = 0;
                while (mod(colorOther->faceCoords.second + difference, 360) != colorOther->colorCoords.second) {
                    difference += 90;
                }
                if (abs(difference) == 180) {
                    pair<int, int> face = colorOther->faceCoords;
                    pair<int, int> newFace = {90, mod(colorOther->faceCoords.second + 180, 360)};
                    rotate(coordToFace[face] + "2");
                    rotate("U2");
                    rotate(coordToFace[newFace] + "2");
                }
                else if (difference == 270) {
                    pair<int, int> face = colorOther->faceCoords;
                    pair<int, int> newFace = {90, mod(colorOther->faceCoords.second - 90, 360)};
                    rotate(coordToFace[face] + "2");
                    rotate("U");
                    rotate(coordToFace[newFace] + "2");
                }
                else {
                    pair<int, int> face = colorOther->faceCoords;
                    pair<int, int> newFace = {90, mod(colorOther->faceCoords.second + 90, 360)};
                    rotate(coordToFace[face] + "2");
                    rotate("U'");
                    rotate(coordToFace[newFace] + "2");
                }
            }
        }
    }

    void solveF2L() {
        map< pair<int, int>, string > CTF = {
            {{90, 0}, "F"},
            {{90, 90}, "R"},
            {{90, 180}, "B"},
            {{90, 270}, "L"},
            {{0, 0}, "U"},
            {{180, 0}, "D"}
        };
        map< pair<int, int>, string > colorConv = {
            {{90, 0}, "R"},
            {{90, 90}, "G"},
            {{90, 180}, "O"},
            {{90, 270}, "B"},
            {{0, 0}, "Y"},
            {{180, 0}, "W"}
        };
        for (int i = 0; i < 4; i++) {
            cout << i << " ";
            pair<int, int> cornerCoord;
            pair<int, int> edgeCoord;
            Block corner;
            Block edge;
            Color* cornerWhite;
            Color* cornerC1;
            Color* cornerC2;
            Color* edgeC1;
            Color* edgeC2;
            int numRepeats = 0;
            
            cout << "pair " << i + 1 << ": " << colorConv[{90, 90 * i}] << ", " << colorConv[{90, mod(90 * (i + 1), 360)}] << " | ";

            check:
            numRepeats++;
            cornerCoord = findCorner({180, 0}, {90, 90 * i}, {90, mod(90 * (i + 1), 360)});
            edgeCoord = findEdge({90, 90 * i}, {90, mod(90 * (i + 1), 360)});
            if (cornerCoord.first == -1 || edgeCoord.first == -1) return;
            corner = blocks[cornerCoord];
            edge = blocks[edgeCoord];
            cornerWhite = getColor(corner, {180, 0});
            cornerC1 = getColor(corner, {90, 90 * i});
            cornerC2 = getColor(corner, {90, mod(90 * (i + 1), 360)});
            edgeC1 = getColor(edge, {90, 90 * i});
            edgeC2 = getColor(edge, {90, mod(90 * (i + 1), 360)});

            if (cornerCoord.first == 45) {
                cout << "corner on top, ";
                // white on the side
                if (cornerWhite->faceCoords.first == 90) {
                    cout << "white on side, ";
                    if (edgeCoord.first == 45) {
                        cout << "edge on top, ";
                        int distance = 45;
                        while (mod(cornerCoord.second + distance, 360) != edgeCoord.second) {
                            distance += 90;
                        }
                        // white to the left of corner
                        if (cornerWhite->faceCoords.second == mod(cornerCoord.second - 45, 360)) {
                            pair<int, int> face = cornerWhite->faceCoords;
                            // corner and edge top color is the same
                            if (edgeC1->faceCoords == cornerC1->faceCoords || edgeC2->faceCoords == cornerC2->faceCoords) {
                                if (distance == 135) {
                                    preservePairs(face, true);
                                    rotate(CTF[face]);
                                    rotate("U");
                                    rotate(CTF[face] + "'");
                                }
                                else if (distance == 225) {
                                    preservePairs(face, true);
                                    rotate(CTF[face]);
                                    rotate("U2");
                                    rotate(CTF[face] + "'");
                                }
                                else if (distance == 315) {
                                    preservePairs(face, false);
                                    rotate(CTF[face] + "'");
                                    rotate("U");
                                    rotate(CTF[face]);
                                }
                            }
                            else {
                                if (distance == 45) {
                                    preservePairs(face, true);
                                    rotate(CTF[face]);
                                    rotate("U2");
                                    rotate(CTF[face] + "'");
                                }
                                else if (distance == 135) {
                                    preservePairs(face, true);
                                    rotate(CTF[face]);
                                    rotate("U'");
                                    rotate(CTF[face] + "'");
                                }
                                else if (distance == 315) {
                                    face = {face.first, mod(face.second + 90, 360)};
                                    preservePairs(face, false);
                                    rotate(CTF[face] + "'");
                                    rotate("U");
                                    rotate(CTF[face]);
                                }
                            }
                        }
                        else {
                            pair<int, int> face = cornerWhite->faceCoords;
                            if (edgeC1->faceCoords == cornerC1->faceCoords || edgeC2->faceCoords == cornerC2->faceCoords) {
                                if (distance == 45) {
                                    preservePairs(face, true);
                                    rotate(CTF[face]);
                                    rotate("U'");
                                    rotate(CTF[face] + "'");
                                }
                                else if (distance == 135) {
                                    preservePairs(face, false);
                                    rotate(CTF[face] + "'");
                                    rotate("U2");
                                    rotate(CTF[face]);
                                }
                                else if (distance == 225) {
                                    preservePairs(face, false);
                                    rotate(CTF[face] + "'");
                                    rotate("U'");
                                    rotate(CTF[face]);
                                }
                            }
                            else {
                                if (distance == 45) {
                                    face = {face.first, mod(face.second - 90, 360)};
                                    preservePairs(face, true);
                                    rotate(CTF[face]);
                                    rotate("U'");
                                    rotate(CTF[face] + "'");
                                }
                                else if (distance == 225) {
                                    preservePairs(face, false);
                                    rotate(CTF[face] + "'");
                                    rotate("U");
                                    rotate(CTF[face]);
                                }
                                else if (distance == 315) {
                                    preservePairs(face, false);
                                    rotate(CTF[face] + "'");
                                    rotate("U2");
                                    rotate(CTF[face]);                                
                                }
                            }
                        }
                    }
                    // white on the side, edge not on top
                    else {
                        cout << "edge on side, ";
                        int inc = 0;
                        Color cornerCopy;
                        Color edgeCopy;
                        Color edgeCopy2;
                        if (cornerC1->faceCoords.first != 0) {
                            cornerCopy = *cornerC1;
                            edgeCopy = *edgeC1;
                            edgeCopy2 = *edgeC2;
                        }
                        else {
                            cornerCopy = *cornerC2;
                            edgeCopy = *edgeC2;
                            edgeCopy2 = *edgeC1;
                        }
                        while (mod(cornerCopy.faceCoords.second + inc, 360) != edgeCopy.faceCoords.second) inc += 90;
                        // if colors line up when corner placed above edge
                        pair<int, int> face = cornerWhite->faceCoords;
                        if (mod(cornerCoord.second + inc, 360) == edgeCoord.second) {
                            int increment = 0;
                            while (mod(cornerWhite->faceCoords.second + increment, 360) != edgeCopy.faceCoords.second) increment += 90;
                            if (increment == 90) {
                                rotate("U'");
                            }
                            else if (increment == 180) {
                                rotate("U2");
                            }
                            else if (increment == 270) {
                                rotate("U");
                            }
                            face = {face.first, mod(face.second + increment, 360)};
                            // white to the left of corner
                            if (face.second == mod(cornerCoord.second + increment - 45, 360)) {
                                rotate(CTF[face]);
                                rotate("U'");
                                rotate(CTF[face] + "'");
                            }
                            else {
                                rotate(CTF[face] + "'");
                                rotate("U");
                                rotate(CTF[face]);
                            }
                        }
                        else {
                            int increment = 0;
                            while (mod(cornerWhite->faceCoords.second + increment, 360) != edgeCopy2.faceCoords.second) increment += 90;
                            if (increment == 90) {
                                rotate("U'");
                            }
                            else if (increment == 180) {
                                rotate("U2");
                            }
                            else if (increment == 270) {
                                rotate("U");
                            }
                            face = {face.first, mod(face.second + increment, 360)};
                            // white to the left of corner
                            if (face.second == mod(cornerCoord.second + increment - 45, 360)) {
                                rotate(CTF[face]);
                                rotate("U");
                                rotate(CTF[face] + "'");
                            }
                            else {
                                rotate(CTF[face] + "'");
                                rotate("U'");
                                rotate(CTF[face]);
                            }
                        }
                    }
                }
                // white on top
                else {
                    cout << "white on top, ";
                    // edge on top
                    if (edgeCoord.first == 45) {
                        cout << "edge on top, ";
                        int distance = 45;
                        while (mod(cornerCoord.second + distance, 360) != edgeCoord.second) {
                            distance += 90;
                        }
                        Color rightCColor;
                        Color rightEColor;
                        // if cornerC1 is the right side color of the corner
                        if (cornerC1->squareCoords.second == mod(cornerC1->faceCoords.second - 45, 360)) {
                            rightCColor = *cornerC1;
                            rightEColor = *edgeC1;
                        }
                        else {
                            rightCColor = *cornerC2;
                            rightEColor = *edgeC2;
                        }
                        // colors match on the side when edge is to the right of the corner
                        if (rightCColor.faceCoords.first == rightEColor.faceCoords.first) {
                            if (distance == 45) {
                                pair<int, int> face = {90, mod(rightCColor.faceCoords.second + 180, 360)};
                                preservePairs(face, false);
                                rotate(CTF[face] + "'");
                                rotate("U");
                                rotate(CTF[face]);
                                rotate("U");
                                rotate(CTF[face] + "'");
                                rotate("U");
                                rotate(CTF[face]);
                            }
                            else if (distance == 135) {
                                pair<int, int> face = rightEColor.faceCoords;
                                preservePairs(face, false);
                                rotate(CTF[face] + "'");
                                rotate("U'");
                                rotate(CTF[face]);
                            }
                            else if (distance == 225) {
                                pair<int, int> face = rightEColor.faceCoords;
                                preservePairs(face, false);
                                rotate(CTF[face] + "'");
                                rotate("U2");
                                rotate(CTF[face]);
                            }
                            else {
                                pair<int, int> face = rightEColor.faceCoords;
                                preservePairs(face, false);
                                rotate(CTF[face] + "'");
                                rotate("U2");
                                rotate(CTF[face]);
                            }
                        }
                        else {
                            if (distance == 45) {
                                pair<int, int> face = rightCColor.faceCoords;
                                preservePairs(face, true);
                                cout << "face: " << face.first << ", " << face.second << endl;
                                rotate(CTF[face]);
                                rotate("U2");
                                rotate(CTF[face] + "'");
                            }
                            else if (distance == 135) {
                                pair<int, int> face = {90, mod(rightCColor.faceCoords.second + 90, 360)};
                                preservePairs(face, true);
                                cout << "face: " << face.first << ", " << face.second << endl;
                                rotate(CTF[face]);
                                rotate("U2");
                                rotate(CTF[face] + "'");
                            }
                            else if (distance == 225) {
                                pair<int, int> face = {90, mod(rightCColor.faceCoords.second + 180, 360)};
                                preservePairs(face, true);
                                cout << "face: " << face.first << ", " << face.second << endl;
                                rotate(CTF[face]);
                                rotate("U");
                                rotate(CTF[face] + "'");
                            }
                            else {
                                pair<int, int> face = {90, mod(rightCColor.faceCoords.second + 90, 360)};
                                preservePairs(face, true);
                                cout << "face: " << face.first << ", " << face.second << endl;
                                rotate(CTF[face]);
                                rotate("U'");
                                rotate(CTF[face] + "'");
                                rotate("U'");
                                rotate(CTF[face]);
                                rotate("U'");
                                rotate(CTF[face] + "'");
                            }
                            
                        }
                    }
                    else {
                        cout << "edge on side, ";
                        int inc = 0;
                        Color cornerCopy = *cornerC1;
                        Color edgeCopy = *edgeC1;
                        while (mod(cornerCopy.faceCoords.second + inc, 360) != edgeCopy.faceCoords.second) inc += 90;
                        if (inc == 90) {
                            rotate("U'");
                        }
                        else if (inc == 180) {
                            rotate("U2");
                        }
                        else if (inc == 270) {
                            rotate("U");
                        }
                        pair<int, int> face = edgeCopy.faceCoords;
                        cornerCoord = findCorner({180, 0}, {90, 90 * i}, {90, mod(90 * (i + 1), 360)});
                        edgeCoord = findEdge({90, 90 * i}, {90, mod(90 * (i + 1), 360)});
                        corner = blocks[cornerCoord];
                        cornerC1 = getColor(corner, {90, 90 * i});
                        cornerC2 = getColor(corner, {90, mod(90 * (i + 1), 360)});
                        edgeC2 = getColor(edge, {90, mod(90 * (i + 1), 360)});
                        face = cornerC1->faceCoords;
                        // if corner is above edge
                        if (cornerCoord.second == edgeCoord.second) {
                            // if color1 is to the left of its face
                            if (cornerCoord.second == mod(cornerC1->faceCoords.second - 45, 360)) {
                                face = cornerC2->faceCoords;
                                rotate(CTF[face] + "'");
                                rotate("U");
                                rotate(CTF[face]);
                            }
                            else {
                                rotate(CTF[face]);
                                rotate("U'");
                                rotate(CTF[face] + "'");
                            }
                        }
                        else {
                            face = edgeC2->faceCoords;
                            // if color1 is to the left of its face
                            if (cornerCoord.second == mod(cornerC1->faceCoords.second - 45, 360)) {
                                rotate(CTF[face]);
                                rotate("U'");
                                rotate(CTF[face] + "'");
                                rotate("U");
                                rotate(CTF[face]);
                                rotate("U'");
                                rotate(CTF[face] + "'");
                            }
                            else {
                                rotate(CTF[face] + "'");
                                rotate("U");
                                rotate(CTF[face]);
                                rotate("U'");
                                rotate(CTF[face] + "'");
                                rotate("U");
                                rotate(CTF[face]);
                            }
                        }
                    }
                }
            }
            // corner is on the bottom
            else {
                cout << "corner on bottom, ";
                // edge on top
                if (edgeCoord.first == 45) {
                    cout << "edge on top, ";
                    // white faces down
                    if (cornerWhite->faceCoords.first == 180) {
                        cout << "white on bottom, ";
                        Color edgeSide;
                        Color edgeTop;
                        Color cornerSide;
                        Color cornerTop;
                        if (edgeC1->faceCoords.first == 90) {
                            edgeSide = *edgeC1;
                            edgeTop = *edgeC2;
                            cornerSide = *cornerC1;
                            cornerTop = *cornerC2;
                        }
                        else {
                            edgeSide = *edgeC2;
                            edgeTop = *edgeC1;
                            cornerSide = *cornerC2;
                            cornerTop = *cornerC1;
                        }
                        int inc = 0;
                        // if corner side is on the right
                        if (cornerSide.faceCoords.second == mod(cornerSide.squareCoords.second + 45, 360)) {
                            while (mod(edgeSide.faceCoords.second + inc, 360) != mod(cornerSide.faceCoords.second + 90, 360)) {
                                inc += 90;
                            }
                        }
                        else {
                            while (mod(edgeSide.faceCoords.second + inc, 360) != mod(cornerSide.faceCoords.second - 90, 360)) {
                                inc += 90;
                            }
                        }
                        if (inc == 90) {
                            rotate("U'");
                        }
                        else if (inc == 180) {
                            rotate("U2");
                        }
                        else if (inc == 270) {
                            rotate("U");
                        }
                        edgeCoord = findEdge({90, 90 * i}, {90, mod(90 * (i + 1), 360)});
                        // edge is left of corner
                        pair<int, int> face = cornerTop.faceCoords;
                        if (edgeCoord.second == mod(cornerCoord.second - 135, 360)) {
                            rotate(CTF[face]);
                            rotate("U'");
                            rotate(CTF[face] + "'");
                        }
                        else {
                            rotate(CTF[face] + "'");
                            rotate("U");
                            rotate(CTF[face]);
                        }
                    }
                    // white on right side
                    else if (cornerWhite->squareCoords.second == mod(cornerWhite->faceCoords.second - 45, 360)) {
                        cout << "white on right side, ";
                        Color cornerSide;
                        Color edgeSide;
                        if (cornerC1->faceCoords.first == 90) {
                            cornerSide = *cornerC1;
                            edgeSide = *edgeC1;
                        }
                        else {
                            cornerSide = *cornerC2;
                            edgeSide = *edgeC2;
                        }
                        // if edge color is on top
                        int inc = 0;
                        pair<int, int> face;
                        if (edgeSide.faceCoords.first == 0) {
                            while (mod(edgeCoord.second + inc, 360) != mod(cornerCoord.second - 45, 360)) {
                                inc += 90;
                            }
                            face = cornerSide.faceCoords;
                        }
                        else {
                            while (mod(edgeCoord.second + inc, 360) != mod(cornerCoord.second + 45, 360)) {
                                inc += 90;
                            }
                            face = cornerWhite->faceCoords;
                        }
                        if (inc == 90) {
                            rotate("U'");
                        }
                        else if (inc == 180) {
                            rotate("U2");
                        }
                        else if (inc == 270) {
                            rotate("U");
                        }
                        if (edgeSide.faceCoords.first == 0) {
                            rotate(CTF[face] + "'");
                            rotate("U");
                            rotate(CTF[face]);
                        }
                        else {
                            rotate(CTF[face]);
                            rotate("U");
                            rotate(CTF[face] + "'");
                        }
                    }
                    else {
                        cout << "white on left side, ";
                        Color cornerSide;
                        Color edgeSide;
                        if (cornerC1->faceCoords.first == 90) {
                            cornerSide = *cornerC1;
                            edgeSide = *edgeC1;
                        }
                        else {
                            cornerSide = *cornerC2;
                            edgeSide = *edgeC2;
                        } 
                        int inc = 0;
                        pair<int, int> face;
                        // if edge side is on top
                        if (edgeSide.faceCoords.first == 0) {
                            while (mod(edgeCoord.second + inc, 360) != mod(cornerCoord.second + 45, 360)) {
                                inc += 90;
                            }
                            face = cornerSide.faceCoords;
                        }
                        else {
                            while (mod(edgeCoord.second + inc, 360) != mod(cornerCoord.second - 45, 360)) {
                                inc += 90;
                            }
                            face = cornerWhite->faceCoords;
                        }
                        if (inc == 90) {
                            rotate("U'");
                        }
                        else if (inc == 180) {
                            rotate("U2");
                        }
                        else if (inc == 270) {
                            rotate("U");
                        }
                        if (edgeSide.faceCoords.first == 0) {
                            rotate(CTF[face]);
                            rotate("U'");
                            rotate(CTF[face] + "'");
                        }
                        else {
                            rotate(CTF[face] + "'");
                            rotate("U'");
                            rotate(CTF[face]);
                        }
                    }
                }
                // edge not on top
                else {
                    cout << "edge on side, ";
                    // white on the bottom
                    if (cornerWhite->faceCoords.first == 180) {
                        if ((cornerC1->faceCoords == cornerC1->colorCoords) &&
                            (edgeC1->faceCoords == edgeC1->colorCoords)) {
                            goto insert;
                        }
                        cout << "white on bottom, ";
                        pair<int, int> face = {90, mod(cornerCoord.second + 45, 360)};
                        rotate(CTF[face]);
                        rotate("U'");
                        rotate(CTF[face] + "'");

                    }
                    // if white on the right side
                    else if (cornerWhite->squareCoords.second == mod(cornerWhite->faceCoords.second - 45, 360)) {
                        cout << "white on right side, ";
                        pair<int, int> face = cornerWhite->faceCoords;
                        rotate(CTF[face]);
                        rotate("U'");
                        rotate(CTF[face] + "'");
                    }

                    else {
                        cout << "white on left side, ";
                        pair<int, int> face = cornerWhite->faceCoords;
                        rotate(CTF[face] + "'");
                        rotate("U'");
                        rotate(CTF[face]);
                    }
                    if (numRepeats >= 2) return;
                    goto check;
                }
            }
            insert:
            cornerCoord = findCorner({180, 0}, {90, 90 * i}, {90, mod(90 * (i + 1), 360)});
            edgeCoord = findEdge({90, 90 * i}, {90, mod(90 * (i + 1), 360)});
            insertPair(cornerCoord, edgeCoord);
            cout << "pair inserted\n";
        }
    }

    void solveOLL() {
        cout << "OLL: ";
        vector<string> OLLIShape = {"F", "R", "U", "R'", "U'", "F'"};
        vector<string> OLLLShape = {"F", "U", "R", "U'", "R'", "F'"};
        vector<string> OLLAntisune = {"R", "U2", "R'", "U'", "R", "U'", "R'"};
        vector<string> OLLSune = {"R", "U", "R'", "U", "R", "U2", "R'"};
        vector<string> OLLMoves;
        vector<bool> isYellow(8, false);
        int numRepeats = 0;
        repeat:
        numRepeats++;
        for (int i = 0; i < 8; ++i) {
            // if is yellow
            if (faces[{0, 0}][{45, 45 * i}].colorCoords.first == 0) {
                isYellow[i] = true;
            }
            else {
                isYellow[i] = false;
            }
        }
        bool edgesSolved = true;
        bool cornersSolved = true;
        for (int i = 0; i < 4; ++i) {
            if (!isYellow[i * 2]) edgesSolved = false;
            if (!isYellow[i * 2 + 1]) cornersSolved = false;
        }
        // if edges solved, solve corners
        if (edgesSolved) {
            OLLMoves.clear();
            pair<int, vector<Color*> > sidesYellow = sidesWithYellow();
            vector<Color*> yellowSides = sidesYellow.second;
            int dist = 0;
            // yellow face solved
            if (cornersSolved) {
                cout << "skip\n";
                return;
            }
            // L (1/5, 3/7)
            else if ((isYellow[1] && isYellow[5]) || (isYellow[3] && isYellow[7])) {
                cout << "L\n";
                Color leftSquare;
                if (yellowSides[0]->faceCoords.second == mod(yellowSides[0]->squareCoords.second + 45, 360)) {
                    leftSquare = *yellowSides[0];
                }
                else {
                    leftSquare = *yellowSides[1];
                }
                dist = leftSquare.faceCoords.second;
                OLLMoves.reserve(OLLAntisune.size() + OLLSune.size() + 1);
                OLLMoves.insert(OLLMoves.end(), OLLSune.begin(), OLLSune.end());
                OLLMoves.push_back("U2");
                OLLMoves.insert(OLLMoves.end(), OLLAntisune.begin(), OLLAntisune.end());
            }
            // T or U (1/3, 3/5, 5/7)
            else if ((isYellow[1] && isYellow[3]) || (isYellow[3] && isYellow[5]) ||
                     (isYellow[5] && isYellow[7]) || (isYellow[7] && isYellow[1])) {
                // U
                if (sidesYellow.first == 1) {
                    cout << "U\n";
                    dist = yellowSides[0]->faceCoords.second;
                    OLLMoves = {"R2", "D", "R'", "U2", "R", "D'", "R'", "U2", "R'"};
                }
                // T
                else {
                    cout << "T\n";
                    Color leftSquare;
                    if (yellowSides[0]->faceCoords.second == mod(yellowSides[0]->squareCoords.second + 45, 360)) {
                        leftSquare = *yellowSides[0];
                    }
                    else {
                        leftSquare = *yellowSides[1];
                    }
                    dist = leftSquare.faceCoords.second;
                    OLLMoves.reserve(OLLAntisune.size() + OLLSune.size() + 1);
                    OLLMoves.insert(OLLMoves.end(), OLLSune.begin(), OLLSune.end());
                    OLLMoves.push_back("U'");
                    OLLMoves.insert(OLLMoves.end(), OLLAntisune.begin(), OLLAntisune.end());
                    
                }
            }
            // Sune or Antisune (1, 3, 5, 7)
            else if (isYellow[1] || isYellow[3] || isYellow[5] || isYellow[7]) {
                pair<int, int> fishHead;
                for (int i = 1; i <= 7; i += 2) {
                    if (isYellow[i]) fishHead = {45, i * 45};
                }
                bool isSune = false;
                for (auto color : yellowSides) {
                    if (color->faceCoords.second == mod(fishHead.second + 45, 360)) {
                        isSune = true;
                    }
                }
                // Sune
                if (isSune) {
                    cout << "Sune\n";
                    dist = mod(fishHead.second + 45, 360);
                    OLLMoves = OLLSune;
                }
                // Antisune
                else {
                    cout << "Antisune\n";
                    dist = mod(fishHead.second + 45 - 180, 360);
                    OLLMoves = OLLAntisune;
                }
            }
            // H or Pi
            else {
                // H
                if (sidesYellow.first == 2) {
                    cout << "H\n";
                    Color square = *yellowSides[0];
                    if (mod(square.faceCoords.second, 180) != 90) dist = 90;
                    OLLMoves = {"R", "U", "R'", "U", "R", "U'", "R'", "U", "R", "U2", "R'"};
                }
                // Pi
                else {
                    cout << "Pi\n";
                    vector<int> facePhi;
                    int phiNoYellow;
                    for (auto color : yellowSides) {
                        facePhi.push_back(color->faceCoords.second);
                    }
                    for (int i = 0; i < 4; ++i) {
                        bool isInVec = false;
                        for (auto face : facePhi) {
                            if (90 * i == face) isInVec = true;
                        }
                        if (!isInVec) {
                            phiNoYellow = 90 * i;
                            break;
                        }
                    }
                    dist = mod(phiNoYellow - 90, 360);
                    OLLMoves = {"R", "U2", "R2", "U'", "R2", "U'", "R2", "U2", "R"};
                }
            }
            if (dist == 90) {
                rotate("U");
            }
            else if (dist == 180) {
                rotate("U2");
            }
            else if (dist == 270) {
                rotate("U'");
            }
            for (auto move : OLLMoves) {
                rotate(move);
            }
        }
        // solve edges first
        else {
            OLLMoves.clear();
            pair<int, vector<Color*> > sidesYellow = sidesWithYellow();
            vector<Color*> yellowSides = sidesYellow.second;
            int dist = 0;
            // I Shape (0/4, 2/6)
            if ((isYellow[0] && isYellow[4]) || (isYellow[2] && isYellow[6])) {
                cout << "I shape, ";
                if (!isYellow[2] || !isYellow[6]) dist = 90;
                OLLMoves = OLLIShape;
            }
            // Dot Shape (NOT 0, 2, 4, 6)
            else if (!isYellow[0] && !isYellow[2] && !isYellow[4] && !isYellow[6]) {
                cout << "Dot shape, ";
                OLLMoves.reserve(OLLLShape.size() + OLLIShape.size() + 1);
                OLLMoves.insert(OLLMoves.end(), OLLLShape.begin(), OLLLShape.end());
                OLLMoves.push_back("U");
                OLLMoves.insert(OLLMoves.end(), OLLIShape.begin(), OLLIShape.end());
            }
            // L Shape
            else {
                cout << "L shape, ";
                for (int i = 0; i <= 6; i += 2) {
                    if (isYellow[mod(i, 8)] && isYellow[mod(i + 2, 8)]) dist = mod(i * 45 + 180, 360);
                }
                OLLMoves = OLLLShape;
            }
            if (dist == 90) {
                rotate("U");
            }
            else if (dist == 180) {
                rotate("U2");
            }
            else if (dist == 270) {
                rotate("U'");
            }
            for (auto move : OLLMoves) {
                rotate(move);
            }
            if (numRepeats >= 2) return;
            goto repeat;
        }
    }

    void solvePLL() {
        cout << "PLL: ";
        vector<string> PLLUa = {"R", "U'", "R", "U", "R", "U", "R", "U'", "R'", "U'", "R2"};
        vector<string> PLLUb = {"R2", "U", "R", "U", "R'", "U'", "R'", "U'", "R'", "U", "R'"};
        int numRepeats = 0;
        repeat:
        numRepeats++;
        vector<string> PLLMoves;
        bool cornersSolved = true;
        bool oneCompleteCorner = false;
        pair<int, int> completeCornerCoord;
        pair<int, int> completeSideCoord;
        bool completeSide = false;
        bool completeSideAll = true;
        for (int i = 0; i < 4; ++i) {
            pair<int, int> corner1 = faces[{90, 90 * i}][{45, mod(315 + 90 * i, 360)}].colorCoords;
            pair<int, int> edge = faces[{90, 90 * i}][{45, mod(315 + 90 * i + 45, 360)}].colorCoords;
            pair<int, int> corner2 = faces[{90, 90 * i}][{45, mod(315 + 90 * (i + 1), 360)}].colorCoords;
            if (corner1 != corner2) {
                cornersSolved = false;
                completeSideAll = false;
            }
            else {
                if (edge == corner1) {
                    completeSide = true;
                    completeSideCoord = faces[{90, 90 * i}][{45, mod(315 + 90 * i, 360)}].faceCoords;
                }
                else {
                    completeSideAll = false;
                }
                oneCompleteCorner = true;
                completeCornerCoord = faces[{90, 90 * i}][{45, mod(315 + 90 * i, 360)}].faceCoords;
            }
        }
        // solve edges
        if (completeSideAll) {
            cout << "skip\n";
            goto correct;
        }
        if (cornersSolved) {
            PLLMoves.clear();
            // Ua or Ub
            if (completeSide) {
                int dist = mod(completeSideCoord.second - 180, 360);
                if (dist == 90) {
                    rotate("U");
                }
                else if (dist == 180) {
                    rotate("U2");
                }
                else if (dist == 270) {
                    rotate("U'");
                }
                // Ua
                if (faces[{90, 0}][{45, 0}].colorCoords == faces[{90, 90}][{45, 45}].colorCoords) {
                    cout << "Ua\n";
                    PLLMoves = PLLUa;
                }
                // Ub
                else {
                    cout << "Ub\n";
                    PLLMoves = PLLUb;
                }
            }
            // H or Z
            else {
                // H (Ua, U, Ua)
                if (faces[{90, 0}][{45, 0}].colorCoords == faces[{90, 180}][{45, 135}].colorCoords) {
                    cout << "H\n";
                    PLLMoves.reserve(PLLUa.size() * 2 + 1);
                    PLLMoves.insert(PLLMoves.end(), PLLUa.begin(), PLLUa.end());
                    PLLMoves.push_back("U");
                    PLLMoves.insert(PLLMoves.end(), PLLUa.begin(), PLLUa.end());
                }
                // Z (Ua, U2 Ub)
                else {
                    cout << "Z\n";
                    Color square = faces[{90, 0}][{45, 0}];
                    // align Z so it goes left to right
                    if (square.colorCoords == faces[{90, 90}][{45, 45}].colorCoords) {
                        rotate("U");
                    }
                    PLLMoves.reserve(PLLUa.size() * 2 + 1);
                    PLLMoves.insert(PLLMoves.end(), PLLUa.begin(), PLLUa.end());
                    PLLMoves.push_back("U2");
                    PLLMoves.insert(PLLMoves.end(), PLLUb.begin(), PLLUb.end());
                }
            }
            for (auto move : PLLMoves) {
                rotate(move);
            }
        }
        // solve corners first
        else {
            // Headlights
            if (oneCompleteCorner) {
                cout << "Headlights, ";
                int dist = mod(completeCornerCoord.second + 90, 360);
                if (dist == 90) {
                    rotate("U");
                }
                else if (dist == 180) {
                    rotate("U2");
                }
                else if (dist == 270) {
                    rotate("U'");
                }
                PLLMoves = {"R", "U", "R'", "U'", "R'", "F", "R2", "U'", "R'", "U'", "R", "U", "R'", "F'"};
            }
            // Diagonal
            else {
                cout << "Diagonal, ";
                PLLMoves = {"F", "R", "U'", "R'", "U'", "R", "U", "R'", "F'", "R", "U", "R'", "U'", "R'", "F", "R", "F'"};
            }
            for (auto move : PLLMoves) {
                rotate(move);
            }
            if (numRepeats >= 2) return;
            goto repeat;
        }
        correct:
        int diff = faces[{90, 0}][{45, 0}].colorCoords.second;
        if (diff == 90) {
            rotate("U'");
        }
        else if (diff == 180) {
            rotate("U2");
        }
        else if (diff == 270) {
            rotate("U");
        }
    }

    Color* getColor(Block &block, pair<int, int> c1) {
        for (auto color : block.colors) {
            if (color->colorCoords == c1) return color;
        }
        return nullptr;
    }

    void insertPair(pair<int, int> cornerCoord, pair<int, int> edgeCoord) {
        map< pair<int, int>, string > CTF = {
            {{90, 0}, "F"},
            {{90, 90}, "R"},
            {{90, 180}, "B"},
            {{90, 270}, "L"},
            {{0, 0}, "U"},
            {{180, 0}, "D"}
        };
        Block corner = blocks[cornerCoord];
        Block edge = blocks[edgeCoord];
        Color cornerSide;
        Color cornerTop;
        for (auto color : corner.getColors()) {
            if (color->colorCoords.first != 180 && color->faceCoords.first == 90) {
                cornerSide = *color;
            }
            if (color->faceCoords.first == 0) {
                cornerTop = *color;
            }
        }
        // if corner and edge are next to each other
        if (cornerCoord.second == mod(edgeCoord.second + 45, 360) ||
            cornerCoord.second == mod(edgeCoord.second - 45, 360)) {
            int inc = 0;
            while (mod(cornerSide.faceCoords.second + inc, 360) != cornerTop.colorCoords.second) {
                inc += 90;
            }
            if (inc == 90) {
                rotate("U'");
                // cornerCoord.second = mod(cornerCoord.second + 90, 360);
            }
            else if (inc == 180) {
                rotate("U2");
                // cornerCoord.second = mod(cornerCoord.second + 180, 360);
            }
            else if (inc == 270) {
                rotate("U");
                // cornerCoord.second = mod(cornerCoord.second - 90, 360);
            }
            // if pair points to the right
            pair<int, int> face = cornerSide.colorCoords;
            if (cornerCoord.second == mod(cornerSide.faceCoords.second + 45, 360)) {
                rotate(CTF[face] + "'");
                rotate("U");
                rotate(CTF[face]);
            }
            else {
                rotate(CTF[face]);
                rotate("U'");
                rotate(CTF[face] + "'");
            }
        }
        else {
            int inc = 0;
            while (mod(cornerSide.faceCoords.second + inc, 360) != cornerSide.colorCoords.second) {
                inc += 90;
            }
            if (inc == 90) {
                rotate("U'");
            }
            else if (inc == 180) {
                rotate("U2");
            }
            else if (inc == 270) {
                rotate("U");
            }
            // if white points to the right
            pair<int, int> face = cornerTop.colorCoords;
            if (cornerCoord.second == mod(cornerSide.faceCoords.second + 45, 360)) {
                rotate(CTF[face]);
                rotate("U");
                rotate(CTF[face] + "'");
            }
            else {
                rotate(CTF[face] + "'");
                rotate("U'");
                rotate(CTF[face]);
            }
        }
    }

    // checks if a move will affect a solved pair; if so will rotate U until no solved pair is affected
    // changes face to new face that will preserve pair
    void preservePairs(pair<int, int> &face, bool clockwise) {
        int clockwiseR = 0;
        Block* edge;
        Block* corner;
        
        repeat:
        if (clockwise) {
            edge = &blocks[{90, mod(face.second - 45, 360)}];
            corner = &blocks[{135, mod(face.second - 45, 360)}];
        }
        else {
            edge = &blocks[{90, mod(face.second + 45, 360)}];
            corner = &blocks[{135, mod(face.second + 45, 360)}];
        }

        bool isPair = true;
        for (auto color : edge->colors) {
            if (color->colorCoords != color->faceCoords) isPair = false;
        }
        for (auto color : corner->colors) {
            if (color->colorCoords != color->faceCoords) isPair = false;
        }
        if (isPair) {
            face = {face.first, mod(face.second - 90, 360)};
            clockwiseR++;
            goto repeat;
        }
        if (clockwiseR == 1) rotate("U");
        else if (clockwiseR == 2) rotate("U2");
        else if (clockwiseR == 3) rotate ("U'");
    }

    // returns how many sides (F, B, L, R) contain yellow squares and a vector Color*, used for OLL
    pair<int, vector<Color*> > sidesWithYellow() {
        int numSides = 0;
        vector<Color*> coords;
        for (int i = 0; i < 4; ++i) {
            bool hasYellow = false;
            for (auto &square : faces[{90, 90 * i}]) {
                if (square.second.colorCoords.first == 0) {
                    hasYellow = true;
                    coords.push_back(&square.second);
                }
            }
            if (hasYellow) numSides++;
        }
        return {numSides, coords};
    }

    void printMoves() {
        for (int i = 0; i < moves.size(); ++i) {
            cout << moves[i];
            if (i < moves.size() - 1) cout << ", ";
        }
        cout << '\n';
    }

    void printMovesDetailed(vector<int> &x) {
        cout << "Cross: ";
        for (int i = 0; i < moves.size(); ++i) {
            cout << moves[i] << " ";
            if (i == x[0]) {
                cout << "\nF2L: ";
            }
            else if (i == x[1]) {
                cout << "\nOLL: ";
            }
            else if (i == x[2]) {
                cout << "\nPLL: ";
            }
        }
        cout << '\n';
    }

    void printDebugBlocks(map< pair<int, int>, string > &colorCoordsRev) {
        int totalBlocks = 0;
        cout << "printDebugBlocks:\n";
        for (int i = 1; i < 4; ++i) {
            for (int j = 0; j < 8; ++j) {
                pair<int, int> bCoord = {45 * i, 45 * j};
                if (bCoord.first % 90 == 0 && bCoord.second % 90 == 0) continue;
                vector<Color*> colors = blocks[bCoord].getColors();
                cout << "block:\t\t{" << bCoord.first << ", " << bCoord.second << "}\n";
                totalBlocks++;
                cout << "S, C, F:\t";
                for (auto color : colors) {
                    cout << colorCoordsRev[color->getCCoords()] << ", ";
                    cout << colorCoordsRev[color->getFCoords()] << ", ";
                    cout << "{" << color->getSCoords().first << ", " << color->getSCoords().second << "}, ";
                    cout << "{" << color->getCCoords().first << ", " << color->getCCoords().second << "}, ";
                    cout << "{" << color->getFCoords().first << ", " << color->getFCoords().second << "}\n\t\t";
                }
                cout << "\n";
            }
        }
        cout << "totalBlocks:\t" << totalBlocks << "\n\n";
    }

    void printDebugFaces(map< pair<int, int>, string > &colorCoordsRev) {
        int totalFaces = 0;
        cout << "printDebugFaces:\n";
        for (auto face : faces) {
            cout << "face:\t{" << face.first.first << ", " << face.first.second << "}\n";
            totalFaces++;
            for (auto color : face.second) {
                cout << "coords:\t{" << color.first.first << ", " << color.first.second << "}\n";
                cout << "\t" << "S, C, F:\t";;
                cout << colorCoordsRev[color.second.getCCoords()] << ", ";
                cout << "{" << color.second.getSCoords().first << ", " << color.second.getSCoords().second << "}, ";
                cout << "{" << color.second.getCCoords().first << ", " << color.second.getCCoords().second << "}, ";
                cout << "{" << color.second.getFCoords().first << ", " << color.second.getFCoords().second << "}\n";
            }
            cout << '\n';
        }
        cout << "totalFaces:\t" << totalFaces << "\n\n";
    }

    void scramble(string &scramble) {
        istringstream ss(scramble);
        string move = "";
        while (ss >> move) {
            rotate(move);
        }
        moves.clear();
    }

    void testScrambles(vector<string> &scrambles, map< pair<int, int>, string > &colorCoordsRev) {
        int total = scrambles.size();
        int numFail = 0;
        for (int i = 0; i < total; ++i) {
            cout << "scramble " << i + 1 << ": " << scrambles[i] << "\n";
            vector<int> x;
            scramble(scrambles[i]);
            solveCross();
            x.push_back(moves.size() - 1);
            solveF2L();
            x.push_back(moves.size() - 1);
            solveOLL();
            x.push_back(moves.size() - 1);
            solvePLL();
            if (!isSolved()) {
                numFail++;
                printMovesDetailed(x);
                printDebugFaces(colorCoordsRev);
            }
            reset();
            cout << "\n";
        }
        cout << "success rate: " << total - numFail << " / " << total;
        cout << " (" << static_cast<double>(total - numFail) / static_cast<double>(total) * 100 << "%)\n";
    }

    bool isSolved() {
        bool solved = true;
        for (auto &face : faces) {
            for (auto &square : face.second) {
                if (square.second.colorCoords != square.second.faceCoords) {
                    solved = false;
                    return solved;
                }
            }
        }
        return solved;
    }

    void solve() {
        solveCross();
        solveF2L();
        solveOLL();
        printMoves();        
    }

    void reset() {
        map< string, pair<int, int> > colorCoords = {
            {"R", {90, 0}},
            {"G", {90, 90}},
            {"O", {90, 180}},
            {"B", {90, 270}},
            {"Y", {0, 0}},
            {"W", {180, 0}}
        };
        string defaultCube = "R R R G G G O O O B B B R R R G G G O O O B B B R R R G G G O O O B B B Y Y Y Y Y Y Y Y W W W W W W W W";
        // istringstream is(defaultCube);
        *this = RubiksCube(defaultCube);
    }

    int mod(int x, int y) {
        return (x % y + y) % y;
    }

private:
    map< pair<int, int>, map< pair<int, int>, Color > > faces;
    map< pair<int, int>, Block > blocks;
    vector<string> moves;
};


int main() {
    map< string, pair<int, int> > colorCoords = {
        {"R", {90, 0}},
        {"G", {90, 90}},
        {"O", {90, 180}},
        {"B", {90, 270}},
        {"Y", {0, 0}},
        {"W", {180, 0}}
    };

    map< pair<int, int>, string > colorCoordsRev = {
        {{90, 0}, "R"},
        {{90, 90}, "G"},
        {{90, 180}, "O"},
        {{90, 270}, "B"},
        {{0, 0}, "Y"},
        {{180, 0}, "W"}
    };

    // string fileName(argv[1]);
    // ifstream fin(fileName);
    // RubiksCube cube(colorCoords, fin);

    string defaultCube = "R R R G G G O O O B B B R R R G G G O O O B B B R R R G G G O O O B B B Y Y Y Y Y Y Y Y W W W W W W W W";
    // istringstream is(defaultCube);
    RubiksCube cube(defaultCube);
    
    // string moves = "F2 L' B2 L2 F' D B2 F D' L D' R2 L' B2 L2 R D B D' U2 R2 L' B L2 F'";
    // white cross: D, B', D', D2, F, D2, L
    // red-green: U', F, U, F', F', U', F
    // green-orange: B', U, B, R', U, R
    // orange-blue: U', L, U', L', U, L, U', L', U, L, U', L'
    // orange-blue: U'  L  U'  L'  U  L  U'  L'  U  L' U   L F U' F'
    // blue-red: U', F, U, F', U, F, U', F'

    // string moves = "F L B2 R B' D2 F' B2 U B D' U' B' L2 D' U L D F R2 L' D' F2 R D2";
    // white cross: F, D', L, D, B2, U, R2, D, L', D', L2
    // red-green: L', U, L, U, F', U, F
    // green-orange: U, B, U', B', U, B, U', B'
    // orange-blue: U2, F, U2, F', U2, L, U', L'
    // blue-red: U', F, U, F', U, L', U', L
    // L-shape: U, F, U, R, U', R', F'
    // U: R2, D, R', U2, R, D', R', U2, R'

    string moves = "F' R' F R D' L D' L F2 R' U2 D' R2 U' D2 B2 L' F L D L2 R' B L2 B2";
    // white cross: U2, F2, U2, R2, U, B2, U', L2
    // red-green: R, U', R', U2, R, U', R'
    // green-orange: F, U, F', U, B, U, B'
    // orange-blue: U', L, U, L', U', L, U, L'
    // blue-red: U', L', U', L, U2, L', U, L

    // string moves = "R D B' D U' R2 L F U2 F' D' R' B' L' U R2 B2 D' L2 U2 R' L D F L2";
    // white cross: D, R', D', U, R2, L2, U, B2, L'
    // red-green: U, B', U, B, U, R, U', R'
    // green-orange: U2, L', U, L, U, R', U, R
    // orange-blue: L', U2, L, U2, B', U', B
    // blue-red: U', L', U, L, U2, F, U, F'
    // I-shape:  U, F, R, U, R', U', F'


    // string moves = "R2 L2 F' D' L' F2 D' U2 R2 D2 B2 U' R D2 U2 L U2 R L' F L2 F D L2 F";
    // white cross: D', R', D
    // red-green: L, U', L', L', U, L, U, F', U, F
    // green-orange: R', U, R, U, R', U, R, U', R', U, R
    // orange-blue: U2, L', U, L, B', U', B
    // blue-red: U, F, U', F', U2, L', U', L

    // cube.scramble(moves);
    // cube.solveCross();
    // cube.solveF2L();
    // cube.solveOLL();
    // cube.printMoves();
    // cube.printDebugFaces(colorCoordsRev);

    vector<string> set1 = {
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
    };

    vector<string> set2 = {
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
    };

    vector<string> scrambles = {moves};
    cube.testScrambles(scrambles, colorCoordsRev);
    // cube.scramble(moves);
    // cube.solveCross();
    // cube.solveF2L();
    // vector<int> x;
    // cube.printMoves();
    // cube.rotate("F");
    // cube.printDebugBlocks(colorCoordsRev);
    // cube.testScrambles(set2, colorCoordsRev);
    
    
    // cube.printDebugBlocks(colorCoordsRev);

}

