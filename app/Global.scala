import controllers.Assets
import library.{FilesParser, Redis}
import play.api
import play.api.libs.Files
import play.api.{Play, GlobalSettings, Application}

/**
 * Launch Redis Connector.
 */
object Global extends GlobalSettings {

  override def onStart(app: Application) {

    super.onStart(app)


    Redis.connect(app) match {
     case Left(x) => play.Logger.error(x)
     case Right(x) => play.Logger.info(x)
   }
  }

  override def onStop(app: api.Application) {
    super.onStop(app)
    play.Logger.info("Stopping redxplay...")
    Redis.disconnect()
  }
}