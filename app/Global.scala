import controllers.Assets
import library.{FilesParser, Redis}
import play.api
import play.api.libs.Files
import play.api.{Play, GlobalSettings, Application}


object Global extends GlobalSettings {

  override def onStart(app: Application) {

    super.onStart(app)
  /*  app.resource("documents") match {
      case Some(resourc) =>
        var tmp = FilesParser.parse( resourc.toURI.toString)
        println(tmp);
        true
      case None => false
    }   */
    println(FilesParser.getGedDocuments(app))
    //Files.writeFile(new java.io.File("test.txt"),"test")
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

 // def getSession(adapter:DatabaseAdapter, app: Application) = Session.create(DB.getConnection()(app), adapter)

}