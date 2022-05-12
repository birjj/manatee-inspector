# Manatee DOM Inspector

A custom implementation of a *Chrome devtools*-like inspector for [Sirenia's Manatee RPA application](https://www.sirenia.eu/).  
Useful for when you need a closer look at how Manatee sees the application, or need a debugger capable of remembering code and displaying complex objects.

<p align="center"><img src="https://user-images.githubusercontent.com/4542461/168109902-7348f712-f109-424c-9516-6ee380e4bddc.png" /></p>

Currently consists of 3 pages:

### Inspect

Shows a tree view of a selected field. The displayed is the output of running `.inspect()` on the field the user selects, and can optionally use the `useCachedUI` or `collectTexts` options. Any element in the tree can be selected to see its properties.

### Selector

An attempt at a UI for choosing the most appropriate selcetor for the chosen field. In development, currently on limited use.

### Console

A debugger capable of running arbitrary code in Manatee and displaying the returned data. Compared to the built-in debugger this saves you from running `JSON.stringify()` on the data you want to debug, and remembers the entered code across restarts.

## Usage

In order for the application to communicate with the local Manatee instance, it needs to know which ports to open a WebSocket connection to. Currently these ports can be found using the `ManateeDiscoverer.exe` application, found in `<ManateeInstallDir>\Tools\NativeHost\Discoverer\ManateeDiscoverer.exe`. The ports returned by this application must be given to the DOM inspector through the search parameters `manateePort` and `manateePortSecure` respectively.

It is recommended to create a flow to open the application with the correct search parameters:

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
  return data.data;
}

function run() {
  var ports = getManateePorts();
  openInChrome(INSPECTOR_URL+"?manateePort="+ports.port+"&manateePortSecure="+ports.securePort);
}

run();
```
