module.exports = {
    "Host":
    {
        "port": '7008',
        "version": "6.1.0.1",
        "hostpath":"HOST_PATH",
        "logfilepath": "log.txt",
        "mainDomain": "app.cloudcharge.com",
        "httpHost":"https://",
        "redisHost": "52.187.21.188",
        "redisPassword": "gSAc9gxby4mFNro5r7+mKMVQ9zAGXdWr9vjlradXGds=",
        "redisDB": 5,
        "redisPort": 6379,
        "logfilepath": "log.txt",
        "logSize": 100000,
        "logContainer":"CommonSearchDev",
        "HostURL":"https://app.cloudcharge.com"
    },
    "Admin": {
        "LOG_ENABLE": "0",
        "NO_OF_RETRY_USER_DEL":10
    },
    "DatabaseElastic":{
        "server": "8ad8ed7b0d3d8b4710c1c268af0808f0.us-east-1.aws.found.io:9243",
        "user": "elastic",
        "password": "H1uYKChE3lG4hiJkkq3G2ZpQ"
    }
};