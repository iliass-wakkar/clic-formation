/**
 * @package    mod_geekgame_wordfind
 * @version    1.2.0
 *
 * @copyright  Copyright (C) 2015 - 2026 JoomlaGeek. All Rights Reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 * @author     JoomlaGeek <admin@joomlageek.com>
 * @link       https://www.joomlageek.com
 */

/**
 * Folk of the WordFind library by Bunkat.
 * http://github.com/bunkat/wordfind
 */

var geekGameWordFind = window.geekGameWordFind || {};

(function (document, $) {
	'use strict';


	/**
	 * Initializes the GeekWordFind object.
	 *
	 * Creates a new word find game and draws the board and words.
	 *
	 * Returns the puzzle that was created.
	 *
	 * @param {Element} container: Module container
	 * @param {Options} options: WordFind options to use when creating the puzzle
	 */
	geekGameWordFind = function (container, options) {

		let self = this;

		self.wordfind = new WordFind(options);
		self.container = container;
		self.options = options;

		// Class properties, game initial config:
		self.wordList = null;
		self.puzzle = null;

		self.puzzleEl = container.find('.gwf-puzzle')[0];
		self.wordsEl = container.find('.gwf-words')[0];
		self.msgDiv = container.find('.game-message');
		self.winDiv = container.find('.game-win-message');
		self.numWords = $(self.wordsEl).find('span.word').toArray().length;

		self.isDragging = false;

		container.find('.btn-restart').click(function () {
			self.initialize();
		});
		container.find('.btn-solve').click(function () {
			self.solve();
		});

		/**
		 * Game play events.
		 *
		 * The following events handle the turns, word selection, word finding, and
		 * game end.
		 *
		 */

		// Game state
		self.startSquare = null;
		self.selectedSquares = [];
		self.curOrientation = null;
		self.curWord = '';

		self.initialize = function () {
			try {
				if(self.winDiv.length) {
					self.winDiv.hide();
				}
				/* Constructor START */
				$(self.wordsEl).find('span.word').removeClass('wordFound');

				// Class properties, game initial config:
				self.wordList = self.getWords();
				self.puzzle = self.wordfind.newPuzzleLax(self.wordList, self.options);


				// Draw all of the words
				self.drawPuzzle($(self.puzzleEl), self.puzzle);

				// attach events to the buttons
				// optimistically add events for windows 8 touch
				if (window.navigator.msPointerEnabled) {
					self.container.find('.puzzleSquare').on('MSPointerDown', self.startTurn)
					.on('MSPointerOver', self.select)
					.on('MSPointerUp', self.endTurn);
				} else {
					self.container.find('.puzzleSquare').mousedown(self.startTurn)
					.mouseenter(self.mouseMove)
					.mouseup(self.endTurn)
					.on("touchstart", self.startTurn)
					.on("touchmove", self.touchMove)
					.on("touchend", self.endTurn);
				}
				self.wordfind.print(self);
			} catch (error) {
				self.msgDiv.text(self.options.errGenerateGrid).addClass('error').show();
			}
		}


		self.getWords = function () {
			return $(self.wordsEl).find('span.word').toArray().map(wordEl => $(wordEl).data('value').toUpperCase()).filter(word => word);
		};
		/**
		 * Event that handles mouse down on a new square. Initializes the game state
		 * to the letter that was selected.
		 *
		 */
		self.startTurn = function () {
			self.isDragging = true;
			$(this).addClass('selected');
			self.startSquare = this;
			self.selectedSquares.push(this);
			self.curWord = $(this).text();
		};

		self.touchMove = function (e) {
			//let xPos = e.originalEvent.touches[0].pageX;
			//let yPos = e.originalEvent.touches[0].pageY;
			let touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			let xPos = touch.clientX;
			let yPos = touch.clientY;
			let targetElement = document.elementFromPoint(xPos, yPos);
			self.select(targetElement)
		};

		self.mouseMove = function () {
			self.select(this);
		};

		/**
		 * Event that handles mouse over on a new square. Ensures that the new square
		 * is adjacent to the previous square and the new square is along the path
		 * of an actual word.
		 *
		 */
		self.select = function (target) {
			// if the user hasn't started a word yet, just return
			if (!self.startSquare) {
				return;
			}

			// if the new square is actually the previous square, just return
			let lastSquare = self.selectedSquares[self.selectedSquares.length - 1];
			if (lastSquare == target) {
				return;
			}

			// see if the user backed up and correct the self.selectedSquares state if
			// they did
			let backTo;
			for (let i = 0, len = self.selectedSquares.length; i < len; i++) {
				if (self.selectedSquares[i] == target) {
					backTo = i + 1;
					break;
				}
			}

			while (backTo < self.selectedSquares.length) {
				$(self.selectedSquares[self.selectedSquares.length - 1]).removeClass('selected');
				self.selectedSquares.splice(backTo, 1);
				self.curWord = self.curWord.substr(0, self.curWord.length - 1);
			}


			// see if this is just a new orientation from the first square
			// this is needed to make selecting diagonal words easier
			let newOrientation = self.calcOrientation(
				$(self.startSquare).attr('x') - 0,
				$(self.startSquare).attr('y') - 0,
				$(target).attr('x') - 0,
				$(target).attr('y') - 0
			);

			if (newOrientation) {
				self.selectedSquares = [self.startSquare];
				self.curWord = $(self.startSquare).text();
				if (lastSquare !== self.startSquare) {
					$(lastSquare).removeClass('selected');
					lastSquare = self.startSquare;
				}
				self.curOrientation = newOrientation;
			}

			// see if the move is along the same orientation as the last move
			let orientation = self.calcOrientation(
				$(lastSquare).attr('x') - 0,
				$(lastSquare).attr('y') - 0,
				$(target).attr('x') - 0,
				$(target).attr('y') - 0
			);

			// if the new square isn't along a valid orientation, just ignore it.
			// this makes selecting diagonal words less frustrating
			if (!orientation) {
				return;
			}

			// finally, if there was no previous orientation or this move is along
			// the same orientation as the last move then play the move
			if (!self.curOrientation || self.curOrientation === orientation) {
				self.curOrientation = orientation;
				self.playTurn(target);
			}
		};

		/**
		 * Updates the game state when the previous selection was valid.
		 *
		 * @param {el} square: The jQuery element that was played
		 */
		self.playTurn = function (square) {

			// make sure we are still forming a valid word
			for (let i = 0, len = self.wordList.length; i < len; i++) {
				if (self.wordList[i].indexOf(self.curWord + $(square).text()) === 0) {
					$(square).addClass('selected');
					self.selectedSquares.push(square);
					self.curWord += $(square).text();
					break;
				}
			}
		};

		/**
		 * Event that handles mouse up on a square. Checks to see if a valid word
		 * was created and updates the class of the letters and word if it was. Then
		 * resets the game state to start a new word.
		 *
		 */
		self.endTurn = function () {
			self.isDragging = false;

			// see if we formed a valid word
			for (let i = 0, len = self.wordList.length; i < len; i++) {
				if (self.wordList[i] === self.curWord) {
					self.container.find('.puzzleSquare.selected').addClass('found');
					self.wordList.splice(i, 1);
					$(self.wordsEl).find('span.word[data-value="' + self.curWord + '"]').addClass('wordFound');
				}

				if (self.wordList.length === 0) {
					self.container.find('.puzzleSquare').addClass('complete');
				}
			}

			// reset the turn
			self.container.find('.puzzleSquare.selected').removeClass('selected');
			self.startSquare = null;
			self.selectedSquares = [];
			self.curWord = '';
			self.curOrientation = null;

			//Show progress
			if (self.numWords) {
				let foundWord = self.numWords - self.wordList.length;
				let msg = self.options.msgProgress.replace('{found}', foundWord).replace('{all}', self.numWords);
				self.msgDiv.html(msg).removeClass('error').show();
				if(foundWord === self.numWords) {
					if(self.winDiv.length) {
						self.winDiv.show();
					}
				}
			}
		};


		/**
		 * An example game using the puzzles created from wordfind.js. Click and drag
		 * to highlight words.
		 *
		 * GeekWordFind requires wordfind.js and jQuery.
		 */

		/**
		 * Draws the puzzle by inserting rows of buttons into el.
		 *
		 * @param {Element} el: The jQuery element to write the puzzle to
		 * @param {[[String]]} puzzle: The puzzle to draw
		 */
		self.drawPuzzle = function (el, puzzle) {
			let output = '';
			// for each row in the puzzle
			for (let i = 0, height = puzzle.length; i < height; i++) {
				// append a div to represent a row in the puzzle
				let row = puzzle[i];
				output += '<div>';
				// for each element in that row
				for (let j = 0, width = row.length; j < width; j++) {
					// append our button with the appropriate class
					output += '<button class="puzzleSquare" x="' + j + '" y="' + i + '">';
					output += row[j] || '&nbsp;';
					output += '</button>';
				}
				// close our div that represents a row
				output += '</div>';
			}

			$(el).html(output);
		};

		/**
		 * Given two points, ensure that they are adjacent and determine what
		 * orientation the second point is relative to the first
		 *
		 * @param {int} x1: The x coordinate of the first point
		 * @param {int} y1: The y coordinate of the first point
		 * @param {int} x2: The x coordinate of the second point
		 * @param {int} y2: The y coordinate of the second point
		 */
		self.calcOrientation = function (x1, y1, x2, y2) {

			for (let orientation in self.wordfind.orientations) {
				let nextFn = self.wordfind.orientations[orientation];
				let nextPos = nextFn(x1, y1, 1);

				if (nextPos.x === x2 && nextPos.y === y2) {
					return orientation;
				}
			}

			return null;
		};

		self.emptySquaresCount = function () {
			let allSquares = self.container.find('.puzzleSquare').toArray();
			return allSquares.length - allSquares.filter(b => b.textContent.trim()).length;
		};


		/**
		 * Solves an existing puzzle.
		 *
		 * @param {[[String]]} puzzle: The puzzle to solve
		 */
		self.solve = function () {
			let solution = self.wordfind.solve(self.puzzle, self.wordList).found;

			for (let i = 0, len = solution.length; i < len; i++) {
				let word = solution[i].word,
					orientation = solution[i].orientation,
					x = solution[i].x,
					y = solution[i].y,
					next = self.wordfind.orientations[orientation];

				let wordEl = $(self.wordsEl).find('span.word[data-value="' + word + '"]');
				if (!wordEl.hasClass('wordFound')) {
					for (let j = 0, size = word.length; j < size; j++) {
						let nextPos = next(x, y, j);
						self.container.find('[x="' + nextPos.x + '"][y="' + nextPos.y + '"]').addClass('solved');
					}

					wordEl.addClass('wordFound');
				}
			}
		};


		// Function to prevent default touch events
		self.preventDefaultScroll = function (e) {
			//console.log("Word find dragging: ", self.isDragging);
			if (self.isDragging) {
				e.preventDefault();
			}
		}


		// Add the event listener to the document
		// { passive: false } is crucial for preventDefault() to work effectively on mobile
		document.addEventListener('touchmove', self.preventDefaultScroll, { passive: false });


		self.initialize();

	};

}(document, jQuery));
