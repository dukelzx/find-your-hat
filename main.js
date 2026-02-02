const prompt = require('prompt-sync')({ sigint: true });

const hat = '^';
const hole = 'O';
const fieldCharacter = '█';
const pathCharacter = '*';
class Field {
    constructor(field) {
        this.field = field;
        this.playerPosition = { x: 0, y: 0 };
        this.field[0][0] = pathCharacter; // Starting position
    }
    print() {
        process.stdout.write('\x1Bc');
        const width = this.field[0].length;
        const border = '—'.repeat(width * 2 + 3);
        console.log(border);
        for (let row of this.field) {
            console.log('| ' + row.join(' ') + ' |');
            console.log('|' + ' '.repeat(width * 2 + 1) + '|');
        }
        console.log(border);
    }
    askQuestion() {
        const moves = {
            'u': { y: -1, x: 0 },
            'd': { y: 1, x: 0 },
            'l': { y: 0, x: -1 },
            'r': { y: 0, x: 1 }
        };

        let isValid = false;
        while (!isValid) {
            const move = prompt('Which way? (u, d, l, r): ').toLowerCase();
            if (moves[move]) {
                this.playerPosition.y += moves[move].y;
                this.playerPosition.x += moves[move].x;
                isValid = true;
            } else {
                console.log('Wrong prompt! Please enter u, d, l or r.');
            }
        }
    }
    isOutOfBounds() {
        return (
            this.playerPosition.y < 0 ||
            this.playerPosition.y >= this.field.length ||
            this.playerPosition.x < 0 ||
            this.playerPosition.x >= this.field[0].length
        );
    }
    updatePath() {
        this.field[this.playerPosition.y][this.playerPosition.x] = pathCharacter;
    }
    playGame() {
        const colorRed = '\x1b[31m';   // Red for game over
        const colorGreen = '\x1b[32m'; // Green for win
        const colorReset = '\x1b[0m';  // Reset to default white
        let playing = true;
        while (playing) {
            this.print();
            const oldPosition = { ...this.playerPosition };
            this.askQuestion();
            if (this.isOutOfBounds()) {
                console.log(`${colorRed}Out of bounds - Game Over!${colorReset}`);
                playing = false;
            } else {
                const tile = this.field[this.playerPosition.y][this.playerPosition.x];
                if (tile === hole) {
                    this.field[oldPosition.y][oldPosition.x] = fieldCharacter;
                    this.field[this.playerPosition.y][this.playerPosition.x] = `${colorRed}${pathCharacter}${colorReset}`;
                    this.print();
                    console.log(`${colorRed}You fell into a hole - Game Over!${colorReset}`);
                    playing = false;
                } else if (tile === hat) {
                    this.field[oldPosition.y][oldPosition.x] = fieldCharacter;
                    this.field[this.playerPosition.y][this.playerPosition.x] = `${colorGreen}${pathCharacter}${colorReset}`;
                    this.print();
                    console.log(`${colorGreen}You found your hat - You Win!${colorReset}`);
                    playing = false;
                } else {
                    this.field[oldPosition.y][oldPosition.x] = fieldCharacter;
                    this.updatePath();
                }
            }
        }
    }
    static generateField(height, width, percentage = 0.2) {
        const field = new Array(height).fill(0).map(() => new Array(width).fill(fieldCharacter));
        const numberOfHoles = Math.floor(height * width * percentage);
        let holesPlaced = 0;
        while (holesPlaced < numberOfHoles) {
            const y = Math.floor(Math.random() * height);
            const x = Math.floor(Math.random() * width);
            if (field[y][x] === fieldCharacter && !(y === 0 && x === 0)) {
                field[y][x] = hole;
                holesPlaced++;
            }
        }
        let hatPlaced = false;
        while (!hatPlaced) {
            const hatY = Math.floor(Math.random() * height);
            const hatX = Math.floor(Math.random() * width);
            if (field[hatY][hatX] === fieldCharacter && !(hatY === 0 && hatX === 0)) {
                field[hatY][hatX] = hat;
                hatPlaced = true;
            }
        }
        field[0][0] = pathCharacter; // Ensure starting position is clear
        return field;
    }
}
// --- 交互式启动 ---
// --- Game Configuration ---
console.log('--- Find Your Hat: Map Settings ---');
const mode = prompt('Choose Mode: (1) Default 7x10, (2) Custom Map: ');
let gameField;
if (mode === '2') {
    // CUSTOM MODE: User specifies all parameters
    console.log('\n--- Custom Map Configuration ---');
    // Prompt for Map Height and validate the input
    let h = Number(prompt('Height (Recommended 5-20): '));
    if (isNaN(h) || h < 3) {
        console.log('Invalid input or too small. Defaulting to 10.');
        h = 10;
    }

    // Prompt for Map Width and validate the input
    let w = Number(prompt('Width (Recommended 5-20): '));
    if (isNaN(w) || w < 3) {
        console.log('Invalid input or too small. Defaulting to 10.');
        w = 10;
    }

    // Prompt for Hole Percentage and validate the input
    let p = Number(prompt('Hole Percentage (Recommended 0.1 - 0.4): '));
    if (isNaN(p) || p <= 0 || p >= 1) {
        console.log('Invalid input. Defaulting to 0.2.');
        p = 0.2;
    } else if (p > 0.5) {
        // Cap the percentage at 0.5 to prevent generating unsolvable maps
        console.log('Percentage too high for a playable map. Capping at 0.5.');
        p = 0.5;
    }
    gameField = Field.generateField(h, w, p);
    prompt('Settings complete. Press Enter to start the game...');
    // Initialize and start the game
} else {
    // DEFAULT MODE: Quick start with preset values
    console.log('\nStarting with default settings (7x10, 20% holes)...');
    gameField = Field.generateField(7, 10, 0.2);
}

// Initialize the game with the selected field
const myField = new Field(gameField);
myField.playGame();