const httpInstance = require("http");
const portNumber = 1234;
const maxUsers = 2;
const usersArray = [];

let OutString = "";
let answer = "";

class User {
  constructor(user) {
    this.user = user;
    this.id = Math.floor(Math.random() * 1000);
    this.lastVisit = Date.now();
  }

  updateUser(time) {
    this.lastVisit = time;
  }
}

function bufferize(request) {
  return new Promise((resolve) => {
    const bodyParts = [];
    let body;
    request
      .on("data", (chunk) => {
        bodyParts.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(bodyParts).toString();
        resolve(body);
      });
  });
}

/**
Converts an array of arrays into an object.

@param {...Array} anArray - The array of arrays to be converted.

@returns {Object} - The converted object.
*/
const toObj = (...anArray) => {
  let myObj = {};
  let key, value;
  anArray.forEach((arr) => {
    arr.forEach((elt) => {
      if (elt.includes("name=")) {
        key = elt.substring(5).replaceAll('"', "");
      } else {
        value = elt.replaceAll("'", '"');
      }
    });
    myObj[key] = value;
  });
  return myObj;
};

const isAlive = (d) => {
  usersArray.forEach( (user, idx) => {
    if (d - user.lastVisit > 2000) {
      console.log(`User ${user.user} has left. 😞 ${idx}`);
      usersArray.splice(idx, 1);
      console.table(usersArray);
    }
  });
}

const commandInterpreter = (cmd) => {
  let currentUser = -1;
  for (c in cmd) {
    switch (c) {
      case "Connect":
        // Check if all users are alive.
        if (usersArray.length > 0) {
          console.log('Checking if everybody is alive...');
          const actualDate = Date.now();
          isAlive(actualDate);
        }
        if (usersArray.length < maxUsers) {
          let u = new User(cmd[c]);
          usersArray.push(u);
          answer = u;
          console.log("Connect", u);
        } else {
          answer = "Too many users";
        }
        break;
      case "Id":
          currentUser = cmd[c];
        break;
      case "Status":
        console.log("Status");
        break;
      case "Alive":
        // isAlive(Date.now());
        let userObj = usersArray.find(u => u.id == currentUser);
        let otherUser = usersArray.find(u => u.id != currentUser);
        if (usersArray.length > 1) {
          // console.log('OTHER : ',otherUser);
          answer = {online : `${otherUser.user}`};
        } else {
          answer = "Staying alive!";
        }
        userObj.updateUser(Date.now());
        // console.log(userObj);
        break
      default:
        break;
    }
  }
};

// Create a server instance

const httpServer = httpInstance.createServer();

// Setup the server to listen on port 'portNumber'
httpServer.listen(portNumber, () => {
  console.log(`Server is listening on port ${portNumber}`);
});

httpServer.on('connection', (stream) => {
  console.log('someone connected!');
});

httpServer.on('disconnect', stream => {
  console.log('CLOSE :', stream);
});

httpServer.on('request', async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Check if the request contains form data
  if (
    req.headers["content-type"] &&
    req.headers["content-type"].startsWith("multipart/form-data")
  ) {
    OutString = await bufferize(req);
  }
  // Write a response to the client
  const resultats = OutString.split(" ").filter((elt) => elt.includes("name="));
  const elems = [];
  let commands;
  resultats.forEach((resultat) => {
    elems.push(
      resultat
        .split("\r\n")
        .filter(
          (elt) =>
            elt != "" &&
            !elt.includes("------WebKit") &&
            !elt.includes("Content-")
        )
    );
  });

  commands = toObj(...elems);
  commandInterpreter(commands);

  // const response = JSON.stringify(`Response from server : ${OutString}`);

  const response = JSON.stringify(
    // `Server:${portNumber}$ ${JSON.stringify(answer)}`
    answer
  );
  res.write(response);
  res.statusCode = 200;

  // End the response
  res.end();
});

