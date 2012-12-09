package models

import models.GedType._
import models.SortingGed._
import library.Redis

import collection.JavaConversions._

/**
 * Ged document model.
 * User: skarb
 * Date: 06/12/12
 * Time: 07:31
 * To change this template use File | Settings | File Templates.
 */
case class Ged(id: Option[Long], name:String, typeDoc:GedType, absolutePath:String, parent:Option[Ged],date:Long) {
   def this(f:java.io.File)= this(null, f.getName,GedType.parse(f),f.getAbsolutePath,null,f.lastModified)
}



object Ged  {
  def getSort(sort:SortingGed):Function2[Ged, Ged, scala.Boolean]={
    sort match{
      case SortingGed.NameAsc =>  (a:Ged,b:Ged) => a.name.toLowerCase < b.name.toLowerCase
      case SortingGed.NameDesc => (a:Ged,b:Ged) => a.name.toLowerCase > b.name.toLowerCase
      case SortingGed.DateAsc => (a:Ged,b:Ged) => a.date < b.date
      case SortingGed.DateDesc => (a:Ged,b:Ged) => a.date > b.date
      case SortingGed.TypeAsc => (a:Ged,b:Ged) => if(a.typeDoc == b.typeDoc){a.date < b.date}else{a.typeDoc < b.typeDoc}
      case SortingGed.TypeDesc => (a:Ged,b:Ged) => if(a.typeDoc == b.typeDoc){a.date < b.date}else{a.typeDoc > b.typeDoc}
    }
  }

  def load(id:Long):Option[Ged]={
    Redis.getSedisClient{client =>
        Option( convert( client.hgetAll("ged:"+id) ))
    }
  }

  def convert(map : Map[String,String]) : Ged={
       new Ged(
        Option(map("id").toLong),
        map("name"),
        GedType.withName(map("type")),
        map("absolutePath"),
      map.contains("parent") match {
        case true =>load(map("parent").toLong)
        case false =>         Option(null) }
      ,
         map("date").toLong
       )
  }

   def create(ged:Ged):Long ={
     Option(ged) match {
       case Some(gvalue) =>
         val id = Redis.getJedisClient{client2=> client2.incr("ged")}

         val response = Redis.getSedisClient{
           client =>
             val key : String = "ged:"+id
             println(gvalue)
             var myMap = Map (
               "id" -> id.toString,
               "name" -> gvalue.name,
               "type" -> gvalue.typeDoc.toString,
               "absolutePath" -> gvalue.absolutePath,
               "date" -> gvalue.date.toString
             )
            gvalue.parent match {
               case Some(pid) => myMap += ("parent"->pid.id.get.toString)
               case None => play.Logger.debug("none parent")
             }

             client.hmset(key,myMap)
         }
         if(response == "OK")
           id
         else
           0
       case None => 0
     }

   }

  def findAll(sort:SortingGed):List[Ged]={
    val listKeys :List[Map[String,String]]  =  Redis.getJedisClient{
      client =>
        List(  client.keys("ged:*").toArray: _*).map{
          case  key =>
            client.hgetAll(key.toString).toMap
        }
    }
    listKeys.map{
      mapValues  =>
        convert(mapValues)
    }.sortWith(getSort(sort))
  }
}