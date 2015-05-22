<%@ page language="java" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt"%>

<c:set var="ctx" value="${pageContext.request.contextPath}"/>

<html>
<head>
<title>系统没有此用户</title>
</head>
<body>
	<center>
		系统没有此用户，请<a href="${ctx}/index.jsp">返回 
	</center>
</body>
</html>