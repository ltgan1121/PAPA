
var hasSubmit = false;

var ss_forget_password_jsp = "/um-selfservice/ss/forget_password.jsp";

var ss_forget_uid_jsp = "/um-selfservice/ss/forget_userid.jsp";

var ss_change_password_jsp = "/um-selfservice/ss/change_password.jsp";

var ss_login_jsp = "/um-selfservice/ss/index.jsp";


var ssl_nonesso = "ssl_nonesso";

var ssl_sso = "ssl_sso";

var nonessl_nonesso = "nonessl_nonesso";

var nonessl_sso = "nonessl_sso";

var script_umlogin = document.getElementById("script_umlogin");


var title = "";

var src = "";

var ssUrl = "";


function initParam() {
	if (null != script_umlogin.attributes["title"]) {
		title = script_umlogin.attributes["title"].nodeValue;
	}
	
	if (null != script_umlogin.attributes["src"]) {
		src = script_umlogin.attributes["src"].nodeValue;
	}
	
	if (null != script_umlogin.attributes["umbaseurl"]) {
		ssUrl = script_umlogin.attributes["umbaseurl"].nodeValue;
	}
}


initParam();


function openWin(url, w, h) {
	window.open(url, 'ss', 'width=' + w + ',height=' + h + ',scrollbars=yes,resizable=no,status=no,toolbar=no,menubar=no,location=no').focus();
}


function onPasswordEnter(e) {	
	if (e.keyCode == 13) {
		loginformSubmit();
	}
}


function loginformSubmit() {
	var login_form = document.getElementById("login_form");
	if (!hasSubmit) {
		if (validUserAccount(login_form.j_username, login_form.j_password)) {
			login_form.submit();
			hasSubmit = true;
			
			document.getElementById("Submit").setAttribute("disabled", "disabled");
		}
	}
}


function trim(str) {
	if (str == null) {
		return ("");
	}

	var re = new RegExp("^ +");
	str = str.replace(re, "");

	re = new RegExp(" +$");
	str = str.replace(re, "");

	return str;
}

function urlDecode(url){
	var ret= "";
	for (var i = 0; i< url.length; i++) {
		var chr = url.charAt(i);
		if (chr == "+") {
			ret += " ";
		} else if (chr == "%") {
			var asc = url.substring(i+1,i+3);
			if (parseInt("0x" + asc) > 0x7f) {
				ret += asc2str(parseInt("0x" + asc + url.substring(i + 4, i + 6)));
				i += 5;
			} else {
				ret += asc2str(parseInt("0x" + asc));
				i += 2;
			}
		} else {
			ret += chr;
	    }
	}
	
	return ret;
}

function validUserAccount(txt_user, txt_pwd) {
	var num = new Array(0, 0);
	var v_check = new Object();
	var pwdValue = trim(txt_pwd.value);
	var userValue = trim(txt_user.value);
	var upperUserValue = userValue.toUpperCase();
	var login_form = document.getElementById("login_form");

	v_check.UserPat = /^((g|G)_\S|[0-9]{10,12}$|[A-Za-z]{1,12}-[0-9A-Za-z]{1,20}$|[a-zA-Z]{1,24}[0-9]{0,3}$|(c|C)(s|S)[0-9]{8}$)/;

	if (pwdValue == "" || userValue == "") {
		alert("\u7528\u6237\u540d\u548c\u5bc6\u7801\u5fc5\u987b\u586b\u5199\u0021");
		return false;
	}

	login_form.j_username.value = upperUserValue;

	if (pwdValue == "88888888") {
		alert("\u4e0d\u80fd\u4f7f\u7528\u7f3a\u7701\u5bc6\u7801\u767b\u5f55\u002c\u8bf7\u8d70\u5fd8\u8bb0\u5bc6\u7801\u6d41\u7a0b\u0021");
		return false;
	}

	if (!v_check.UserPat.exec(txt_user.value)) {
		alert("\u975e\u6cd5\u7684\u5e10\u53f7");
		txt_user.focus();
		return false;
	}

	if (txt_pwd.value.length < 8) {
		openNewWin();
		return false;
	}

	for (i = 0; i < txt_pwd.value.length; i++) {
		c = txt_pwd.value.charAt(i);
		if (isNaN(c) == false) {
			num[0]++;
		} else {
			num[1]++;
		}
	}

	if (num[0] < 3) {
		openNewWin();
		return false;
	}

	if (num[1] < 5) {
		openNewWin();
		return false;
	}

	return true;
}

function openNewWin() {
	alert("\u7528\u6237\u5bc6\u7801\u4e0d\u7b26\u5408\u5b89\u5168\u7b56\u7565\uff0c\u8bf7\u9a6c\u4e0a\u4fee\u6539\u5bc6\u7801\u0021");

	var welcomeTitle = title;
	var login_form = document.getElementById("login_form");

	login_form.j_password.value = "";
	login_form.j_password.focus();
	openWin(ssUrl + ss_change_password_jsp, "444", "470");
}

function checkLoginType() {
	var loginType = null;
	var ssoconf = false;
	var ssoswitch = null;
	var sslconf = false;
	var sslswitch = null;
	
	if (script_umlogin.attributes["sso"] != null) {
		ssoconf = script_umlogin.attributes["sso"].nodeValue;

		if (ssoconf.toUpperCase() == "ON") {
			ssoswitch = true;
		} else {
			ssoswitch = false;
		}
	} else {
		ssoswitch = false;
	}
	
	if (script_umlogin.attributes["ssl"] != null) {
		sslconf = script_umlogin.attributes["ssl"].nodeValue;
		if (sslconf.toUpperCase() == "ON") {
			sslswitch = true;
		} else {
			sslswitch = false;
		}
	} else {
		sslswitch = false;
	}

	if (sslswitch == true && ssoswitch == true) {
		loginType = ssl_sso;
	} else if (sslswitch == true && ssoswitch == false) {
		loginType = ssl_nonesso;
	} else if (sslswitch == false && ssoswitch == true) {
		loginType = nonessl_sso;
	} else {
		loginType = nonessl_nonesso;
	}
	return loginType;
}

function getSSLURL(actionName) {
	var url;
	var ssl_url;
	var n;
	var r_n;
	var ssl_port;
	if (script_umlogin.attributes["portno"] != null) {
		ssl_port = script_umlogin.attributes["portno"].nodeValue;
	}

	url = window.location.href;

	if (url.indexOf("https://") != 0) {
		if (!ssl_port) {
			if (script_umlogin.attributes[3].nodeName == "portno") {
				ssl_port = script_umlogin.attributes[3].nodeValue;
			}

			if (!ssl_port) {
				ssl_port = 443;
			}
		}

		r_n = url.indexOf("/");

		var pi;
		for ( var i = 0; i < 4; i++) {
			n = url.indexOf("/");
			if (n != -1) {
				r_n = r_n + n;
				if (i == 2) {
					pi = r_n;
				}

				url = url.substring(n + 1);
			} else if (i == 3) {
				r_n = r_n - 1;
			}
		}
		
		ssl_url = window.location.href.substring(0, r_n - 1) + actionName;
		if (location.port == "") {
			ssl_url = ssl_url.substring(0, pi - 3) + ":" + ssl_port + ssl_url.substring(pi - 3);
		} else {
			ssl_url = ssl_url.replace(location.port, ssl_port);
		}

		ssl_url = ssl_url.replace("http://", "https://");

	} else {
		ssl_url = actionName;
	}

	var ua = navigator.userAgent.toLowerCase();
	if (ua.match(/version\/([\d.]+).*safari/)) {
		ssl_url = ssl_url.replace(":443/", "/");
	}
	
	return ssl_url;
}

function changeBtnBg(btnObj, imageUrl) {
    btnObj.style.background = "url(" + imageUrl + ") no-repeat";
}

function writePage() {
	var imgURL = src.substring(0, src.lastIndexOf("login.js")) + "images/";
	
	var selfserviceUrl = ssUrl;
	
	var submitURL = "";
	
	var logoPic = "";

	var sysName = title;
	var welcomeTitle = "\u6b22\u8fce\u4f7f\u7528";

	welcomeTitle = welcomeTitle + sysName;

	if (checkLoginType() == ssl_sso) {
		submitURL = getSSLURL("login?loginType=login")

		logoPic = "logo_umsso.jpg";
	} else if (checkLoginType() == nonessl_sso) {
		submitURL = "login?loginType=login";
		
		logoPic = "logo_umsso.jpg";
	} else if (checkLoginType() == ssl_nonesso) {
		submitURL = getSSLURL("j_security_check");
		
		logoPic = "logo_um.jpg";	
	} else {
		submitURL = "j_security_check";
		
		logoPic = "logo_um.jpg";
	}

	document.write("<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>");
	document.write("<html xmlns='http://www.w3.org/1999/xhtml'>");
	document.write("<head>");
	document.write("<meta http-equiv='Content-Type' content='text/html; charset=utf-8' />");
	document.write("<title>" + welcomeTitle + "</title>");
	document.write("<meta http-equiv='Content-Language' content='zh-cn' />");
	document.write("<meta name='copyright'  content='\u672c\u9875\u7248\u6743\u5f52\u4e2d\u56fd\u5e73\u5b89\u6240\u6709\u3002\u0041\u006c\u006c\u0020\u0052\u0069\u0067\u0068\u0074\u0073\u0020\u0052\u0065\u0073\u0065\u0072\u0076\u0065\u0064'/>");
	document.write("<style type='text/css'>");
	document.write("*{margin:0; padding:0;}");
	document.write("html{ border:0;}");
	document.write("body{font-size:12px; font-family:Verdana,'宋体'; background:#fff;}");
	document.write("table, div, p, td, li, dd, a, span{font:inherit;}");
	document.write("select, input, textarea, button {font:inherit;}");
	document.write("ul{list-style:none;}");
	document.write("h1{font-size:20px; color:#904b01; line-height:20px; text-align:center; font-weight:bold;}");
	document.write(".c{height:1%;}");
	document.write(".c:after {content:'.'; display:block; height:0; clear:both; visibility:hidden;}");
	document.write(".ch{cursor:pointer; cursor:hand;}");
	document.write(".fl{float:left;}");
	document.write(".fr{float:right;}");
	document.write(".p_t3{padding-top:3px;}");
	document.write(".m_t20_b50{margin:2px 0 20px;}");
	document.write(".m_t10{margin-top:10px;}");
	document.write(".p_l24{padding-left:3px;}");
	document.write(".f15{font-size:15px;}");
	document.write(".fwb{font-weight:bold;}");
	document.write(".f_c_fff{color:#fff;}");
	document.write(".wrapper, .main{width:800px;}");
	document.write(".wrapper{height:540px;margin:0 auto;}");
	document.write(".header{width:auto;height:20px;padding:10px 20px;}");
	document.write(".main_t{height:388px; background:url(" + imgURL + "bg.jpg) repeat-x; margin:10px auto 0;}");
	document.write(".content{width:355px; height:auto; margin:0 auto; padding:0px 0 0;}");
	document.write(".umlogo{margin:0 auto; width:74px; height:50px; padding-top:16px}");
	document.write(".t_a{width:100%; height:auto;}");
	document.write(".t_a td{padding:9px 0; padding:8px 0;}");
	document.write(".input_a{width:186px; height:28px; line-height:28px; border:1px solid #d29807; background:#fff; padding:0 3px; color:#333; font-size:12px;}");
	document.write(".button_box{width:75px; height:75px; position:relative;}");
	document.write(".button_a{width:75px; height:75px; background:url(" + imgURL + "go.jpg) no-repeat; background-color: transparent; border:none;}");
	document.write(".ul_a{padding:45px 0 0 50px;}");
	document.write(".ul_a li{display:inline; float:left; width:40%; height:22px; line-height:22px; font-size:13px; font-weight:bold;}");
	document.write(".ul_a li.icon01{background:url(" + imgURL + "icon01.jpg) no-repeat 0 1px;}");
	document.write(".ul_a li.icon02{background:url(" + imgURL + "icon02.jpg) no-repeat 0 1px;}");
	document.write(".ul_a li.icon03{background:url(" + imgURL + "icon03.jpg) no-repeat 0 1px;}");
	document.write(".ul_a li.icon04{background:url(" + imgURL + "icon04.jpg) no-repeat 0 2px;}");
	document.write(".ul_a li a{color:#fff; text-decoration:underline;}");
	document.write(".ul_a li a:hover{color:#fff; text-decoration:none;}");
	document.write(".footer{width:auto; margin:20px 0 0 45px; text-align:left; color:#333;}");
	document.write(".footer span{font-size:14px; font-weight:bold; background:url(" + imgURL + "icon05.jpg) no-repeat 0 0; padding-left:48px; padding-bottom:5px; height:24px; line-height:24px; display:block;}");
	document.write(".footer p{line-height:18px; padding-top:4px; padding-left:48px;}");
	document.write("</style>");
	document.write("</head>");
	document.write("<body>");
	document.write("<table width='100%' height='88%' border='0' cellpadding='0' cellspacing='0'>");
	document.write("<tr>");
	document.write("<td align='center' valign='middle'>");
	document.write("<div class='wrapper'>");
	document.write("<div class='header c'> <span class='fl'><img src='" + imgURL + "logo01.jpg' alt='\u4e2d\u56fd\u5e73\u5b89' width='310' height='20' border='0' /></span> <span class='fr p_t3'><img src='" + imgURL + "banner.jpg' alt='\u4e13\u4e1a\u8ba9\u751f\u6d3b\u66f4\u7b80\u5355' width='160' height='18' border='0' /></span> </div>");
	document.write("<table class='main_t' width='100%' border='0' cellspacing='0' cellpadding='0'>");
	document.write("<tr><td align='center'>");
	document.write("<div class='umlogo'><img src='" + imgURL + logoPic + "' alt='UMlogo' align='center'/></div>");
	document.write("<table width='66%' height='21%' border='0' cellspacing='0' cellpadding='0'>");
	document.write("<tr><td align='center'>");
	document.write("<h1 class='m_t20_b50'>" + welcomeTitle + "</h1>");
	document.write("</td></tr>");
	document.write("</table>");
	document.write("<div class='content'>");
	document.write("<form id='login_form' name='login_form' method='POST' action='" + submitURL + "' onkeypress=\"onPasswordEnter(event)\" >");
	document.write("<table width='100%' cellspacing='0' cellpadding='0' border='0' height='100%' class='t_a'>");
	document.write("<tr>");
	document.write("<td align='left'><span class='fwb f15 f_c_fff'>\u7528\u6237\u540d：</span></td>");
	document.write("<td align='left'><input tabindex=1 type='text' class='input_a' id='j_username' name='j_username'/></td>");
	document.write("<td rowspan='2' align='right'>");
	document.write("<input type='button' name='Submit' class='button_a ch' onmouseout='changeBtnBg(this, \"" + imgURL + "go.jpg\");' onmousedown='changeBtnBg(this, \"" + imgURL + "go_small.jpg\");' onmouseup='changeBtnBg(this, \"" + imgURL + "go.jpg\");' onClick='loginformSubmit();' onkeypress='return false;'/>");
	document.write("</td>");
	document.write("</tr>");
	document.write("<tr>");
	document.write("<td><span class='fwb f15 f_c_fff'>\u5bc6\u0026\u006e\u0062\u0073\u0070\u003b\u0026\u006e\u0062\u0073\u0070\u003b\u0026\u006e\u0062\u0073\u0070\u003b\u7801：</span></td>");
	document.write("<td><input tabindex=2 type='password' class='input_a' id='j_password' name='j_password' autocomplete='off'/></td>");
	document.write("<input type=\"hidden\" name=\"SMAUTHREASON\" value=\"0\">");
	document.write("</tr>");
	document.write("</table>");
	document.write("</form>");
	document.write("<ul class='ul_a c'>");
	document.write("<li class='icon01'><a class='p_l24' onclick=\"javascript:openWin('" + selfserviceUrl + ss_forget_password_jsp + "', '444', '520')\" href='#' title='\u5fd8\u8bb0\u5bc6\u7801'>\u5fd8\u8bb0\u5bc6\u7801</a></li>");
	document.write("<li class='icon02'><a class='p_l24' onclick=\"javascript:openWin('" + selfserviceUrl + ss_forget_uid_jsp + "', '444', '296')\" href='#' title='\u5fd8\u8bb0\u8d26\u53f7'>\u5fd8\u8bb0\u8d26\u53f7</a></li>");
	document.write("<li class='m_t10 icon03'><a class='p_l24' onclick=\"javascript:openWin('" + selfserviceUrl + ss_change_password_jsp + "', '444', '470')\" href='#' title='\u4fee\u6539\u5bc6\u7801'>\u4fee\u6539\u5bc6\u7801</a></li>");
	document.write("<li class='m_t10 icon04'><a class='p_l24' href='" + selfserviceUrl + ss_login_jsp + "' target='_blank' title='\u81ea\u52a9\u670d\u52a1'>\u81ea\u52a9\u670d\u52a1</a></li>");
	document.write("</ul>");
	document.write("</div>");
	document.write("</td></tr></table>");
	document.write("<div class='footer'> <span>\u5b89\u5168\u5c0f\u63d0\u793a</span>");
	document.write("<p><font size='2'>\u5982\u60a8\u672a\u83b7\u6388\u6743\u4f7f\u7528\u8fd9\u79c1\u4eba\u7535\u8111\u7cfb\u7edf\uff0c\u8bf7\u7acb\u5373\u79bb\u5f00\u3002\u5728\u672a\u53d1\u901a\u77e5\u6216\u672a\u83b7\u5141\u8bb8\u60c5\u51b5\u4e0b\uff0c\u6240\u6709\u7cfb\u7edf\u884c\u4e3a\u4f1a\u53d7\u76d1\u63a7\u53ca\u8bb0\u5f55\u3002</br>");
	document.write("If you are not authorized to access this private computer system,please disconnect now.</br>");
	document.write("All activities on this system will be monitored and recorded without prior notification or permission.</font></p>");
	document.write("</div>");
	document.write("</div>");
	document.write("</td>");
	document.write("</tr>");
	document.write("</table>");
	document.write("</body>");
	document.write("</html>");
}

writePage();