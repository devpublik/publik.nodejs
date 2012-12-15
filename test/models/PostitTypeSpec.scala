package models

import org.specs2.mutable.Specification

/**
 * Test of the postit datas.
 * User: skarb
 * Date: 03/12/12
 * Time: 22:52
 * To change this template use File | Settings | File Templates.
 */
class PostitTypeSpec extends Specification {

  "A String which represents a PostItType" should {
    "be converted" in {
      PostItType.parse(PostItType.Important.toString) mustEqual PostItType.Important
    }
  }

}
