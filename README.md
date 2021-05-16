# cf_fast_ip_worker.js
  local test cf ip speed,upload ip and speed to cf worker,get proxies form cf worker which use by clash provider or v2rayN
* 1.create cf KV named CF_FAST_IP
* 2.create cf worker 
* 3.bind KV and worker,Variable name:CF_FAST_IP,KV namespace select CF_FAST_IP
* 4.edit worker,set CF_KV = CF_FAST_IP,pwd = "url password",and set vmess config: uuid,path,host
* 5.rename worker,set url like: cf_fast_ip.yourworker.workers.dev
* 6.add url to shell end, replace key value to pwd value, windows like: curl --retry 3 -s https://cf_fast_ip.yourworker.workers.dev/?method=set^&key=abc^&ip=%anycast%^&speed=%realbandwidth% -o nul ,
* 7.run shell
* 8.get proxy url like: https://cf_fast_ip.yourworker.workers.dev/?key=abc&method=get&len=8&type=clash
