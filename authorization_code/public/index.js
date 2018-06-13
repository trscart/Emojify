$(document).ready(function () { //aspetto che il documento sia pronto
    console.log("ready!"); 

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
        console.log("prova")
        $.ajax({
            url: "https://api.spotify.com/v1/artists/0TnOYISbd1XYRBk9myaseg", //url della richiesta
            dataType: "json", //tipo di dato richiesto
            data: { //dati richiesti

            },
            headers: {
                Authorization: "Bearer " + access_token // access token dell'utente
            },
            success: function (result) { // se la richeista va a buon fine esegui la funzione
                console.log(result)
            }
        });
    })
});
