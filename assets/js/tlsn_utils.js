/*
 * Implements base64 decode and encode in browser that
 * it hasn't support of window.btoa and window.atob
 * methods.
 * Based in Nick Galbreath
 * http://code.google.com/p/stringencoders/source/browse/#svn/
 * and Carlo Zottmann jQuery port
 * http://github.com/carlo/jquery-base64
 * Adapted by SeViR in DIGIO
 */

    var _PADCHAR = "=",
      _ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
   
    function _getbyte64( s, i ) { 
      var idx = _ALPHA.indexOf( s.charAt( i ) );
   
      if ( idx === -1 ) {
        throw "Cannot decode base64";
      }
   
      return idx;
    }
   
    function _decode( s ) {
      var pads = 0,
        i,
        b10,
        imax = s.length,
        x = [];
   
      s = String( s );
   
      if ( imax === 0 ) {
        return s;
      }
   
      if ( imax % 4 !== 0 ) {
        throw "Cannot decode base64";
      }
   
      if ( s.charAt( imax - 1 ) === _PADCHAR ) {
        pads = 1;
   
        if ( s.charAt( imax - 2 ) === _PADCHAR ) {
          pads = 2;
        }
   
        // either way, we want to ignore this last block
        imax -= 4;
      }
   
      for ( i = 0; i < imax; i += 4 ) {
        b10 = ( _getbyte64( s, i ) << 18 ) | ( _getbyte64( s, i + 1 ) << 12 ) | ( _getbyte64( s, i + 2 ) << 6 ) | _getbyte64( s, i + 3 );
        x.push( String.fromCharCode( b10 >> 16, ( b10 >> 8 ) & 0xff, b10 & 0xff ) );
      }
   
      switch ( pads ) {
        case 1:
          b10 = ( _getbyte64( s, i ) << 18 ) | ( _getbyte64( s, i + 1 ) << 12 ) | ( _getbyte64( s, i + 2 ) << 6 );
          x.push( String.fromCharCode( b10 >> 16, ( b10 >> 8 ) & 0xff ) );
          break;
   
        case 2:
          b10 = ( _getbyte64( s, i ) << 18) | ( _getbyte64( s, i + 1 ) << 12 );
          x.push( String.fromCharCode( b10 >> 16 ) );
          break;
      }
   
      return x.join( "" );
    }
   
    function _getbyte( s, i ) {
      var x = s.charCodeAt( i );
   
      if ( x > 255 ) {
        throw "INVALID_CHARACTER_ERR: DOM Exception 5";
      }
   
      return x;
    }
   
    function _encode( s ) {
      if ( arguments.length !== 1 ) {
        throw "SyntaxError: exactly one argument required";
      }
   
      s = String( s );
   
      var i,
        b10,
        x = [],
        imax = s.length - s.length % 3;
   
      if ( s.length === 0 ) {
        return s;
      }
   
      for ( i = 0; i < imax; i += 3 ) {
        b10 = ( _getbyte( s, i ) << 16 ) | ( _getbyte( s, i + 1 ) << 8 ) | _getbyte( s, i + 2 );
        x.push( _ALPHA.charAt( b10 >> 18 ) );
        x.push( _ALPHA.charAt( ( b10 >> 12 ) & 0x3F ) );
        x.push( _ALPHA.charAt( ( b10 >> 6 ) & 0x3f ) );
        x.push( _ALPHA.charAt( b10 & 0x3f ) );
      }
   
      switch ( s.length - imax ) {
        case 1:
          b10 = _getbyte( s, i ) << 16;
          x.push( _ALPHA.charAt( b10 >> 18 ) + _ALPHA.charAt( ( b10 >> 12 ) & 0x3F ) + _PADCHAR + _PADCHAR );
          break;
   
        case 2:
          b10 = ( _getbyte( s, i ) << 16 ) | ( _getbyte( s, i + 1 ) << 8 );
          x.push( _ALPHA.charAt( b10 >> 18 ) + _ALPHA.charAt( ( b10 >> 12 ) & 0x3F ) + _ALPHA.charAt( ( b10 >> 6 ) & 0x3f ) + _PADCHAR );
          break;
      }
   
      return x.join( "" );
    }

    var btoa = _encode;
    var atob = _decode;




if ((typeof crypto == 'undefined')||(typeof crypto.getRandomValues == 'undefined')){
  crypto = {
    getRandomValues: function(a){
      var res = Array(a.length);
      for (var i=0; i<a.length; i++) res[i] = parseInt(Math.random()*1000%256);
      return res;
    }
  };
}

//js native ArrayBuffer to Array of numbers
function ab2ba(ab){
	var view = new DataView(ab);
	var int_array = [];
	for(var i=0; i < view.byteLength; i++){
		int_array.push(view.getUint8(i));
	}
	return int_array;
}


function ba2ab(ba){
	var ab = new ArrayBuffer(ba.length);
	var dv = new DataView(ab);
	for(var i=0; i < ba.length; i++){
		dv.setUint8(i, ba[i]);
	}
	return ab;
}



function ba2ua(ba){
	var ua = new Uint8Array(ba.length);
	for (var i = 0; i < ba.length; i++) {
		ua[i] = ba[i];
	}
	return ua;
}

function ua2ba(ua){
	var ba = [];
	for (var i = 0; i < ua.byteLength; i++) {
		ba.push(ua[i]);
	}
	return ba;
}

/*CryptoJS only exposes word arrays of ciphertexts which is awkward to use
so we convert word(4byte) array into a 1-byte array*/
function wa2ba(wordArray) {
    var byteArray = [];
    for (var i = 0; i < wordArray.length; ++i) {
        var word = wordArray[i];
        for (var j = 3; j >= 0; --j) {
            byteArray.push((word >> 8 * j) & 0xFF);
        }
    }
    return byteArray;
}

//CryptoJS doesnt accept bytearray input but it does accept a hexstring
function ba2hex(bytearray){
	try{
		var hexstring = '';
		for(var i=0; i<bytearray.length; i++){
			var hexchar = bytearray[i].toString(16);
			if (hexchar.length == 1){
				hexchar = "0"+hexchar;
			}
			hexstring += hexchar;
		}
		return hexstring;
	}
	catch(e){ 
		var place_for_breakpoint = 0;
	}
}


//convert a hex string into byte array
function hex2ba(str){
	var ba = [];
	//pad with a leading 0 if necessary
	if (str.length % 2){
		str = "0"+str;
	}
	for (var i = 0; i < str.length; i += 2) {
		ba.push(parseInt("0x" + str.substr(i, 2)));
	}
	return ba;
}

//Turn a max 4 byte array (big-endian) into an int. 
function ba2int( x ){
	assert(x.length <= 8, "Cannot convert bytearray larger than 8 bytes");
	var retval = 0;
	for (var i=0; i<x.length; i++){
		retval |= x[x.length-1-i] << 8*i;
	}
    return retval;
}


//Turn an int into a bytearray. Optionally left-pad with zeroes
function bi2ba( x, args){
	assert(typeof(x) == "number", "Only can convert numbers");
	var fixed = null;
	if (typeof(args) !== 'undefined'){
		fixed = args.fixed;
	}
    var bytes = [];
    do {
		var onebyte = x & (255);
		x = x>>8;
		bytes = [].concat(onebyte, bytes);
    } while ( x !== 0 );
    var padding = [];
    if (fixed){
		for(var i=0; i < fixed-bytes.length; i++){
			padding = [].concat(padding, 0x00);
		}
	}
    return [].concat(padding,bytes);
}


//converts string to bytearray
function str2ba(str){
	if (typeof(str) !== "string"){
		throw("Only type string is allowed in str2ba");
	}
	ba = [];
	for(var i=0; i<str.length; i++){
		ba.push(str.charCodeAt(i));
	}
	return ba;
}

function ba2str(ba){
	if (typeof(ba) !== "object"){
		throw("Only type object is allowed in ba2str");
	}
	var result = "";
	for (var i = 0; i < ba.length; i++) {
		result += String.fromCharCode(ba[i]);
	}
	return result;	
}


function hmac(key, msg, algo){
	var key_hex = ba2hex(key);
	var msg_hex = ba2hex(msg);
	var key_words = CryptoJS.enc.Hex.parse(key_hex);
	var msg_words = CryptoJS.enc.Hex.parse(msg_hex);
	var hash;
	if (algo === 'md5'){
		hash = CryptoJS.HmacMD5(msg_words, key_words);
		return wa2ba(hash.words);
	}
	else if (algo === 'sha1'){
		hash = CryptoJS.HmacSHA1(msg_words, key_words);
		return wa2ba(hash.words);
	}
}


function sha1(ba){
	var ba_obj = CryptoJS.enc.Hex.parse(ba2hex(ba));
	var hash = CryptoJS.SHA1(ba_obj);
	return wa2ba(hash.words);
}
function sha256(ba){
	var ba_obj = CryptoJS.enc.Hex.parse(ba2hex(ba));
	var hash = CryptoJS.SHA256(ba_obj);
	return wa2ba(hash.words);
}
function md5(ba){
	var ba_obj = CryptoJS.enc.Hex.parse(ba2hex(ba));
	var hash = CryptoJS.MD5(ba_obj);
	return wa2ba(hash.words);
}

//input bytearrays must be of equal length
function xor(a, b){
	assert(a.length === b.length, "length mismatch");
	var c = [];
	for(var i=0; i<a.length; i++){
		c.push(a[i] ^ b[i]);
	}
	return c;
}


function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

function isdefined(obj){
	assert(typeof(obj) !== "undefined", "obj was undefined");
}

//Not in use for now
function log(){
	if (verbose){
		console.log( Array.prototype.slice.call(arguments) );
	}
}
	
	
function getRandom(number, window){
	//window was undefined in this context, so i decided to pass it explicitely
	var a = crypto.getRandomValues(new Uint8Array(number)); //window.crypto.getRandomValues(new Uint8Array(number));
	//convert to normal array
	var b = Array.prototype.slice.call(a);
	return b;
}



function b64encode (aBytes) {
	return btoa(String.fromCharCode.apply(null, aBytes));
}


function b64decode (sBase64, nBlocksSize) {
	return atob(sBase64).split("").map(function(c) {
		return c.charCodeAt(0); });
}

//plaintext must be string
function dechunk_http(http_data){
    //'''Dechunk only if http_data is chunked otherwise return http_data unmodified'''
    http_header = http_data.slice(0, http_data.search('\r\n\r\n')+'\r\n\r\n'.length);
    //#\s* below means any amount of whitespaces
    if (http_header.search(/transfer-encoding:\s*chunked/i) === -1){
		return http_data; //#nothing to dechunk
	}        
    var http_body = http_data.slice(http_header.length);
    
    var dechunked = http_header;
    var cur_offset = 0;
    var chunk_len = -1; //#initialize with a non-zero value
    while (true){  
        var new_offset = http_body.slice(cur_offset).search('\r\n');
        if (new_offset === -1){  //#pre-caution against endless looping
            //#pinterest.com is known to not send the last 0 chunk when HTTP gzip is disabled
            return dechunked;
		}
        var chunk_len_hex = http_body.slice(cur_offset, cur_offset+new_offset);
        var chunk_len = parseInt(chunk_len_hex, 16);
        if (chunk_len === 0){
			 break; //#for properly-formed html we should break here
		}
        cur_offset += new_offset + '\r\n'.length;
        dechunked += http_body.slice(cur_offset, cur_offset+chunk_len);
        cur_offset += chunk_len + '\r\n'.length;
	}  
    return dechunked;
}


function gunzip_http(http_data){
	var http_header = http_data.slice(0, http_data.search('\r\n\r\n') + '\r\n\r\n'.length);
    //#\s* below means any amount of whitespaces
    if (http_header.search(/content-encoding:\s*deflate/i) > -1){
        //#TODO manually resend the request with compression disabled
        throw('Please set gzip_disabled = 1 in tlsnotary.ini and rerun the audit');
	}
	if (http_header.search(/content-encoding:\s*gzip/i) === -1){
		console.log('nothing to gunzip');
        return http_data; //#nothing to gunzip
	}
    var http_body = http_data.slice(http_header.length);
    var ungzipped = http_header;
    if (!http_body){
		//HTTP 304 Not Modified has no body
		return ungzipped;
	}
	var inflated = pako.inflate(http_body);
    ungzipped += ba2str(inflated);
    return ungzipped;
}

function getTime(){
	var today = new Date();
	var time = today.getFullYear()+'-'+("00"+(today.getMonth()+1)).slice(-2)+'-'+("00"+today.getDate()).slice(-2)+'-'+ ("00"+today.getHours()).slice(-2)+'-'+("00"+today.getMinutes()).slice(-2)+'-'+("00"+today.getSeconds()).slice(-2);
	return time;
}
