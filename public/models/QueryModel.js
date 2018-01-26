class Query {
    constructor(){
        this.bool=new Condition();
    }
}

class Condition {
    constructor(){
        this.must=[];
        this.should=[];
    }
}

exports.Query=Query;
exports.Condition=Condition;