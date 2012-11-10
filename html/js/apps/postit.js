define(["lib/common/utils", "text!templates/postit/postit.html", "ui/default"], function(Utils, Postit) {
    var targetDiv;

    var hideCtxMenu = function() {
            var ctx_menu = $("#context-menu-postit"); /*if(targetDiv && event.target==targetDiv){*/

            ctx_menu.hide();
            $(targetDiv).unbind("mouseleave");
            targetDiv = null; /*}*/
        };

    return {
        /**
        * Delete an instance of postit.
        */
        deletePostIt : function() {
            $(targetDiv).parents(".postit-publik").each(function() {
                var id = $(this).data("id-postit");
                $.get("/services", {
                    action: "postit.delete",
                    "id": id
                }, function(resultats) {
                    document.location.reload();
                });
            });

        },
        /**
        * show or hide a preview for the creation.  
        */
        changePreviewCreation:function() {
            if ($("#preview-create-postit").is(":visible")) {
                $("#form-create-postit").slideToggle("slow");
                $("#preview-create-postit").hide("fast");
            } else {
                $("#form-create-postit").hide("fast");
                $("#preview-create-postit").slideToggle("slow");
                // updating the preview
                $('#wysiwyg').wysiwyg("save");
                var type = $(".type-postit.active").data("type-title-value"),
                    title = $("#title").val(),
                    contains = $('#wysiwyg').val();
                $("#preview-title").attr("class", type).html(title);
                $("#preview-contains").html(contains);
            }

        },

        /***
         * create a new instance of Post-It.
         **/
        createPostIt: function() {

            var type = $(".type-postit.active").data("type-title-value"),
                title = $("#title").val(),
                contains;

            $('#wysiwyg').wysiwyg("save");
            contains = $('#wysiwyg').val();
            $.get("/services", {
                action: "postit.create",
                "title": title,
                "type": type,
                "contains": contains
            }, function(resultats) {
                $("#create-postit").modal('hide');
                document.location.reload();
            });
            return false;
        },


        // initialisation de l'IHM.
        init: function() {
            console.log("load postit");
            // initialisation des postits.
            $.get("/services", {
                action: "postit.read"
            }, function(resultats) {
                var obj = jQuery.parseJSON(resultats);
                if (obj) {
                    $.each(obj, function(index) {
                        var tmpDate = new Date(parseInt(this.date));
                        var objet = {
                            data: {
                                type: this.type,
                                id: this.id,
                                title: this.title,
                                contains: this.contains,
                                date: Utils.format(tmpDate, "frDateTime", false)
                            }
                        };
                        var tmpHTML = Utils.tmpl(Postit, objet);
                        $("#container-postit").append(tmpHTML);

                    });
                }
                // initialisation de l'IHM.
                $(".draggable").draggable({
                    cursor: "move",
                    revert: "invalid"
                });

                $(".droppable").droppable({
                    activeClass: "ui-state-hover",
                    hoverClass: "ui-state-active",
                    drop: function(event, ui) {

                        var targetElem = $(this).attr("id");

                        $(this).addClass("ui-state-highlight").find("p").html("Dropped! inside " + targetElem);

                    }
                });
                $('#wysiwyg').wysiwyg();
                $('.tooltip-date').tooltip({
                    placement: "top"
                });


                $("#context-menu-postit").mouseleave(function(event) {
                    if (targetDiv && !$(targetDiv).is(":hover")) {
                        hideCtxMenu();
                    }
                })


                $(".context-menu-postit").mousedown(function(event) {
                    if (event.which == 3) {
                        var ctx_menu = $("#context-menu-postit");
                        if (ctx_menu.is(":visible")) {
                            hideCtxMenu(event);

                        } else {
                            ctx_menu.show();
                            var x = event.pageX,
                                y = event.pageY;
                            targetDiv = event.target;
                            $("#context-menu-postit").offset({
                                top: y,
                                left: x
                            });
                            $(targetDiv).bind("mouseleave", function(e) {
                                if (!$("#context-menu-postit").is(":hover")) {
                                    hideCtxMenu();
                                }

                            });
                        }
                    }
                });
                //deletee the navigator context menu
                document.oncontextmenu = new Function("return false");

            });
        }
    }
});
