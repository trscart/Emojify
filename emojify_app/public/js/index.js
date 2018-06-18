$(document).ready(function () { //aspetto che il documento sia pronto
    console.log("pagina pronta");

    // loading-disappearance dopo 4,5s
    setTimeout(function(){
        $(".emojify-loading-container").css("opacity","0")
        $(".emojify-loading-container").css("visibility","hidden")
    }, 5500)


    function getHashParams() { // dichiaro una funzione che prenda i dati dall'url dopo il login dell'utente a spotify
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while (e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }
    let params = getHashParams();
    let access_token = params.access_token,
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

    let emojiMood = ["happy", "sad", "romance"] //creo un array corrispondente al valore di ogni emoji
    emojiMood.forEach(function (item) {
        $("." + item).click(function () {
            console.log("mood: ", item)
            let limit = 100 //limite lista canzoni
            $.ajax({ // chiamata ajax che al click sulle emoji ritorna una lista di canzoni corrispondenti al mood della emoji stessa
                url: "https://api.spotify.com/v1/recommendations?limit=" + limit + "&seed_genres=" + $("." + item).attr("value"), // url + valore dell'emoji cliccata
                type: 'GET',
                headers: {
                    Authorization: "Bearer " + access_token
                },
                success: function (result) { // se la richiesta va a buon fine esegui la funzione
                    console.log(result)
                    let randomNumber = Math.floor(Math.random() * limit); // genero un numero random da 0 a 50
                    let canzoneRandomId = result.tracks[randomNumber].id // scelgo una canzone random della lista e ne prendo l'id
                    let nomecanzoneRandom = result.tracks[randomNumber].name // nome della canzone random
                    let artistacanzoneRandom = result.tracks[randomNumber].artists[0].name

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
                                    $(".device-error").remove(); //rimuovo l'alert per evitare l'accumulo in caso di numerosi click
                                    $(".playing-track").remove(); //rimuovo il nome della traccia precedente per evitare l'accumulo
                                    $(".login-error").remove(); //rimuovo l'alert per evitare l'accumulo in caso di numerosi click
                                    $(".emojify-playicon").remove(); //rimuovo l'icona di play per evitare l'accumulo in caso di numerosi click
                                    console.log("traccia in play: ", nomecanzoneRandom)
                                    $.ajax({ // chiamata ajax per verificare lo stato del player dell'utente
                                        url: "https://api.spotify.com/v1/me/player",
                                        dataType: "json",
                                        headers: {
                                            Authorization: "Bearer " + access_token // access token dell'utente
                                        },
                                        success: function (results) {
                                            playerState = results.is_playing
                                            // console.log(playerState)
                                            $( // se è in play
                                                [
                                                    '<h5 class="playing-track">"' + nomecanzoneRandom + '" - ' + artistacanzoneRandom + '</h5>', //nome della canzone 
                                                    '<i class="material-icons emojify-playicon" title="pause">pause_circle_outline</i>' //icona di play
                                                ].join("\n")
                                            ).appendTo($("#alert-box")); //faccio l'append
                                            $(".emojify-circle-musicloop").css("animation", "5s grow infinite"); //se parte la riproduzione della canzone aggiungo l'animaizone ai cerchi in background
                                            $(".emojify-bg-musicloop").css("opacity", "1"); //se parte la riproduzione della canzone faccio una transizione per l'apparizione dei cerchi
                                            $('#music_toggle').addClass('on'); // attiva le music bar
                                            $('.emojify-bodycontainer').css('animation', 'gradient-change 15s infinite'); // attiva background gradient animation
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
                    $('#music_toggle').removeClass('on'); // disattiva le music bar
                    $(".emojify-playicon").replaceWith('<i class="material-icons emojify-playicon" title="play">play_circle_outline</i>');
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
                    $('#music_toggle').addClass('on'); // attiva le music bar
                    $(".emojify-playicon").replaceWith('<i class="material-icons emojify-playicon" title="pause">pause_circle_outline</i>');
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

    /*music bar control*/
    $('#music_toggle').click(function () { // verifico lo stato del volume al click sulle music bar, se è > 0 lo setto a 80 sennò viceversa e faccio il toogle dell'animazione delle barre
        $.ajax({ // chiamata ajax per verificare il volume
            url: "https://api.spotify.com/v1/me/player",
            dataType: "json",
            headers: {
                Authorization: "Bearer " + access_token // access token dell'utente
            },
            success: function (results) {
                let volume = results.device.volume_percent
                if (volume > 0) {
                    $('#music_toggle').removeClass('on'); // disattiva le music bar
                    $.ajax({ // chiamata ajax per verificare il volume
                        url: "https://api.spotify.com/v1/me/player/volume?volume_percent=0", //setto il volume a 0
                        type: 'PUT',
                        dataType: "json",
                        headers: {
                            Authorization: "Bearer " + access_token // access token dell'utente
                        }
                    })
                } else if (volume == 0) {
                    $('#music_toggle').addClass('on'); // attiva le music bar
                    $.ajax({ // chiamata ajax per verificare il volume
                        url: "https://api.spotify.com/v1/me/player/volume?volume_percent=80", //setto il volume a 80
                        type: 'PUT',
                        dataType: "json",
                        headers: {
                            Authorization: "Bearer " + access_token // access token dell'utente
                        }
                    })
                }
            }
        })
    });

    /*controlli carosello*/
    $('.carousel').carousel({
        pause: false
    })
});
