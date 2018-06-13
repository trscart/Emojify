$(document).ready(function () { //aspetto che il documento sia pronto
    console.log("pagina pronta");

    function getHashParams() { // dichiaro una funzione che prenda i dati dall'url dopo il login dell'utente a spotify
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while (e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }
    var params = getHashParams();
    var access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    $("#provaBtn").click(function () { //esegui una richesta ajax a spotify al click sul bottone
        console.log("click")
        $.ajax({ // chiamata ajax al click del bottone per prendere l'id del dispositivo connesso a spotify
            url: "https://api.spotify.com/v1/me/player/devices",
            dataType: "json",
            headers: {
                Authorization: "Bearer " + access_token // access token dell'utente
            },
            success: function (result) { // se la richeista va a buon fine esegui la funzione
                console.log("device connessi", result)
                $.ajax({ // chiamata ajax che riproduce al canzone scelta
                    url: "https://api.spotify.com/v1/me/player/play",
                    type: 'PUT',
                    dataType: 'json',
                    contentType: 'application/json',
                    data: '{\"context_uri\":\"spotify:album:5ht7ItJgpBH7W6vJ5BqpPr\",\"offset\":{\"position\":5}}',
                    headers: {
                        Authorization: "Bearer " + access_token
                    },
                    success: function (result) { // se la richeista va a buon fine esegui la funzione
                        console.log("traccia in play")
                    }
                });
            }
        });

    })
});
