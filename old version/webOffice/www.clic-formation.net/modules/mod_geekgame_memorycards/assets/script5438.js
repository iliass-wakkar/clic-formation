/**
 * @package    mod_geekgame_memorycards
 * @version    1.2.0
 *
 * @copyright  Copyright (C) 2015 - 2026 JoomlaGeek. All Rights Reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 * @author     JoomlaGeek <admin@joomlageek.com>
 * @link       https://www.joomlageek.com
 */

geekGameMemoryCards = function (containerId, settings) {
	let defaults = {
		cards: [],
		msgMove: 'Moves: [num]',
		msgComplete: 'Completed'
	};
	let options = Object.assign({}, defaults, settings);


	let gameContainer = document.getElementById(containerId);
	let cards = [];
	let firstCard, secondCard;
	let lockBoard = false;
	let numMove = 0;

	let gridContainer = gameContainer.querySelector(".grid-container");
	let msgDiv = gameContainer.querySelector(".game-message");
	let winMsg = gameContainer.querySelector(".game-win-message");
	let btnRestart = gameContainer.querySelector('.btn-restart');

	if (btnRestart) {
		btnRestart.addEventListener('click', function (e) {
			restart();
		});
	}
	if (msgDiv) {
		msgDiv.textContent = options.msgMove.replace('[num]', numMove);
	}

	cards = [...options.cards, ...options.cards];
	shuffleCards();
	generateCards();

	function shuffleCards() {
		let currentIndex = cards.length,
			randomIndex,
			temporaryValue;
		while (currentIndex !== 0) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			temporaryValue = cards[currentIndex];
			cards[currentIndex] = cards[randomIndex];
			cards[randomIndex] = temporaryValue;
		}
	}

	function generateCards() {
		for (let card of cards) {
			const cardElement = document.createElement("div");
			cardElement.classList.add("gmm-card");
			cardElement.setAttribute("data-name", card.name);
			cardElement.innerHTML = `
      <div class="front">
        <img class="front-image" src=${card.image} />
      </div>
      <div class="back"></div>
    `;
			gridContainer.appendChild(cardElement);
			cardElement.addEventListener("click", flipCard);
		}
	}

	function flipCard() {
		if (lockBoard) return;
		if (this === firstCard) return;

		this.classList.add("flipped");

		if (!firstCard) {
			firstCard = this;
			return;
		}

		secondCard = this;
		numMove++;
		if (msgDiv) {
			msgDiv.textContent = options.msgMove.replace('[num]', numMove);
		}
		lockBoard = true;

		checkForMatch();
		//check if all cards flipped
		let numCards = gridContainer.querySelectorAll('.gmm-card').length;
		let numFlipped = gridContainer.querySelectorAll('.flipped').length;

		if (numCards === numFlipped) {
			if (msgDiv) {
				msgDiv.textContent = options.msgComplete.replace('[num]', numMove);
			}
			if(winMsg) {
				winMsg.style.display = 'block';
			}
		}
	}

	function checkForMatch() {
		let isMatch = firstCard.dataset.name === secondCard.dataset.name;

		isMatch ? disableCards() : unflipCards();
	}

	function disableCards() {
		firstCard.removeEventListener("click", flipCard);
		secondCard.removeEventListener("click", flipCard);

		resetBoard();
	}

	function unflipCards() {
		setTimeout(() => {
			firstCard.classList.remove("flipped");
			secondCard.classList.remove("flipped");
			resetBoard();
		}, 1000);
	}

	function resetBoard() {
		firstCard = null;
		secondCard = null;
		lockBoard = false;
	}

	function restart() {
		resetBoard();
		shuffleCards();
		numMove = 0;
		if (msgDiv) {
			msgDiv.textContent = options.msgMove.replace('[num]', numMove);
		}
		if(winMsg) {
			winMsg.style.display = 'none';
		}
		gridContainer.innerHTML = "";
		generateCards();
	}
}


