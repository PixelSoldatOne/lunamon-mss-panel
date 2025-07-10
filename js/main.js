
let token = "";
let username = "";

document.getElementById("loginBtn").addEventListener("click", function () {
    const clientId = "p6jwgsl4zphko9cl38k1pu1c1tys5o";
    const redirectUri = window.location.href;
    const scope = "chat:read chat:edit user:read:email";
    const authUrl = \`https://id.twitch.tv/oauth2/authorize?client_id=\${clientId}&redirect_uri=\${encodeURIComponent(redirectUri)}&response_type=token&scope=\${scope}\`;

    window.location.href = authUrl;
});

window.onload = function () {
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        token = params.get("access_token");

        if (token) {
            document.getElementById("controls").style.display = "block";
            document.getElementById("loginBtn").style.display = "none";
            document.getElementById("status").innerText = "✅ Verbunden mit Twitch.";

            fetch("https://api.twitch.tv/helix/users", {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Client-Id": "p6jwgsl4zphko9cl38k1pu1c1tys5o"
                }
            })
            .then(response => response.json())
            .then(data => {
                username = data.data[0].login;
                document.getElementById("status").innerText = "✅ Eingeloggt als @" + username;
            });
        }
    }
};

// Nur Anzeige – keine echte Chat-API-Anbindung (wurde bei v3 durch Redirect funktioniert)
function sendCommand(command) {
    document.getElementById("status").innerText = "✅ Befehl gesendet: " + command;
    const url = "https://www.twitch.tv/popout/chat";
    console.log("Befehl an:", url, "| Nachricht:", command);
}

function sendCommandWithUser(baseCommand, inputId) {
    const user = document.getElementById(inputId).value.trim();
    const command = user ? baseCommand + " " + user : baseCommand;
    sendCommand(command);
}

function sendCommandWithAmount(baseCommand, inputId) {
    const val = document.getElementById(inputId).value.trim();
    const command = val ? baseCommand + " " + val : baseCommand;
    sendCommand(command);
}
