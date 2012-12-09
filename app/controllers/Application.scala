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


object Application extends Controller  {

  case class PostIts(name:String, list:Seq[PostIt])

  val PostItForm  = Form(
    mapping (
      "id" ->   optional( longNumber),
      "title" -> nonEmptyText,
      "typeP" ->   nonEmptyText,
      "contains" -> nonEmptyText,
      "active" -> optional(of[Boolean]),
      "date" ->  optional( longNumber)
    ) (PostIt.apply)(PostIt.unapply)
  )

 /* val PostItsForm = Form (
     mapping (
       "name" ->  nonEmptyText,
      "postits" -> seq(PostItForm.mapping)

     ) (PostIts.apply)(PostIts.unapply)
  ) */


  val menuIndex =  postit.toString

  def createList() : List[PostIt] = {
    val postitDataList  = PostIt.findAll()
    postitDataList.toList.filter{
      (data: PostIt) => data.active
    }.sortWith{(s, t) =>
      s.date > t.date
    }
  }

  def index = Action {
    Ok(views.html.index(createList(),menuIndex))
  }

  def delete(id:Long) = Action {
     val tmp = PostIt.load(id)
     tmp match {
       case Some(result) =>
         result.active = false
         PostIt.update(result)
         Redirect("/")
       case None => BadRequest
     }
  }

  def add = Action{
    implicit request =>
      PostItForm.bindFromRequest.fold(
      errors => {
        play.Logger.error("error "+errors)
        BadRequest
      },
      success => {

        play.Logger.debug("success:"+success)
        PostIt.create(Option(success))
        Redirect(routes.Application.index)
      }
      )

  }
}