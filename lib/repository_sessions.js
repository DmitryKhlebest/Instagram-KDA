const redis = require('redis');
const clientRedis = redis.createClient();
const asyncRedis = require("async-redis");
const client = asyncRedis.createClient();
const prefixKey = "instagram:token:";

client.on("error", function (err) {
    console.log("Error redis: " + err);
});


const addSession = function(token, userId) {
    client.set(prefixKey + token, userId, 'EX', 60*60*12);
};

const showAllSessions = function() {
    clientRedis.keys('*', async function(err, keys) {
        if(err) {
            console.log(err);
            return;
        }

        for(let key of keys) {
            if(key.substr(0, 16) === prefixKey) {
                let userId = await client.get(key);
                console.log("session", {
                    token: key.substr(16),
                    userId: userId
                });
            }
        }
    });
};

const getUserIdByToken = async function(token) {
    return await client.get(prefixKey + token);
};

const deleteSession = function(token) {
    client.del(prefixKey + token);
};

module.exports = {
    addSession,
    showAllSessions,
    getUserIdByToken,
    deleteSession
};


(async () => {
    // addSession("v3ry65", 346547);
    // addSession("f34y64", 837410);
    // addSession("wo45j9", 237835);
    //
    // showAllSessions();
    //
    // console.log(await getUserIdByToken("v3ry65"));
    // console.log(await getUserIdByToken("f34y64"));
    // console.log(await getUserIdByToken("wo45j9"));
    //
    //deleteSession("a5vcvhi3v5q");

    showAllSessions();
})();





