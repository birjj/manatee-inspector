# Manatee DOM Inspector

A custom implementation of a devtools-like DOM inspector for [Sirenia's Manatee RPA application](https://www.sirenia.eu/).  
Useful for when you need a closer look at how Manatee sees the application, but don't want to trawl through kilobytes of JSON data.

<p align="center"><img src="https://user-images.githubusercontent.com/4542461/161786510-8f4f14eb-9ca1-4d81-974c-e9e84b15ddc3.png" width="596" /></p>

## Usage

In order for the application to communicate with the local Manatee instance, it needs to know which ports to open a WebSocket connection to. Currently these ports can be found using the `ManateeDiscoverer.exe` application, found in `<ManateeInstallDir>\Tools\NativeHost\Discoverer\ManateeDiscoverer.exe`. The ports returned by this application must be given to the DOM inspector through the search parameters `manateePort` and `manateePortSecure` respectively. An example of how to do this is the following flow code:

```js
var INSPECTOR_URL = "https://manatee-inspector.jfagerberg.me";

function openInChrome(url) {
  return Processes.spawn(
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    [
      "--new-window",
      "--app="+JSON.stringify(url)
    ].join(" ")
  );
}

function getManateePorts() {
  // NOTE: you should replace this path with whatever path your ManateeDiscoverer.exe is located at
  var p = Processes.spawn("C:\\Program Files (x86)\\Sirenia\\Manatee\\prod-rsd+epjsyd\\Tools\\NativeHost\\Discoverer\\ManateeDiscoverer.exe");
  p.stdin("\x1f\x00\x00\x00"+JSON.stringify({data:{message:"port"}}));
  var outp = null;
  p.stdout(1).then(function(line){
    outp = ""+line;
    p.kill();
  });
  p.wait(500);
  outp = outp.substring(4);
  var data;
  try {
    data = JSON.parse(outp);
  } catch (e) {
    throw new Error("Failed to parse JSON from ManateeDiscoverer: "+outp);
  }
  return JSON.parse(outp).data;
}

function run() {
  var ports = getManateePorts();
  openInChrome(INSPECTOR_URL+"?manateePort="+ports.port+"&manateePortSecure="+ports.securePort);
}

run();
```
