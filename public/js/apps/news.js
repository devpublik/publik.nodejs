// définition of News reader module.,'domReady!'
define(["common/utils"], function(Utils) {

    var treatNews = function(item, place) {
            var title = item.title;
                  if (title.length > 60) {
                                title = title.substring(0, 57) + " ...";
                            }
            $(place).html(title).attr("href",item.url);
        };

    return {
        init: function() {
            console.log("loading news");

            // display the news
            $.get("/services/news", {
                action: true
            }, function(jsonResult) {
                //console.log(html);


                if (jsonResult.length > 0) {
                    treatNews(jsonResult[0].item, "#newsFeed");
                }
                if (jsonResult.length > 1) {
                    treatNews(jsonResult[1].item, "#newsFeed2");
                }
            }, "json");
            // search form management
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
