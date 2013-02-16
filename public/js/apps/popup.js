define(["common/utils","ui/countdown","domReady!"], function(Utils,Countdown) {

    var heure = 0,
        minute = 1,
        sound = "tmp.mp3",

        updatePieCharte = function(oldValue, tranche) {
            var nonfait = 360 - oldValue;

            $('#sparklinesExample').html(oldValue + ',' + nonfait);
            $('#sparklinesExample').sparkline('html', {
                type: 'pie',
                sliceColors: ["red", "green"],
                offset: "-90",
                height: '160px',
                enableTagOptions: false
            });

            var newValue = oldValue + 6;



            if (newValue <= 360 && tranche) {
                setTimeout(function() {
                    updatePieCharte(newValue, tranche)
                }, tranche);
            }

            if (newValue > 360) {

                var divSOund = $("#sound");

                divSOund.html("<div><a class='boutonfermer' class='' href=''#' onclick='window.close();'>Fermer</a></div><div>"+
                "<AUDIO controls autoplay loop src='"
                +sound+
                "'></AUDIO></div>");
                divSOund.show();

            }

        }

    return {
        init: function(pheure,pminute,psound) {
            heure = pheure;
            minute = pminute;
            sound=psound;


            console.log("minute : " + minute);
            var totalExercice = (heure * 60 * 60 + minute * 60) * 1000;
            var tranche = totalExercice / 60;

            updatePieCharte(0, tranche);
            // Start it up
            Countdown.initialDigitCheckCountdown(theDiffStringCountdown);
            setInterval(Countdown.doCountCountdown, paceCountdown);
        }
    };

});
