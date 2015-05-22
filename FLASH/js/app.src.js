/*!
 * app.js
 * @author mo-om
 * @gmail chengwei915@gmail.com
 * @internal email ex-mochengwei001@pingan.com.cn
 */

/*!
 * app 初始化模块
 * @namespace app
 * @dependence jQuery
 * @return {Object} module app
 */
;(function ($,window,document,undefined) {
    var app = (function () {
        return {
            init: function () {
                this.DEL_KEY = 46;
                this.ENTER_KEY = 13;
                this.BACKSPACE_KEY = 8;
                this.trsDuration = 300;
                this.executeAction = false;
                this.setMessages();
                this.cacheElements();
                this.setAjaxDefaults();
                this.getUserInfo();
                this.userinfo = {};
                this.requestMethod = {
                    post: 'POST'
                };
            },
            setMessages: function () {
                this.pickIt = '请选择';
                this.noData = '暂无数据';
                this.loading = 'LOADING...';
                this.submitting = 'SUBMITTING...';
                this.hasLoaded = '该流程已打开';
                this.delConfirm = '该操作无法撤销，确定要执行吗？';
                this.reLoginConfirm = 'session过期了，是否需要重新登录？';
            },
            log: function () {
                try {
                    console.log.apply(console, arguments);
                } catch(e) {
                    try {
                        opera.postError.apply(opera, arguments);
                    } catch(e) {
                        // alert(Array.prototype.join.call( arguments, ' '));
                    }
                }
            },
            getById: function (id) {
                // this function just a shortcut
                return $('#'+ id)
            },
            preventDefault: function (e) {
                e.preventDefault();
            },
            stopPropagation: function (e) {
                e.stopPropagation();
            },
            cacheElements: function () {
                // 请注意该方法不会缓存动态创建的element(s)
                this.$waiting = $('#waiting');
                this.$username = $('#username');
                this.$waitingInfo = this.$waiting.find('.waiting-info');
            },
            bindEvents: function () {
                
            },
            render: function () {
                
            },
            waiting: function (msg) {
                this.$waiting.addClass('visible');
                this.$waitingInfo.html(msg);
            },
            waitingDone: function () {
                this.$waiting.removeClass('visible');
                this.$waitingInfo.html('');
            },
            setAjaxDefaults: function () {
                $.ajaxSetup({
                    complete: function (response) {
                        app.checkeSessionStatus(response);
                        // app.log(response);
                    }
                })
            },
            checkeSessionStatus: function (response) {
                var sessionStatus;
                response = response || {};
                sessionStatus = response.getResponseHeader('Session-Status');
                if (sessionStatus === 'timeout') {
                    if (confirm(app.reLoginConfirm)) {
                        top.window.location.href = 'index.jsp'
                    }
                }
            },
            getUserInfo: function() {
                $.ajax({
                    //url: 'json/userinfo.json',
                    url: 'user/userinfo',
                    dataType: 'json',
                    cache: false,
                    success: function (response) {
                        var userinfo = response.userinfo;
                        if (response.success) {
                            app.userinfo = userinfo;
                            app.$username.html(userinfo.userName);
                            app.getDbs();
                            
                            // 集群地址 clusterAddr ———— Add by Ganlt 2015-05-18 
                            if(response.clusterAddr)
                            {
	                            $('input[name="cluster_address"]').val(response.clusterAddr).attr("disabled",true);
                            }
                            
                            
                        }else{
                            app.$username.html('未知用户');
                            app.log(response.message)
                        }
                    }
                })
            },
            getDbs: function () {
                $.ajax({
                    url: 'hive/dbs?userName=' + app.userinfo.userName,
                    dataType: 'json',
                    cache: false,
                    success: function (response) {
                        var dbsSelector = $('.dbs'),
                            markup = '<option value="${value}">${text}</option>',
                            selectErrorOption = '<option value="">'+response.message+'</option>',
                            dbs = response.dbs;

                        dbsSelector.empty();
                        dbsSelector.append('<option value="">'+app.pickIt+'</option>');
                        if (response.success) {
                            if ( dbs && dbs.length && (typeof dbs !== 'string') ) {
                                $.template('html', markup);
                                dbsSelector.append($.tmpl('html', response.dbs));
                                // app.codeEditor.updateHintList(dbs);
                            }else{
                                dbsSelector.append('<option value="">'+app.noData+'</option>');
                            }
                        }else{
                            dbsSelector.append(selectErrorOption);
                        } 
                    }
                })
            },
            getHdfs: function(callback){
	             $.ajax({
                    //url: 'json/hdfsFolder.json',
                    url: 'hive/hdfsFolder?userName=' + app.userinfo.userName,
                    dataType: 'json',
                    cache: false,
                    success: function (response) {
                    	if(response && response.hdfsFolder)
                    	{
	                    	$(".dynamic-opt").remove();
	                    	var htmlContent = '';
	                    	for(var i = 0 ; i < response.hdfsFolder.length ; i++)
	                    	{
		                    	htmlContent += '<option class="dynamic-opt" value="'+response.hdfsFolder[i]+'">' + response.hdfsFolder[i] + '</option>';
	                    	}
	                    	$.template('optionHtml',htmlContent);
	                    	$('[name="hdfs_path_personal"]').append($.tmpl('optionHtml',null));
                    	}
                        if(callback)callback();
                    }
                });
            },
            getTables: function (opts) {
                opts = opts || {};
                $.ajax({
                    url: 'hive/tables?dbName=' + opts.db + '&userName=' + app.userinfo.userName,
                    dataType: 'json',
                    cache: false,
                    success: function (response) {
                        var tablesSelector = $(opts.tablesSelector),
                            markup = '<option value="${value}">${text}</option>',
                            selectErrorOption = '<option value="">'+response.message+'</option>',
                            tables = response.tables;

                        tablesSelector.empty();
                        tablesSelector.append('<option value="">'+app.pickIt+'</option>');
                        if (response.success) {
                            if ( tables && tables.length && (typeof tables !== 'string') ) {
                                $.template('html', markup);
                                tablesSelector.append($.tmpl('html', response.tables));
                                // app.codeEditor.updateHintList(tables,true);
                            }else{
                                tablesSelector.append('<option value="">'+app.noData+'</option>');
                            }
                        }else{
                            tablesSelector.append(selectErrorOption);
                        } 
                    }
                })
            },
            getFields: function (opts) {
                opts = opts || {};
                $.ajax({
                    url: 'json/fields.json?dtName=' + opts.dt + '&userName=' + app.userinfo.userName,
                    dataType: 'json',
                    cache: false,
                    success: function (response) {
                        if (response.success) {
                            var fields = response.fields;
                            if ( fields && fields.length && (typeof fields !== 'string') ) {
                                var selected = [
                                    { text: $('#sql-dbs').val() },
                                    { text: $('#sql-dts').val() }
                                ];
                                app.codeEditor.updateHintList(fields,true);
                                app.codeEditor.updateHintList(selected);
                            }else{
                                app.log(app.noData);
                            }
                        }else{
                            app.log(response.message);
                        } 
                    }
                })
            }
        }
    })();

    // init module
    app.init();

    // export module
    window.app = app;
    
})(jQuery,window,document);

/*!
 * codeEditor 模块
 * @namespace app.codeEditor
 * @dependence jQuery|app
 * @param  {Object} module
 * @return {Object} app.codeEditor
 */
;(function (module) {
    var codeEditor = (function () {
        return {
            init: function () {
                this.instance = {};
                this.hintList = [];
                this.hintOptionsChanged = false;
                this.createSqlEditor();
                this.fixedKeyEvent();
            },
            createSqlEditor: function () {
                var textarea = $('#sql-editor')[0],
                    editor = CodeMirror.fromTextArea(textarea, {
                        mode: 'text/x-sql',
                        lineNumbers: true,
                        lineWrapping: true,
                        completeOnSingleClick: true,
                        hint: CodeMirror.hint.sql,
                        hintOptions: {
                            tables: codeEditor.hintList,
                            completeSingle: false,
                            completeOnSingleClick: true
                        },
                        extraKeys: {
                            'Ctrl-Q' : 'autocomplete'
                        }
                    });

                // add .ignore classname to fixed jquery validate
                $(editor.display.wrapper).find('textarea').addClass('ignore');

                // set editor.getValue() to the textarea
                editor.on('change', function (editor,event) {
                    textarea.value = editor.getValue();
                });

                // copy editor instance to codeEditor
                this.instance['sql-editor'] = editor;
            },
            fixedKeyEvent: function () {
                var instance = this.instance;
                for (var i in instance) {
                    if (instance.hasOwnProperty(i)) {
                        // add backspace key to showHint
                        instance[i].on('keyup', function (editor,event) {
                            var val = editor.getValue(),
                                ch = editor.doc.getCursor().ch,
                                endString = val[ch-1];

                            if (event.keyCode === module.BACKSPACE_KEY &&
                                editor.getValue() !== '' &&
                                endString !== ' ' &&
                                ch != 0) {
                                codeEditor.setHintOptions(editor);
                                editor.showHint(editor);
                            }
                        });

                        // fixed Space bug
                        instance[i].on('inputRead', function (editor,event) {
                            if (event.text != ' ') {
                                codeEditor.setHintOptions(editor);
                                editor.showHint(editor);
                            }
                        });
                    }
                }
            },
            destroyCodeEditor: function (id) {
                if (this.instance[id]) {
                    delete this.instance[id];
                }else{
                    module.log('the CodeMirror find by id='+id+' dose not exsit');
                }
            },
            setHintOptions: function (editor) {
                if (this.hintOptionsChanged) {
                    var hintOptions = editor.getOption('hintOptions');
                    $.extend(hintOptions, { tables: this.hintList } );
                    editor.setOption('hintOptions', hintOptions);
                    this.hintOptionsChanged = false;
                }
            },
            updateHintList: function (hintList,replaceAll) {
                for(var i=0; i<hintList.length; i++){
                    var hint = hintList[i].text;
                    if (replaceAll) {
                        // 全量更新
                        this.hintList.length = 0;
                        this.hintList.push(hint);
                    }else{
                        // 增量更新
                        if ( $.inArray(hint, this.hintList) === -1 ) {
                            this.hintList.push(hint);
                        }
                    }
                }
                this.hintOptionsChanged = true;
            }
        }
    })();

    // init module
    codeEditor.init();

    // export module
    module.codeEditor = codeEditor;
    
})(window.app || {});

/*!
 * cmpItems 模块
 * @namespace app.cmpItems
 * @dependence jQuery|app
 * @param  {Object} module
 * @return {Object} app.cmpItems
 */
;(function (module) {

    var body = document.body,
        mousedown = false,
        offsetX,
        offsetY,
        pageX,
        pageY,
        cmpType,
        cmpName,
        indegree,
        cmpInput,
        cmpOutput,
        cmpWindow,
        parentType,

        $cmpDesc,
        $dragVirtualElement,
        $dragCmpWindow,x,y,mousedownType=0;;

    var cmpItems = (function () {
        return {
            init: function () {
                this.cacheElements();
                this.getComponents();
                this.bindEvents();
            },
            cacheElements: function () {
                this.$container = $('#cmp-items');
            },
            bindEvents: function () {
                $(document).on('selectstart', this.disableSelectstart);
                $(document).on('mousedown', this.cmpMousedown);
                $(document).on('mousemove', this.cmpMousemove);
                $(document).on('mouseup', this.cmpMouseup);
                this.$container.on('click', '.item', this.itemClick);
                this.$container.on('mouseenter', '.cmp', this.showTips);
                this.$container.on('mouseleave', this.hideTips);
            },
            disableSelectstart: function (e) {
                if (mousedown) {
                  e.preventDefault();
                }
            },
            showTips: function () {
                var markup, top, left, $me;
                $me = $(this);
                top = $me.offset().top;
                left = cmpItems.$container.outerWidth();
                cssOpts = {
                    top: top + 'px',
                    left: left + 'px'
                };
                markup = '<div class="cmp-desc pos-abs trs-duration-01"></div>';
                markupInfo 
                = '<p>[输入类型] '+ $me.data('input') +'</p>'
                + '<p>[输出类型] '+ $me.data('output') +'</p>'
                + '<p>[组件类型] '+ $me.data('type') +'</p>'
                + '<p>[组件入度] '+ $me.data('indegree') +'</p>'
                + '<p>[组件描述] '+ $me.data('desc') +'</p>';

                if (!$cmpDesc) {
                    $cmpDesc = $(markup).appendTo(body);
                }

                $cmpDesc.css(cssOpts).html(markupInfo).addClass('visible');
            },
            hideTips: function () {
                if ($cmpDesc) {
                    $cmpDesc.removeClass('visible');
                }
            },
            itemClick: function (e) {
                var $me = $(this),
                    $parent = $me.closest('.items');

                if ($(e.target).hasClass('item-head')) {
                    $me.toggleClass('expend');
                    if ($parent.hasClass('single-expend')) {
                        $me.siblings().removeClass('expend');
                    }
                }
            },
            cmpMousedown: function (e) {
                var $t = $(e.target),
                    $p = $t.closest('.cmp'),
                    $i = $t.closest('.item'),
                    getDataProp = function (key) {
                        return $t.data(key) ? $t.data(key) : $p.data(key);
                    };
                if ($t.hasClass('cmp') || $p.size()) {
                    mousedown = true;
                    cmpType = getDataProp('type');
                    cmpName = getDataProp('name');
                    iconCls = getDataProp('icon');
                    cmpInput = getDataProp('input');
                    cmpOutput = getDataProp('output');
                    indegree = getDataProp('indegree');
                    cmpWindow = getDataProp('cmp-window');
                    parentType = $i.data('type');
                    $(body).addClass('_jsPlumb_drag_select');
                    if (!$dragVirtualElement) {
                        $dragVirtualElement = $('<div class="drag-virtual-element pos-abs"></div>').appendTo(body);
                    }
                    mousedownType = 0;
                    // module.log(parentType)
                }
                else if($t.hasClass('cmp-window') || $t.hasClass('cmp-window-header'))//弹出窗口拖动  Add by Ganlt 2015-05-11
                {
	                mousedownType = 1;
	                mousedown = true;
	                
	                if($t.hasClass('cmp-window-header'))
	                {
		                $dragCmpWindow = $t.closest(".cmp-window");
		            }
	                else
	                {
		                $dragCmpWindow = $t;
	                }
	                x = e.offsetX;
	                y = e.offsetY;
	                //console.log(x + " , " + y);
                }
            },
            cmpMousemove: function (e) {
                if (mousedown) {
                	if(mousedownType == 1)//弹出窗口拖动   Add by Ganlt 2015-05-11
                    {
    	                 if($dragCmpWindow)
                        {
    	                    var clientHeight = document.body.clientHeight;
    	                    var clientWidth = document.body.clientWidth;
    	                    pageX = e.pageX < 0 ? 0 : e.pageX;
                            pageY = e.pageY < 0 ? 0 : e.pageY  ;
                            pageY = pageY > (clientHeight -20) ? clientHeight - 20: pageY;
                            pageX = pageX > (clientWidth - 20) ? clientWidth - 20:pageX;
                            
                            offsetX = $dragCmpWindow.outerWidth()/2;
                            offsetY = $dragCmpWindow.outerHeight()/2;
                            var left = pageX + offsetX -x;
                            var top =  pageY + offsetY -y;
                            top = top < 0 ? 0:top;
                            $dragCmpWindow.css({
                                left: left  + 'px',
                                top: top + 'px'
                            })
                        }
                    }
                    else if ($dragVirtualElement.size()) {
                        pageX = e.pageX;
                        pageY = e.pageY;
                        offsetX = $dragVirtualElement.outerWidth()/2;
                        offsetY = $dragVirtualElement.outerHeight()/2;
                        $dragVirtualElement.show().css({
                            left: pageX - offsetX  + 'px',
                            top: pageY - offsetY + 'px'
                        })
                    }
                }
            },
            cmpMouseup: function (e) {
                var process = module.process;
                if(mousedownType == 1)//弹出窗口拖动 Add by Ganlt 2015-05-11
                {
	                
                }
                else if ($dragVirtualElement && $dragVirtualElement.size() && mousedown) {
                    var offset = process.$processArea.offset(), guid = util.guid();
                    $dragVirtualElement.hide();
                    $(body).removeClass('_jsPlumb_drag_select');
                    if (parseInt($dragVirtualElement.css('top')) > offset.top &&
                        parseInt($dragVirtualElement.css('left')) > offset.left) {
                        process.createProcessNode('jsPlumb-'+guid, {
                            left: parseInt(pageX - offset.left - offsetX),
                            top: parseInt(pageY - offset.top - offsetY),
                            input: cmpInput,
                            output: cmpOutput,
                            iconCls: iconCls,
                            cmpType: cmpType,
                            nodeText: cmpName,
                            indegree: indegree,
                            cmpWindow: cmpWindow,
                            parentType: parentType,
                            prop: {}
                        });
                    }
                }
                if ($dragVirtualElement) {
                    $dragVirtualElement.css({
                        left: '-1000px',
                        top: '-1000px'
                    })
                }
                mousedown = false;
            },
            getComponents: function (opts) {
                opts = opts || {};
                $.ajax({
                    url: 'json/components.json',
                    dataType: 'json',
                    cache: false,
                    beforeSend: function (argument) {},
                    success: function (response) {
                        var items = response.items,
                            i = 0,
                            len = items.length,
                            wrap
                            = '<div class="item expend">'
                            + '<a class="item-head with-arrow pos-rel" href="javascript:;"></a>'
                            + '<div class="item-body clearfix"></div>'
                            + '</div>',
                            markup
                            = '<div class="cmp" '
                            + 'data-type="${type}" '
                            + 'data-desc="${desc}" '
                            + 'data-name="${name}" '
                            + 'data-icon="${iconCls}" '
                            + 'data-input="${input}" '
                            + 'data-output="${output}" '
                            + 'data-indegree="${indegree}" '
                            + 'data-cmp-window="${cmpWindow}">'
                            + '<span class="fa ${iconCls} trs-all"></span>'
                            + '<div class="cmp-text">${name}</div>'
                            + '</div>';

                        $.template('html', markup);
                        for (; i < len; i++) {
                            var type = items[i]['type'],
                                title = items[i]['title'],
                                $subitems = $.tmpl('html', items[i]['subitems']);

                            cmpItems.$container.append(wrap);
                            cmpItems.$container.find('.item').eq(i).data('type',type);
                            cmpItems.$container.find('.item-head').eq(i).html(title);
                            cmpItems.$container.find('.item-body').eq(i).html($subitems);
                        }
                    }
                })
            }
        }
    })();

    // init module
    cmpItems.init();

    // export module
    module.cmpItems = cmpItems;

})(window.app || {});

/*!
 * process 模块
 * @namespace app.process
 * @dependence jQuery|app
 * @param  {Object} module
 * @return {Object} app.process
 */
;(function (module) {
    var process = (function () {
        return {
            init: function () {
                this.processId = null;
                this.processName = null;
                this.untitled = 'untitled';
                this.setMessages();
                this.setFilters();
                this.cacheElements();
                this.bindEvents();
                this.$cmpWindow.find('.method').trigger('change');
                this.$cmpWindow.find('.treeType').trigger('change');
                this.$cmpWindow.find('.optimizer').trigger('change');
                this.interValForExec = null;
            },
            afterSave: function() {},
            setMessages: function () {
                this.noProcessData = '还没有流程数据哦！';
                this.resetConfirmTips = "请确认当前流程是否已保存...\n确定将切换至新流程";
            },
            setFilters: function () {
                this.foucsElements = 'input,select,textarea',
                this.enabledFirst = ':enabled:first',
                this.enabledErrorFirst = '.form-error-tips:enabled:first';
                this.noConnEndpoints = '._jsPlumb_endpoint:not(._jsPlumb_endpoint_connected)';
            },
            cacheElements: function () {
                this.$cmpWindow = $('.cmp-window');
                this.$processArea = $('#process-area');
                this.$processTitle = $('#process-title');
                this.$processNameWindow = $('#process-name-window');
                this.$processName = this.$processNameWindow.find('#process-name');
                this.$mask = $('.mask');
                this.$normalContent = $('.normal-content');
                this.$windowSelect = $('#window-select');
            },
            bindEvents: function () {
                this.$cmpWindow.on('blur',  '.ui-input', this.blurTips);
                this.$cmpWindow.on('focus', '.ui-input', this.focusTips);
                this.$cmpWindow.on('click', '.ok', this.okSetData);
                this.$cmpWindow.on('click', '.cancel, .x', this.cancelSetData);
                this.$cmpWindow.on('click', '.execute', this.justExecute);
                this.$cmpWindow.on('click', '.get-tree-pic', this.getNodeTreePic);
                this.$cmpWindow.on('click', '.get-grid-data', this.getNodeGridData);
                this.$cmpWindow.on('click', '.get-chart-data', this.getNodeChartData);
                this.$cmpWindow.on('click', '.get-pie-data', this.getNodePieData);
                this.$cmpWindow.on('click', '.export-grid-data', this.exportNodeGridData);
                this.$cmpWindow.on('change', '.dbs', this.dbChange);
                this.$cmpWindow.on('change', '.dts', this.dtChange);
                this.$cmpWindow.on('change', '.method', this.methodChange);
                this.$cmpWindow.on('change', '.treeType', this.treeTypeChange);
                this.$cmpWindow.on('change', '.optimizer', this.optimizerChange);
                this.$cmpWindow.on('keypress', 'form', this.formEnterKeypress);
                this.$processArea.on('click', '.process-node', this.selectProcessNode);
                this.$processArea.on('dblclick', '.process-node', this.openCmpWindow);
                this.$processArea.on('mouseenter', '.process-node', this.delNoConnEndpoints);
                this.$processArea.on('selectstart', module.preventDefault);
                this.$processNameWindow.on('keyup', '#process-name', this.checkProcessNameChange);
                this.$processNameWindow.on('focus', '#process-name', this.checkProcessNameChange);
                this.$processNameWindow.on('click', '#post-process-data', this.checkNsaveProcess);
                this.$windowSelect.on('keyup focus', '.select-input', this.selectOne);
                $(document).on('keyup', this.delProcessNode);
            },
            checkProcessNameChange: function () {
                var $me = $(this),
                    $form = $me.closest('form');
                if ($me.val()) {
                    $form.validate(app.getFormValidateOpts($form));
                    module.log($me.val(),$form.valid())
                }
            },
            checkNsaveProcess: function () {
                var $me = $(this),
                    $form = $me.closest('form');
                $form.validate(app.getFormValidateOpts($form));
                if ($form.valid()) {
                    if (process.executeAction) {
                        process.saveProcess(triggerExec); 
                    } else {
                        process.saveProcess();
                    }
                    function triggerExec () {
                        process.executeBtn.trigger('click');
                    }
                }else{
                    $form.find(process.foucsElements).filter(process.enabledErrorFirst).focus();
                    return;
                }
            },
            focusTips: function (e) {
                var me = this,
                    $me = $(me),
                    $parent = $me.closest('.cmp-window');

                $parent.find('[data-tips-for='+me.name+']').addClass('focus');
            },
            blurTips: function (e) {
                $(this).closest('.cmp-window').find('.field-tips-item').removeClass('focus');
            },
            selectProcessNode: function () {
                var $me = $(this);
                $me.addClass('active');
                $me.siblings().removeClass('active');
            },
            delNoConnEndpoints: function () {
                $(process.noConnEndpoints).remove();
                // var id = this.id,
                //     instance = process.jsPlumbInstance,
                //     noConnEndpoints = instance.getEndpoints(id) || [];

                // $.each(noConnEndpoints, function (i,endpoint) {
                //     if (endpoint &&
                //         endpoint.connections &&
                //         endpoint.connections.length == 0) {
                //         instance.deleteEndpoint(endpoint);
                //     }
                // });
            },
            delProcessNode: function (e) {
                var active = process.$processArea.find('.process-node.active');
                if (active && active.size()) {
                    if (!e.altKey   &&
                        !e.ctrlKey  &&
                        !e.metaKey  && // Mac's Command key
                        !e.shiftKey &&
                        e.keyCode == module.DEL_KEY &&
                        e.target.tagName.toLowerCase() == 'body' ) {
                        process.jsPlumbInstance.detachAllConnections(active.attr('id'));
                        active.remove();
                    }
                }
            },
            twinklingNode: function(node,shouldTwink){//Add by Ganlt 2015-05-12
                
                if(!shouldTwink){
                   
                   if(process.interValForExec)clearInterval(process.interValForExec);
                   $('.process-node').removeClass('twinkling-piece');
                   $('.process-node').removeClass('on-exec');
                   
                   // if(node.hasClass('twinkling-piece'))node.removeClass('twinkling-piece');
                }
                else
                {
                   function findSourceId(tid){
                       var cons = app.process.jsPlumbInstance.getConnections();
                       for(var i = 0 ; i < cons.length ; i++)
                       {
                           if(cons[i]['targetId'] == tid) return cons[i]['sourceId'];
                       }
                       return null;
                   }
                   
                   function getParentNodes(tid){
                       var sid = tid;
                       var result = tid;
                       do{
                           if(sid.length > 0 && sid != result) result += "," + sid;
                           sid = findSourceId(sid);
                       }while(sid != null);
                       
                       return result;
                   }
                   
                   var nid = node.attr("id");
                   var parentStr = getParentNodes(nid);
                   
                   var parentNodeIdArray = parentStr.split(',');
                   var parentNodeIdsStr = '#' + parentNodeIdArray.join(',#');
                   $(parentNodeIdsStr).addClass('on-exec');
                    var j = parentNodeIdArray.length - 1;
                    //console.log("AAA: "+j +";" +parentNodeIdArray.length);
                    
                    function twinkNext(idx)
                    {
                        $('.process-node').removeClass('twinkling-piece');
                        $('#'+parentNodeIdArray[idx]).addClass('twinkling-piece');
                        console.log(idx +";" +parentNodeIdArray[idx]);
                    }
                    
                    twinkNext(j);
                    
                    j--;
                    if(j != -1)
                    {
                        process.interValForExec = setInterval(function(){
                            twinkNext(j);
                            j--;
                            if(j == -1) //j = parentNodeIdArray.length - 1;
                            {
                                clearInterval(process.interValForExec);
                            }
                        }, 5000);
                    }
               
                    //node.addClass('twinkling-piece');
                }
            },
            createProcessNode: function (id,opts) {
                opts = opts || {};
                var node, nodeText, instance, selector, container;
                instance = this.jsPlumbInstance;
                container = this.$processArea;
                container.find('.process-node').removeClass('active');
                node = $('<div class="process-node active fa"></div>')
                    .appendTo(container)
                    .addClass(opts.iconCls)
                    .append('<div class="node-text">'+(opts.nodeText || opts.cmpType)+'</div>')
                    .append('<div class="ep"></div>')
                    .data('prop',opts.prop)
                    .data('type',opts.cmpType)
                    .data('icon',opts.iconCls)
                    .data('input',opts.input)
                    .data('output',opts.output)
                    .data('indegree',opts.indegree)
                    .data('cmp-window',opts.cmpWindow)
                    .data('parent-type',opts.parentType)
                    .attr('id',id)
                    .css({
                        top: opts.top + 'px',
                        left: opts.left + 'px'
                    });

                nodeText = node.find('.node-text');
                nodeText.css({
                    'margin-left': -nodeText.outerWidth()/2 + 'px'
                });

                // must be draggabled then makeSource or makeTarget
                instance.draggable(id, {
                   containment:true
                });

                // 避免多次绑定
                instance.unbind('click');
                instance.unbind('connection');

                instance.makeSource(id, {
                    filter:".ep",
                    anchor:"Continuous",
                    //uniqueEndpoint: true,
                    connector:[ "StateMachine", { curviness:20 } ],
                    connectorStyle:{ strokeStyle:"#5c96bc", lineWidth:2, outlineColor:"transparent", outlineWidth:4 }
                });

                instance.makeTarget(id, {
                    anchor:"Continuous",
                    allowLoopback:false,
                    // uniqueEndpoint: true,
                    dropOptions:{ hoverClass:"dragHover" },
                    maxConnections: node.data('indegree'),
                    onMaxConnections:function(info, e) {
                        module.log("Maximum connections (" + info.maxConnections + ") reached");
                    }
                });

                instance.bind("click", function (c,e) {
                    instance.detach(c);
                });

                instance.bind('connection', function (info) {
                    var $source = $(info.source),
                        $target = $(info.target),
                        sopt = $source.data('output').split('|'),
                        tipt = $target.data('input').split('|'),
                        connTiptTypes = [],
                        sourceElement = [],
                        targetElement = [],
                        sourceEndPoints = instance.getEndpoints(info.sourceId) || [],
                        targetEndPoints = instance.getEndpoints(info.targetId) || [];

                    for (var i = 0; len = tipt.length, i < len; i++) {
                        if ($.inArray(tipt[i],sopt) != -1) {
                            connTiptTypes.push(tipt[i]);
                        }
                    }
                    

                    function hasConnection (endpoint) {
                        return endpoint && endpoint.connections && endpoint.connections.length;
                    }

                    function isDisabledConnect() {
                        return sopt[0] === 'disable' ||
                                tipt[0] === 'disable' ||
                                (sopt[0] !== '*' && tipt[0] !== '*' && !connTiptTypes.length);
                    }
                    
                    // source 和 target 可连接性验证
                    if (isDisabledConnect()) {
                        $(process.noConnEndpoints).remove();
                        instance.detach(info.connection);
                    }

                    // $.each(sourceEndPoints, function (i,endpoint) {
                    //     if (hasConnection(endpoint)) {
                    //         sourceElement.push(endpoint.elementId);
                    //     }
                        
                    // });

                    // $.each(targetEndPoints, function (i,endpoint) {
                    //     if (hasConnection(endpoint)) {
                    //         targetElement.push(endpoint.elementId);
                    //     }
                    // });

                    // source 和 target 连接线数量验证
                    // if (sourceElement.length > 1 && targetElement.length > 1) {
                    //     if (sourceElement[0] === sourceElement[1] &&
                    //         targetElement[0] === targetElement[1] ) {
                    //         instance.detach(info.connection);
                    //     }
                    // }

                    // 设置一个实际入度用于执行时验证
                    // $target.data('real-indegree',info.targetEndpoint.connections.length);

                });
            },
            openCmpWindow: function () {
                var width, height,
                    $me = $(this),
                    cmpType = $me.data('type'),
                    cmpProp = $me.data('prop'),
                    cmpWindow = $me.data('cmp-window'),
                    $cmpWindow = $('#window-'+cmpType),
                    $formElements = $cmpWindow.find(process.foucsElements),
                    isSetPos = !!$cmpWindow.data('set-pos');

                if (!cmpWindow) {return};

                $cmpWindow.find('.cmp-window-header').html('component@'+cmpType);
                $cmpWindow.addClass('visible').data('belong-to',$me);
                process.$mask.addClass('visible');

                setTimeout(function () {
                    $formElements.filter(process.enabledFirst).focus().select();
                },module.trsDuration);

                width = $cmpWindow.outerWidth();
                height = $cmpWindow.outerHeight();

                if (!isSetPos) {
                    $cmpWindow.css({
                        'position': 'absolute',
                        'top': '50%',
                        'left': '50%',
                        'margin-top': -height/2 + 'px',
                        'margin-left': -width/2 + 'px'
                    });
                    isSetPos = true;
                }

				//var hdfs_type = null, hdfs_path = null;
				
                if (cmpProp) {
                    for(var i in cmpProp){
                        if (cmpProp.hasOwnProperty(i)) {
                            var name = '[name='+i+']',
                                $input = $cmpWindow.find(name);

                            $input.val(cmpProp[i]);
                            if ($input.data('type') === 'codemirror') {
                                var editorInstance = module.codeEditor.instance[$input.attr('id')];
                                editorInstance.setValue($input.val());
                            }
                            
                            //hdfs
                            /*
                            if(i == 'hdfs_type')
                            {
	                            hdfs_type = cmpProp[i];
                            }else if(i == 'hdfs_path')
                            {
	                            hdfs_path = cmpProp[i];
                            }
                            */
                        }
                    }
                }  
                
                // hdfs 个人路径获取 ———— Add by Ganlt 2015-05-18
                if(cmpType == "hdfs-file"){
	                
	                var callback = function(){
	                    
	                    $(".hdfs-path-personal").on("change",function(){
		                    $(".hdfs-path-final").val($(".hdfs-path-personal").val());
	                    });
	                    
	                    $(".hdfs-path-define").on("change",function(){
		                    $(".hdfs-path-final").val($(".hdfs-path-define").val());
	                    });
	                    
	                    var hdfs_type = $('[name="hdfs_type"]').val(), hdfs_path = $('[name="hdfs_path"]').val();
	                    
	                    
	                    if(hdfs_type && hdfs_type == 1)
	                    {
	                         $('input[name="hdfs-folder"][value="1"]').click();
		                     $(".hdfs-path-define").val(hdfs_path);
	                    }
	                    else if(hdfs_type)
	                    {
		                    $('.hdfs-path-personal option[value="'+hdfs_path+'"]').attr("selected",true);
		                    //$(".hdfs-path-personal").val(hdfs_path);
	                    }
	                };
	                
	                app.getHdfs(callback);
	                

	                $(".hdfs-folder").on("change",function(){
                        var value = $('input[name="hdfs-folder"]:checked').val();
                        $(".hdfs-path").hide();
                        if(value == 1)
                        {
	                        $(".hdfs-path-define").show();
	                        $(".hdfs-path-final").val($(".hdfs-path-define").val());
	                        $(".hdfs-type").val("1");
	                        //alert($(".hdfs-path-final").val());
                        }
                        else
                        {
	                        $(".hdfs-path-personal").show();
	                        $(".hdfs-path-final").val($(".hdfs-path-personal").val());
	                        $(".hdfs-type").val("0");
	                        //alert($(".hdfs-path-final").val());
	                        
                        }
                    });
                    
	                
                    
                }
                            
            },
            dbChange: function (e) {
                var me = this,
                    val = me.value,
                    tablesSelector = $('[data-belong-to='+me.id+']');

                module.getTables({
                    db: val,
                    tablesSelector: tablesSelector
                });
            },
            dtChange: function (e) {
                var me = this;
                module.getFields({
                    dt: me.value
                });
            },
            optimizerChange: function (e) {
                var me = this,
                    val = me.value,
                    SGD = 'SGD',
                    LBFGS = 'L-BFGS',
                    prefix = 'data-associate-value',
                    propName = 'disabled',
                    labelItem = '.label-item',

                    $me = $(this),
                    $parent = $me.closest('.cmp-window'),
                    $updater = $parent.find('[name=updater]'),
                    $L1Updater = $updater.find('[value=L1Updater]'),
                    $associateSGDEl = $parent.find('['+prefix+'='+SGD+']'),
                    $associateLBFGSEl = $parent.find('['+prefix+'='+LBFGS+']'),
                    $associateSGDItem = $associateSGDEl.closest(labelItem),
                    $associateLBFGSItem = $associateLBFGSEl.closest(labelItem);

                    $associateSGDItem = $associateSGDItem.size() ? $associateSGDItem : $associateSGDEl.closest('tr');
                    $associateLBFGSItem = $associateLBFGSItem.size() ? $associateLBFGSItem : $associateLBFGSEl.closest('tr');

                    
                // reselect to fixed that user select L1Updater(a disabled option)
                $updater.val('');

                // enabled n disabled logic
                if (val === SGD) {
                    $associateSGDEl.prop(propName, false);
                    $associateLBFGSEl.prop(propName, true);
                    $L1Updater.prop(propName, false);
                    $associateSGDItem.show();
                    $associateLBFGSItem.hide();
                }else if (val === LBFGS) {
                    $associateLBFGSEl.prop(propName, false);
                    $associateSGDEl.prop(propName, true);
                    $L1Updater.prop(propName, true);
                    $associateSGDItem.hide();
                    $associateLBFGSItem.show();
                }else{
                    
                }
            },
            methodChange: function () {
                var me = this,
                    val = me.value,
                    normal = 'normal',
                    uniform = 'uniform',
                    poisson = 'poisson',
                    prefix = 'data-associate-value',
                    propName = 'disabled',
                    labelItem = '.label-item',

                    $me = $(this),
                    $parent = $me.closest('.cmp-window'),
                    $associateNormalEl = $parent.find('['+prefix+'='+normal+']'),
                    $associateUniformEl = $parent.find('['+prefix+'='+uniform+']'),
                    $associatePoissonEl = $parent.find('['+prefix+'='+poisson+']'),
                    $associateNormalItem = $associateNormalEl.closest(labelItem),
                    $associateUniformItem = $associateUniformEl.closest(labelItem),
                    $associatePoissonItem = $associatePoissonEl.closest(labelItem);

                    $associateNormalItem = $associateNormalItem.size() ? $associateNormalItem : $associateNormalEl.closest('tr');
                    $associateUniformItem = $associateUniformItem.size() ? $associateUniformItem : $associateUniformEl.closest('tr');
                    $associatePoissonItem = $associatePoissonItem.size() ? $associatePoissonItem : $associatePoissonEl.closest('tr');

                // enabled n disabled logic
                if (val === normal) {
                    $associateNormalEl.prop(propName, false);
                    $associateUniformEl.prop(propName, true);
                    $associatePoissonEl.prop(propName, true);
                    $associateNormalItem.show();
                    $associateUniformItem.hide();
                    $associatePoissonItem.hide();
                }else if (val === uniform) {
                    $associateNormalEl.prop(propName, true);
                    $associateUniformEl.prop(propName, false);
                    $associatePoissonEl.prop(propName, true);
                    $associateNormalItem.hide();
                    $associateUniformItem.show();
                    $associatePoissonItem.hide();
                }else if (val === poisson) {
                    $associateNormalEl.prop(propName, true);
                    $associateUniformEl.prop(propName, false);
                    $associatePoissonEl.prop(propName, false);
                    $associateNormalItem.hide();
                    $associateUniformItem.hide();
                    $associatePoissonItem.show();
                }else{
                    
                }
            },
            treeTypeChange: function (e) {
                var me = this,
                    val = me.value,
                    cal = 'Classification',
                    reg = 'Regression',
                    prefix = 'data-associate-value',
                    propName = 'disabled',
                    labelItem = '.label-item',

                    $me = $(this),
                    $parent = $me.closest('.cmp-window'),
                    $impurity = $parent.find('[name=impurity]'),
                    $gini = $impurity.find('[value=gini]'),
                    $entropy = $impurity.find('[value=entropy]'),
                    $variance = $impurity.find('[value=variance]'),
                    $associateCalEl = $parent.find('['+prefix+'='+cal+']'),
                    $associateCalItem = $associateCalEl.closest(labelItem);

                    $associateCalItem = $associateCalItem.size() ? $associateCalItem : $associateCalEl.closest('tr');
                    
                // reselect to fixed that user select L1Updater(a disabled option)
                $impurity.val('');

                // enabled n disabled logic
                if (val === cal) {
                    $gini.prop(propName, false);
                    $entropy.prop(propName, false);
                    $variance.prop(propName, true);
                    $associateCalEl.prop(propName, false);
                    $associateCalItem.show();
                }else if (val === reg) {
                    $gini.prop(propName, true);
                    $entropy.prop(propName, true);
                    $variance.prop(propName, false);
                    $associateCalEl.prop(propName, true);
                    $associateCalItem.hide();
                }else{
                    
                }
            },
            selectOne: function () {
                var $me = $(this),
                    $selectInputs = process.$windowSelect.find('.select-input');
                if ($me.val()) {
                    $selectInputs.prop('disabled',true);
                    $me.prop('disabled',false);
                }else{
                    $selectInputs.prop('disabled',false);
                }
            },
            okSetData: function () {
                var $me = $(this),
                    $cmpWindow = $me.closest('.cmp-window'),
                    $form = $me.closest('form'),
                    $formElements = $cmpWindow.find('.ui-input'),
                    i = 0,
                    len = $formElements.size(),
                    cmpProp = {};

                if ($form.size()) {
                    $form.validate(app.getFormValidateOpts($form));
                    if (!$form.valid()) {
                        $form.find(process.foucsElements).filter(process.enabledErrorFirst).focus();
                        return
                    }
                }
                for (; i < len; i++) {
                    if ($formElements[i].name) {
                        cmpProp[$formElements[i].name] = $formElements[i].value;
                    };
                    // $formElements[i].value = '';
                }
                $cmpWindow.data('belong-to').data('prop',cmpProp);
                $cmpWindow.removeClass('visible');
                process.$mask.removeClass('visible');

                process.twinklingNode($cmpWindow.data('belong-to'),false);
            },
            cancelSetData: function () {
                var $cmpWindow = $(this).closest('.cmp-window'),
                    $form = $cmpWindow.find('form'),
                    $mask = process.$mask;

                $cmpWindow.removeClass('visible').find('.close-to-empty').html('');
                $mask.removeClass('visible');
                process.executeAction = false;
                if ($form.size()) {
                    $form.validate().resetForm();
                }

                process.twinklingNode($cmpWindow.data('belong-to'),false);
                
                // process.$normalContent.removeClass('filter-blur');
            },
            formEnterKeypress: function (e) {
                if (e.keyCode === module.ENTER_KEY &&
                    !$(e.target).is('select') &&
                    !$(e.target).is('textarea') ) {
                    $(this).find('.ok, #post-process-data').trigger('click');
                }
            },
            justExecute: function () {
                var $me = $(this),
                    $cmpWindow = $me.closest('.cmp-window'),
                    nodeId = $cmpWindow.data('belong-to').attr('id');

                process.executeBtn = $me;
                process.executeAction = true;
                if (!process.isSavedProcess()) {
                    process.setProcessName();
                    return false;
                }

                process.processId = process.processId || 'PROCESS-' + util.guid();
                
                if (process.executeAction) {
                    process.saveProcess(exec);
                }else{
                    exec();
                }

                function exec () {
                    process.twinklingNode($cmpWindow.data('belong-to'),true);
                    $.ajax({
                        url: 'process/execute?processId=' + process.processId + '&nodeId=' + nodeId,
                        dataType: 'json',
                        cache: false,
                        beforeSend: function () {
                            module.waiting(module.submitting);
                        },
                        success: function (response) {
                            module.waitingDone();
                            process.executeAction = false;
                            alert(response.message);
                        },
                        complete: function () {
                            $cmpWindow.find('.ok').trigger('click');
                            process.twinklingNode($cmpWindow.data('belong-to'),false);
                        }
                    });
                }
            },
            getNodeTreePic: function () {
                var $me = $(this),
                    $cmpWindow = $me.closest('.cmp-window'),
                    $picContainer = $cmpWindow.find('.cmp-pic-container'),
                    nodeId = $cmpWindow.data('belong-to').attr('id');

                process.executeBtn = $me;
                process.executeAction = true;
                if (!process.isSavedProcess()) {
                    process.setProcessName();
                    return false;
                }
                
                process.processId = process.processId || 'PROCESS-' + util.guid();

                if (process.executeAction) {
                    process.saveProcess(exec);
                }else{
                    exec();
                }

                function exec () {
                    process.twinklingNode($cmpWindow.data('belong-to'),true);
                    $.ajax({
                        url: 'process/tree?processId=' + process.processId + '&nodeId=' + nodeId,
                        dataType: 'json',
                        cache: false,
                        beforeSend: function () {
                            $picContainer.html(module.loading);
                        },
                        complete: function () {
                            process.twinklingNode($cmpWindow.data('belong-to'),false);
                        },
                        success: function (response) {
                            var path = response.picturePath,
                                errorMsg = '<div class="error-msg">'+ response.message +'</div>',
                                dispalyContent
                                = '<a hidefocus target="_blank" href="'+ path +'" title="点击查看完整图片">'
                                + '<img style="width:100%" src="'+ path +'">'
                                + '</a>';
                                
                            if (response.success) {
                                $picContainer.html(dispalyContent);
                            }else{
                                $picContainer.html(errorMsg);
                            }
                            process.executeAction = false;
                        }
                    });
                }
            },
            exportNodeGridData: function () {
                var $me = $(this),
                    $cmpWindow = $me.closest('.cmp-window'),
                    $renderer = $cmpWindow.find('.cmp-grid-container'),
                    nodeId = $cmpWindow.data('belong-to').attr('id');

                    process.processId = process.processId || 'PROCESS-' + util.guid();

                $.ajax({
                    url: 'process/dataExport?processId=' + process.processId + '&nodeId=' + nodeId,
                    dataType: 'json',
                    cache: false,
                    success: function (response) {
                        if (!response.success) {
                            alert(response.message);
                            return;
                        };
                        window.location.href = response.fileUrl;
                    },
                    error: function (response) {
                        alert(response.message)
                    }
                })

                
            },
            getNodeGridData: function () {
                var $me = $(this),
                    $cmpWindow = $me.closest('.cmp-window'),
                    $renderer = $cmpWindow.find('.cmp-grid-container'),
                    nodeId = $cmpWindow.data('belong-to').attr('id'),
                    history = $me.data('history'), // 该值为-1表示加载历史执行结果
                    action = history ? 'historyResult' : 'execute';

                process.executeBtn = $me;
                process.executeAction = true;
                if (!process.isSavedProcess()) {
                    process.setProcessName();
                    return false;
                }
                
                process.processId = process.processId || 'PROCESS-' + util.guid();

                if (process.executeAction) {
                    process.saveProcess(exec);
                }else{
                    exec();
                }

                function exec () {
                    process.twinklingNode($cmpWindow.data('belong-to'),true);
                    $.ajax({
                        url: 'process/'+ action +'?processId=' + process.processId + '&nodeId=' + nodeId,
                        dataType: 'json',
                        cache: false,
                        beforeSend: function () {
                            $renderer.html(module.loading);
                        },
                        complete: function(){
                            process.twinklingNode($cmpWindow.data('belong-to'),false);
                        },
                        success: function (response) {
                            var rows = response.rows,
                                i = 0,
                                columnFeilds = rows[0],

                                $grid,
                                $gridBody,

                                markup = '',
                                gridHeader = '',
                                emptyMsg = '<div class="empty-msg">'+ module.noData +'</div>',
                                errorMsg = '<div class="error-msg">'+ response.message +'</div>',
                                columns = response.columns || [];

                            if (response.success) {
                                if ( rows && rows.length && (typeof rows !== 'string') ) {
                                    for (var i in columnFeilds) {
                                        if (columnFeilds.hasOwnProperty(i)) {
                                            if (i === 'index') {
                                                markup += '<td class="index">${'+i+'}</td>';
                                            }else{
                                                markup += '<td>${'+i+'}</td>';
                                            }
                                        }
                                    }
                                    for (var i = 0; i < columns.length; i++) {
                                        if (i == 0) {
                                            gridHeader += '<th class="index">'+response.columns[i].title+'</th>';
                                        }else{
                                            gridHeader += '<th>'+response.columns[i].title+'</th>';
                                        }
                                    }
                                    markup = '<tr>'+markup+'</tr>';
                                    gridHeader = '<thead><tr>'+gridHeader+'</tr></thead>';
                                    $.template('html', markup);
                                    $gridBody = $.tmpl('html', rows);
                                    $grid = $('<table></table>')
                                        .addClass('config-table')
                                            // .css({width: columns.length > 7 ? 'auto' : '100%'})
                                                .append(gridHeader)
                                                    .append($gridBody);
                                    $grid.find('tbody tr:odd').addClass('odd');
                                    $renderer.html($grid);
                                }else{
                                    $renderer.html(emptyMsg);
                                }
                            }else{
                                $renderer.html(errorMsg);
                            }
                            process.executeAction = false;
                        }
                    })
                }
            },
            getNodeChartData: function () {//柱状图、折线图同个接口
               
                if (!process.isSavedProcess()) {
                    process.setProcessName();
                    return false;
                }
                
                var $me = $(this),
                    $cmpWindow = $me.closest('.cmp-window'),
                    $chartContainer = $cmpWindow.find('.cmp-chart-container'),
                    nodeId = $cmpWindow.data('belong-to').attr('id'),
                    chartType = $me.attr('chart-type') ? $me.attr('chart-type') : 'column';
					
                process.processId = process.processId || 'PROCESS-' + util.guid();

                process.twinklingNode($cmpWindow.data('belong-to'),true);

                $.ajax({
                    //url: 'json/chart-line.json',
                    url: 'process/barplot?processId=' + process.processId + '&nodeId=' + nodeId,
                    dataType: 'json',
                    cache: false,
                    beforeSend: function (argument) {
                        $chartContainer.html(module.loading);
                    },
                    complete: function(){
                        process.twinklingNode($cmpWindow.data('belong-to'),false);
                    },
                    success: function (response) {
                        var series = response.series,
                            emptyMsg = '<div class="empty-msg">'+ module.noData +'</div>',
                            errorMsg = '<div class="error-msg">'+ response.message +'</div>',
                            chartOptions = {
                                chart: {
                                    type: chartType,
                                    style: {
                                        fontFamily: '"Microsoft Yahei", simsun, "Lucida Grande", Monospace'
                                    }
                                },
                                title: {
                                    text: response.chartTitle
                                },
                                // subtitle: {
                                //     text: 'Source: WorldClimate.com'
                                // },
                                xAxis: {
                                    categories: response.categories,
                                    labels:{
                                        rotation:-45
                                    },
                                },
                                yAxis: {
                                    min: 0,
                                    title: {
                                        text: response.yAxisTitle
                                    }
                                },
                                tooltip: {
                                    headerFormat: '<span style="font-size:10px">{point.key}</span>',
                                    pointFormat: '<table>'+
                                                    '<tr>'+
                                                        '<td style="color:{series.color};padding:0">{series.name}: </td>' +
                                                        '<td style="padding:0"><b>{point.y:.1f}</b></td>'+
                                                    '</tr>',
                                    footerFormat: '</table>',
                                    shared: true,
                                    useHTML: true
                                },
                                plotOptions: {
                                    column: {
                                        pointPadding: 0.2,
                                        borderWidth: 0
                                    }
                                },
                                series: response.series
                            };

                        if (response.success) {
                            if ( series && series.length && (typeof series !== 'string') ) {
                                $chartContainer.highcharts(chartOptions);
                            }else{
                                $chartContainer.html(emptyMsg);
                            }
                        }else{
                            $chartContainer.html(errorMsg);
                        }
                    }
                })
            },
            getNodePieData: function(){
	            
                if (!process.isSavedProcess()) {
                    process.setProcessName();
                    return false;
                }
                
                var $me = $(this),
                    $cmpWindow = $me.closest('.cmp-window'),
                    $chartContainer = $cmpWindow.find('.cmp-chart-container'),
                    nodeId = $cmpWindow.data('belong-to').attr('id');
					
                process.processId = process.processId || 'PROCESS-' + util.guid();

                process.twinklingNode($cmpWindow.data('belong-to'),true);

                $.ajax({
                    //url: 'json/chart-pie.json',
                    url: 'process/pieChart?processId=' + process.processId + '&nodeId=' + nodeId,
                    dataType: 'json',
                    cache: false,
                    beforeSend: function (argument) {
                        $chartContainer.html(module.loading);
                    },
                    complete: function(){
                        process.twinklingNode($cmpWindow.data('belong-to'),false);
                    },
                    success: function (response) {
                        var series = response.series,
                            emptyMsg = '<div class="empty-msg">'+ module.noData +'</div>',
                            errorMsg = '<div class="error-msg">'+ response.message +'</div>',
                            chartOptions = {
                                chart: {
	                                type:"pie",
						            plotBackgroundColor: null,
						            plotBorderWidth: null,
						            plotShadow: false,
                                    style: {
                                        fontFamily: '"Microsoft Yahei", simsun, "Lucida Grande", Monospace'
                                    }
                                },
                                title: {
                                    text: response.chartTitle
                                },
                                tooltip: {
						            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
						        },
                                // subtitle: {
                                //     text: 'Source: WorldClimate.com'
                                // },
                                plotOptions: {
						            pie: {
						                allowPointSelect: true,
						                cursor: 'pointer',
						                dataLabels: {
						                    enabled: true,
						                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
						                    style: {
						                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
						                    }
						                }
						            }
						        },
                                series: series
                            };

                        if (response.success) {
                            if ( series && series.length && (typeof series !== 'string') ) {
                                $chartContainer.highcharts(chartOptions);
                                
                                $(".highcharts-series-group .highcharts-series").hide();
                                $(".highcharts-series-group .highcharts-markders").hide();
                                $(".highcharts-data-labels").hide();
                                
                                var currentIdx = 0;
                                $(".highcharts-series-group .highcharts-series").eq(currentIdx).show();
                                $(".highcharts-series-group .highcharts-markders").eq(currentIdx).show();
                                $(".highcharts-data-labels").eq(currentIdx).show();
                                
                                var tplHighchartsType = '<ul class="highcharts-types">';
                                
                                for(var i = 0 ; i < response.series.length ; i++)
                                {
	                                tplHighchartsType += '<li idx="'+i+'">'+response.series[i].name+'</li>';
                                }
                                
                                tplHighchartsType += '</ul>';
                                
                                $.template('tplHighchartsType', tplHighchartsType);
                                $chartContainer.append($.tmpl('tplHighchartsType', null));
                                $(".highcharts-types li").eq(0).addClass("on");
                                
                                $chartContainer.on("click",".highcharts-types li",function(e){
	                                var idx = $(e.target).attr("idx");
	                                //alert(idx);
	                                $(".highcharts-series-group .highcharts-series").hide();
	                                $(".highcharts-series-group .highcharts-markders").hide();
	                                $(".highcharts-data-labels").hide();
	                                
	                                $(".highcharts-series-group .highcharts-series").eq(idx).show();
	                                $(".highcharts-series-group .highcharts-markders").eq(idx).show();
	                                $(".highcharts-data-labels").eq(idx).show();
	                                
	                                 $(".highcharts-types li").removeClass("on");
	                                 $(e.target).addClass("on");
	                                 
                                });
                                
                            }else{
                                $chartContainer.html(emptyMsg);
                            }
                        }else{
                            $chartContainer.html(errorMsg);
                        }
                    }
                })
            },
            isSavedProcess: function () {
                return !!process.processId && !!process.processName;
            },
            isEmptyProcess: function () {
                return !$.trim(this.$processArea.html());
            },
            setProcessName: function () {
                var $processNodes = this.$processArea.find('.process-node');
                if ($processNodes.size()) {
                    if (this.isSaveAs) {
                        this.$processName.val(this.$processTitle.html() + '-copy');
                    }else{
                        this.$processName.val(this.untitled);
                    }
                    this.$processNameWindow.addClass('visible');
                    this.$mask.addClass('visible');
                    setTimeout(function () {
                        process.$processName.focus().select();
                    },module.trsDuration);
                }else{
                    alert(this.noProcessData);
                }
            },
            resetProcessArea: function () {
                this.$processArea.empty();
                this.jsPlumbInstance.reset();
                // this.jsPlumbInstance.deleteEveryEndpoint();
                // this.jsPlumbInstance.detachEveryConnection();
            },
            resetConfirm: function () {
                if (confirm(process.resetConfirmTips)) {
                    return true
                } else {
                    return false
                }
            },
            newProcess: function () {
                if(this.resetConfirm()) {
                    this.resetProcessArea();
                    this.processId = null;
                    this.processName = null;
                    this.$processTitle.html(this.untitled);
                } 
            },
            copyProcess: function () {
                // body...
            },
            delProcess: function (processId) {
                $.ajax({
                    url: 'process/delete',
                    type: module.requestMethod.post,
                    data: { processId: processId },
                    dataType: 'json',
                    traditional: true,
                    success: function (response) {
                        module.processList.load();
                    }
                })
            },
            saveProcess: function (callback) {
                var process = this,
                    nodes = [],
                    endpoints = [],
                    connections = [],
                    newProcessId = 'PROCESS-' + util.guid(),
                    newProcessName = $.trim(process.$processName.val()),
                    processId = process.processId ? process.processId : newProcessId,
                    processName = process.processName ? process.processName : newProcessName,
                    processData = {},
                    stringProcessData = '',
                    $processNodes = process.$processArea.find('.process-node');

                if (process.isSaveAs) {
                    processId = newProcessId;
                    processName = newProcessName;
                }

                $processNodes.each(function (idx, elem) {
                    var elem = $(elem);
                    nodes.push({
                        nodeId : elem.attr('id'),
                        nodeName: elem.data('name'),
                        nodeText: elem.data('name'),
                        iconCls: elem.data('icon'),
                        property: elem.data('prop'),
                        nodeType: elem.data('type'),
                        input: elem.data('input'),
                        output: elem.data('output'),
                        indegree: elem.data('indegree'),
                        cmpWindow: elem.data('cmp-window'),
                        parentType: elem.data('parent-type'),
                        nodePosTop: parseInt(elem.css('top')),
                        nodePosLeft: parseInt(elem.css('left'))
                    });
                });

                $.each(process.jsPlumbInstance.getConnections(), function (idx, connector) {
                    connections.push({
                        targetId: connector.targetId,
                        sourceId: connector.sourceId,
                        connectorId: connector.id,
                        connectorName: connector.id,
                        connectorType: "data"
                    })
                });
                
                processData.nodes = nodes;
                processData.processId = processId;
                processData.processName = processName;
                processData.connections = connections;

                stringProcessData = JSON.stringify(processData);
                // module.log(processData);
                // module.log(stringProcessData);

                $.ajax({
                    url: 'process/save',
                    // url: 'json/save-process.json',
                    type: module.requestMethod.post,
                    dataType: 'json',
                    data: { processData: stringProcessData },
                    beforeSend: function () {
                        module.waiting(module.submitting);
                    },
                    success: function (response) {
                        process.$processTitle.html(processName);
                        process.$processNameWindow.removeClass('visible');
                        process.$mask.removeClass('visible');
                        process.processId = processId;
                        process.processName = processName;
                        process.isSaveAs = false;
                        module.waitingDone();
                        module.processList.load();
                        // alert(response.message)
                        if (callback) {callback()};
                        process.executeAction = false;
                    }
                })
            },
            loadProcess: function (processId) {
                $.ajax({
                    url: 'process/open?processId=' + processId,
                     //url: 'json/process-data-hdfs.json?processId=' + processId,
                    dataType: 'json',
                    cache: false,
                    beforeSend: function () {
                        module.waiting(module.loading);
                    },
                    success: function (response) {
                        process.resetProcessArea();
                        process.processId = response.processId;
                        process.processName = response.processName;
                        process.$processTitle.html(response.processName);

                        for (var i = 0; i < response.nodes.length; i++) {
                            var node = response.nodes[i],
                                nodeType = node.nodeType,
                                nodeText = node.nodeText,
                                property = node.property || {},
                                db_name = property.db_name,
                                dt_name = property.dt_name;

                            process.createProcessNode(node.nodeId, {
                                top: node.nodePosTop,
                                left: node.nodePosLeft,
                                iconCls: node.iconCls,
                                cmpType: nodeType,
                                nodeText: nodeText || nodeType,
                                indegree: node.indegree,
                                cmpWindow: node.cmpWindow,
                                parentType: node.parentType,
                                prop: property,
                                input: node.input,
                                output: node.output
                            });

                            process.jsPlumbInstance.revalidate(node.nodeId);

                            if (db_name && dt_name) {
                                var $cmpWindow = $('#window-'+nodeType);
                                module.getTables({
                                    db: db_name,
                                    tablesSelector: $cmpWindow.find('[name=dt_name]')
                                })
                            }
                        }

                        for (var i = 0; i < response.connections.length; i++) {
                            var connector = response.connections[i];
                            process.jsPlumbInstance.connect({
                                source: connector.sourceId,
                                target: connector.targetId
                            })
                        }
                        module.waitingDone();

                    }
                })
            }
        }
    })();

    // init module
    process.init();

    // export module
    module.process = process;

})(window.app || {});

/*!
 * processList 模块
 * @namespace app.processList
 * @dependence jQuery|app
 * @param  {Object} module
 * @return {Object} app.processList
 */
;(function (module) {
    var processList = (function () {
        return {
            init: function () {
                this.operateMode = false;
                this.cacheElements();
                this.bindEvents();
            },
            cacheElements: function () {
                this.$processListPanel = $('#process-list-panel');
                this.$processList = this.$processListPanel.find('#process-list');
            },
            bindEvents: function () {
                this.$processListPanel.on('click', module.stopPropagation);
                this.$processListPanel.on('keyup', module.stopPropagation);
                this.$processListPanel.on('keyup', '.filter', this.filter);
                this.$processListPanel.on('click', '.remove-btn', this.removeCheckedItem);
                this.$processListPanel.on('click', '.cancel-btn', $.proxy(this.cancelOperating,this));
                this.$processListPanel.on('click', '.refresh-btn', $.proxy(this.load,this));
                this.$processListPanel.on('click', '.operating-btn', $.proxy(this.operating,this));
                this.$processListPanel.on('click', '.toggle-check', this.toggleCheck);
                this.$processListPanel.on('click', '.process-item', this.itemClick);
                this.$processListPanel.on('click', '.item-checkbox', this.itemCheckboxClick);
                this.$processListPanel.on('click', '.remove-item-btn', this.removeCurItem);
                // this.$processListPanel.on('mouseleave', $.proxy(this.hide,this));
                $(document).on('click', $.proxy(this.hide,this));
            },
            isEmpty: function () {
                return !this.$processList.find('.process-item').size();
            },
            show: function () {
                var $panel = this.$processListPanel;
                $panel.addClass('shown');
                $panel.find('.filter').focus();
                if (this.isEmpty()) {
                    this.load();
                }
            },
            hide: function () {
                this.$processListPanel.removeClass('shown');
            },
            operating: function () {
                this.operateMode = true;
                this.$processListPanel.addClass('operating');
            },
            cancelOperating: function () {
                this.operateMode = false;
                this.$processListPanel.removeClass('operating');
            },
            filter: function (e) {
                var $me = $(this),
                keywords = $me.val(),
                $processItems = $me.closest('.process-list-panel').find('.process-item'),
                i = 0,
                len = $processItems.size();

                $processItems.hide();
                for (; i < len; i++) {
                    var $processItem = $processItems.eq(i);
                    util.match(keywords,$processItem.find('.process-name').text()) && 
                    $processItem.show();
                }
            },
            toggleCheck: function (e) {
                var $me = $(this),
                    propName = 'checked',
                    $processListPanel = $me.closest('#process-list-panel'),
                    $checkbox = $processListPanel.find('.item-checkbox');

                if ($me.prop(propName) === true) {
                    $checkbox.prop(propName,true)
                } else {
                    $checkbox.prop(propName,false)
                }
            },
            itemCheckboxClick: function (e) {
                var $me = $(this),
                    propName = 'checked',
                    $processListPanel = $me.closest('#process-list-panel'),
                    $checked = $processListPanel.find('.item-checkbox:checked'),
                    $checkbox = $processListPanel.find('.item-checkbox'),
                    $toggleCheck = $processListPanel.find('.toggle-check');

                if ($checked.size() === $checkbox.size()) {
                    $toggleCheck.prop(propName,true);
                }
                if (!$me.prop(propName)) {
                    $toggleCheck.prop(propName,false);
                }
                e.stopPropagation();
            },
            removeCurItem: function (e) {
                var $me = $(this),
                    processId = $me.data('process-id');
                    if (confirm(module.delConfirm)) {
                        module.process.delProcess(processId);
                    }
                    e.stopPropagation();
            },
            removeCheckedItem: function (e) {
                var processId = [],
                    $me = $(this),
                    $processListPanel = $me.closest('#process-list-panel'),
                    $checked = $processListPanel.find('.item-checkbox:checked');
                    $toggleCheck = $processListPanel.find('.toggle-check');
                if ($checked.size()) {
                    for (var i = 0; i < $checked.size(); i++) {
                        processId.push($($checked[i]).data('process-id'))
                    }
                    if (confirm(module.delConfirm)) {
                        module.process.delProcess(processId);
                        $toggleCheck.prop('checked',false)
                    }
                }
            },
            itemClick: function (e) {
                var process = module.process;
                if (!module.processList.operateMode) {
                    var $me = $(this),
                    processId = $me.data('process-id');
                    if (processId === process.processId) {
                        alert(module.hasLoaded);
                        return;
                    }else{
                        if(process.resetConfirm()){
                            process.loadProcess(processId);
                        }
                    }
                }
            },
            load: function () {
                var $processList = this.$processList;
                $.ajax({
                    url: 'process/list',
                    //url: 'json/process-list.json',
                    dataType: 'json',
                    cache: false,
                    beforeSend: function () {
                        $processList.html('<li>'+module.loading+'</li>');
                    },
                    success: function (response) {
                        var rows = response.rows,
                            processList = '';
                            emptyProcessList = '<li class="empty-msg">'+ module.noData +'</li>',
                            errorProcessList = '<li class="error-msg">'+ response.message +'</li>',
                            templateProcessList
                            = '<li class="process-item" data-process-id="${processId}">'
                            +     '<a hidefocus class="pos-rel" href="javascript:;">'
                            +         '<p class="process-name ellipsis" title="${processName}">${processName}</p>'
                            +         '<span class="pos-abs remove-item-btn" data-process-id="${processId}">删除</span>'
                            +         '<input class="pos-abs item-checkbox" data-process-id="${processId}" type="checkbox">'
                            +     '</a>'
                            + '</li>';

                        if (response.success) {
                            if ( rows && rows.length && (typeof rows !== 'string') ) {
                                $.template('html', templateProcessList);
                                processList = $.tmpl('html', response.rows)
                                $processList.html(processList);
                            }else{
                                $processList.html(emptyProcessList);
                            }
                        }else{
                            $processList.html(errorProcessList);
                        }
                    }
                })
            }
        }
    })();

    // init module
    processList.init();

    // export module
    module.processList = processList;

})(window.app || {});

/*!
 * topbar 模块
 * @namespace app.topbar
 * @dependence jQuery|app
 * @param  {Object} module
 * @return {Object} app.topbar
 */
;(function (module) {
    var topbar = (function () {
        return {
            init: function () {
                this.cacheElements();
                this.bindEvents();
            },
            cacheElements: function () {
                this.$topbar = $('#topbar');
            },
            bindEvents: function () {
                var process = module.process;
                var processList = module.processList;
                this.$topbar.on('click', '#help', function (e) {});
                this.$topbar.on('click', '#new-process', $.proxy(process.newProcess,process));
                this.$topbar.on('click', '#save-process', this.saveLinkClick);
                this.$topbar.on('click', '#save-process-as', this.saveAsLinkClick);
                this.$topbar.on('click', '#open-process-list', $.proxy(processList.show,processList));
                this.$topbar.on('click', '#open-process-list', module.stopPropagation);
            },
            saveLinkClick: function () {
                var process = module.process;
                process.isSaveAs = false;
                if (process.isSavedProcess()) {
                    process.saveProcess();
                } else {
                    process.setProcessName();
                }
            },
            saveAsLinkClick: function () {
                var process = module.process;
                process.isSaveAs = true;
                process.setProcessName();
            }
        }
    })();

    // init module
    topbar.init();

    // export module
    module.topbar = topbar;

})(window.app || {});

// notice that create a jsPlumb instance after jsPlumb.ready
jsPlumb.ready(function() {
    app.process.jsPlumbInstance = jsPlumb.importDefaults({
        Endpoint : ["Dot", {radius:2}],
        HoverPaintStyle : {strokeStyle:"#00D88E", lineWidth:2 },
        ConnectionOverlays : [
            [ "Arrow", {
                location:1,
                id:"arrow",
                length:14,
                foldback:0.8
            } ]
            // ,
            // [ "Label", { label:"FOO", id:"label", cssClass:"aLabel" }]
        ],
        Container: app.process.$processArea[0]
    });
    jsPlumb.fire("jsPlumbDemoLoaded", app.process.jsPlumbInstance);
});
