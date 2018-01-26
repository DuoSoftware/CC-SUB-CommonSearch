/**
 * Created by suvethan on 19/01/2018
 */

var config = require('config');
var log = require('npmlog');
var logfile = require('npmlog-file');

var moment = require('moment-timezone');
var promise = require("promise");
var request = require('request');



const server = config.DatabaseElastic.server;
const user=config.DatabaseElastic.user;
const password = config.DatabaseElastic.password;
const httpHost = config.Host.httpHost;



exports.addIndex = function (data,app,product,domain) {
    var promise=new Promise(function(resolve,reject){
        try{
            var option={
                method:'POST',
                uri:httpHost+user+':'+password+'@'+server+'/'+product+'-'+domain+'-'+app+'/'+product+'-'+domain+'-'+app,
                headers:{
                    'Content-type':'application/json'
                },
                body: JSON.stringify(data)
            }

            request(option,function(err,res,body){
               // console.log(body);
                // var status=body.split("\n")[3].split("=").pop("=");
                // if(!err && status.toLowerCase()=="true"){
                //     var authToken=body.split("\n")[2].split("=").pop("=");
                //     resolve(authToken);
                // }else{
                //     reject(null);
                // }
                resolve(body);
            });
        }catch (ex) {
           reject(ex);
        }
    });
    return promise;
}



exports.searchData = function (data,app,product,domain) {
        var promise = new Promise(function(resolve,reject){
            try {
                var option={
                    method:'POST',
                    uri:httpHost+user+':'+password+'@'+server+'/'+product+'-'+domain+'-'+app+'/'+product+'-'+domain+'-'+app+'/_search',
                    headers:{
                        'Content-type':'application/json'
                    },
                    body:JSON.stringify(data)
                }

                request(option,function(err,res,body){
                    //console.log(body);
                    resolve(body);
                });
                
            } catch (ex) {
                reject(ex);
            }
        });
        return promise;
}

exports.deleteDataById = function (id,app,product,domain) {
    var promise = new Promise(function(resolve,reject){
        try {
            var option={
                method:'DELETE',
                uri:httpHost+user+':'+password+'@'+server+'/'+product+'-'+domain+'-'+app+'/'+product+'-'+domain+'-'+app+'/'+id,
                headers:{
                    'Content-type':'application/json'
                }
            }

            request(option,function(err,res,body){
                //console.log(body);
                resolve(body);
            });
            
        } catch (ex) {
            reject(ex);
        }
    });
    return promise;
}


function WriteLog(msg, isInfo) {
    if (isInfo)
        log.info(moment(new Date()).format("YYYY-MM-DD hh:mm:ss A"), msg);
    else
        log.error(moment(new Date()).format("YYYY-MM-DD hh:mm:ss A"), msg);
    if (config.Admin.LOG_ENABLE == "1") {
        logfile.write(log, config.Host.logfilepath);
    }
}
