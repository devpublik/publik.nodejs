// définition of News reader module.,'domReady!'
define(["common/utils"], function(Utils) {

    var allSearchDocument = [];

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
                        url: "/ged/typeahead/"+$("#searchGed").val(),
                        type: "get",
                        dataType: "JSON",
                        async: false,
                        success: function(results) {
                            allSearchDocument = results
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

                    for(var i = 0 ;i<allSearchDocument.length ;i++){
                        var x = allSearchDocument[i];
                        if(x.name == valueOfSearch){
                            $("#formSearchGed").attr("action","/ged/"+x.id);
                            $("#formSearchGed").submit();
                            return false;
                        }
                    }


                    return false;
                }
            });

        }
    }
});
