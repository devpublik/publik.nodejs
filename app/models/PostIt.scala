package models

import library.Redis
import models.PostItType._
import scala.collection.Set
import collection.JavaConversions._
import org.joda.time.DateTime
import java.util.Date
import java.text.SimpleDateFormat


/**
 * Model for the Postit
 * User: skarb
 * Date: 01/12/12
 * Time: 12:30
 * To change this template use File | Settings | File Templates.
 */
case class PostIt (pid: Option[Long], ptitle: String, ptypeP: String, pcontains: String, pactive: Option[Boolean], pdate: Option[Long]) {


  val id: Option[Long] = pid
  val title: String = ptitle
  val typeP: PostItType = PostItType.parse(ptypeP)
  val contains: String = pcontains
  var active: Boolean = pactive match {
    case Some(valeur) => valeur
    case None => true
  }
  val date: Long = pdate match {
    case Some(valeur) => valeur
    case None => DateTime.now.getMillis
  }


  def getFormattedDate: String = {
    new SimpleDateFormat("dd/MM/yyyy HH:mm:ss").format(new Date(date) getTime)
  }
}


/**
 * CRUD of Postit
 */
object PostIt {
  /**
   * convert a Map to Postit
   * @param mapValues  data
   * @return
   */
  def convert (mapValues: Map[String, String]): PostIt = {
    if (!mapValues.contains("id")) {
      return null
    }

    PostIt(Option(mapValues("id").toLong),
      mapValues("title"),
      mapValues("type"),
      mapValues("contains"),
      Option(mapValues("active").toBoolean),
      Option(mapValues("date").toLong)
    )
  }

  /**
   * Load by Id
   * @param id   id
   * @return
   */
  def load (id: Long): Option[PostIt] = {
    Redis.getSedisClient {
      client =>
        Option(convert(client.hgetAll("postit:" + id)))
    }
  }

  /**
   * Load ALl
   * @return
   */
  def findAll (): Set[PostIt] = {
    val listKeys = Redis.getJedisClient {
      client =>
        Set(client.keys("postit:*").toArray: _*).map {
          case key =>
            client.hgetAll(key.toString).toMap

        }
    }
    listKeys.map {
      mapValues =>
        convert(mapValues)
    }
  }

  /**
   * Create a new instance.
   * @param postit the new instance
   * @return
   */
  def create (postit: Option[PostIt]): Boolean = {
    var response = "PAS OK"
    if (!postit.isEmpty) {
      // convertion
      var pObject: PostIt = postit.get
      // get a new Idea
      val id = Redis.getJedisClient {
        client2 =>
          client2.incr("postit")
      }
      // create the new entry
      response = Redis.getSedisClient {
        client =>
          val key: String = "postit:" + id
          val myMap = Map(
            "id" -> id.toString,
            "title" -> pObject.title,
            "type" -> pObject.typeP.toString,
            "contains" -> pObject.contains,
            "active" -> pObject.active.toString,
            "date" -> pObject.date.toString
          )

          client.hmset(key, myMap)

      }


    }
    response == "OK"
  }

  /**
   * update function
   * @param pObject    the opbject to update
   * @return
   */
  def update (pObject: PostIt): Boolean = {
    var response = "PAS OK"
    response = Redis.getSedisClient {
      client =>
        val key: String = "postit:" + pObject.id.get
        val myMap = Map(
          "id" -> pObject.id.get.toString,
          "title" -> pObject.title,
          "type" -> pObject.typeP.toString,
          "contains" -> pObject.contains,
          "active" -> pObject.active.toString,
          "date" -> pObject.date.toString
        )

        client.hmset(key, myMap)

    }
    response == "OK"
  }


}
