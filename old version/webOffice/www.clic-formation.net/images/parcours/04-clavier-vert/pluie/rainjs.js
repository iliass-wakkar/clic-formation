var sX;
var sY;
stri="fjbugpldh2ea8kghrixdks4lwzfopq4rsg6ftcvmap1j5dynacwjs7fobxvkt2psgcly9ukhcqhz3dmxvzr9itezopeqrs6ftcvmya1j5dynantwjs7fgobxkta2pgcl";
str=stri;
var pos=0;
var count=0;
var rdme=0;
var sup=1200;
var strx=15;            //start looping after third word
var strlength=str.length;       
var interid=null;
var setstop=null;
var animid=null;
var loadid=null;
var step=1;
var start;          //starts  time at beginning of typing
var end;	//ending time of typing
var bop=2;
var bottomturn=265;
var strtyped="";
var bs=0;	//beginning span tags
var es=16;		//end of span tags
var flag2=0;
var flag1=1;
var spa=90;		//span tag number of: to begin 
var isvisible=0;
var runanim="false";
var runinterid="false";
var runsetstop="false";
var speedup = 0;
var doscore=false;

pd1=new Array();
pdw=new Array();
kt=new Array();
jfp=new Array();
im36=new Image();

function init(){
	
	jtemp=new Array();
	browser();

	if(ns4){
	pd01=document.d0.document.d01;
	pd0=document.d0;
	}
	else if (ie4){
	pd01=d01;
	pd0=d0;
	}
	else if(ns6){
	pd01=document.getElementById("d01");	
	pd0=document.getElementById("d0");
	}
	else window.location="index.html";
	for(i=1;i<8;i++){
		k="d"+i;
		if(ns4)jtemp[i]="document.d0.document.d"+i;
		else if(ie4)jtemp[i]=k;
		else jtemp[i]=document.getElementById(k);
	pd1[i]=eval(jtemp[i]);
	}

	for(i=0;i<19;i++){
		k="d1"+i;
		if(ns4)jtemp[i]="document.d0.document.d1.document.d1"+i;
		else if(ie4)jtemp[i]=k;
		else jtemp[i]=document.getElementById(k);
	pdw[i]=eval(jtemp[i]);
	}
	scalewhite();
	whiteleft();
	if(ie4 || ns6)centerit();
//	high_score(2);
	anim();
	if(linux){
	document.onkeydown = getkey;  
	}
	j=i=8;
		while(i){
		i--;
		jff=i;
		jfp[j-i-1]=jff;
	}
	autocomplete="off";
	}



function preload(){
	imgreen=new Image();
	imgreen.src="im/rain/grfing.gif";
	im36=new Image();
	im36.src="im/rain/finger36.gif";
	
	loadid=setInterval("testload()",500);
	}

function testload(){
	i=0;
	if(im36.height)i=im36.height;
	else if(document.images.length)i=document.images.length;
	if(i==18){
	clearInterval(loadid);
	init();
	}
	}
	
function centerit(){
	j=document.body.offsetWidth;
	if(j > 700){
	wil=(j<760)? 0 : ((j-700)/2.-60)
	pd0.style.left=wil;
	}

	}



function getWidth(pwhat){
		if(ie4 || ns6)w=pwhat.offsetWidth;
		else if (ns4)w=pwhat.document.width;
		return w;
		}

function scalewhite(){
		sY=screen.height;
		if(linux && ns4)sY=window.innerHeight;
		if(sY>700){
		diff=(sY-600)/2.;
		diff=Math.round(diff);
		bottomturn=255+diff;
		bottomturn=Math.round(bottomturn);
		if(ns4){
		pd1[1].clip.bottom=255+diff;
		pd1[4].top=263+diff;
		pd1[5].top=310+diff;
		}
		if(ie4 || ns6){
		i=255+diff+"px";
		
		pd1[1].style.height=i;
		j="rect(0px 330px "+i+" 0px)";
		pd1[1].style.clip=j;
			pd1[4].style.top=263+diff;
		pd1[5].style.top=310+diff;
		}
		}
		}
		
function whiteleft(){
	w=getWidth(pd01)+40;
	for(i=1;i<8;i++){
		j=(i<6) ? w : w+350;
		if(ns4)pd1[i].left=j;
		else pd1[i].style.left=j;
	}


	centerform();
	showit(pd0);
	}

function centerform(){
	wpink=getWidth(pd01);
	w0=getWidth(pd1[1]);
	w1=getWidth(pd1[5]);
	i=wpink+40+(w0-w1)/2.;
	if(ie4 || ns6)pd1[5].style.left=i-18;
	else if (ns4)pd1[5].left=i-18;
	}


function writeit(pwhat,whattext){

		if(ns4){
			pwhat.document.open();
			pwhat.document.write(whattext);
			pwhat.document.close();
			}
		else
			pwhat.innerHTML=whattext;
		}

function showit(pwhat){
	if(ns4)pwhat.visibility="show";
	if(ie4 || ns6)pwhat.style.visibility="visible";
	}

function hideit(pwhat){
	if(ns4)pwhat.visibility="hide";
	if(ie4 || ns6)pwhat.style.visibility="hidden";
	}

function moveVerTo(pwhat,d){
	if(ns4)pwhat.top=d;
	else pwhat.style.top=d;
	}

function speed(spd,im){
	stopit();
	showimg(im);
	startit(spd);
	}

function showimg(whatim){
		for(i=0;i<5;i++){
		if(ns4)pd01.document.images[i].src=imgreen.src;
		else document.images[i].src=imgreen.src;				}
		if(ns4)pd01.document.images[whatim].src=im36.src;
		else document.images[whatim].src=im36.src;				}

function flipimg(){
	i=imgreen.src
	if(flag2%2==0)i=im36.src;
	
		if(ns4)document.d0.document.d5.document.images[0].src=i;
		else document.images[17].src=i;
	}

function stopall(){
		if(runinterid=="true"){
		runinterid="false";
		clearInterval(interid);
		}
		if(runanim=="true"){
		runanim="false";
		clearInterval(animid);
		}
		if(runsetstop=="true"){
		runsetstop="false";
		clearTimeout(setstop);
		}
		}

function stopit(){
		if(runinterid=="true"){
		runinterid="false";
		clearInterval(interid);
		}
		if(runanim=="true"){
		runanim="false";
		clearInterval(animid);
		hideanim();
		document.forms[bop].elements[jfp[6]].value=speedup;
		}
	finish();
	}

function formreset(){
	if(ns4){
	document.d0.document.d5.document.forms[0].elements[0].value="";
	document.d0.document.d5.document.forms[0].elements[0].focus();
	}
	else {
	document.forms[1].elements[0].value="";
	document.forms[1].elements[0].focus();
	}
	}

function number(){
    var n;
    s2=new Array();
    s3=new Array();
    n=Math.random();
    n=n*100;
    n=Math.round(n);
    s2=str.slice(n);
    s3=str.slice(0,n);
    str=s2.concat(s3);
    }   

function startit(sp){  

  if(runinterid=="true")
    {
	stopit();
	finish();
    }
	number();
var i1=0;
for(i=0;i<es;i++){
	moveVerTo(pdw[i],i1);
	if(ie4)j=str.charAt(i);
	else j="<font size=+2>"+str[i]+"<\/font>";
	writeit(pdw[i],j);
	i1=i1-17;
	}

    for( i=0;i<16;i++)
    {
    if(ie4)kt[i]= str.charAt(i);
	else kt[i]=str[i];
	}
    
	formreset();
	/*
	if(!(GetCookie("usrid")))
	{
	alert("This is a short demo.");
	runsetstop="true";
	setstop=setTimeout("gohome()",30000);
	}
	*/
	scrollit(sp);
	}

function scrollit(sp){
	step=(sp==2) ? step+1 : 1;
	speedup = 0;
	doscore=true;
	sup=1200;
    var s=new Date();
    start=s.getTime();
    strlength=str.length;       
	isvisible=0;
	runinterid="true";
	document.forms[bop].elements[jfp[7]].value=start;	
    interid=setInterval("moveit()",sp);
    }




function moveit(){
    var vis_layer;
    speedup++;

	if(speedup == sup){
	sup+=1200;
	step++;
	}

    for( i=0;i<es;i++)
    {  

	itop=(ns4)? pdw[i].top : parseInt(pdw[i].style.top,10);
	itop+=step;
	if(ns4)pdw[i].top=itop;
	else pdw[i].style.top=itop;
	if(itop<-10)hideit(pdw[i]);
	else if (itop > -11 && itop < -4 )showit(pdw[i]);

	 if( itop>bottomturn)   //265
    {
    if(strx>=(strlength-1))strx= 0;
    strx++;
	i2=i-bs;
	kt[i2]=(ie4)? str.charAt(strx): str[strx];
	jj=(ns4)? "<font size=+2>"+kt[i2]+"<\/font>" : kt[i2];
	writeit(pdw[i],jj);
	if(ns4)pdw[i].top=pos;
	else pdw[i].style.top=pos;
	showit(pdw[i]);
	isvisible++;

    }


}

  
    if(isvisible >11)
    { 
	stopit();
	finish();

    }


        }
   
function getkey(ev){
	if(ie4)keyChar = String.fromCharCode(ev.keyCode);
	else keyChar = String.fromCharCode(ev.which);
 for(var i=0;i<es;i++){
    if(keyChar==kt[i]){
	count+=1;
	isvisible--;
	hideit(pdw[i]);
	var jump=bottomturn-5;
	moveVerTo(pdw[i],jump);
    }
    }

	}

function finish(){
	if(!doscore)return;
    var e=new Date();
    
//	form1.word.value="";
	c=count;
//  	stopit();
    end=e.getTime();            
	diff=(end-start)/(60*1000);
	doscore=false;
	strx=15;
		for(var i=0;i<es;i++){
		hideit(pdw[i]);
		}
	formreset();
	//if(diff<1){
	//	if(ns4)j="<P><font size=+1>your score:<br> N\/A <\/font><\/P>";
	//	else
		s=end;
	//	j="<P>your score:<br> N\/A <\/P>";
	//	writeit(pd1[7],j);
	//	return; 
	//	}
	//else{
	
	if(diff<1)diff=1;
	wpm=count/(diff*5);
	document.forms[bop].elements[jfp[3]].value=c;
	score=count/Math.sqrt(diff);
	score=Math.round(score);
	v=score;
	document.forms[2].elements[jfp[2]].value=v;
	k=Math.round(wpm);
	if(ns4)j="<P><font size=+1>your score:<br> "+score+"<\/font><\/P>";
	else
	j="<P>Votre score:<br> "+score+"<\/P>";
	//}
	document.forms[2].elements[jfp[4]].value=s;
	writeit(pd1[7],j);

count=0;
	end=0;

/* 
if(!(GetCookie("usrid")))
    {
	return;
    }
	else
	{
	if(!(GetCookie("lessons")))return;
	else
	lessons=GetCookie ("lessons");
    high_score(score);
    count=0;
	end=0;
	}
*/  
	document.forms[bop].elements[jfp[1]].value=k;
  }

function high_score(w){
 if(!(GetCookie("usrid")))return;
    var score=w;
    var top_score;
    var rain;
   if(!(GetCookie("lessons")))return;
else
	lessons=GetCookie("lessons");
    rain=lessons.substr(36,42);
    rain=parseInt(rain,10);
    if(rain<score)
    {
    a1="000000";
    rain=score;
    j=score.toString();
    i=j.length;
    n=6-i;
    a1=a1.slice(0,n);
    score=a1.concat(j);
    var beg=lessons.substr(0,36);
    lessons=beg.concat(score);
    SetCookie("lessons",lessons,null,"/");   
    
    }

    top_score=rain;

	if(ns4)iii="<P><font size=+1>top score:<br> "+top_score+"<\/font><\/P>";
	else
	iii="<P>top score:<br> "+top_score+"<\/P>";

	writeit(pd1[6],iii);


    }

//******* begining of func for initial anim******

function anim(){
	if(runinterid=="true")return;
	if(runanim=="true")return;
	flag2=0;
	flag3=1;
	runanim="true";
	animid=setInterval("doit()",200);
}

function doit(){
	flag2++;
		if(flag2==1){
			doposit(" to begin ...");
		return;
		}

		if(flag2<8){
			tobegin();
			return;
		}

	if(flag2<17){return;}
	else if(flag2==17){		

			//titles
		doposit("select Level");
		return;
		}

	else if(flag2<24){
		tobegin();
		return;
		}

	else if(flag2<26){showimg(0);return;}
	else if(flag2<28){showimg(1);return;}
	else if(flag2<30){showimg(2);return;}
	else if(flag2<32){showimg(3);return;}
	else if(flag2<34){showimg(4);return;}
	else if(flag2==34){
		if(ns4)pd01.document.images[4].src=imgreen.src;
		else document.images[4].src=imgreen.src;
		doposit("start typing");
		return;
	}
	else if(flag2<41){
		tobegin();
		return;
		}

	else if(flag2<56)	{flipimg();return;}

	else {
	doposit("");
	hideit(pdw[16]);
	hideit(pdw[17]);
	hideit(pdw[18]);
clearInterval(animid);
runanim="false";
return;
}
}

function tobegin(){
	i=getVisibility(pdw[18]);
	if(i)hideit(pdw[18]);
	else 	showit(pdw[18]);
		}

function getVisibility(pwhat){
		var i=0;
		if(ns4){
			if(pwhat.visibility=="show")i=1;
			}
		else {
			if(pwhat.style.visibility=="visible")i=1;
		}
		return i;
		}

	

function doposit(trs){
	j=new Array();
	j[16]=j[17]=j[18]=trs;
	if(ns4){
	j[16]="<b><font size='+2' color='lightblue'>"+trs+"<\/font><\/b>";
	j[17]="<b><font size='+2' color='red' weight='900'>"+trs+"<\/font><\/b>";
	j[18]="<b><font size='+2' color='yellow'>"+trs+"<\/font><\/b>";
	}




	for(i=16;i<19;i++){
		writeit(pdw[i],j[i])
		}
	showit(pdw[16]);
	showit(pdw[17]);
	hideit(pdw[18]);
	return;
	}
function hideanim(){

		for(i=0;i<5;i++){
		if(ns4)pd01.document.images[i].src=imgreen.src;
		else document.images[i].src=imgreen.src;		
		}

	for(i=16;i<19;i++){
	hideit(pdw[i]);
	}	
		if(ns4)document.d0.document.d5.document.images[0].src=imgreen.src;
		else document.images[17].src=imgreen.src;
	}

//***** end of func for initial animation*****

function gohome(){
	stopall();
	window.location="http://www.powertyping.com/index.html";
	}

function openReadme(){
	if(rdme==1){
	if(!readme.closed)
	{
	readme.focus();
	}
	else{
	readme=window.open('cbrainhowto.html','rwindow',',scrollbars=yes,resizable=yes,width=350,height=300');
	rdme=1;
	}
	}
	else
	{
	readme=window.open('cbrainhowto.html','rwindow',',scrollbars=yes,resizable=yes,width=350,height=300');
	rdme=1;
	}
	}
popwindow=0;
function MM_openBrWindow(theURL,winName,features) { 
	if(popwindow){mypop.focus();return;}
  mypop=window.open(theURL,winName,features);
popwindow=1;
}

function submitsc(){
//original <100
if(document.forms[2].elements[1].value<0){alert("score is not high enough");
}else {
	document.forms[2].submit();
	}
	mypop.close();
}
