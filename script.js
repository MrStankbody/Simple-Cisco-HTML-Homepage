var ports = [];


function Setup () {
// CPU
	cpuUsage = cpuLine.substring(34).match(/^\d+/)[0]
    c = document.getElementById('cpuUsage');
    c.classList.add('p' + Math.ceil(cpuUsage / 10));
    c = document.getElementById('cpuUsageText');
    c.innerText = cpuUsage + '%';
    c = null;
// Memory
    memUsage = Math.floor( memLine.match(/.+Free:   (\d+)/)[1] / memLine.match(/.+Total:   (\d+) /)[1] * 100 );
    m = document.getElementById('memUsage');
    m.classList.add('p' + Math.ceil(memUsage / 10));
    m = document.getElementById('memUsageText');
    m.innerText = memUsage + '%';
    m = null;
// Fan
    lines = sysLines.split("\n");
    fanStatus = (lines[0] == "FAN is OK");
    f = document.getElementById('fanStatus');
    f.classList.add('b' + (fanStatus ? 'OK' : 'BAD'));
    f = document.getElementById('fanStatusText');
    f.innerText = (fanStatus ? 'OK' : 'BAD');
    f = null;
// Temperature
    temperature = lines[1].match(/Temperature Value: (\d+) /)[1];
    t = document.getElementById('temperature');
    t.classList.add('p' + Math.ceil(temperature / 10));
    t = document.getElementById('temperatureText');
    t.innerText = temperature + 'F';
    t = null;
// Ports
    // get the number of ports and status
    lines = portLines.split("\n");
    for (i = 2; i < lines.length; i++) {
    	if (lines[i] == "") continue;
        if (lines[i].substr(0,10).match(/[0-9/]+/) == null) continue;
        pType = lines[i].substr(67).trim();
        pStatus = lines[i].substr(29,13).trim();
        pName = lines[i].substr(0,10).match(/[0-9/]+/)[0];
  	    pSpeed = pStatus == "connected" ? lines[i].substr(59,8).match(/[0-9]+/)[0] : 0;
  	    if (pType != "Not Present") {
  	        var port = {name: pName, speed:pSpeed, fullName: "", rx: 0, tx: 0, sts: pStatus, cnt: 0, dvc: []};
        	ports[pName] = port;
  	    }
    }
    // get the number of devices for each port
    lines = deviceLines.split("\n");
    for (i = 2; i < lines.length; i++) {
    	if (lines[i] == "") continue;
    	if (lines[i].substr(37, 23).match(/[0-9/]+/) == null) continue;
        dIp = lines[i].substr(0, 16).trim();
        dMac = lines[i].substr(16, 16).trim();
        dVlan = lines[i].substr(32, 5).trim();
        dInt = lines[i].substr(37, 23).match(/[0-9/]+/)[0];
        //pFullName = lines[i].substr(37, 23).trim();
        dSts = lines[i].substr(60);
        
        var device = {ip: dIp, mac: dMac, vlan: dVlan, sts: dSts};
        ports[dInt].cnt++;
        //ports[dInt].fullName = pFullName;
        ports[dInt].dvc.push(device);
    }
    // get the byte send and recieved for each ports
    lines = statLines.split("\n");
    for (i = 2; i < lines.length; i++) {
        sPort = lines[i].substr(2, 23).match(/[0-9/]{3,}/);
        //is it an int line?       
        if (sPort != null) {
            pName = sPort[0];
            pFullName = lines[i].substr(2, 23).trim();
            if (ports[pName] == undefined) break;
            ports[pName].fullName = pFullName;
            sData = lines[i].substr(25).split(/ +/);
            ports[pName].rx = Math.ceil(sData[4] / 100000 * ports[pName].speed);
            ports[pName].tx = Math.ceil(sData[6] / 100000 * ports[pName].speed);
        }

            //int in speed
            //int out speed
    }

    // print out port status table
    t = document.getElementById('portStatus');
    for(var p in ports) {
    	t.insertAdjacentHTML("beforeEnd", "<div class='twtfi'><h4>" + ports[p].name + "</h4><div class='" + ports[p].sts + "'><a href='#devicesPort" + ports[p].name + "'>" + ports[p].cnt + "</a></div></div>");
	}
    //print out speed table
    t = document.getElementById('portUtilization');
    for(var p in ports) {
    	t.insertAdjacentHTML("beforeEnd", "<div class='twtfi'><h4>" + ports[p].name + "</h4><div class='p" + ports[p].rx + "'><div>Rx</div></div><div class='p" + ports[p].tx + "'><div>Tx</div></div></div>");
	}
    // print out devices table
    t = document.getElementById('deviceTable')
    for(var p in ports) {
        if (ports[p].dvc.length > 0) {
    	    var dTable = 'IP Address      MAC Address     Vlan  Status\n';
    	    dTable +=    '-------------   --------------    -   --------\n';
    	    dvcs = ports[p].dvc;
    	    for (var i in dvcs)  dTable += dvcs[i].ip.padEnd(16, " ") + dvcs[i].mac.toUpperCase() + "    " + dvcs[i].vlan.padEnd(4, " ") + dvcs[i].sts + "\n"
      	    t.insertAdjacentHTML("beforeEnd", "<h3 id='devicesPort" + ports[p].name + "'>" + ports[p].fullName + "</h3><div class='text'>" + dTable + "</div>");
        }
	}

// print out logs
    lines = logLines.split("\n");
    t = document.getElementById('logTable');
    for (i = 1; i < lines.length; i++) {
    	ln = lines[i]
    	t.insertAdjacentHTML("afterbegin", ln.replace(/^\*/, "") + "\n");
    }
// print out config
    lines = configLines.split("\n");
    t = document.getElementById('configTable');
    for (i = 1; i < lines.length; i++) {
    	ln = lines[i]
    	if (ln != "" ) t.insertAdjacentHTML("beforeEnd", ln + "\n");
    }

}