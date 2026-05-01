var ns4=false;
var ie4=false;
var ns6=false;
var mac=false;
var linux=false;
var macie4=false;

function browser(){
	agt=navigator.userAgent.toLowerCase();
	var is_major = parseInt(navigator.appVersion);

var is_nav  = ((agt.indexOf('mozilla')!=-1) && (agt.indexOf('spoofer')==-1)
                && (agt.indexOf('compatible') == -1) && (agt.indexOf('opera')==-1)
                && (agt.indexOf('webtv')==-1) && (agt.indexOf('hotjava')==-1));

    ns4 = (is_nav && (is_major == 4));
    ns6 = (is_nav && (is_major >= 5));

    var is_ie     = ((agt.indexOf("msie") != -1) && (agt.indexOf("opera") == -1));
    ie4  = (is_ie && (is_major >= 4));

	mac   = (agt.indexOf("mac")!=-1);
	linux = (agt.indexOf("inux")!=-1);
	if(mac && ie4)macie4=true;



	if(ns4){}
	else if(ns6){}
	else if(ie4){}
	else top.window.location="NNsorry.html";

//alert("in browsersjs : ie4= "+ie4+" ns4= "+ns4+" ns6= "+ns6+" macie4= "+macie4);
    }

