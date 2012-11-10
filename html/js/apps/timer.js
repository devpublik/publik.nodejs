define(["lib/common/utils", "text!templates/postit/postit.html", "ui/default"], function(Utils, Postit) {

    var windowName, defaultWidth, defaultheight, defaultfontSize, heightPopup = 311,
        widthPopup = 355,
        changeSound = function() {
            var mp3Selected = $('#soundSelect option:selected').val();
            var sampler = $("#sampler");
            sampler.attr("src", "sound/" + mp3Selected);



        },
        validateForm = function() {
            var chHeure = $("#heure");
            if (!chHeure.val() || $.trim(chHeure.val()) == "") {
                $("#erreurBody").html("Veuiller renseigner le champ 'Heure'.");
                $('#erreurModal').modal('show');
                return true;
            }

            var chMinute = $("#minute");

            if (!chMinute.val() || $.trim(chMinute.val()) == "") {
                $("#erreurBody").html("Veuiller renseigner le champ 'Minute'.");
                $('#erreurModal').modal('show');
                return true;
            }

            return false;
        },
        buttonsClose = function() {
            $("#stop").css("fontSize", defaultfontSize).css("height", defaultheight).css("width", defaultWidth);


            $("#stop").hide();
            $("#lancer").show();
        },
        /*
         * Hook pour vérifier que la fenêtre est fermée ou non. 
         */

        listenerClosePopup = function() {
            if (windowName) {

                if (windowName.closed) {
                    buttonsClose();
                    windowName = null;
                    return;
                }

                setTimeout(listenerClosePopup, 1000);
            }

        },
        /*
         * Action de fermer la popup + de modifier les 
         */

        closePopup = function() {
            if (windowName) {
                windowName.close();
                windowName = null;
            }

            buttonsClose();
        };

    /*$(document).ready(function(){*/


    return {






        init: function() {
            var positionY, positionX;
            // Ne pas permettre de rentrer autre chose que des chiffres
            $("input[type=text]").bind('keypress', function(e) {
                return (e.which === 8 || e.which === 0 || (e.shiftKey === false && (e.which > 47 && e.which < 58))) ? true : false;
            });
            // sauvegarder les préférences d'affichage.		
            var boutonArreter = $("#stop");
            defaultfontSize = boutonArreter.css("fontSize");
            defaultheight = boutonArreter.css("height");
            defaultWidth = boutonArreter.css("width");


            // Action de ARRêter
            boutonArreter.click(function() {
                closePopup();
            });

            $("#lancer").click(function() {
                if (validateForm()) {
                    return;
                }

                // Calcul de la position de la popup	
                positionY = screen.height - heightPopup;
                if (screen.availHeight) {
                    positionY = screen.availHeight - heightPopup;
                }
                positionX = screen.width - widthPopup;
                if (screen.availWidth) {
                    positionX = screen.availWidth - widthPopup;
                }
                var url = "popup.html?heure=" + $("#heure").val() + "&minute=" + $("#minute").val();
                var optionsPopup = 'height=' + heightPopup + ',width=' + widthPopup + ',screenX=' + positionX + ',screenY=' + positionY + ',scrollbars=no,location=no,resizable=no,status=no';
                // lancer la popup	
                windowName = window.open(url, 'Timer', optionsPopup);
                var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
                if (is_chrome) {
                    windowName.parent.blur();
                }

                // Gestion des boutons
                $(this).hide();
                $("#stop").show().animate({
                    width: "100%"
                }, 1000).animate({
                    height: "75px"
                }, 1000).animate({
                    fontSize: "50px"
                }, 1000);

                //Mettre un hook pour vérifier la validité de la fenêtre 
                if (windowName) {

                    setTimeout(listenerClosePopup, 1000);

                    windowName.focus();
                }
            });


            // init select audio

            $.get("sound/data.json", function(data) {
                console.log(data);
            });

            $("#soundSelect").change(function() {
                changeSound();
            });
            changeSound();
        }
    };
});

/*}*/
