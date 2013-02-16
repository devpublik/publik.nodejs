package controllers

import play.api.mvc.{Action, Controller}

import play.api.libs.json.{JsArray, JsValue, Json}
import play.api.libs.concurrent.Akka
import play.api.libs.ws.{Response, WS}
import play.api.Play.current
import xml.{NodeSeq, Elem}
import concurrent.Future
import play.api.libs.concurrent.Execution.Implicits._


/**
 * Web service which call a news web service and convert to JSon.
 * Date: 29/11/12
 * Time: 19:48
 * To change this template use File | Settings | File Templates.
 */
object News extends Controller {
  /**
   * Transform the result to the Json value.
   * @param elem xml datas.
   * @return
   */
  def parseXml (elem: Elem): JsValue = {
    val item = elem \\ "item"
    val convert: PartialFunction[NodeSeq, JsValue] = {
      case x => Json.toJson(Map("item" -> Json.toJson(
        Map(
          "title" -> Json.toJson((x \ "title").text),
          "url" -> Json.toJson((x \ "link").text)
        ))
      ))
    }
    val array = item.map(convert)
    JsArray(array)
  }

  /**
   * Web service which load the news.
   * @return
   */
  def read = Action {
      Async {

        val result: Future[Response] =  WS.url("http://news.google.fr/news?pz=1&cf=all&ned=fr&hl=fr&output=rss")
          .get()  ;
        result  .map {
          response =>
            Ok(parseXml(response.xml ) )
        }
      }
  }
}
