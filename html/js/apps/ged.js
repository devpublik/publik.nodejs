

define(["common/utils"], function(Utils) {
    var sens;

    var showLoadModal = function() {
            $("#loadModal").modal();
        },

        hideLoadModal = function() {
            $("#loadModal").modal("hide");
        },
        innerSorts = function(but) {
            var type = $("#sortType option:selected").val();
            if (but) {
                sens = $(but).attr("id");
            } else {
                sens = $("#sortSens .active").attr("id");
            }
            if (type == "date") {
                $("#currentdirectory").children().sortElements(sortByName);

            } else if (type == "name") {
                $("#currentdirectory").children().sortElements(function(a, b) {
                    if (sens == "Asc") return $(a).attr("data-filter") > $(b).attr("data-filter") ? 1 : -1;
                    return $(a).attr("data-filter") < $(b).attr("data-filter") ? 1 : -1;

                });

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
        sortByName = function(a, b) {
            if (sens == "Asc") return $(a).attr("data-date-modif") > $(b).attr("data-date-modif") ? 1 : -1;
            return $(a).attr("data-date-modif") < $(b).attr("data-date-modif") ? 1 : -1;

        },
        innerdropUploadFile = function(evt) {
            this.className = '';
            evt.preventDefault();
            var file = evt.dataTransfer.files[0];
            if (formUploadFile) {
                formUploadFile.append("upload", file);
                $.ajax({
                    url: "/services?action=documents.put&type=file&path=" + $("#pathdir").val(),
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
            return valueSelected == "" || valueSelected == objet.attr("data-filter")
        };

    return {
        ROOT: "/",
        toUp: function() {
            var actualPath = $("#pathdir").val(),
                li;
            if (actualPath == "") return;

            li = actualPath.lastIndexOf("/");
            if (li == -1) {
                document.location = ROOT;

            } else document.location = ROOT + actualPath.substring(0, li);
        },
        createDir: function() {
            var newdir = $("#dirName").val(),
                pathAbsolute;

            if (newdir && $.trim(newdir) != "") {
                // création du répertoire
                $("#dirName_control_group").removeClass("error");
                pathAbsolute = $("#pathdir").val() + "/" + $.trim(newdir);
                $.get("/services", {
                    action: "documents.put",
                    "type": "directory",
                    "path": pathAbsolute
                }, function() {
                    $("#addDirectoryModal").modal('hide');
                    document.location.reload();
                });


            } else {

                // gestion erreur
                $("#dirName_control_group").addClass("error");
            }
            return false;
        },
        openCreateDir: function() {
            $("#dirName_control_group").removeClass("error");
            $("#addDirectoryModal").modal();
            return false;
        },
        dropUploadFile: function(evt) {
            innerdropUploadFile(evt);
        },
        openUploadFile: function() {
            if (window.FormData) {
                formUploadFile = new FormData();

            }

            $("#fileName_control_group").removeClass("error");
            $("#addFileModal").modal();
            return false;
        },
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

            $.get("/services", {
                action: "documents.put",
                "type": "url",
                "path": $("#pathdir").val(),
                "name": name,
                "adress": adress
            }, function() {
                $("#addURLModal").modal('hide');
                document.location.reload();
            });

            return false;
        },
        openAddURL: function() {
            $("#urlName_control_group").removeClass("error");
            $("#adress_control_group").removeClass("error");
            $("#addURLModal").modal();
        },
        afficherFiltre: function(o, selector) {
            var elt = $(o);
            var show = elt.attr("data-ged-push") != "true";
            if (show) $(selector).show();
            else $(selector).hide();
            elt.attr("data-ged-push", show);
        },

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

        init: function() {
            var formUploadFile, filtersTypeahead = "[";

            ROOT = "index.html?path=";



            var path = Utils.getUrlVar("path"),
                oldPath = "",
                anchorRoot = $(".breadcrumb");
            showLoadModal();
            if (!path) {
                path = "";
            }

            if (path != "") {
                // mise à jour de l'ancre'
                var currentTagTokens = path.split("/");;
                for (var i = 0; i < currentTagTokens.length; i++) {
                    if (oldPath.length > 0) {
                        oldPath = oldPath + "/";
                    }
                    oldPath = oldPath + currentTagTokens[i];

                    anchorRoot.append(Utils.tmpl("template_breakdown", {
                        "urlA": oldPath,
                        "urlB": currentTagTokens[i]
                    }));
                }


            }
            anchorRoot.children("li:last").addClass("active");
            // création de la liste des fichiers
            $("#pathdir").val(path);
            $("#currentdirectory").empty();
            if (path != "") {
                $("#currentdirectory").append(Utils.tmpl("template_subdir", "{\"d\":\"s\"}"));
            }

            $.getJSON("/services", {
                action: "documents.read",
                "path": path
            }, function(resultat) {
                console.log(resultat);


                $.each(resultat, function(key) {
                    var tmhref = "/services?action=documents.read&path=" + this.path,
                        filterData;
                    if (this.type == "directory") {
                        tmhref = ROOT + this.path;
                    }

                    if (filtersTypeahead.length > 1) filtersTypeahead += ",";


                    if (this.type == "url") {
                        filterData = this.path.replace(path + "/", "").replace("/", "").replace(".url", "");
                        filtersTypeahead += '"' + filterData + '"';
                    } else {
                        filterData = this.path.replace(path + "/", "").replace("/", "");
                        filtersTypeahead += '"' + filterData + '"';
                    }


                    var tmpHTML = Utils.tmpl("template_files", {
                        data: {
                            type: this.type,
                            path: this.path.replace(path + "/", ""),
                            datemdf: this.dmodif
                        },
                        hreaf: tmhref,
                        filter: filterData
                    });
                    $("#currentdirectory").append(tmpHTML);
                    $("#filterOnName").attr("data-source", filtersTypeahead + "]");

                    innerSorts();
                    hideLoadModal();
                });
            });

            $("#holder")[0].ondrop = function(evt) {
                innerdropUploadFile(evt);
            };
        }
    }
});
