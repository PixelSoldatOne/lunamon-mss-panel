
const clientId = "p6jwgsl4zphko9cl38k1pu1c1tys5o";
const redirectUri = window.location.href;
let accessToken = null;
let username = null;

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
        console.log("Token found in localStorage:", accessToken);
        document.getElementById("loginBtn").style.display = "none";
        document.getElementById("controls").style.display = "grid";
        getUserInfo();
        return;
    }

    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        accessToken = params.get("access_token");
        console.log("Token from URL hash:", accessToken);
        if (accessToken) {
            localStorage.setItem('mss_token', accessToken);
            document.getElementById("loginBtn").style.display = "none";
            document.getElementById("controls").style.display = "grid";
            getUserInfo();
        }
    } else {
        console.log("No token in URL and none in storage.");
    }
};

function getUserInfo() {
    fetch("https://api.twitch.tv/helix/users", {
        headers: {
            "Authorization": "Bearer " + accessToken,
            "Client-Id": clientId
        }
    })
    .then(res => {
        console.log("getUserInfo status:", res.status);
        return res.json();
    })
    .then(data => {
        console.log("getUserInfo data:", data);
        if (data && data.data && data.data.length > 0) {
            username = data.data[0].login;
            document.getElementById("status").textContent = "✅ Verbunden als @" + username;
        } else {
            document.getElementById("status").textContent = "❌ Fehler bei Twitch Login!";
        }
    })
    .catch(err => {
        console.error("getUserInfo failed:", err);
    });
}

function sendCommand(command) {
    if (!username) {
        console.warn("❌ Kein Benutzername gesetzt – Twitch Login nicht abgeschlossen.");
        return;
    }
    fetch(`https://chat.proxysystem.link/api/send`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": accessToken
        },
        body: JSON.stringify({
            channel: username,
            message: command
        })
    }).then(() => {
        console.log("✅ Befehl gesendet:", command);
        document.getElementById("status").textContent = "📨 Gesendet: " + command;
    });
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
