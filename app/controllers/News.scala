package controllers

import play.api.mvc.{Action, Controller}

import play.api.libs.json.{JsArray, JsValue, Json}
import play.api.libs.concurrent.Akka
import play.api.libs.ws.WS
import play.api.Play.current
import xml.{NodeSeq, Elem}

/**
 * Web service which call a news web service and convert to JSon.
 * Date: 29/11/12
 * Time: 19:48
 * To change this template use File | Settings | File Templates.
 */
object News extends Controller {
  /**
   * Transform the result to the Json value.
   * @param elem
   * @return
   */
  def parseXml (elem:Elem) :JsValue  = {
    var item = elem \\"item"
    val convert : PartialFunction[NodeSeq, JsValue] ={
      case x => Json.toJson( Map("item" ->  Json.toJson(
        Map(
          "title" -> Json.toJson((x \"title").text),
          "url" -> Json.toJson((x \"link").text)
        ))
      )  )
    }
    var array =item.map(convert)
    JsArray( array);
  }

  /**
   * Web service which load the news.
   * @return
   */
  def read = Action { implicit request =>

    val promiseOfString = Akka.future {
      WS.url("http://news.google.fr/news?pz=1&cf=all&ned=fr&hl=fr&output=rss").get().map { response =>
        response.xml
      }
    }
    Async {
      promiseOfString.orTimeout("Oops", 5000).map { eitherStringOrTimeout =>
        eitherStringOrTimeout.fold(
          content => Ok( parseXml( content.value.get)),
          timeout => InternalServerError("Timeout Exceeded!")
        )
      }
    }
  }
}
