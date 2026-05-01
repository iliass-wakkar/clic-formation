var RSFormProPasswords = {
	Forms: [],
	userOptions: {},

	progressBars: {
		responsive: {
			container: 	'rsfp-progress',
			inner: 		'rsfp-bar',
			states: {
				danger:		'rsfp-bar-danger',
				warning: 	'rsfp-bar-warning',
				success: 	'rsfp-bar-success'
			}
		},
		bootstrap2: {
			container: 	'progress',
			inner: 		'bar',
			states: {
				danger:		'bar-danger',
				warning: 	'bar-warning',
				success: 	'bar-success'
			}
		},
		bootstrap3: {
			container: 	'progress',
			inner: 		'progress-bar',
			states: {
				danger:		'progress-bar-danger',
				warning: 	'progress-bar-warning',
				success: 	'progress-bar-success'
			}
		},
		bootstrap4: {
			container: 	'progress',
			inner: 		'progress-bar',
			states: {
				danger:		'bg-danger',
				warning: 	'bg-warning',
				success: 	'bg-success'
			}
		},
		bootstrap5: {
			container: 	'progress',
			inner: 		'progress-bar',
			states: {
				danger:		'bg-danger',
				warning: 	'bg-warning',
				success: 	'bg-success'
			}
		},
		uikit: {
			container: 	'uk-progress',
			inner: 		'uk-progress-bar',
			states: {
				danger:		'uk-progress-danger',
				warning: 	'uk-progress-warning',
				success: 	'uk-progress-success'
			}
		},
		uikit3: {
			container: 	'uk-progress',
			containerElement: 'progress',
			inner: 		false,
			states: {
				danger:		'uk-progress-custom-danger',
				warning: 	'uk-progress-custom-warning',
				success: 	'uk-progress-custom-success'
			},
			setProgress: function(bar, amount) {
				bar.setAttribute('max', 100);
				bar.value = amount;
			}
		},
		foundation: {
			container: 	'progress',
			inner: 		'progress-meter',
			states: {
				danger:		'alert',
				warning: 	'warning',
				success: 	'success'
			}
		}
	},
	translations: {},
	addForm: function(props) {
		RSFormProPasswords.Forms.push(props);
	},
	init: function(){
		for (var i = 0; i < RSFormProPasswords.Forms.length; i++) {
			var layout = RSFormProPasswords.Forms[i].layout;
			var formId = RSFormProPasswords.Forms[i].formId;
			var field  = RSFormProPasswords.Forms[i].field;

			if (typeof RSFormProPasswords.progressBars[layout] === 'undefined') {
				layout = 'responsive';
			}

			var element = RSFormPro.getFieldsByName(formId, field)[0];

			RSFormProPasswords.checkStrength(element, element.value, layout);

			(function(element, layout) {
				RSFormProUtils.addEvent(element, 'keyup', function () {
					RSFormProPasswords.checkStrength(this, this.value, layout);
				});
			})(element, layout);
		}
	},
	checkAndBuildLayout: function(input, layout) {
		var parent = input.parentNode;
		var currentProgressBar = parent.getElementsByClassName(RSFormProPasswords.progressBars[layout].container);
		if (currentProgressBar.length) {
			return currentProgressBar[0];
		} else {
			var inputWidth = input.offsetWidth;
			var progressBar;
			if (typeof RSFormProPasswords.progressBars[layout].containerElement !== "undefined")
			{
				progressBar = document.createElement(RSFormProPasswords.progressBars[layout].containerElement);
			}
			else
			{
				progressBar = document.createElement("DIV");
			}

			// create the progress bar's container
			if (inputWidth > 0)
			{
				progressBar.style.width = inputWidth+'px';
			}
			else
			{
				progressBar.style.width = '100%';
			}

			progressBar.style.marginTop = '5px';
			progressBar.style.marginBottom = '0px';
			RSFormProUtils.addClass(progressBar, RSFormProPasswords.progressBars[layout].container);

			// create the inner progress bar
			if (RSFormProPasswords.progressBars[layout].inner)
			{
				var progressBarInner = document.createElement("DIV");
				RSFormProUtils.addClass(progressBarInner, RSFormProPasswords.progressBars[layout].inner);
				progressBar.appendChild(progressBarInner);
			}

			// insert the progress bar into the DOM
			input.parentNode.insertBefore(progressBar, input.nextSibling);

			var hint = document.createElement('div');
			hint.classList.add('rsform-password-hint');

			input.parentNode.insertBefore(hint, progressBar.nextSibling);

			return progressBar;
		}
	},
	checkStrength: function (input, password, layout) {
		var minLength       = parseInt(RSFormProPasswords.userOptions.minLength);
		var minIntegers     = parseInt(RSFormProPasswords.userOptions.minIntegers);
		var minSymbols      = parseInt(RSFormProPasswords.userOptions.minSymbols);
		var minUppercase    = parseInt(RSFormProPasswords.userOptions.minUppercase);
		var minLowercase    = parseInt(RSFormProPasswords.userOptions.minLowercase);

		var barLayout = RSFormProPasswords.checkAndBuildLayout(input, layout);

		var container  = barLayout;
		var bar;
		if (RSFormProPasswords.progressBars[layout].inner)
		{
			bar = barLayout.getElementsByClassName(RSFormProPasswords.progressBars[layout].inner)[0];
		}
		else
		{
			bar = container;
		}

		var match = [];

		var states = [
			RSFormProPasswords.progressBars[layout].states.danger,
			RSFormProPasswords.progressBars[layout].states.warning,
			RSFormProPasswords.progressBars[layout].states.success
		];

		var classHandler = (['uikit', 'foundation'].indexOf(layout) > -1 ? container : bar);

		function removeClasses() {
			for (var i = 0; i < states.length; i++) {
				RSFormProUtils.removeClass(classHandler, states[i]);
			}
		}

		function setProgress(amount) {
			if (typeof RSFormProPasswords.progressBars[layout].setProgress === "function")
			{
				RSFormProPasswords.progressBars[layout].setProgress(bar, amount);
			}
			else
			{
				bar.style.width = amount + '%';
			}
		}

		function addClass(name) {
			removeClasses();
			RSFormProUtils.addClass(classHandler, name);
		}

		var progress = 0;
		var maxProgress = 0;
		var hint = barLayout.nextElementSibling;
		var hintElement;
		var iconCheck = '<i class="icon icon-check"></i> ';
		var iconError = '<i class="icon icon-cancel"></i> ';

		hint.innerHTML = '';

		// Minimum length
		if (minLength > 0)
		{
			maxProgress += minLength;
			hintElement = document.createElement('span');
			if (password.length === 0)
			{
				hintElement.innerHTML = iconError + RSFormProPasswords.translations.RSFP_REG_BE_AT_LEAST_CHARACTERS.replace('%d', minLength);
			}
			else if (password.length >= minLength)
			{
				hintElement.innerHTML = iconCheck + RSFormProPasswords.translations.RSFP_REG_BE_AT_LEAST_CHARACTERS.replace('%d', minLength);

				hintElement.classList.add('rsform-password-hint-success');
				progress += minLength;
			}
			else
			{
				hintElement.innerHTML = iconError + RSFormProPasswords.translations.RSFP_REG_TYPE_MORE_CHARACTERS.replace('%d', (minLength - password.length));
				progress += password.length;
			}
			hint.appendChild(hintElement);
		}

		// Minimum integers
		if (minIntegers > 0)
		{
			maxProgress += minIntegers;
			hintElement = document.createElement('span');
			match = password.match(/[0-9]/g) || [];
			if (match.length === 0)
			{
				hintElement.innerHTML = iconError + RSFormProPasswords.translations.RSFP_REG_NEEDS_NUMBERS.replace('%d', minIntegers);
			}
			else if (match.length >= minIntegers)
			{
				hintElement.innerHTML = iconCheck + RSFormProPasswords.translations.RSFP_REG_HAS_AT_LEAST_NUMBERS.replace('%d', minIntegers);

				hintElement.classList.add('rsform-password-hint-success');
				progress += minIntegers;
			}
			else
			{
				hintElement.innerHTML = iconError + RSFormProPasswords.translations.RSFP_REG_TYPE_MORE_NUMBERS.replace('%d', minIntegers - match.length);
				progress += match.length;
			}
			hint.appendChild(hintElement);
		}

		// Minimum symbols
		if (minSymbols > 0)
		{
			maxProgress += minSymbols;
			hintElement = document.createElement('span');
			match = password.match(/[^a-zA-Z0-9_]/g) || [];
			if (match.length === 0)
			{
				hintElement.innerHTML = iconError + RSFormProPasswords.translations.RSFP_REG_NEEDS_SYMBOLS.replace('%d', minSymbols);
			}
			else if (match.length >= minSymbols)
			{
				hintElement.innerHTML = iconCheck + RSFormProPasswords.translations.RSFP_REG_HAS_AT_LEAST_SYMBOLS.replace('%d', minSymbols);

				hintElement.classList.add('rsform-password-hint-success');
				progress += minSymbols;
			}
			else
			{
				hintElement.innerHTML = iconError + RSFormProPasswords.translations.RSFP_REG_TYPE_MORE_SYMBOLS.replace('%d', minSymbols - match.length);
				progress += match.length;
			}
			hint.appendChild(hintElement);
		}

		// Minimum uppercase
		if (minUppercase > 0)
		{
			maxProgress += minUppercase;
			hintElement = document.createElement('span');
			match = password.match(/[A-Z]/g) || [];
			if (match.length === 0)
			{
				hintElement.innerHTML = iconError + RSFormProPasswords.translations.RSFP_REG_NEEDS_UPPERCASE_LETTERS.replace('%d', minUppercase);
			}
			else if (match.length >= minUppercase)
			{
				hintElement.innerHTML = iconCheck + RSFormProPasswords.translations.RSFP_REG_HAS_AT_LEAST_UPPERCASE_LETTERS.replace('%d', minUppercase);

				hintElement.classList.add('rsform-password-hint-success');
				progress += minUppercase;
			}
			else
			{
				hintElement.innerHTML = iconError + RSFormProPasswords.translations.RSFP_REG_TYPE_MORE_UPPERCASE_LETTERS.replace('%d', minUppercase - match.length);
				progress += match.length;
			}
			hint.appendChild(hintElement);
		}

		// Minimum lowercase
		if (minLowercase > 0)
		{
			maxProgress += minLowercase;
			hintElement = document.createElement('span');
			match = password.match(/[a-z]/g) || [];
			if (match.length === 0)
			{
				hintElement.innerHTML = iconError + RSFormProPasswords.translations.RSFP_REG_NEEDS_LOWERCASE_LETTERS.replace('%d', minLowercase);
			}
			else if (match.length >= minLowercase)
			{
				hintElement.innerHTML = iconCheck + RSFormProPasswords.translations.RSFP_REG_HAS_AT_LEAST_LOWERCASE_LETTERS.replace('%d', minLowercase);

				hintElement.classList.add('rsform-password-hint-success');
				progress += minLowercase;
			}
			else
			{
				hintElement.innerHTML = iconError + RSFormProPasswords.translations.RSFP_REG_TYPE_MORE_LOWERCASE_LETTERS.replace('%d', minLowercase - match.length);
				progress += match.length;
			}
			hint.appendChild(hintElement);
		}

		var amount = progress * (100 / maxProgress);
		var class_to_add = states[2];

		setProgress(amount);

		if (amount < 100)
		{
			if (amount < 50)
			{
				class_to_add = states[0];
			}
			else
			{
				class_to_add = states[1];
			}
		}

		addClass(class_to_add);
	}
};