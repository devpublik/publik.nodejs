package models

import org.specs2.mutable.Specification
import library.Redis

/**
 * Test of Ged model
 * User: skarb
 * Date: 06/12/12
 * Time: 20:03
 * To change this template use File | Settings | File Templates.
 */
class GedSpec extends Specification  {

  "Ged" should{
      "be created" in {
        Redis.connectTo("localhost",6379,Option(null))
        val id:Long =System.currentTimeMillis
        val result = Ged.create(new Ged(Option(0L),id+"TEST.JPG",GedType.Document,"absolute",Option(null),66666L))
        result mustNotEqual 0
      }

    "be found" in {
      Redis.connectTo("localhost",6379,Option(null))
      val result = Ged.search(None, SortingGed.TypeAsc)
      Redis.disconnect()
      !result.isEmpty
    }

    "be removed all" in{
      Redis.connectTo("localhost",6379,Option(null))
      Ged.removeAll
    }
  }

}
