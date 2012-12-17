package models

import models.GedType._
import models.SortingGed._
import library.{CrudRedis, Redis}

import collection.JavaConversions._
import play.api.Play
import play.api.mvc.MultipartFormData


/**
 * Ged document model.
 * User: skarb
 * Date: 06/12/12
 * Time: 07:31
 */
case class Ged (id: Option[Long], name: String, typeDoc: GedType, absolutePath: String, parent: Option[Ged], date: Long) {
  def this (f: java.io.File, parent: Option[Ged]) = this(null, f.getName, GedType.parse(f), f.getAbsolutePath, parent, f
    .lastModified)


}


/**
 * Crud Management.
 */
object Ged extends CrudRedis {
  type T = Ged

  def key = "ged"

  override def toType (map: Map[String, String]): Ged = {
    new Ged(
      Option(map("id").toLong),
      map("name"),
      GedType.withName(map("type")),
      map("absolutePath"),
      map.contains("parent") match {
        case true => load(map("parent").toLong)
        case false => Option(null)
      }
      ,
      map("date").toLong
    )
  }

  override def toMap (ged: Ged): Map[String, String] = {
    var myMap = Map(
      "name" -> ged.name,
      "type" -> ged.typeDoc.toString,
      "absolutePath" -> ged.absolutePath,
      "date" -> ged.date.toString
    )

    ged.parent match {
      case Some(p) =>
        println(p.name)
        Ged.findByAbsolutePath(p.absolutePath) match {
          case Some(pa) =>
            myMap += "parent" -> pa.id.get.toString
          case None => play.Logger.debug("Impossible de trouver le parent " + p.absolutePath)
        }
      case None => play.Logger.debug("Sans parent")
    }

    myMap
  }

  def getSort (sort: SortingGed): Function2[Ged, Ged, scala.Boolean] = {
    sort match {
      case SortingGed.NameAsc => (a: Ged, b: Ged) => a.name.toLowerCase < b.name.toLowerCase
      case SortingGed.NameDesc => (a: Ged, b: Ged) => a.name.toLowerCase > b.name.toLowerCase
      case SortingGed.DateAsc => (a: Ged, b: Ged) => a.date < b.date
      case SortingGed.DateDesc => (a: Ged, b: Ged) => a.date > b.date
      case SortingGed.TypeAsc => (a: Ged, b: Ged) => if (a.typeDoc == b.typeDoc) {
        a.date < b.date
      } else {
        a.typeDoc < b.typeDoc
      }
      case SortingGed.TypeDesc => (a: Ged, b: Ged) => if (a.typeDoc == b.typeDoc) {
        a.date < b.date
      } else {
        a.typeDoc > b.typeDoc
      }
    }
  }

  def removeAll (): Boolean = {
    Redis.getJedisClient {
      client =>
        client.keys("ged:*").map {
          value => client.del(value)
        }
    }
    true
  }

  def findByName(part:String ) : Seq[Ged] = {
    super.findAll().filter( p => p.name.toLowerCase.contains(part.toLowerCase))
  }

  def findByAbsolutePath (path: String): Option[Ged] = {
    val liste = super.findAll()
    val result = liste.filter(p => p.absolutePath == path)
    if (result.size == 0) {
      Option(null)
    }
    else {
      Option(result.head)
    }
  }

  def search (parent: Option[Long], sort: SortingGed): List[Ged] = {
    val listGeds: List[Ged] = Redis.getJedisClient {
      client =>
        List(client.keys("ged:*").toArray: _*).map {
          key =>
            client.hgetAll(key.toString).toMap
        }
    }.map {
      mapValues =>
        toType(mapValues)
    }

    val listFilter = parent match {
      case Some(id) => listGeds.filter {
        (v: Ged) => v.parent match {
          case Some(parentTmp) => parentTmp.id.get == id
          case None => false
        }
      }
      case None => listGeds.filter {
        (v: Ged) => v.parent == None
      }
    }


    listFilter.sortWith(getSort(sort))
  }


  def createDirectory (name: String, parent: Option[Long]): Boolean = {
    var parentGed: Option[Ged] = None
    var path = Play.current.configuration.getString("ged.directory.root").getOrElse("Dumb") + "/" + name
    if (parent != None) {
      parentGed = Ged.load(parent.get)
      path = parentGed.get.absolutePath + "/" + name
    }
    val file = new java.io.File(path)
    if (file.exists()) {
      false
    } else {
      java.nio.file.Files.createDirectory(file.toPath)
      Ged.create(new Ged(None, name, GedType.Directory, file.getAbsolutePath, parentGed, new java.util.Date().getTime))
    }
  }

  def createDocument (file: MultipartFormData.FilePart[play.api.libs.Files.TemporaryFile], parent: Option[Long]): Boolean = {
    var parentGed: Option[Ged] = None
    var path = Play.current.configuration.getString("ged.directory.root").getOrElse("Dumb") + "/" + file.filename
    if (parent != None) {
      parentGed = Ged.load(parent.get)
      path = parentGed.get.absolutePath + "/" + file.filename
    }
    val fileTmp = new java.io.File(path)
    if (fileTmp.exists()) {
      false
    } else {
      file.ref.moveTo(fileTmp)
      Ged.create(new Ged(None, file.filename, GedType.Document, fileTmp.getAbsolutePath, parentGed, new java.util.Date()
        .getTime))
    }
  }

  def createLink (name: String, url: String, parent: Option[Long]) = {
    var parentGed: Option[Ged] = None
    var path = Play.current.configuration.getString("ged.directory.root").getOrElse("Dumb") + "/" + name + ".url"
    if (parent != None) {
      parentGed = Ged.load(parent.get)
      path = parentGed.get.absolutePath + "/" + name + ".url"
    }
    val fileTmp = new java.io.File(path)
    if (fileTmp.exists()) {
      false
    } else {
      java.nio.file.Files.write(fileTmp
        .toPath, List("[{000214A0-0000-0000-C000-000000000046}]", "Prop3=19,2", "[InternetShortcut]", "URL=" + url, "IDList="), java
        .nio.charset.Charset.defaultCharset())
      Ged.create(new Ged(None, name, GedType.Url, fileTmp.getAbsolutePath, parentGed, new java.util.Date()
        .getTime))
    }

  }
}