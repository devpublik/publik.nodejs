package models

/**
 * Enumeration for postitType
 * User: skarb
 * Date: 03/12/12
 * Time: 22:38
 * To change this template use File | Settings | File Templates.
 */



object PostItType extends Enumeration( "label-success","label-warning","label-info","label-important") {
  type PostItType = Value
  val Success,
  Warning,
  Info,
  Important = Value

  def parse(value:String):PostItType={

    for (i <-values)
      if (value == i.toString){
        return i
      }

    sys.error("value not found : "+value)
  }
}
