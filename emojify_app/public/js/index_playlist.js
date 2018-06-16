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

    $.ajax({ // chiamata ajax che mette in pausa il player quando la pagina viene refreshata
        url: "https://api.spotify.com/v1/me/player/pause",
        type: 'PUT',
        headers: {
            Authorization: "Bearer " + access_token
        },
        success: function () {
            console.log("pause")
        }
    })

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
                    console.log(result)
                    let tracksArray = result.tracks //array di tutte le tracce
                    let tracksPlaylist = tracksArray.map(function (item, index, array) { //array con la lista di canzoni da riprodurre
                        return '\"spotify:track:' + item.id + '\"'
                    })

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
                                data: '{\"uris\":[' + tracksPlaylist + ']}',
                                headers: {
                                    Authorization: "Bearer " + access_token
                                },
                                success: function (result) { // se la richeista va a buon fine esegui la funzione
                                    $(".device-error").remove(); //rimuovo l'alert per evitare l'accumulo in caso di numerosi click
                                    $(".playing-track").remove(); //rimuovo il nome della traccia precedente per evitare l'accumulo
                                    $(".login-error").remove(); //rimuovo l'alert per evitare l'accumulo in caso di numerosi click
                                    $(".emojify-playicon").remove(); //rimuovo l'icona di play per evitare l'accumulo in caso di numerosi click
                                    //console.log("traccia in play: ", tracksName)
                                    $.ajax({ // chiamata ajax per verificare lo stato del player dell'utente
                                        url: "https://api.spotify.com/v1/me/player",
                                        dataType: "json",
                                        headers: {
                                            Authorization: "Bearer " + access_token // access token dell'utente
                                        },
                                        success: function (results) {
                                            playerState = results.is_playing
                                            console.log(playerState)
                                            $.ajax({ // chiamata ajax per verificare la canzone in riproduzione 
                                                url: "https://api.spotify.com/v1/me/player",
                                                dataType: "json",
                                                headers: {
                                                    Authorization: "Bearer " + access_token // access token dell'utente
                                                },
                                                success: function (results) {
                                                    console.log(results)
                                                    let trackName = results.item.name //nome della traccia
                                                    let trackArtist = results.item.artists[0].name //nome dell'artista della traccia
                                                    $(
                                                        [
                                                            '<h5 class="playing-track">"' + trackName + '" - ' + trackArtist + '</h5>', //nome della canzone 
                                                            '<i class="material-icons emojify-playicon">pause_circle_outline</i>' //icona di play
                                                        ].join("\n")
                                                    ).appendTo($("#alert-box")); //faccio l'append
                                                    $(".emojify-circle-musicloop").css("animation", "5s grow infinite"); //se parte la riproduzione della canzone aggiungo l'animaizone ai cerchi in background
                                                    $(".emojify-bg-musicloop").css("opacity", "1"); //se parte la riproduzione della canzone faccio una transizione per l'apparizione dei cerchi
                                                    $(".emojify-list").css("bottom", "-95px") //nascondo la barra delle emoji dopo il primo click
                                                }
                                            })
                                        }
                                    })
                                },
                                error: function () { //se non ci sono dispositivi in play
                                    $(".device-error").remove(); //rimuovo l'alert per evitare l'accumulo in caso di numerosi click
                                    $(".playing-track").remove(); //rimuovo il nome della traccia precedente per evitare l'accumulo
                                    $(".login-error").remove(); //rimuovo l'alert per evitare l'accumulo in caso di numerosi click
                                    let deviceErrorSource = document.getElementById("device-error").innerHTML;
                                    let deviceErrorAlert = Handlebars.compile(deviceErrorSource); //compilo handlebars
                                    $("#alert-box").append(deviceErrorAlert); //appendo all'html l'alert "Please make sure that you are running Spotify in the background!"
                                }
                            });
                        },
                    });
                },
                error: function () { //se l'utente non è loggato manda messaggio di errore
                    $(".device-error").remove(); //rimuovo l'alert per evitare l'accumulo in caso di numerosi click
                    $(".playing-track").remove(); //rimuovo il nome della traccia precedente per evitare l'accumulo
                    $(".login-error").remove(); //rimuovo l'alert per evitare l'accumulo in caso di numerosi click
                    let loginErrorSource = document.getElementById("login-error").innerHTML;
                    let loginErrorAlert = Handlebars.compile(loginErrorSource); //compilo handlebars
                    $("#alert-box").append(loginErrorAlert); //appendo all'html l'alert "Please make sure that you are login with Spotify!"
                }
            });
        })
    })

    // controllo riproduzione al click sull'icona di play/pause
    $("#alert-box").click(function () {
        $.ajax({ // chiamata ajax per verificare lo stato del player dell'utente
            url: "https://api.spotify.com/v1/me/player",
            dataType: "json",
            headers: {
                Authorization: "Bearer " + access_token // access token dell'utente
            },
            success: function (results) {
                playerState = results.is_playing
                console.log(playerState)
                if (playerState) {
                    $(".emojify-playicon").replaceWith('<i class="material-icons emojify-playicon">play_circle_outline</i>');
                    $.ajax({ // chiamata ajax che mette in pausa il player
                        url: "https://api.spotify.com/v1/me/player/pause",
                        type: 'PUT',
                        headers: {
                            Authorization: "Bearer " + access_token
                        },
                        success: function () {
                            console.log("pause")
                            $(".emojify-bg-musicloop").css("opacity", "0"); // rimuovo il loop dei cerchi in bg
                        }
                    })
                } else {
                    $(".emojify-playicon").replaceWith('<i class="material-icons emojify-playicon">pause_circle_outline</i>');
                    $.ajax({ // chiamata ajax che mette in pausa il player
                        url: "https://api.spotify.com/v1/me/player/play",
                        type: 'PUT',
                        headers: {
                            Authorization: "Bearer " + access_token
                        },
                        success: function () {
                            console.log("play")
                            $(".emojify-circle-musicloop").css("animation", "5s grow infinite"); //se parte la riproduzione della canzone aggiungo l'animaizone ai cerchi in background
                            $(".emojify-bg-musicloop").css("opacity", "1"); //se parte la riproduzione della canzone faccio una transizione per l'apparizione dei cerchi
                        }
                    })
                }
            }
        })
    })
});
