package controllers

import play.api.mvc._
import models.ApplicationPage._

/**
 * Projects root controlleer
 * User: skarb
 * Date: 17/12/12
 * Time: 21:56
 */
object Projects extends Controller {

  val menuIndex = projects.toString

  def index = Action {
    Ok(views.html.projects(menuIndex))
  }

  def detail = TODO
}
