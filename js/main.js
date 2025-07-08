
const clientId = "p6jwgsl4zphko9cl38k1pu1c1tys5o";
const redirectUri = window.location.href;
let accessToken = null;
let username = null;
let socket = null;

document.getElementById("loginBtn").onclick = () => {
    const scope = "chat:read chat:edit";
    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    window.location = authUrl;
};

window.onload = () => {
    if (window.location.hash) {
        const stored = localStorage.getItem('mss_token');
        if (stored) {
            accessToken = stored;
            document.getElementById("loginBtn").style.display = "none";
            document.getElementById("controls").style.display = "block";
            getUserInfo();
            return;
        }
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        accessToken = params.get("access_token");
        if (accessToken) localStorage.setItem('mss_token', accessToken);
        if (accessToken) {
            document.getElementById("loginBtn").style.display = "none";
            document.getElementById("controls").style.display = "block";
            getUserInfo();
        }
    }
};

function getUserInfo() {
    fetch("https://api.twitch.tv/helix/users", {
        headers: {
            "Authorization": "Bearer " + accessToken,
            "Client-Id": clientId
        }
    })
    .then(res => res.json())
    .then(data => {
        username = data.data[0].login;
        connectToChat();
    });
}

function connectToChat() {
    socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

    socket.onopen = () => {
        socket.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
        socket.send("PASS oauth:" + accessToken);
        socket.send("NICK " + username);
        socket.send("JOIN #" + username);
        document.getElementById("status").textContent = "✅ Verbunden als @" + username;
    };

    socket.onmessage = (event) => {
        console.log("Empfangen:", event.data);
    };
}

function sendCommand(command) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(`PRIVMSG #${username} :${command}`);
        document.getElementById("status").textContent = "📨 Gesendet: " + command;
    }
}
