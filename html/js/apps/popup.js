define(["lib/common/utils","ui/countdown","js!jquery.sparkline.min.js!order","domReady!"], function(Utils,Countdown) {

    var heure = 0,
        minute = 1,

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

                divSOund.html("<div><a class='boutonfermer' class='' href=''#' onclick='window.close();'>Fermer</a></div><div><AUDIO controls autoplay loop><source src='sound/canard-sauvage.mp3' ></source> </AUDIO></div>");
                divSOund.show();

            }

        }



/*$(document).ready(

function() {*/
    return {
        init: function() {

            heure = Utils.getUrlVar('heure');
            console.log("heure : " + heure);

            minute = Utils.getUrlVar('minute');
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
