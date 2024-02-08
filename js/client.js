const myURL = "192.168.1.66";
const myPort = "1234";
const emojis = ['👨', '🧔', '🧔‍♀️', '👩', '🧓', '👴', '👵', '👨‍🚀', '👨‍🎓', '👨‍🚒', '👨‍🔧'];
let rndNumber = Math.floor(Math.random() * emojis.length);

// const myURL = "paw-design.alwaydata.net/srvtest";
// const myPort = "8100";

let userName = "";
let userId = 0;
let isConnected=false;
let timer;

const headerUserName = document.querySelector("header h1 #name");
const headerUserId = document.querySelector("header h1 #userId");
const headerStatus = document.querySelector("header #status");
const asideOnline = document.querySelector('aside #online');
const pseudo = document.querySelector("#pseudo");
const idle = document.querySelector("#idle");
const btn = document.querySelector("#btn");
const sidePanel = document.querySelector("footer #content");

const dataInterpreter = (datas) => {
  for (let d in datas) {
    switch (d) {
      case "user":
        isConnected = true;
        userName = datas[d];
        headerUserName.textContent = userName;
        headerStatus.style.backgroundColor = "#0a0";
        btn.setAttribute("disabled", true);
        btn.removeEventListener("click", sendCnxData, false);
        if (isConnected) timer = setInterval(handleConnection, 1500);
        break;
        case "id":
          userId = datas[d];
          headerUserId.textContent = `(${userId})`;
          document.title = `Client ${userName} ${userId}`;
        break;
        case "online":
          asideOnline.textContent = datas[d] != '' ? `${emojis[rndNumber]} ${datas[d]}` : '';
        break;
      default:
        break;
    }
  }
};

function postFormData(url, port, formData) {
  fetch(`http://${url}:${port}`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      dataInterpreter(data);
      sidePanel.textContent += JSON.stringify(data) + "\r\n";

    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

const sendCnxData = () => {
  const data = new FormData();
  data.append("Connect", pseudo.value != "" ? pseudo.value : "Anonymous");
  data.append("Status", "Idle");

  postFormData(myURL, myPort, data);
};

btn.addEventListener("click", sendCnxData, false);

const handleConnection = () => {
  const data = new FormData();
  data.append("Id", userId);
  data.append("Alive", "true");
  postFormData(myURL, myPort, data);
};
