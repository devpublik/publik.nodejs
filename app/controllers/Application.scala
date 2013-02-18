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
import play.i18n._
import java.io.File
import java.io.FileOutputStream
import org.apache.poi.xssf.usermodel._
import java.io.ByteArrayOutputStream
import org.apache.poi.ss.usermodel.IndexedColors
import org.apache.poi.hssf.usermodel.HSSFCellStyle
import java.util.Locale

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
  def index = Action  {
   // Locale.setDefault(Lang.forCode("en").toLocale);
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


  def generateSpreadSheet = Action {
    val AllPostit = PostIt.findAll
    val byteOS = new ByteArrayOutputStream();
    val wb = new XSSFWorkbook
    val sheet = wb.createSheet("Extraction")
    var rNum:Int = 0
    val style = wb.createCellStyle();
   // style.setFillBackgroundColor(IndexedColors.AQUA.getIndex());
    style.setAlignment(org.apache.poi.ss.usermodel.CellStyle.ALIGN_CENTER );
    style.setFillPattern(org.apache.poi.ss.usermodel.CellStyle.SPARSE_DOTS );
    style.setBorderBottom(org.apache.poi.ss.usermodel.CellStyle.BORDER_DOUBLE );
    style.setBorderLeft(org.apache.poi.ss.usermodel.CellStyle.BORDER_DOUBLE );
    style.setBorderRight(org.apache.poi.ss.usermodel.CellStyle.BORDER_DOUBLE );
    style.setBorderTop(org.apache.poi.ss.usermodel.CellStyle.BORDER_DOUBLE );
   // style.setFillPattern(org.apache.poi.ss.usermodel.CellStyle.BIG_SPOTS);
    val titles =  sheet.createRow(rNum)
    val row0 =titles.createCell(0)
    row0.setCellValue("Id.")
    row0.setCellStyle(style)
    val row1=titles.createCell(1)
    row1.setCellValue("Titre")
    row1.setCellStyle(style)
    val row2=titles.createCell(2)
    row2.setCellValue("Contenue")
    row2.setCellStyle(style)
    val row3=titles.createCell(3)
    row3.setCellValue("Supprimer ?")
    row3.setCellStyle(style)
    val row4=titles.createCell(4)
    row4.setCellValue("Date")
    row4.setCellStyle(style)
    val row5=titles.createCell(5)
    row5.setCellValue("Type")
    row5.setCellStyle(style)

    AllPostit.toList.sortWith(_.date < _.date) .foreach( v =>   {
      rNum=rNum+1
      var row = sheet.createRow(rNum)
      row.createCell(0).setCellValue(v.id.get)
      row.createCell(1).setCellValue(v.title)
      row.createCell(2).setCellValue(v.contains)
      row.createCell(3).setCellValue(v.active)
      row.createCell(4).setCellValue(v.getFormattedDate)
      row.createCell(5).setCellValue(v.typeP.toString)

    })
    /*var cNum = 0
    val cell = row.createCell(cNum)
    cell.setCellValue("My Cell Value")   */
    wb.write(byteOS);
    byteOS.close
    Ok(byteOS.toByteArray).as("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

  }
}