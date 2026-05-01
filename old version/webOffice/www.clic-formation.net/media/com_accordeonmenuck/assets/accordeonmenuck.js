/**
 * @copyright	Copyright (C) 2012 Cedric KEIFLIN alias ced1870
 * https://www.joomlack.fr
 * Module Accordeon CK
 * @license		GNU/GPL
 * */

(function($) {

	//define the defaults for the plugin and how to call it
	var Accordeonmenuck = function (container, options) {
		//set default options
		var defaults = {
			eventtype: 'click',
			fadetransition: false, // pas encore implemente
			transition: 'linear',
			duree: 500,
			imageplus: 'modules/mod_accordeonmenuck/assets/plus.png',
			imageminus: 'modules/mod_accordeonmenuck/assets/minus.png',
			// menuID : 'accordeonck',
			defaultopenedid: '0',
			showactive: true,
			activeeffect: true,
			showcounter: false,
			closeothers: true
		};

		if (!(this instanceof Accordeonmenuck)) return new Accordeonmenuck(container, options);
		var accordeonmenucks = window.accordeonmenucks || [];
		if (accordeonmenucks.indexOf(container) > -1) return;
		accordeonmenucks.push(container);
		window.accordeonmenucks = accordeonmenucks;

		//call in the default otions
		var options = $.extend(defaults, options);
		var menu = $(container);
		var menuwrap = menu.parent();

		//act upon the element that is passed into the design
		return menu.each(function(options) {
			if (! menu.attr('accordeonck_done')) {
				menu.attr('accordeonck_done', '1');
				accordeonmenuInit();
			}
		});

		function accordeonmenuInit() {
			$(".parent > ul", menu).hide();
			if (options.showactive && !options.activeeffect) {
				$(".parent.active > ul", menu).show().parent().addClass("open");
				$(".parent.active > img.toggler", menu).attr('src', options.imageminus);
			} else if (options.showactive && options.activeeffect) {
				togglemenu($(".parent.active > .toggler", menu));
			}
			if (options.defaultopenedid && !$(".active.parent", menu).length) {
				$(".item-"+options.defaultopenedid+" > ul", menu).show().parent().addClass("open");
				$(".item-"+options.defaultopenedid+" > img.toggler", menu).attr('src', options.imageminus);
			}
			if (options.eventtype == 'click') {
				$("li.parent > .toggler", menu).click(function() {
					togglemenu($(this));
				});
			} else {
				$("li.parent > .toggler", menu).mouseenter(function() {
					togglemenu($(this));
				});
			}
			if (options.showcounter == true) {
				if ($('.accordeonck-counter', menu).length) return;
				$('li.accordeonck.parent', menu).each(function() {
					// if ($('li.accordeonck', $(this)).length) {
						var counter = '<span class="badge accordeonck-counter">' + ($('a.accordeonck', $(this)).length - 1) + '</span>';
						$(this).find('> .accordeonck_outer > a.accordeonck').append(counter);
					// }
				});
			}
			// accessibility
			$("li.parent > .toggler", menu).on('keydown', function(event) {
				// 32 = space bar, 13 = enter, 40 = arrow down, 38 = arrow up
//				console.log(event.which);
				if (event.which === 32 || event.which === 13 || event.which === 40 || event.which === 38) {
					togglemenu($(this));
				}
			});
			initSearch()
		}

		function togglemenu(link) {
			ck_content = link.parent();
			if (!link.parent().hasClass("open")) {
				if (options.closeothers != false) {
					$(".parent > ul", ck_content.parent()).slideUp({
						duration: options.duree,
						easing: options.transition,
						complete: function() {
							$(".parent", ck_content.parent()).removeClass("open");
							$(".parent > img.toggler", ck_content.parent()).attr('src', options.imageplus);
							if (link.get(0).tagName.toLowerCase() == 'img')
								link.attr('src', options.imageplus);
						}
					});
				}
				link.nextAll("ul").slideDown({
					duration: options.duree,
					easing: options.transition,
					complete: function() {
						link.parent().addClass("open");
						if (link.get(0).tagName.toLowerCase() == 'img')
							link.attr('src', options.imageminus);
					}
				});
			} else {
				link.nextAll("ul").slideUp({
					duration: options.duree,
					easing: options.transition,
					complete: function() {
						link.parent().removeClass("open");
						if (link.get(0).tagName.toLowerCase() == 'img')
							link.attr('src', options.imageplus);
					}
				});
			}
		}

		function initSearch() {
			let searchContainer = $('.accordeonck-search', menuwrap);
			if (! searchContainer.length) return;

			menu.append('<div class="accordeonck-results"></div>');

			var searchInput = searchContainer.find('input');
			searchInput.on('keyup', function() {
				doSearch(this.value);
			});
			searchContainer.find('button').on('click', function() {
				searchInput.val('');
				resetSearch();
			});
			$(window).on('keydown', function(event) {
				if (event.which === 27) {
					searchInput.val('');
					resetSearch();
				}
			})
			menuwrap.find('.accordeonck-search-reset').on('click', function() {
				searchInput.val('');
				resetSearch()
			})
		}
	
		function doSearch(txt) {
			if (! txt) {
				resetSearch();
				return;
			}
			menu.find('> li').hide();
			let resultContainer = $('.accordeonck-results', menuwrap);
			resultContainer.empty().show();

			let items = new Array();
			[].slice.call(menu[0].querySelectorAll("a.accordeonck"))
				.filter(a => a.textContent.toLowerCase().match(txt.toLowerCase()))
				.forEach(function(a) { items.push(a); });

			items.forEach(function(el) {
				resultContainer.append('<li class="accordeonck level1 accordeonck-result"><span class="accordeonck_outer">' + el.outerHTML + '</span></li>');
			})
			
			menuwrap.find('.accordeonck-search-reset').show();
		}

		function resetSearch() {
			$('.accordeonck-results', menuwrap).empty().hide();
			menu.find('> li').show();
			menuwrap.find('.accordeonck-search-reset').hide();
		}
	};
	window.Accordeonmenuck = Accordeonmenuck;
})(jQuery);
