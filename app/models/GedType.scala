package models


/**
 * Enumeration for the document type.
 * User: skarb
 * Date: 06/12/12
 * Time: 07:35
 * To change this template use File | Settings | File Templates.
 */
object GedType extends Enumeration {
  type GedType = Value
  val Directory, Url, Document = Value

  def parse (f: java.io.File) = {
    Option(f) match {
      case Some(valeur) =>
        if (valeur.isDirectory) {
          Directory
        } else
        if (valeur.getAbsolutePath.endsWith(".url")) {
          Url
        } else {
          Document
        }
      case None => sys.error("type not managed : " + f)
    }
  }
}
