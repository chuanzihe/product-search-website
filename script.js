var hw8App = angular.module("hw8App", ["angular-svg-round-progressbar", "ngMaterial", "ngAnimate"]);
hw8App.controller("appCtrller", ["$scope", "$http",function($scope,$http) {
    $scope.http = $http;
	$scope.keyword = "iphone";
	$scope.pickup=false;
	$scope.location=0;
	$scope.otherloczip = "90008";
    $scope.category = "all";
	var ebayAPI = 'http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=ChuanziH-csci571p-PRD-c16de56b6-2b65e3cb&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&paginationInput.entriesPerPage=50&keywords=iphone&buyerPostalCode=90007&itemFilter(0).name=MaxDistance&itemFilter(0).value=10&itemFilter(1).name=FreeShippingOnly&itemFilter(1).value=true&itemFilter(2).name=LocalPickupOnly&itemFilter(2).value=true&itemFilter(3).name=HideDuplicateItems&itemFilter(3).value=true&itemFilter(4).name=Condition&itemFilter(4).value(0)=New&itemFilter(4).value(1)=Used&itemFilter(4).value(2)=Unspecified&outputSelector(0)=SellerInfo&outputSelector(1)=StoreInfo';
    // $scope.keyword = $scope.keyword.replace(/ /g,"%20");    
    $scope.miles = 10;
    $scope.number=''; //user input
    $scope.cur_zipcode = '';
    $scope.tabs_visible = false;
    $scope.detail_error_visible=false;  
    $scope.tab_details_visible=false;
    $scope.tab_results_visible=false;
    $scope.tab_productdetail_visible = false;
    $scope.search_error = false;
    $scope.wishlist_error = (localStorage.length == 0);

    $scope.sendAPI = sendAPI;
    $scope.pageNum = 1;
    $scope.flipPage = flipPage;
    $scope.showDetail = showDetail;
    $scope.showDetailTable = [["",""]];
    $scope.img_links = [];
    $scope.showPhotos = showPhotos;
    $scope.tab_img_visible = false;
    $scope.tab_shipping_visible = false;
    $scope.tab_seller_visible = false;
    $scope.tab_similar_error = false;
    $scope.tab_wishlist_visible = false;

    $scope.cur_itemId = "";
    $scope.showShipping = showShipping;
    $scope.showSeller = showSeller;
    $scope.showSimilar = showSimilar;
    $scope.search_url = ""; // for reuse in shipping call
    $scope.detail_url = "";
    $scope.cur_itemIndex = null;
    $scope.cur_displayIndex = null;
    $scope.shipTable = [];
    $scope.sellerTable = [];
    $scope.show_more_enabled = false;
    $scope.selectedCate = {display:'Default',value:'default'};
    $scope.selectedAscend = {display:'Ascending',value:'ascend'};    
    $scope.rankCates= [
    {display:'Default',value:'default'},
    {display:'Product Name',value:'name'},
    {display:'Days Left',value:'days'},
    {display:'Price',value:'price'},
    {display:'Shipping Cost',value:'ship'}
    ];
    $scope.rankDirections = [
    {display:'Ascending', value:'ascend'},
    {display:'Descending', value:'descend'}
    ];    

    $scope.addWishlist = addWishlist;
    $scope.removeWishlist = removeWishlist;
    $scope.inList = inList;
    $scope.showWishList = showWishList;
    $scope.wishlistTable = [];
    $scope.total_price = 0;
    $scope.searchTextChange = searchTextChange;
    $scope.searchText = "";
    $scope.responseData = "";

    $scope.getZip = getZip;
    $scope.curzip = "";    
    $scope.mainpage = "results"; // {wishlist}
    $scope.secpage  = 'list'; // {list, detail}
    $scope.page = ""; // {1,2,3,4,5}
    $scope.progress_bar = false;
    $scope.idInList = idInList;
    $scope.shareFB = shareFB;
    $scope.checkKeyword="^[a-zA-Z0-9 ]+$";

    $scope.new=false;
    $scope.used=false;
    $scope.unspecified=false;
    $scope.pickup=false;
    $scope.shipping=false;

}]);

function shareFB(scope){
    FB.init({
      appId            : '336495980311944',
      autoLogAppEvents : true,
      xfbml            : true,
      version          : 'v3.2'
    });

    FB.ui({
      method: 'share',
      display: 'popup',
      href: scope.showDetailTable.facebook,
      quote: "Buy "+scope.showDetailTable.title+" at $"+scope.showDetailTable.price+" from link below.",
  }, function(response){});    
}

function sendAPI(scope){

    // $http.get('/someUrl', config).then(successCallback, errorCallback);
    scope.cur_itemId = "";//clear cur_itemId for search and clear
	// var config = {
	// 	params:{url:items_url}
	// };
    // or $http
    // var jsonObj = "";
	scope.http({
		method:'GET',
		url:'/showitems',
        params: {
            miles:scope.miles,
            keyword:scope.keyword,
            category:scope.category,
            location:scope.location,
            cur_zipcode:scope.cur_zipcode,
            number:scope.number,
            shipping:scope.shipping,
            pickup:scope.pickup,
            new:scope.new,
            used:scope.used,
            unspecified:scope.unspecified,
        }        
	}).then(function successCallback(response){
        scope.progress_bar=false;
		var jsonObj = response.data;    
        scope.search_url = response.search_url;        
        var searchResults = jsonObj.findItemsAdvancedResponse[0].searchResult; 
        if (searchResults[0].hasOwnProperty("item")){
            scope.tab_results_visible=true;            
            var itemTables = [];
            var items = searchResults[0].item;
            for (i=0; i<items.length; i++){
                table_dict = {};
                if (items[i].hasOwnProperty("galleryURL")){
                    // table_dict['img'] = "<img src='"+items[i].galleryURL+"'/>";
                    table_dict['img'] = items[i].galleryURL[0];
                }else {table_dict['img'] = "N/A";}

                if(items[i].hasOwnProperty("title")){
                    itemId = (items[i].itemId)[0];
                    title_full = items[i].title[0];
                    table_dict['title_full'] = title_full;
                    if (title_full.length > 35){
                        title_display = title_full.slice(0,35);
                        if (title_full[34] != " "){ 
                            last_index=34;
                            while(title_full[last_index]!=" "){
                                last_index--;
                            }
                            title_display = title_full.slice(0,last_index);  
                        }
                        title_display += "...";
                    }
                    else{
                        title_display = title_full;
                    }                    
                    table_dict['itemId'] = itemId;
                    table_dict['title'] = title_display;
                }
                else{ table_dict['title'] = "N/A";}

                if ((items[i].sellingStatus)[0].hasOwnProperty("currentPrice")){
                    table_dict['price'] = "$"+((items[i].sellingStatus)[0].currentPrice)[0].__value__;
                }
                else{table_dict['price'] = "N/A"; }

                if (items[i].hasOwnProperty("postalCode")){
                    table_dict['zip'] = ""+items[i].postalCode;
                }
                else{table_dict['zip'] = "N/A";}

                if (items[i].hasOwnProperty("sellerInfo")){
                    table_dict['seller']= ""+items[i].sellerInfo[0].sellerUserName[0];
                }
                else{table_dict['seller']= "N/A";
                }
                if((items[i].shippingInfo)[0].hasOwnProperty("shippingServiceCost")){                
                    if((items[i].shippingInfo)[0].shippingServiceCost[0].__value__==0){
                        table_dict['shipping'] = "Free Shipping";
                    }
                    else{
                        table_dict['shipping'] = "$"+(items[i].shippingInfo)[0].shippingServiceCost[0].__value__;
                    }
                }
                else {table_dict['shipping'] = "N/A";} 
                itemTables.push(table_dict);
            }
            smallTable = [];
            // @todo: change to item num ++ avoid less numbers
            // @todo: check slices?
            for(j=0;j<5;j++){
                smallTable.push(itemTables.slice(10*j,10*(j+1)));
            }
            scope.smallTable = smallTable;
            scope.pageNum = 1;
            scope.displayTable = smallTable[0];
        }
        else{
            scope.search_error = true;
            scope.detail_error_visible=true;
            scope.tab_results_visible=false;
        }      
    });
}

function showDetail(scope,itemId,itemIndex){
    scope.cur_itemId = itemId;
    scope.cur_displayIndex = itemIndex;
    scope.cur_itemIndex = (scope.pageNum-1)*10+itemIndex; // detail table index for shipping
    // scope.tab_results_visible = false;
    scope.tab_details_visible = true;
    scope.tab_productdetail_visible = true; 
    items_url = 'http://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON&appid=ChuanziH-csci571p-PRD-c16de56b6-2b65e3cb&siteid=0&version=967&ItemID=' + itemId + '&IncludeSelector=Description,Details,ItemSpecifics';
    scope.detail_url = items_url;
    // get detail url
    scope.http({
        method:'GET',
        url:'/showdetails',
        params:{url:items_url}
        // params:{url:$scope.items_url},
    }).then(function success(response){  
        scope.progress_bar = false;      
        var jsonObj = response.data;
        if (jsonObj.hasOwnProperty("Item")){
            var item_info=jsonObj.Item;
            // htmltext="<div style='font-size: 25px; margin: auto; text-align: center; line-height: 3px'><H2>Item Details</H2></div>";
            // htmltext+="<table class='detail_table' padding: 15px cellspacing='0' width='720' style='padding-left: 10px;'>";

            detailTable = [];

            if (item_info.hasOwnProperty("PictureURL")){
                // detailTable.push(['Photo Images',"<div ng-click='showPhotos(this)'>View Product Images Here</div>"]);
                detailTable['images'] = item_info.PictureURL;
                // htmltext+="<tr style='text-align:left; padding=20px;'><td style='width: 250px;padding=2px;'><b>&nbsp&nbspPhoto</b></td><td><img src='"+item_info.PictureURL[0]+"' height=200></td></tr>";
            }else{
                detailTable['images'] = "";
            }
            if(item_info.hasOwnProperty("Title")){
                detailTable['title']=item_info.Title;
            }
            else{
                detailTable['title']="";
            }            

            if (item_info.hasOwnProperty("Subtitle")){
                detailTable.push(['SubTitle',item_info.Subtitle]);
            }
            if (item_info.hasOwnProperty("CurrentPrice") && item_info.CurrentPrice.hasOwnProperty("Value")){
                detailTable.push(['Price', item_info.CurrentPrice.Value + " " + item_info.CurrentPrice.CurrencyID]);
                detailTable['price'] = item_info.CurrentPrice.Value;
            }
            if (item_info.hasOwnProperty("Location")&&item_info.hasOwnProperty("PostalCode")){
                detailTable.push(['Location', item_info.Location+", "+item_info.PostalCode]);
            }

            if (item_info.hasOwnProperty("ReturnPolicy")){                
                if (item_info.ReturnPolicy.hasOwnProperty("ReturnsAccepted")&&item_info.ReturnPolicy.ReturnsAccepted=="Returns Accepted"&&item_info.ReturnPolicy.hasOwnProperty("ReturnsWithin")){
                    detailTable.push(['Return Policy', "Returns Accepted within "+item_info.ReturnPolicy.ReturnsWithin]);
                    // htmltext+="<tr><td><b>&nbsp&nbspReturn Policy (US)</b></td><td>&nbsp&nbspReturns Accepted within "+item_info.ReturnPolicy.ReturnsWithin+"</td></tr>";
                }
                else if (item_info.ReturnPolicy.hasOwnProperty("ReturnsAccepted")&&item_info.ReturnPolicy.ReturnsAccepted=="ReturnsNotAccepted"){
                    detailTable.push(['Return Policy', " Not Accepted"]);
                    // htmltext+="<tr><td><b>&nbsp&nbspReturn Policy (US)</b></td><td>&nbsp&nbspReturns Not Accepted</td></tr>";
                }
            }
            // get specific item info
            if (item_info.hasOwnProperty("ItemSpecifics")){
                if (item_info.ItemSpecifics.hasOwnProperty("NameValueList")){
                    if (item_info.ItemSpecifics.NameValueList.length!=0){
                        var specs=item_info.ItemSpecifics.NameValueList;
                        for (i=0; i<specs.length; i++){
                            detailTable.push([specs[i].Name, specs[i].Value[0]]);
                            // htmltext+="<tr><td><b>&nbsp&nbsp"+specs[i].Name+"</b></td><td>&nbsp&nbsp"+(specs[i].Value)[0]+"</td></tr>";
                        }
                    }                    
                }
            }
            else{
                detailTable.push(['Detail','No Detail Info from Seller']); 
                // '<tr><td><b>No Detail Info from Seller</b></td><td style="background-color:#CFCFCF"> </td></tr>';
            }

            if (item_info.hasOwnProperty("ViewItemURLForNaturalSearch")){
                detailTable['facebook'] = item_info.ViewItemURLForNaturalSearch;
            }
            else{
                detailTable['facebook'] = "";
            }          
        }
        else{
            detailTable = ['error',"<div class='invalid'>No Detail Information</div>"];
            // @todo get similar id, but get frame id
        }
        scope.showDetailTable = detailTable;
        // scope.showDetailTable = [["second","second"]];
    });

    // }
    // else{
    //     scope.detail_error_visible=true;
    //     scope.tab_results_visible=false;
    // });

}

function flipPage(scope,index) {
    scope.pageNum = index;
    scope.displayTable = scope.smallTable[index-1];
}

function showPhotos(scope){
    items_url = 'https://www.googleapis.com/customsearch/v1?q=' + scope.keyword +'&cx=017113069725005104885:iipkotvstey&imgSize=huge&imgType=news&num=8&searchType=image&key=AIzaSyBZaxZtlzB3RBLLR_cmMzCROk1iQWOekZ0';
    scope.http({
        method:'GET',
        url:'/showimages',
        params:{url:items_url}
        // params:{url:$scope.items_url},
    }).then(function successful(response){
        scope.progress_bar = false;
        jsonObj = response.data;
        img_links = [];
        if(jsonObj.hasOwnProperty('items')){
            for(i=0;i<jsonObj.items.length;i++){
                img_links.push(jsonObj.items[i].link);
            }
        }
        scope.img_links = img_links;
        scope.tab_productdetail_visible = false;
        scope.tab_img_visible = true;
    });   
    
}

function showShipping(scope){
    scope.tab_shipping_visible = true;
    items_url = scope.search_url;
    // get detail url
    scope.http({
        method:'GET',
        url:'/showshipping',
        params:{url:items_url}
        // params:{url:$scope.items_url},
    }).then(function successShipping(response){
        scope.progress_bar = false;  
        var item_info = response.data.findItemsAdvancedResponse[0].searchResult[0].item[scope.cur_itemIndex];
        shipTable = [];
        shipTable['title'] = item_info.title[0];
        if(item_info.hasOwnProperty('shippingInfo')){
            if((item_info.shippingInfo)[0].hasOwnProperty("shippingServiceCost")){                
                if((item_info.shippingInfo)[0].shippingServiceCost[0].__value__==0){
                    shipTable['cost'] = "Free Shipping";
                }
                else{
                    shipTable['cost'] = "$"+(item_info.shippingInfo)[0].shippingServiceCost[0].__value__;
                }
            }    

            if((item_info.shippingInfo)[0].hasOwnProperty("shipToLocations")){                
                shipTable['location'] = item_info.shippingInfo[0].shipToLocations[0];
            }


            if((item_info.shippingInfo)[0].hasOwnProperty("handlingTime")){
                days = item_info.shippingInfo[0].handlingTime[0];
                days_info = days.toString() + ' Day';
                if (days>1){days_info += 's';} //zero day
                shipTable['time'] = days_info;
            }            

            if((item_info.shippingInfo)[0].hasOwnProperty("expeditedShipping")){
                shipTable['expedited'] = item_info.shippingInfo[0].expeditedShipping[0]=="true"?1:0;
            }          

            if((item_info.shippingInfo)[0].hasOwnProperty("oneDayShippingAvailable")){
                shipTable['oneday'] = item_info.shippingInfo[0].oneDayShippingAvailable[0]=="true"?1:0;
            }
        }

        if (item_info.hasOwnProperty('returnsAccepted')){
            shipTable['return'] = item_info.returnsAccepted[0]=="true"?1:0;
        }    
        scope.shipTable = shipTable;
    });
}

function showSeller(scope){
    scope.tab_seller_visible = true;
    items_url = scope.detail_url;
    // get detail url
    scope.http({
        method:'GET',
        url:'/showseller',
        params:{url:items_url}
        // params:{url:$scope.items_url},
    }).then(function successShipping(response){  
        scope.progress_bar = false;
        var item_info = response.data.Item;
        sellerTable = [];
        sellerTable['title'] = item_info.Title;
        if(item_info.hasOwnProperty('Seller')){
            if(item_info.Seller.hasOwnProperty("FeedbackScore")){                
                sellerTable['score'] = item_info.Seller.FeedbackScore;
            }
            if(item_info.Seller.hasOwnProperty("PositiveFeedbackPercent")){                
                sellerTable['percent'] = item_info.Seller.PositiveFeedbackPercent;
            }
            if(item_info.Seller.hasOwnProperty("FeedbackRatingStar")){//str             
                sellerTable['star'] = {};
                sellerTable['star']['color']=item_info.Seller.FeedbackRatingStar.replace('Shooting','').toLowerCase();
            }
            if(item_info.Seller.hasOwnProperty("TopRatedSeller")){                
                sellerTable['top'] = item_info.Seller.TopRatedSeller;// true/false
            }
                                                
        }

        if (item_info.hasOwnProperty('Storefront')){
            if (item_info.Storefront.hasOwnProperty('StoreName')){
                sellerTable['name'] = item_info.Storefront.StoreName;
                sellerTable['name_title'] = (item_info.Storefront.StoreName).toUpperCase().replace(/\s/g, '');
            }
            if (item_info.Storefront.hasOwnProperty('StoreURL')){
                sellerTable['url'] = item_info.Storefront.StoreURL;
            }            
        }    
        scope.sellerTable = sellerTable;        
    });    
}
function showSimilar(scope){    
    similar_url = "http://svcs.ebay.com/MerchandisingService?OPERATION-NAME=getSimilarItems&SERVICE-NAME=MerchandisingService&SERVICE-VERSION=1.1.0&CONSUMER-ID=ChuanziH-csci571p-PRD-c16de56b6-2b65e3cb&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&itemId=" + scope.cur_itemId + "&maxResults=20";
    scope.http({
        method:'GET',
        url:'/showsimilar',
        params:{url:similar_url}
    }).then(function successSimilar(response){
        scope.progress_bar = false;
        var items_info = response.data.getSimilarItemsResponse.itemRecommendations.item;
        if(items_info.length == 0){
            scope.tab_similar_visible = false;
            scope.tab_similar_error = true;
        }
        else{
            scope.tab_similar_error = false;
            scope.tab_similar_visible = true;
            items = [];
            for (var i = 0; i < items_info.length; i++) {
                items[i]=[]
                items[i]['default'] = i;
                items[i]['name'] = items_info[i].title;
                items[i]['url']  = items_info[i].viewItemURL;
                items[i]['price'] = items_info[i].buyItNowPrice.__value__;
                items[i]['ship']  = items_info[i].shippingCost.__value__; 
                days = items_info[i].timeLeft;
                P_index = days.indexOf('P');
                D_index = days.indexOf('D');
                days = days.substring(P_index+1,D_index);
                items[i]['days'] = days;
                items[i]['img_url'] = items_info[i].imageURL;
            }
            
            // determine ranks by selected properties

            // category
            sort_key = scope.selectedCate.value;            
            sorted = items.sort(function(first,second) {
                return first[sort_key]- second[sort_key];               
            })

            ranks = [...items.keys()];
            if(scope.selectedAscend.value == 'descend'){
                ranks = ranks.reverse();
            }

            scope.similarTable = items;
            scope.sim_ranks = ranks;            
        }
    });
}

// use local storage, all stored as strings
function addWishlist(scope,item_info){    
    itemId = item_info['itemId'];
    item_info['wishlist'] = true;
    localStorage.setItem(itemId.toString(),JSON.stringify(item_info));
}

function removeWishlist(scope,item_info){
    // scope, is the ng-repeat (value)
    // scope.wishlist.splice(scope.wishlist.indexOf(scope.cur_itemId),1);
    item_info['wishlist'] = false;
    localStorage.removeItem(item_info['itemId'].toString());
}

function inList(item_info){
    itemId = item_info['itemId'];
    results = (localStorage.getItem(itemId.toString()) != null);
    return results;
}

function idInList(itemId){
    results = (localStorage.getItem(itemId.toString()) != null);
    return results;
}

function showWishList(scope){
    // after close window, wishlist should still be there, therefore call information again for wish list items;
    scope.tab_wishlist_visible = true;
    if(localStorage.length>0){
        scope.wishlist_error = false;
        wishlistTable = []
        scope.total_price = 0;
        for (var i = 0; i < localStorage.length; i++) {
            item_key = localStorage.key(i);
            item_info = JSON.parse(localStorage.getItem(item_key));  
            item_info['index'] = i+1;
            scope.total_price += Number(item_info['price'].replace('$',''));
            wishlistTable.push(item_info);
        }

        scope.wishlistTable = wishlistTable;              
    }
    else{
        scope.wishlist_error = true;
    }
}

// function searchTextChange(scope){

//     geo_url = 'http://api.geonames.org/postalCodeSearchJSON?postalcode_startsWith=' + scope.searchText + '&username=heremy571&country=US&maxRows=5'
//     // body...
//     scope.http({
//         method:'GET',
//         url:'/geonames',
//         params:{url:geo_url}
//         // params:{url:$scope.items_url},
//     }).then(function successGeo(response){
//         scope.progress_bar = false;
//         jsonObj = response.data;
//         // search reponse table: responseData in item
//     });    
//     // send api
// }

function searchTextChange(scope){
    Searchurl="http://api.geonames.org/postalCodeSearchJSON?postalcode_startsWith="+scope.searchText+"&username=heremy571&country=US&maxRows=5";
    // console.log(Searchurl);
    scope.http({
        method: "GET",
        url: "/auto",
        params: {url:Searchurl}
    }).then(function(response){
            var json=response.data;
            scope.searchjson=json;
            scope.searchRespons=[];
            if(scope.searchjson.hasOwnProperty("postalCodes")){
                a=scope.searchjson.postalCodes;
                for(i=0;i<a.length;i++){
                    x={};
                    if(a[i].hasOwnProperty("postalCode")){
                        x['display']=a[i].postalCode;
                    }
                    scope.searchRespons.push(x);
                }
            }
            // console.log(scope.searchRespons);
    });
}

function getZip(scope){
    scope.http.get("http://ip-api.com/json").then(function success_zip(reponse){
        scope.cur_zipcode = reponse.data.zip;
    });
}

function tabSelect(scope){
    // if (page) {}

}
