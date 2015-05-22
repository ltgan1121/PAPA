<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core_rt" %>

<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

<c:if test="${sessionScope.userInfo !=null }">
    <jsp:forward page="index.html"></jsp:forward>
</c:if>

<c:if test="${sessionScope.userInfo == null }">
	<jsp:forward page="/user/login"></jsp:forward>
</c:if>