/**
 * @package    mod_geekgame_quiz
 * @version    1.2.0
 *
 * @copyright  Copyright (C) 2015 - 2026 JoomlaGeek. All Rights Reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 * @author     JoomlaGeek <admin@joomlageek.com>
 * @link       https://www.joomlageek.com
 */

geekGameQuiz = function (containerId, settings) {
	let defaults = {
		questions: [],
		message: {
			counter: 'Question {num} of {all}.',
			complete: 'You answered {correct} out of {all} questions correctly.',
			score_perfect: 'Perfect Score!',
			score_great: 'Great Job!',
			score_good: 'Good Job!',
			score_bad: 'Try Again!'
		}
	};
	let options = Object.assign({}, defaults, settings);
	let quizData = options.questions;

	let gameContainer = document.getElementById(containerId);

	let gameEl = gameContainer.querySelector('.quiz-game');
	let resultEl = gameContainer.querySelector('.result-screen');
	let questionTextEl = gameContainer.querySelector('.question-text');
	let answersContainerEl = gameContainer.querySelector('.answers-container');
	let counterEl = gameContainer.querySelector('.question-counter');
	let progressFillEl = gameContainer.querySelector('.progress-fill');

	let finalScore = gameContainer.querySelector('.final-score');
	let scorePercentage = gameContainer.querySelector('.score-percentage');
	let gameMessage = gameContainer.querySelector('.game-message');
	let winMsg = gameContainer.querySelector('.game-win-message');
	let btnRestart = gameContainer.querySelector('.btn-restart');


	let currentQuestionIndex = 0;
	let score = 0;
	let isTransitioning = false;


	if (btnRestart) {
		btnRestart.addEventListener('click', () => {
			restartQuiz();
		})
	}

	function loadQuestion() {
		isTransitioning = false;
		let currentData = quizData[currentQuestionIndex];

		// Update Meta
		counterEl.textContent = options.message.counter.replace('{num}', currentQuestionIndex + 1)
		.replace('{all}', quizData.length);
		progressFillEl.style.width = `${((currentQuestionIndex) / quizData.length) * 100}%`;

		// Update Question Text
		questionTextEl.textContent = currentData.question;

		// Clear and add answers
		answersContainerEl.innerHTML = '';
		currentData.answers.forEach((answer, index) => {
			let button = document.createElement('button');
			button.className = 'answer-btn';
			button.textContent = answer;
			button.onclick = () => selectAnswer(index);
			answersContainerEl.appendChild(button);
		});
	}

	function selectAnswer(selectedIndex) {
		if (isTransitioning) return;
		isTransitioning = true;

		let currentData = quizData[currentQuestionIndex];
		let buttons = answersContainerEl.querySelectorAll('.answer-btn');

		// Disable all buttons
		buttons.forEach(btn => btn.disabled = true);

		if (selectedIndex === currentData.correct) {
			score++;
			buttons[selectedIndex].classList.add('correct');
		} else {
			buttons[selectedIndex].classList.add('wrong');
			buttons[currentData.correct].classList.add('correct');
		}

		setTimeout(() => {
			currentQuestionIndex++;
			if (currentQuestionIndex < quizData.length) {
				loadQuestion();
			} else {
				showResults();
			}
		}, 1500);
	}

	function showResults() {
		gameEl.classList.add('hidden');
		resultEl.style.display = 'block';

		let percentage = Math.round((score / quizData.length) * 100);
		finalScore.innerHTML = `${score}<small>/${quizData.length}</small>`;
		scorePercentage.textContent = `${percentage}%`;

		let feedback = "";
		if (percentage === 100) feedback = options.message.score_perfect;
		else if (percentage >= 80) feedback = options.message.score_great;
		else if (percentage >= 50) feedback = options.message.score_good;
		else feedback = options.message.score_bad;

		let str = options.message.complete.replace('{correct}', score).replace('{all}', quizData.length);
		str = str + ' ' + feedback;

		gameMessage.textContent = str;
		if(percentage === 100 && winMsg) {
			winMsg.style.display = 'block';
		}
	}

	function restartQuiz() {
		currentQuestionIndex = 0;
		score = 0;
		gameEl.classList.remove('hidden');
		resultEl.style.display = 'none';
		if(winMsg) {
			winMsg.style.display = 'none';
		}
		loadQuestion();
	}

	// Initial Start
	document.addEventListener('DOMContentLoaded', loadQuestion);
}
