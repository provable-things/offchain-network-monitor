// IPFS Gateway list
var ipfs_gateway_list = [
  'http://localhost:8082/ipfs/',
  'http://46.101.46.100/ipfs/',
  'http://gateway.ipfs.io/ipfs/'
];


// Ethereum node list
var ethereum_node_list = [];

// Name of ethnode node
var ethnode_name_list = {
  'http://localhost:8545/' : {
    'desc': 'localhost:8545',
    'alias':'mainnet'
  },
  'http://eth-node-1.oraclize.it/': {
    'desc':'Oraclize Public Node - Mainnet',
    'alias':'mainnet'
  },
  'http://eth-testnet-node-1.oraclize.it/': {
    'desc':'Oraclize Public Node - Morden Testnet',
    'alias':'testnet'
  },
  'http://eth-testnet161-node-1.oraclize.it/': {
    'desc':'Oraclize Public Node - Testnet #161',
    'alias':'testnet_161'
  }
};

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
  postMessage({ type: 'ethnode_change', value: active_ethnode_node.match(/\/(.*)\//).pop().replace(/\//g, '') });
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
  importScripts("/assets/js/tlsn.js");
  importScripts("/assets/js/tlsn_utils.js");
  importScripts("/assets/js/oracles.js");
  importScripts("/assets/js/jsrsasign-latest-all-min.js");
  postMessage({ type: 'depsLoad_update', value: 'Loading certs..' });
  importScripts("/assets/js/rootcertslist.js");
  importScripts("/assets/js/rootcerts.js");
  importScripts("/assets/js/asn1.js");
  postMessage({ type: 'depsLoad_update', value: 'Loading crypto utils..' });
  importScripts("/assets/js/buffer.js");
  importScripts("/assets/js/verifychain.js");
  importScripts("/assets/js/core.js");
  importScripts("/assets/js/aes.js");
  importScripts("/assets/js/cipher-core.js");
  importScripts("/assets/js/enc-base64.js");
  importScripts("/assets/js/evpkdf.js");
  importScripts("/assets/js/hmac.js");
  importScripts("/assets/js/md5.js");
  importScripts("/assets/js/pad-nopadding.js");
  importScripts("/assets/js/sha1.js");
  importScripts("/assets/js/sha256.js");
  importScripts("/assets/js/solidity.js");
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
var timeout_betw_retry_ipfs = 2000;

// Timeout between new Ethereum node retry (ms)
var timeout_betw_retry_ethnode = 2000;

// Timeout of xhr request (ms)
var timeout_xhr_req = 4000;

active_ipfs_gateway = random_arr(ipfs_gateway_list);

// update the select input with the node list
postMessage({ type: 'ipfs_update_box', value: ipfs_gateway_list });

// update first IPFS change
postMessage({ type: 'ipfs_change_start', value: active_ipfs_gateway.match(/\/(.*)\//).pop().match(/\/(.*)\//).pop() });

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
        postMessage({ type: 'ethnode_change', value: active_ethnode_node.match(/\/(.*)\//).pop().replace(/\//g, '') });
	postMessage({ type: 'ethnode_update_box', value: ethereum_node_list });
      }      
    }
  }
  else if(event.data[0]=='change_node_ipfs'){
    if(active_ipfs_gateway!=event.data[1]){
      if(event.data[2]){
        ipfs_gateway_list.push(event.data[1]);
      }
      active_ipfs_gateway = event.data[1];
      //postMessage({ type: 'statusUpdate', value: ['ipfs', 2] });
      postMessage({ type: 'ipfs_change', value: active_ipfs_gateway.match(/\/(.*)\//).pop().match(/\/(.*)\//).pop() });
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


setTimeout(function(){
if(normal_start) startup_tasks();
}, 250);

// XHR request function
function xhr_req(gateway,proofID,datas,w,proofi){

  // Print a new connection
  (ipfs_error_n==1) ? console.log('Connecting to IPFS Gateway: '+gateway) : 1+1;

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
    postMessage({ type: 'statusUpdate', value: ['tlsn', 2] });
    postMessage({ type: 'hlUpdate', value: ['tlsn', true] });

    // update TLSNotary ms
    var _t0 = new Date().getTime();
    console.log(verify_tlsn(a));
    tlsn_ms += (new Date().getTime())-_t0;

    postMessage({ type: 'textUpdate', value: ['tlsn_computetimems', parseInt(tlsn_ms)] });
    postMessage({ type: 'hlUpdate', value: ['tlsn', false] });
    postMessage({ type: 'statusUpdate', value: ['tlsn', 1] });
    datas[w].tx_count_1b++;
    datas[w].tx_count_1a--;
    proofsok++;
    postMessage({ type: 'chartUpdate', value: datas });
    var newproofi = 0;
    newproofi = proofi+1;
    setTimeout(function(cpi){ checkProof(cpi) }, 3*200, newproofi);

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
  // Try the same IPFS Gateway 3 times
  if(ipfs_error_n<=3){
    // try a new IPFS gateway
    console.log('IPFS Gateway Error, Attempt n.: '+ipfs_error_n);
    postMessage({type: 'ipfs_retry', value: ipfs_error_n});
    setTimeout(function(){ xhr_req(gateway,proofID,datas,w,proofi); }, timeout_betw_retry_ipfs);
  }
  else {
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
    postMessage({ type: 'ipfs_change', value: active_ipfs_gateway.match(/\/(.*)\//).pop().match(/\/(.*)\//).pop() });
    postMessage({ type: 'ipfs_update_box', value: ipfs_gateway_list });
    xhr_req(active_ipfs_gateway,proofID,datas,w,proofi);
  }
  }

  // Send XML Http request 
  xhr.send();
}

var ipfs_changed_to_select_box = 0;

var proofsdone = [];


// IPFS KBytes and TLSNotary milliseconds
var ipfs_kb = 0;
var tlsn_ms = 0;

// Check every proof and if a proof is found get the proof from the IPFS gateway
function checkProof(proofi){
  console.log("Checking proofs["+proofi+"]");
  var cproof = proofs[proofi];
  if (typeof(cproof) == 'undefined'){
    console.log("No such proof.");
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


      postMessage({ type: 'statusUpdate', value: ['ipfs', 2] });
      postMessage({ type: 'hlUpdate', value: ['ipfs', true] });
      postMessage({ type: 'textUpdate', value: ['ipfs_lastid', "Downloading file <a href='"+active_ipfs_gateway+proofID+"' target='_blank'>"+proofID.toString().substr(0, 15)+"..</a>"] });

      // Make XHR request with all the data needed
      xhr_req(active_ipfs_gateway,proofID,dataSource,w,proofi);

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


function getProofID(input){

  var proofID = input;
  input = input.replace("0x","");
  var signature4byte = input.substr(0,8);
  var inputdata = input.substr(8);
  if(signature4byte=="27dc297e"){
      // no proof
      return false;
  } else if(signature4byte=="38bbfa50"){
      // proof
      proofID = base58.fromHex((solidity.decodeParams(["bytes32","string","bytes"],inputdata)[2]).replace("0x",""));
  } else if(signature4byte=="7d242ae5"){
      // base price tx (with proof)
      proofID = base58.fromHex((solidity.decodeParams(["uint","bytes"],inputdata)[1]).replace("0x",""));
  } else {
     return false
  }
if(proofID.length!=46) return false;
return proofID;
}


// Adjust (fix) data source 
function fixDataSource(){
  for (var blockn in ourTxs) {
    if (ourTxs.hasOwnProperty(blockn)) {
      for (l=0; l<ourTxs[blockn][1].length; l++){
        var proofID = getProofID(ourTxs[blockn][1][l].input);
        proofs.push([blockn, ourTxs[blockn][1][l].input, proofID]);
      }
      var alreadythere = false;
      for (l=0; l<dataSource.length; l++){
        if (dataSource[l].block_n == blockn){
          dataSource[l] = { block_n: blockn, tx_count_0: dataSource[l].tx_count_0+ourTxs[blockn][0].length, tx_count_1a: dataSource[l].tx_count_1a+ourTxs[blockn][1].length, tx_count_1b: dataSource[l].tx_count_1b }
          alreadythere = true;
          break;
        }
      }
      if (!alreadythere) dataSource.push({ block_n: blockn, tx_count_0: ourTxs[blockn][0].length, tx_count_1a: ourTxs[blockn][1].length, tx_count_1b: 0 });
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
        nds[l] = { block_n: k, tx_count_0: dataSource[i].tx_count_0+nds[l].tx_count_0, tx_count_1a: dataSource[i].tx_count_1a+nds[l].tx_count_1a, tx_count_1b: dataSource[i].tx_count_1b+nds[l].tx_count_1b };
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

// sync data and chart every 20 seconds
function go(){
  postMessage({ type: 'statusUpdate', value: ['ethnode', 2] });
  postMessage({ type: 'hlUpdate', value: ['ethnode', true] });
  web3.eth.getBlockNumber(function(e, r){

    // Mange ethnode errors
    if(e){
    (ethnode_err_n==0) ? ethnode_err_n=1:1+1;

    // Try the same node 3 times
    if(ethnode_err_n<=3){
      ethnode_err_n += 1;
      console.log('Ethereum node error, attempt n.: '+(ethnode_err_n-1));
      postMessage({ type:'ethnode_retry', value: ethnode_err_n-1 });
      setTimeout(function(){ go(); return; }, timeout_betw_retry_ethnode);
    }
    else {
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
      postMessage({ type: 'ethnode_change', value: active_ethnode_node.match(/\/(.*)\//).pop().replace(/\//g, '') });
      postMessage({ type: 'ethnode_update_box', value: ethereum_node_list });
      ethnode_err_n = 0;
      go();
      return;
    }
    
    }
    else {
      ethnode_err_n = 0;
      // ok
    if(ethnode_select_box_changed==0){
      postMessage({ type:'ethnode_change_to_select', value: 1 });
      ethnode_select_box_changed = 1;
    }
  
  postMessage({ type: 'statusUpdate', value: ['ethnode', 1] });
  
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

    postMessage({ type: 'textUpdate', value: ['ethnode_lastblockn', "In sync w/ block #"+r.number] });
    ethnode_kb += r.size/1000;
    postMessage({ type: 'textUpdate', value: ['ethnode_kb', parseInt(ethnode_kb)] });
    blockList.push(r);
    if (typeof ourTxs[parseInt(r.number/step)] == 'undefined') ourTxs[parseInt(r.number/step)] = [[], []];
    txs_count += r.transactions.length;
    for (k=0; k<r.transactions.length; k++){

      // Check if the sender address is from Oraclize
      if (r.transactions[k].from == "0x26588a9301b0428d95e6fc3a5024fce8bec12d51"){
        atx++;
        //console.log(JSON.stringify(r.transactions[k]));
        if (getProofID(r.transactions[k].input) != false){
          // TLSNotary proof is there!
          console.log("proof!");
          newproofs++;
          ourTxs[parseInt(r.number/step)][1].push(r.transactions[k]);
        } else ourTxs[parseInt(r.number/step)][0].push(r.transactions[k]);
      }
      txs_loaded++;
    }
  postMessage({ type: 'blockLoad_update', value: parseInt(100*blockList.length/(step*sstep)) });

    

  });
  txmonli = setInterval(function(){ if (blockList.length >= step*sstep){
  postMessage({ 'type': "honesty_show" });
  var proofsoffset = proofs.length;
  fixDataSource();
  setTimeout(function(){ postMessage({ 'type': "honesty_update", 'value': "<span style='color: orange'>checking proofs..</span>" }); checkProofs(proofsoffset) }, 1500);
  postMessage({ type: 'statusUpdate', value: ['ethnode', 1] });
  postMessage({ type: 'hlUpdate', value: ['ethnode', false] });
  postMessage({ type: 'hlUpdate', value: ['chart', false] });
  postMessage({ type: 'chartUpdate', value: dataSource });
  clearInterval(txmonli);
  }  }, 200);
}
});
}
setTimeout(function(){
// Start loop
go();
},2501);

// imported_data is an array of numbers
var chosen_notary = oracles[Math.random()*(oracles.length) << 0];

// Verify TLSNotary and check if is valid
function verify_tlsn(data, from_past){
  var data = ua2ba(data);
  var offset = 0;
  if (ba2str(data.slice(offset, offset+=29)) !== "tlsnotary notarization file\n\n"){
    throw('wrong header');
  }
  if(data.slice(offset, offset+=2).toString() !== [0x00, 0x01].toString()){
    throw('wrong version');
  }
  var cs = ba2int(data.slice(offset, offset+=2));
  var cr = data.slice(offset, offset+=32);
  var sr = data.slice(offset, offset+=32);
  var pms1 = data.slice(offset, offset+=24);
  var pms2 = data.slice(offset, offset+=24);
  var chain_serialized_len = ba2int(data.slice(offset, offset+=3));
  var chain_serialized = data.slice(offset, offset+=chain_serialized_len);
  var tlsver = data.slice(offset, offset+=2);
  var tlsver_initial = data.slice(offset, offset+=2);
  var response_len = ba2int(data.slice(offset, offset+=8));
  var response = data.slice(offset, offset+=response_len);
  var IV_len = ba2int(data.slice(offset, offset+=2));
  var IV = data.slice(offset, offset+=IV_len);
  var sig_len = ba2int(data.slice(offset, offset+=2));
  var sig = data.slice(offset, offset+=sig_len);
  var commit_hash = data.slice(offset, offset+=32);
  var notary_pubkey = data.slice(offset, offset+=sig_len);
  assert (data.length === offset, 'invalid .pgsg length');

  offset = 0;
  var chain = []; //For now we only use the 1st cert in the chain
  while(offset < chain_serialized.length){
    var len = ba2int(chain_serialized.slice(offset, offset+=3));
    var cert = chain_serialized.slice(offset, offset+=len);
    chain.push(cert);
  }
  
  var commonName = getCommonName(chain[0]);
  //verify cert
 /* if (!verifyCert(chain)){
    throw ('certificate verification failed');
  }
*/
  var modulus = getModulus(chain[0]);
  //verify commit hash
  if (sha256(response).toString() !== commit_hash.toString()){
    throw ('commit hash mismatch');
  }
  postMessage({ type: 'textUpdate', value: ['tlsn_lasthash', "Verifying proof "+(commit_hash).toString().substr(0, 25)+".."] });
  //verify sig
  var signed_data = sha256([].concat(commit_hash, pms2, modulus));
  var signing_key;
  if (from_past){signing_key = notary_pubkey;}
  else {signing_key = chosen_notary.sig.modulus;}
  if (!verify_commithash_signature(signed_data, sig, signing_key)){
    throw ('notary signature verification failed');
  }
  //decrypt html and check MAC
  var s = new TLSNClientSession();
  s.__init__();
  s.unexpected_server_app_data_count = response.slice(0,1);
  s.chosen_cipher_suite = cs;
  s.client_random = cr;
  s.server_random = sr;
  s.auditee_secret = pms1.slice(2, 2+s.n_auditee_entropy);
  s.initial_tlsver = tlsver_initial;
  s.tlsver = tlsver;
  s.server_modulus = modulus;
  s.set_auditee_secret();
  s.auditor_secret = pms2.slice(0, s.n_auditor_entropy);
  s.set_auditor_secret();
  s.set_master_secret_half(); //#without arguments sets the whole MS
  s.do_key_expansion(); //#also resets encryption connection state
  s.store_server_app_data_records(response.slice(1));
  s.IV_after_finished = IV;
  s.server_connection_state.seq_no += 1;
  s.server_connection_state.IV = s.IV_after_finished;
  html_with_headers = decrypt_html(s);
  return [html_with_headers,commonName, data, notary_pubkey];
}






function getModulus(cert){
  var c = Certificate.decode(new Buffer(cert), 'der');
  var pk = c.tbsCertificate.subjectPublicKeyInfo.subjectPublicKey.data;
  var pkba = ua2ba(pk);
  //expected modulus length 256, 384, 512
  var modlen = 256;
  if (pkba.length > 384) modlen = 384;
  if (pkba.length > 512) modlen = 512;
  var modulus = pkba.slice(pkba.length - modlen - 5, pkba.length -5);
  return modulus;
}


function getCommonName(cert){
  var c = Certificate.decode(new Buffer(cert), 'der');
  var fields = c.tbsCertificate.subject.value;
  for (var i=0; i < fields.length; i++){
    if (fields[i][0].type.toString() !== [2,5,4,3].toString()) continue;
    //first 2 bytes are DER-like metadata
    return ba2str(fields[i][0].value.slice(2));
  }
  return 'unknown';
}

function verifyCert(chain){
  var chainperms = permutator(chain);
  for (var i=0; i < chainperms.length; i++){
    if (verifyCertChain(chainperms[i])){
      return true;
    }
  }
  return false;
}



function permutator(inputArr) {
  var results = [];

  function permute(arr, memo) {
    var cur, memo = memo || [];

    for (var i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1);
      if (arr.length === 0) {
        results.push(memo.concat(cur));
      }
      permute(arr.slice(), memo.concat(cur));
      arr.splice(i, 0, cur[0]);
    }

    return results;
  }

  return permute(inputArr);
}

