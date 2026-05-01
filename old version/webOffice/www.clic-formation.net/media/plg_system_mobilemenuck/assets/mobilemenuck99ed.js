/**
 * @copyright	Copyright (C) 2018 Cedric KEIFLIN alias ced1870
 * https://www.joomlack.fr
 * Mobile Menu CK
 * @license		GNU/GPL
 * */
 
 /*
  * 
 - Version 1.2.22 : 03/02/26 improve the slide left and right effect
 - Version 1.2.21 : 31/10/25 fix issue with mouseover event
 - Version 1.2.20 : 12/11/24 add opened on active item feature in fade, and slide effect
 - Version 1.2.19 : 16/01/24 add parent item text in the fade effect
 - Version 1.2.18 : 16/01/24 add custom_position option
 - Version 1.2.17 : 31/12/23 fix issue with custom text on active item in the menu bar title
 - Version 1.2.16 : 27/11/23 fix issue with fade effect and more than 2 levels
 - Version 1.2.15 : /23 fix issue with menu text in the slide effect
 - Version 1.2.14 : 04/09/23 fix issue with module in Accordeon Menu CK not loaded
 - Version 1.2.13 : 02/08/23 fix issue with mod_login ID
 - Version 1.2.12 : 03/07/23 fix issue with href, use span instead of a
 - Version 1.2.11 : 28/06/23 fix issue with href missing on separator item, duplicated id on mod_login
 - Version 1.2.10 : 26/06/23 add script to manage the mod_login and the show password button
 - Version 1.2.9 : 01/04/23 fix issue with overlay and multiple menus on the page
 - Version 1.2.8 : 16/02/23 fix issue with click on the overlay
 - Version 1.2.7 : 22/06/22 add feature to use a custom link to target any submenu in the mobile menu
 - Version 1.2.6 : 01/06/22 fix issue with title not shown if a module is loaded in the bar
 - Version 1.2.5 : 10/03/22 fix issue with locked icon
 - Version 1.2.4 : 01/03/22 add icon and replacement text for mod_menu, counter option
 - Version 1.2.3 : 15/02/22 fix issue with left position and slide effect + add title on anchor
 - Version 1.2.2 : 29/11/21 add accordion effects and toggle options, and lock_forced
 - Version 1.2.1 : 09/11/21 add topfixedeffect option
 - Version 1.2.0 : 24/09/21 add flyout effect
 - Version 1.1.7 : 21/09/21 add option for a lock button
 - Version 1.1.6 : 18/05/21 add compatibility with scrollTo and lightbox to close the menu when using a merged menu
 - Version 1.1.5 : fix issue with merged menu and fade effect
 - Version 1.1.4 : fix issue with merged menu, add compatibility with Mediabox CK
 - Version 1.1.3 : fix issue with maximenu pushdown layout
 - Version 1.1.2 : fix issue with image only in the menu item
 - Version 1.1.1 : fix issue with description shown in the menu bar
 */

(function($) {
	// "use strict";
	var MobileMenuCK = function(el, opts) {
		if (!(this instanceof MobileMenuCK)) return new MobileMenuCK(el, opts);

		if (! el.length) {
			console.log('MOBILE MENU CK ERROR : Selector not found : ' + el.selector);
			return;
		}

		var defaults = {
			useimages: '0',
			container: 'body', 						// body, menucontainer, topfixed, custom
			showdesc: '0',
			showlogo: '1',
			usemodules: '0',
			menuid: '',
			mobilemenutext: 'Menu',
			showmobilemenutext: '',
			titletag: 'h3',
			displaytype: 'accordion',				// flat, accordion, fade, push, flyout
			displayeffect: 'normal',				// normal, slideleft, slideright, slideleftover, sliderightover, topfixed, open
			menubarbuttoncontent : '',
			topbarbuttoncontent : '',
			uriroot : '',
			mobilebackbuttontext : 'Back',
			menuwidth : '300',
			openedonactiveitem : '1',
			loadanchorclass : '1',
			langdirection : 'ltr',
			menuselector: 'ul',
			childselector: 'li',
			merge: '',
			beforetext: '',
			aftertext: '',
			tooglebaron: 'all', // all, button
			tooglebarevent: 'click', // click, mouseover
			mergeorder: ''
			// Logo options
			,logo_where : '1'										// 1, 2, 3
			,logo_source : 'maximenuck'								// maximenuck, custom
			,logo_image : ''										// the image src
			,logo_link : ''											// the link url
			,logo_alt : ''											// the alt tag
			,logo_position : 'left'									// left, center, right
			,logo_width : ''										// image width
			,logo_height : ''										// image height
			,logo_margintop : ''									// margin top
			,logo_marginright : ''									// margin right
			,logo_marginbottom : ''									// margin bototm
			,logo_marginleft : ''									// margin left
			,logo_class : ''
			// lock button
			,lock_button : '0'
			,lock_forced : '0'
			,topfixedeffect : 'always'								// always, onscroll
			,accordion_use_effects : '0'
			,accordion_toggle : '0'
			,show_icons : '1'
			,counter : '0'
			,overlay : '0'
			,custom_position : '.container-banner'
			,search : '0'
		};

		var opts = $.extend(defaults, opts);
		var t = this;
		// store the menu
		t.menu = (el[0].tagName.toLowerCase() == opts.menuselector) ? el : el.find(opts.menuselector).first();

		// exit if no menu
		if (! t.menu.length)
			return false;

		if (t.menu.length > 1) {
			var MobileMenuCKs = window.MobileMenuCKs || [];
			t.menu.each(function () {
				MobileMenuCKs.push(new MobileMenuCK($(this), opts));
			});
			window.MobileMenuCKs = MobileMenuCKs;
			return MobileMenuCKs;
		}

		// store all mobile menus in the page
		window.MobileMenuCKs = window.MobileMenuCKs || [];
		window.MobileMenuCKs.push(this);

		if (! t.menu.attr('data-mobilemenuck-id')) {
			// var now = new Date().getTime();
			// var id = 'mobilemenuck-' + parseInt(now, 10);
			t.menu.attr('data-mobilemenuck-id', opts.menuid);
		} else {
			return this;
		}
		t.mobilemenuid = opts.menuid + '-mobile'; 
		t.mobilemenu = $('#' + t.mobilemenuid); 
		t.mobilemenu.attr('data-id', opts.menuid);

		// exit if mobile menu already exists
		if (t.mobilemenu.length)
			return this;

		// store all mobile menus in the page by ID
		window.MobileMenuCKByIds = window.MobileMenuCKByIds || [];
		window.MobileMenuCKByIds[opts.menuid] = this;

		t.MobilemenuckSettings = window.MobilemenuckSettings || null;

		if (t.menu.prev(opts.titletag))
			t.menu.prev(opts.titletag).addClass('mobilemenuck-hide');

				// setup the topfixed effect only if needed
		if (opts.container !== 'topfixed') {
			opts.topfixedeffect = 'none';
		}

		// onscroll top fixed 
		if (opts.topfixedeffect == 'onscroll') {
			opts.container = 'menucontainer';
			$(window).scroll(function() { t.floatItem(); });
		}

		t.floatItem = function() {
			var winY = $(window).scrollTop();
			var toTop = t.wrap.offset().top;
			if (toTop < winY && t.wrap.attr('fixed') != '1') {
				t.mobilemenubar.css('position', 'fixed');
				t.wrap.attr('fixed', '1');
			} else if (toTop > winY && t.wrap.attr('fixed') == '1') {
				t.mobilemenubar.css('position', 'relative');
				t.wrap.attr('fixed', '0');
			}
		}

		t.init = function() {
			var activeitem, logoitem;
			if (t.menu.find('li.maximenuck').length) {
				t.menutype = 'maximenuck';
				t.updatelevel();
			} else if (t.menu.find('li.accordeonck').length) {
				t.menutype = 'accordeonck';
			} else {
				t.menutype = 'normal';
			}

			// for menuck
			if ($('.maxipushdownck', t.menu.parent()).length) {
				var menuitems = $(t.sortmenu(t.menu.parent()));
			} else {
				if (t.menutype == 'maximenuck') {
					var menuitems = $('li.maximenuck', t.menu);
				} else if (t.menutype == 'accordeonck') {
					var menuitems = $('li.accordeonck', t.menu);
				} else {
					var menuitems = $(opts.childselector, t.menu);
				}
			}

			// loop through the tree
			t.setDataLevelRecursive(t.menu, 1);

			// only add the menu bar if not merged with another
			if (! opts.merge) {
				if (opts.container == 'body' 
					|| opts.container == 'topfixed'
					|| opts.displayeffect == 'slideleft'
					|| opts.displayeffect == 'slideright'
					|| opts.displayeffect == 'topfixed'
					) {
					$(document.body).append('<div id="' + t.mobilemenuid + '" class="mobilemenuck ' + opts.langdirection + '"></div>');
				} else if(opts.container == 'custom' && opts.custom_position) {
					$(opts.custom_position).append('<div id="' + t.mobilemenuid + '" class="mobilemenuck ' + opts.langdirection + '"></div>');
				} else {
					el.after($('<div id="' + t.mobilemenuid + '" class="mobilemenuck ' + opts.langdirection + '"></div>'));
				}
			}
			t.mobilemenu = $('#' + t.mobilemenuid);
			t.mobilemenu.attr('data-id', opts.menuid);
			// don't create the top bar if merged with another
			if (opts.merge) {
				t.mobilemenu.html = '';
			} else {
				// lock button
				var lockbuttonhtml = '';
				if (opts.lock_button == '1') {
					let icon = sessionStorage.getItem('mobilemenuck-lock') == '1' ? t.getSvg('lock') : t.getSvg('unlock');
					lockbuttonhtml = '<div class="mobilemenuck-lock-button mobilemenuck-button" role="button" tabindex="0" aria-label="' + Joomla.Text._('PLG_MOBILEMENUCK_LOCK_BUTTON_LABEL') + '">' + icon + '</div>';
				}
				t.mobilemenu.html = '<div class="mobilemenuck-topbar"><div class="mobilemenuck-title">' + opts.mobilemenutext + '</div>' + lockbuttonhtml + '<div class="mobilemenuck-button" role="button" tabindex="0" aria-label="' + Joomla.Text._('PLG_MOBILEMENUCK_MENU_BUTTON_LABEL') + '">' + opts.topbarbuttoncontent + '</div></div>';
			}
			t.mobilemenu.html += opts.beforetext ? '<div class="mobilemenuck-beforetext">' + opts.beforetext + '</div>' : '';
			menuitems.each(function(i, itemtmp) {
				itemtmp = $(itemtmp);
				
				// check for params from the menu item settings
				var menuId = itemtmp.attr('class').match(/item-(\d+)/);
				if (menuId && menuId[1] && t.MobilemenuckSettings && t.MobilemenuckSettings[opts.menuid]) {
					var menuItemId = menuId[1];
					var itemParams = t.MobilemenuckSettings[opts.menuid][menuItemId];
					if (itemParams.enabled === '0') $(itemtmp).addClass('nomobileck')
				} else {
					var itemParams = false;
				}

				var itemanchor = t.validateitem(itemtmp);
				if (itemanchor
						) {
					var itemlevel = $(itemtmp).attr('data-level');
					t.mobilemenu.html += '<div class="mobilemenuck-item" data-level="' + itemlevel + '">';
					// itemanchor = $('> a.menuck', itemtmp).length ? $('> a.menuck', itemtmp).clone() : $('> span.separator', itemtmp).clone();
					if (opts.showdesc == '0') {
						if ($('span.descck', itemanchor).length)
							$('span.descck', itemanchor).remove();
					}
					var itemhref = itemanchor.attr('data-href') ? ' href="' + itemanchor.attr('data-href') + '"' : (itemanchor.attr('href') ? ' href="' + itemanchor.attr('href') + '"' : '');
					if (itemanchor.attr('target')) itemhref += ' target="' + itemanchor.attr('target') + '"';

					if (itemtmp.attr('data-mobiletext')) {
						$('span.titreck', itemanchor).html(itemtmp.attr('data-mobiletext'));
					} else if (itemParams) {
						var itemmobiletext = t.getTextFromParams(itemParams);
						if (itemmobiletext) $('span.titreck', itemanchor).html(itemmobiletext);
					}
					var itemmobileicon = '';
					if (itemtmp.attr('data-mobileicon')) {
						itemmobileicon = '<img class="mobilemenuck-icon" src="' + opts.uriroot + '/' + itemtmp.attr('data-mobileicon') + '" />';
					} else if (itemParams) {
						itemmobileicon = t.getIconFromParams(itemParams);
					}
					// var itemanchorClass = '';
					var itemanchorClass = (opts.loadanchorclass == '1' && itemanchor.attr('class')) ? itemanchor.attr('class') : '';
					// check for specific class on the anchor to apply to the mobile menu
					if (itemanchor.hasClass('scrollTo') && opts.loadanchorclass != '1') {
						itemanchorClass += 'scrollTo';
					}
					itemanchorClass = (itemanchorClass) ? ' class="' + itemanchorClass + '"' : '';
					itemanchorRel = (itemanchor.attr('rel')) ? ' rel="' + itemanchor.attr('rel') + '"' : '';
					itemanchorTitle = (itemanchor.attr('title')) ? ' title="' + itemanchor.attr('title') + '"' : '';
					itemanchorTag = itemhref ? 'a' : 'span';
					if (opts.useimages == '1' && ($('> * > img', itemtmp).length || $('> * > * > img', itemtmp).length)) {
						datatocopy = itemanchor.html();
						t.mobilemenu.html += '<div class="menuck ' + itemtmp.attr('class') + '"><' + itemanchorTag + itemhref + itemanchorClass + itemanchorRel + itemanchorTitle + '>' + itemmobileicon + '<span class="mobilemenuck-item-text">' + datatocopy + '</span></' + itemanchorTag + '></div>';
					} else if (opts.usemodules == '1' && (
								$('> div.menuck_mod', itemtmp).length
								|| $('> div.maximenuck_mod', itemtmp).length
								|| $('> div.accordeonckmod', itemtmp).length
								|| $('> div.accordeonmenuck_mod', itemtmp).length
								)
							) {
						datatocopy = itemanchor.html();
						t.mobilemenu.html += '<div class="' + itemtmp.attr('class') + '">' + itemmobileicon + datatocopy + '</div>';
					} else {
						if (itemtmp.attr('data-mobiletext')) {
							var datatocopy = itemtmp.attr('data-mobiletext');
						} else if (itemParams) {
							var datatocopy = t.getTextFromParams(itemParams) || itemanchor.html();
						} else {
							if (opts.useimages == '0') {
								itemanchor.find('> img').remove();
							}
							var datatocopy = itemanchor.html();
						}
						t.mobilemenu.html += '<div class="menuck ' + itemtmp.attr('class') + '"><' + itemanchorTag + itemhref + itemanchorClass + itemanchorRel + itemanchorTitle + '>' + itemmobileicon + '<span class="mobilemenuck-item-text">' + datatocopy + '</span></' + itemanchorTag + '></div>';
					}

					// var itemlevel = $(itemtmp).attr('data-level');
					var j = i;
					while (menuitems[j + 1] && !t.validateitem(menuitems[j + 1]) && j < 1000) {
						j++;
					}
					if (menuitems[j + 1] && t.validateitem(menuitems[j + 1])) {
						var itemleveldiff = $(menuitems[i]).attr('data-level') - $(menuitems[j + 1]).attr('data-level');
						if (itemleveldiff < 0) {
							t.mobilemenu.html += '<div class="mobilemenuck-submenu">';
						}
						else if (itemleveldiff > 0) {
							t.mobilemenu.html += '</div>';
							t.mobilemenu.html += t.strRepeat('</div></div>', itemleveldiff);
						} else {
							t.mobilemenu.html += '</div>';
						}
					} else {
						t.mobilemenu.html += t.strRepeat('</div></div>', itemlevel);
					}

					if (itemtmp.hasClass('current'))
						activeitem = itemtmp.clone();
					if (!opts.showdesc) {
						if ($('span.descck', $(activeitem)).length)
							$('span.descck', $(activeitem)).remove();
					}

				} //else if ($(itemtmp).hasClass('menucklogo')) {
				//logoitem = $(itemtmp).clone();
				//}
			});

			t.mobilemenu.html += opts.aftertext ? '<div class="mobilemenuck-aftertext">' + opts.aftertext + '</div>' : '';
			if (opts.merge) {
				var mergedmobilemenuid = opts.merge + '-mobile'; 
				var mergedmobilemenu = $('#' + mergedmobilemenuid);
				if (mergedmobilemenu.length) {
					if (mergedmobilemenu.find('.mobilemenuck-itemwrap').length) {
						mergedmobilemenu.find('.mobilemenuck-itemwrap').append(t.mobilemenu.html);
					} else {
						mergedmobilemenu.append(t.mobilemenu.html);
					}
				} else {
					$(document.body).append($('<div style="display:none;" data-mobilemenuck-merged="' + mergedmobilemenuid + '" data-mobilemenuck-mergedorder="' + opts.mergeorder + '">' + t.mobilemenu.html + '</div>'));
				}
				// close the menu when scroll is needed
				$('.scrollTo,[rel*="lightbox"]', mergedmobilemenu).click(function() {
					t.closeMenu();
				});
			} else {
				t.mobilemenu.append(t.mobilemenu.html);
				if (opts.lock_button == '1') {
					t.mobilemenu.find('.mobilemenuck-lock-button').on('click keypress', function(event) {
						if (event.type === 'click' || (event.type === 'keypress' && event.keyCode === 13)) {
							if (sessionStorage.getItem('mobilemenuck-lock') == '1') {
								sessionStorage.removeItem('mobilemenuck-lock');
								sessionStorage.removeItem('mobilemenuck-state');
								this.innerHTML = t.getSvg('unlock');
							} else {
								sessionStorage.setItem('mobilemenuck-lock', '1');
								t.storeLockedState();
								this.innerHTML = t.getSvg('lock');
							}
						}
					});
				}
				if (opts.lock_forced == '1') {
					sessionStorage.setItem('mobilemenuck-lock', '1');
				}

				// if another menu has been created to be merged
				if ($('[data-mobilemenuck-merged="' + t.mobilemenuid + '"]').length) {
					$('[data-mobilemenuck-merged="' + t.mobilemenuid + '"]').each(function() {
						var mergingmenu = $(this);
						var mergedorder = $(this).attr('data-mobilemenuck-mergedorder');
						$(this).find('.mobilemenuck-item').attr('data-mergedorder', mergedorder);
						var merged = false;
						t.mobilemenu.find('.mobilemenuck-item').each(function() {
							if ($(this).attr('data-mergedorder') > mergedorder && merged == false) {
								$(this).before(mergingmenu.html());
								merged = true;
							}
						});
						if (merged == false) t.mobilemenu.append(mergingmenu.html());
						$('[data-mobilemenuck-merged="' + t.mobilemenuid + '"]').remove();
					});
				}
			}
			// add custom modules in the menu
			if ($('#mobilemenuck-top-module').length) {
				t.mobilemenu.find('.mobilemenuck-topbar').after($('#mobilemenuck-top-module').show());
			}
			if ($('#mobilemenuck-bottom-module').length) {
				t.mobilemenu.append($('#mobilemenuck-bottom-module').show());
			}

			t.initCss();
			var activeitemtext;
			var activeitemhref;
			if (activeitem && opts.showmobilemenutext != 'none' && opts.showmobilemenutext != 'custom') {
				if (opts.showdesc == '0') {
					activeitem.find('.descck').remove();
				}
				if (opts.useimages == '1') {
					activeitemtext = activeitem.find('a.maximenuck').html();
				} else {
					if (activeitem.attr('data-mobiletext')) {
						activeitemtext = activeitem.attr('data-mobiletext');
					}	else {
						activeitemtext = activeitem.find('span.titreck').html();
					}
//					activeitemhref = activeitem.find('a.maximenuck').attr('href');
//					activeitemtext = activeitemhref ? '<a href="' + activeitemhref + '">' + activeitemtext + '</a>' : activeitemtext;
				}
				if (!activeitemtext || activeitemtext == 'undefined')
					activeitemtext = opts.mobilemenutext;
			} else {
				activeitemtext = opts.mobilemenutext;
			}

			if (! opts.merge) {
				var position = (opts.container == 'body') ? 'absolute' : ( (opts.container == 'topfixed') ? 'fixed' : 'relative' );
				if (opts.container == 'topfixed') {
					opts.container = 'body';
					opts.containermemory = 'topfixed';
				}
				var mobilemenubar = '<div id="' + t.mobilemenuid + '-bar" class="mobilemenuck-bar ' + opts.langdirection + '" style="position:' + position + '"><div class="mobilemenuck-bar-title">' + activeitemtext + '</div>'
						+ '<div class="mobilemenuck-bar-button" role="button" tabindex="0" aria-label="' + Joomla.Text._('PLG_MOBILEMENUCK_BAR_BUTTON_LABEL') + '">' + opts.menubarbuttoncontent + '</div>'
						+ '</div>';
				t.mobilemenubar = $(mobilemenubar);
				// load custom module if loaded
//				if ($('#' + t.mobilemenuid + '-bar-module').length) {
				if ($('#mobilemenuck-bar-module').length) {
//					t.mobilemenubar.find('.mobilemenuck-bar-title').text('');
					t.mobilemenubar.find('.mobilemenuck-bar-title').append($('#mobilemenuck-bar-module').show());
				}
				t.mobilemenubar.attr('data-id', opts.menuid);

				if (opts.container == 'body') {
					$(document.body).append(t.mobilemenubar);
				} else if(opts.container == 'custom' && opts.custom_position) {
					$(opts.custom_position).append(t.mobilemenubar);
					if (opts.displayeffect == 'normal' || opts.displayeffect == 'open')
						t.mobilemenu.css('position', 'relative');
				} else {
					el.after(t.mobilemenubar);
					if (opts.displayeffect == 'normal' || opts.displayeffect == 'open')
						t.mobilemenu.css('position', 'relative');
				}

				// onscroll top fixed 
				if (opts.topfixedeffect == 'onscroll') {
					let wrapid = t.mobilemenubar.attr('id') + '-wrap-topfixed';
					t.mobilemenubar.wrap('<div id="' + wrapid + '" class="mobilemenuck-wrap-topfixed"></div>');
					t.wrap = $('#' + wrapid);

					t.wrap.css('height', t.getHiddenDimensions(t.mobilemenubar).height );
				}

				t.menu.parents('.nav-collapse').css('height', 'auto').css('overflow', 'visible');
				t.menu.parents('.navigation').find('.navbar').css('display', 'none');
				t.mobilemenubar.parents('.nav-collapse').css('height', 'auto');
				t.mobilemenubar.parents('.navigation').find('.navbar').css('display', 'none');

				if (opts.showlogo == '0') {
					
				} else if (($('.maximenucklogo', t.menu).length && opts.showlogo)
					|| opts.logo_source === 'custom'){
					if (opts.logo_source === 'custom' && opts.logo_image !== '') {
						var logo_style = (opts.logo_margintop  ? ' margin-top:' + opts.logo_margintop + ';' : '')
										+ (opts.logo_marginright  ? ' margin-right:' + opts.logo_marginright + ';' : '')
										+ (opts.logo_marginbottom  ? ' margin-bottom:' + opts.logo_marginbottom + ';' : '')
										+ (opts.logo_marginleft  ? ' margin-left:' + opts.logo_marginleft + ';' : '')
						logo_style = logo_style ? ' style="' + logo_style + '"' : '';
						var logo_html = '<img src="' + opts.uriroot + '/' + opts.logo_image + '"'
										 + (opts.logo_width  ? ' width="' + opts.logo_width + '"' : '')
										 + (opts.logo_height  ? ' height="' + opts.logo_height + '"' : '')
										 + (opts.logo_alt  ? ' alt="' + opts.logo_alt + '"' : '')
										 + logo_style
										 + ' data-position="' + opts.logo_position + '"'
										 + ' class="' + opts.logo_class + '"'
										 + '/>'
						logo_html = opts.logo_link ? '<a href="' + opts.logo_link + '">' + logo_html + '</a>' : logo_html;
						logoitem = '<div class="mobilemenuck-logo mobilemenuck-logo-' + opts.logo_position + '">' + logo_html + '</div>';
						var floatlogo = '';
					} else {
						logoitem = $('.maximenucklogo', t.menu).clone();
						var floatlogo = 'float:left;';
					}
					// convert to array
					opts.logo_where = opts.logo_where.split(',');

					if (opts.logo_where.includes('2')) {
						t.mobilemenubar.prepend('<div style="float:left;" class="' + $(logoitem).attr('class') + '">' + $(logoitem).html() + '</div>');
					} 
					if (opts.logo_where.includes('3')) {
						$('.mobilemenuck-topbar', t.mobilemenu).prepend('<div style="' + floatlogo + '" class="' + $(logoitem).attr('class') + '">' + $(logoitem).html() + '</div>');
					} 
					if (opts.logo_where.includes('1')) {
						$('.mobilemenuck-topbar', t.mobilemenu).after('<div class="' + $(logoitem).attr('class') + '">' + $(logoitem).html() + '<div style="clear:both;"></div></div>');
					}
				}
				if (opts.tooglebaron == 'button') {
					$(t.mobilemenubar).find('.mobilemenuck-bar-button').on(opts.tooglebarevent + ' keypress', function(event) {
						if (opts.tooglebarevent === 'mouseover' || event.type === 'click' || (event.type === 'keypress' && event.keyCode === 13)) t.toggleMenu();
					});
				} else {
					$(t.mobilemenubar).on(opts.tooglebarevent + ' keypress', function(event) {
						if (opts.tooglebarevent === 'mouseover' || event.type === 'click' || (event.type === 'keypress' && event.keyCode === 13)) t.toggleMenu();
					});
				}
				$('.mobilemenuck-button:not(.mobilemenuck-lock-button)', t.mobilemenu).on('click keypress', function(event) {
					if (event.type === 'click' || (event.type === 'keypress' && event.keyCode === 13)) t.closeMenu();
				});
				// close the menu when scroll is needed
				$('.scrollTo,[rel="lightbox"]', t.mobilemenu).click(function() {
					t.closeMenu();
				});
				if (typeof Scrolltock == 'function' && $('.scrollTo', t.mobilemenu).length) {
					Scrolltock(t.mobilemenu);
				}

				$(window).on("click", function(event){
					if (sessionStorage.getItem('mobilemenuck-lock') !== '1') {
						var shallclose = true;
						$('.mobilemenuck').each(function() {
							var $this = $(this);
							if ( 
								$this.has(event.target).length == 0 //checks if descendants of submenu was clicked
								&&
								!$this.is(event.target) //checks if the submenu itself was clicked
								&&
								$('#' + t.mobilemenuid + '-bar').has(event.target).length == 0
								&&
								!$('#' + t.mobilemenuid + '-bar').is(event.target)
	//							&&
	//							$this.find('.mobilemenuck-lock-button').has(event.target).length == 0
	//							&&
	//							!$this.find('.mobilemenuck-lock-button').is(event.target)
								){
								// is outside
								// closeMenu(opts.menuid);
								// shallclose = true;
							} else {
								// is inside one of the mobile menus, do nothing
								shallclose = false;
							}
						});
						if (shallclose) {
							t.closeMenu();
							if (t.mobilemenu.css('display') == 'block') return false;
						}
					}
				});
			} // end merge condition

			if (opts.counter === '1') t.loadCounter();
			if (opts.search === '1') t.initSearch();

			// add compatibility with Mediabox CK
			if (typeof(Mediabox) != "undefined") {
				Mediabox.scanPage();
			}
			if (typeof(scrolltock_mobilemenuck_compat) != "undefined") {
				scrolltock_mobilemenuck_compat(t.mobilemenu);
			}
		}

		t.initSearch = function() {
			let searchTemplate = '<div class="mobilemenuck-search">'
				+ '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56.966 56.966" class="mobilemenuck-search-icon">'
					+ '<path fill="currentColor" d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17s-17-7.626-17-17S14.61,6,23.984,6z"></path>'
				+ '</svg>'
				+ '<input type="text" placeholder="' + Joomla.JText._('PLG_MOBILEMENUCK_SEARCH') + '" aria-label="' + Joomla.Text._('PLG_MOBILEMENUCK_SEARCH_LABEL') + '" />'
				+ '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 612" class="mobilemenuck-search-reset" role="button" tabindex="0" aria-label="' + Joomla.Text._('PLG_MOBILEMENUCK_SEARCH_RESET_LABEL') + '">'
					+ '<path fill="currentColor" d="M561,76.5H178.5c-17.85,0-30.6,7.65-40.8,22.95L0,306l137.7,206.55c10.2,12.75,22.95,22.95,40.8,22.95H561c28.05,0,51-22.95,51-51v-357C612,99.45,589.05,76.5,561,76.5zM484.5,397.8l-35.7,35.7L357,341.7l-91.8,91.8l-35.7-35.7l91.8-91.8l-91.8-91.8l35.7-35.7l91.8,91.8l91.8-91.8l35.7,35.7L392.7,306L484.5,397.8z"></path>'
				+ '</svg>'
			+ '</div>';
			$('.mobilemenuck-topbar', t.mobilemenu).after('<div class="mobilemenuck-search"></div>');
			let searchContainer = $('.mobilemenuck-search', t.mobilemenu);
			if (! searchContainer.length) return;

			searchContainer.append(searchTemplate);
			searchContainer.append('<div class="mobilemenuck-results"></div>');

			var searchInput = searchContainer.find('input');
			searchInput.on('keyup', function() {
				t.doSearch(this.value);
			});
			searchContainer.find('button').on('click', function() {
				searchInput.val('');
				t.resetSearch();
			});
			$(window).on('keydown', function(event) {
				if (event.which === 27) {
					searchInput.val('');
					t.resetSearch();
				}
			})
			t.mobilemenu.find('.mobilemenuck-search-reset').on('click keypress', function(event) {
				if (event.type === 'click' || (event.type === 'keypress' && event.keyCode === 13)) {
					searchInput.val('');
					t.resetSearch();
				}
			})
		}

		t.doSearch = function(txt) {
			if (! txt) {
				t.resetSearch();
				return;
			}
			t.mobilemenu.find('> .mobilemenuck-item').hide();
			let resultContainer = $('.mobilemenuck-results', t.mobilemenu);
			resultContainer.empty().show();

			let items = new Array();
			[].slice.call(t.mobilemenu[0].querySelectorAll('div.mobilemenuck-item'))
				.filter(a => a.textContent.toLowerCase().match(txt.toLowerCase()))
				.forEach(function(a) { items.push(a); });

			items.forEach(function(el) {
				resultContainer.append('<div class="mobilemenuck-item mobilemenuck-result" data-level="1">' + el.innerHTML + '</div>');
			})
			
			t.mobilemenu.find('.mobilemenuck-search-reset').show();
		}

		t.resetSearch = function() {
			$('.mobilemenuck-results', t.mobilemenu).empty().hide();
			t.mobilemenu.find('> .mobilemenuck-item').show();
			t.mobilemenu.find('.mobilemenuck-search-reset').hide();
		}

		t.loadCounter = function() {
			t.mobilemenu.find('.mobilemenuck-item').each(function() {
				if ($(this).find('.mobilemenuck-submenu').length) {
					var number = $(this).find('.mobilemenuck-submenu > .mobilemenuck-item').length;
					var counter = '<span class="mobilemenuck-item-counter">' + number + '</span>';
					$(this).find('> div:first-child .mobilemenuck-item-text').after(counter);
				}
			});
		}

		t.getIconFromParams = function(itemParams) {
			if (! itemParams.icon) return '';

			var icon;
			switch(itemParams.iconType) {
				case 'svg' :
					icon = itemParams.icon;
					break;
				case 'css' :
					icon = '<i class="mobilemenuck-icon ' + itemParams.icon + '"></i>'
					break;
				case 'image':
				default :
					var src = itemParams.icon.split('#')[0];
					var width = itemParams.icon.match(/width=(\d+)/);
					width = width && width[1] ? width[1] : '';
					var height = itemParams.icon.match(/height=(\d+)/);
					height = height && height[1] ? height[1] : '';
					icon = '<img class="mobilemenuck-icon" src="' + opts.uriroot + '/' + src + '" width="' + width + '" height="' + height + '" />';
					break;
			}

			return icon;
		}

		t.getTextFromParams = function(itemParams) {
			return itemParams.text;
		}

		t.storeLockedState = function() {
			if (opts.lock_button !== '1' && opts.lock_forced !== '1') return;
			let opened = $.map(t.mobilemenu.find('.mobilemenuck-submenu'), function(n, i) {
				return $(n).hasClass('ckopen') || $(n).prev().hasClass('open');
			});
			sessionStorage.setItem('mobilemenuck-state', opened);
		}

		t.setDataLevelRecursive = function(menu, level) {
			$('> ' + opts.childselector, menu).each(function() {
				var $li = $(this);
				if (! $li.attr('data-level')) $li.attr('data-level', level).addClass('level' + level);
				if ($li.find(opts.menuselector).length) t.setDataLevelRecursive($li.find(opts.menuselector), level + 1);
			});
		}

		t.accordionOpen = function(item) {
			if (opts.accordion_use_effects == '1') {
				item.slideDown('fast');
			} else {
				item.css('display', 'block');
			}
		}

		t.accordionClose = function(item) {
			if (opts.accordion_use_effects == '1') {
				item.slideUp('fast');
			} else {
				item.css('display', 'none');
			}
		}

		t.setAccordion = function() {
			if (opts.merge) {
				t.mobilemenu = $('#' + opts.merge + '-mobile');
			}
			// mobilemenu = $('#' + opts.menuid + '-mobile');
			$('.mobilemenuck-submenu', t.mobilemenu).hide();
			$('.mobilemenuck-submenu', t.mobilemenu).each(function(i, submenu) {
				submenu = $(submenu);
				var itemparent = submenu.prev('.menuck');
				if ($('+ .mobilemenuck-submenu > div.mobilemenuck-item', itemparent).length)
					$(itemparent).append('<div class="mobilemenuck-togglericon" role="button" tabindex="0" aria-label="' + Joomla.Text._('PLG_MOBILEMENUCK_TOGGLER_ICON_LABEL') + '" />');
			});
			$('.mobilemenuck-togglericon', t.mobilemenu).on('click keypress', function(event) {
				if (event.type === 'click' || (event.type === 'keypress' && event.keyCode === 13)) {
					var itemparentsubmenu = $(this).parent().next('.mobilemenuck-submenu');
					if (itemparentsubmenu.css('display') == 'none') {
						if (opts.accordion_toggle == '1') {
							if ($(this).parent().hasClass('level1')) {
								t.accordionClose($('.mobilemenuck-submenu'));
								$('.mobilemenuck-togglericon').parent().removeClass('open');
							} else {
								$($(this).parents('.mobilemenuck-submenu')[0]).find('.mobilemenuck-submenu').slideUp();
								t.accordionClose($($(this).parents('.mobilemenuck-submenu')[0]).find('.mobilemenuck-submenu'));
								$($(this).parents('.mobilemenuck-submenu')[0]).find('.mobilemenuck-togglericon').parent().removeClass('open');
							}
							t.accordionOpen(itemparentsubmenu);
						} else {
							t.accordionOpen(itemparentsubmenu);
						}
						$(this).parent().addClass('open');
					} else {
						t.accordionClose(itemparentsubmenu);
						$(this).parent().removeClass('open');
					}
					t.storeLockedState();
				}
			});
			// open the submenu on the active item
			if (opts.openedonactiveitem == '1') {
				$('.mobilemenuck-item > .active:not(.current) > .mobilemenuck-togglericon', t.mobilemenu).trigger('click');
			}
		}

		t.setFlyout = function() {
			if (opts.merge) {
				t.mobilemenu = $('#' + opts.merge + '-mobile');
			}
			// mobilemenu = $('#' + opts.menuid + '-mobile');
			$('.mobilemenuck-submenu', t.mobilemenu).hide();
			$('.level1 + .mobilemenuck-submenu', t.mobilemenu)
				.css('width', opts.menuwidth);
//				.css('left', opts.menuwidth + 'px')
			$('.level2 + .mobilemenuck-submenu', t.mobilemenu)
				.css('width', opts.menuwidth);
			$('.mobilemenuck-submenu', t.mobilemenu).each(function(i, submenu) {
				submenu = $(submenu);
				var itemparent = submenu.prev('.menuck');
				if ($('+ .mobilemenuck-submenu > div.mobilemenuck-item', itemparent).length)
					$(itemparent).append('<div class="mobilemenuck-togglericon" role="button" tabindex="0" aria-label="' + Joomla.Text._('PLG_MOBILEMENUCK_TOGGLER_ICON_LABEL') + '" />');
			});
			$('.level1 > .mobilemenuck-togglericon', t.mobilemenu).on('click keypress', function(event) {
				if (event.type === 'click' || (event.type === 'keypress' && event.keyCode === 13)) {
					$('.level1 + .mobilemenuck-submenu', t.mobilemenu).prev().removeClass('open');
					var itemparentsubmenu = $(this).parent().next('.mobilemenuck-submenu');
					$('.mobilemenuck-submenu', t.mobilemenu).not(itemparentsubmenu).hide();
					if (itemparentsubmenu.css('display') == 'none') {
						itemparentsubmenu.css('display', 'block');
						$(this).parent().addClass('open');
					} else {
						itemparentsubmenu.css('display', 'none');
						$(this).parent().removeClass('open');
					}
					t.storeLockedState();
				}
			});
			$('.level2 > .mobilemenuck-togglericon', t.mobilemenu).on('click keypress', function(event) {
				if (event.type === 'click' || (event.type === 'keypress' && event.keyCode === 13)) {
					$('.level2 + .mobilemenuck-submenu', t.mobilemenu).prev().removeClass('open');
					var itemparentsubmenu = $(this).parent().next('.mobilemenuck-submenu');
					$('.level2 + .mobilemenuck-submenu', t.mobilemenu).not(itemparentsubmenu).hide();
					if (itemparentsubmenu.css('display') == 'none') {
						itemparentsubmenu.css('display', 'block');
						$(this).parent().addClass('open');
					} else {
						itemparentsubmenu.css('display', 'none');
						$(this).parent().removeClass('open');
					}
					t.storeLockedState();
				}
			});
			$('.level3 .mobilemenuck-togglericon', t.mobilemenu).on('click keypress', function(event) {
				if (event.type === 'click' || (event.type === 'keypress' && event.keyCode === 13)) {
					var itemparentsubmenu = $(this).parent().next('.mobilemenuck-submenu');
					// $('.level 2 .mobilemenuck-submenu', t.mobilemenu).not(itemparentsubmenu).hide();
					if (itemparentsubmenu.css('display') == 'none') {
						itemparentsubmenu.css('display', 'block');
						$(this).parent().addClass('open');
					} else {
						itemparentsubmenu.css('display', 'none');
						$(this).parent().removeClass('open');
					}
					t.storeLockedState();
				}
			});
			// open the submenu on the active item
			if (opts.openedonactiveitem == '1') {
				$('.maximenuck.active:not(.current) > .mobilemenuck-togglericon', t.mobilemenu).trigger('click');
			}
		}

		t.setFade = function() {
			if (opts.merge) {
				t.mobilemenu = $('#' + opts.merge + '-mobile');
			}
			if (! $('.mobilemenuck-backbutton', t.mobilemenu).length) {
				var backicon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>';
				$('.mobilemenuck-topbar', t.mobilemenu).prepend('<div class="mobilemenuck-title mobilemenuck-backbutton" role="button" tabindex="0">'+backicon+opts.mobilebackbuttontext+'</div>');
			}
			$('.mobilemenuck-backbutton', t.mobilemenu).hide();
			$('.mobilemenuck-submenu', t.mobilemenu).hide();
			$('.mobilemenuck-submenu', t.mobilemenu).each(function(i, submenu) {
				submenu = $(submenu);
				itemparent = submenu.prev('.menuck');
				if ($('+ .mobilemenuck-submenu > div.mobilemenuck-item', itemparent).length)
					$(itemparent).append('<div class="mobilemenuck-togglericon" role="button" tabindex="0" aria-label="' + Joomla.Text._('PLG_MOBILEMENUCK_TOGGLER_ICON_LABEL') + '" />');
			});
			$('.mobilemenuck-togglericon', t.mobilemenu).on('click keypress', function(event) {
				if (event.type === 'click' || (event.type === 'keypress' && event.keyCode === 13)) {
					itemparentsubmenu = $(this).parent().next('.mobilemenuck-submenu');
					parentitem = $(this).parents('.mobilemenuck-item')[0];
					var parentText = $(parentitem).find('> div:first-child > * .mobilemenuck-item-text').text();
					$('.ckopen', parentitem).removeClass('ckopen').hide();
					$(itemparentsubmenu).addClass('ckopen');
					$('.mobilemenuck-backbutton', t.mobilemenu).fadeIn();
					$('.mobilemenuck-backbutton + .mobilemenuck-title').text(parentText)
					// $('.mobilemenuck-title:not(.mobilemenuck-backbutton)', t.mobilemenu).hide();
					// hides the current level items and displays the submenus
					$(parentitem).parent().find('> .mobilemenuck-item > div.menuck').fadeOut(function() {
						$('.ckopen', t.mobilemenu).fadeIn();
					});
					t.storeLockedState();
				}
			});
			if (! opts.merge) {
			$('.mobilemenuck-topbar .mobilemenuck-backbutton', t.mobilemenu).on('click keypress', function(event) {
				if (event.type === 'click' || (event.type === 'keypress' && event.keyCode === 13)) {
					backbutton = this;
					let lastckopen = $('.ckopen', t.mobilemenu).last();
					lastckopen.fadeOut(500, function() {
						lastckopen.parent().parent().find('> .mobilemenuck-item > div.menuck').fadeIn();
						oldopensubmenu = lastckopen;
						if (! lastckopen.parents('.mobilemenuck-submenu').length) {
							lastckopen.removeClass('ckopen');
							$('.mobilemenuck-backbutton + .mobilemenuck-title').text(opts.mobilemenutext)
							$('.mobilemenuck-title', t.mobilemenu).fadeIn();
							$(backbutton).hide();
						} else {
							lastckopen.removeClass('ckopen');
							$(oldopensubmenu.parents('.mobilemenuck-submenu')[0]).addClass('ckopen');
						}
						t.storeLockedState();
					});
				}
			});
			}
			// open the submenu on the active item
			if (opts.openedonactiveitem == '1') {
				$('.maximenuck.active:not(.current) > .mobilemenuck-togglericon', t.mobilemenu).trigger('click');
			}
		}

		t.setPush = function() {
			if (opts.merge) {
				mobilemenu = $('#' + opts.merge + '-mobile');
			} else {
				mobilemenu = $('#' + opts.menuid + '-mobile');
			}
			mobilemenu.css('height', '100%');
			if (! $('.mobilemenuck-backbutton', mobilemenu).length) {
				var backicon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>';
				$('.mobilemenuck-topbar', mobilemenu).prepend('<div class="mobilemenuck-title mobilemenuck-backbutton" role="button" tabindex="0">'+backicon+opts.mobilebackbuttontext+'</div>');
			}
			$('.mobilemenuck-backbutton', mobilemenu).hide();
			$('.mobilemenuck-submenu', mobilemenu).hide();
			// $('div.mobilemenuck-item', mobilemenu).css('position', 'relative');
			mobilemenu.append('<div class="mobilemenuck-itemwrap" />');
			$('.mobilemenuck-itemwrap', mobilemenu).css('position', 'absolute').width('100%');
			$('> div.mobilemenuck-item', mobilemenu).each(function(i, item) {
				$('.mobilemenuck-itemwrap', mobilemenu).append(item);
			});
			zindex = 10;
			$('.mobilemenuck-submenu', mobilemenu).each(function(i, submenu) {
				submenu = $(submenu);
				itemparent = submenu.prev('.menuck');
				submenu.css('left', '100%' ).css('width', '100%' ).css('top', '0' ).css('position', 'absolute').css('z-index', zindex);
				if ($('+ .mobilemenuck-submenu > div.mobilemenuck-item', itemparent).length)
					$(itemparent).append('<div class="mobilemenuck-togglericon" role="button" tabindex="0" aria-label="' + Joomla.Text._('PLG_MOBILEMENUCK_TOGGLER_ICON_LABEL') + '" />');
				zindex++;
			});
			$('.mobilemenuck-togglericon', mobilemenu).on('click keypress', function(event) {
				if (event.type === 'click' || (event.type === 'keypress' && event.keyCode === 13)) {
					itemparentsubmenu = $(this).parent().next('.mobilemenuck-submenu');
					parentitem = $(this).parents('.mobilemenuck-item')[0];
					var parentText = $(parentitem).find('> div:first-child > * .mobilemenuck-item-text').text();
					var level = $(parentitem).attr('data-level');
					$(parentitem).parent().find('.mobilemenuck-submenu').hide();
					$('.ckopen', mobilemenu).removeClass('ckopen');
					$(itemparentsubmenu).addClass('ckopen');
					$('.mobilemenuck-backbutton', mobilemenu).fadeIn();
	//				$('.mobilemenuck-backbutton').after('<div class="mobilemenuck-backbutton-parent-title">' + parentText + '</div>')
					$('.mobilemenuck-backbutton + .mobilemenuck-title').text(parentText)
	//				$('.mobilemenuck-title:not(.mobilemenuck-backbutton)', mobilemenu).hide();
					$('.ckopen', mobilemenu).fadeIn();
					$('.mobilemenuck-itemwrap', mobilemenu).animate({'left': '-' + (level * 100) + '%' });
					// go to top for submenu to avoid them to be hidden

					if (opts.container === 'body') {
						window.scrollTo({top: 0, behavior: "smooth"});
					} else {
						mobilemenu.animate({ scrollTop: 0 }, "fast");
					}
					t.storeLockedState();
				}
			});
			if (! opts.merge) {
				$('.mobilemenuck-topbar .mobilemenuck-backbutton', mobilemenu).on('click keypress', function(event) {
					if (event.type === 'click' || (event.type === 'keypress' && event.keyCode === 13)) {
						backbutton = this;
						var leftpos = parseInt($('.mobilemenuck-itemwrap', mobilemenu).get(0).style.left);
						$('.mobilemenuck-itemwrap', mobilemenu).animate({'left':  (leftpos+100) + '%'});
						// $('.mobilemenuck-itemwrap', mobilemenu).animate({'left':  '+=100%'});
						// $('.ckopen', mobilemenu).fadeOut(500, function() {
							// $('.ckopen', mobilemenu).parent().parent().find('> .mobilemenuck-item > div.menuck').fadeIn();
						oldopensubmenu = $('.ckopen', mobilemenu);
						var parentitem = oldopensubmenu.parent().parent().prev();
						var parentText = parentitem.find('> *:first-child .mobilemenuck-item-text').text();
						if (! $('.ckopen', mobilemenu).parents('.mobilemenuck-submenu').length) {
							$('.ckopen', mobilemenu).removeClass('ckopen').hide();
							$('.mobilemenuck-backbutton + .mobilemenuck-title').text(opts.mobilemenutext)
							$('.mobilemenuck-title', mobilemenu).fadeIn();
							$(backbutton).hide();
						} else {
							$('.ckopen', mobilemenu).removeClass('ckopen').hide();
							$(oldopensubmenu.parents('.mobilemenuck-submenu')[0]).addClass('ckopen');
							$('.mobilemenuck-backbutton + .mobilemenuck-title').text(parentText)
						}
						t.storeLockedState();
						// });
					}
				});
			}
			// open the submenu on the active item
			if (opts.openedonactiveitem == '1') {
				$('.maximenuck.active:not(.current) > .mobilemenuck-togglericon', t.mobilemenu).trigger('click');
			}
		}

		t.resetFademenu = function() {
			$('.mobilemenuck-submenu', t.mobilemenu).hide();
			$('.mobilemenuck-item > div.menuck').show().removeClass('open');
			$('.mobilemenuck-topbar .mobilemenuck-title').show();
			$('.mobilemenuck-topbar .mobilemenuck-title.mobilemenuck-backbutton').hide();
		}

		t.resetPushmenu = function() {
			$('.mobilemenuck-submenu', t.mobilemenu).hide();
			$('.mobilemenuck-itemwrap', t.mobilemenu).css('left', '0');
			$('.mobilemenuck-topbar .mobilemenuck-title:not(.mobilemenuck-backbutton)').show();
			$('.mobilemenuck-topbar .mobilemenuck-title.mobilemenuck-backbutton').hide();
		}

		t.resetFlyout = function() {
			$('.mobilemenuck-submenu', t.mobilemenu).hide();
			$('.mobilemenuck-item > div.menuck').show().removeClass('open');
			$('.mobilemenuck-topbar .mobilemenuck-title').show();
			$('.mobilemenuck-topbar .mobilemenuck-title.mobilemenuck-backbutton').hide();
		}

		t.updatelevel = function() {
			$('div.maximenuck_mod', t.menu).each(function(i, module) {
				module = $(module);
				liparentlevel = module.parent('li.maximenuckmodule').attr('data-level');
				$('li.maximenuck', module).each(function(j, li) {
					li = $(li);
					lilevel = parseInt(li.attr('data-level')) + parseInt(liparentlevel) - 1;
					li.attr('data-level', lilevel).addClass('level' + lilevel);
				});
			});
		}

		t.validateitem = function(itemtmp) {
			if (t.menutype == 'maximenuck') {
				return t.validateitemMaximenuck(itemtmp);
			} else if (t.menutype == 'accordeonck') {
				return t.validateitemAccordeonck(itemtmp);
			} else {
				return t.validateitemNormal(itemtmp);
			}
		}

		t.validateitemNormal = function(itemtmp) {
			if (!itemtmp || $(itemtmp).hasClass('nomobileck') || $(itemtmp).hasClass('mobilemenuck-hide'))
				return false;

			if ($('> a', itemtmp).length)
				return $('> a', itemtmp).clone();
			if ($('> span.separator,> span.nav-header', itemtmp).length)
				return $('> span.separator,> span.nav-header', itemtmp).clone();
			if ($('> button', itemtmp).length) // used for collabsible layout in Cassiopeia
				return $('> button', itemtmp).clone();

			return false;
		}

		t.validateitemMaximenuck = function(itemtmp) {
			if (!itemtmp || $(itemtmp).hasClass('nomobileck') || $(itemtmp).hasClass('mobilemenuck-hide'))
				return false;
			if ($('> * > img', itemtmp).length && opts.useimages == '0' && !$('> * > span.titreck', itemtmp).length) {
				return false
			}
			if ($('> a.maximenuck', itemtmp).length)
				return $('> a.maximenuck', itemtmp).clone();
			if ($('> span.separator,> span.nav-header', itemtmp).length)
				return $('> span.separator,> span.nav-header', itemtmp).clone();
			if ($('> * > a.maximenuck', itemtmp).length)
				return $('> * > a.maximenuck', itemtmp).clone();
			if ($('> * > span.separator,> * > span.nav-header', itemtmp).length)
				return $('> * > span.separator,> * >  span.nav-header', itemtmp).clone();
			if ($('> div.maximenuck_mod', itemtmp).length && opts.usemodules == '1')
				return $('> div.maximenuck_mod', itemtmp).clone();

			return false;
		}

		t.validateitemAccordeonck = function(itemtmp) {
			if (!itemtmp || $(itemtmp).hasClass('nomobileck') || $(itemtmp).hasClass('mobilemenuck-hide'))
				return false;
			var outer = $('> .accordeonck_outer', itemtmp).length ? $('> .accordeonck_outer', itemtmp) : itemtmp;
			if (($('> div.accordeonmenuck_mod', itemtmp).length && opts.usemodules == '1')
			) {
				return $('> div.accordeonmenuck_mod', itemtmp).clone();
			}
			if (($('> a', outer).length || $('> span.separator', outer).length)
						&& ($('> a', outer).length || $('> span.separator', outer).length || opts.useimages == '1')
						|| ($('> div.accordeonckmod', outer).length && opts.usemodules == '1')
						|| ($('> div.accordeonmenuck_mod', outer).length && opts.usemodules == '1')
						|| ($('> .accordeonck_outer', outer).length)
						|| ($('> .accordeonmenuck_outer', outer).length)
						) {
				return $('> a', outer).length ? $('> a', outer).clone() : $('> span.separator', outer).clone();
			}

			return false;
		}

		t.strRepeat = function(string, count) {
		var s = '';
			if (count < 1)
				return '';
			while (count > 0) {
				s += string;
				count--;
			}
			return s;
		}

		t.sortmenu = function(menu) {
			var items = new Array();
			mainitems = $('ul.maximenuck > li.maximenuck.level1', menu);
			j = 0;
			mainitems.each(function(ii, mainitem) {
				items.push(mainitem);
				if ($(mainitem).hasClass('parent')) {
					subitemcontainer = $('.maxipushdownck > .floatck', menu).eq(j);
					subitems = $('li.maximenuck', subitemcontainer);
					subitems.each(function(k, subitem) {
						items.push(subitem);
					});
					j++;
				}
			});
			return items;
		}

		t.initCss = function() {
			switch (opts.displayeffect) {
				case 'normal':
				default:
					t.mobilemenu.css({
						'position': 'absolute',
						'z-index': '100000',
						'top': '0',
						'left': '0',
						'display': 'none'
					});
					break;
				case 'slideleft':
				case 'slideleftover':
					t.mobilemenu.css({
						'position': 'fixed',
						'overflow-y': 'auto',
						'overflow-x': 'hidden',
						'z-index': '100000',
						'top': '0',
						'left': '-' + opts.menuwidth + 'px',
						'width': opts.menuwidth,
						'height': '100%',
						'display': 'none'
					});
					break;
				case 'slideright':
				case 'sliderightover':
					t.mobilemenu.css({
						'position': 'fixed',
						'overflow-y': 'auto',
						'overflow-x': 'hidden',
						'z-index': '100000',
						'top': '0',
						'right': '-' + opts.menuwidth + 'px',
						'left': 'auto',
						'width': opts.menuwidth,
						'height': '100%',
						'display': 'none'
					});
					break;
				case 'topfixed':
					t.mobilemenu.css({
						'position': 'fixed',
						'overflow-y': 'scroll',
						'z-index': '100000',
						'top': '0',
						'right': '0',
						'left': '0',
						'max-height': '100%',
						'display': 'none'
					});
					break;
			}
		}

		t.toggleMenu = function() {
			if (t.mobilemenu.css('display') == 'block') {
				t.closeMenu();
				sessionStorage.setItem('mobilemenuck-lock-hide', '1')
			} else {
				t.openMenu();
				sessionStorage.setItem('mobilemenuck-lock-hide', '0')
			}
		}

		t.openMenu = function() {
			// mobilemenu = $('#' + menuid + '-mobile');
//				mobilemenu.show();
			if (opts.overlay === '1' && ! $('#mobilemenuck-overlay').length) {
				t.mobilemenu.after('<div class="mobilemenuck-overlay" data-id="' + t.mobilemenuid + '"></div>');
			}
			switch (opts.displayeffect) {
				case 'normal':
				default:
					t.mobilemenu.fadeOut();
					$('#' + opts.menuid + '-mobile').fadeIn();
					if (opts.container != 'body')
						t.mobilemenubar.css('display', 'none');
					break;
				case 'slideleft':
				case 'slideleftover':
					t.mobilemenu.css('display', 'block').css('opacity', '0').css('left', '-' + opts.menuwidth + 'px').animate({'opacity': '1', 'left': '0'});
					if (opts.displayeffect =='slideleft')$('body').css('position', 'relative').animate({'left': opts.menuwidth});
					break;
				case 'slideright':
				case 'sliderightover':
					t.mobilemenu.css('display', 'block').css('opacity', '0').css('right', '-' + opts.menuwidth + 'px').animate({'opacity': '1', 'right': '0'});
					if (opts.displayeffect =='slideright') $('body').css('position', 'relative').animate({'right': opts.menuwidth});
					break;
				case 'open':
					// mobilemenu..slideDown();
					$('#' + opts.menuid + '-mobile').slideDown('slow');
					if (opts.container != 'body')
						t.mobilemenubar.css('display', 'none');
					break;
			}
			t.mobilemenu.find('.mobilemenuck-button').focus();
			$(document).trigger('mobilemenuck_open');
		}

		t.closeMenu = function(menuid) {
			$('.mobilemenuck-overlay[data-id="' + t.mobilemenuid + '"]').remove();
			sessionStorage.setItem('mobilemenuck-lock-hide', '1');
			if (opts.displaytype == 'fade') {
				t.resetFademenu();
			}
			if (opts.displaytype == 'push') {
				t.resetPushmenu();
			}
			if (opts.displaytype == 'flyout') {
				t.resetFlyout();
			}
			// mobilemenu = $('#' + menuid + '-mobile');
			switch (opts.displayeffect) {
				case 'normal':
				default:
					t.mobilemenu.fadeOut();
					if (opts.container != 'body')
						t.mobilemenubar.css('display', '');
					break;
				case 'slideleft':
					t.mobilemenu.animate({'opacity': '0', 'left': '-' + opts.menuwidth + 'px'}, function() {
						t.mobilemenu.css('display', 'none');
					});
					$('body').animate({'left': '0'}, function() {
						$('body').css('position', '')
					});
					break;
				case 'slideright':
					t.mobilemenu.animate({'opacity': '0', 'right': '-' + opts.menuwidth + 'px'}, function() {
						t.mobilemenu.css('display', 'none');
					});
					$('body').animate({'right': '0'}, function() {
						$('body').css('position', '')
					});
					break;
				case 'slideleftover':
					t.mobilemenu.animate({'opacity': '0', 'left': '-' + opts.menuwidth + 'px'}, function() {
						t.mobilemenu.css('display', 'none');
					});
					break;
				case 'sliderightover':
					t.mobilemenu.animate({'opacity': '0', 'right': '-' + opts.menuwidth + 'px'}, function() {
						t.mobilemenu.css('display', 'none');
					});
					break;
				case 'open':
					t.mobilemenu.slideUp('slow', function() {
						if (opts.container != 'body')
							t.mobilemenubar.css('display', '');
					});
					
					break;
			}
//			t.mobilemenubar.find('.mobilemenuck-bar-button').focus();
			$(document).trigger('mobilemenuck_close');
		}

		t.getSvg = function(icon) {
			switch(icon) {
				case 'lock':
					return '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z"></path></svg>';
					break;
				case 'unlock':
					return '<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M400 256H152V152.9c0-39.6 31.7-72.5 71.3-72.9 40-.4 72.7 32.1 72.7 72v16c0 13.3 10.7 24 24 24h32c13.3 0 24-10.7 24-24v-16C376 68 307.5-.3 223.5 0 139.5.3 72 69.5 72 153.5V256H48c-26.5 0-48 21.5-48 48v160c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48z"></path></svg>';
					break;
			}
			return '';
		}

		t.getHiddenDimensions = function(el) {
			let cloned = el.clone();
			$(document.body).append(cloned);
			cloned.css('visibility', 'hidden').show();

			let dim = {width : cloned.width(), height : cloned.height()};
			cloned.remove();

			return dim;
		}

		t.init();
		t.mobilemenu.attr('data-display', opts.displaytype);
		t.mobilemenu.attr('data-effect', opts.displayeffect);

		if (opts.displaytype == 'accordion')
			t.setAccordion();
		if (opts.displaytype == 'fade')
			t.setFade();
		if (opts.displaytype == 'push')
			t.setPush();
		if (opts.displaytype == 'flyout')
			t.setFlyout();

		// set locked state
		if (sessionStorage.getItem('mobilemenuck-lock') == '1' && sessionStorage.getItem('mobilemenuck-lock-hide') !== '1') {
			t.openMenu();
			if (! sessionStorage.getItem('mobilemenuck-state')) return; // if there is no data stored
			let opened = sessionStorage.getItem('mobilemenuck-state').split(',');
			for (var i=0; i<opened.length; i++) {
				if (opened[i] == "true") {
					t.mobilemenu.find('.mobilemenuck-submenu').eq(i).parent('.mobilemenuck-item').find('> div > .mobilemenuck-togglericon').trigger('click');
				}
			}
		}

		// custom target from any link
		$('[href*="mobilemenuck["]').each(function() {
			$(this).on('click', function(e) {
				var matches = this.href.match(/\[(.*?)\]/);
				if (matches[1]) {
					var href = $(this).attr('href');
					// stop propagation to other events like close on outside click
					e.preventDefault();
					// search for the menu item in the mobile menu and open its submenu
					if (! t.mobilemenu.find('a[href="' + href + '"]').parent().hasClass('open')
						&& ! t.mobilemenu.find('a[href="' + href + '"]').parent().find('+ .mobilemenuck-submenu').hasClass('ckopen')) {
						t.mobilemenu.find('a[href="' + href + '"] + .mobilemenuck-togglericon').trigger('click');
					}
					// show the menu after a short delay to let the submenus to be opened before
					if (t.mobilemenu.css('display') == 'none') {
						setTimeout(function() {
							t.openMenu();
						}, 200);
					}
					return false; // disable the click event feature
				}
			});
		});

		if (t.mobilemenu.find('.mod-login button.input-password-toggle').length) {
			modLoginScript(t.mobilemenu.get(0));
		}
	}
	window.MobileMenuCK = MobileMenuCK;

	// script extracted from the Joomla core, but there is no function to call it directly
	let modLoginScript = function(mobilemenu) {
		// manage the show password button
		[].slice.call(mobilemenu.querySelectorAll('input[type="password"]')).forEach(input => {
		  const toggleButton = input.parentNode.querySelector('.input-password-toggle');
		  input.setAttribute('data-type', input.type);
		  if (toggleButton) {
			toggleButton.addEventListener('click', () => {
			  const icon = toggleButton.firstElementChild;
			  const srText = toggleButton.lastElementChild;
			  if (input.type === 'password' && input.type === input.getAttribute('data-type')) {
				// Update the icon class
				icon.classList.remove('icon-eye');
				icon.classList.add('icon-eye-slash');

				// Update the input type
				input.type = 'text';

				// Focus the input field
				input.focus();

				// Update the text for screenreaders
				srText.innerText = Joomla.Text._('JHIDEPASSWORD');
				input.setAttribute('data-type', 'text');
			  } else if (input.type === 'text' && input.type === input.getAttribute('data-type')) {
				// Update the icon class
				icon.classList.add('icon-eye');
				icon.classList.remove('icon-eye-slash');

				// Update the input type
				input.type = 'password';

				// Focus the input field
				input.focus();

				// Update the text for screenreaders
				srText.innerText = Joomla.Text._('JSHOWPASSWORD');
				input.setAttribute('data-type', 'password');
			  } else {
				  input.setAttribute('data-type', input.type);
			  }
			});
		  }
		  const modifyButton = input.parentNode.querySelector('.input-password-modify');
		  if (modifyButton) {
			modifyButton.addEventListener('click', () => {
			  const lock = !modifyButton.classList.contains('locked');
			  if (lock === true) {
				// Add lock
				modifyButton.classList.add('locked');

				// Reset value to empty string
				input.value = '';

				// Disable the field
				input.setAttribute('disabled', '');

				// Update the text
				modifyButton.innerText = Joomla.Text._('JMODIFY');
			  } else {
				// Remove lock
				modifyButton.classList.remove('locked');

				// Enable the field
				input.removeAttribute('disabled');

				// Focus the input field
				input.focus();

				// Update the text
				modifyButton.innerText = Joomla.Text._('JCANCEL');
			  }
			});
		  }
		});

		// additional script to manage the duplicate ids
		let loginModules = mobilemenu.querySelectorAll('form.mod-login');
		loginModules.forEach(function(mod) {
			mod.id = mod.id + '-' + mobilemenu.id;
			let ids = mod.querySelectorAll('[id]');
			ids.forEach(function(el) {
				el.id = el.id + '-' + mobilemenu.id;
			});
		});
	}
})(jQuery);