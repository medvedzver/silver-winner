var http = require('http');
var exec = require('child_process').exec;
var execSync =  require('child_process').execSync;
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');


const PORT=8080;

function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
}

function handleRequest(request, response){
    var vms = get_vms()
    var target = get_target()
    var json = {
        "url": target,
        "vms": vms
    }

    // response.writeHead(200, {"Content-Type": "application/json"});
    // var json = JSON.stringify({
    //     anObject: otherObject,
    //     anArray: otherArray,
    //     another: "item"
    // });
    response.end(JSON.stringify(json));
}

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});

return

function get_target() {
    var target_buff = execSync("bosh target")
    var target = decoder.write(target_buff)
    return target.substring("Current target is ".length)
}

function get_vms() {
    var vms_buff = execSync("bosh vms --vitals")
    var vms_out = decoder.write(vms_buff)
    return parse_vms(vms_out)
}

function parse_vms(input) {
    lines = input.split("\n")
    if (lines.length < 3) {
        return {}
    }

    deployment_line = lines[0]
    result = []
    i = 10
    while(true) {
        vm_line = lines[i]
        if (vm_line.startsWith("|")) {
            i += 2
            vm_values = vm_line.split("|")
            job = vm_values[1].trim()
            state = vm_values[2].trim()
            ip_addr = vm_values[4]
            cpu = vm_values[6]
            mem_usage = vm_values[9]
            result.push(
                {
                    "name" : job, "state": state, "ip": ip_addr, "cpuUser": cpu, "ram":mem_usage, "ephemeralDiskUsage": "42%"
                }
            )
        } else {
            return result
        }
    }
}
