/**
 * @copyright	Copyright (C) 2017 Cédric KEIFLIN alias ced1870
 * http://www.joomlack.fr
 * http://www.template-creator.com
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

function showTooltipPopup(editor_name) {
	var footerhtml = '<a class="ckboxmodal-button" href="javascript:void(0);" onclick="ckInsertTooltip(\'' + editor_name + '\')">Insert</a>';
	if (jQuery('#tooltipgcbutton').length) {
		CKBox.open({handler: 'inline',content: 'tooltipgcbutton', size: {x: '450px', y: '550px'}, footerHtml: footerhtml});
		return;
	}

	var myurl = 'index.php?option=com_ajax&format=raw&plugin=Tooltipgc&group=system';
	jQuery.ajax({
		type: "POST",
		url: myurl,
		data: {
			method: 'createDialogHtml',
			paramsclass: 'dialog'
		}
	}).done(function(response) {
		response = response.trim();
		jQuery('body').append('<div id="tooltipgcbutton" style="display:none;" />');
		jQuery('#tooltipgcbutton').html(response);
		CKBox.open({handler: 'inline',content: 'tooltipgcbutton', size: {x: '450px', y: '550px'}, footerHtml: footerhtml});
	}).fail(function() {
		alert(Joomla.JText._('CK_FAILED', 'Failed'));
	});
}

function ckInsertTooltip(editor_name) {
	var ed = tinyMCE.activeEditor;
	var ckform = jQuery("#tooltipck_button_form");
	tooltipck_text = jQuery("#tooltipck_text").val();
	tooltipck_tip = jQuery("#tooltipck_tip").val();
	var tooltipck_params = Array();
	jQuery('.tooltipck_param', ckform).each(function(i, param) {
		if (jQuery(param).val())
			tooltipck_params.push(jQuery(param).attr('data-param')+'='+jQuery(param).val());
	});
	if (tooltipck_params.length) {
		tooltipck_midtag = '{end-texte|' + tooltipck_params.join('|') + '}';
	} else {
		tooltipck_midtag = '{end-texte}';
	}
	if (tooltipck_text != null && tooltipck_text != '' && tooltipck_tip != null && tooltipck_tip != ''){
		// ed.execCommand('mceInsertContent', false, '{tooltip}'+tooltipck_text+tooltipck_midtag+tooltipck_tip+'{end-tooltip}');
		try {
			jInsertEditorText('{tooltip}'+tooltipck_text+tooltipck_midtag+tooltipck_tip+'{end-tooltip}', ed.id);
		} catch (error) {
			Joomla.editors.instances[editor_name].replaceSelection('{tooltip}'+tooltipck_text+tooltipck_midtag+tooltipck_tip+'{end-tooltip}');
		}
	}
	CKBox.close();

	
}
