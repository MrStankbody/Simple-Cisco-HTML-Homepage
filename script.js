var info = [];
var stats = [];
var ports = [];


function Setup () {
// Host
	host = versLines.match(/^(.+?) /);
	if (host != null) {
		info.host = host[1];
	} else {
		info.host = 'Err:Host;'
	}
	host = null;
// Up Time
	up = versLines.match(/^.+?uptime is (.+)/);
	if (up != null) {
		info.up = up[1].split(",")[0];
	} else {
		info.up = 'Err:Time;'
	}
	up = null;
// Model
	mod = versLines.match(/.{13}(\S+-\S+-\S+)/);
	if (mod != null) {
		info.mod = mod[1];
	} else {
		info.mod = 'Err:Model;'
	}
	mod = null;
// Version
	ver = versLines.match(/.{32}(\S+\.\S+)/);
	if (ver != null) {
		info.ver = ver[1];
	} else {
		info.ver = 'Err:Version;'
	}
	ver = null;
// Main IP
	ip = vlanLine.match(/.{22}(\d+\.\d+\.\d+\.\d+)/);
	if (ip != null) {
		info.ip = ip[1];
	} else {
		info.ip = 'Err:Ip;'
	}
	ip = null;
// Cpu
	cpu = cpuLine.match(/.{34}(\d+)%/);
		if (cpu != null) {
			stats.push({str: "CPU</br>" + cpu[1] + "%", cls: "p" + Math.round(parseInt(cpu[1]) / 10) });
		} else {
			stats.push({str: "Err:CPU", cls:"p0"});
		}
    cpu = null;
// Memory Used
	numbs = memLine.match(/([0-9]+)/g);
	if (numbs != null) {
		mem = numbs[1] / numbs[0];
		stats.push({str: "MEMORY</br>" + Math.round( mem * 100 ) + "%", cls: "p" + Math.round(mem * 10)});
		mem = null;
	} else {
		stats.push({str: "Err:MEM", cls:"p0"});
	}
// Fan
	numbs = fanLines.split("\n");
	for (i = 0; i < numbs.length - 1; i++) {
		fanStatus = numbs[i].match(/(.+) is (.+)/);
		if (fanStatus != null) {
			stats.push({str: fanStatus[1] + "</br>" + fanStatus[2] , cls: fanStatus[2] == 'OK' ? "b10" : "b0"});
		} else {
			stats.push({str: "Err:FAN", cls:"p0"});
		}
	}
// Power
	numbs = powerLines.split("\n");
	for (i = 0; i < numbs.length - 1; i++) {
		powerStatus = numbs[i].match(/(\S+).+(Good|Not Present|No Input Power|Disabled)/);
		if (powerStatus != null) {
			stats.push({str: "PSU " + powerStatus[1] + "</br>" + powerStatus[2] , cls: powerStatus[2] == 'Good' ? "b10" : "b0"});
		} else {
			stats.push({str: "Err:PWR", cls:"p0"});
		}
	}
	numbs = null;
// Temperature
    temperature = tempLine.match(/Temperature Value: (\d+) /);
    if (temperature != null) {
		stats.push({str: "TEMPERATURE</br>" + Math.round((temperature[1] * 1.8) + 32) + "F" , cls: "p" + Math.round(parseInt(temperature[1]) / 10)});
	} else {
		stats.push({str: "Err:Temp", cls:"p0"});
	}
// Ports
    // get the number of ports and status
    lines = portLines.split("\n");
    for (i = 2; i < lines.length; i++) {
    	if (lines[i] == "") continue;
        if (lines[i].substr(0,10).match(/[\d/]+/) == null) continue;
        pType = lines[i].substr(67).trim();
        pStatus = lines[i].substr(29,13).trim();
        pName = lines[i].substr(0,10).trim();
  	    pSpeed = pStatus == "connected" ? lines[i].substr(59,8).match(/(\d+)/)[1] : 0;
  	    if (pType != "Not Present") {
  	        var port = {rx: 0, tx: 0, sts: pStatus, speed: pSpeed, cnt: 0, dvc: []};
			//var port = {name: pName, rx: 0, tx: 0, speed: pSpeed, cnt: 0, dvc: []};
        	ports[pName] = port;
  	    }
    }
    // get the number of devices for each port
    lines = deviceLines.split("\n");
    for (i = 2; i < lines.length; i++) {
    	if (lines[i] == "") continue;
    	if (lines[i].substr(36, 23).match(/[\d/]+/) == null) continue;
        dIp = lines[i].substr(0, 16).trim();
        dMac = lines[i].substr(16, 15).trim().replaceAll(".",":").toUpperCase();
        dVlan = lines[i].substr(31, 5).trim();
        dInt1 = lines[i].substr(36, 23).match(/(\S{2})\D+([\d/]+)/);
		dInt = dInt1[1]+dInt1[2];
        dSts = lines[i].substr(62).match(/(\S+)/)[1];
        
        var device = {ip: dIp, mac: dMac, vlan: dVlan, sts: dSts};
        ports[dInt].cnt++;
        ports[dInt].dvc.push(device);
    }
	device = null;
    // get the byte send and recieved for each ports
    lines = statLines.split("\n");
    for (i = 11; i < lines.length; i++) {
        sPort = lines[i].substr(2, 30).match(/(.{2})\D+([\d/]+)/);
        pName = sPort[1]+sPort[2];
		if (ports[pName] == undefined) continue;
     
        sData = lines[i].substr(23).split(/ +/);
		if ( sData[5] > 0 ) {
			x = sData[5] / 10000;
			y = x / ports[pName].speed;
			//y = 5;
			ports[pName].rx = Math.round(y);
		}
        if ( sData[7] > 0 ) {
			x = sData[7] / 10000;
			y = x / ports[pName].speed;
			//y = 5;
			ports[pName].tx = Math.round(sData[7] / ports[pName].speed / 10000);
		}

            //int in speed
            //int out speed
    }
	// print out system info
	t = document.getElementById('stats');
	s = info.host + " - " + info.ip + " - " + info.up;
	t.insertAdjacentHTML("afterBegin",  s);
	document.title = s;
	s = null;
	// print out system stats
	t = document.getElementById('infoTable');
	for (var s in stats) {
		t.insertAdjacentHTML("beforeEnd", "<div class='cell info " + stats[s].cls + "'><div>" + stats[s].str + "</div></div>");
	}
	
    // print out port status table
    t = document.getElementById('portTable');
    for(var p in ports) {
		var d = document.createElement("div");
		d.classList.add("cell");
    	d.insertAdjacentHTML("beforeEnd", "<h4>" + p + "</h4><div class='jack " + ports[p].sts + "'><a" + (ports[p].cnt > 0 ? " href='#devicesPort" + p + "'" : "") + ">" + ports[p].cnt + "</a><div class='lights'></div></div>");
		d.insertAdjacentHTML("beforeEnd", "<div class='bar'><div class='p" + ports[p].rx + "'><div>Rx</div></div><div class='p" + ports[p].tx + "'><div>Tx</div></div></div>");
		t.appendChild(d);		
	}
    // print out devices table
	
    t = document.getElementById('deviceTable')
    for(var p in ports) {
        if (ports[p].dvc.length > 0) {
    	    var dTable = 'IP Address        MAC Address       Vlan   Status\n';
    	    dTable +=    '---------------   --------------    ----   ------\n';
    	    dvcs = ports[p].dvc;
    	    for (var i in dvcs)  dTable += dvcs[i].ip.padEnd(18, " ") + dvcs[i].mac + "    " + dvcs[i].vlan.padEnd(7, " ") + dvcs[i].sts + "\n"
      	    t.insertAdjacentHTML("beforeEnd", "<h3 id='devicesPort" + p + "'>" + p + "</h3><div class='text'>" + dTable + "</div>");
        }
	}

// print out logs
    lines = logLines.split("\n");
    t = document.getElementById('logTable');
    for (i = 0; i < lines.length; i++) {
    	ln = lines[i]
    	if (ln != "" ) t.insertAdjacentHTML("afterbegin", ln.replace(/^\*/, "") + "\n");
    }
// print out config
    lines = configLines.split("\n");
    t = document.getElementById('configTable');
    for (i = 1; i < lines.length; i++) {
    	ln = lines[i]
    	if (ln != "" ) t.insertAdjacentHTML("beforeEnd", ln + "\n");
    }

}