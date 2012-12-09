package controllers

import play.api.mvc.{Action, Controller}
import models.ApplicationPage._

/**
 * Documents.
 * User: skarb
 * Date: 06/12/12
 * Time: 22:20
 */
object Documents extends Controller {

  val menuIndex =  ged.toString

  def index = Action {
    Ok(views.html.ged(menuIndex))
  }
}
