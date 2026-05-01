/**
 * @package    mod_geekgame_puzzles
 * @version    1.2.0
 *
 * @copyright  Copyright (C) 2015 - 2026 JoomlaGeek. All Rights Reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 * @author     JoomlaGeek <admin@joomlageek.com>
 * @link       https://www.joomlageek.com
 */

geekGameJigsawPuzzles = function (canvasId, img, options){
	let moduleId = canvasId.replace('-canvas', '');
	let module = document.getElementById(moduleId);
	let winMsg = module.querySelector('.game-win-message');

	let settings = {
		preventOffstageDrag: true,
		image: img,
		pieceSize: options.pieceSize,
		proximity: 10,
		borderFill: 10,
		width: options.canvasWidth,
		height: options.canvasHeight,
		strokeColor: options.strokeColor,
		strokeWidth: options.strokeWidth,
		lineSoftness: 0.18
	};
	if (options.roundedLines) {
		settings.outline = new headbreaker.outline.Rounded();
	}

	let canvas = new headbreaker.Canvas(canvasId, settings);

	canvas.adjustImagesToPuzzleHeight();
	canvas.autogenerate({
		horizontalPiecesCount: options.horizontalPiecesCount,
		verticalPiecesCount: options.verticalPiecesCount
	});
	canvas.shuffle(0.7);
	canvas.draw();

	canvas.onConnect((_piece, figure, _target, targetFigure) => {

		// paint borders on click
		// of conecting and conected figures
		figure.shape.stroke(options.strokeColorActive);
		targetFigure.shape.stroke(options.strokeColorActive);
		canvas.redraw();

		setTimeout(() => {
			// restore border colors
			// later
			figure.shape.stroke(options.strokeColor);
			targetFigure.shape.stroke(options.strokeColor);
			canvas.redraw();
		}, 200);
	});

	canvas.attachSolvedValidator();
	canvas.onValid(() => {
		setTimeout(() => {
			if (winMsg) winMsg.style.display = 'block';
		}, 500);
	})


	//registerButtons('autogen', autogen);
	let btnShuffle = document.getElementById(canvasId + '-shuffle');
	if (btnShuffle) {
		btnShuffle.addEventListener('click', function () {
			canvas.shuffle(0.8);
			canvas.redraw();
			if (winMsg) winMsg.style.display = 'none';
		});
	}
	let btnShuffleGrid = document.getElementById(canvasId + '-shuffle-grid');
	if (btnShuffleGrid) {
		btnShuffleGrid.addEventListener('click', function () {
			canvas.shuffleGrid(1.2);
			canvas.redraw();
			if (winMsg) winMsg.style.display = 'none';
		});
	}
	let btnShuffleColumns = document.getElementById(canvasId + '-shuffle-columns');
	if (btnShuffleColumns) {
		btnShuffleColumns.addEventListener('click', function () {
			canvas.shuffleColumns(1.2);
			canvas.redraw();
			if (winMsg) winMsg.style.display = 'none';
		});
	}
	let btnSolve = document.getElementById(canvasId + '-solve');
	if (btnSolve) {
		btnSolve.addEventListener('click', function () {
			canvas.solve();
			canvas.redraw();
		});
	}


	['resize', 'DOMContentLoaded'].forEach((event) => {
		window.addEventListener(event, () => {
			let container = document.getElementById(canvasId);
			canvas.resize(container.offsetWidth, container.scrollHeight);
			canvas.scale(container.offsetWidth / options.canvasWidth);
			canvas.redraw();
		});
	});
}


