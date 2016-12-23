// IPFS Gateway list
var ipfs_gateway_list = [
  'https://ipfs.infura.io/ipfs/',
  'http://ipfs-node-1.oraclize.it/ipfs/',
  'http://ipfs.io/ipfs/'
];

// Ethereum node list
var ethereum_node_list = [];

// Public eth node
var ethnode_name_list = {
  'https://mainnet.infura.io/YwngtTceY6FmxDsqpgLf' : {
    'desc': 'Infura - Mainnet',
    'alias':'mainnet'
  },
  'https://eth3.augur.net': {
    'desc':'Augur - Ropsten Testnet',
    'alias':'testnet'
  },
  'https://test-node2929.etherscan.io/': {
    'desc':'Etherscan - Ropsten Testnet',
    'alias':'testnet'
  }
};

var cbAddress = {
  "testnet":"0xdc8f20170c0946accf9627b3eb1513cfd1c0499f",
  "mainnet":"0x26588a9301b0428d95e6fc3a5024fce8bec12d51"
}

var active_ethnode_node,
    current_ethnode_chain;
var normal_start = true;

// hash of the page
var hash_is_set = false;

// Current ethnode chain (default main net)
current_ethnode_chain = 'mainnet';

function startup_tasks(){
setTimeout(function(){
// check if hash is set (in url)
if(hash_is_set==false){
// update oraclize node list
postMessage({ type: 'update_oraclize_node_list', value: ethnode_name_list });

// run function
ethnode_node_update();

// update the select input with the node list
postMessage({ type: 'ethnode_update_box', value: ethereum_node_list });


postMessage({ type: 'hlUpdate', value: ['chart', true] });

postMessage({ type: 'statusUpdate', value: ['tlsn', 0] });

// active ethereum node
active_ethnode_node = random_arr(ethereum_node_list);

console.log('hash set '+hash_is_set);


  current_ethnode_chain = 'mainnet';
  // shuffle the ethnode list
  ethnode_name_list = shuffle(ethnode_name_list);
  // if no hash is set take a node from the mainnet chain
  Object.keys(ethnode_name_list).forEach(function(i) {
    var alias = ethnode_name_list[i]['alias'];
    if(alias=='mainnet'){
      // set a new node
      active_ethnode_node = i;
      return;
    }
  });

  // Active ethnode node
  ethnode_node_req(active_ethnode_node);
  // update the ethnode change
  postMessage({ type: 'ethnode_change', value: getUrlClean(active_ethnode_node) });
}


console.log('Connecting to ethereum node: '+active_ethnode_node);
}, 1750);
}

// update ethereum node list
function ethnode_node_update(){
  ethereum_node_list = [];
  Object.keys(ethnode_name_list).forEach(function(i) {
    ethereum_node_list.push(i);
  });
}

if ((typeof stdLoad == 'undefined')||(stdLoad == false)){
  postMessage({ type: 'depsLoad_update', value: 'Loading web3..' });
  importScripts("/assets/js/web3.min.js");
  postMessage({ type: 'depsLoad_update', value: 'Loading tlsn..' });
  importScripts("/assets/js/oracles.js");
  postMessage({ type: 'depsLoad_update', value: 'Loading certs..' });
  importScripts("/assets/js/rootcertslist.js");
  importScripts("/assets/js/rootcerts.js");
  importScripts("/assets/js/asn1.js");
  postMessage({ type: 'depsLoad_update', value: 'Loading crypto utils..' });
  importScripts("/assets/js/buffer.js");
  importScripts("/assets/js/solidity.js");
  importScripts("/assets/js/multihashes.js");
  importScripts("/scripts/bundle.js");
}

postMessage({ type: 'statusUpdate', value: ['tlsn', 1] });
postMessage({ type: 'statusUpdate', value: ['ethnode', 0] });
postMessage({ type: 'depsLoad_update', value: 'Connecting to ethnode..' });

// Connect to ethereum node
var Web3 = require('web3');
var web3;

// Ethereum error number counter
var ethnode_err_n = 0;

// Function to make new web3 request
function ethnode_node_req(node){
  web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider(node));
}

function checkChain(){
  try {
    var genesis = web3.eth.getBlock(0).hash;
  } catch(e){}

  if(genesis=='0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3') return 'mainnet';
  else if(genesis=='0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d') return 'testnet';
  else return false;
}

function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

// Hexadecimal to string conversion
function hex2a(hexx) {
  var hex = hexx.toString(); //force conversion
  var str = '';
  for (var i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

// function to get a random element from array
function random_arr(arr){
    return arr[Math.floor(Math.random() * arr.length)];
};

// IPFS error number counter
var ipfs_error_n = 1;

// active IPFS gateway
var active_ipfs_gateway;

// Timeout between new IPFS Gateway retry (ms)
var timeout_betw_retry_ipfs = 3000;

// Timeout between new Ethereum node retry (ms)
var timeout_betw_retry_ethnode = 2000;

// Timeout of xhr request (ms)
var timeout_xhr_req = 10000;

active_ipfs_gateway = 'https://ipfs.infura.io/ipfs/';//random_arr(ipfs_gateway_list);

// update the select input with the node list
postMessage({ type: 'ipfs_update_box', value: ipfs_gateway_list });

// update first IPFS change
postMessage({ type: 'ipfs_change_start', value: getUrlClean(active_ipfs_gateway) });

// Change ethnode or ipfs node (choosen by the user)
self.onmessage = function(event) {
  normal_start = false;
  if(event.data[0]=='change_node_ethnode'){
    if(active_ethnode_node!=event.data[1]){
      active_ethnode_node = event.data[1];
      ethereum_node_list.push(event.data[1]);
      ethnode_node_req(active_ethnode_node);

      if(event.data[2]){
        normal_start = true;
        hash_is_set = true;
        console.log('***');
        postMessage({ type: 'ethnode_change', value: getUrlClean(active_ethnode_node) });
  postMessage({ type: 'ethnode_update_box', value: ethereum_node_list });
      }      
    }
  } else if(event.data[0]=='change_node_ipfs'){
    if(active_ipfs_gateway!=event.data[1]){
      if(event.data[2]){
        ipfs_gateway_list.push(event.data[1]);
      }
      active_ipfs_gateway = event.data[1];
      //postMessage({ type: 'statusUpdate', value: ['ipfs', 2] });
      postMessage({ type: 'ipfs_change', value: getUrlClean(active_ipfs_gateway) });
      //postMessage({ type: 'ipfs_update_box', value: ipfs_gateway_list });
    }
  }

  if(event.data[0]=='change_ethnode_chain'){
    current_ethnode_chain = event.data[1];
  }
};

// shuffle object
function shuffle(){
  var temp = [];
  Object.keys(ethnode_name_list).forEach(function(i) {
    temp.push(i);
  });
  var currentIndex = temp.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = temp[currentIndex];
    temp[currentIndex] = temp[randomIndex];
    temp[randomIndex] = temporaryValue;
  }
  var new_sort = temp;
  var new_arr = [];
  var new_object = {};
  new_sort.forEach(function(ind) {

    new_object[ind] = {'desc':ethnode_name_list[ind]['desc'],'alias':ethnode_name_list[ind]['alias']};
    new_arr.push(new_object);

  });
  ethnode_name_list = new_object;
  return new_object;
}

function getUrlClean(url){
  if(url.match("https")) return url;
  try {
    return url.match(/\/(.*)\//).pop().match(/\/(.*)\//).pop();
  } catch(e){}
  try {
    return url.match(/\/(.*)\//).pop().replace(/\//g, '');
  } catch(e){
    return url;
  }
}

setTimeout(function(){
if(normal_start) startup_tasks();
}, 250);

var ipfs_total_retry = 0;

// XHR request function
function get_ipfs_proof(gateway,proofID,datas,w,proofi){

  // Print a new connection
  if(ipfs_error_n==1) console.log('Connecting to IPFS Gateway: '+gateway);

  // Connect to IPFS Gateway
  // and GET the proof ID
  var xhr = new XMLHttpRequest();
  xhr.open('GET', gateway+proofID, true);
  xhr.responseType = 'arraybuffer';
  xhr.timeout = timeout_xhr_req;
 
  // Prepare XML request 
  xhr.onload = function(e) {
  if (this.status == 200) {
    ipfs_error_n = 0;
    postMessage({ type: 'hlUpdate', value: ['ipfs', false] });
    postMessage({ type: 'statusUpdate', value: ['ipfs', 1] });
    // get binary data as a response
    var a = new Uint8Array(this.response);

    // update IPFS KBytes
    ipfs_kb += a.length/1000;

    postMessage({ type: 'textUpdate', value: ['ipfs_kb', parseInt(ipfs_kb)] });
    var t0 = new Date().getTime();
    console.log(a);
    var proofType = getProofType(a);
    console.log("Found "+proofType+" proof type");
    var proofResult = externalVerifyProof(a);
    updateChart(proofType,proofResult,dataSource,proofi,proofID,t0,w);
  }
  };

  // Manage XHR error
  xhr.onerror = function(e){
    xhr_error_manager();
  };

  // Manage XHR Timeouts
  xhr.ontimeout = function(e){
    xhr_error_manager();
  };

  // manage all xhr errors
  function xhr_error_manager(){
  ipfs_error_n += 1;
  ipfs_total_retry += 1;
  // Try the same IPFS Gateway 3 times
  if(ipfs_error_n<=3){
    // try a new IPFS gateway
    console.log('IPFS Gateway Error, Attempt n.: '+ipfs_error_n);
    postMessage({type: 'ipfs_retry', value: ipfs_error_n});
    setTimeout(function(){ get_ipfs_proof(gateway,proofID,datas,w,proofi); }, timeout_betw_retry_ipfs);
  }
  else {
    if(ipfs_total_retry>=9){
      proofsok++;
      postMessage({ type: 'statusUpdate', value: ['ipfs', 1] });
      postMessage({ type: 'hlUpdate', value: ['ipfs', false] });
      postMessage({ type: 'chartUpdate', value: datas });
      var newproofi = 0;
      newproofi = proofi+1;
      setTimeout(function(cpi){ checkProof(cpi) }, 3*200, newproofi);
      ipfs_total_retry = 0;
      return;
    }
    // IPFS Gateway is down, change it (with a random one)
    console.log('IPFS Gateway is down, Changing Gateway...');
    ipfs_error_n = 1;
    //ipfs_gateway_list.splice(ipfs_gateway_list.indexOf(gateway),1);
    console.log(ipfs_gateway_list);
    var new_ipfs_rand = random_arr(ipfs_gateway_list);
    while(active_ipfs_gateway==new_ipfs_rand){
        new_ipfs_rand = random_arr(ipfs_gateway_list);
    }
    active_ipfs_gateway = new_ipfs_rand;
    postMessage({type: 'ipfs_retry', value: ipfs_error_n});
    postMessage({ type: 'ipfs_change', value: getUrlClean(active_ipfs_gateway) });
    postMessage({ type: 'ipfs_update_box', value: ipfs_gateway_list });
    get_ipfs_proof(active_ipfs_gateway,proofID,datas,w,proofi);
  }
  }

  // Send XML Http request 
  xhr.send();
}

var query_error = 0;
function get_query_info(myid,cb){
  var xhr2 = new XMLHttpRequest();
  xhr2.open('GET', 'https://api.oraclize.it/v1/query/'+append_to_myid+myid+'/status', true);
  xhr2.responseType = 'json';
  xhr2.timeout = timeout_xhr_req;
  xhr2.onload = function(e) {
    if (this.status == 200) {
      cb(this.response);
    }
  };

  // Manage XHR error
  xhr2.onerror = function(e){
    console.log(e);
    query_error();
  };

  // Manage XHR Timeouts
  xhr2.ontimeout = function(e){
    query_error();
  };

  function query_error(){
    query_error += 1;
    if(query_error<=3){
      setTimeout(function() {
        get_query_info(myid,cb);
      }, 800);
    } else {
      query_error = 0;
      return;
    }
  }

  setTimeout(function() {
    xhr2.send();
  }, 800);
}

var ipfs_changed_to_select_box = 0;

var proofsdone = [];

// IPFS KBytes and TLSNotary milliseconds
var ipfs_kb = 0;
var tlsn_ms = 0;

function externalVerifyProof(a){
    postMessage({ type: 'textUpdate', value: ['lasthash', "Verifying proof "+(a).toString().substr(0, 25)+".."] });
    return verifyProof(a);
}

// Check every proof
function checkProof(proofi){
  console.log("Checking proofs["+proofi+"]");
  var cproof = proofs[proofi];
  if (typeof(cproof) == 'undefined'){
    resetProxy();
    console.log('no such proof');
    return;
  }

  // Block Number
  var blockn = cproof[0];

  var input = cproof[1];

  // IPFS proof ID
  var proofID = cproof[2];

  console.log("Checking proof @ "+proofID);
  var nname;

  // set hour and minutes for every block (Hours:Minutes)
  for(var j=0; j<blockList.length; j++){
    if (parseInt(blockList[j].number/step) == blockn){
      var tsp = blockList[j].timestamp*1000;
      var h = new Date(tsp).getHours();
      var m = new Date(tsp).getMinutes();
      if (h < 10) h = "0"+h;
      if (m < 10) m = "0"+m;
      nname = h+":"+m;
      break;
    }
  }
  console.log("block_n "+blockn+" is "+nname);

  // Check proof
  for (var w=0; w<dataSource.length; w++){
    if (dataSource[w].block_n == nname){
      console.log("FOUND!");
      //console.log("*** "+proofID);
      // Make XHR request with all the data needed
      if(isValidMultihash(proofID)){
        postMessage({ type: 'statusUpdate', value: ['ipfs', 2] });
        postMessage({ type: 'hlUpdate', value: ['ipfs', true] });
        postMessage({ type: 'textUpdate', value: ['ipfs_lastid', "Downloading file <a href='"+active_ipfs_gateway+proofID+"' target='_blank'>"+proofID.toString().substr(0, 15)+"..</a>"] });
        get_ipfs_proof(active_ipfs_gateway,proofID,dataSource,w,proofi);
      } else {
        var proofContent = proofID;
        if(typeof(myids[proofContent])!='undefined'){
          if(!myids[proofContent][1]) return;
          postMessage({ type: 'textUpdate', value: ['lasthash',"reset"]});
          postMessage({ type: 'textUpdate', value: ['ipfs_lastid',"reset"]});
          postMessage({ type: 'statusUpdate', value: ['ipfs', 1] });
          postMessage({ type: 'hlUpdate', value: ['ipfs', false] });
          var proofAscii = new Uint8Array(hexToBytes(web3.toAscii(proofContent.replace('0x',''))));
          var t0 = new Date().getTime();
          var proofType = getProofType(proofAscii);
          if(typeof(proofType)!='undefined'){
            console.log("Found "+proofType+" proof type");
            var proofResult = externalVerifyProof(proofAscii);
            updateChart(proofType,proofResult,dataSource,proofi,proofAscii,t0,w);
            console.log(proofResult);
          } else {
            proofsok++;
            console.log('No proof recognized');
            //dataSource[w].tx_count_1b = false;
            //dataSource[w].tx_count_1a = false;
            dataSource[w].tx_count_1a--;
            dataSource[w].tx_count_10++;
            //dataSource[w].tx_count_1c = true;
            postMessage({ type: 'chartUpdate', value: dataSource });
            var newproofi = 0;
            newproofi = proofi;
            checkProof(newproofi+1);
          }
        }
      }

      if(ipfs_error_n==0){
        if(ipfs_changed_to_select_box==0){
          postMessage({ type:'ipfs_change_to_select', value: 1 });
          ipfs_changed_to_select_box=1;
        }
      }
      break;
    }
  }
}

var honestyci;
var proofsok = 0;

function checkProofs(offset){
  checkProof(offset);
  honestyci = setInterval(function(){
    if (proofsok == proofs.length){
      postMessage({ type: 'chartUpdate_force', value: dataSource });
      postMessage({ 'type': "honesty_update", 'value': "<span style=\"/* text-decoration: underline; */ color: darkgreen;border: 2px solid darkgreen;padding: 4px;border-radius: 7px;box-shadow: 60px 0px 0px 0px lightgreen inset;\">verified</span>" }); //$("#oraclehonesty").html("<span style='text-decoration: underline; color: darkgreen;'>verified</span>");
      setTimeout(go, 20*1000);
      clearInterval(honestyci);
    }
  }, 1000);
}

var proofs = [];

var base58 = (function(){
var base58alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
  hexalphabet = '0123456789abcdef';

// Adds two arrays for the given base, returning the result.
// This turns out to be the only "primitive" operation we need.
function add(x, y, base) {
  var z = [];
  var n = Math.max(x.length, y.length);
  var carry = 0;
  var i = 0;
  while (i < n || carry) {
    var xi = i < x.length ? x[i] : 0;
    var yi = i < y.length ? y[i] : 0;
    var zi = carry + xi + yi;
    z.push(zi % base);
    carry = Math.floor(zi / base);
    i++;
  }
  return z;
}

// Returns a*x, where x is an array of decimal digits and a is an ordinary
// JavaScript number. base is the number base of the array x.
function multiplyByNumber(num, x, base) {
  if (num < 0) return null;
  if (num == 0) return [];
  var result = [];
  var power = x;
  while (true) {
    if (num & 1) {
      result = add(result, power, base);
    }
    num = num >> 1;
    if (num === 0) break;
      power = add(power, power, base);
    }

  return result;
}

function parseToDigitsArray(str, baseAlphabet) {
  var digits = str.split('');
  var ary = [];
  for (var i = digits.length - 1; i >= 0; i--) {
    var n = baseAlphabet.indexOf( digits[i]);
    if( n<0 ) {
      return null;
    }
    ary.push(n);
    }
    return ary;
}

function convertBase(str, fromBaseAlphabet, toBaseAlphabet) {
  var
    fromBase = fromBaseAlphabet.length,
    toBase = toBaseAlphabet.length,
    digits = parseToDigitsArray(str, fromBaseAlphabet);

  if (digits === null) return null;
    var outArray = [];
    var power = [1];

    for (var i = 0; i < digits.length; i++) {
      // invariant: at this point, fromBase^i = power
      if (digits[i]) {
        outArray = add(outArray, multiplyByNumber(digits[i], power, toBase), toBase);
      }
      power = multiplyByNumber(fromBase, power, toBase);
    }

    var out = '';
    for (var i = outArray.length - 1; i >= 0; i--) {
      out += toBaseAlphabet[ outArray[i] ]
    }
    return out;
}

  return {
    fromHex: function hexToB58( src ) {
      return convertBase( src, hexalphabet, base58alphabet );
    },
    toHex: function hexToB58( src ) {
      return convertBase( src, base58alphabet, hexalphabet );
    }
  };
}());

var myids = [];
var query_type = [];
function getProof(input){
  var proofID = input;
  input = input.replace("0x","");
  var signature4byte = input.substr(0,8);
  var inputdata = input.substr(8);
  var decodedSignature = "";
  if(signature4byte=="27dc297e"){
      // no proof
      return false;
  } else if(signature4byte=="38bbfa50"){
      // proof
      decodedSignature = solidity.decodeParams(["bytes32","string","bytes"],inputdata);
      var myIdExtracted = decodedSignature[0].replace('0x','');
      var proofContent = decodedSignature[2].replace("0x","");
      var proofContentAscii = web3.toAscii(proofContent);
      if(proofContentAscii=='None' || decodedSignature[2]=='0x' || proofContentAscii=='') return false;
      console.log(myIdExtracted);
      console.log(decodedSignature[2]);
      if(typeof(query_type[myIdExtracted])=='undefined'){
        query_type[myIdExtracted] = [];
        /*get_query_info(myIdExtracted, function(result) {
          var query_info = result;
          try {
            var datasource_type = query_info['result']['payload']['conditions'][0]['datasource'];
            var full_query = query_info['result']['payload']['conditions'][0]['query'];
            var query_result = query_info['result']['checks'][query_info['result']['checks'].length-1]['results'][0];
            query_type[myIdExtracted] = [datasource_type,full_query,query_result];
          } catch(e) {
            console.error(e);
          }
        });*/
      }
      if(decodedSignature[2].length>70){
        console.log('****** NOT VALID ');
        var checkIfJson = proofContentAscii.indexOf("{");
        if(checkIfJson!==-1){
          try {
            proofContent = JSON.parse(proofContentAscii.replace(/'/g,'"'));
            if(proofContent.type=='hex' && typeof(proofContent.value)!='undefined'){
              proofContent = proofContent.value;
            }
          } catch(e) {}
        }
        myids[proofContent] = [];
        myids[proofContent] = [myIdExtracted,true];
        return proofContent;
      } else {
        proofID = base58.fromHex((decodedSignature[2]).replace("0x",""));
        if(isValidMultihash(proofID)){
          console.log('****** VALID');
          myids[proofID] = [];
          myids[proofID] = [myIdExtracted,false];
          return proofID;
        }
      }
  } else if(signature4byte=="7d242ae5"){
      // base price tx (with proof)
      decodedSignature = solidity.decodeParams(["uint","bytes"],inputdata);
      proofID = base58.fromHex((decodedSignature[1]).replace("0x",""));
      if(isValidMultihash(proofID)){
        return proofID;
      }
  } else {
     return false
  }
}

function updateChart(type,result,datas,proofi,proof,time,w){
  console.log(result);
  if(!result.result){
    //datas.tx_count_1b = false;
    //datas.tx_count_1a = false;
    //datas.tx_count_1i = false;
    //datas[w].tx_count_1a++;
    //datas.tx_count_1c++;
    postMessage({ type: 'statusUpdate', value: ['ipfs', 1] });
    postMessage({ type: 'hlUpdate', value: ['ipfs', false] });
  } else {
    if(result.subproof=='computation'){
      //datas.tx_count_1b = false;
      datas[w].tx_count_1a--;
      datas[w].tx_count_1h++;
      //datas.tx_count_1c = false;
      //datas.tx_count_1i = false;
    } else if(type=='tlsn'){
      datas[w].tx_count_1a--;
      datas[w].tx_count_1b++;
      tlsn_ms += parseInt(new Date().getTime()-time);
      postMessage({ type: 'statusUpdate', value: [type, 1] });
      postMessage({ type: 'textUpdate', value: ['tlsn_computetimems', tlsn_ms] });
    } else if(type=='android'){
      //datas.tx_count_1b = false;
      //datas.tx_count_1a = false;
      //datas.tx_count_1c = false;
      datas[w].tx_count_1a--;
      datas[w].tx_count_1i++;
      postMessage({ type: 'statusUpdate', value: [type, 2] });
    }

    postMessage({ type: 'hlUpdate', value: [type,false]});

    if(isValidMultihash(proof)){
      postMessage({ type: 'statusUpdate', value: ['ipfs', 1] });
      postMessage({ type: 'hlUpdate', value: ['ipfs', false] });
    } else {
      postMessage({ type: 'statusUpdate', value: ['ipfs', 1] });
      postMessage({ type: 'hlUpdate', value: ['ipfs', false] });
    }
  }
  postMessage({ type: 'chartUpdate', value: datas });
  proofsok++;
  var newproofi = 0;
  newproofi = proofi+1;
  setTimeout(function(cpi){ checkProof(cpi); }, 3*200, newproofi);
}

function resetProxy(){
    postMessage({ type: 'textUpdate', value: ['ipfs_lastid',"reset"]});
    postMessage({ type: 'textUpdate', value: ['lasthash',"reset"]});
    postMessage({ type: 'hlUpdate', value: ['reset'] });
}

// Adjust (fix) data source 
function fixDataSource(){
  for (var blockn in ourTxs) {
    console.log('blocknn '+blockn);
    if (ourTxs.hasOwnProperty(blockn)) {
      for (l=0; l<ourTxs[blockn][1].length; l++){
        var proofID = getProof(ourTxs[blockn][1][l].input);
        proofs.push([blockn, ourTxs[blockn][1][l].input, proofID]);
      }
      var alreadythere = false;
      for (l=0; l<dataSource.length; l++){
        if (dataSource[l].block_n == blockn){
          dataSource[l] = { block_n: blockn, tx_count_0: dataSource[l].tx_count_0+ourTxs[blockn][0].length, tx_count_1a: dataSource[l].tx_count_1a+ourTxs[blockn][1].length, tx_count_1b: dataSource[l].tx_count_1b,tx_count_1h: dataSource[l].tx_count_1h+ourTxs[blockn][1].length,tx_count_1i: dataSource[l].tx_count_1i+ourTxs[blockn][1].length }
          alreadythere = true;
          break;
        }
      }
      if (!alreadythere) dataSource.push({ block_n: blockn, tx_count_0: ourTxs[blockn][0].length, tx_count_1a: ourTxs[blockn][1].length, tx_count_1b: 0,tx_count_1h:0,tx_count_1i:0 });
    }
  }


  var nds = [];
  for(i=0; i<dataSource.length; i++){
    blockn = dataSource[i].block_n;
    for(j=0; j<blockList.length; j++){
      if (parseInt(blockList[j].number/step) == blockn){
        var tsp = blockList[j].timestamp*1000;
        var h = new Date(tsp).getHours();
        var m = new Date(tsp).getMinutes();
        if (h < 10) h = "0"+h;
        if (m < 10) m = "0"+m;
        dataSource[i].block_n = h+":"+m;
        break;
      }
    }
  }
  for (i=0; i<dataSource.length; i++){
    var k = dataSource[i].block_n;
    var alreadythere = false;
    for (l=0; l<nds.length; l++){
      if (nds[l].block_n == k){
        alreadythere = true;
        nds[l] = { block_n: k, tx_count_0: dataSource[i].tx_count_0+nds[l].tx_count_0, tx_count_1a: dataSource[i].tx_count_1a+nds[l].tx_count_1a, tx_count_1b: dataSource[i].tx_count_1b+nds[l].tx_count_1b,tx_count_1i: dataSource[i].tx_count_1i+nds[l].tx_count_1i};
        break;
      }
    }
    if (!alreadythere) nds.push(dataSource[i]);
  }
  dataSource = nds;
}


var step = 50;
var sstep = 45;

var atx = 0;
var txs_loaded = 0;

var dataSource = [];
var blockList = [];
var ourTxs = {};
var txs_count = 0;


var ethnode_kb = 0;

var timer_ethnode = 0;

var timer_container;

var ethnode_select_box_changed = 0;

var append_to_myid = '';

function changeWeb3Node(){
  // Change ethnode node
  console.log('Changing ethereum node');
  var old_ethnode = active_ethnode_node;
  ethereum_node_list.splice(ethereum_node_list.indexOf(active_ethnode_node),1);
  delete ethnode_name_list[active_ethnode_node];
  ethnode_node_update();
  postMessage({ type: 'ethnode_update_box', value: ethereum_node_list });
  Object.keys(ethnode_name_list).forEach(function(i) {
    var alias = ethnode_name_list[i]['alias'];
    if(alias==current_ethnode_chain && old_ethnode!=i){
      // set a new node
      active_ethnode_node = i;
      return;
    }
  });  

  console.log('Connecting to new ethereum node: '+active_ethnode_node);
  ethnode_node_req(active_ethnode_node);
  postMessage({ type: 'ethnode_change', value: getUrlClean(active_ethnode_node) });
  postMessage({ type: 'ethnode_update_box', value: ethereum_node_list });
  ethnode_err_n = 0;
  go();
  return;
}

// sync data and chart every 20 seconds
function go(){
  postMessage({ type: 'statusUpdate', value: ['ethnode', 2] });
  postMessage({ type: 'hlUpdate', value: ['ethnode', true] });
  web3.eth.getBlockNumber(function(e, r){

    // Mange ethnode errors
    if(e){
    if(ethnode_err_n==0) ethnode_err_n=1;

    // Try the same node 3 times
    if(ethnode_err_n<=3){
      ethnode_err_n += 1;
      console.log('Ethereum node error, attempt n.: '+(ethnode_err_n-1));
      postMessage({ type:'ethnode_retry', value: ethnode_err_n-1 });
      setTimeout(function(){ go(); return; }, timeout_betw_retry_ethnode);
    } else {
      changeWeb3Node();
    }
    
    }
    else {
      ethnode_err_n = 0;

    if(ethnode_select_box_changed==0){
      postMessage({ type:'ethnode_change_to_select', value: 1 });
      ethnode_select_box_changed = 1;
    }
  
  postMessage({ type: 'statusUpdate', value: ['ethnode', 1] });
  var chain = checkChain();
  if(chain){
    append_to_myid = 'eth_'+chain+'_';
  }   
  console.log(r)
  txs_count = 0;
  atx = 0;
  txs_loaded = 0;
  var i0;
  if (blockList.length > 0) i0 = r-blockList[blockList.length-1].number-1; 
  else i0 = step*sstep; 
  console.log("Downloading "+(i0+1)+" new blocks..");
  var newproofs = 0;
  ourTxs = {}; 
  for (i=i0; i>=0; i--) web3.eth.getBlock(r-i, true, function(e, r){
    if(e){
      console.error(e);
      return;
    }
    if(typeof r == "undefined") return;
    postMessage({ type: 'textUpdate', value: ['ethnode_lastblockn', "In sync w/ block #"+r.number] });
    ethnode_kb += r.size/1000;
    postMessage({ type: 'textUpdate', value: ['ethnode_kb', parseInt(ethnode_kb)] });
    blockList.push(r);
    if (typeof ourTxs[parseInt(r.number/step)] == 'undefined') ourTxs[parseInt(r.number/step)] = [[], []];
    txs_count += r.transactions.length;
    var cbAddressActive = cbAddress[chain];
    postMessage({ type: 'blockLoad_update', value: parseInt(100*blockList.length/(step*sstep)) });
    for (k=0; k<r.transactions.length; k++){

      // Check if the sender address is from Oraclize
      if (r.transactions[k].from == cbAddressActive){
        atx++;
        //console.log(JSON.stringify(r.transactions[k]));
        if (getProof(r.transactions[k].input) != false){
          // proof is there!
          console.log("proof!");
          newproofs++;
          ourTxs[parseInt(r.number/step)][1].push(r.transactions[k]);
        } else ourTxs[parseInt(r.number/step)][0].push(r.transactions[k]);
      }
      txs_loaded++;
    }
  });
  txmonli = setInterval(function(){ if (blockList.length >= step*sstep){
  setTimeout(function(){
    postMessage({ 'type': "honesty_show" });
    var proofsoffset = proofs.length;
    fixDataSource();
    postMessage({ 'type': "honesty_update", 'value': "<span style='color: orange'>checking proofs..</span>" });
    checkProofs(proofsoffset);
  }, 2500);
  postMessage({ type: 'statusUpdate', value: ['ethnode', 1] });
  postMessage({ type: 'hlUpdate', value: ['ethnode', false] });
  postMessage({ type: 'hlUpdate', value: ['chart', false] });
  postMessage({ type: 'chartUpdate', value: dataSource });
  clearInterval(txmonli);
  }  }, 800);
}
});
}
setTimeout(function(){
// Start loop
go();
},2501);

isValidMultihash = function(proofid){
  try {
    return (typeof(Multihashes.validate(Multihashes.fromB58String(proofid)))=='undefined') ? true:false;
  } catch(e) {
    return false;
  }
}
