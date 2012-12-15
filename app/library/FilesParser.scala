package library

import java.io.File
import scala.Some
import play.api.{Play, Application}
import models.Ged


/**
 * File Parsing utils.
 * User: skarb
 * Date: 04/12/12
 * Time: 23:16
 * To change this template use File | Settings | File Templates.
 */
object FilesParser {

  def getGedDocuments (): List[Ged] = {
    val dirRoot = Play.current.configuration.getString("ged.directory.root").getOrElse("localhost")
    val result = FilesParser.parse(dirRoot,Option(null))
    val abso = new File(dirRoot).getAbsolutePath
    result.filter(f => f.absolutePath != abso).sortWith {
      (f1, f2) => f1.absolutePath < f2.absolutePath
    }
  }

  def parse (path: String,parent:Option[Ged]): List[Ged] = {
    println(path)
    Option(path) match {
      case Some(result) =>
        val file = new File(result)
        parse_rec(file,parent)
      case None => sys.error("path must not be null")
    }
  }

  def parse_rec (f: File,parent:Option[Ged]): List[Ged] = {
    val ged = new Ged(f,parent)
    if (f.isDirectory) {

      var result = List(ged)
      f.listFiles.foreach {
        tmp => result ++= (parse_rec(tmp,Option(ged)))
      }
      result
    } else {
      List(ged)
    }

  }
}
