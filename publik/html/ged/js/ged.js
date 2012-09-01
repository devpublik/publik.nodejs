 function afficherFiltre(o) {
     var elt = $(o);
     var show = elt.attr("data-ged-push") != "true";
     if (show) $(".filtrer-element").show();
     else $(".filtrer-element").hide();
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

 function filtrer() {
     var valueSelected = $("#filter option:selected").val();

     $("#currentdirectory").children().each(function() {
         var objet = $(this);
         if (valueSelected == "" || objet.hasClass("type-" + valueSelected)) {
             objet.show();
         } else {
             objet.hide();
         }
     });
 }
