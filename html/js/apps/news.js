// définition of News reader module.,'domReady!'
define(["common/utils", "text!templates/menu.html"], function(Utils, Menu) {

    var treatNews = function(item, place) {
            var title = $(item).find("title").text();
            if (title.length > 60) {
                title = title.substring(0, 49) + " ...";
            }
            $link = $(item).find("link");
            $(place).html(title).attr("href", $link.text());
        };

    return {
        init: function() {
            console.log("loading news");
            $("body").append("<div id=\"templates\" ></div>");
            // Gestion du menu.
            $("#menu").html(Menu).css("height", "800px").css("display", "inline");
            var path = window.location.href;
            $(".lienMenuPrincipal").each(function() {
                var tmpPath = $(this).children("a")[0].href;

                if (!path.startsWith(tmpPath)) {
                    $(this).removeClass("active");
                }
            });


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

        }
    }
});
