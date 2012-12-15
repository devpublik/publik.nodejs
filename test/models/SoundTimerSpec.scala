package models


import org.specs2.mutable.Specification
import library.Redis

/**
 * SoundTimerSpec.
 * User: skarb
 * Date: 08/12/12
 * Time: 18:07
 */
class SoundTimerSpec extends Specification {

  "a sound timer " should {
    "be uploaded" in {
      Redis.connectTo("localhost", 6379, Option(null))
      SoundTimer.create(SoundTimer(Option(0L), "name", "1.mp3"))

    }
  }

}
