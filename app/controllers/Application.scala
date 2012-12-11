package controllers

import play.api.mvc._

import play.api.data.Form
import play.api.data.Forms._
import play.api.data.Forms.{mapping, optional}
import play.api.data.format.Formats._
import models.ApplicationPage.postit
import models.PostIt
import scala.Predef._
import scala.Some

/**
 * Main Page.
 *
 * This page contains the postit view.
 */
object Application extends Controller {

  /**
   * Class of the List of postits.
   */
  case class PostIts (name: String, list: Seq[PostIt])

  /**
   * A form of PostIt.
   */
  val PostItForm = Form(
    mapping(
      "id" -> optional(longNumber),
      "title" -> nonEmptyText,
      "typeP" -> nonEmptyText,
      "contains" -> nonEmptyText,
      "active" -> optional(of[Boolean]),
      "date" -> optional(longNumber)
    )(PostIt.apply)(PostIt.unapply)
  )

  /**
   * The main index Menu.
   */
  val menuIndex = postit.toString

  /**
   * Create the default List of PostIt.
   */
  def createList (): List[PostIt] = {
    val postitDataList = PostIt.findAll()
    postitDataList.toList.filter {
      (data: PostIt) => data.active
    }.sortWith {
      (s, t) =>
        s.date > t.date
    }
  }

  /**
   * the main Url.
   */
  def index = Action {
    Ok(views.html.index(createList(), menuIndex))
  }

  /**
  Delete  a postit.
    */
  def delete (id: Long) = Action {
    val tmp = PostIt.load(id)
    tmp match {
      case Some(result) =>
        result.active = false
        PostIt.update(result)
        Redirect("/")
      case None => BadRequest
    }
  }

  /**
   * Add a postit.
   */
  def add = Action {
    implicit request =>
      PostItForm.bindFromRequest.fold(
        errors => {
          play.Logger.error("error " + errors)
          BadRequest
        },
        success => {

          play.Logger.debug("success:" + success)
          PostIt.create(Option(success))
          Redirect(routes.Application.index)
        }
      )

  }
}