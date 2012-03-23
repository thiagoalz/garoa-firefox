const data = require("self").data;

var statusPanel = require("panel").Panel({
  width:350,
  height:350,
  contentURL: "http://status.garoa.net.br"
});

var mainWidget;
var req;
var last_status = 0;
var garoa_api_url = "https://garoahc.appspot.com/status";

//////////////////////////////////////////////////
function is_garoa_open(status){
    //returnStatus
    //0 - Closed - Unknown
    //1 - Closed
    //2 - Open - Unknown
    //3 - Open
    var returnStatus = 0;
	
    var data = status.json;

    var strStatus = "closed";
    var strUnknown = " (Unknown)";
    if(data.open){
        returnStatus = 2;
        strStatus="open";
    }
	
	//Print Date
	var dateLastchange = new Date(data.lastchange*1000); //need to *1000 to convert from unix time
	console.log("Last Update: " + dateLastchange);
	
	//Check lastchange Date
	var decayTime= 20 * 60 * 1000; //20 min
	if( (new Date().getTime() - (data.lastchange *1000) ) < decayTime ){
		returnStatus++;
		strUnknown="";
	}

    console.log("Garoa is " + strStatus + strUnknown);
    return returnStatus;
}
//////////////////////////////////////////////////////////////

function myMain() {
    var Request = require("request").Request;
    var statusRequest = Request({
        url: garoa_api_url,
        onComplete: function (response) {
            handleResponse(response)
        }
    }).get();
}

function handleResponse(response) {
    status = is_garoa_open(response);

    console.log('status ' + status);
    console.log('last_status '+ last_status);
	
    if(status != last_status){
        notify(status);	
        console.log('changed status to ' + status);		
    }else{
        console.log('do nothing');
    }
	
    change_icon(status);
    last_status = status;
}

function change_icon(status){
 
    var icon;
		
    status=parseInt(status);
    switch(status){
        case 0:
            icon = "icon_closed_y.png";
            break;
        case 1:
            icon = "icon_closed.png";
            break;
        case 2:
            icon = "icon_open_y.png";
            break;
        case 3:
            icon = "icon_open.png";
            break;
        default:
            icon = "icon_closed_y.png";
	}

        mainWidget.contentURL=data.url(icon);  
}


function notify(status){
    var header = "Garoa Hacker Clube"
    var msg;
    var icon;
	
	status=parseInt(status);
	switch(status){
		case 0:
			icon = "icon_closed_y.png";
			msg = "is closed! (Unknown)";
		break;
		case 1:
			icon = "icon_closed.png";
			msg = "is closed!";
		break;
		case 2:
			icon = "icon_open_y.png";
			msg = "is open! (Unknown)" ;
		break;
		case 3:
			icon = "icon_open.png";
			msg = "is open!" ;
		break;
		default:
			icon = "icon_closed_y.png";
			msg = "is closed! (Unknown)";
	}

	var notifications = require("notifications");
	var self = require("self");
	var myIconURL = self.data.url(icon);
	notifications.notify({
  		text: header+" "+msg,
  		iconURL: myIconURL,
	});

    /*var notification = webkitNotifications.createNotification(
        icon,
        header,
        msg
    );
    notification.onclick = function () { 
        chrome.tabs.create({url: "https://garoa.net.br"}); 
        notification.cancel();
    };
    notification.ondisplay = function () {
        setTimeout(function () { notification.cancel() }, 4000);
    };
    notification.show();
*/
}

///////////////////////////////////////////////////////////////////

let mainWidget = require("widget").Widget({
    id: "garoaStatus",
    label: "Garoa Status",
    contentURL: data.url("icon-small.png"),
    panel: statusPanel,
    contentScriptWhen: "ready",
    contentScript:   'self.postMessage("Ola");' +
                     'setTimeout(function() {' +
                     ' self.postMessage("Ola");' +
                     '}, 1 * 60 * 1000);',
    onMessage: function(myMessage) {
        console.log('Message received');
        myMain();
    }
});
