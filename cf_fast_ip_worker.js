
//key: password,verify who has access
//method: set or get,default:get
//
//ip: fast cf ip,only method is set
//speed: the ip speed,only method is set
//
//len: get how many proxies,only method is get.default:10
//type: clash or v2ray,only method is get.default:clash
//      clash only use by clash provider,v2ray only use by v2rayN
//example: 
//  https://cf_fast_ip.example.workers.dev/?key=abc&method=set&ip=1.1.1.1&speed=33
//  https://cf_fast_ip.example.workers.dev/?key=abc&method=get&len=8&type=clash

//CF_KV: worker settings bind KV namespace
CF_KV = CF_FAST_IP
//pwd: verify who has access
pwd = "cb0d81a5c10a483b90c89bbe7bd4bd43"
//proxy config
uuid="f579ccda-1a00-4c94-bfcf-cd96ee043e39"
path="/ws"
host="cf.example.com"

addEventListener('fetch', function(event) {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  var searchParams = new URL(request.url).searchParams
  var key = searchParams.get("key")
  var method = searchParams.get("method")
  if(key == pwd){
    switch (method) {
      case "set":
        return set(request)
      case "get":
        return get(request)
      default:
        return get(request)
    }
  }else{
    return new Response("error key")
  }
}

async function set(request){
  var searchParams= new URL(request.url).searchParams
  var ip = searchParams.get("ip")
  var speed = searchParams.get("speed")
  if(!isValidIP(ip)){
    return new Response("error ip")
  }
  var oneip=JSON.stringify({"ip":ip,"date":getdate(),"speed":speed})
  var allip = await CF_KV.get("ips",{type: "json"})
  if(allip === null){
    allip =[]
  }
  allip.unshift(oneip)
  await CF_KV.put("ips",JSON.stringify(allip))
  return new Response("ok")
}

async function get(request){
  var allip = await CF_KV.get("ips",{type: "json"})
  if(allip ===null){
    return new Response("no ip")
  }
  var searchParams= new URL(request.url).searchParams
  var len = searchParams.get("len")
  if(len === null){
    len = 10
  }
  len = Math.min(len,allip.length)
  var result=[]
  for(i=0;i<len;i++){
    result.push(allip[i])
  }
  var type = searchParams.get("type")
  switch (type) {
      case "clash":
        return new Response(getClash(result))
      case "v2ray":
        return new Response(getV2ray(result))
      default:
        return new Response(getClash(result))
    }
}

function getClash(ips){
  var proxies="proxies:\n"
  for(i=0;i<ips.length;i++){
    ip = JSON.parse(ips[i])
    if(ipVersion(ip.ip)=="ipv4"){
      tempIp = ip.ip;
    }else if(ipVersion(ip.ip)=="ipv6"){
      tempIp = ip.ip.substr(0,findStrIndex(ip.ip,":",2));
    }
    proxies += "  - {name: \""+tempIp+"|"+ip.date+"|"+ip.speed+"\", server: "+ip.ip+
      ", port: 443, type: vmess, uuid: "+uuid+
      ", alterId: 8, cipher: auto, tls: true, network: ws, ws-opts: {path: "+path+
      ", headers: {Host: vm-ag.gniq.pp.ua}}}\n"
  }
  return proxies
}

function getV2ray(ips){
  var proxies = ""
  for(i=0;i<ips.length;i++){
    ip = JSON.parse(ips[i])
    proxies += "vmess://" + btoa(JSON.stringify({
      "v": "2",
      "ps": ip.ip+"|"+ip.date+"|"+ip.speed,
      "add": ip.ip,
      "port": "443",
      "id": uuid,
      "aid": "8",
      "net": "ws",
      "type": "none",
      "host": host,
      "path": path,
      "tls": "tls",
      "sni": ""
    })) + "\n"
  }
  return btoa(proxies)
}

function getdate(){
  var timezone = 8
  var offset_GMT = new Date().getTimezoneOffset()
  var nowDate = new Date().getTime()
  var targetDate = new Date(nowDate + offset_GMT * 60 * 1000 + timezone * 60 * 60 * 1000)
  return targetDate.getMonth()+1+"/"+targetDate.getDate()+"_"+targetDate.getHours()+":"+targetDate.getMinutes()
}

function isValidIP(ip) {
    return ipVersion(ip) != "error"
} 

function ipVersion(ip) {
    var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    var regv6 = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
    if(reg.test(ip)){
      return "ipv4";
    }else if(regv6.test(ip)){
      return "ipv6";
    }else {
      return "error";
    }
} 
/**
 * 查找字符串第几次出现的位置
 * @param {Object} str 源字符串
 * @param {Object} cha 要查询的字符或字符串
 * @param {Object} num 第几次出现，第一次则为 0
 */
function findStrIndex(str, cha, num) {
    let x = str.indexOf(cha);
    for (let i = 0; i < num; i++) {
        x = str.indexOf(cha, x + 1);
    }
    return x;
}
