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

    let emojiMood = ["happy", "sad", "romance"] //creo un oggetto corrispondente al valore di ogni emoji
    emojiMood.forEach(function (item) {
        $("#" + item).click(function () {
            console.log("mood: ", item)
            let limit = 100 //limite lista canzoni
            $.ajax({ // chiamata ajax che al click sulle emoji ritorna una lista di canzoni corrispondenti al mood della emoji stessa
                url: "https://api.spotify.com/v1/recommendations?limit=" + limit + "&seed_genres=" + $("#" + item).attr("value"), // url + valore dell'emoji cliccata
                type: 'GET',
                headers: {
                    Authorization: "Bearer " + access_token
                },
                success: function (result) { // se la richeista va a buon fine esegui la funzione
                    let randomNumber = Math.floor(Math.random() * limit); // genero un numero random da 0 a 50
                    let canzoneRandomId = result.tracks[randomNumber].id // scelgo una canzone random della lista e ne prendo l'id
                    let nomecanzoneRandom = result.tracks[randomNumber].name // nome della canzone random

                    $.ajax({ // chiamata ajax al click del bottone per prendere l'id del dispositivo connesso a spotify
                        url: "https://api.spotify.com/v1/me/player/devices",
                        dataType: "json",
                        headers: {
                            Authorization: "Bearer " + access_token // access token dell'utente
                        },
                        success: function (result) { // se la richeista va a buon fine esegui la funzione
                            console.log("device connessi: ", result)
                            $.ajax({ // chiamata ajax che riproduce al canzone random
                                url: "https://api.spotify.com/v1/me/player/play",
                                type: 'PUT',
                                dataType: 'json',
                                contentType: 'application/json',
                                data: '{\"uris\":[\"spotify:track:' + canzoneRandomId + '\"]}',
                                headers: {
                                    Authorization: "Bearer " + access_token
                                },
                                success: function (result) { // se la richeista va a buon fine esegui la funzione
                                    $(".device-error").remove(); //rimuovo l'alert in caso di errore precedente
                                    $(".playing-track").remove(); //rimuovo il nome della traccia precedente per evitare l'accumulo
                                    console.log("traccia in play: ", nomecanzoneRandom)
                                    $(
                                        [
                                            '<h5 class="playing-track">"' + nomecanzoneRandom + '"</h5>'
                                        ].join("\n")
                                    ).appendTo($("#alert-box")); //faccio l'append del nome della canzone in play
                                },
                                error: function () { //se non ci sono dispositivi in play
                                    $(".device-error").remove(); //rimuovo l'alert per evitare l'accumulo in caso di numerosi click
                                    let deviceErrorSource = document.getElementById("device-error").innerHTML;
                                    let deviceErrorAlert = Handlebars.compile(deviceErrorSource); //compilo handlebars
                                    $("#alert-box").append(deviceErrorAlert); //appendo all'html l'alert "Please make sure that you are running Spotify in the background!"
                                }
                            });
                        },
                    });
                }
            });
        })
    })

    // carosello bootstrap settaggi
    $('.carousel').carousel({
        interval: 4000,
        pause: false
    })
});
