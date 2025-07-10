
const clientId = "p6jwgsl4zphko9cl38k1pu1c1tys5o";
const redirectUri = window.location.href;
let accessToken = null;
let username = null;
let socket = null;

document.getElementById("loginBtn").onclick = () => {
    const scope = "chat:read chat:edit";
    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    console.log("Redirecting to Twitch Auth:", authUrl);
    window.location = authUrl;
};

window.onload = () => {
    const stored = localStorage.getItem('mss_token');
    if (stored) {
        accessToken = stored;
        document.getElementById("loginBtn").style.display = "none";
        document.getElementById("controls").style.display = "grid";
        getUserInfo();
        return;
    }

    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        accessToken = params.get("access_token");
        if (accessToken) {
            localStorage.setItem('mss_token', accessToken);
            document.getElementById("loginBtn").style.display = "none";
            document.getElementById("controls").style.display = "grid";
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
        if (data && data.data && data.data.length > 0) {
            username = data.data[0].login;
            document.getElementById("status").textContent = "✅ Verbunden als @" + username;
            connectToChat();
        } else {
            document.getElementById("status").textContent = "❌ Fehler bei Twitch Login!";
        }
    })
    .catch(err => {
        console.error("getUserInfo failed:", err);
        document.getElementById("status").textContent = "❌ Fehler bei Twitch API!";
    });
}

function connectToChat() {
    socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

    socket.onopen = () => {
        socket.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
        socket.send("PASS oauth:" + accessToken);
        socket.send("NICK " + username);
        socket.send("JOIN #" + username);
        console.log("✅ WebSocket verbunden mit #" + username);
    };

    socket.onmessage = (event) => {
        console.log("📨 Empfangen:", event.data);
    };

    socket.onerror = (error) => {
        console.error("❌ WebSocket Fehler:", error);
    };
}

function sendCommand(command) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(`PRIVMSG #${username} :${command}`);
        document.getElementById("status").textContent = "📨 Gesendet: " + command;
        console.log("✅ Befehl gesendet:", command);
    } else {
        document.getElementById("status").textContent = "❌ Nicht verbunden.";
        console.warn("❌ WebSocket nicht offen.");
    }
}

function sendCommandWithUser(command, inputId) {
    const input = document.getElementById(inputId);
    let user = input.value.trim();
    if (user !== "") {
        sendCommand(`${command} ${user}`);
    } else {
        sendCommand(command);
    }
}
