package controllers

import play.api.mvc._
import models.ApplicationPage._


/**
 * Timer.
 * User: skarb
 * Date: 06/12/12
 * Time: 22:29
 */
object Timer extends Controller {
  val menuIndex =  timer.toString

  def index = Action {
    val pathSound =Map(
    "punk"-> "sound/1.mp3"  ,
      "coin coin"->"sound/2.mp3"
    )
    val selected = "punk"
    Ok(views.html.timerindex(menuIndex,selected,pathSound))
  }

  def soundFile(id:Option[Long])= Action {
    Ok.sendFile(new java.io.File("soundFiles/2.mp3"))
  }

  def popup = Action {
    implicit request =>
      request.body.asFormUrlEncoded  match{
        case Some(values) =>

          Ok(views.html.timerpopup(values("hour")(0),values("minute")(0),values("sound")(0)))
        case None =>    BadRequest
      }


  }
}
