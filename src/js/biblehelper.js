var __DEBUG=true;

/*global biblehelper, log, Router */

//---------------------------------------
//GOOGLE ANALYTICS
//---------------------------------------

/*jshint ignore:start */
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-15745482-3', 'auto');
ga('send', 'pageview');
var adjustBounceRate = setInterval(function() {ga('send', 'event', 'top', 'top', 'top');},30000);
setTimeout(function(){clearInterval(adjustBounceRate);},1800000);
/*jshint ignore:end */

//---------------------------------------
// COMPATABILITY SCRIPTS
//---------------------------------------

//compatability scripts IE sucks
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
if ( !Array.prototype.forEach ) {
  Array.prototype.forEach = function(fn, scope) {
    for(var i = 0, len = this.length; i < len; ++i) {
      if (i in this) {
        fn.call(scope, this[i], i, this);
      }
    }
  };
}

//---------------------------------------

//create a bind() function for scope passing
Function.prototype.bind = Function.prototype.bind || function() {
    var fn = this;
    var args = Array.prototype.slice.call(arguments);
    var object = args.shift();

    return function() {
        return fn.apply(object, args.concat(Array.prototype.slice.call(arguments)));
    };
};

//---------------------------------------

Array.prototype.has = function(v) {
    return $.inArray(v, this) > -1;
};

//---------------------------------------

// omit values from array
// if 'a' is not specified, it is assumed all blank/null/undefined values
Array.prototype.omit = function(a) {
    var b = [];

    a = a || ['', null, undefined];
    a = $.isArray(a) ? a : [a];

    for (var i = 0; i < this.length; i++) {
        if (! a.has(this[i])) {
            b.push(this[i]);
        }
    }

    return b;
};

//---------------------------------------

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);

    this.length = from < 0 ? this.length + from : from;

    return this.push.apply(this, rest);
};

//---------------------------------------

// format with commas
Number.prototype.format = function(eu) {
    return this.toString().format(eu);
};

//---------------------------------------

Number.prototype.valueIfZero = function(v) {
    var n = this.valueOf();
    return n === 0 ? (v === undefined ? '' : v) : n;
};

//---------------------------------------

// replace string placeholders with values
// 'this is a value of {1}'.apply(100) ===> 'this is a value of 100'
String.prototype.apply = function() {
    var a = arguments;

    return this.replace(/\{(\d+)\}/g, function(m, i) {
        return a[i - 1];
    });
};

//---------------------------------------

// split a string into equal (PARTS) sized chunks (on word boundaries)
// and join the chunks together with glue.
String.prototype.chop = function(parts, glue) {
    var a = this.split(' ');
    var n = Math.ceil(a.length / parts || 1);
    var c = [];

    while (a.length) {
        c.push(a.splice(0, n).join(' '));
    }

    return c.join(glue || '<br/>');
};

//---------------------------------------

// format with commas
String.prototype.format = function(eu) {
    var a = this.split('.'); // split on radix
    var r = /(\d+)(\d{3})/;
    var s = a[0]; // integral portion

    while (r.test(s)) {
        s = s.replace(r, '$1,$2');
    }

    return (eu ? s.replace(/,/g, '.') : s) + (a.length > 1 ? (eu ? ',' : '.') + a[1] : '');
};

//---------------------------------------

// test if the string is in the provided list
String.prototype.includes = function(a) {
    var s = this.toString();

    for (var i = 0; i < a.length; i++) {
        if (s === a[i]){
            return true;
        }
    }

    return false;
};

//---------------------------------------

String.prototype.reverse = function() {
    return this.split('').reverse().join('');
};

//---------------------------------------

String.prototype.trim = function() {
    return $.trim(this);
};

//---------------------------------------

String.prototype.valueIfZero = function(v) {
    var s = this.toString();
    return s === '0' ? (v === undefined ? '' : v) : s;
};

//---------------------------------------

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
      if ( this === undefined || this === null ) {
        throw new TypeError( '"this" is null or not defined' );
      }

      var length = this.length >>> 0; // Hack to convert object.length to a UInt32

      fromIndex = +fromIndex || 0;

      if (Math.abs(fromIndex) === Infinity) {
        fromIndex = 0;
      }

      if (fromIndex < 0) {
        fromIndex += length;
        if (fromIndex < 0) {
          fromIndex = 0;
        }
      }

      for (;fromIndex < length; fromIndex++) {
        if (this[fromIndex] === searchElement) {
          return fromIndex;
        }
      }

      return -1;
    };
  }

//---------------------------------------

// Handle browsers that do console incorrectly (IE9 and below)
// http://stackoverflow.com/a/5539378/7913
if(window.console){
    if (Function.prototype.bind && console && typeof console.log === 'object'){
        ['log','info','warn','error','assert','dir','clear','profile','profileEnd'].forEach(function (method) {
            console[method] = this.bind(console[method], console);
        }, Function.prototype.call);
    }
}

//---------------------------------------

// http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console){
      if(__DEBUG){
          console.log( Array.prototype.slice.call(arguments));
      }
  }
};

//---------------------------------------
// CONSTANTS SCRIPTS
//---------------------------------------

(function(){
  var constants = {};
  window.self.SETCONST = function(name,value) {
      if (typeof name !== 'string') { throw new Error('constant name is not a string'); }
      if (!value) { throw new Error(' no value supplied for constant ' + name); }
      else if ((name in constants) ) { throw new Error('constant ' + name + ' is already defined'); }
      else {
          constants[name] = value;
          return true;
    }
  };
  window.self.CONST = function(name) {
      if (typeof name !== 'string') { throw new Error('constant name is not a string'); }
      if ( name in constants ) { return constants[name]; }
      else { throw new Error('constant ' + name + ' has not been defined'); }
  };
}());

//---------------------------------------
// GLOBAL UTIL FUNCTIONS
//---------------------------------------

function isNotNullOrEmpty(obj){
    if(typeof obj !== 'undefined'){
        if(obj !== null && obj !== undefined && obj!==''){
            if(Object.size(obj)>0){
                return true;
            }
            else if(obj.length>0){
                return true;
            }
        }
    }
    return false;
}

//---------------------------------------

function jsonPretty(obj){
    if(isNotNullOrEmpty(obj)){
        try{
            return JSON.stringify(obj, null, 4);
        }
        catch(e){
            log('jsonPretty: exception parsing obj ' + e);
        }
    }
    log('jsonPretty: invalid obj');
    return '';
}

//---------------------------------------

Object.size = function(obj){
    var size = 0, key;
    for(key in obj){
        if(obj.hasOwnProperty(key)){
            size++;
        }
    }
    return size;
};

//---------------------------------------

function toTheTop(){
    window.scrollTo(0, 0);
}

//---------------------------------------

function extractKey(input, idx){
    log('extracting: ' + input);
    if(isNotNullOrEmpty(input)){
        var sp= input.split('-');
        if(idx){
            log('extracted: ' + sp[idx]);
            return sp[idx];
        }
        else{
            log('extracted: ' + sp[1]);
            return sp[1];
        }
    }
    return '';
}

//---------------------------------------

function removeFromList(arr, item) {
    if(isNotNullOrEmpty(arr)){
        for(var i = arr.length; i--;) {
            if(arr[i] === item) {
                arr.splice(i, 1);
            }
        }
    }
    return arr;
}

//---------------------------------------

function expandToList(input, delim, excludeTerm){
    var list=[];
    var delimiter=',';
    var excludes='';
    var hasElements=false;

    if(isNotNullOrEmpty(delim)){
        delimiter = delim;
    }

    if(isNotNullOrEmpty(excludeTerm)){
        excludes = excludeTerm;
    }

    if(isNotNullOrEmpty(input)){
        var sp;
        try{
            sp=JSON.parse(input);
        }
        catch(e){
            log('not JSON parsable');
            //not json parsable
            sp=input;
        }

        if(sp instanceof Array){
            log('already an array');
        }
        else{
            //attempt to split the 
            sp=input.split(delimiter);
        }

        //now check how many splits
        if(sp.length === 1){
            if(sp[0]===excludes){
                return '';
            }
            else{
                list.push(sp[0]);
                hasElements=true;
            }
        }
        else if(sp.length >1){
            for(var i=0; i<sp.length; i++){
                var pTemp=sp[i];
                if(isNotNullOrEmpty(pTemp)){
                    list.push(pTemp);
                    hasElements = true;
                }
            }
        }
        else{
            log('error condition');
        }
    }

    if(hasElements){
        return list;
    }
    else{
        //return empty if no input
        return '';
    }
}

//---------------------------------------

function compressToDelimited(arr, delim){
    var result='';
    var delimiter=',';
    if(!isNotNullOrEmpty(delim)){
        delimiter = delim;
    }
    if(isNotNullOrEmpty(arr)){
        var first = true;
        for(var f in arr){
            if(!isNaN(f)){
                var txt=arr[f];
                if(isNotNullOrEmpty(txt)){
                    if(first){
                        first = false;
                    }
                    else{
                        result=''.concat(result,delimiter);
                    }
                    result=''.concat(result,txt);
                }
            }
        }
    }
    return result;
}

//---------------------------------------

function cleanText(input){
    var ct='';
    if(isNotNullOrEmpty(input)){
        ct=input;
    }
    return ct;
}

//---------------------------------------
//BibleHelper Lib
//---------------------------------------

(function (biblehelper, $, undefined){

    var _isErrorState = false;
    var _router;
    var _plan=[];

    biblehelper.route=function(hash){
        _router.setRoute(hash);
    };

    //---------------------------------------

    //reverse the hash on top
    biblehelper.readExecuteHash=function(day,version){
        //execute the bible calls
        log('readExecute: ' + day + ' ' + version);
        biblehelper.selectDay(day,version);
    };

    //---------------------------------------    

    biblehelper.buildHash=function(day,version,useHash){

        var routeTemplate='/#/{1}/{2}';
        var routeTemplate2='/{1}/{2}';

        var result='';

        //convert to number
        var dNumber=Number(day);
        var vNumber=Number(version);

        var dClean=1;
        if(isNotNullOrEmpty(''+day) && dNumber>0 && dNumber<=365){
            dClean=day;
        }

        var vClean=1;
        if(isNotNullOrEmpty(version) && vNumber>0 && vNumber <3){
            vClean=version;
        }

        if(useHash){
            result=routeTemplate.apply(dClean,vClean);
        }
        else{
            result=routeTemplate2.apply(dClean,vClean);
        }
        

        return result;
    };


    //---------------------------------------
    // ROUTING
    //---------------------------------------

    var routes={
            '/:day/:version':biblehelper.readExecuteHash
    };

    //---------------------------------------

    biblehelper.initRoute = function (){
        _router= new Router(routes).configure({strict:false});
        _router.init();
    };

    //---------------------------------------   

    biblehelper.route = function(hash){
        _router.setRoute(hash);
    };

    //---------------------------------------    

    biblehelper.constructParams = function(query, version){
        var params={};
        params.query=query;
        params.version=version;
        return params;
    };

    //---------------------------------------

    biblehelper.performSearch = function(view, params){

        var actionUrl='';
        var viewElement='';

        if(view===2){
            actionUrl='/BiblesOrgServiceProvider.php';
            viewElement=$('#meditation-content');
        }
        else{
            actionUrl='/BiblesOrgServiceProvider.php';
            viewElement=$('#reading-content');
        }

        var jqxhr = $.ajax({
            url: actionUrl,
            cache: false,
            data: params
        })
        .done(function(data,txtStatus,jqXHR) {
            if(jqXHR.status===200){
                viewElement.html(data);
            }
            else{
                log(data);
            }
        })
        .fail(function(data,txtStatus,jqXHR){
            log('fail');
        })
        .always(function(data,txtStatus,jqXHR){
            manageResultCallback();
        });
    };

    //---------------------------------------

    function manageResultCallback(){

    }

    //---------------------------------------

    biblehelper.buildPlan = function(callbackfn){
        var actionUrl='js/plan_tbp.json';
        var jqxhr = $.ajax({
            url: actionUrl,
            cache: false
        })
        .done(function(data,txtStatus,jqXHR) {
            if(jqXHR.status===200){
                var parseObject = JSON.parse(data);
                if(parseObject.length > 0){
                    _plan=[];
                    for (var i=0; i<parseObject.length; i++){
                        var dayObj=parseObject[i];
                        if(isNotNullOrEmpty(dayObj)){
                            var key=''+dayObj.day;
                            _plan[key]=dayObj;
                        }
                    }

                    buildDayLinks(_plan);

                    log('build the plan with: '+_plan.length);
                }
                else{
                    log('no plan results');
                }
            }
            else{
                log(data);
            }
        })
        .fail(function(data,txtStatus,jqXHR){
            log('fail');
        })
        .always(function(data,txtStatus,jqXHR){
            callbackfn();
        });
    };

    //---------------------------------------

    biblehelper.selectDay=function(day, version){
        if(_plan.length < 0){
            biblehelper.buildPlan(biblehelper.selectDay(day,version));
        }
        else{
            var currentDay=_plan[day];

            buildDayLinks(_plan, currentDay);

            if(isNotNullOrEmpty(currentDay)){
                var bContent = buildBookmarkContent(''+currentDay.day, ''+currentDay.chapter, currentDay.title, currentDay.read, currentDay.meditation, currentDay.video, currentDay.videoUrl);
                if(isNotNullOrEmpty(bContent)){
                    $('#bookmark-content').html(bContent.panel);
                    $('#today_plan-list').html(bContent.list);
                }

                var rParam=biblehelper.constructParams(currentDay.read, version);
                var mParam=biblehelper.constructParams(currentDay.meditation, version);
                biblehelper.performSearch(1, rParam);
                biblehelper.performSearch(2, mParam);

                $('#video-content').html(buildVideoPanel(currentDay.video, currentDay.videoUrl));

                //session tracking
                biblehelper.setCurrentParams(day,version,currentDay.read, currentDay.meditation, currentDay.video);
                buildDisplayCurrentLink(day,version);
                displayCurrentVersion(version);
                this.activateRead();
            }
        }
    };

    //---------------------------------------

    biblehelper.getCurrentParams=function(){
        var currDay=$('#current-day').val();
        var currVersion=$('#current-version').val();
        var currRead=$('#current-read').val();
        var currMeditate=$('#current-meditate').val();
        var currVideo=$('#current-video').val();

        var currParam={};
        currParam.day=currDay;
        currParam.version=currVersion;
        currParam.read=currRead;
        currParam.pray=currMeditate;
        currParam.video=currVideo;

        return currParam;
    };

    //---------------------------------------

    biblehelper.setCurrentParams=function(day, version, read, pray, video){
        if(isNotNullOrEmpty(day)){
            $('#current-day').val(day);
        }

        if(isNotNullOrEmpty(version)){
            $('#current-version').val(version);
        }

        if(isNotNullOrEmpty(read)){
            $('#current-read').val(read);
        }

        if(isNotNullOrEmpty(pray)){
            $('#current-meditate').val(pray);
        }

        $('#current-video').val(video);

    };
    
    //---------------------------------------

    function buildDayLinks(plan){

        var listItems='';
        var listTemplate='<li><a href=\"#\" id=\"day-{2}\" class=\"btn-day">{3}</a></li>';

        if(plan.length > 0){
            for(var i=0; i<plan.length; i++){
                var tPlan = plan[i];
                if(tPlan){

                    var zeroDigit=''+tPlan.day;
                    if(tPlan.day < 10){
                        zeroDigit='0'+tPlan.day;
                    }

                    var st =listTemplate.apply('', tPlan.day, zeroDigit);
                    listItems+=st;
                }
            }
        }

        if(listItems){
            $('#day-select-menu').html(listItems);
        }
    }
    
    //---------------------------------------

    function buildBookmarkContent(day,chapter,title,read,meditate,video,videoUrl){
        var results={};

        var cTemplate='<div class=\"col-md-12\"><a href=\"http://thebibleproject.tumblr.com/readscripture\"><img src=\"gfxs/bibleIcons/tbp{1}.png\" class=\"img img-responsive\"></a><h4><small>Chapter {2}</small><br/><strong><span class=\"text-uppercase\">{3}</span></strong></h4><hr></div><div class=\"col-md-12\"><h4>{4} Day <strong>{5}</strong> of 365 {6}</h4><ul>{7}</ul></div>';
        var rTemplate='<li class=\"text-capitalize\">{1}{2}</li><li class=\"text-capitalize\">{3}{4}</li>{5}';
        var vTemplate='<li class=\"text-capitalize\">{1}<a href=\"{2}\">{3}</a></li>';
        
        var cContent='';
        var listContent='';

        if(isNotNullOrEmpty(day)){
            log(day);
            var vContent='';
            var vlContent='';
            if(isNotNullOrEmpty(video) && isNotNullOrEmpty(videoUrl)){
                vContent = vTemplate.apply('<strong>Watch</strong> ',videoUrl,video);
                vlContent = vTemplate.apply('','#\" class=\"btn-video','<i class=\"fa fa-film\"></i> '+video);
            }

            var rContent='';
            var rlContent='';
            if(isNotNullOrEmpty(read) || isNotNullOrEmpty(meditate)){
                rContent=rTemplate.apply('<strong>Read</strong> ', read, '<strong>Meditate</strong> ', meditate, vContent);
                rlContent=rTemplate.apply('<a href=\"#\" class=\"btn-read\"><i class=\"fa fa-book\"></i> ', read +'</a>', '<a href=\"#\" class=\"btn-meditate\"><i class=\"fa fa-puzzle-piece\"></i> ', meditate, vlContent);
            }

            var cP=biblehelper.getCurrentParams();

            cContent=cTemplate.apply(chapter,chapter,title,buildPreviousLink(day, cP.version),day,buildNextLink(day, cP.version), rContent);
            listContent+=rlContent;

            results.panel=cContent;
            results.list=listContent;
        }

        return results;
    }

    //---------------------------------------

    function buildNextLink(day, version){
        var lText='';
        var hash='#';
        var lTemplate='<a href=\"{1}\" {2}><span class="glyphicon glyphicon-chevron-right"></span></a>';
        var dNumber=Number(day);
        if(dNumber<365 && dNumber>=0){
            dNumber=dNumber+1;
            hash=biblehelper.buildHash(dNumber,version, true);
            lText=lTemplate.apply(hash,'');
        }
        else{
            lText='<span class="text-muted glyphicon glyphicon-chevron-right"></span>';
        }
        return lText;
    }

    //---------------------------------------

    function buildPreviousLink(day,version){
        var lText='';
        var hash='#';
        var lTemplate='<a href=\"{1}\" {2}><span class="glyphicon glyphicon-chevron-left"></span></a>';
        var dNumber=Number(day);
        if(dNumber>1 && dNumber<365){
            dNumber=dNumber-1;
            hash=biblehelper.buildHash(dNumber,version, true);
            lText=lTemplate.apply(hash,'');
        }
        else{
            lText='<span class="text-muted glyphicon glyphicon-chevron-left"></span>';
        }
        return lText;
    }

    //---------------------------------------

    function buildVideoPanel(video, videoUrl){
        var vTemplate='<h1>{1}</h1><hr><br/><iframe width=\"560\" height=\"315\" src="{2}" frameborder=\"0\" allowfullscreen></iframe>';
        var vContent='<h1>Watch</h1><hr><br/><p>No video today</p>';
        if(isNotNullOrEmpty(video) && isNotNullOrEmpty(videoUrl)){
                vContent = vTemplate.apply(video,videoUrl);
        }

        return vContent;
    }

    //---------------------------------------

    function buildDisplayCurrentLink(day,version){
        var elem=$('#display-current-hash');
        var dStr='Day {1}';
        var displayStr = dStr.apply(day);
        elem.html(displayStr);
        elem.attr('href',biblehelper.buildHash(day,version,true));

        $('#day-btn-group').html(displayStr);
    }

    //---------------------------------------

    function displayCurrentVersion(version){

        var needleTemplate='version-{1}';
        var needle=needleTemplate.apply(version);
        var currentVersionStr='';
        //clear
        $('.btn-version').each(function(index){
              var v = $(this);
              
              if(v.hasClass('active')){
                  v.removeClass('active');
              }

              if(v.attr('id')===needle){
                  currentVersionStr=v.html();
                  v.addClass('active');
              }
          });

          $('#display-current-version').html(currentVersionStr);
          $('#version-btn-group').html(currentVersionStr);
    }

    biblehelper.activateRead = function(){
        $('#main-tabs a[href="#reading"]').tab('show');
        $('#today_plan-span').html(biblehelper.getCurrentParams().read);
    };

    biblehelper.activateMeditate=function(){
        $('#main-tabs a[href="#meditation"]').tab('show');
        $('#today_plan-span').html(biblehelper.getCurrentParams().pray);
    };

    biblehelper.activateVideo=function(){
        $('#main-tabs a[href="#video"]').tab('show');
        $('#today_plan-span').html(biblehelper.getCurrentParams().video);
    };

    //---------------------------------------
    // ALERT CLASSES
    //---------------------------------------

    biblehelper.showStatusAlert=function(errorMsg, errorTitle, alertType){
        if(isNotNullOrEmpty(errorMsg)){
            var statusAlert = $('#status-alert');
            var template='<p><strong>{1}</strong> {2}</p>';

            //clear it out
            statusAlert.removeClass();
            //reinit
            statusAlert.addClass('alert');

            if(isNotNullOrEmpty(alertType)){
                switch(alertType){
                case 1:
                    statusAlert.addClass('alert-info');
                break;
                case 2:
                    statusAlert.addClass('alert-warning');
                break;
                case 0:
                    statusAlert.addClass('alert-success');
                break;
                case 3:
                    /* falls through */
                default:
                    statusAlert.addClass('alert-danger');
                }
            }
            else{
                //default to error
                statusAlert.addClass('alert-danger');
            }

            statusAlert.html(template.apply(errorTitle,errorMsg));

            statusAlert.show();
        }
    };

    //---------------------------------------

    biblehelper.toggleSearchAlert=function(enable){
        $('#biblehelper-search-alert').toggle(enable);
    };

}(window.biblehelper = window.biblehelper || {}, $));

//---------------------------------------
// DOCUMENT READY
//---------------------------------------

$(document).ready(function() {
    
    biblehelper.buildPlan(biblehelper.initRoute);

      //---------------------------------------

      $(document).on('click', '.btn-version', function(e){
         var versionAgg = $(this).attr('id');
         var versionSelected = extractKey(versionAgg, 1);
         if(versionSelected){
           var params=biblehelper.getCurrentParams();
           var nHash=biblehelper.buildHash(params.day, versionSelected, false);
           biblehelper.route(nHash);
         }

         //close the dropdown
         $('#version-select').dropdown('toggle');

         return false;
      });

      //---------------------------------------

      $(document).on('click', '.btn-day', function(e){
         var dayAgg = $(this).attr('id');
         var daySelected = extractKey(dayAgg, 1);
         if(daySelected){
           var params=biblehelper.getCurrentParams();
           var nHash=biblehelper.buildHash(daySelected, params.version, false);
           biblehelper.route(nHash);
         }

         //close the dropdown
         $('#day-select').dropdown('toggle');

         return false;
      });

      //---------------------------------------

      $(document).on('click', '.btn-read', function(e){
          biblehelper.activateRead();
          return false;
      });

      //---------------------------------------

      $(document).on('click', '.btn-meditate', function(e){
          biblehelper.activateMeditate();
          return false;
      });

      //---------------------------------------

      $(document).on('click', '.btn-video', function(e){
          biblehelper.activateVideo();
          return false;
      });

}); //end doc ready

//---------------------------------------
/*
 * IE Hacks from Bootstrap
 */

if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
    var msViewportStyle = document.createElement('style');
    msViewportStyle.appendChild(
            document.createTextNode('@-ms-viewport{width:auto!important}')
    );
    document.getElementsByTagName('head')[0].appendChild(msViewportStyle);
}

//---------------------------------------
