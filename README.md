# Super Simple Cache Engine
It is a key value pair cache engine developed on JavaScript, running on NodeJS.
This is a personal project developed for study purposes. Although I am keeping it stable,
it has not been tested on a production enviorment and is not recommended for such.

## How to use?
You can either incorporate it in your project or run as a standalone service.

### Global dependencies
  * You will need Nodejs LTS v16 or higher
  * Nodemon

Nodemon is used on development mode to monitor file changes and automatically
reboot the service to use the new changes. 

Installing Nodemon globally in your system:
```
  npm install -g nodemon
```

## Running as a Service
Running Super Simple Cache Engine as a server allows you to have a service which you can
make REST requests to interact with the cache engine.

#### Install local dependencies
After download our repo install all dependencies:
```
npm install
```

#### Run the server on dev mode
```
  npm run dev
```
On this mode, the server will reboot after saving changes on any project file. 
This will allow you to immediatelly test your changes.

#### Normal mode
```
  npm start
```
This way nodemon wont be called and the service will not reboot after changes
in the project.

## Accessing the Service
Super Simple Cache Engine Server is configured to use **port 6464**.

### Adding a Key
To save information into the cache you must make a **POST** request to :
  * localhost:6464/

Your **POST** body must contain : 
  * hash : (string) Required
  * name : (string) Required
  * val  : (string) Required
  * life : (number)

> hash : Any name you want. It is used to group your keys, you can have multiple keys under the same hash.

> name : Name of your key

> val  : Value of your key

> life : How many seconds your key will exists inside the cache memory. This argument is optional, if you leave it
> blank your key life will have a **default value of 4 minutes**.

E.g.:
```
curl -X POST http://localhost:6464 
   -H "Content-Type: application/json"
   -d '{ "hash": "user100", "name": "age", "val":"18", "life":300 }'
```
With this, you will add a **key 'age'** inside **hash 'user100'** with the **value of 18**.
This data will be available for 300 seconds.

As confirmation that your insert worked you will get the following response : 
```JSON
  {
    "error" : 0,
    "data" : {
      "name" : "age",
      "val"  : "18",
      "life" : 300
    },
    "msg" : "Success"
  }
```



### Reading from cache
To read data from cache you must make a **GET** request to :
  * localhost:6464/

Your **GET** query must contain : 
  * hash : (string) Required
  * name : (string) Required
 

> hash : Hash name which your key belongs to.
> name : Name of the key you want to retrieve the value.

E.g.:
```
curl http://localhost:6464?hash="user100"&&name="age"
```
Here we are arequesting the value of **key called "age"** inside **hash called "user100"**

Success response: 
```JSON
  {
    "error" : 0,
    "data" : {
      "name" : "age",
      "val"  : "18",
      "life" : 202
    },
    "msg" : "Success"
  }
```
The service will return the complete information about your key.


### Deleting from cache
To remove data from cache you must make a **DELETE** request to :
  * localhost:6464/

Your **DELETE** query must contain : 
  * hash : (string) Required
  * name : (string) Required
 

> hash : Hash name which your key belongs to.
> name : Name of the key you want to remove.

E.g.:
```
curl -X DELETE http://localhost:6464?hash="user100"&&name="age"
```
The **key named "age"** belonging to **hash named "user100"** will be deleted from memory.
If you have another key with the same name "age", but linked to another hash, it will remain in memory
for it's life time.

Success response: 
```JSON
  {
    "error" : 0,
    "data" : {
      "name" : "age",
      "val"  : "18",
      "life" : -1
    },
    "msg" : "Success"
  }
```
Even though your key was deleted from the cache memory, you will get its full date as reponse.
Life value will be set to -1.



### Listing Keys
You can list all keys belong to a specific hash through a GET resquest to:
  * localhost:6464/list

Your **GET** query must contain : 
  * hash : (string) Required

E.g.:
```
curl http://localhost:6464/list?hash="user100"
```
List all keys available inside **hash "user100"**.

Success response: 
```JSON
  {
    "error" : 0,
    "data" :["age", "name", "address", "phone"],
    "msg" : "Success"
  }
```
As a reponse you will receive an array in "dada" with all available keys.



### Stats
Will return general information about NodeJS's memory and cache items.
  * localhost:6464/stats

E.g.:
```
curl http://localhost:6464/stats
```

Success response: 
```JSON
  {
    "error" : 0,
    "stats" :{
      "cache": {
        "items": 12,
        "hashes": 3
      },
      "memory" : {
        "V8Used":"900",
        "Total":"800",
        "V8Total" : "3012",
        "Buffers":"3",
        "Free":"2400"
      }
    },
    "msg" : "Success"
  }
```








  







