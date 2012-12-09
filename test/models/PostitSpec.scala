package models

import library.Redis
import org.joda.time.DateTime._
import org.specs2.mutable._
import scala.collection.JavaConversions._

import  scala.collection.Set

/**
 * Test of PostIt.
 * User: skarb
 * Date: 01/12/12
 * Time: 13:58
 * To change this template use File | Settings | File Templates.
 */
class PostitSpec extends Specification   {

  "A Postit" should {

    "be created" in {
      Redis.connectTo("localhost",6379,Option(null))
      var tmp : Long =now().getMillis
      var result = PostIt.create(Option(new PostIt(null,"title",PostItType.Important.toString,"contenu",Option(true),Option(tmp))))  mustEqual true
      Redis.disconnect()
      result
    }

    "be found" in {
      Redis.connectTo("localhost",6379,Option(null))
      val tmp :Set[PostIt]  = PostIt.findAll()
      //
      tmp.size mustNotEqual 0
    }

    "be loaded" in {
      Redis.connectTo("localhost",6379,Option(null))
      var ids = Redis.getJedisClient{client=>
         client.keys("postit:*")
      }
      if(ids.size == 0) {
        false
      } else {
        var id = ids.toSet.head.toString replaceAll("postit:", "")
        var returnValue:Option[PostIt] = PostIt.load(id.toLong)
        if(returnValue.isEmpty){
           false
        } else {
          var loadedPostit = returnValue.get
          loadedPostit.id.get ==  id.toLong
        }
      }
    }
  }

  "A null Postit" should {
    "not be created" in {
      Redis.connectTo("localhost",6379,Option(null))
      PostIt.create(Option(null))  mustEqual false
    }

    "not be loaded" in {
      Redis.connectTo("localhost",6379,Option(null))
      var id:Long = -1
      var result = PostIt.load(id)

      result mustEqual None
    }
  }
}
