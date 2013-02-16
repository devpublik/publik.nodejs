/**
 * module to manage GED.
 **/
define(["common/utils"/*, "text!templates/ged/anchor.html", "text!templates/ged/template_subdir.html", "text!templates/ged/template_files.html"*/], function(Utils/*, AnchorTemplate, SubdirTemplate, FilesTemplate*/) {

    var sens;
    /**
     * private functions.
     **/
    var showLoadModal = function() {
            $("#loadModal").modal();
        },
        sortByName = function(a, b) {
                    if (sens == "Asc") return $(a).attr("data-filter") > $(b).attr("data-filter") ? 1 : -1;
                    return $(a).attr("data-filter") < $(b).attr("data-filter") ? 1 : -1;

        },

       /* hideLoadModal = function() {
            $("#loadModal").modal("hide");
        },  */
        innerSorts = function(but) {
            var type = $("#sortType option:selected").val();
            if (but) {
                sens = $(but).attr("id");
            } else {
                sens = $("#sortSens .active").attr("id");
            }
            if (type == "date") {
                $("#currentdirectory").children().sortElements(sortByDate);

            } else if (type == "name") {
                $("#currentdirectory").children().sortElements(sortByName);

            } else if (type == "type") {
                $("#currentdirectory").children().sortElements(function(a, b) {
                    if ($(a).attr("class") == $(b).attr("class")) return sortByName(a, b);
                    if (sens == "Asc") return $(a).attr("class") > $(b).attr("class") ? 1 : -1;
                    return $(a).attr("class") < $(b).attr("class") ? 1 : -1;

                });

            } else {
                console.log("type : " + type + " / sens : " + sens);
            }

        },
        sortByDate = function(a, b) {
            if (sens == "Asc") return $(a).attr("data-date-modif") > $(b).attr("data-date-modif") ? 1 : -1;
            return $(a).attr("data-date-modif") < $(b).attr("data-date-modif") ? 1 : -1;

        },
        innerdropUploadFile = function(evt) {
            this.className = '';
            evt.preventDefault();
            var file = evt.dataTransfer.files[0];
            if (formUploadFile) {
                formUploadFile.append("upload", file);
                formUploadFile.append("parent", $("#parent").val());
                $.ajax({
                    url: "/ged/add/document" ,
                    type: "POST",
                    data: formUploadFile,
                    processData: false,
                    contentType: false,
                    success: function(res) {
                        $("#addFileModal").modal('hide');
                        document.location.reload();
                    }
                });
            }
            return false;
        },
        isShowType = function(objet) {
            var valueSelected = $("#filter option:selected").val();
            return valueSelected == "" || objet.hasClass("type-" + valueSelected)
        },
        isShowName = function(objet) {
            var valueSelected = $("#filterOnName").val();
            return valueSelected == "" ||  (objet.attr("data-filter").toLowerCase().indexOf(valueSelected.toLowerCase())!=-1);
        };
    /**
     * Objet to manage.
     **/
    return {
         /**
         * call the create directory method.
         **/
        createDir: function() {
            var newdir = $("#dirName").val(),
                pathAbsolute;

            if (newdir && $.trim(newdir) != "") {
                // création du répertoire
                $("#dirName_control_group").removeClass("error");



                 $("#addDirectoryModal").modal('hide');
                 showLoadModal();
                 $("#formAddDirectory").submit();
            } else {

                // gestion erreur
                $("#dirName_control_group").addClass("error");
            }
            return false;
        },
        /**
         * open the create directory dialog box.
         **/
        openCreateDir: function() {
            $("#dirName_control_group").removeClass("error");
            $("#addDirectoryModal").modal();
            return false;
        },
        /**
         * upload the file and refresh the page.
         **/
        dropUploadFile: function(evt) {
            innerdropUploadFile(evt);
        },
        /**
         * open the upload dialog box.
         **/
        openUploadFile: function() {
            if (window.FormData) {
                formUploadFile = new FormData();

            }

            $("#fileName_control_group").removeClass("error");
            $("#addFileModal").modal();
            return false;
        },
        /**
         * add a new url in ged document.
         **/
        addURL: function() {
            var name = $("#urlName").val(),
                adress = $("#adress").val();
            if (!name || $.trim(name) == "") {
                $("#urlName_control_group").addClass("error");
                return false;
            } else {
                $("#urlName_control_group").removeClass("error");
            }
            if (!adress || $.trim(adress) == "") {
                $("#adress_control_group").addClass("error");
                return false;
            } else {
                $("#adress_control_group").removeClass("error");
            }

            $("#addURLModal").modal('hide');
            showLoadModal();
            $("#formAddLink").submit();

            return false;
        },
        /**
         * open the add url dialog box.
         **/
        openAddURL: function() {
            $("#urlName_control_group").removeClass("error");
            $("#adress_control_group").removeClass("error");
            $("#addURLModal").modal();
        },
        /**
         * show/hide the zone filters.
         **/
        afficherFiltre: function(o, selector) {
            var elt = $(o);
            var show = elt.attr("data-ged-push") != "true";
            if (show) $(selector).show();
            else $(selector).hide();
            elt.attr("data-ged-push", show);
        },
        /**
         *  filters the list of files.
         **/
        filtrer: function() {
            $("#currentdirectory").children().each(function() {
                var objet = $(this);
                if (isShowType(objet) && isShowName(objet)) {
                    objet.show();
                } else {
                    objet.hide();
                }
            });


        },

        handleKeyPress: function(e, elt) {
            var key = e.keyCode || e.which;
            if (key == 13) {
                this.filtrer();
            }
        },
        sortElmnt: function(but) {
            innerSorts(but);
        },
        /**
         * initialize the page.
         **/
        init: function() {
            $(".breadcrumb").children("li:last").addClass("active");

            $("#holder")[0].ondrop = function(evt) {
                innerdropUploadFile(evt);
            };
        }
    }
});
