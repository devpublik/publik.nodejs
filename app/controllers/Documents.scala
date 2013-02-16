package controllers

import play.api.mvc._
import models.ApplicationPage._
import models.{SortingGed, GedType, Ged}
import library.FilesParser
import play.api.libs.iteratee.Enumerator
import play.api.libs.json.{JsArray, Json}
import scala.Some
import play.api.mvc.SimpleResult
import play.api.mvc.ResponseHeader


/**
 * Ged.
 * User: skarb
 * Date: 06/12/12
 * Time: 22:20
 */
object Documents extends Controller {

  val menuIndex = ged.toString

  /**
   * welcome Page
   * @return
   */
  def index = Action {
    val gedType = GedType.Directory
    val gedDoc = None
    val idGed = None
    val values = Ged.search(idGed, SortingGed.NameAsc)
    val parent = recursiveParent(gedDoc)
    val parentId = None

    Ok(views.html.ged(menuIndex, parent, values, parentId, idGed))

  }


  /**
   * Private method for creating the anchor text
   * @param path
   * @return
   */
  def recursiveParent (path: Option[Ged]): String = {
    path match {
      case Some(v) =>

        val parent = recursiveParent(v.parent)
        if (parent == "/") {
          v.name
        } else {
          v.name + "/" + parent
        }
      case None => "/"
    }
  }

  /**
   * Action for loading a ged document
   * @param idGed
   * @return
   */
  def change (idGed: Long) = Action {
    var gedType = GedType.Directory
    var gedDoc: Option[Ged] = None
    gedDoc = Ged.load(idGed)
    gedType = gedDoc.get.typeDoc


    gedType match {
      case GedType.Directory =>
        val values = Ged.search(Option(idGed), SortingGed.NameAsc)
        val parent = recursiveParent(gedDoc)
        val parentId: Option[Ged] = gedDoc match {
          case Some(p) => p.parent
          case None => None
        }

        Ok(views.html.ged(menuIndex, parent, values, parentId, Option(idGed)))
      case GedType.Document =>

        val file = new java.io.File(gedDoc.get.absolutePath)
        SimpleResult(
          header = ResponseHeader(OK, Map(
            CONTENT_LENGTH -> file.length.toString,
            CONTENT_TYPE -> play.api.libs.MimeTypes.forFileName(file.getName)
              .getOrElse(play.api.http.ContentTypes.BINARY)
          )),
          Enumerator.fromFile(file)
        )
      case GedType.Url =>
        val file = new java.io.File(gedDoc.get.absolutePath)
        val line = java.nio.file.Files.readAllLines(file.toPath, java.nio.charset.Charset.defaultCharset()).get(3)
        val pattern = "(URL=)(.*)".r
        val url = pattern replaceAllIn(line, "$2")



        Redirect(url)
    }


  }

  /**
   * create a new link.
   * @return
   */
  def addLink () = Action {
    implicit request =>
      request.body.asFormUrlEncoded match {
        case Some(values) =>
          play.Logger.debug("addLink")
          val parentid = getParentId(values)
          val name = values.get("name")
          var url = values.get("url").get(0)
          if (!url.startsWith("http://")) {
            url = "http://" + url
          }
          Ged.createLink(name.get(0), url, parentid)
          Redirect(routes.Documents.index)
        case None => BadRequest
      }

  }

  /**
   * create a directory.
   * @return
   */
  def addDirectory () = Action {
    implicit request =>
      request.body.asFormUrlEncoded match {
        case Some(values) =>
          val parentid = getParentId(values)
          val name = values.get("name")
          Ged.createDirectory(name.get(0), parentid)
          Redirect(routes.Documents.index)
        case None => BadRequest
      }

  }

  /**
   * get the parent id from the form creation.
   * @param formUrlEncoded
   * @return
   */
  def getParentId (formUrlEncoded: Map[String, Seq[String]]): Option[Long] = {
    val returValue: Seq[Option[Long]] = formUrlEncoded("parent").map {
      case value =>
        if (value != "") {
          Option(value.toLong)
        }
        else {
          None
        }
    }
    returValue(0)
  }

  /**
   * add a new document.
   * @return
   */
  def addDocument () = Action(parse.multipartFormData) {
    implicit request =>
      val ko = Ok(Json.toJson(Map("result" -> false)))
      request.body.file("upload").map {
        picture =>
          val parentid = getParentId(request.body.asFormUrlEncoded)
          Ged.createDocument(picture, parentid)
          Ok(Json.toJson(Map("result" -> true)))
      }.getOrElse {
        play.Logger.debug("No file")
        ko
      }

  }

  /**
   * Update all files from the directory structure.
   * @return
   */
  def update = Action {
    Ged.removeAll()
    val tmp = FilesParser.getGedDocuments()
    tmp.map {
      v => Ged.create(v)
    }

    Redirect(routes.Documents.index)
  }

  /**
   * Action for creating the typeahead.
   * @param part
   * @return
   */
  def getTypeAhead (part: String) = Action {
    Ok(JsArray(Ged.findByName(part).map {
      v =>
        Json.toJson(Map(
          "id" -> v.id.get.toString,
          "name" -> v.name.replaceAll("\\.url", ""),
          "type" -> v.typeDoc.toString
        ))
    }))
  }
}
