/**
 * Created by Suvethan on 1/9/2018.
 */

var express = require('express');
var config = require('config');
var router = express.Router();
var request = require('request');
var expressSession = require('express-session');
var adal = require('adal-node');
var async = require('async');
var bunyan = require('bunyan');
var http=require('http');
var log = bunyan.createLogger({name: "commonsearch"});
var uniqid = require('uniqid');
var moment = require('moment');
var winston = require('winston');
var jwt = require("jwt-decode");
// var jwt = require('jsonwebtoken');
var awsHandler = require('./awsHandler');
// var auth=require('./auth');
var queryModel=require('../public/models/QueryModel');
var csModel=require('../public/models/CSModel');

var UserDeleteRetry= new Array();

router.use(expressSession({ secret: 'keyboard cat', resave: true, saveUninitialized: false }));

function WriteLog(msg, isInfo) {
    if (isInfo)
        log.info(moment(new Date()).format("YYYY-MM-DD hh:mm:ss A"), msg);
    else
        log.error(moment(new Date()).format("YYYY-MM-DD hh:mm:ss A"), msg);
    if (config.Admin.LOG_ENABLE == "1") {
        if (isInfo){
            winston.info(msg);
        }else{
            winston.error(msg);
        }
    }
}


//2018-01-09
const server = config.DatabaseElastic.server;
const user=config.DatabaseElastic.user;
const password = config.DatabaseElastic.password;
const httpHost = config.Host.httpHost;

function getToken(value){
    var promise=new Promise(function(resolve,reject){
        try {
            var option={
                method:'GET',
                uri:accountUrl+'apiauthtoken/nb/create?SCOPE='+scope+'&EMAIL_ID='+value.username+'&'+'PASSWORD='+value.password,
                headers:{
                    'Content-type':'application/x-www-form-urlencoded'
                }
            }

            request(option,function(err,res,body){
                var status=body.split("\n")[3].split("=").pop("=");
                if(!err && status.toLowerCase()=="true"){
                    var authToken=body.split("\n")[2].split("=").pop("=");
                    resolve(authToken);
                }else{
                    reject(null);
                }
            });
            //console.log(option);
        } catch (ex) {
            reject(ex);            
        }
    });
    return promise;
}

router.post('/create', function(req, response){
    try {
            // auth.validateAuth(req.headers.domain,req.headers.idtoken,function(err,data){
            //     var domain=data;
            //     var decoded = jwt(req.headers.idtoken);
            //     if(domain!=undefined && domain !=""){
                    var requestData=req.body;
                    var app=req.headers.application;
                    var product=req.headers.product;
                    var domain=req.headers.domain;
                        // var userId=jwt(req.headers.idtoken).oid;
                        // var authObj=mapAuthData(token,requestData.organizationId,domain,userId);
                        awsHandler.addIndex(requestData,app,product,domain).then(function(data){
                            var result=JSON.parse(data);
                            if(result._id !=undefined && result._id !=""){
                                response.status(201).send({"status": true, "id": result._id,"message":"Record added successfully"});
                            }
                            else {
                                response.status(result.status).send({"status": true, "message":"Error while adding"});
                            }
                        });
                // }
                // else{
                //     response.send({"status": false, "error": 'Unautherized Access- Auth is not validated'}) ;
                // }
            // })
    } catch (ex) {
        WriteLog('Get accees token failed. (Error - ' + ex.message + ')', false);
        response.status(500).send({"status": false, "message": 'Internal server error'}) ;
    }
});

router.post('/search', function(req, response){
    try {
            // auth.validateAuth(req.headers.domain,req.headers.idtoken,function(err,data){
            //     var domain=data;
            //     var decoded = jwt(req.headers.idtoken);
            //     if(domain!=undefined && domain !=""){
                    var requestData=req.body;
                        // var userId=jwt(req.headers.idtoken).oid;
                        var app=req.headers.application;
                        var product=req.headers.product;
                        var domain=req.headers.domain;
                        var searchObj=mapSearchData(requestData,'must');
                        awsHandler.searchData(searchObj,app,product,domain).then(function(res){
                            var result={};
                            var data=JSON.parse(res);
                            if(data.hits !=undefined && data.hits !=""){
                                var resArr=data.hits.hits;
                                for(i=0;i<resArr.length;i++){
                                    result=resArr[i]._source;
                                }
                                response.status(200).send({"status": true, "result": result,"message":"Record found"}) ;
                            }
                            else {
                                response.status(data.status).send({"status": false, "result": [],"message":"No record found"}) ;
                            }
                        });
                // }
                // else{
                //     response.send({"status": false, "error": 'Unautherized Access- Auth is not validated'}) ;
                // }
            // })
    } catch (ex) {
        WriteLog('Get accees token failed. (Error - ' + ex.message + ')', false);
        response.status(500).send({"status": false, "message": 'Internal server error'}) ;
    }
});

router.post('/searchAll', function(req, response){
    try {
            // auth.validateAuth(req.headers.domain,req.headers.idtoken,function(err,data){
            //     var domain=data;
            //     var decoded = jwt(req.headers.idtoken);
            //     if(domain!=undefined && domain !=""){
                    var requestData=req.body;
                        // var userId=jwt(req.headers.idtoken).oid;
                        var app=req.headers.application;
                        var product=req.headers.product;
                        var domain=req.headers.domain;
                        var searchObj=mapSearchData(requestData,'should');
                        awsHandler.searchData(searchObj,app,product,domain).then(function(res){
                            var result=[];
                            var data=JSON.parse(res);
                            if(data.hits !=undefined && data.hits !=""){
                                var resArr=data.hits.hits;
                                for(i=0;i<resArr.length;i++){
                                    result[i]=resArr[i]._source;
                                }
                                response.status(200).send({"status": true, "result": result});
                            }
                            else {
                                response.status(data.status).send({"status": false, "result": [],"message":"No record found"}) ;
                            }
                        });
                // }
                // else{
                //     response.send({"status": false, "error": 'Unautherized Access- Auth is not validated'}) ;
                // }
            // })
    } catch (ex) {
        WriteLog('Get accees token failed. (Error - ' + ex.message + ')', false);
        response.status(500).send({"status": false, "message": 'Internal server error'}) ;
    }
});


function mapSearchData(data,type){
    var query=new queryModel.Query();
    var conn=new queryModel.Condition();
    if(type=="must")
        conn.must=data.searchData;
    else if(type=="should")
        conn.should=data.searchData;

    query.bool=conn;
    var searchData=new csModel.SearchData();
    searchData.from=data.skip;
    searchData.size=data.take;
    searchData.query=query;
    return searchData;
}


router.delete('/deleleById', function(req, response){
    try {
            // auth.validateAuth(req.headers.domain,req.headers.idtoken,function(err,data){
            //     var domain=data;
            //     var decoded = jwt(req.headers.idtoken);
            //     if(domain!=undefined && domain !=""){
                    var requestData=req.body;
                    var id=requestData.id;
                    var app=req.headers.application;
                    var product=req.headers.product;
                    var domain=req.headers.domain;
                        awsHandler.deleteDataById(id,app,product,domain).then(function(res){
                            var result=[];
                            var data=JSON.parse(res);
                            if(data.result =='deleted'){
                                response.status(200).send({"status": true, "message": "Record deleted successfully"});
                            }
                            else {
                                response.status(200).send({"status": false, "result": [],"message":"No record found"}) ;
                            }
                        });
                // }
                // else{
                //     response.send({"status": false, "error": 'Unautherized Access- Auth is not validated'}) ;
                // }
            // })
    } catch (ex) {
        WriteLog('Get accees token failed. (Error - ' + ex.message + ')', false);
        response.status(500).send({"status": false, "message": 'Internal server error'}) ;
    }
});



module.exports = router;