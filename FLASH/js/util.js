/*!
 * @author mo-om
 */
;(function(c,a,d){var b=(function(){return{guid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(g){var f=Math.random()*16|0,e=g=="x"?f:(f&3|8);return e.toString(16)}).toUpperCase()},getBasePath:function(){var f=c.location,e=f.protocol+"//"+f.host+f.pathname;return f.href.substring(0,e.lastIndexOf("/"))},getQueryString:function(e){var f=new RegExp("(^|\\?|&)"+e+"=([^&]*)(\\s|&|$)","i");return f.test(location.href)?unescape(RegExp.$2.replace(/\+/g," ")):""},isCrossDomain:function(e){var g=c.location,f=new RegExp("^"+g.protocol+"//"+g.host);return f.test(e)?false:true},match:function(f,h){var e=f.length,g=h.substr(0,e);return f.toUpperCase()===g.toUpperCase()},extractor:function(e){var g=/<body[^>]*>((.|[\n\r])*)<\/body>/im,f=g.exec(e);return f?f[1]:e},loadScript:function(g,l){g=(g instanceof Array)?g:[g];l=l||function(){};var j=0,f=g.length,k=f-1,h=a.getElementsByTagName("head")[0]||a.documentElement,e=function(m){var i=a.createElement("script");i.type="text/javascript";i.src=m;i.async=true;i.onload=i.onreadystatechange=function(){if(!this.readyState||this.readyState==="loaded"||this.readyState==="complete"){this.onload=this.onreadystatechange=null;this.parentNode.removeChild(this);j++;j<f&&e(g[j]);j==k&&l()}};h.appendChild(i)};e(g[j])}}})();c.util=b})(window,document);
util.loadScript([
	'js/store+json2.min.js',
	'js/jquery-1.11.1.min.js',
	'plugins/jquery-tmpl/jquery.tmpl.min.js',
	'plugins/jquery-validate/jquery.validate.min.js',
	'plugins/jsPlumb-1.7.0/js/dom.jsPlumb-1.7.0-min.js',
	'plugins/Highcharts/js/highcharts.js',
	'plugins/Highcharts/js/modules/exporting.js',
	'plugins/codemirror/lib/codemirror.js',
	'plugins/codemirror/addon/display/placeholder.js',
	'plugins/codemirror/mode/sql/sql.js',
	'plugins/codemirror/addon/hint/show-hint.js',
	'plugins/codemirror/addon/hint/sql-hint.js',
	'js/app.src.js?v=1.0.2',
	'js/config-validate.js?v=1.0.1'
],function () {
	document.body.removeChild(document.getElementById('entry'));
})