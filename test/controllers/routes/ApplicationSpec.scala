import library.Redis

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers

import org.sedis.{Pool, Dress}


class ApplicationSpec extends FlatSpec with ShouldMatchers {

  "A request to redis" should "respond" in {

     Redis.connectTo("localhost",6379,Option(null))
    var id = Redis.getJedisClient{
      client => client.incr("postit")
    }
    println(id)
      Redis.disconnect();

    /*{(body) => Option[String] single = Dress.up(body).set("single","dddd")
      }    */

  }

 /* "A request to the addBar action" should "respond" in {
    running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
      val result = controllers.Application.addBar(FakeRequest().withFormUrlEncodedBody("name" -> "FooBar"))
      status(result) should equal (SEE_OTHER)
      redirectLocation(result) should equal (Some(routes.Application.index.url))
    }
  }

  "A request to the getBars Action" should "respond with data" in {
    running(FakeApplication(additionalConfiguration = inMemoryDatabase())) {
      inTransaction(AppDB.barTable insert Bar(Some("foo")))

      val result = controllers.Application.getBars(FakeRequest())
      status(result) should equal (OK)
      contentAsString(result) should include ("foo")
    }
  } */

}
