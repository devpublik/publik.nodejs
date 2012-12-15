package controllers

import play.api.mvc._
import models.ApplicationPage._
import models.{SortingGed, GedType, Ged}
import library.FilesParser
import play.api.libs.iteratee.Enumerator
import play.api.libs.json.Json
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

  def index = Action {
    change(None)
  }

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

  def change (path: Option[Long]) = Action {
    var gedType = GedType.Directory
    var gedDoc: Option[Ged] = None
    if (path != None) {
      gedDoc = Ged.load(path.get)
      gedType = gedDoc.get.typeDoc
    }

    gedType match {
      case GedType.Directory =>
        val values = Ged.search(path, SortingGed.NameAsc)
        val parent = recursiveParent(gedDoc)
        val parentId: Option[Ged] = gedDoc match {
          case Some(p) => p.parent
          case None => None
        }

        Ok(views.html.ged(menuIndex, parent, values, parentId, path))
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

  def addLink () = Action {
    implicit request =>
      request.body.asFormUrlEncoded match {
        case Some(values) =>
          play.Logger.debug("addLink")
          val parentid = getParentId(values)
          val name= values.get("name")
          val url= values.get("url")
          Ged.createLink(name.get(0),url.get(0),parentid)
          Redirect(routes.Documents.index)
        case None => BadRequest
      }

  }

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

  def getParentId (formUrlEncoded: Map[String, Seq[String]]): Option[Long] = {
    val returValue: Seq[Option[Long]] = formUrlEncoded("parent").map {
      case value =>
        if(value != "")
          Option(value.toLong)
        else
          None
    }
    returValue(0)
  }

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

  def update = Action {
    Ged.removeAll()
    val tmp = FilesParser.getGedDocuments()
    println(tmp)
    tmp.map {
      v =>

        Ged.create(v)
    }

    Redirect(routes.Documents.index)
  }
}
