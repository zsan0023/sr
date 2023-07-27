Object.defineProperty(navigator,'userAgent',{get:function(){return Math.random().toString(36).slice(2)}})
mimc_appId = "2882303761517669588";
mimc_appSecret = "b0L3IOz/9Ob809v8H2FbVg==";
mimc_appKey = "5111766983588";
mimc_appAccount = "";
var groupData = 0;
function noop(){}
ucurl = 'https://mimc.chat.xiaomi.net/api/uctopic';

function fetchMIMCToken() {
    var sendData = {appId:mimc_appId,appKey:mimc_appKey,appSecret:mimc_appSecret,appAccount:mimc_appAccount};
    return httpRequest('https://mimc.chat.xiaomi.net/api/account/token', sendData);
}

function httpRequest(url, data) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, false);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(JSON.stringify(data));
    return JSON.parse(xhr.response);
}

function login(value,fn,uc) {
    mimc_appAccount = value;
    user = new MIMCUser(mimc_appId, mimc_appAccount);
    user.registerP2PMsgHandler(noop);
    user.registerGroupMsgHandler(noop);
    user.registerFetchToken(fetchMIMCToken);
    user.registerStatusChange(fn || noop);
    user.registerServerAckHandler(noop);    
    user.registerDisconnHandler(noop);
    user.registerUCDismissHandler(noop);
    user.registerUCJoinRespHandler(uc || noop);
    user.registerUCMsgHandler(noop);
    user.registerUCQuitRespHandler(noop);
    user.registerPullNotificationHandler(noop);
    user.login();
}
function joinUCGroup(value) {
    var topicID = value;
    var context = "testtest";
    user.joinUnlimitedGroup(topicID, context);
}

function quitUCGroup(value) {
    var topicID = value;
    var context = "testtest";
    user.quitUnlimitedGroup(topicID, context);
}

function createUCGroup(value,fn) {
    var groupName = value;
    var context = "testtest";
    user.createUnlimitedGroup(groupName, fn , context);
}
function queryGroupList(fn) {
    var tokenInfo = fetchMIMCToken();
    var userToken;
    if (tokenInfo.code === 200) {
        userToken = tokenInfo.data.token;
    } else {
        console.log("query toeken failed.");
        userToken = "";
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', ucurl + '/topics', true);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.setRequestHeader('token', userToken);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var result = JSON.parse(xhr.response);
            if(result.data[0]){
                groupData =  result.data[0];
                fn && fn(groupData);
            }else{
                createUCGroup("",function(e){groupData = e;fn(e)});
            }
        } else if (xhr.status !== 200){
            console.log('fail')
        }
    };
    xhr.send();
}

function queryGroupMember(value,fn) {
    var topicId = value;
    var tokenInfo = fetchMIMCToken();
    var userToken;
    if (tokenInfo.code === 200) {
        userToken = tokenInfo.data.token;
    } else {
        console.log("query toeken failed.");
        userToken = "";
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', ucurl + '/userlist', true);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.setRequestHeader('token', userToken);
    xhr.setRequestHeader('topicId', topicId);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var result = JSON.parse(xhr.response);
            console.log(e = result)
            fn && fn(result.data.members.map(function(x){return x.appAccout}));
        } else if (xhr.status !== 200){
            console.log('fail')
        }
    };
    xhr.send();
}

function getGroup(value,fn){
    login(value,function(){
        queryGroupList(fn)
    });
}
function sendData(value,fn,gp){
    if(!groupData) return;
    if(typeof value == 'object') value = JSON.stringify(value);
    if(typeof value != 'string') value = value.toString();
    login(value,function(){joinUCGroup(gp || groupData)},fn);
}
function getData(fn,data){
    if(!groupData) return;
    queryGroupMember(data || groupData,fn);
}
