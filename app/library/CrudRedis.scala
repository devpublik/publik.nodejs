package library

import collection.JavaConversions._

/**
 * Class which manage a crud API on Redis Database.
 * <p>Use Sedis Driver.</p>
 * User: skarb
 * Date: 08/12/12
 * Time: 16:42
 **/
abstract class CrudRedis {
  /**
   * The type to manage
   */
  type T

  /**
   * The key which store the items.
   * @return
   */
  def key: String

  /**
   * convert T to Map.
   * @param value the object to convert.
   * @return
   */
  def toMap (value: T): Map[String, String]

  /**
   * convert Map to T .
   * @param values the map to convert.
   * @return
   */
  def toType (values: Map[String, String]): T

  /**
   * load an instance.
   * @param id the id of the instance.
   * @return
   */
  def load (id: Long): Option[T] = {
    Redis.getSedisClient {
      client =>
        val tmp = client.hgetAll(key + ":" + id)
        Option(toType(tmp))
    }
  }

  /**
   * delete one object
   * @param id the id to delete
   * @return  true if deleted
   */
  def remove (id: Long): Boolean = {
    Redis.getJedisClient {
      client =>
        client.del(key + ":" + id) == 1L
    }
  }

  /**
   * list all Objects
   * @return  the list
   */
  def findAll (): List[T] = {
    val listKeys = Redis.getJedisClient {
      client =>
        List(client.keys(key + ":*").toArray: _*).map {
          case key =>
            client.hgetAll(key.toString).toMap

        }
    }
    listKeys.map {
      mapValues =>
        toType(mapValues)
    }
  }

  /**
   * persist an object.
   * @param element  the object to persist
   * @return  true is the object is saved
   */
  def create (element: T): Boolean = {
    Option(element) match {
      case Some(value) =>
        var response = "PAS OK"
        val id = Redis.getJedisClient {
          client2 =>
            client2.incr(key)
        }
        // create the new entry
        response = Redis.getSedisClient {
          client =>
            var myMap = toMap(value)
            myMap += ("id" -> id.toString)
            client.hmset(key + ":" + id, myMap)
        }
        response == "OK"
      case None => false
    }
  }
}
