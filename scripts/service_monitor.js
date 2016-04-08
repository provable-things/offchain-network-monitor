function drawRandomEvent(){
  $.getJSON("/__randomevent", function(data){
    source = data['source'];
    questions = data['questions'];
    question = "";
    for (i=0; i<questions.length; i++){
      query = questions[i]['query'];
      checkop = questions[i]['checkop'];
      checkop_value = questions[i]['value'];
      if ((source == 'WolframAlpha_API')||(source == 'WolframAlpha'))
        question += "<a target='_blank' href='http://www.wolframalpha.com/input/?i="+query+"'>"+"<span>'</span>"+secure_escape(strtruncate(query, 45))+"<span>'</span>"+"<span> </span><span>" + checkop + "</span><span> </span>"+"<span><b>"+ secure_escape(strtruncate(checkop_value, 20))+"</b></span></a>"+(i<questions.length-1 ? "<br>" : "")
      else
        question += "<span>'</span>"+secure_escape(strtruncate(query, 45))+"<span>'</span>"+"<span> </span><span>" + checkop + "</span><span> </span>"+"<span><b>"+ secure_escape(strtruncate(checkop_value, 20))+"</b></span>"+(i<questions.length-1 ? "<br>" : "");
      }
    answer = data['answer'];
    txid = data['txid'];

    switch(source){
      case 'WolframAlpha_API':
      case 'WolframAlpha':
        srcimage = "/assets/images/wolfram_logo.png";
        $("#randomevent_sourceimg").attr("onclick", "location.href='http://wolframalpha.com'");
        $("#randomevent_sourceimg").css("cursor", "pointer");
        answer = "<a target='_blank' href='http://www.wolframalpha.com/input/?i="+query+"'>"+secure_escape(answer)+"</a>";
        break;
      case 'Blockchain':
        srcimage = "/assets/images/logo-blockchain.png";
        break;
      case 'Football':
        srcimage = "/assets/images/logo-football.png";
        break;
      case 'URL':
        srcimage = "/assets/images/logo-url.png";
        break;
      default:
        break;
    }

    $("#randomevent_sourceimg").attr("src", srcimage);
    $("#randomevent_question").html(question);
    $("#randomevent_answer").html(answer);
    drawTx(txid);
  });
}

function drawTx(txid){
  $.getJSON("https://insight.bitpay.com/api/tx/"+txid).done(function(data){
    html = '<div class="row" id="randomevent_txrow" style="display: table-cell; vertical-align: middle;">';
    //html += '<div class="col-md-5" style="text-align: left; font-size: 10px">';
    //for (i=0; i<data.vin.length; i++) html += data.vin[i].addr+'<br>';
    //html += "</div>"
    html += '<div class="col-md-2" id="randomevent_txarrow"><a href="https://insight.bitpay.com/tx/'+txid+'" target="_blank"><i style="font-size: 35px; color: #8dc63f; font-weight: bold;" class="fa-long-arrow-right"></i></a></div>';
    html += '<div class="col-md-8" id="randomevent_txouts" style="text-align: left; font-size: 16px">';
    for (i=0; i<data.vout.length; i++){
      if (typeof data.vout[i].scriptPubKey.addresses == 'undefined'){
        descr = data.vout[i].scriptPubKey.asm.replace("OP_RETURN ", "OP_RETURN 0x");
        if (descr.length > 35) descr = descr.substr(0, 35)+"..";
          html += descr+'<br>';
          continue;
        }
      for (j=0; j<data.vout[i].scriptPubKey.addresses.length; j++) html += data.vout[i].scriptPubKey.addresses[j]+'<br>';
    }
    html += "</div></div>"
    $("#txcanvas").html(html);
    $("#drawevent_panel_loading").fadeOut(1000, function(){
      $("#drawevent_panel_body").show();
      $("#randomevent_txarrow").css("margin-top", (($("#randomevent_txouts").css("height").replace("px", "")-35)/2)+"px");
      $("#drawevent_panel_body").hide();
      $("#drawevent_panel_body").fadeIn(800); //animate({"opacity": 1}, 1000);
    });
  }).fail(function(){ drawRandomEvent(); });
}

//drawRandomEvent();
//setInterval(function(){ $("#drawevent_panel_body").fadeOut(1000, function(){ $("#drawevent_panel_loading").fadeIn(500); drawRandomEvent(); }); }, 20*1000);


/*  Service Monitor  */

borderc = {
  dashStyle: 'solid',
  color: '#000000',
  visibile: true,
  width: 2
};


// dxChart chart settings
$(".txmon").dxChart({
  dataSource: [], 
  animation: {
    enabled: true,
    duration: 200
  },
  series: [{
    argumentField: "block_n",
    valueField: "tx_count_0",
    name: "Noproof",
    type: "stackedbar",
    color: '#7fbfff',
    border: borderc
  },
  {
  argumentField: "block_n",
  valueField: "tx_count_1b",
  name: "Proof_verified",
  type: "stackedbar",
  color: '#42b30a',
  border: borderc
  },{
  argumentField: "block_n",
  valueField: "tx_count_1a",
  name: "Proof",
  type: "stackedbar",
  color: '#99ff66',
  border: borderc
  }],
  legend: { visible: true, margin: { top: 30 }, orientation: 'horizontal', verticalAlignment: 'bottom', horizontalAlignment: 'center', border: { visible: false },
    customizeText: function(x){
      // set x legend labels
      switch(x.seriesName){
        case "Proof_verified":
          return "Proof verified";
          break;
        case "Proof":
          return "Proof not verified yet";
          break;
        default:
          return "Proof not requested";
          break;
      }
    }
  },
  tooltip: {
    enabled: true,
    customizeTooltip: function (value) {
      // Set tooltip text
      desc = "Oraclize tx - ";
      switch(value.seriesName){
        case "Proof_verified":
          desc += "proof verified";
          break;
        case "Proof":
          desc += "proof not verified yet, please wait..";
          break;
        default:
          desc += "proof not requested";
          break;
      }
      return {text: desc};
    }
  }
});

$(".txmon").dxChart('instance').showLoadingIndicator();

// Last chart and block update (UNIX time)
var lastChartUpdate = 0;
var lastBlockUpdate = 0;
try{

  // Check if Web Worker is already initialized (if is not initialized it will throw 'undefined')
  if(typeof(w) == "undefined") {

    // Initialize a new Web Worker
    w = new Worker("/scripts/widget_monitor.js");

    // If Web Worker is not available (or we get an error), use fallback
    w.onerror = function(event){
      console.log(event);
      console.log("WEB WORKER ERROR, fallback to standard way..");

      // load and start using standard fallback 
      loadWidgetStd();
    };

      // When a new event occurs on Web Worker process that event with function processWidgetEv
    w.onmessage = processWidgetEv;
  }
} catch(e){
  console.log(e);
  // for some reason we get an error, load and start using standard fallback 
  loadWidgetStd();
}

// Oraclize public ethnode node
var ethnode_name_list = {
  'http://localhost:8545/' : {
    'desc': 'localhost:8545',
    'alias':'mainnet'
  },
  'http://178.62.29.206:8081/': {
    'desc':'Oraclize Public Node - Mainnet',
    'alias':'mainnet'
  },
  'http://178.62.29.206:8082/': {
    'desc':'Oraclize Public Node - Morden Testnet',
    'alias':'testnet'
  },
  'http://178.62.29.206:8083/': {
    'desc':'Oraclize Public Node - Testnet #161',
    'alias':'testnet_161'
  }
};

// IP of the node
var node_by_hash = false;

// Check if the hash of the Url is valid
function check_oraclize_node(hash){
  ethnode_name_list = shuffle(ethnode_name_list);
  Object.keys(ethnode_name_list).forEach(function(i) {
    var alias = ethnode_name_list[i]['alias'];
    if(alias==hash){
      node_by_hash = i;
      return;
    }
  });
}

// suffle object
function shuffle(ethnode_name_list){
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

// Check if the hash is set
var hash = window.location.hash.substr(1);
var chain = 'mainnet';

setTimeout(function (){
check_oraclize_node(hash);
if(hash!="" && node_by_hash!=false){
  $('.active_ethnode_node').html(node_by_hash.match(/\/(.*)\//).pop().replace(/\//g, ''));
  chain = hash;
  w.postMessage(['change_ethnode_chain',hash]);
  w.postMessage(['change_node_ethnode', node_by_hash,'alias']);
  $('#ethnode_node').val(node_by_hash.match(/\/(.*)\//).pop().replace(/\//g, ''));
}

},600);

// Update #oraclehonesty CSS
// (to show the timer-based progress bar)
var vpi;
var vp_s;
var vp_kstep = 40;
function verifiedProgress(){
  vp_s = 60;
  vpi = setInterval(function(){ vp_s -= 60/vp_kstep; if (vp_s <= 0) clearInterval(vpi); else $("#oraclehonesty").children().css("box-shadow", "rgb(144, 238, 144) "+(vp_s)+"px 0px 0px 0px inset"); }, 1000*20/vp_kstep);
}

var current_ipfs;
var current_ethnode;

var start_ethnode_text = 0;

// Process events coming from the actual monitor code
function processWidgetEv(event){

  if(event.data.type=='update_oraclize_node_list'){
    ethnode_name_list = event.data.value;
  }

  // Update IPFS select box
  if(event.data.type=='ipfs_update_box'){
    $('#ipfs_gateways').empty();
    $.each(event.data.value, function (i, item) {
        $('#ipfs_gateways').append($('<option>', {
            value: event.data.value[i].match(/\/(.*)\//).pop().match(/\/(.*)\//).pop(),
            text : event.data.value[i].match(/\/(.*)\//).pop().match(/\/(.*)\//).pop()
        }));
    });
    $('#ipfs_gateways').append($('<option>', {
        value: 'CUSTOM',
        text : 'Enter custom node...'
    }));
  }
  // update ethnode select box
  else if(event.data.type=='ethnode_update_box'){
    $('#ethnode_node').empty();
    $.each(event.data.value, function (i, item) {
        $('#ethnode_node').append($('<option>', {
            value: event.data.value[i].match(/\/(.*)\//).pop().replace(/\//g, ''),
            text : (ethnode_name_list[event.data.value[i]]!=undefined) ? ethnode_name_list[event.data.value[i]]['desc'] : event.data.value[i].match(/\/(.*)\//).pop().replace(/\//g, '')
        }));
    });
    $('#ethnode_node').append($('<option>', {
        value: 'CUSTOM',
        text : 'Enter custom node...'
    }));
  }

  // update first IPFS change
  if(event.data.type=='ipfs_change_start'){
    $('.active_ipfs_gateway').html(event.data.value);
    $('#ipfs_gateways').val(event.data.value);    
  }

  // Update ethnode and IPFS gateway (select box and text)
  if(event.data.type=='ipfs_change'){

    $('.active_ipfs_gateway').hide();
    $('#ipfs_gateways').show();

    $('.active_ipfs_gateway').html(event.data.value);
    if($('#ipfs_gateways option[value="'+event.data.value+'"]').length==1){
      $('#ipfs_gateways').val(event.data.value);
      setTimeout(function(){$('#ipfs_gateways').val(event.data.value);}, 100);
    }
    else {
      $('#ipfs_gateways').val('http://'+event.data.value+'/ipfs/');
    }
  }
  else if(event.data.type=='ethnode_change'){
    start_ethnode_text += 1;

    $('.active_ethnode_node').hide();
    $('#ethnode_node').show();      

    $('.active_ethnode_node').html(event.data.value);
    $('#ethnode_node').val(event.data.value);

    setTimeout(function(){$('#ethnode_node').val(event.data.value);}, 100);
  }

  // Show select box when ipfs and ethnode connection is stable
  if(event.data.type=='ipfs_change_to_select' && event.data.value==1){
    //$('.active_ipfs_gateway').hide();
    //$('#ipfs_gateways').show();
  }
  else if(event.data.type=='ethnode_change_to_select' && event.data.value==1){
    //$('.active_ethnode_node').hide();
    //$('#ethnode_node').show();
  }

  if(event.data.type=='ethnode_retry'){
    $('.active_ethnode_node').hide();

    if($('#ethnode_busy').html().indexOf("Retry # 3")>=0){
      $('#ethnode_busy').html('<span style="" class="fa fa-spin fa-spinner"></span> Connecting to RPC node, ');
    }

    ($('#ethnode_busy').html().indexOf("Retry")>=0) ? $('#ethnode_busy').html($('#ethnode_busy').html().replace(/Retry.+, /,"")):1+1;
    $('#ethnode_busy').append('Retry # '+event.data.value+', ');
  }
  else if(event.data.type=='ipfs_retry'){

    $('.active_ipfs_gateway').hide();

    if($('#ipfs_busy').html().indexOf("Retry # 3")>=0){
      $('#ipfs_busy').html('<span style="" class="fa fa-spin fa-spinner"></span> Connecting to IPFS node, ');
    }

    ($('#ipfs_busy').html().indexOf("Retry")>=0) ? $('#ipfs_busy').html($('#ipfs_busy').html().replace(/Retry.+, /,"")):1+1;
    $('#ipfs_busy').append('Retry # '+event.data.value+', ');

  }

  // check the different type of events and update HTML accordingly
  if (event.data.type == 'blockLoad_update'){
    $(".txmon tspan").last().html("Loading blocks.. "+event.data.value+"%");
  } else if (event.data.type == 'depsLoad_update'){
    $(".txmon tspan").last().html(event.data.value);
  } else if (event.data.type == 'chartUpdate'){

  // Prevent chart to update too fast for the user (less than 1.5 seconds)
  if ((new Date().getTime() - lastChartUpdate) < 1.5*1000) return;
    processWidgetEv({data: { type: 'hlUpdate', value: ['chart', true] }});
    lastChartUpdate = new Date().getTime();
    document.dataSource = event.data.value;

    $(".txmon").dxChart({ dataSource: event.data.value });
    $(".txmon").dxChart({ dataSource: event.data.value });
    setTimeout(function(){ processWidgetEv({data: { type: 'hlUpdate', value: ['chart', false] }}) }, 300);

  // Force a chart update
  } else if (event.data.type == 'chartUpdate_force'){
    processWidgetEv({data: { type: 'hlUpdate', value: ['chart', true] }});
    $(".txmon").dxChart({ dataSource: event.data.value });
    $(".txmon").dxChart({ dataSource: event.data.value });
    setTimeout(function(){ processWidgetEv({data: { type: 'hlUpdate', value: ['chart', false] }}) }, 300);
  } else if (event.data.type == 'honesty_show'){
    $("#oraclehonesty").parent().css("visibility", "visible");
  } else if (event.data.type == 'honesty_update'){
    $("#oraclehonesty").html(event.data.value);
    $("#oraclehonesty_msg").css("visibility", "visible");
    if (event.data.value.indexOf("verified") > -1){
      verifiedProgress();
      $("#loading_badge").hide();
      $("#live_badge").show();
    }
    // Update chart event
    } else if (event.data.type == 'hlUpdate'){
      if (event.data.value[0] == 'chart'){
        if (event.data.value[1]) $("#widget_chart").addClass("borderhover1Active");
        else $("#widget_chart").removeClass("borderhover1Active");

      // is a Ethereum event    
      } else if (event.data.value[0] == 'ethnode'){
        if (event.data.value[1]){
          $("#widget_"+event.data.value[0]).addClass("borderhover1Active");
          $("#descr_"+event.data.value[0]).css("color", "rgba(0, 185, 233, .75)");
          $("#descr_"+event.data.value[0]+" span").css("color", "black");
        }
        else {
          $("#widget_"+event.data.value[0]).removeClass("borderhover1Active");
          $("#descr_"+event.data.value[0]).css("color", "inherit");
          $("#descr_"+event.data.value[0]+" span").css("color", "inherit");
        }
      // is a IPFS event    
      } else if (event.data.value[0] == 'ipfs'){  
        if (event.data.value[1]){
          $('.active_ipfs_gateway').hide();
          $('#ipfs_gateways').show();
          $("#widget_"+event.data.value[0]).addClass("borderhover1Active");
          $("#descr_"+event.data.value[0]).css("color", "rgba(0, 185, 233, .75)");
          $("#descr_"+event.data.value[0]+" span").css("color", "black");
        }
        else {
          $("#widget_"+event.data.value[0]).removeClass("borderhover1Active");
          $("#descr_"+event.data.value[0]).css("color", "inherit");
          $("#descr_"+event.data.value[0]+" span").css("color", "inherit");
        }

      // is a TLSNotary event     
      } else if (event.data.value[0] == 'tlsn'){
        if (event.data.value[1]){
          $("#widget_"+event.data.value[0]).addClass("borderhover1Active");
          $("#descr_"+event.data.value[0]).css("color", "rgba(0, 185, 233, .75)");
          $("#descr_"+event.data.value[0]+" span").css("color", "black");
        }
        else {
          $("#widget_"+event.data.value[0]).removeClass("borderhover1Active");
          $("#descr_"+event.data.value[0]).css("color", "inherit");
          $("#descr_"+event.data.value[0]+" span").css("color", "inherit");
        }
      }

      // is a text update event
      // ( i.e. IPFS current downloading file, Ethereum blocks progress, IPFS KBytes etc.. )
      } else if (event.data.type == 'textUpdate'){
        $("#"+event.data.value[0]).html(event.data.value[1]);
        $("#"+event.data.value[0]).parent().css("visibility", "visible");
      } else if (event.data.type == 'statusUpdate'){
        if (event.data.value[1] == 0){
          $("#"+event.data.value[0]+"_ready").hide();
          $("#"+event.data.value[0]+"_busy").hide();
          $("#"+event.data.value[0]+"_loading").show();
        } else if (event.data.value[1] == 1){
          if($('#ipfs_busy').html().indexOf("Retry #")>=0){
            $('#ipfs_busy').html($('#ipfs_busy').html().replace(/Retry.+, /,""));
          }
          else if($('#ethnode_busy').html().indexOf("Retry #")>=0){
            $('#ethnode_busy').html($('#ethnode_busy').html().replace(/Retry.+, /,""));
          }
          $("#"+event.data.value[0]+"_loading").hide();
          $("#"+event.data.value[0]+"_busy").hide();
          $("#"+event.data.value[0]+"_ready").show();
        } else if (event.data.value[1] == 2){
          $("#"+event.data.value[0]+"_loading").hide();
          $("#"+event.data.value[0]+"_ready").hide();
          $("#"+event.data.value[0]+"_busy").show();
        }
      }
}

// Standard load false (use Web Worker by default)
var stdLoad = false;


// Allow to pass messages (with type and value)
function postMessage_(x){
  console.log("MSGBAWW="+JSON.stringify(x));
  processWidgetEv({data: x});
}


// Terminate active Web Workers (if any are active) and use standard fallback
function loadWidgetStd(){

  // Terminate Web Workers
  try { w.terminate(); }
  catch(e){}

  // Set Standard load to true (because Web Workers are not available)
  stdLoad = true;

        
  $(".txmon").dxChart('instance').showLoadingIndicator();
  postMessage = postMessage_;
  $(".txmon").dxChart('instance').showLoadingIndicator();

  // Allow to import js scripts by appending script tag to the body
  $.importScripts = function (url, callback) {
    $('body').append("<script src='"+url+"'></script>");
  }

  $.importScripts("/scripts/widget_monitor.js");
}


// Select ethnode node
$('#ethnode_node').on('change', function() {console.log(this.value);
  //$('#ethnode_node').hide();
  //$('.active_ethnode_node').show();
  if(this.value!='CUSTOM'){
    if(ethnode_name_list['http://'+this.value+'/']==undefined || hash==ethnode_name_list['http://'+this.value+'/']['alias'] || chain==ethnode_name_list['http://'+this.value+'/']['alias']){
      current_ethnode = this.value;
      $('.active_ethnode_node').html(current_ethnode);
      resetWW();
      w.postMessage(['change_node_ethnode', 'http://'+current_ethnode+'/']);
    }
    else {
      // oraclize.it / index.html -> service/monitor
      if(hash!=ethnode_name_list['http://'+this.value+'/']['alias']){
	var currentUrl = window.location.href.split('#')[0];
        window.location.href = currentUrl+"#"+ethnode_name_list['http://'+this.value+'/']['alias'];
        setTimeout(function (){ location.reload(); },250);
      }
    }
  }
  else {
    var custom_ethnode = prompt("Enter custom node");
    if(custom_ethnode!=null){
      $('#ethnode_node').append($('<option>', {
          value: custom_ethnode,
          text : custom_ethnode
      }));
      $('.active_ethnode_node').html(custom_ethnode);
      $('#ethnode_node').val(custom_ethnode);
      current_ethnode = custom_ethnode;
      resetWW();
      if(hash) w.postMessage(['change_ethnode_chain',hash]);
      w.postMessage(['change_node_ethnode', custom_ethnode]);
    }
    //$('#ethnode_node').hide();
    //$('#custom_ethnode_node').show();
    //w.postMessage(['change_node_ethnode', 'http://'+this.value+'/']);    
  }
});

// Select ipfs node
$('#ipfs_gateways').on('change', function() {
  //$('#ipfs_gateways').hide();
  //$('.active_ipfs_gateway').show();
  if(this.value!='CUSTOM'){
    current_ipfs = this.value;
    $('.active_ipfs_gateway').html(this.value);
    $('#ipfs_gateways').val(this.value.toString());
    w.postMessage(['change_node_ipfs', 'http://'+this.value+'/ipfs/']);
  }
  else {
    // IPFS Prompt manage
    var custom_ipfs = prompt("Enter custom node");
    if(custom_ipfs!=null){
      // Append the custom option to the select input
      $('#ipfs_gateways').append($('<option>', {
          value: custom_ipfs,
          text : custom_ipfs
      }));
      // Change the current ipfs with the (new) custom one
      current_ipfs = custom_ipfs;
      $('.active_ipfs_gateway').html(custom_ipfs);
      // update the select box
      $('#ipfs_gateways').val(custom_ipfs);
      w.postMessage(['change_node_ipfs', custom_ipfs,'custom']);
    }
  }
});

function resetWW(){
w.terminate();
w = new Worker("/scripts/widget_monitor.js");
w.onmessage = processWidgetEv;
}
