define(["lib/common/utils", "ui/default"], function(Utils) {

    var windowName, defaultWidth, defaultheight, defaultfontSize, heightPopup = 311,
        widthPopup = 355,
        changeSound = function() {
            var mp3Selected = $('#soundSelect option:selected').val();
            var sampler = $("#sampler");
            sampler.attr("src", "/timer/sound/" + mp3Selected);



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
            $("#stop").css("fontSize", defaultfontSize).css("height", defaultheight).css("width", defaultWidth).hide();
            $("#launch").show();
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

        };

    hideDivModal = function(pid) {
        $(".divModal").hide();
        $(pid).show();

    }

    hideButtModal = function(pid) {
        $(".btModal").hide();
        $(pid).show();

    }

    return {
        validateAdding: function(evt) {
            evt.preventDefault();
            if (window.FormData) {
                var formUploadFile = new FormData();
                // evt.preventDefault();
                var file = evt.dataTransfer.files[0];
                if (formUploadFile) {
                    formUploadFile.append("upload", file);
                    formUploadFile.append("name", $("#name").val());
                    $.ajax({
                        url: "/timer/add",
                        type: "POST",
                        data: formUploadFile,
                        processData: false,
                        contentType: false,
                        success: function(res) {
                            if (res.result) document.location.reload();
                        }
                    });
                }
            }
            return false;

        },
        validateSuppr: function() {

            var selected = $(".supp-value:checked");
            if (selected.length > 0) {
                $("#supp_files_control_group").removeClass("error");
                $("#delSoundForm").submit();
            } else {
                $("#supp_files_control_group").addClass("error");
            }
            return false;
        },
        clickOnPrec: function() {
            hideDivModal("#name_control_group");
            hideButtModal("#nextModal")
            $("#select_control_group").show();
        },
        clickOnNext: function() {
            var valeur = $("#name").val();
            if (valeur && valeur != "") {
                hideDivModal("#fileName_control_group");
                hideButtModal("#precModal");
                $("#name_control_group").removeClass("error");
            } else {
                $("#name_control_group").addClass("error");
            }
        },
        selectModal: function(evt) {
            var tmp = $(evt.target).data("select-choice");
            if ("add" == tmp) {
                hideDivModal("#name_control_group");
                hideButtModal("#nextModal")
                $("#select_control_group").show();
            } else {
                hideDivModal("#supp_files_control_group");
                hideButtModal("#valModal")
                $("#select_control_group").show();
            }
        },

        /*
         * Close the popup window and reinit IHM.
         */

        closePopup: function() {
            if (windowName) {
                windowName.close();
                windowName = null;
            }

            buttonsClose();
        },

        calculatePopupSize: function(name) {
            var positionY, positionX;
            // Calcul de la position de la popup
            positionY = screen.height - heightPopup;
            if (screen.availHeight) {
                positionY = screen.availHeight - heightPopup;
            }
            positionX = screen.width - widthPopup;
            if (screen.availWidth) {
                positionX = screen.availWidth - widthPopup;
            }
            //var url = "popup.html?heure=" + $("#heure").val() + "&minute=" + $("#minute").val();
            var optionsPopup = 'height=' + heightPopup + ',width=' + widthPopup + ',screenX=' + positionX + ',screenY=' + positionY + ',scrollbars=no,location=no,resizable=no,status=no';
            // lancer la popup
            var tmp = window.open("about:blank", name, optionsPopup);
            var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
            if (is_chrome) {
                tmp.parent.blur();
            }
            setTimeout(listenerClosePopup, 1000);
            windowName = tmp;
            tmp.focus();
            return tmp
        },

        /**
         * Launch he timer.
         **/
        launchPopup: function() {
            var positionY, positionX;
            if (validateForm()) {
                return false;
            }
            // Gestion des boutons
            $("#launch").hide();
            $("#stop").show().animate({
                width: "100%"
            }, 1000).animate({
                height: "75px"
            }, 1000).animate({
                fontSize: "50px"
            }, 1000);


            // submit the forms
            $("#form-launch").submit()


            return false;
        },


        /**
         * Initialize the screeen
         **/
        init: function() {

            // sauvegarder les préférences d'affichage.     
            var boutonArreter = $("#stop");
            defaultfontSize = boutonArreter.css("fontSize");
            defaultheight = boutonArreter.css("height");
            defaultWidth = boutonArreter.css("width");


            // init select audio


            $("#soundSelect").change(function() {
                changeSound();
            });
        }
    }
});

/*}*/
