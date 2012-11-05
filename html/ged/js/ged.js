function showLoadModal() {
    $("#loadModal").modal();
}

function hideLoadModal() {
    $("#loadModal").modal("hide");
}


function afficherFiltre(o,selector) {
    var elt = $(o);
    var show = elt.attr("data-ged-push") != "true";
    if (show) $(selector).show();
    else $(selector ).hide();
    elt.attr("data-ged-push", show);
}

function addURL() {
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
}

function openAddURL() {
    $("#urlName_control_group").removeClass("error");
    $("#adress_control_group").removeClass("error");
    $("#addURLModal").modal();
}

function dropUploadFile(evt) {
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
}



function openUploadFile() {
    if (window.FormData) {
        formUploadFile = new FormData();

    }

    $("#fileName_control_group").removeClass("error");
    $("#addFileModal").modal();
    return false;
}


function openCreateDir() {
    $("#dirName_control_group").removeClass("error");
    $("#addDirectoryModal").modal();
    return false;
}

function createDir() {
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
}

function toUp() {
    var actualPath = $("#pathdir").val(),
        li;
    if (actualPath == "") return;

    li = actualPath.lastIndexOf("/");
    if (li == -1) {
        document.location = ROOT;

    } else document.location = ROOT + actualPath.substring(0, li);
}

function isShowType(objet) {
    var valueSelected = $("#filter option:selected").val();
    return valueSelected == "" || objet.hasClass("type-" + valueSelected)
}

function isShowName(objet) {
    var valueSelected = $("#filterOnName").val();
    return valueSelected == "" || valueSelected == objet.attr("data-filter")
}

function filtrer() {
    $("#currentdirectory").children().each(function() {
        var objet = $(this);
        if (isShowType(objet) && isShowName(objet)) {
            objet.show();
        } else {
            objet.hide();
        }
    });
}


function handleKeyPress(e, elt) {
    var key = e.keyCode || e.which;
    if (key == 13) {
        filtrer();
    }
}
var sens;
function sortByName(a, b){
            if (sens == "Asc")
                return $(a).attr("data-date-modif") > $(b).attr("data-date-modif") ? 1 : -1;
            return $(a).attr("data-date-modif") < $(b).attr("data-date-modif") ? 1 : -1;

        }


function sortElmnt(but){
    var type = $("#sortType option:selected").val();
     if(but){
        sens = $(but).attr("id");
     } else {
     sens =$("#sortSens .active").attr("id");
 }
    if (type == "date"){
         $("#currentdirectory").children().sortElements(sortByName);

    } else if (type == "name"){
        $("#currentdirectory").children().sortElements(function(a, b){
            if (sens == "Asc")
                return $(a).attr("data-filter") > $(b).attr("data-filter") ? 1 : -1;
            return $(a).attr("data-filter") < $(b).attr("data-filter") ? 1 : -1;

        });

    } else if (type == "type"){
        $("#currentdirectory").children().sortElements(function(a, b){
            if( $(a).attr("class") == $(b).attr("class"))
               return sortByName(a,b);
            if (sens == "Asc")
                return $(a).attr("class") > $(b).attr("class") ? 1 : -1;
            return $(a).attr("class") < $(b).attr("class") ? 1 : -1;

        });

    } else {
        console.log("type : "+type +" / sens : "+sens);
    }

}
