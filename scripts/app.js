oraclize = new Object();


jQuery(document).ready(function(){
  document.errorn = 0;
  window.onerror = function(msg, url, line){
      document.errorn++;
      if (document.errorn > 5) return;
      else {
          var randint = parseInt(Math.pow(Math.random() * 99999, 3));
          $.ajax({ url: "/_errorlog_js/"+randint.toString(16), type: "PUT", data: JSON.stringify({ "msg": msg, "url": url, "line": line, "timestamp": new Date().getTime(), "navigator": { "userAgent": navigator.userAgent, "platform": navigator.platform } }) });
      }
  };
});


function secure_escape(str){
  out = "";
  for (i=0; i<str.length; i++){
    if (str[i] == " ") str[i] = "";
    out += "<span>"+str[i]+"</span>";
  }
  return out;
}



checkops_symbols = [{"extended": "check_value", "short": "="}, {"extended": "!check_value", "short": "&ne;"}, {"extended": "!check_value", "short": "≠"}, {"extended": "contains", "short": "&sup;"}, {"extended": "contains", "short": "⊃"}, {"extended": "!contains", "short": "&nsup;"}, {"extended": "!contains", "short": "⊅"}, {"extended": "regex_match", "short": "~"}, {"extended": "greater_than", "short": "&gt;"}, {"extended": "greater_than", "short": ">"}, {"extended": "less_than", "short": "&lt;"}, {"extended": "less_than", "short": "<"}];
checkop_ext_to_short = function(ext){
  return $(checkops_symbols).filter(function(i){return checkops_symbols[i]['extended'] == ext}).toArray()[0]['short'];   
}

checkop_short_to_ext = function(_short){
  return $(checkops_symbols).filter(function(i){return checkops_symbols[i]['short'] == _short}).toArray()[0]['extended'];
}



function strtruncate(string, maxlength){
   if (typeof maxlength == 'undefined') maxlength = 128; 
   if (string.length > maxlength)
      return string.substring(0, maxlength)+'...';
   else
      return string;
};


function html_escape(html){
  return jQuery(".hiddendiv").text(html).html();
}



////
////
//SORT WITH STRINGIFICATION
 
sortProperties = function(o, fn) {
	var res = {};
	var props = keys(o);
	props = fn ? props.sort(fn): props.sort();
	
	for(var i = 0; i < props.length; i++) {
		res[props[i]] = o[props[i]];
	}
	return res;
};
 
var orderedStrigify = function(o, fn) {
	var val = o;
	var type = types[whatis(o)];
	if(type === 3) {
		val = _objectOrderedStrignify(o, fn);
    	} else if(type === 2) {
    		val = _arrayOrderedStringify(o, fn);
    	} else if(type === 1) {
    		val = '"'+val+'"';
    	}
    
	if(type !== 4)
		return val;
};
 
var _objectOrderedStrignify = function(o, fn) {
	var res = '{';
	var props = keys(o);
	props = fn ? props.sort(fn) : props.sort();
	
	for(var i = 0; i < props.length; i++) {
		var val = orderedStrigify(o[props[i]], fn);
        if(val !== undefined)
        	res += '"'+props[i]+'":'+ val+',';
	}
	var lid = res.lastIndexOf(',');
	if (lid > -1)
		res = res.substring(res, lid);
    return res+'}';
};
 
var _arrayOrderedStringify = function(a, fn) {
	var res = '[';
	for(var i = 0; i < a.length; i++) {
		var val = orderedStrigify(a[i], fn);
        if(val !== undefined)
        	res += ''+ val+',';
	}
	var lid = res.lastIndexOf(',');
	if (lid > -1)
		res = res.substring(res, lid);
	return res+']';
};
 
//SORT WITHOUT STRINGIFICATION
 
var deepSortProperties = function(o, fn) {
	var res = o;
	var type = types[whatis(o)];
	if(type === 3) {
		res = _objectSortProperties(o, fn);
	} else if(type === 2) {
		res = _arraySortProperties(o, fn);
	}
	return res;
};
 
var _objectSortProperties = function(o, fn) {
	var props = keys(o);
	props = fn ? props.sort(fn) : props.sort();
 
	var res = {};	
	for(var i = 0; i < props.length; i++) {
		res[props[i]] = deepSortProperties(o[props[i]]);
	}
	return res;
};
 
var _arraySortProperties = function(a, fn) {
	var res = [];
	for(var i = 0; i < a.length; i++) {
		res[i] = deepSortProperties(a[i]);
	}
	return res;
};
 
 
//HELPER FUNCTIONS
 
var keys = function(o) {
	if(Object.keys)
		return Object.keys(o);
	var res = [];
	for (var i in o) {
		res.push(i);
	}
	return res;
};
 
var types = {
	'integer': 0,
	'float': 0,
	'string': 1,
	'array': 2,
	'object': 3,
	'function': 4,
	'regexp': 5,
	'date': 6,
	'null': 7,
	'undefined': 8,
	'boolean': 9
}
 
var getClass = function(val) {
	return Object.prototype.toString.call(val)
		.match(/^\[object\s(.*)\]$/)[1];
};
 
var whatis = function(val) {
 
	if (val === undefined)
		return 'undefined';
	if (val === null)
		return 'null';
		
	var type = typeof val;
	
	if (type === 'object')
		type = getClass(val).toLowerCase();
	
	if (type === 'number') {
		if (val.toString().indexOf('.') > 0)
			return 'float';
		else
			return 'integer';
	}
	
	return type;
};
////
////


JSON.nativeStringify = JSON.stringify.bind({});
JSON.stringify = orderedStrigify;
