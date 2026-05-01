/**
 * @copyright	Copyright (C) 2015 Cédric KEIFLIN alias ced1870
 * https://www.joomlack.fr
 * https://www.template-creator.com
 * @license		GNU/GPL
 * */

if (typeof jInsertFieldValue != 'function') {
	function jInsertFieldValue(value, id) {
		var $ = jQuery.noConflict();
		var old_value = $("#" + id).val();
		if (old_value != value) {
			var $elem = $("#" + id);
			$elem.val(value);
			$elem.trigger("change");
			if (typeof($elem.get(0).onchange) === "function") {
				$elem.get(0).onchange();
			}
			// jMediaRefreshPreview(id);
		}
	}
}


if (typeof jModalClose != 'function') {
	function jModalClose() {
		CKBox.close();
	}
}

function showMediaboxckButton(edname, attribtype, attribname, uriroot, imageeffectslist)
{
	window.uriroot = uriroot;
	
	if (typeof(tinyMCE) == 'undefined') return;

	imageeffectslist = window.ckImageEffectsList ? window.ckImageEffectsList : imageeffectslist;
	var editor = tinyMCE.activeEditor;
	var dom = editor.dom;
	selectionNode = editor.selection.getNode();
	focusedNode = editor.selection.getSel().anchorNode;
	selectionNodeInitial = null;
	var startTagString = '{mediabox';
	var enTagString = '{/mediabox}';
	var searchAll = false;
	var type = 'none';
	var action = 'add';
	var taghtmlOriginal = '';
	var params = {'src' : '', 'w' : '', 'h' : '', 'alb' : '', 't' : '', 'dir' : '', 'gallery' : '', 'nb' : '', 'random' : ''};
	var text = editor.selection.getContent({format: 'text'});

	if (! focusedNode) focusedNode = selectionNode;
	if (selectionNode.tagName.toLowerCase() == 'a' || (focusedNode && focusedNode.tagName && focusedNode.tagName.toLowerCase() == 'a') ) {
		type = 'link';
	} else {
		if ("innerText" in focusedNode) {
			var content = contentOriginal = focusedNode.innerText;
		} else {
			var content = contentOriginal = focusedNode.innerHTML || focusedNode.textContent;
		}

		if (selectionNode.tagName.toLowerCase() == 'img') {
			content = contentOriginal = editor.selection.getContent(); // needed to avoid the mce tags in the source code
			var cursorPos = content.replace('&nbsp;', ' ').indexOf(selectionNode.outerHTML);
		} else {
			var cursorPos = editor.selection.getRng().startOffset;
		}

		var existingTag = searchMediaboxckTags(editor, content, cursorPos);

		if (existingTag) {
			type = 'tag';
			action = 'update';

			var regSearch = /{mediabox(.*?)}(.*?){\/mediabox}/;
				var result = existingTag.match(regSearch);
				taghtmlOriginal = existingTag;

				if (result) {
					params = typeof(result[1]) != 'undefined' && result[1] ? getMediaboxckparamsFromTag(result[1].trim()) : params;
					text = typeof(result[2]) != 'undefined' ? result[2] : text;
				}
		}
	}

	if (type == 'link') {
		// if we are on an image, check if a link aready exists and then take it as reference
		if (dom.getParent(selectionNode, 'a[href]')) {
			selectionNodeInitial = selectionNode;
			selectionNode = dom.getParent(selectionNode, 'a[href]');
		}
		selectionNodeInitial = selectionNodeInitial || selectionNode;

		var anchorElm = dom.getParent(selectionNode, 'a');
		onlyText = isOnlyTextSelected(editor, anchorElm);
		var text = anchorElm ? (anchorElm.innerText || anchorElm.textContent) : editor.selection.getContent({format: 'text'});

		if (anchorElm) action = 'update';
		if (selectionNode.title) params['t'] = selectionNode.title;
		if (selectionNode.href) params['src'] = jQuery(selectionNode).attr('href'); // need jquery to avoid http in the href
		if (jQuery(selectionNode).attr('data-gallery')) params['gallery'] = (jQuery(selectionNode).attr('data-gallery') == '1') ? '1' : '';
		if (jQuery(selectionNode).attr('data-dir')) params['dir'] = jQuery(selectionNode).attr('data-dir');
		if (jQuery(selectionNode).attr('data-effect')) params['effect'] = jQuery(selectionNode).attr('data-effect');
		if (jQuery(selectionNode).attr('data-nb')) params['nb'] = jQuery(selectionNode).attr('data-nb');
		if (jQuery(selectionNode).attr('data-random')) params['random'] = jQuery(selectionNode).attr('data-random');
		if (jQuery(selectionNode).attr('data-pagination')) params['pagination'] = (jQuery(selectionNode).attr('data-pagination') == '1') ? '1' : '';

		var linkattr = [];
		if (selectionNode.attribtype) {
			linkattr = selectionNode.attribtype.split(/[\[\]]/);
		}
		if (linkattr[1]) {
			linkattr = linkattr[1];
			WH = linkattr.split(' ');
			WHL = WH.length;

			if (WHL>1) {
				params['w'] = WH[WHL-2];
				params['h'] = WH[WHL-1];
				params['alb'] = (WHL-3 == 0) ? WH[WHL-3] : '';
			} else if (WHL==1) {
				params['alb'] = WH[0];
			}
		}
	}

	// begin the contruction of the popup
	var insertLinkButton = null;
	var insertTagButton = null;

	if (type == 'link' || (type == 'tag' && action != 'update') || type == 'none') {
		var insertLinkButtonTxt = (action == 'update' ? Joomla.JText._('PLG_MEDIABOXCKBUTTON_UPDATE_LINK') : Joomla.JText._('PLG_MEDIABOXCKBUTTON_INSERT_LINK') );
		var insertLinkButton = {
			name: 'insertLinkButton',
			text: insertLinkButtonTxt,
			classes: 'btn primary widget',
			onclick: function() {
				anchorElm = dom.getParent(selectionNode, 'a');
				var mediaboxckAttrs = getMediaboxckAttrs();
				onlyText = isOnlyTextSelected(editor, anchorElm);

				var rel = [];
				rel[0] = (mediaboxckAttrs['alb'] ? mediaboxckAttrs['alb'] : '');
				rel[1] = (mediaboxckAttrs['w'] && mediaboxckAttrs['h'] ? mediaboxckAttrs['w'] : '');
				rel[2] = (mediaboxckAttrs['w'] && mediaboxckAttrs['h'] ? mediaboxckAttrs['h'] : '');
				rel = rel.join(' ').trim();
				rel = attribname + (rel ? '[' + rel + ']' : '');

				var linkAttrs = {
					href: mediaboxckAttrs['src'],
					rel: attribtype == 'rel' ? rel : null, // todo verif si à mettre sur rel ou class
					"class": attribtype == 'className' ? rel : null,
					title: mediaboxckAttrs['t'] ? mediaboxckAttrs['t'] : null,
					"data-dir": (mediaboxckAttrs['dir'] ? mediaboxckAttrs['dir'] : ''),
					"data-gallery": (mediaboxckAttrs['gallery'] == 'checked' && mediaboxckAttrs['dir'] ? '1' : ''),
					"data-effect": (mediaboxckAttrs['effect'] ? mediaboxckAttrs['effect'] : ''),
					"data-nb": (mediaboxckAttrs['nb'] ? mediaboxckAttrs['nb'] : ''),
					"data-random": (mediaboxckAttrs['random'] == 'checked' && mediaboxckAttrs['random'] ? '1' : '')
				};

				if (anchorElm) {
					editor.focus();

					if (onlyText && jQuery('#mediaboxck_popup_text').val() != params.t) {
						if ("innerText" in anchorElm) {
							anchorElm.innerText = jQuery('#mediaboxck_popup_text').val();
						} else {
							anchorElm.textContent = jQuery('#mediaboxck_popup_text').val();
						}
					}

					dom.setAttribs(anchorElm, linkAttrs);

					editor.selection.select(anchorElm);
					editor.undoManager.add();
				} else {
					if (onlyText) {
						// editor.insertContent(dom.createHTML('a', linkAttrs, dom.encode(jQuery('#mediaboxck_popup_text').val())));
						editor.execCommand('mceInsertContent', false, dom.createHTML('a', linkAttrs, dom.encode(jQuery('#mediaboxck_popup_text').val())));
					} else {
						editor.execCommand('mceInsertLink', false, linkAttrs);
					}
				}
				editor.windowManager.close();
			},
			id: 'insertmediaboxcklink'
		};
	}
	if (type == 'tag' || (type == 'link' && action != 'update') || type == 'none') {
		var insertTagButtonTxt = (action == 'update' ? Joomla.JText._('PLG_MEDIABOXCKBUTTON_UPDATE_TAG')  : Joomla.JText._('PLG_MEDIABOXCKBUTTON_INSERT_TAG') );
		var insertTagButton = {
			name: 'insertTagButton',
			text: insertTagButtonTxt,
			classes: 'btn primary widget',
			onclick: function() { 
				var taghtml = getMediaboxckTag(editor);
				if (taghtml) {
					if (action == 'update') {
						var new_content = editor.getContent().replace(taghtmlOriginal, taghtml);
						editor.setContent(new_content);
					} else {
//						editor.insertContent(taghtml);
						editor.execCommand('mceInsertContent', false, taghtml);
					}
					editor.windowManager.close();
				}
			},
			id: 'insertmediaboxcktag'
		};
	}
	// load the popup
	var popupButtons = [insertLinkButton, insertTagButton];
	showMediaboxPopup(editor, params, text, popupButtons, action, edname, taghtmlOriginal, attribname, attribtype, imageeffectslist);
	// neede for actual mediamanger, to be improved
	CKBox.initialize({});
	CKBox.assign(jQuery('.mediaboxckmodal a.modal'), {
		parse: 'rel'
	});
	// init elements inside the popup
	initTabs(jQuery('#mediaboxck_popup_source_fielset'));
	MediaboxckSelectGallery(document.getElementById('mediaboxck_popup_gallery').checked);
//	jQuery('#mediabox_popup .hasTooltip').tooltip({"html": true,"container": "body"});

	jQuery('#insertmediaboxcktag').click(function() {
		var taghtml = getMediaboxckTag(editor);

		if (taghtml) {
			if (action == 'update') {
				var new_content = editor.getContent().replace(taghtmlOriginal, taghtml);
				editor.setContent(new_content);
			} else {
	//			editor.insertContent(taghtml);
				// jInsertEditorText(taghtml, editor);
				editor.execCommand('mceInsertContent', false, taghtml);
			}
	//		editor.windowManager.close();
			hideMediaboxPopup();
		}
	});

	jQuery('#insertmediaboxcklink').click(function() {
		anchorElm = dom.getParent(selectionNode, 'a');
		var mediaboxckAttrs = getMediaboxckAttrs();
		onlyText = isOnlyTextSelected(editor, anchorElm);

		var rel = [];
		rel[0] = (mediaboxckAttrs['alb'] ? mediaboxckAttrs['alb'] : '');
		rel[1] = (mediaboxckAttrs['w'] && mediaboxckAttrs['h'] ? mediaboxckAttrs['w'] : '');
		rel[2] = (mediaboxckAttrs['w'] && mediaboxckAttrs['h'] ? mediaboxckAttrs['h'] : '');
		rel = rel.join(' ').trim();
		rel = attribname + (rel ? '[' + rel + ']' : '');

		var linkAttrs = {
			href: mediaboxckAttrs['src'],
			rel: attribtype == 'rel' ? rel : '', // todo verif si à mettre sur rel ou class
			"class": attribtype == 'className' ? rel : '',
			title: mediaboxckAttrs['t'] ? mediaboxckAttrs['t'] : '',
			"data-dir": (mediaboxckAttrs['dir'] ? mediaboxckAttrs['dir'] : ''),
			"data-gallery": (mediaboxckAttrs['gallery'] == 'checked' && mediaboxckAttrs['dir'] ? '1' : ''),
			"data-nb": (mediaboxckAttrs['gallery'] == 'checked' && mediaboxckAttrs['nb'] ? mediaboxckAttrs['nb'] : ''),
			"data-random": (mediaboxckAttrs['random'] == 'checked' && mediaboxckAttrs['gallery'] ? '1' : ''),
			"data-effect": (mediaboxckAttrs['gallery'] == 'checked' && mediaboxckAttrs['effect'] ? mediaboxckAttrs['effect'] : '')
		};

		if (anchorElm) {
			editor.focus();

			if (onlyText && jQuery('#mediaboxck_popup_text').val() != params.t) {
				if ("innerText" in anchorElm) {
					anchorElm.innerText = jQuery('#mediaboxck_popup_text').val();
				} else {
					anchorElm.textContent = jQuery('#mediaboxck_popup_text').val();
				}
			}

			dom.setAttribs(anchorElm, linkAttrs);

			editor.selection.select(anchorElm);
			editor.undoManager.add();
		} else {
			if (onlyText) {
				var taghtml = dom.createHTML('a', linkAttrs, dom.encode(jQuery('#mediaboxck_popup_text').val()));
	//			editor.insertContent(dom.createHTML('a', linkAttrs, dom.encode(jQuery('#mediaboxck_popup_text').val())));
				// jInsertEditorText(taghtml, editor);
				editor.execCommand('mceInsertContent', false, taghtml);
			} else {
				editor.execCommand('mceInsertLink', false, linkAttrs);
			}
		}
		hideMediaboxPopup();
	});

	if (params['dir']) {
		jQuery('#mediaboxck_popup_accordeonbutton_media_directory').trigger('click');
		jQuery('#mediaboxck_source_choice_list option[value="dir"]').attr('selected', 'selected');
	} else if (params['youtube']) {
		jQuery('#mediaboxck_popup_accordeonbutton_media_youtube').trigger('click');
		jQuery('#mediaboxck_popup_text_fieldset').hide();
		jQuery('#mediaboxck_source_choice_list option[value="youtube"]').attr('selected', 'selected');
	} else {
		jQuery('#mediaboxck_popup_accordeonbutton_media_single').trigger('click');
		jQuery('#mediaboxck_source_choice_list option[value="src"]').attr('selected', 'selected');
	}
}

function searchMediaboxckTags(editor, content, cursorPos) {
	var startTagString = '{mediabox';
	var enTagString = '{/mediabox}';
	var editorContent = editor.getContent({format: "html"});
	var editorOffset = editorContent.indexOf(content);
	var tagsPositions = [];
	var allTags = editorContent.split(startTagString);

	cursorPos = cursorPos + editorOffset;

	for (i=1; i<allTags.length; i++) {
		tagsPositions[i] = [];

		if (i > 1) {
			var prevEnd = tagsPositions[i-1]['next'];
		} else {
			var prevEnd = allTags[i-1].length;
		}
		var endTagPos = allTags[i].indexOf(enTagString);

		tagsPositions[i]['start'] = prevEnd + 1;
		tagsPositions[i]['end'] = startTagString.length + tagsPositions[i]['start'] + endTagPos + enTagString.length;
		tagsPositions[i]['next'] = startTagString.length + prevEnd + allTags[i].length;
		tagsPositions[i]['code'] = startTagString + allTags[i].substr(0, endTagPos + enTagString.length);

		if (cursorPos > tagsPositions[i]['start'] && cursorPos < tagsPositions[i]['end']) {
			return tagsPositions[i]['code'];
		}
	}

	return false;
}

function getMediaboxckparamsFromTag(params) {

	params = params.split('|');
	if (params.length <= 0) return;
	var src = '', w = '', h = '', alb = '', t = '', dir = '', gallery = '', effect = '', number = '', random = '', pagination = '', youtube = '';

	for (i = 0; i < params.length; i++) {

// src= : source media to show in the popup
// w= : lightbox width in px
// h= : lightbox height in px
// alb= : album name to group the medias and show the navigation
// t= : title and description shown under the media, separate them with a double point ::
// dir= : load automatically all the images contained in the folder

		src = params[i].substr(0,4) == 'src=' ? params[i].replace('src=','') : src;
		w = params[i].substr(0,2) == 'w=' ? params[i].replace('w=','') : w;
		h = params[i].substr(0,2) == 'h=' ? params[i].replace('h=','') : h;
		alb = params[i].substr(0,4) == 'alb=' ? params[i].replace('alb=','') : alb;
		t = params[i].substr(0,2) == 't=' ? params[i].replace('t=','') : t;
		dir = params[i].substr(0,4) == 'dir=' ? params[i].replace('dir=','') : dir;
		gallery = params[i].substr(0,8) == 'gallery=' ? params[i].replace('gallery=','') : gallery;
		effect = params[i].substr(0,7) == 'effect=' ? params[i].replace('effect=','') : effect;
		number = params[i].substr(0,3) == 'nb=' ? params[i].replace('nb=','') : number;
		random = params[i].substr(0,7) == 'random=' ? params[i].replace('random=','') : random;
		pagination = params[i].substr(0,11) == 'pagination=' ? params[i].replace('pagination=','') : pagination;
		youtube = params[i].substr(0,8) == 'youtube=' ? params[i].replace('youtube=','') : youtube;
	}

	var arrayParams = {'src' : src, 'w' : w, 'h' : h, 'alb' : alb, 't' : t, 'dir' : dir, 'gallery' : gallery, 'effect' : effect, 'nb' : number, 'random': random, 'pagination': pagination, youtube: youtube};

	return arrayParams;
}

function createMediaboxPopup(params, text, imageeffectslist) {
	var title = params.t;

	if (title) {
		title = title.split('::');
		var desc = title[1] ? title[1] : '';
		title = title[0];
	} else {
		title = '';
		var desc = '';
	}

	if (selectionNodeInitial && selectionNodeInitial.tagName.toLowerCase() == 'img' && selectionNodeInitial.src) {
		var codeText = '<div style="text-align:center;padding:5px;"><img src="' + selectionNodeInitial.src + '" style="width: auto;height:100px;"/></div>';
	} else if (/<img/.test(text)) {
		var codeText = '<div style="text-align:center;padding:5px;"><img src="' + uriroot + '/' + jQuery(text).attr('src') + '" style="width: auto;height:100px;"/></div>';
		codeText += '<input type="hidden" value="' + text.replace(/"/g,'_QQ_')  + '" id="mediaboxck_popup_text" />';
	} else {
		var codeText = '<div><label>' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_TEXT') + '</label><input type="text" value="' + text + '" id="mediaboxck_popup_text" /></div>';
	}

	// compatibility with image effect CK plugin
	try {
		imageeffectslist = JSON.parse(imageeffectslist);
		var imageeffectslistOption = '';
		for (var i in imageeffectslist) {
			imageeffectslistOption += '<option ' + (imageeffectslist[i] == params.effect ? 'selected="selected"' : '') + ' value="' + imageeffectslist[i] + '">' + i + '</option>';
		}
	} catch (error) {
		imageeffectslist = imageeffectslist.split(',');
		var imageeffectslistOption = '';
		for (var i in imageeffectslist) {
			imageeffectslistOption += '<option ' + (imageeffectslist[i] == params.effect ? 'selected="selected"' : '') + ' value="' + imageeffectslist[i] + '">' + imageeffectslist[i] + '</option>';
		}
	}

	code = '<div id="mediabox_popup">';
	code += '<div id="mediabox_popup_left">';

	// code += '<div><label>' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_TEXT') + '</label><input type="text" value="' + text + '" id="mediaboxck_popup_text" /></div>';
	
	
	code += '<div><fieldset id="mediaboxck_popup_source_fielset"><legend>' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_SOURCE') + '</legend>';
		
		code += '<div class="btn-group" id="mediaboxck_source_choice">';
		code += '<select id="mediaboxck_source_choice_list" onchange="MediaboxckSelectSource(this.value)" class="custom-select">'
		code += '<option value="src" selected>' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_SOURCE_MEDIA_SINGLE') + '</option>'
		code += '<option value="dir">' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_SOURCE_MEDIA_DIRECTORY') + '</option>'
		code += '<option value="youtube">' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_SOURCE_YOUTUBE') + '</option>'
		code += '</select>'
		code += '<a style="display:none;" id="mediaboxck_popup_accordeonbutton_media_single" class="btn mediaboxck_popup_accordeonbutton active" data-target="src" onclick="jQuery(\'#mediabox_popup_right\').removeClass(\'mediaboxck_popup_show_folders\');jQuery(\'#insertmediaboxcklink\').fadeIn();jQuery(\'#galleryoption\').fadeOut();getSourcePreview();">' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_SOURCE_IMAGE_SINGLE') + '</a>';
		code += '<a style="display:none;" id="mediaboxck_popup_accordeonbutton_media_directory" class="btn mediaboxck_popup_accordeonbutton" data-target="dir" onclick="jQuery(\'#galleryoption\').fadeIn();">' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_SOURCE_MEDIA_DIRECTORY') + '</a>';
		code += '<a style="display:none;" id="mediaboxck_popup_accordeonbutton_media_youtube" class="btn mediaboxck_popup_accordeonbutton" data-target="youtube" onclick="jQuery(\'#mediabox_popup_right\').removeClass(\'mediaboxck_popup_show_folders\');jQuery(\'#insertmediaboxcklink\').fadeIn();jQuery(\'#galleryoption\').fadeOut();getSourcePreview();">' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_SOURCE_MEDIA_DIRECTORY') + '</a>';
		code += '</div>';
		
		code += '<div class="mediaboxck_popup_accordeoncontent open">';
			code += '<div><label class="hasTooltip" title="' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_SOURCE_NOTES') + '">' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_SOURCE') + '</label><input type="text" value="' + params.src + '" id="mediaboxck_popup_source" placeholder="E.g.: images/sample/sample.jpg" onchange="getSourcePreview()"/></div>';
			code += '<div><a class="btn btn-primary" href="javascript:void(0)" onclick="MediaboxckShowMediamanager()">' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_SELECT_MEDIA') + '</a></div>';
		code += '</div>';
		code += '<div class="mediaboxck_popup_accordeoncontent">';
			code += '<div><label class="hasTooltip" title="' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_SOURCE_DIRECTORY_NOTES') + '">' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_SOURCE_DIRECTORY') + '</label><input type="text" value="' + params.dir + '" id="mediaboxck_popup_source_dir" placeholder="E.g.: images/sample" /></div>';
			code += '<div><a class="btn btn-primary" href="javascript:void(0)" " onclick="getFoldersList()">' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_SELECT_DIRECTORY') + '</a></div>';
		code += '</div>';
		code += '<div class="mediaboxck_popup_accordeoncontent">';
			code += '<div><label class="hasTooltip" title="' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_YOUTUBE_NOTES') + '">' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_SOURCE_YOUTUBE_URL') + '</label><input type="text" value="' + params.youtube + '" id="mediaboxck_popup_source_youtube" placeholder="E.g.: https://www.youtube.com/watch?v=5p_dSIWUEWI" onchange="getSourcePreview()"/></div>';
//			code += '<div><a class="btn btn-primary" href="javascript:void(0)" onclick="MediaboxckShowMediamanager()">' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_SELECT_IMAGE') + '</a></div>';
		code += '</div>';
	code += '</fieldset></div>';
	
	// options for gallery
	code += '<div id="galleryoption">';
		code += '<fieldset><legend>' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_GALLERY') + '</legend>';
			code += '<label for="mediaboxck_popup_gallery" class="hasTooltip" title="' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_GALLERY_DESC') + '">' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_GALLERY') + '</label><input type="checkbox" ' + (params.gallery ? 'checked="true"' : '') + ' value="' + params.gallery + '" id="mediaboxck_popup_gallery" placeholder="" onchange="MediaboxckSelectGallery(this.checked)"/>';
			code += '<div id="mediaboxck_popup_gallery_options" style="' + (params.gallery ? 'display:block' : 'display:none') + ';">';
//				if (imageeffectslist.length > 1) {
					code += '<div id="effectoption"><label class="hasTooltip" title="' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_EFFECT_DESC') + '">' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_EFFECT') + '</label><select type="text" value="' + params.effect + '" id="mediaboxck_popup_effect" class="custom-select"><option value=""></option>' + imageeffectslistOption + '</select></div>';
//				} else {
//					code += '<div id="effectoption"><label class="hasTooltip" title="' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_EFFECT_DESC') + '">' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_EFFECT') + '</label><span>' + imageeffectslist + '</span></div>';
//				}
				code += '<div><label>' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_LIMIT_NUMBER') + '</label><input type="text" value="' + params.nb + '" id="mediaboxck_popup_number" placeholder="E.g.: 5 (leave blank for all)"/></div>';
				code += '<div><label for="mediaboxck_popup_random">' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_RANDOM_ORDER') + '</label><input type="checkbox" ' + (params.random ? 'checked="true"' : '') + ' value="' + params.random + '" id="mediaboxck_popup_random" /></div>';
				//pagination
				code += '<div><label for="mediaboxck_popup_pagination">' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_PAGINATION') + '</label><input type="checkbox" ' + (params.pagination ? 'checked="true"' : '') + ' value="' + params.pagination + '" id="mediaboxck_popup_pagination" /></div>';
	code += '</div>';
		code += '</fieldset>';
	code += '</div>';
	
	code += '<div id="mediaboxck_popup_text_fieldset">' + codeText + '</div>';
	// code for caption
	code += '<fieldset id="mediaboxck_popup_caption_fielset"><legend>' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_CAPTION') + '</legend>';
	code += '<div><label>' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_TITLE') + '</label><input type="text" value="' + title + '" id="mediaboxck_popup_title" /></div>';
	code += '<div><label>' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_DESCRIPTION') + '</label><input type="text" value="' + desc + '" id="mediaboxck_popup_description" /></div>';
	code += '</fieldset>'
	
	// options for dimensions
	code += '<div><fieldset><legend>' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_DIMENSIONS') + '</legend>';
		code += '<div><p>' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_DIMENSIONS_NOTES') + '</p></div>';
		code += '<div><label>' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_WIDTH') + '</label><input type="text" value="' + params.w + '" id="mediaboxck_popup_width" placeholder="E.g.: 640px"/></div>';
		code += '<div><label>' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_HEIGHT') + '</label><input type="text" value="' + params.h + '" id="mediaboxck_popup_height" placeholder="E.g.: 480px"/></div>';
//	code += '</div>';
	code += '</fieldset></div>';
	code += '<div><label class="hasTooltip" title="' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_ALBUM_DESC') + '">' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_ALBUM') + '</label><input type="text" value="' + params.alb + '" id="mediaboxck_popup_album" placeholder="E.g. : cars"/></div>';
	
	
	
	code += '</div>'; // end left
	
	code += '<div id="mediabox_popup_right">';

	code += '</div>'; // end right
	code += '<div style="clear:both;"></div>';
	code += '</div>';

	return code;
}

function initTabs(container) {
	jQuery('.mediaboxck_popup_accordeoncontent:not(.open)', container).hide();
	jQuery('.mediaboxck_popup_accordeonbutton', container).each( function(i, button) {
		this.tab = jQuery('.mediaboxck_popup_accordeoncontent', container).eq(i);
		jQuery(button).click(function(){
			if (jQuery(this).hasClass('active')) {
				// if is opened
				return;
			} else {
				// if is closed
				jQuery('.mediaboxck_popup_accordeonbutton', container).removeClass('active');
				jQuery(this).addClass('active');
				jQuery('.mediaboxck_popup_accordeoncontent', container).hide();
				this.tab.fadeIn();
			}
		});
	});
}

function MediaboxckSelectSource(value) {
	if (value == 'dir') {
		jQuery('#mediaboxck_popup_accordeonbutton_media_directory').trigger('click');
		jQuery('#insertmediaboxcklink').show();
	} else if (value == 'youtube') {
		jQuery('#mediaboxck_popup_accordeonbutton_media_youtube').trigger('click');
		jQuery('#mediaboxck_popup_text_fieldset').hide();
		jQuery('#insertmediaboxcklink').hide();
	} else {
		jQuery('#mediaboxck_popup_accordeonbutton_media_single').trigger('click');
		jQuery('#mediaboxck_popup_text_fieldset').show();
		jQuery('#insertmediaboxcklink').show();
	}
}

function MediaboxckSelectGallery(value) {
	if (value == '1') {
		jQuery('#mediaboxck_popup_gallery_options').show();
		jQuery('#mediaboxck_popup_text_fieldset').hide();
	} else {
		jQuery('#mediaboxck_popup_gallery_options').hide();
		jQuery('#mediaboxck_popup_text_fieldset').show();
	}
}

function getMediaboxckTag(editor) {
	// open tag
	var taghtml = '{mediabox';
	
	// start loop to get the params
	var tagparams = [];

	if (jQuery('#mediaboxck_popup_width').val()) tagparams.push('w=' + jQuery('#mediaboxck_popup_width').val());
	if (jQuery('#mediaboxck_popup_height').val()) tagparams.push('h=' + jQuery('#mediaboxck_popup_height').val());
	if (jQuery('#mediaboxck_popup_album').val()) tagparams.push('alb=' + jQuery('#mediaboxck_popup_album').val());
	if (jQuery('#mediaboxck_popup_gallery').prop('checked')) tagparams.push('gallery=1');
	if (jQuery('#mediaboxck_popup_number').val() && jQuery('#mediaboxck_popup_gallery').prop('checked')) tagparams.push('nb=' + jQuery('#mediaboxck_popup_number').val());
	if (jQuery('#mediaboxck_popup_random').prop('checked') && jQuery('#mediaboxck_popup_gallery').prop('checked')) tagparams.push('random=1');
	if (jQuery('#mediaboxck_popup_pagination').prop('checked') && jQuery('#mediaboxck_popup_gallery').prop('checked')) tagparams.push('pagination=1');
	if (jQuery('#mediaboxck_popup_effect').val() && jQuery('#mediaboxck_popup_gallery').prop('checked')) tagparams.push('effect=' + jQuery('#mediaboxck_popup_effect').val());
	var newtitle = jQuery('#mediaboxck_popup_title').val() + (jQuery('#mediaboxck_popup_description').val() ? '::' + jQuery('#mediaboxck_popup_description').val() : '');
	if (newtitle) tagparams.push('t=' + newtitle);

	var srctag = jQuery('#mediaboxck_source_choice .active').length ? jQuery('#mediaboxck_source_choice .active').attr('data-target') : 'src';

	if (srctag == 'dir') {
		if (jQuery('#mediaboxck_popup_source_dir').val() == '') {
			alert(Joomla.JText._('PLG_MEDIABOXCKBUTTON_SOURCE_MISSING') );
			jQuery('#mediaboxck_popup_source_dir').focus().addClass('invalid');
			return false;
		}
		tagparams.push('dir=' + jQuery('#mediaboxck_popup_source_dir').val());
	} else if (srctag == 'youtube') {
		if (jQuery('#mediaboxck_popup_source_youtube').val() == '') {
			alert(Joomla.JText._('PLG_MEDIABOXCKBUTTON_SOURCE_MISSING') );
			jQuery('#mediaboxck_popup_source_youtube').focus().addClass('invalid');
			return false;
		}
		tagparams.push('youtube=' + jQuery('#mediaboxck_popup_source_youtube').val());
	} else {
		if (jQuery('#mediaboxck_popup_source').val() == '') {
			alert(Joomla.JText._('PLG_MEDIABOXCKBUTTON_SOURCE_MISSING') );
			jQuery('#mediaboxck_popup_source').focus().addClass('invalid');
			return false;
		}
		tagparams.push('src=' + jQuery('#mediaboxck_popup_source').val());
	}

	if (tagparams.length) taghtml += ' ' + tagparams.join('|');
	taghtml += '}';

	taghtml += jQuery('#mediaboxck_popup_text').val() || editor.selection.getContent();
	taghtml = taghtml.replace(/_QQ_/g, '"');

	// close tag
	taghtml += '{/mediabox}';

	return taghtml;
}

function getMediaboxckAttrs() {
	var tagparams = [];
	tagparams['w'] = jQuery('#mediaboxck_popup_width').val();
	tagparams['h'] = jQuery('#mediaboxck_popup_height').val();
	tagparams['alb'] = jQuery('#mediaboxck_popup_album').val();
	tagparams['gallery'] = jQuery('#mediaboxck_popup_gallery').attr('checked');
	var newtitle = jQuery('#mediaboxck_popup_title').val() + (jQuery('#mediaboxck_popup_description').val() ? '::' + jQuery('#mediaboxck_popup_description').val() : '');
	tagparams['t'] = newtitle;
	tagparams['nb'] = tagparams['gallery'] ? jQuery('#mediaboxck_popup_number').val() : '';
	tagparams['random'] = tagparams['gallery'] ? jQuery('#mediaboxck_popup_random').attr('checked') : '';
	tagparams['effect'] = tagparams['gallery'] ? jQuery('#mediaboxck_popup_effect').val() : '';
	tagparams['youtube'] = tagparams['youtube'] ? jQuery('#mediaboxck_popup_source_youtube').val() : '';

	var srctag = jQuery('#mediaboxck_source_choice .active').length ? jQuery('#mediaboxck_source_choice .active').attr('data-target') : 'src';

	if (srctag == 'dir') {
		if (jQuery('#mediaboxck_popup_source_dir').val() == '') {
			alert(Joomla.JText._('PLG_MEDIABOXCKBUTTON_SOURCE_MISSING') );
			jQuery('#mediaboxck_popup_source_dir').focus().addClass('invalid');
			return false;
		}
		tagparams['src'] = '#';
		tagparams['dir'] = jQuery('#mediaboxck_popup_source_dir').val();
	} else if (srctag == 'youtube') {
		if (jQuery('#mediaboxck_popup_source_youtube').val() == '') {
			alert(Joomla.JText._('PLG_MEDIABOXCKBUTTON_SOURCE_MISSING') );
			jQuery('#mediaboxck_popup_source_youtube').focus().addClass('invalid');
			return false;
		}
		tagparams['src'] = jQuery('#mediaboxck_popup_source_youtube').val();;
		tagparams['dir'] = '';
	} else {
		if (jQuery('#mediaboxck_popup_source').val() == '') {
			alert(Joomla.JText._('PLG_MEDIABOXCKBUTTON_SOURCE_MISSING') );
			jQuery('#mediaboxck_popup_source').focus().addClass('invalid');
			return false;
		}
		tagparams['src'] = jQuery('#mediaboxck_popup_source').val();
		tagparams['dir'] = '';
	}

	return tagparams;
}

function getFoldersList() {
	jQuery('#mediabox_popup_right').addClass('mediaboxck_popup_show_folders');
	if (jQuery('#mediaboxck_popup_listfolders').length) {
		return;
	}
	jQuery('#mediabox_popup_right').empty().append('<div class="loadingck"></div>');
	var myurl = 'index.php?option=com_ajax&format=raw&plugin=Mediabox_ck&group=system';
	jQuery.ajax({
		type: 'POST',
		url: myurl,
		data: {
			method: 'AjaxListFolders'
		}
	}).done(function(response) {
		jQuery('#mediabox_popup_right').empty().append('<div id="mediaboxck_popup_listfolders">' + response + '</div>').removeClass('loadingck');
		jQuery('#mediabox_popup_right').addClass('mediaboxck_popup_show_folders');
	}).fail(function() {
		alert('Failed');
	});
}

function MediaboxckShowMediamanager() {
	var fieldid='mediaboxck_popup_source';
	if (MEDIABOXCK.ISJ4 == '1') {
		$boxfooterhtml = '<a class="ckboxmodal-button" href="javascript:void(0);" onclick="ckMediaboxckbuttonGetJ4Image(\'' + fieldid + '\');CKBox.close(this);">' + Joomla.JText._('CK_SAVE_CLOSE') + '</a>';
		CKBox.open({id: 'ckmediamanager', handler: 'iframe', url: MEDIABOXCK.URIROOT + '/administrator/index.php?option=com_media&view=media&e_name='+fieldid+'&tmpl=component'
		, footerHtml: $boxfooterhtml});
	} else {
		CKBox.open({url : MEDIABOXCK.URIROOT + '/administrator/index.php?option=com_media&view=images&tmpl=component&fieldid=mediaboxck_popup_source'});
	}
}

// automatically catch the event for the J4 media manager
window.document.addEventListener('onMediaFileSelected', e => {
	MEDIABOXCK.selectedImage = e.detail;
});

function ckMediaboxckbuttonGetJ4Image(field_id) {
	var data = MEDIABOXCK.selectedImage;
	if (!data || typeof data === 'object' && (!data.path || data.path === '')) {
	  Joomla.selectedFile = {};
	  // resolve({
		// resp: {
		  // success: false
		// }
	  // });
	  return;
	}

	const execTransform = (resp) => {
		if (resp.success === true) {
		  if (resp.data[0].url) {
			if (/local-/.test(resp.data[0].adapter)) {
			  // const {
				// rootFull
			  // } = Joomla.getOptions('system.paths'); // eslint-disable-next-line prefer-destructuring

			  // Joomla.selectedFile.url = resp.data[0].url.split(rootFull)[1];
			  // }
			  var imageurl = resp.data[0].url.split(MEDIABOXCK.URIROOTABS)[1];
			  MediaboxckSelectFile(imageurl, field_id);
			} else if (resp.data[0].thumb_path) {
			  Joomla.selectedFile.thumb = resp.data[0].thumb_path;
			}
		  } else {
			Joomla.selectedFile.url = false;
		  }
		}
	}

	jQuery.ajax({
		url: MEDIABOXCK.URIROOT + '/administrator/index.php?option=com_media&format=json&task=api.files&url=true&mediatypes=0,1,2,3&path=' + data.path + '&' + MEDIABOXCK.TOKEN,
	})
	.done(function( response ) {
		let resp;
		if (typeof(response) !== 'object') {
			resp = JSON.parse(response);
		} else {
			resp = response;
		}
		execTransform(resp);
		MEDIABOXCK.selectedImage = {}; // empty the image selection
	})
	.fail(function() {
		alert('FAILED');
	});
}

function MediaboxckSelectFile(file, field) {
	if (! field) {
		alert('ERROR : no field given in the function MediaboxckSelectFile');
		return;
	}
	jQuery('#'+field).val(file).trigger('change');
}

function getSourcePreview() {
	// if (jQuery('#mediaboxck_popup_sourcepreview').length) {
		// return;
	// }
	var allowedSrc = ['png', 'jpg', 'bmp', 'gif', 'tif'];
	var imageSrc = jQuery('#mediaboxck_popup_source').val();
	var isImage = imageSrc.substr(imageSrc.length-4, 1) == '.' && allowedSrc.indexOf(imageSrc.substr(-3, 3)) >= 0 ;
	if (isImage) {
		jQuery('#mediabox_popup_right').addClass('mediaboxck_popup_show_preview');
		jQuery('#mediabox_popup_right').empty().append('<div id="mediaboxck_popup_sourcepreview"><div class="mediaboxck_popup_title">' + Joomla.JText._('PLG_MEDIABOXCKBUTTON_PREVIEW') + '</div><img src="' + uriroot + '/' + imageSrc + '"/></div>').removeClass('loadingck');
	}
}

function selectfolderck(folder) {
	jQuery('#mediaboxck_popup_source_dir').val(jQuery(folder).attr('data-foldername').replace(/\\/g, '/'));
	jQuery('#mediabox_popup_right').removeClass('mediaboxck_popup_show_folders');
}

function isOnlyTextSelected(editor, anchorElm) {
	var html = editor.selection.getContent();

	// Partial html and not a fully selected anchor element
	if (/</.test(html) && (!/^<a [^>]+>[^<]+<\/a>$/.test(html) || html.indexOf('href=') == -1)) {
		return false;
	}

	if (anchorElm) {
		var nodes = anchorElm.childNodes, i;

		if (nodes.length === 0) {
			return false;
		}

		for (i = nodes.length - 1; i >= 0; i--) {
			if (nodes[i].nodeType != 3) {
				return false;
			}
		}
	}

	return true;
}

function showMediaboxPopup(editor, params, text, buttons, action, edname, taghtmlOriginal, attribname, attribtype, imageeffectslist) {
		jQuery('#mediaboxckmodal').remove();
		jQuery('#mediaboxckmodal-back').remove();

		buttonshtml = '';
		for (i=0;i<buttons.length;i++) {
			if (buttons[i])
			buttonshtml += '<a class="mediaboxckmodal-button" href="javascript:void(0);" id="' + buttons[i].id + '" ><i class="icon icon-checkmark"></i>' + buttons[i].text + '</button>'
		}
		// onclick="' + buttons[i].name + 'Click(\''+edname+'\', \''+action+'\', \''+taghtmlOriginal+'\', \''+attribname+'\', \''+attribtype+'\' )"
		var html = '<div class="mediaboxckmodal-header">'
				+'<h3>Mediabox CK - Edition</h3>'
			+'</div>'
			+'<div class="mediaboxckmodal-body">'
				// + '<link rel="stylesheet" href="' + window.uriroot + '/plugins/system/mediaboxck/assets/mediaboxck.css" type="text/css" />'
				+ createMediaboxPopup(params, text, imageeffectslist)
			+'</div>'
			+'<div class="mediaboxckmodal-footer">'
				+'<a class="mediaboxckmodal-button" href="javascript:void(0);" onclick="hideMediaboxPopup()">×</a>'
				+ buttonshtml
			+'</div>';

		jQuery(document.body).append('<div id="mediaboxckmodal" class="mediaboxckmodal" />');
		jQuery(document.body).append('<div id="mediaboxckmodal-back" class="mediaboxckmodal-back" onclick="hideMediaboxPopup()"/>');
		var modal = jQuery('#mediaboxckmodal');
		modal.append(html);
		modal.css('top', (jQuery(window).scrollTop() + jQuery(window).height()/2) + 'px');
		modal.show();
}

function hideMediaboxPopup() {
	jQuery('#mediaboxckmodal').remove();
	jQuery('#mediaboxckmodal-back').remove();
}
