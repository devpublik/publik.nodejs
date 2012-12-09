import sbt._
import Keys._
import PlayProject._

object ApplicationBuild extends Build {

    val appName         = "publik"
    val appVersion      = "1.0-SNAPSHOT"

    val appDependencies = Seq(
      "org.scalaj" %% "scalaj-collection" % "1.2",
      "org.sedis" % "sedis_2.9.2" % "1.1.0",
      "org.scalatest" %% "scalatest" % "1.8" % "test" ,
      "org.squeryl" %% "squeryl" % "0.9.5-2"
    )

    val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA).settings(
      testOptions in Test := Nil
      // Add your own project settings here      
    )

}
