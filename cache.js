const btoa = require("btoa");
const {networkInterfaces} = require("os");
const netInterface = networkInterfaces();

/*
    Super Simple Cache Engine
    Hello, SSCE is a personal project. It consists in a very
    simple to use Key:Value cache engine developed on NodeJS.

    You might incorporate it in your own app or use it as a
    stand-alone solution.

    Key data structure
    {
        name : <string>
        val : <string>
        expiration : <number> // Milliseconds
    }

    Every key is organized in groups. There groups are difined
    by the hash argument.
    [hash : <string>][Key1 <object>, key2<object>, key3<object>]
    [hash <string>][
        {
            name : <string>
            val : <string>
            expiration : <number> // Milliseconds
        },
        {
            name : <string>
            val : <string>
            expiration : <number> // Milliseconds
        }
    ]

 */
class cache {

    cacheStore = []
    cacheIndex = []
    cacheValIndex = []
    cacheVersion = "0.0.5a"

    constructor() {
        console.log('[*] Super Simple Cache Engine')
        console.log('[i] Version ', this.getVersion())
        this.garbageCollector()
    }


    /**
     * garbageCollector
     * Responsable for checking data expiration and cleanups.
     * Performes a global check every 3 seconds.
     */
    garbageCollector() {
        setInterval(() => {

            let now = this.getLatestTime()
            let rmIndex = [] // Index of names to be removed

            console.clear()
            this.getIP()
            console.log("[*] Garbage Collector")
            console.log("[i] Current Cache Index ",this.cacheIndex)
            console.log("[i] Current Cache Val Index ",this.cacheValIndex)
            console.log("[i] Current Cache ",this.cacheStore)
            console.log("-")
            console.log("[i] Current Time : " + now)

            this.cacheIndex.forEach( (gci) => {

                // Check if hash has variables
                if (this.cacheValIndex[gci] != undefined) {

                    if (this.cacheValIndex[gci].length > 0) {
                        this.cacheValIndex[gci].forEach( (gci_e) => {
                            //console.log("[i] Cache Item -> ",this.cacheStore[gci][gci_e])
                            // Remove old information
                            if (this.cacheStore[gci] != undefined) {
                                if (this.cacheStore[gci][gci_e] != undefined) {
                                    if ((now > this.cacheStore[gci][gci_e].expiration) ) {
                                        console.log("[-] Cache VAR RM : " + gci + " <-> " + gci_e)
                                        delete this.cacheStore[gci][gci_e]
                                        rmIndex.push([gci, gci_e])
                                    }
                                }
                            }
                        })
                    }
                    else {
                        // Hash with no variables get to be removed
                        delete(this.cacheStore[gci]) // Clean actual cache
                        // Cleans Indexes
                        this.cacheIndex.splice(this.cacheIndex.indexOf(gci),1)
                        this.cacheValIndex = this.cacheValIndex.splice(this.cacheValIndex.indexOf(gci),1)
                        console.log("Cleared Main INDEX : ", this.cacheIndex)
                        console.log("Cleared Val INDEX : ", this.cacheValIndex)
                        console.log("***************************************************************************")
                    }
                }
                else {
                    this.cacheIndex.splice(this.cacheIndex.indexOf(gci),1)
                    console.log("(!) Cleared Main INDEX -> REMOVED : ", gci)
                    console.log("***************************************************************************\n\n")
                }
            })

            // Cleanup Index Variables
            rmIndex.forEach( (rmi) => {
                if(this.cacheValIndex[rmi[0]] != undefined) {
                    this.cacheValIndex[rmi[0]].splice(this.cacheValIndex[rmi[0]].indexOf(rmi[1], 1))
                    console.log("Cleared Val index : ", this.cacheValIndex)
                }
            })
            console.log("\n",this.getMemory())
            console.log("\n")
        },3000)
    }


    /**
     * Add
     * Adds a new key to cache.
     * Required fields are : hash<string>, name<string> and val<string>.
     * life<number> is optional and measuded in seconds. If missing a default
     * 240 seconds are added as life.
     *
     *
     * @param readRequestArgs = { hash:<string>, name:<string>, val:<string>, life:<number> }
     * @returns {msg: 'Success', data: {val: string , name : string, life: number}, erro: 0}
     */
    add(postRequestArgs) {

        console.log("(+) Save Request")

        if (!this.validateAddRequest(postRequestArgs)) {
            return {
                error :  1,
                msg: "Bad request."
            }
        }
        postRequestArgs.hash = this.makeHash(postRequestArgs.hash)

        if (this.cacheStore[postRequestArgs.hash] == undefined) {

            console.log("[+] New Hash\n");

            this.cacheStore[postRequestArgs.hash] = []
            this.cacheStore[postRequestArgs.hash][postRequestArgs.name] = {
                val : null,
                expiration : null
            }

            this.cacheIndex.push(postRequestArgs.hash)
            this.cacheValIndex[postRequestArgs.hash] = []
            this.cacheValIndex[postRequestArgs.hash].push(postRequestArgs.name)
        }
        else {
            if (this.cacheStore[postRequestArgs.hash][postRequestArgs.name] == undefined) {
                console.log('[i] Warming Cache')
                this.cacheValIndex[postRequestArgs.hash].push(postRequestArgs.name)
                this.cacheStore[postRequestArgs.hash][postRequestArgs.name] = {
                    val : null,
                    expiration : null
                }
            }
        }

        if (!postRequestArgs.life) {
            // Default life is 4 minutes
            postRequestArgs.life = this.getLatestTime() + 240000
        }
        else {
            postRequestArgs.life = this.getLatestTime() + (postRequestArgs.life * 1000)
        }
        this.cacheStore[postRequestArgs.hash][postRequestArgs.name]['val'] = postRequestArgs.val
        this.cacheStore[postRequestArgs.hash][postRequestArgs.name]['expiration']  = postRequestArgs.life

        console.log('[+] Cache Saved')

        return {
            error : 0,
            data : {
                name    : postRequestArgs.name,
                val     : this.cacheStore[postRequestArgs.hash][postRequestArgs.name]['val'],
                life    : this.lifeToSec(this.cacheStore[postRequestArgs.hash][postRequestArgs.name])
            },
            msg: "Success"
        }

    }
    /**
     * validateAddRequest
     * Validate arguments for a new key.
     * { hash:<string>, name:<string>, value:<string> } are required
     *
     * @param readRequestArgs = { hash:<string>, name:<string>, value:<string> }
     * @returns {boolean}
     */
    validateAddRequest(addRequestArgs) {

        if (
            typeof addRequestArgs.hash != "string"
            ||  typeof addRequestArgs.name != "string"
            ||  (
                typeof addRequestArgs.val != "string"
                && typeof addRequestArgs.val != "number"
            )
        ) {
            return false
        }
        addRequestArgs.hash = addRequestArgs.hash.trim()
        addRequestArgs.name = addRequestArgs.name.trim()

        if (
            ( addRequestArgs.hash == "" || addRequestArgs.hash == undefined )
            || (addRequestArgs.name == "" && addRequestArgs.name == undefined)
            || (addRequestArgs.val == "" || addRequestArgs.val == undefined)
        ) {
            return false
        }
        return true
    }


    /**
     * read
     * Reads Key from cache.
     * To find your key you need both the hash and name.
     * Hash works as a group for your keys.
     * @param getRequestArgs = { hash:<string>, name:<string> }
     * @returns
     *
     *      Error : {msg: 'Miss', data: {val: false, name: string, life: 0}, erro: number}
     *      Success : {msg: 'Success', data: {val: string , name : string, life: number}, erro: 0}
     *
     */
    read(getRequestArgs) {

        console.log("(i) - Read Request")

        if (!this.validateReadRequest(getRequestArgs)) {
            return {
                error : 0,
                    data : {
                    name : bd_get.name,
                        val : false,
                        life : 0
                },
                msg: "Miss"
            }
        }
        getRequestArgs['hash'] = this.makeHash(getRequestArgs['hash'])

        console.log("[i] Cache Read ")
        console.log("[i] GetHash : ", getRequestArgs['hash'])
        console.log("[i] GetName : ", getRequestArgs['name'])

        if (
            !this.cacheStore[getRequestArgs.hash]
            || !this.cacheStore[getRequestArgs.hash][getRequestArgs.name]
        ) {
            return {
                error : 0,
                data : {
                    name : getRequestArgs.name,
                    val : false,
                    life : 0
                },
                msg: "Miss"
            }
        }

        if (!this.checkExpiration(this.cacheStore[getRequestArgs.hash][getRequestArgs.name])) {
            this.removeFromCache(getRequestArgs.hash, getRequestArgs.name)
            return {
                error : 0,
                data : {
                    name : getRequestArgs.name,
                    val : false,
                    life : 0
                },
                msg : "Miss"
            }
        }

        return {
            error : 0,
            data : {
                name    : getRequestArgs.name,
                val     : this.cacheStore[getRequestArgs.hash][getRequestArgs.name]['val'],
                life    : this.lifeToSec(this.cacheStore[getRequestArgs.hash][getRequestArgs.name]),
            },
            msg: "Success"
        }

    }

    /**
     * validateReadRequest
     * Validate arguments for a read request.
     * { hash:<string>, name:<string> } Both arguments are required.
     *
     * @param readRequestArgs = { hash:<string>, name:<string> }
     * @returns {boolean}
     */
    validateReadRequest(readRequestArgs) {

        if (typeof readRequestArgs.hash != "string" ||  typeof readRequestArgs.name != "string") { return false }
        readRequestArgs.hash = readRequestArgs.hash.trim()
        readRequestArgs.name = readRequestArgs.name.trim()

        if (
            ( readRequestArgs.hash == "" || readRequestArgs.hash == undefined )
            || (readRequestArgs.name == "" && readRequestArgs.name == undefined)
        ) {
            return false;
        }
        return true
    }


    /**
     * list
     * Show all the keys for a specific ahsh.
     * @param listRequestArgs = {hash:string} required
     * @returns
     *      Error : {error : 1, msg : "Band request."}
     *      Empty Hash : {erro: 0, data: false, msg : "Miss"}
     *      Success : { erro:0, data : [key1Name<string>, key2Name<string>...], msg: "Success"}
     */
    list(listRequestArgs) {
        console.log("(i) - List Request")
        if (!this.validateListRequest(listRequestArgs)) {
            return {
                error : 1,
                msg: "Bad request."
            }
        }

        listRequestArgs.hash = this.makeHash(listRequestArgs.hash)

        // Runs a verification to only return active keys at this moment.
        // To prevent experied keys being active in between garbageCollector
        // runs do be returned.
        let onlyActiveKeys = [];
        if( this.cacheStore[listRequestArgs.hash] ) {
            onlyActiveKeys = Object.keys(this.cacheStore[listRequestArgs.hash]).filter((cacheKeyName) => {
                if (this.checkExpiration(this.cacheStore[listRequestArgs.hash][cacheKeyName])) {
                    return true
                }
                return false
            })
        }

        if ( onlyActiveKeys.length < 1 ) {
            return {
                error : 0,
                data : false,
                msg: "Miss"
            }
        }

        return {
            error : 0,
            data : onlyActiveKeys,
            msg  : "Success"
        }

    }
    /**
     * validateListRequest
     * Validate arguments for key listing
     * { hash:<string> } required
     *
     * @param readRequestArgs = { hash:<string>}
     * @returns {boolean}
     */
    validateListRequest(listRequestArgs) {

        if (typeof listRequestArgs.hash != 'string') { return false }
        listRequestArgs.hash = listRequestArgs.hash.trim()

        if ( listRequestArgs.hash == "" || listRequestArgs.hash == undefined ) {
            return false
        }
        return true
    }


    /**
     * delete
     * Delete a key and returns the value of deleted key.
     *
     * @param deleteRequestArgs = { hash:<string>, name:<string> }
     * @returns
     *
     *  Missing key : { erro:0, msg: "Miss" }
     *  Error : { erro:1, msg: "Bad request"}
     *  Success : { erro:0, data:{name:string, val:string, life:-1}, msg: "Success"}
     *
     */
    delete(deleteRequestArgs) {

        console.log("(i) - Delete Request")
        if (!this.validateDeleteRequest(deleteRequestArgs)) {
            return {
                error : 1,
                msg: "Bad request."
            }
        }
        deleteRequestArgs.hash = this.makeHash(deleteRequestArgs.hash)

        if(
            !this.cacheStore[deleteRequestArgs.hash]
            || !this.cacheStore[deleteRequestArgs.hash][deleteRequestArgs.name]
        ) {
            return {
                "erro" : 0,
                "msg" : "Miss"
            }
        }
        let bufferRemovedValue = this.cacheStore[deleteRequestArgs.hash][deleteRequestArgs.name].val
        this.removeFromCache(deleteRequestArgs.hash, deleteRequestArgs.name)

        return {
            "erro" : 0,
            data : {
                name    : deleteRequestArgs.name,
                val     : bufferRemovedValue,
                life    : -1,
            },
            "msg" : "Success"
        }

    }
    /**
     * validateDeleteRequest
     * Validate arguments key removal.
     * { hash:<string>, name:<string> } are required
     *
     * @param readRequestArgs = { hash:<string>, name:<string> }
     * @returns {boolean}
     */
    validateDeleteRequest(deleteRequestArgs) {
        if (
            ( deleteRequestArgs.hash == "" || deleteRequestArgs.hash == undefined )
            || (deleteRequestArgs.name == "" && deleteRequestArgs.name == undefined)
        ) {
            return false;
        }
        return true
    }


    /**
     * removeFromCache
     * Removes an key from cache.
     * @param cacheHash <String> Required
     * @param cacheName <String> Required
     */
    removeFromCache(cacheHash, cacheName) {

        cacheHash = cacheHash.trim();
        cacheName = cacheName.trim();
        if(cacheHash == "" || cacheName == "") { return false }

        delete this.cacheStore[cacheHash][cacheName]
        this.cacheValIndex[cacheHash].splice(
            this.cacheValIndex[cacheHash].indexOf(cacheName),
            1
        )

    }

    /**
     * stats
     * Return a JSON with basic cache stats.
     * Item : the total number of stored keys
     * hashes : the total number of hashes organizing keys
     *
     * @returns {
     *      {
     *          msg: string,
     *          erro: number,
     *          stats: {
     *              cache: {items: number, hashes: number},
     *              memory: {V8Used: number, Total: number, V8Total: number, Buffers: number, Free: number}
     *          }
     *      }
     * }
     */
    stats() {

        return {
            error : 0,
            stats: {
                memory : this.getMemory(),
                cache  : this.getStats()
            },
            msg : "Success"
        }

    }

    makeHash(hashString) {
        return btoa(hashString)
    }

    /**
     * getLatestTime
     * Return now in milliseconds
     * @returns {number}
     */
    getLatestTime() {
        let dt = new Date()
        return dt.getTime()
    }

    /**
     * checkExpiration
     * Check expiration of cacheItem
     * @param cacheItem { expiration : <number>}
     * @returns {boolean}
     */
    checkExpiration(cacheItem) {
        return (cacheItem.expiration > this.getLatestTime()) ? true : false
    }

    /**
     * lifeToSec
     * Calculates life of key by expiration and returns life in seconds to live.
     * @param cacheItem { expiration:<number> }
     * @returns {number} As seconds
     */
    lifeToSec(cacheItem) {

        let lifeInSeconds = Math.round((cacheItem['expiration'] - this.getLatestTime()) / 1000)
        lifeInSeconds = (lifeInSeconds > 0) ? lifeInSeconds : 0
        return lifeInSeconds
    }

    /**
     * getVersion
     * Return current version.
     * @returns {string}
     */
    getVersion() { return this.cacheVersion }

    /**
     * getStats
     * Generates cache stats information.
     * Used by this.stats method.
     * @returns {{hashes: number, items: number}}
     */
    getStats() {
        let totalItems = 0;
        this.cacheIndex.forEach((cacheUser)=> {
            totalItems += this.cacheValIndex[cacheUser].length
        })

        return {
            hashes : this.cacheIndex.length,
            items : totalItems
        }
    }

    /**
     * getMemory
     * Gather information about NodeJS memory ussage.
     * @returns {{V8Used: number, Total: number, V8Total: number, Buffers: number, Free: number}}
     */
    getMemory =()=>{
        let mem = process.memoryUsage();
        return {
            Total     : Math.round(mem.rss/1024/1024*100),
            V8Total   : Math.round(mem.heapTotal/1024/1024*100),
            V8Used    : Math.round(mem.heapUsed/1024/1024*100),
            Buffers   : Math.round(mem.arrayBuffers/1024/1024*100),
            Free      : Math.round((mem.rss-(mem.heapTotal-mem.heapUsed))/1024/1024*100),
        }
    }

    getIP =()=>{
        console.log("\n--- Network Interfaces ---");
        Object.keys(netInterface).forEach((interfaceName)=>{
            netInterface[interfaceName].forEach((interfaceType)=>{

                if (interfaceType.family.toLowerCase() =="ipv4") {
                    console.log(
                        interfaceName + ":" +
                        interfaceType.family + ":" +
                        interfaceType['address']
                    )
                }
            })
        })
        console.log("------");
    }
}
module.exports = cache