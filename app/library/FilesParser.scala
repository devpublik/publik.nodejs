  package library

  import java.io.File
  import scala.Some
  import play.api.Application


  /**
   * Created with IntelliJ IDEA.
   * User: skarb
   * Date: 04/12/12
   * Time: 23:16
   * To change this template use File | Settings | File Templates.
   */
  object FilesParser {

    def getGedDocuments(app: Application):List[File]={
      val dirRoot= app.configuration.getString("ged.directory.root").getOrElse("localhost")
      val result = FilesParser.parse(dirRoot)
      result.filter(f=> f.getAbsolutePath != new File(dirRoot).getAbsolutePath).sortWith{(f1,f2)=> f1.getAbsolutePath< f2.getAbsolutePath}
    }

    def parse(path:String):List[File]={
      println(path)
      Option(path) match {
        case Some(result) =>
          val file =new File(result)
          parse_rec(file)
        case None => sys.error("path must not be null")
      }
    }

    def parse_rec(f:File):List[File]={

       if (f.isDirectory){
         var result = List[File](f)
         f.listFiles.foreach{
           tmp => result++=(parse_rec(tmp))
         }
         result
       } else {
         List(f)
       }

    }
  }
