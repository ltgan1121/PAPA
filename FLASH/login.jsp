<%@ page contentType="text/html;charset=UTF-8"%>
<%
	String path = request.getContextPath();
	String basePath = request.getScheme() + "://"
			+ request.getServerName() + ":" + request.getServerPort()
			+ path + "/";
%>
<script type="text/javascript">
	var isCHROME=navigator.userAgent.toUpperCase().indexOf("CHROME")==-1?false:true;
	var isFIREFOX=navigator.userAgent.toUpperCase().indexOf("FIREFOX")==-1?false:true;
	if(!isCHROME && !isFIREFOX) {
		alert("请使用chrome或firefox访问！");
		window.opener=null;     
		window.open("","_self");     
		window.close();
	}
</script>
<script id="script_umlogin" language="javascript" ssl="off" sso="off"
	src="<%=basePath%>umlogin/login.js"
	umbaseurl="http://um-selfservice-int.paic.com.cn" title="FLASH"></script>

