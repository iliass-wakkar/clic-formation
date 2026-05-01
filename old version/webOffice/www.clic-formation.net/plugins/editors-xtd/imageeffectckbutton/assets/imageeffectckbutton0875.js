/**
 * @copyright	Copyright (C) 2015 Cédric KEIFLIN alias ced1870
 * http://www.joomlack.fr
 * http://www.template-creator.com
 * @license		GNU/GPL
 * */

$ck = window.$ck || jQuery.noConflict();

CKApi = window.CKApi || {};

CKApi.Imageeffect = {
	setEffectsList: function(list) {
		if (! list) {
			list = ckImageEffectsList || '""';
		}
//		list = list.split(',');
		list = JSON.parse(list);
		CKApi.Imageeffect.effectslist = list;
	},
	getEffectsList: function() {
		if (! CKApi.Imageeffect.effectslist) {
			var effectslist = new Array(
				"effectck-lily"
				,"effectck-oscar" 
				,"effectck-sadie"
				,"effectck-honey"
				,"effectck-layla"
				,"effectck-zoe"
				,"effectck-marley"
				,"effectck-ruby"
				,"effectck-roxy"
				,"effectck-bubba"
				,"effectck-romeo"
				,"effectck-dexter"
				,"effectck-sarah"
				,"effectck-chico"
				,"effectck-milo"
				,"effectck-julia"
				,"effectck-goliath"
				,"effectck-selena"
				,"effectck-apollo"
				,"effectck-steve"
				,"effectck-moses"
				,"effectck-jazz"
				,"effectck-ming"
				,"effectck-duke"
				);

			return effectslist;
		}
		// else 
		return CKApi.Imageeffect.effectslist;
	},
	showInterface: function(returnFunc) {
		CKApi.Imageeffect.setEffectsList();
		$ck('#imageeffectckmodal').remove();
		$ck('#imageeffectckmodal-back').remove();
		var html = '<div class="imageeffectckmodal-header">'
					+'<h3>' + Joomla.JText._('PLG_IMAGEEFFECTCKBUTTON_EDITION') + '</h3>'
				+'</div>'
				+'<div class="imageeffectckmodal-body">'
					// + '<link rel="stylesheet" href="' + window.URIROOT + '/plugins/system/imageeffectck/assets/imageeffectck.css" type="text/css" />'
					+ this.getPopupHtml()
				+'</div>'
				+'<div class="imageeffectckmodal-footer">'
					+'<a class="imageeffectckmodal-button" href="javascript:void(0);" onclick="CKApi.Imageeffect.hideInterface()">×</a>'
					+'<a class="imageeffectckmodal-button" href="javascript:void(0);" onclick="' + returnFunc + ';CKApi.Imageeffect.hideInterface()"><i class="icon icon-checkmark"></i>' + Joomla.JText._('CK_SAVE_CLOSE') + '</a>'
				+'</div>';
		$ck(document.body).append('<div id="imageeffectckmodal" class="imageeffectckmodal" />');
		$ck(document.body).append('<div id="imageeffectckmodal-back" class="imageeffectckmodal-back" onclick="CKApi.Imageeffect.hideInterface()"/>');
		var modal = $ck('#imageeffectckmodal');
		modal.append(html);
		modal.css('top', ($ck(window).scrollTop() + $ck(window).height()/2) + 'px');
		modal.show();

		if (typeof onImageeffectckmodalLoaded == 'function') onImageeffectckmodalLoaded();
		updateImageeffectckButtonDemo();
	},
	hideInterface: function() {
		$ck('#imageeffectckmodal').remove();
		$ck('#imageeffectckmodal-back').remove();
	},
	getPopupHtml: function() {
		var html = '<div class="imageeffectckbuttondemo" style="float:left;width:40%;box-sizing:border-box;">'
					+ '<figure class="imageeffectck effectck-lily" style="width:270px">'
					+ '<div class="imageeffectck_img">'
						+ '<img src="' + window.URIROOT + '/plugins/editors-xtd/imageeffectckbutton/assets/images/demo.jpg" >'
						+ '<figcaption>'
							+ '<div>'
								+ '<div class="imageeffectck_title">John Doe</div>'
								+ '<div class="imageeffectck_desc">John likes to play with crayons and pencils</div>'
							+ '</div>'
						+ '</figcaption>'
					+ '</div>'
					+ '</figure>'
				+ '</div>';

			html += '<div class="imageeffectckbuttondemo" style="float:left;width:50%;box-sizing:border-box;">'
					+ '<div class="imageeffectckbuttontitle">' + Joomla.JText._('PLG_IMAGEEFFECTCKBUTTON_SELECT_EFFECT') + '</div>'
					+ '<select id="imageeffectckbuttoneffectslist" name="imageeffectckbuttoneffectslist" onchange="updateImageeffectckButtonDemo()">';
						var effectslist = this.getEffectsList();
						if (effectslist.length) {
							for (i=0;i<effectslist.length;i++) {
								html += '<option value="'+effectslist[i]+'">' + effectslist[i].replace('effectck-', '') + '</option>';
							}
						} else {
							for (var name in effectslist) {
								html += '<option value="'+effectslist[name]+'">' + name + '</option>';
							}
						}
			html += '</select>';
			html += ' <label>' + Joomla.JText._('PLG_IMAGEEFFECTCKBUTTON_ROLLOVER_EFFECT') + '</label>';
			html += ' <input type="checkbox" id="imageeffectckbuttonrollover" name="imageeffectckbuttonrollover" onchange="updateImageeffectckButtonDemo()" />';

			html += '<div class="imageeffectckbuttontitle">' + Joomla.JText._('PLG_IMAGEEFFECTCKBUTTON_IMAGE_TITLE') + '</div>';
			html += '<input type="text" id="imageeffectckbuttonimgtitle" name="imageeffectckbuttonimgtitle" onchange="updateImageeffectckButtonDemo()" />';
			html += '<div class="imageeffectckbuttontitle">' + Joomla.JText._('PLG_IMAGEEFFECTCKBUTTON_IMAGE_DESCRIPTION') + '</div>';
			html += '<input type="text" id="imageeffectckbuttonimgdesc" name="imageeffectckbuttonimgdesc" onchange="updateImageeffectckButtonDemo()" />';
			html += '<div class="imageeffectckbuttontitle">' + Joomla.JText._('PLG_IMAGEEFFECTCKBUTTON_IMAGE_CSS_CLASS') + '</div>';
			html += '<input type="text" id="imageeffectckbuttonimgclass" name="imageeffectckbuttonimgclass" />';

			html += '</div>';

			html += '<div style="clear:both;">'
				+ '</div>';

		return html;
	},
	getImageeffectClass: function(imgclass) {
			var result = imgclass.match(/effectck-.*?[^\s|^\"]*/);
			return result == null ? '' : result[0];
	},
	updateImageeffectckButtonDemo: function() {
		$ck('#imageeffectckmodal figure').attr('class', '').addClass('imageeffectck ' + $ck('#imageeffectckbuttoneffectslist').val());
		$ck('#imageeffectckmodal .imageeffectck_title').text($ck('#imageeffectckbuttonimgtitle').val());
		$ck('#imageeffectckmodal .imageeffectck_desc').text($ck('#imageeffectckbuttonimgdesc').val());
		if ($ck('#imageeffectckbuttonrollover:checked').length) $ck('#imageeffectckmodal figure').addClass('effectck-rollover');
	},
	validateImageeffectckButton: function(editor) {
		var title = $ck('#imageeffectckbuttonimgdesc').val() ? $ck('#imageeffectckbuttonimgtitle').val() + '::' + $ck('#imageeffectckbuttonimgdesc').val() : $ck('#imageeffectckbuttonimgtitle').val();
		var ed = tinyMCE.get(editor);
		var dom = ed.dom;
		var imgCustomClasses = $ck('#imageeffectckbuttonimgclass').val() != '' ? ' ' + $ck('#imageeffectckbuttonimgclass').val() : '';
		var rolloverClass = $ck('#imageeffectckbuttonrollover:checked').length ? ' effectck-rollover' : '';
		var elAttrs = {
				"class": $ck('#imageeffectckbuttoneffectslist').val() + imgCustomClasses + rolloverClass,
				title: title,
			};
		selectionNode = ed.selection.getNode();
//		anchorElm = dom.getParent(selectionNode, 'a');
		dom.setAttribs(selectionNode, elAttrs);
	},
	setFieldsValue: function(imgsrc, imgtitletmp, imgclass) {
		if (imgsrc) {
			$ck('#imageeffectckmodal figure img').attr('src', imgsrc);
			if (imgtitletmp) {
				imgtitletmp = imgtitletmp.split('::');
				var imgtitle = imgtitletmp[0] ? imgtitletmp[0] : '';
				var imgdesc = imgtitletmp[1] ? imgtitletmp[1] : '';
				if (imgtitle) {
					$ck('#imageeffectckmodal .imageeffectck_title').text(imgtitle);
					$ck('#imageeffectckbuttonimgtitle').val(imgtitle);
				}
				if (imgdesc) {
					$ck('#imageeffectckmodal .imageeffectck_desc').text(imgdesc);
					$ck('#imageeffectckbuttonimgdesc').val(imgdesc);
				}
				if (imgclass) {
					var imgeffect = CKApi.Imageeffect.getImageeffectClass(imgclass);
					// loop through the classes and remove the image effect one
					imgclasses = imgclass.split(' ');
					for (c=0;c<imgclasses.length;c++) {
						imgclasses[c] = imgclasses[c].trim();
						if (imgclasses[c] == imgeffect) imgclasses.splice(c, 1);
						if (imgclasses[c] == 'effectck-rollover') {
							imgclasses.splice(c, 1);
							$ck('#imageeffectckbuttonrollover').prop('checked', 'checked');
						}
					}
					imgclass = imgclasses.join(' ');

					if (imgeffect) {
						$ck('#imageeffectckbuttoneffectslist').val(imgeffect);
						$ck('#imageeffectckmodal figure').attr('class', '').addClass('imageeffectck ' + imgeffect);
					}
					$ck('#imageeffectckbuttonimgclass').val(imgclass);
				}
			}
		}
	}
}


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

function showImageeffectckButton(editor, uriroot, imageeffectslist)
{
//	if (! imageeffectslist) {
//		imageeffectslist = ckImageEffectsList || {};
//	}

	window.URIROOT = uriroot;
//	event.preventDefault();
	if (typeof(tinyMCE) == 'undefined') return;

//	var ed = tinyMCE.get(editor);
	var ed = tinyMCE.activeEditor;
	var dom = ed.dom;
	selectionNode = ed.selection.getNode();
	focusedNode = ed.selection.getSel().anchorNode;

	if ( selectionNode.tagName.toLowerCase() != 'img' 
		&& (focusedNode.tagName && focusedNode.tagName.toLowerCase() != 'a') 
		|| !focusedNode.tagName 
		) {
		alert(Joomla.JText._('PLG_IMAGEEFFECTCKBUTTONBUTTON_CHOOSE_IMAGE'));
		return;
	}

//	CKApi.Imageeffect.setEffectsList(imageeffectslist);
	// showImageeffectckPopup(editor);
	CKApi.Imageeffect.showInterface('validateImageeffectckButton(\''+editor+'\')');

	// update the attribute of the demo image
	var imgsrc, imgtitle, imgdesc, imgclass;
	if (selectionNode.tagName.toLowerCase() == 'img') {
		imgsrc = selectionNode.src;
		imgtitletmp = selectionNode.title;
		imgclass = selectionNode.className;
	} else if ($ck(focusedNode).find('img').length) {
		imgsrc = $ck(focusedNode).find('img').attr('src');
		imgtitletmp = $ck(focusedNode).find('img').attr('title');
		imgclass = $ck(focusedNode).find('img').attr('class');
	}
	if (imgsrc) {
		$ck('#imageeffectckmodal figure img').attr('src', imgsrc);
		if (imgtitletmp) {
			imgtitletmp = imgtitletmp.split('::');
			var imgtitle = imgtitletmp[0] ? imgtitletmp[0] : '';
			var imgdesc = imgtitletmp[1] ? imgtitletmp[1] : '';
			if (imgtitle) {
				$ck('#imageeffectckmodal .imageeffectck_title').text(imgtitle);
				$ck('#imageeffectckbuttonimgtitle').val(imgtitle);
			}
			if (imgdesc) {
				$ck('#imageeffectckmodal .imageeffectck_desc').text(imgdesc);
				$ck('#imageeffectckbuttonimgdesc').val(imgdesc);
			}
		}
		if (imgclass) {
			var imgeffect = CKApi.Imageeffect.getImageeffectClass(imgclass);
			// loop through the classes and remove the image effect one
			imgclasses = imgclass.split(' ');
			for (c=0;c<imgclasses.length;c++) {
				imgclasses[c] = imgclasses[c].trim();
				if (imgclasses[c] == imgeffect) imgclasses.splice(c, 1);
			}
			for (c=0;c<imgclasses.length;c++) {
				imgclasses[c] = imgclasses[c].trim();console.log(imgclasses[c])
				if (imgclasses[c] == 'effectck-rollover') {
					imgclasses.splice(c, 1);
					$ck('#imageeffectckbuttonrollover').prop('checked', 'checked');
				}
			}
			imgclass = imgclasses.join(' ');console.log(imgclasses)

			if (imgeffect) {
				$ck('#imageeffectckbuttoneffectslist').val(imgeffect);
				$ck('#imageeffectckmodal figure').attr('class', '').addClass('imageeffectck ' + imgeffect);
			}
			$ck('#imageeffectckbuttonimgclass').val(imgclass);
		}
	}
}

function updateImageeffectckButtonDemo() {
	CKApi.Imageeffect.updateImageeffectckButtonDemo();
}

function validateImageeffectckButton(editor) {
	CKApi.Imageeffect.validateImageeffectckButton(editor);
}
/*
function showImageeffectckPopup(editor) {
	if (! $ck('#imageeffectckmodal').length) {
		var popup = document.createElement('div');
		popup.id = 'imageeffectckmodal';
		popup.className = 'imageeffectckmodal modal hide fade';
		document.body.appendChild(popup);
		popup.innerHTML = '<div class="modal-header">'
				+'<button type="button" class="close" data-dismiss="modal">×</button>'
				+'<h3>' + Joomla.JText._('PLG_IMAGEEFFECTCKBUTTON_EDITION') + '</h3>'
			+'</div>'
			+'<div class="modal-body">'
				+ '<link rel="stylesheet" href="' + window.uriroot + '/plugins/system/imageeffectck/assets/imageeffectck.css" type="text/css" />'
				+ getPopupHtml()
			+'</div>'
			+'<div class="modal-footer">'
				+'<button class="btn" data-dismiss="modal" aria-hidden="true"><i class="icon icon-cancel"></i>' + Joomla.JText._('JCANCEL') + '</button>'
				+'<button class="btn btn-success" data-dismiss="modal" aria-hidden="true" onclick="validateImageeffectckButton(\''+editor+'\')"><i class="icon icon-checkmark"></i>' + Joomla.JText._('CK_SAVE_CLOSE') + '</button>'
			+'</div>';

		var BSmodal = jQuery('#imageeffectckmodal');
		BSmodal.css('z-index', '44444');
	} else {
		var BSmodal = jQuery('#imageeffectckmodal');
	}

	BSmodal.find('.fullscreenck').removeClass('active');
	BSmodal.modal().removeClass('pagebuilderckModalFullscreen');
	BSmodal.modal('show');
}*/

