
document.getElementById("loginBtn").addEventListener("click", function () {
    // Zeige die Steuerung nach Login
    document.getElementById("controls").style.display = "block";
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("status").innerText = "✅ Verbunden. Du kannst jetzt Befehle senden.";
});

function sendCommand(command) {
    fetch("https://www.twitch.tv/popout/chat", {
        method: "POST",
        mode: "no-cors",
        body: command
    });
    document.getElementById("status").innerText = "✅ Befehl gesendet: " + command;
}

function sendCommandWithUser(baseCommand, inputId) {
    const user = document.getElementById(inputId).value.trim();
    if (user) {
        sendCommand(baseCommand + " @" + user);
    } else {
        alert("Bitte gib einen Benutzernamen ein.");
    }
}

function sendCommandWithAmount(baseCommand, inputId) {
    const val = document.getElementById(inputId).value.trim();
    if (val) {
        sendCommand(baseCommand + " " + val);
    } else {
        alert("Bitte gib einen Wert ein.");
    }
}
