// définition of News reader module.,'domReady!'
define(["common/utils", "text!templates/menu.html"], function(Utils, Menu) {

    var treatNews = function(item, place) {
            var title = $(item).find("title").text();
            if (title.length > 60) {
                title = title.substring(0, 57) + " ...";
            }
            $link = $(item).find("link");
            $(place).html(title).attr("href", $link.text());
        };

    return {
        init: function() {
            console.log("loading news");
            $("body").append("<div id=\"templates\" ></div>");
            // management of the left menu.
            $("#menu").html(Menu).css("height", "800px").css("display", "inline");
            var path = window.location.href;
            $(".lienMenuPrincipal").each(function() {
                var tmpPath = $(this).children("a")[0].href;

                if (!path.startsWith(tmpPath)) {
                    $(this).removeClass("active");
                }
            });

            // display the news
            $.get("/services", {
                action: "news"
            }, function(html) {
                //console.log(html);
                var items = $(html).find("item");

                if (items.length > 0) {
                    treatNews(items[0], "#newsFeed");
                }
                if (items.length > 1) {
                    treatNews(items[1], "#newsFeed2");
                }
            }, "xml");

            $("#searchGed").typeahead({
                source: function(typeahead, query) {
                    $.ajax({
                        url: "/services",
                        type: "get",
                        data: {
                            action: "documents.search",
                            search: typeahead
                        },
                        dataType: "JSON",
                        async: false,
                        success: function(results) {
                            var return_list = [],
                                i = results.length;
                            while (i--) {
                                return_list[i] = results[i].name;
                            }
                            query(return_list);
                        }
                    });
                },
                items: 11
            }).keypress(function(evt) {
                var key = evt.keyCode || evt.which;
                if (key == 13) {
                    var valueOfSearch = $(this).val();
                    $.ajax({
                        url: "/services",
                        type: "get",
                        data: {
                            action: "documents.search",
                            search: valueOfSearch,
                            by: "name"
                        },
                        dataType: "JSON",
                        async: false,
                        success: function(result) {
                            var adress;
                            console.log(result)
                            if (result.resultat == true) {
                                adress = result.relativePath;
                                if (result.type == "directory") {
                                    $("#formSearchGed").attr("action", "/ged/index.html");
                                }
                                $("#formPathGed").attr("value", adress);
                                $("#formSearchGed").submit();
                            } else {
                                alert("Document non trouvé");
                            }
                        },
                        error: function(result) {

                            console.log(result)
                        }
                    });
                }
            });

        }
    }
});

