import sbt._
import Keys._
import play.Project._

object ApplicationBuild extends Build {

    val appName         = "publik"
    val appVersion      = "1.0-SNAPSHOT"

    val appDependencies = Seq(
      javaCore,javaEbean,filters,anorm,
    "redis.clients" % "jedis"  % "2.1.0",
      "org.scalaj" % "scalaj-collection_2.9.0-1" % "1.2",
      "org.apache.poi" % "poi" % "3.8",
      "org.apache.poi" % "poi-ooxml" % "3.8"
 /* "org.scalaj" %% "scalaj-collection" % "1.2",
      "org.sedis" % "sedis_2.10.0" % "1.1.1",
      "org.scalatest" % "scalatest_2.10" % "1.9.1" % "test",
      "org.squeryl" %% "squeryl" % "0.9.5-2"     */
    )

    val main = play.Project(appName, appVersion, appDependencies).settings(

      testOptions in Test := Nil
      // Add your own project settings here      
    )

}
