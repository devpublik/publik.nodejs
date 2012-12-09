package library

import collection.JavaConversions._
/**
 * CrudRedis.
 * User: skarb
 * Date: 08/12/12
 * Time: 16:42
 */
abstract class CrudRedis {
   type T
   def key:String

  def toMap(value:T):Map[String,String]

  def toType(values:Map[String,String]):T

  def load(id:Long):Option[T]={
    Redis.getSedisClient{client =>
      var tmp = client.hgetAll(key+id)
      tmp+=("id"-> id.toString)
      Option( toType( tmp ))
    }
  }

  def remove(id:Long):Option[T]={
    Redis.getSedisClient{client =>
      Option( toType( client.hgetAll(key+id) ))
    }
  }

  def findAll() : List[T] = {
    val listKeys  =  Redis.getJedisClient{
      client =>
        List(  client.keys(key+":*").toArray: _*).map{
          case  key =>
            client.hgetAll(key.toString).toMap

        }
    }
    listKeys.map{
      mapValues  =>
       toType(mapValues)
    }
  }

   def create(element:T):Boolean ={
      Option(element) match {
        case Some(value) =>
          var response = "PAS OK"
          val id = Redis.getJedisClient{client2=>
            client2.incr(key)}
          // create the new entry
          response = Redis.getSedisClient{
            client =>
              var myMap = toMap(value)
              myMap +=("id"->id.toString)

              client.hmset(key+":"+id,myMap)

          }
        response == "OK"
        case None => false
      }
   }


}
