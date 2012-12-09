package models

import library.Redis
import library.CrudRedis
/**
 * SoundTimer.
 * User: skarb
 * Date: 08/12/12
 * Time: 14:15
 */
case class SoundTimer(id:Option[Long],name:String, fileName:String){

}


object SoundTimer extends CrudRedis {
  type T = SoundTimer
  val key = "sound"

  override def toMap(value:SoundTimer):Map[String,String] ={
    var tmp = Map(
       "name"-> value.name,
       "filename"->value.fileName
    )

    value.id match {
      case None => tmp
      case Some(v) =>
        tmp+=("id"->v.toString)
        tmp
    }
  }

  override def toType(values:Map[String,String]):SoundTimer ={
    new SoundTimer(
      if(values.contains("id")) {
        Option(values("id").toLong)
      } else {None},
      values("name"),values("filename")
    )
  }

}
