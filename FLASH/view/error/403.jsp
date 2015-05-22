<%@ page contentType="text/html;charset=UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>

<%response.setStatus(200);%>

<!DOCTYPE html>
<html>
<head>
	<title>403 - 没有权限或session过期，请登录</title>
</head>

<body>
	<h2>403 - 没有权限或session过期，请登录.</h2>
	<p><a href="<c:url value="/"/>">返回首页</a></p>
</body>
</html>