const express = require('express');
var path=require('path');
const app = express();
app.use(express.static(path.join(__dirname,'/')));
var request=require('request');
const https = require('https');
const http = require('http'); 

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/geonames', function(req, res){
 var infoURL=req.query.url;
  http.get(infoURL, (response)=>{
   var data="";
   response.on('data',function(chunk){
    data+=chunk;
   });
   response.on('end',function(){
    res.send(data);//res.JSON
   });
  });
  return;
 });

app.get('/showitems', function(req, res){
    var myAPI = "ChuanziH-csci571p-PRD-c16de56b6-2b65e3cb";
    var zipcode = (req.query.location==0)?req.query.cur_zipcode:req.query.number;
    var_category=var_location=var_shipping=var_pickup=var_cond="";
    // var category_id = -1;
    if (req.query.category!="all"){ // sync, no need to check isset
        switch (req.query.category) {
            case 'art':
                category_id = 550;break;
            case 'baby':
                category_id = 2984;break; 
            case 'books':
                category_id = 267;break; 
            case 'clothing':
                category_id = 11450;break; 
            case 'computers':
                category_id = 58058;break; 
            case 'health':
                category_id = 26395;break;                                                             
            case 'music':
                category_id = 11233;break;  
            case 'video':
                category_id = 1249;break;                       
            default:
                category_id = -1;break;
        }
        var_category="&categoryId=" + category_id;
    }
    
    var i=0; 
    
    var_location="&buyerPostalCode=" + zipcode + "&itemFilter(" + i + ").name=MaxDistance&itemFilter(" + i + ").value=" + req.query.miles;
    i++;
    
    if (req.query.shipping){
        var_shipping="&itemFilter(" + i + ").name=FreeShippingOnly&itemFilter(" + i + ").value=true";
        i++;
    }
    if (req.query.pickup){
        var_pickup="&itemFilter(" + i + ").name=LocalPickupOnly&itemFilter(" + i + ").value=true";
        i++;
    }
    var var_dup="&itemFilter(" + i + ").name=HideDuplicateItems&itemFilter(" + i + ").value=true";
    i++;

    if (req.query.new||req.query.used||req.query.unspecified){
        var j=0;
        var cond_new=cond_used=cond_unspec="";
        var var_cond="&itemFilter(" + i + ").name=Condition";
        if (req.query.new){
            cond_new="&itemFilter(" + i + ").value(" + j + ")=New";
            j++;
        }
        if (req.query.used){
            cond_used="&itemFilter(" + i + ").value(" + j + ")=Used";
            j++;
        }
        if (req.query.unspecified){
            cond_unspec="&itemFilter(" + i + ").value(" + j + ")=Unspecified";
            j++;
        }
        var_cond += cond_new + cond_used + cond_unspec;
    }
    var_head="http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=" + 
                myAPI + "&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&paginationInput.entriesPerPage=50&keywords=" 
                + req.query.keyword;
    var_selector = "&outputSelector(0)=SellerInfo&outputSelector(1)=StoreInfo";
    items_url = var_head + var_category + var_location + var_shipping + var_pickup + var_dup + var_cond + var_selector;
    // scope.search_url = items_url;  

  var infoURL = items_url;
  // var infoURL=req.query.url;
  http.get(infoURL, (response)=>{
   var data="";
   response.on('data',function(chunk){
    console.log(chunk)
    data+=chunk;
    data['search_url'] = infoURL;
   });
   response.on('end',function(){
    res.send(data);//res.JSON
   });
  });
  return;
 });

app.get('/showdetails', function(req, res){
 var infoURL=req.query.url;
  http.get(infoURL, (response)=>{
   var data="";
   response.on('data',function(chunk){
    data+=chunk;
   });
   response.on('end',function(){
    res.send(data);//res.JSON
   });
  });
  return;
 });

app.get('/showimages', function(req, res){
 var infoURL=req.query.url;
  https.get(infoURL, (response)=>{
   var data="";
   response.on('data',function(chunk){
    data+=chunk;
   });
   response.on('end',function(){
    res.send(data);//res.JSON
   });
  });
  return;
 });

app.get('/showshipping', function(req, res){
 var infoURL=req.query.url;
  http.get(infoURL, (response)=>{
   var data="";
   response.on('data',function(chunk){
    data+=chunk;
   });
   response.on('end',function(){
    res.send(data);//res.JSON
   });
  });
  return;
 });

app.get('/showseller', function(req, res){
 var infoURL=req.query.url;
  http.get(infoURL, (response)=>{
   var data="";
   response.on('data',function(chunk){
    data+=chunk;
   });
   response.on('end',function(){
    res.send(data);//res.JSON
   });
  });
  return;
 });

app.get('/showsimilar', function(req, res){
 var infoURL=req.query.url;
  http.get(infoURL, (response)=>{
   var data="";
   response.on('data',function(chunk){
    data+=chunk;
   });
   response.on('end',function(){
    res.send(data);//res.JSON
   });
  });
  return;
 });



const port = 8081;
app.listen(port)