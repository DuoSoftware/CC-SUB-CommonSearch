var queryModel=require('./QueryModel');

class SearchData {
 constructor(){
     this.from=0;
     this.size=10;
     var query=new queryModel.Query();
     this.query=query;
 }
}

exports.SearchData= SearchData;