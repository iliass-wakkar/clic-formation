/**
 * @package    mod_geekgame_matching
 * @version    1.2.0
 *
 * @copyright  Copyright (C) 2015 - 2026 JoomlaGeek. All Rights Reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 * @author     JoomlaGeek <admin@joomlageek.com>
 * @link       https://www.joomlageek.com
 */

geekGameMatchingPairs = function (containerId, gameData) {
	let gameContainer = document.getElementById(containerId);
	let selectedLeft = null;
	let selectedRight = null;
	let matchesFound = 0;

	let gameArea = gameContainer.querySelector('.gmp-game-area');
	let colLeft = gameContainer.querySelector('.col-left');
	let colRight = gameContainer.querySelector('.col-right');
	let svgLines = gameContainer.querySelector('.svg-lines');
	let messageEl = gameContainer.querySelector('.game-message');
	let winMsg = gameContainer.querySelector('.game-win-message');
	let btnReset = gameContainer.querySelector('.btn-reset');

	btnReset.addEventListener('click', () => {
		initGame();
	})

	function shuffle(array) {
		return array.sort(() => Math.random() - 0.5);
	}

	function initGame() {
		// Reset state
		colLeft.innerHTML = '';
		colRight.innerHTML = '';
		svgLines.innerHTML = '';
		messageEl.style.display = 'none';
		selectedLeft = null;
		selectedRight = null;
		matchesFound = 0;
		if (winMsg) winMsg.style.display = 'none';

		// Shuffle independent copies of the data for display
		const leftItems = shuffle([...gameData]);
		const rightItems = shuffle([...gameData]);

		// Render Left Column
		leftItems.forEach(item => {
			const el = createItemElement(item.left, item.id, 'left');
			colLeft.appendChild(el);
		});

		// Render Right Column
		rightItems.forEach(item => {
			const el = createItemElement(item.right, item.id, 'right');
			colRight.appendChild(el);
		});
	}

	function createItemElement(data, id, side) {
		let div = document.createElement('div');
		div.className = 'item';
		div.dataset.id = id;
		div.dataset.side = side;
		div.onclick = handleItemClick;

		if (typeof data.image !== 'undefined' && data.image !== '') {
			let span = document.createElement('span');
			span.className = 'span-img';
			let img = document.createElement('img');
			img.src = data.image;
			img.alt = data.image;
			span.appendChild(img);
			div.appendChild(span);
		}

		if (typeof data.text !== 'undefined' && data.text !== '') {
			let span = document.createElement('span');
			span.className = 'span-text';
			span.innerHTML = data.text;
			div.appendChild(span);
		}

		if (typeof data.audio !== 'undefined' && data.audio !== '') {
			let span = document.createElement('span');
			span.className = 'span-audio';
			div.appendChild(span);

			// Play audio if available
			span.onclick = () => {
				const audio = new Audio(data.audio);
				audio.play().catch(err => console.log('Audio play error:', err));
			}
		}

		return div;
	}

	function handleItemClick(e) {
		const clickedEl = e.currentTarget;

		// Ignore if already matched
		if (clickedEl.classList.contains('correct')) return;

		const side = clickedEl.dataset.side;

		if (side === 'left') {
			if (selectedLeft) selectedLeft.classList.remove('selected');
			selectedLeft = clickedEl;
			selectedLeft.classList.add('selected');
		} else {
			if (selectedRight) selectedRight.classList.remove('selected');
			selectedRight = clickedEl;
			selectedRight.classList.add('selected');
		}

		// Check match if both sides have a selection
		if (selectedLeft && selectedRight) {
			checkMatch();
		}
	}

	function checkMatch() {
		const idLeft = selectedLeft.dataset.id;
		const idRight = selectedRight.dataset.id;

		if (idLeft === idRight) {
			// Match found!
			handleCorrectMatch(selectedLeft, selectedRight);
		} else {
			// Incorrect
			handleIncorrectMatch(selectedLeft, selectedRight);
		}

		// Reset selection markers
		selectedLeft = null;
		selectedRight = null;
	}

	function handleCorrectMatch(el1, el2) {
		el1.classList.remove('selected');
		el2.classList.remove('selected');
		el1.classList.add('correct');
		el2.classList.add('correct');

		drawLine(el1, el2);

		matchesFound++;
		if (matchesFound === gameData.length) {
			messageEl.style.display = 'block';
			if (winMsg) winMsg.style.display = 'block';
		}
	}

	function handleIncorrectMatch(el1, el2) {
		el1.classList.add('incorrect');
		el2.classList.add('incorrect');

		// Remove error classes after animation
		setTimeout(() => {
			el1.classList.remove('incorrect', 'selected');
			el2.classList.remove('incorrect', 'selected');
		}, 500);
	}

	function drawLine(startEl, endEl) {
		const gameAreaRect = gameArea.getBoundingClientRect();
		const startRect = startEl.getBoundingClientRect();
		const endRect = endEl.getBoundingClientRect();

		// Calculate coordinates relative to the SVG/Game Area
		const x1 = startRect.right - gameAreaRect.left;
		const y1 = startRect.top + (startRect.height / 2) - gameAreaRect.top;
		const x2 = endRect.left - gameAreaRect.left;
		const y2 = endRect.top + (endRect.height / 2) - gameAreaRect.top;

		const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		line.setAttribute('x1', x1);
		line.setAttribute('y1', y1);
		line.setAttribute('x2', x2);
		line.setAttribute('y2', y2);

		svgLines.appendChild(line);
	}

	// Initialize on load
	document.addEventListener('DOMContentLoaded', initGame);


	// Redraw lines on the window resize to keep them connected
	window.addEventListener('resize', () => {
		svgLines.innerHTML = '';
		// Find all correct pairs and redraw
		const leftItems = Array.from(colLeft.children).filter(el => el.classList.contains('correct'));
		leftItems.forEach(leftEl => {
			const id = leftEl.dataset.id;
			const rightEl = Array.from(colRight.children).find(el => el.dataset.id === id);
			if (rightEl) {
				drawLine(leftEl, rightEl);
			}
		});

	});
}
