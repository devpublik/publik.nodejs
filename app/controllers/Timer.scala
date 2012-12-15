package controllers

import play.api.mvc._
import models.ApplicationPage._
import models.SoundTimer
import play.api.libs.json.{JsArray, JsValue, Json}
import play.api.Play

/**
 * Timer Controller.
 * User: skarb
 * Date: 06/12/12
 * Time: 22:29
 */
object Timer extends Controller {
  val menuIndex = timer.toString

  /**
   * index of the application.
   * @return
   */
  def index = Action {
    val resultsDb = SoundTimer.findAll
    val pathSound = resultsDb.sortWith {
      (a, b) => a.fileName.toLowerCase < b.fileName.toLowerCase

    }.map {
      v => SoundTimer.toMap(v)
    }

    if (!pathSound.isEmpty) {
      val selected = pathSound.head("id")
      Ok(views.html.timerindex(menuIndex, selected, pathSound))
    }
    else {
      Ok(views.html.timerindex(menuIndex, null, List.empty))
    }


  }

  /**
   * Delete all files in ids parameter request.
   * @return
   */
  def del = Action {
    implicit request => request.body.asFormUrlEncoded match {
      case Some(b) =>
        b("ids").map {
          id => SoundTimer.remove(id.toLong)
        }
        Redirect(routes.Timer.index)
      case None => BadRequest
    }

  }

  /**
   * load a sound.
   * @param id
   * @return
   */
  def soundFile (id: Option[Long]) = Action {
    id match {
      case Some(v) =>
        SoundTimer.load(v) match {
          case Some(value) =>
            val directoryToStore = Play.current.configuration.getString("sound.timer.directory").getOrElse("s")
            Ok.sendFile(new java.io.File(directoryToStore+"/" + value.fileName))
          case None => BadRequest
        }

      case None =>
        NotFound
    }

  }

  /**
   * Add a new sound.
   * @return
   */
  def add = Action(parse.multipartFormData) {
    request =>
      val ko = Ok(Json.toJson(Map("result" -> false)))
      request.body.file("upload").map {
        picture =>

          import java.io.File
          val filename = picture.filename
          val contentType = picture.contentType

          Option(request.body.dataParts("name")) match {

            case Some(values) =>
              val name = values(0)
              if (contentType.get == "audio/mp3") {
                val directoryToStore = Play.current.configuration.getString("sound.timer.directory").getOrElse("s")
                picture.ref.moveTo(new File(directoryToStore+"/" + filename))
                SoundTimer.create(SoundTimer(Option(0L), name, filename))
                Ok(Json.toJson(Map("result" -> true)))
              } else {
                ko
              }

            case None =>
              play.Logger.info("No name")
              ko
          }
      }.getOrElse {
        play.Logger.info("No file")

        ko
      }
  }

  /**
   * launch the popup timer.
   * @return
   */
  def popup = Action {
    implicit request =>
      request.body.asFormUrlEncoded match {
        case Some(values) =>

          Ok(views.html.timerpopup(values("hour")(0), values("minute")(0), values("sound")(0)))
        case None => BadRequest
      }


  }
}
