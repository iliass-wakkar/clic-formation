/**
 * @package    mod_geekgame_sudoku
 * @version    1.2.0
 *
 * @copyright  Copyright (C) 2015 - 2026 JoomlaGeek. All Rights Reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 * @author     JoomlaGeek <admin@joomlageek.com>
 * @link       https://www.joomlageek.com
 */

class geekGameSudoku {
	constructor(wrapperId, settings) {
		let defaults = {
			difficulty: 'medium',
			message: {
				complete: 'You have completed the game.'
			}
		};
		this.options = Object.assign({}, defaults, settings);

		this.wrapper = document.getElementById(wrapperId);
		this.container = this.wrapper.querySelector('.sudoku-container');
		//this.difficultySelect = this.wrapper.querySelector('.difficulty');
		this.messageDiv = this.wrapper.querySelector('.game-message');
		this.winMsg = this.wrapper.querySelector('.game-win-message');

		this.selectedCell = null;
		this.board = [];
		this.solution = [];

		this.initEvents();
		this.newGame();
	}

	initEvents() {
		let btnNew = this.wrapper.querySelector('.btn-new');
		let btnRestart = this.wrapper.querySelector('.btn-restart');
		let btnSolve = this.wrapper.querySelector('.btn-solve');
		if(btnNew) {
			btnNew.addEventListener('click', () => this.newGame());
		}
		if(btnRestart) {
			btnRestart.addEventListener('click', () => this.clearSelected());
		}
		if(btnSolve) {
			btnSolve.addEventListener('click', () => this.solveGame());
		}

		this.wrapper.querySelectorAll('.num-btn').forEach(btn => {
			btn.addEventListener('click', () => this.inputNumber(parseInt(btn.dataset.num)));
		});

		document.addEventListener('keydown', (e) => {
			if (e.key >= 1 && e.key <= 9) {
				this.inputNumber(parseInt(e.key));
			} else if (e.key === 'Backspace' || e.key === 'Delete') {
				this.clearSelected();
			}
		});
	}

	generateSudoku() {
		let base = [
			[1, 2, 3, 4, 5, 6, 7, 8, 9],
			[4, 5, 6, 7, 8, 9, 1, 2, 3],
			[7, 8, 9, 1, 2, 3, 4, 5, 6],
			[2, 3, 1, 5, 6, 4, 8, 9, 7],
			[5, 6, 4, 8, 9, 7, 2, 3, 1],
			[8, 9, 7, 2, 3, 1, 5, 6, 4],
			[3, 1, 2, 6, 4, 5, 9, 7, 8],
			[6, 4, 5, 9, 7, 8, 3, 1, 2],
			[9, 7, 8, 3, 1, 2, 6, 4, 5]
		];
		return base;
	}

	newGame() {
		this.messageDiv.textContent = '';
		this.messageDiv.style.display = 'none';
		if(this.winMsg) {
			this.winMsg.style.display = 'none';
		}
		//const difficulty = this.difficultySelect.value;
		let difficulty = this.options.difficulty;
		let threshold = 0.5;

		if (difficulty === 'easy') threshold = 0.3;
		else if (difficulty === 'medium') threshold = 0.5;
		else if (difficulty === 'hard') threshold = 0.7;

		this.solution = this.generateSudoku();
		this.board = this.solution.map(row => row.map(cell => Math.random() > threshold ? cell : null));
		this.renderBoard();
	}

	renderBoard() {
		this.container.innerHTML = '';
		for (let r = 0; r < 9; r++) {
			for (let c = 0; c < 9; c++) {
				const cellDiv = document.createElement('div');
				cellDiv.classList.add('cell');
				if (r === 2 || r === 5) cellDiv.classList.add(`cell-row-${r}`);

				const val = this.board[r][c];
				if (val !== null) {
					cellDiv.textContent = val;
					cellDiv.classList.add('fixed');
				} else {
					cellDiv.addEventListener('click', () => this.selectCell(cellDiv, r, c));
				}
				cellDiv.dataset.row = r;
				cellDiv.dataset.col = c;
				this.container.appendChild(cellDiv);
			}
		}
	}

	selectCell(element, r, c) {
		if (this.selectedCell) {
			this.selectedCell.element.classList.remove('selected');
		}
		this.selectedCell = { element, r, c };
		element.classList.add('selected');
	}

	inputNumber(num) {
		if (!this.selectedCell) return;
		const { r, c, element } = this.selectedCell;

		element.textContent = num;
		if (num === this.solution[r][c]) {
			element.classList.remove('wrong');
		} else {
			element.classList.add('wrong');
		}

		this.checkWin();
	}

	clearSelected() {
		if (!this.selectedCell) return;
		this.selectedCell.element.textContent = '';
		this.selectedCell.element.classList.remove('wrong');
	}

	solveGame() {
		if (!this.solution || this.solution.length === 0) return;

		const cells = this.container.querySelectorAll('.cell');
		cells.forEach(cell => {
			const r = parseInt(cell.dataset.row);
			const c = parseInt(cell.dataset.col);

			cell.textContent = this.solution[r][c];
			cell.classList.remove('wrong');
			cell.classList.remove('selected');

			if (!cell.classList.contains('fixed')) {
				cell.style.color = 'var(--game-color-primary)';
			}
		});
		this.selectedCell = null;
	}

	checkWin() {
		const cells = this.container.querySelectorAll('.cell');
		let win = true;
		cells.forEach(cell => {
			const r = cell.dataset.row;
			const c = cell.dataset.col;
			if (cell.textContent != this.solution[r][c]) {
				win = false;
			}
		});
		if (win) {
			cells.forEach(cell => {
				cell.classList.add('correct-game');
				cell.classList.remove('selected');
			});
			this.selectedCell = null;
			this.messageDiv.textContent = this.options.message.complete;
			this.messageDiv.style.display = 'block';
			if(this.winMsg) {
				this.winMsg.style.display = 'block';
			}
		}
	}
}
