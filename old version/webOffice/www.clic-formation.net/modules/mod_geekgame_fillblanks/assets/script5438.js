/**
 * @package    mod_geekgame_fillblanks
 * @version    1.2.0
 *
 * @copyright  Copyright (C) 2015 - 2026 JoomlaGeek. All Rights Reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 * @author     JoomlaGeek <admin@joomlageek.com>
 * @link       https://www.joomlageek.com
 */

/**
 * Folk of the original quizy-fillintheblank.js plugin
 * https://github.com/frenski/quizy-fillintheblank
 */

var geekGameFillTheBlanks = window.geekGameFillTheBlanks || {};

(function ($) {
	geekGameFillTheBlanks = function (container, options) {

		let self = this;

		self.textDiv = container.find('.geek-fill-blank-text');
		self.wordDiv = container.find('.geek-fill-blank-words');
		self.msgDiv = container.find('.game-message');
		self.winDiv = container.find('.game-win-message');
		self.msgComplete = options ? options.msgComplete : 'Correct answers: {correct}/{all}';

		container.find('.btn-restart').click(function () {
			restartGame();
		});

		self.opts = $.extend(true, {}, {
			containerId: 'geek-fill-blank-container',
			elementAnId: 'geek-fill-blank-words-',
			textItems: ['Text part1', 'text part 2', 'text part 3'],
			elementTextId: 'geek-fill-blank-text',
			anItems: ['an1', 'an2', 'an3'],
			anItemsCorrect: [2, 0],
			answerId: 'd-answer',
			phId: 'd-nest',
			checkId: 'd-check',
			numberId: 'd-number',
			blockSize: 100,
			blockSizeHeight: 20,
			onFinishCall: '',
			onLoadCall: '',
			allowTouchDrag: false,
			onFinishCall: function (param) {
				let str = self.msgComplete.replace('{correct}', param.correct_answers).replace('{all}', param.all_answers);
				self.msgDiv.html(str).show();
				if(param.correct_answers === param.all_answers) {
					if(self.winDiv.length > 0) {
						self.winDiv.show();
					}
				}
			}
		}, options);

		// DOM elements for the text and the draggable answers
		self.el1 = $('#' + self.opts.elementAnId);
		self.el2 = $('#' + self.opts.elementTextId);

		// keeps the text items given in the parameters
		self.textItems = self.opts.textItems;

		// keeps the order of the items given in the parameters
		self.anItemsOrderArr = self.opts.anItemsCorrect;

		// keeps all the answers themself given in the parameters
		self.anItemsArr = self.opts.anItems;

		// keeps the number of the answers and the number of the drop places
		self.anNum = self.anItemsArr.length;
		self.phNum = self.anItemsOrderArr.length;


		// FUNCTIONS **************************************************************
		// ************************************************************************

		// A helper function to check whether we are dealing with a touch devices
		function isTouchDevice() {
			return (('ontouchstart' in window) ||
				(navigator.maxTouchPoints > 0) ||
				(navigator.msMaxTouchPoints > 0));
		}

		// Function that enables click event on objects that have already been
		// dragged with the idea to enable them to be put back
		function handleDraggedClick(event, elem) {
			// If draggable is disabled - to prevent firing active/unassigned ones
			if (elem.draggable('option', 'disabled')) {
				// setting main variables
				let idAttr = elem.attr('id');
				let dragId = idAttr.substring(self.opts.answerId.length, idAttr.length);
				let dropId = self.anDroppedTrack[parseInt(dragId)];
				let dropElem = $('#' + self.opts.phId + dropId);
				// enables the drag again
				elem.draggable('enable');
				elem.draggable('option', 'revert', true);
				elem.removeClass('geek-fill-blank-drop-element-disabled');
				// moves back the item to the initial position
				elem.offset(self.anItemsInitPos[idAttr]);
				dropElem.droppable('enable');
				// decreases the answered items count
				self.anCount--;
				// removes drop id assignment
				self.anDroppedTrack[parseInt(dragId)] = null;
				// puts back the wrong answer icon and reduces the correct drops counter
				if (self.anItemsOrderArr[dropId] == dragId) {
					$('#' + self.opts.checkId + dragId).addClass('geek-fill-blank-res-no')
					.removeClass('geek-fill-blank-res-yes')
					.html('&#10005;'); //adds Cross mark symbol
					self.correctDrops--; //decreases the correct answers counter
				}
			}
		}

		function handleUndraggedTrigger(dragObj, dropObj) {
			dropObj.droppable('disable');
			dragObj.addClass('geek-fill-blank-drop-element-disabled');
			dragObj.draggable('disable');
			dragObj.position({of: dropObj, my: 'left top', at: 'left top'});
			dragObj.draggable('option', 'revert', false);

			// gets the corresponding id's of the droppable and draggable elements
			let idAttr = dropObj.attr('id');
			let dropId = idAttr.substring(self.opts.phId.length, idAttr.length);
			idAttr = dragObj.attr('id');
			let dragId = idAttr.substring(self.opts.answerId.length, idAttr.length);

			// compares the ids and adds the necessary class if they match, meaning
			// that the answer the user has dropped is correct
			if (self.anItemsOrderArr[dropId] == dragId) {
				$('#' + self.opts.checkId + dragId).removeClass('geek-fill-blank-res-no')
				.addClass('geek-fill-blank-res-yes')
				.html('&#10003;'); //adds Checkmark symbol
				self.correctDrops++; //increases the correct answers counter
			}

			// Keeping track of dropped positions of the dragged items
			self.anDroppedTrack[parseInt(dragId)] = parseInt(dropId);

			// starts the counter if it's the first time the user drops an element
			if (!self.timerStarted) {
				self.gameTimer = setInterval(incTime, 1000);
				self.timerStarted = true;
			}

			// increases the total answer counter
			self.anCount++;

			// if the number of dropped items is the same as the placeholders
			if (self.anCount === self.phNum) {
				// clears the timer
				clearInterval(self.gameTimer);
				// shows the correct answers
				$('.' + self.opts.checkId).fadeIn();
				$('.' + self.opts.numberId).fadeIn();
				// if set in the opts, calls the callback function
				if (self.opts.onFinishCall !== '') {
					self.opts.onFinishCall({
						correct_answers: self.correctDrops,
						all_answers: self.phNum,
						time: self.numSeconds
					});
				}
				$(self.el1).find('.draggable-element').off('click');
				if (isTouchDevice()) {
					let dragEls = $(self.el1).find('.draggable-element');
					for (let i = 0; i < dragEls.length; i++) {
						unBindEvent(dragEls[i], "touchstart", handleTouchStart, true);
					}
				}
			}
		}

		// Function for handling the dragging
		function handleDragStop(event, ui) {
			let offsetXPos = parseInt(ui.offset.left);
			let offsetYPos = parseInt(ui.offset.top);
		}

		// Function for handling the dragging
		function handleDragStart(event, ui) {
			let offsetXPos = parseInt(ui.offset.left);
			let offsetYPos = parseInt(ui.offset.top);
			self.anItemsInitPos[$(this).attr('id')] = {top: offsetYPos, left: offsetXPos};
		}

		// Function for handling the dropping
		function handleDropOn(event, ui) {
			// disables the draggable element and adds the necessary classes
			let thisDropObj = $(this);
			let thisDragObj = ui.draggable;
			handleUndraggedTrigger(thisDragObj, thisDropObj);
		}

		function handleTouchStart(e) {
			// gets main variables
			let elem = e.target;
			let idAttr = elem.getAttribute('id');
			let dragId = idAttr.substring(self.opts.answerId.length, idAttr.length);
			let dropId = self.anDroppedTrack[parseInt(dragId)];
			let thisDragObj = $('#' + idAttr);
			// if no drop has happened, the dropId is null
			if (dropId === null) {
				for (let i = 0; i < self.phNum; i++) {
					if (Object.values(self.anDroppedTrack).indexOf(i) === -1) {
						dropId = i;
						break;
					}
				}
				let thisDropObj = $('#' + self.opts.phId + dropId);
				let offsetXPos = parseInt(thisDragObj.offset().left);
				let offsetYPos = parseInt(thisDragObj.offset().top);
				self.anItemsInitPos[idAttr] = {top: offsetYPos, left: offsetXPos};
				thisDragObj.offset({top: thisDropObj.offset.top, left: thisDropObj.offset.left});
				handleUndraggedTrigger(thisDragObj, thisDropObj);
				// else, dragged click handler is called
			} else {
				handleDraggedClick(event, thisDragObj);
			}


		}

		// Time increase function
		let incTime = function () {
			self.numSeconds++;
		}

		// Functions for handling the touch events in the touch devices********

		// Merging the attachEvent func of IE to the standard one
		function bindEvent(el, eventName, eventHandler, boolr) {
			if (el.addEventListener) {
				el.addEventListener(eventName, eventHandler, boolr);
			} else if (el.attachEvent) {
				el.attachEvent('on' + eventName, eventHandler);
			}
		}


		// Merging the attachEvent func of IE to the standard one
		function unBindEvent(el, eventName, eventHandler, boolr) {
			if (el.removeEventListener) {
				el.removeEventListener(eventName, eventHandler, boolr);
			} else if (el.detachEvent) {
				el.detachEvent('on' + eventName, eventHandler);
			}
		}

		// Makes elements with class 'draggable-element' draggable on touch devices
		function touchHandler(event) {
			let touches = event.changedTouches,
				first = touches[0],
				type = "";

			switch (event.type) {
				case "touchstart":
					type = "mousedown";
					break;
				case "touchmove":
					type = "mousemove";
					break;
				case "touchend":
					type = "mouseup";
					break;
				default:
					return;
			}
			let simulatedEvent = document.createEvent("MouseEvent");
			simulatedEvent.initMouseEvent(type, true, true, window, 1,
				first.screenX, first.screenY,
				first.clientX, first.clientY, false,
				false, false, false, 0, null);

			first.target.dispatchEvent(simulatedEvent);

			if ($(event.target).hasClass('draggable-element')
				|| $(event.target).parent().hasClass('draggable-element')) {
				event.preventDefault();
			}
		}

		// A Function to define the touch event
		function initTouch() {
			bindEvent(document, "touchstart", touchHandler, true);
			bindEvent(document, "touchmove", touchHandler, true);
			bindEvent(document, "touchend", touchHandler, true);
			bindEvent(document, "touchcancel", touchHandler, true);
		}


		// MAIN CODE **************************************************************
		// ************************************************************************


		function initGame() {

			// keeps the number of successful drop attempts
			self.anCount = 0;

			//counts the amount of seconds to complete it
			self.numSeconds = 0;

			//keeps how many correct answers the user has
			self.correctDrops = 0;

			// a timer variable
			self.gameTimer;

			// a timer variable
			self.timerStarted = false;

			// keeps initial xy positions of the draggable items
			self.anItemsInitPos = {};

			// keeps track of the placeholders dragged positions
			self.anDroppedTrack = {};

			// Adding the text and the placeholders (the drop-target places)
			for (let i = 0; i < self.phNum; i++) {
				self.el2.append('<span>' + self.textItems[i] + '</span> <span id="' +
					self.opts.phId + i +
					'" style="width:' + self.opts.blockSize + 'px; height:' +
					self.opts.blockSizeHeight +
					'px; " class="droppable-element geek-fill-blank-drop-target"></span>');

				// If it's the last drop item, adds one text more at the end
				if (i === self.phNum - 1) {
					let nId = i + 1;
					self.el2.append('<span>' + self.textItems[nId] + '</span>');
				}
			}

			// Adding the draggable elements - the possible answers
			let elToAppend = self.el1;

			for (let i = 0; i < self.anNum; i++) {
				// appends the div with the draggable answers
				elToAppend.append('<div id="'
					+ self.opts.answerId + i +
					'" class="geek-fill-blank-answer draggable-element ' +
					'geek-fill-blank-drop-element" style="width:' + self.opts.blockSize +
					'px; height: ' + self.opts.blockSizeHeight + 'px;">' +
					self.anItemsArr[i] + '</div>');

				// appends divs showing if the answers are correct (They will be hidden)
				$('#' + self.opts.answerId + i)
				.append('<div id="' + self.opts.checkId + i +
					'" class="geek-fill-blank-res geek-fill-blank-res-no ' +
					self.opts.checkId + '">x</div>');
				/*.append('<div id="' +
					self.opts.numberId + i +
					'" class="geek-fill-blank-res geek-fill-blank-res-num ' +
					self.opts.checkId + '">' +
					(parseInt(self.anItemsOrderArr.indexOf(i)) + 1) +
					'</div>');*/
				self.anDroppedTrack[i] = null;
			}

			// Adding drag functionality to the draggable elements (from jQuery UI)
			$(self.el1).find('.draggable-element').draggable({
				cursor: 'move',
				containment: '#'+self.opts.containerId,
				stop: handleDragStop,
				start: handleDragStart,
				revert: true
			});


			$(self.el1).find('.draggable-element').on('click', function (e) {
				handleDraggedClick(e, $(this));
			});

			// Adding drop functionality to the draggable elements (from jQuery UI)
			$(self.el2).find('.droppable-element').droppable({
				drop: handleDropOn,
				hoverClass: 'geek-fill-blank-drop-target-hover'
			});

			// if set, allows dragging in touch devices
			if (isTouchDevice()) {
				if (self.opts.allowTouchDrag) {
					initTouch();
				} else {
					// disables the default click events
					$(self.el1).find('.draggable-element').off('click');
					let dragEls = $(self.el1).find('.draggable-element');
					for (let i = 0; i < dragEls.length; i++) {
						bindEvent(dragEls[i], "touchstart", handleTouchStart, true);
					}
				}
			}


			// Positions the results/correct answers to the draggable elements
			// and makes it is right aligned to them
			for (let i = 0; i < self.anNum; i++) {
				// Hides the answers at the begining of the exercise
				let answer = $('#' + self.opts.answerId + i);
				$('#' + self.opts.checkId + i).position({
					of: answer,
					my: 'right center ',
					at: 'right center',
					offset: '0 5px'
				}).hide();
				$('#' + self.opts.numberId + i).position({
					of: answer,
					my: 'right center',
					at: 'right center',
					offset: '10px -10px'
				}).hide();
			}

			if (self.opts.onLoadCall !== '') {
				self.opts.onLoadCall();
			}
		}

		function restartGame() {
			self.textDiv.html('');
			self.wordDiv.html('');
			self.msgDiv.html('').hide();
			if(self.winDiv.length > 0) {
				self.winDiv.hide();
			}
			initGame();
		}

		initGame();
	}

})(jQuery);
